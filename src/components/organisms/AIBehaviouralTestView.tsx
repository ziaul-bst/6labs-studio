/**
 * AIBehaviouralTestView — AI players play your build like real personas.
 *
 * Where the AI functional test asks "did the cases pass", this one asks "how
 * does a new player, a whale, a lapsed player actually behave here" — and then
 * runs the *same* behavioural analysis User Test runs on human sessions. So
 * the setup is a session composer (build, how many agents, which personas,
 * how long, any instructions), and a finished run reads like a User Test
 * report — the same findings model, with AI sessions as the evidence.
 *
 * Personas come from the player model and get sharper with every human
 * session added — which is the whole loop the Overview states.
 *
 * A run opens as its own screen with two tabs — Report and Videos — and a
 * session in the Videos tab opens the screen-by-screen viewer (2026-09-10,
 * from the PM artifact v92 screens s47/s48; replaced the Oracle-style thread
 * this test used to open into).
 *
 * Code-first prototype — from the revamp artifact (screen s46).
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { runDateLabel } from '../../lib/runDate'
import { TestingPageHeader } from '../molecules/TestingPageHeader'
import { TestingBodySkeleton, TestingPageSkeleton } from '../molecules/TestingSkeletons'
import { usePageLoading } from '../../lib/pageLoading'
import { TestingTabs } from '../molecules/TestingTabs'
import { RunHistoryList } from '../molecules/RunHistoryList'
import { InstructionsField, SetupNote } from '../molecules/TestingSetupPieces'
import { PersonaPicker } from '../molecules/PersonaPicker'
import { SegmentedControl } from '../atoms/SegmentedControl'
import { AIBehaviouralRunView, type AIBehaviouralRunTab, type VideosStatusFilter } from './AIBehaviouralRunView'
import { AIAgentSessionView, AGENT_LOOP_MS } from './AIAgentSessionView'
import { BuildField } from './BuildPickerModal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { AIBehaviouralIcon } from '../icons/AIBehaviouralIcon'
import {
  AI_BEHAVIOURAL_HISTORY,
  AI_BEHAVIOURAL_RUN_META,
  AI_BEHAVIOURAL_STEPS,
  PERSONAS,
  PERSONA_TONE,
  buildAgentIssues,
  buildAgentSessions,
} from '../../lib/mocks/testing'
import { useHistoryDemoSeed } from '../../lib/historyDemoState'
import { useRunDemoSeed } from '../../lib/runDemoState'
import type { AIBehaviouralRunMeta, SessionLength, TestRunHistoryItem } from '../../lib/types/testing'

export type AIBehaviouralScreen = 'home' | 'run' | 'session'

/** Only this brief is ever shown on a session; the composer's field seeds it. */
const DEFAULT_INSTRUCTIONS = 'Focus on the Frost Festival event. Try the battle pass upgrade path if it appears.'

/**
 * The facts every screen of a run repeats. Seeded runs carry theirs; a run
 * started from the composer is read back out of the row it wrote.
 */
function metaForRun(run: TestRunHistoryItem): AIBehaviouralRunMeta {
  const seeded = AI_BEHAVIOURAL_RUN_META[run.id]
  const m = run.detail.match(/^(\d+) sessions · (\d+ min) · (v[\d.]+)/)
  const agents = seeded?.agents ?? Number(m?.[1] ?? 10)
  /* "New player ×12, Whale ×8" — the persona column carries the split. */
  const parts = run.meta.split(', ').map((part) => {
    const pm = part.match(/^(.*?) ×(\d+)$/)
    return pm ? { name: pm[1], count: Number(pm[2]) } : { name: part, count: undefined }
  })
  const base: AIBehaviouralRunMeta = seeded ?? {
    build: m?.[3] ?? 'v2.3.1',
    agents,
    personas: parts.map((p) => p.name),
    personaCounts: parts.every((p) => p.count !== undefined)
      ? Object.fromEntries(parts.map((p) => [p.name, p.count as number]))
      : undefined,
    lengthLabel: m?.[2] ?? '30 min',
    startedLabel: run.when,
    finished: agents,
  }
  if (run.state === 'progress') return { ...base, finished: Math.round(agents * 0.6) }
  /* A failed run kept the sessions that finished before it stopped. */
  if (run.state === 'failed') return { ...base, finished: Math.round(agents * 0.7) }
  return { ...base, finished: agents }
}

export interface AIBehaviouralTestViewProps {
  onScreenChange?: (screen: AIBehaviouralScreen) => void
  initialTab?: 'new' | 'history'
  /**
   * Reports the active tab. The state machine dock shows the Run row or the
   * History row, never both — which one depends on the tab in view, and only
   * this component knows it.
   */
  onTabChange?: (tab: 'new' | 'history') => void
  /** Kept for the HomePage wiring; the run screens no longer hand off to the Library or Oracle. */
  onOpenLibrary?: () => void
  onAskOracle?: (question: string) => void
  className?: string
}

/** Agents per persona before anyone touches the stepper. */
const DEFAULT_AGENT_COUNT = 1

const SIMULATED_RUN_MS = 16000
/**
 * The gap between the last agent stopping and the report existing. The human
 * tests have always had this beat — a row that says "Analysing…" while the
 * agent reads the footage — and the AI tests skipped straight from "Watch live"
 * to "View report", which claimed a report was written the instant the last
 * frame was recorded. Analysis is the slower half of the run; it gets its own
 * state (2026-09-16 dev call).
 */
const SIMULATED_ANALYSIS_MS = 6000

/** How long a submitted run waits for devices before the first agent starts. */
const SIMULATED_QUEUE_MS = 4000

export function AIBehaviouralTestView({
  onScreenChange,
  initialTab = 'new',
  onTabChange,
  className,
}: AIBehaviouralTestViewProps) {
  const [tab, setTab] = useState<'new' | 'history'>(initialTab)
  useEffect(() => {
    onTabChange?.(tab)
  }, [tab, onTabChange])
  /* Empty, not pre-filled with the newest build. A composer that arrives with
     a build already chosen is a composer that will be submitted without anyone
     reading which one — and "which build was that run against" is the first
     question asked of every behavioural report. The picker is one click. */
  const [build, setBuild] = useState<string | null>(null)
  const [runName, setRunName] = useState('')
  /* Agents are asked per persona — "twelve new players, eight whales" is how a
     run is thought about — and the total is derived and shown, never typed.
     One each by default: five was a batch nobody asked for, and a stepper
     starting above the floor makes the cheap first run the one that takes the
     most clicks to reach (2026-09-16 dev call). */
  const [counts, setCounts] = useState<Record<string, number>>({})
  const countOf = (id: string) => counts[id] ?? DEFAULT_AGENT_COUNT
  const setCount = (id: string, n: number) => setCounts((c) => ({ ...c, [id]: Math.min(100, Math.max(1, n)) }))
  /* Empty, for the same reason the build is: which personas played is the
     dimension every finding in the report is broken down by, so it is not a
     thing to inherit from a default. Generic is offered first in the picker,
     which is where "play it as it is" belongs — as the easy choice, not as
     the one already made. */
  const [personaIds, setPersonaIds] = useState<string[]>([])
  const [length, setLength] = useState<SessionLength>('15')
  const [customLength, setCustomLength] = useState('45')
  const [instructions, setInstructions] = useState('')
  const [runs, setRuns] = useState<TestRunHistoryItem[]>(AI_BEHAVIOURAL_HISTORY)
  const [openRun, setOpenRun] = useState<TestRunHistoryItem | null>(null)
  const [runTab, setRunTab] = useState<AIBehaviouralRunTab>('report')
  /* Seeds the run screen's Videos filter — 'live' when the reader came in from
     "Watch live" on a run still in flight. */
  const [runVideosStatus, setRunVideosStatus] = useState<VideosStatusFilter>('all')
  /* The session being watched, and the screen a report clip pointed at. */
  const [openSession, setOpenSession] = useState<{ id: string; step?: number } | null>(null)
  /* How far the live sessions have got — ticks up while a run is in flight. */
  const [liveReached, setLiveReached] = useState(4)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  /* The home's own beat, restarted on a tab change. The run screen and the
     session viewer each have their own. */
  const loadPhase = usePageLoading(tab)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  useEffect(() => {
    onScreenChange?.(openSession ? 'session' : openRun ? 'run' : 'home')
  }, [openRun, openSession, onScreenChange])
  /* Review dock: reseed the history and show it. */
  useHistoryDemoSeed(AI_BEHAVIOURAL_HISTORY, ({ runs: seeded, highlightId: hl, initial }) => {
    setRuns(seeded)
    setHighlightId(hl)
    if (!initial) setTab('history')
  })
  /* Run-flow presets. No thread step here: 'thread' lands on the report — see
     lib/runDemoState. A live run opens on its Videos tab, a finished one on
     its Report — the same landing the history row gives each. */
  useRunDemoSeed((state) => {
    setOpenSession(null)
    setRunVideosStatus('all')
    if (state === 'composer') {
      setOpenRun(null)
      return
    }
    const base = AI_BEHAVIOURAL_HISTORY[0]
    if (state === 'queued') {
      /* Nothing recorded and nothing started — the page you are dropped on the
         moment Submit is pressed. Report, not Videos: the Videos tab of a
         queued run is an empty grid, and the Report tab is where the run says
         what it is waiting for. */
      setOpenRun({ ...base, id: 'demo-queued', state: 'queued', result: undefined, when: runDateLabel() })
      setLiveReached(0)
      setRunTab('report')
      return
    }
    if (state === 'no-sessions') {
      /* A run that has started and recorded nothing. The session builder always
         produces one row per agent, so the only honest way to reach this state
         is to say the run has none — which is what a run looks like in its
         first seconds, before any agent has finished a screen. */
      setOpenRun({ ...base, id: 'demo-empty', state: 'progress', result: undefined, when: runDateLabel() })
      setLiveReached(0)
      /* Videos, not Report. The report cannot exist yet and says so in a line;
         the footage is the thing that is *about to* arrive, so the tab a reader
         wants open is the one it will arrive in. */
      setRunTab('videos')
      return
    }
    if (state === 'running') {
      /* Distinct id — a seeded id resolves back to its finished copy in `runs`. */
      setOpenRun({ ...base, id: 'demo-running', state: 'progress', result: undefined, when: runDateLabel() })
      setLiveReached(4)
      setRunTab('videos')
    } else if (state === 'analysing') {
      /* Every session finished and no report yet — so the Report tab is the
         one worth landing on: it is the tab that changes when the analysis
         lands, and the Videos tab beside it is already complete. */
      setOpenRun({ ...base, id: 'demo-analysing', state: 'analysing', result: undefined, when: runDateLabel() })
      setLiveReached(AI_BEHAVIOURAL_STEPS.length)
      setRunTab('report')
    } else {
      setOpenRun({ ...base, state: 'done' })
      setRunTab('report')
    }
  })

  /* The run being looked at, resolved against the list so a finishing run
     flips its own screen from Playing to Complete. */
  const activeRun = openRun ? runs.find((r) => r.id === openRun.id) ?? openRun : null
  const activeMeta = useMemo(() => (activeRun ? metaForRun(activeRun) : null), [activeRun])
  useEffect(() => {
    if (!activeRun || activeRun.state !== 'progress') return
    /* Zero is the "nothing recorded yet" preset, and it has to stay there. The
       clock below moves a run off zero on its first tick, so the state the
       preset exists to hold was visible for one interval and then gone — which
       is the same reason the preset exists. A real run is seeded at 4. */
    if (liveReached === 0) return
    /* The run produces a screen on the same clock the viewer walks one, so the
       live strip's counts and the walkthrough never drift apart. */
    const t = window.setInterval(() => setLiveReached((r) => Math.min(AI_BEHAVIOURAL_STEPS.length - 1, r + 1)), AGENT_LOOP_MS)
    return () => window.clearInterval(t)
  }, [activeRun, liveReached])
  const sessions = useMemo(() => {
    if (!activeRun || !activeMeta) return []
    /* Nothing recorded yet — a queued run by definition, and a live one that
       has not produced its first screen (see the 'no-sessions' preset). */
    if (activeRun.state === 'queued') return []
    if (liveReached === 0 && activeRun.state === 'progress') return []
    const built = buildAgentSessions(activeRun.id, activeMeta, liveReached)
    return activeRun.state === 'failed' ? built.slice(0, activeMeta.finished) : built
  }, [activeRun, activeMeta, liveReached])
  const issues = useMemo(
    () =>
      activeRun?.state === 'done'
        ? buildAgentIssues(sessions, activeRun.result?.kind === 'issues' ? activeRun.result.count : 7)
        : [],
    [activeRun, sessions],
  )
  const personas = PERSONAS.filter((p) => personaIds.includes(p.id))
  const lengthLabel = length === 'custom' ? `${customLength} min` : `${length} min`
  const totalAgents = personas.reduce((n, p) => n + countOf(p.id), 0)

  /* The agents have stopped; nothing is live any more and there is no report
     yet. The row stays open — the sessions it recorded are all watchable, which
     is exactly what a reader waiting on the report wants to do. */
  const analyseRun = (id: string) =>
    setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, state: 'analysing' } : r)))

  const finishRun = (id: string) =>
    setRuns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, state: 'done', result: { kind: 'issues', count: 7 } } : r)),
    )

  const submit = () => {
    if (personas.length === 0 || !build) return
    const names = personas.map((p) => p.label)
    const run: TestRunHistoryItem = {
      id: `aib-${Date.now()}`,
      /* Personas already fill their own column, so the name carries the build
         and the detail carries the batch — nothing said twice. */
      name: runName.trim() || `${names.join(' & ')} · ${build}`,
      detail: `${totalAgents} sessions · ${lengthLabel} · ${build}`,
      meta: personas.map((p) => `${p.label} ×${countOf(p.id)}`).join(', '),
      /* One pill per persona, so a four-persona run clamps to "+2" instead of
         truncating a name mid-word — the same Tag column every other history
         table has. `meta` stays as the plain-text fallback. */
      tags: personas.map((p) => `${p.label} ×${countOf(p.id)}`),
      /* Submitted, waiting for devices. Agents do not start the instant the
         button is pressed, and a run that claims to be playing before one has
         picked up the build makes the first empty Videos tab look broken. */
      state: 'queued',
      when: runDateLabel(),
    }
    setRuns((prev) => [run, ...prev])
    setHighlightId(run.id)
    setRunName('')
    setLiveReached(0)
    /* Back to the History tab, where the submitted run is now the top row —
       queued, with its control greyed until there is a report behind it. The
       run's own page was the destination for a while; it said nothing the row
       does not, so a submit ended on a page with nothing on it. */
    setTab('history')
    /* Three beats: the run waits for devices, the agents play, then the
       analysis reads what they recorded. */
    timers.current.push(
      window.setTimeout(() => {
        setRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, state: 'progress' } : r)))
        setLiveReached(1)
      }, SIMULATED_QUEUE_MS),
    )
    timers.current.push(
      window.setTimeout(() => analyseRun(run.id), SIMULATED_QUEUE_MS + SIMULATED_RUN_MS),
    )
    timers.current.push(
      window.setTimeout(
        () => finishRun(run.id),
        SIMULATED_QUEUE_MS + SIMULATED_RUN_MS + SIMULATED_ANALYSIS_MS,
      ),
    )
  }

  if (activeRun && activeMeta) {
    const session = openSession ? sessions.find((s) => s.id === openSession.id) : undefined
    if (session) {
      return (
        <AIAgentSessionView
          key={session.id}
          session={session}
          runName={activeRun.name}
          meta={activeMeta}
          instructions={instructions.trim() || DEFAULT_INSTRUCTIONS}
          initialStep={openSession?.step}
          /* The run's findings, narrowed to the ones this recording produced —
             each carrying the screen in *this* session it was flagged on. */
          findings={issues.flatMap((issue) => {
            const ref = issue.clipRefs.find((c) => c.sessionId === session.id)
            return ref
              ? [{ id: issue.id, title: issue.title, kind: issue.kind, stepIndex: ref.stepIndex }]
              : []
          })}
          /* Just close the session. `runTab` is still whatever tab the session
             was opened from — opening one does not change it — so leaving it
             alone returns the reader exactly where they were. Forcing 'videos'
             here sent anyone who opened a session from a finding's clip back to
             a tab they had not chosen: one level back, and sideways. */
          onBack={() => setOpenSession(null)}
          className={className}
        />
      )
    }
    return (
      <AIBehaviouralRunView
        run={activeRun}
        meta={activeMeta}
        sessions={sessions}
        issues={issues}
        tab={runTab}
        onTabChange={setRunTab}
        initialStatus={runVideosStatus}
        onBack={() => {
          setOpenRun(null)
          setTab('history')
        }}
        onOpenSession={(id, step) => setOpenSession({ id, step })}
        className={className}
      />
    )
  }

  /* Below the run branch: each screen owns its own loading state. */
  /* Arriving draws the whole screen; refreshing draws only the panel under the
     tabs. The header and the tab bar do not change when the tab does — and the
     tab the reader just pressed must not vanish under the cursor, nor take the
     active-tab marker with it. */
  const skeletonBody = tab === 'history' ? 'list' : 'card'
  if (loadPhase === 'initial')
    return (
      <TestingPageSkeleton body={skeletonBody} label="Loading AI behavioural test" className={className} />
    )

  return (
    <div className={['flex flex-col gap-l page-measure pt-[120px] pb-xxl3', className].filter(Boolean).join(' ')}>
      <TestingPageHeader
        title="AI behavioural test"
        description="AI players play your build like real personas — new player, core, whale, lapsed — and 6labs analyses what they did the same way it analyses human sessions."
        icon={<AIBehaviouralIcon size={32} />}
        accent="success"
      />

      <TestingTabs
        ariaLabel="AI behavioural test sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'new', label: 'New run' },
          { value: 'history', label: 'Run history', count: runs.length },
        ]}
      />

      {loadPhase === 'refresh' ? (
        <TestingBodySkeleton body={skeletonBody} />
      ) : tab === 'new' ? (
        <div className="flex flex-col gap-m w-full">
          <div
            className="flex flex-col w-full rounded-4xl px-xl pt-l pb-m"
            style={{
              backgroundColor: 'var(--bg-elements)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 10px 40px var(--bg-tint-light)',
            }}
          >
            {/* The heading alone. "Personas are derived from the player model and
                improve with every human session added" is a claim about the
                product, not an instruction for this form — it is made on the
                Overview, where someone is deciding whether to use the test, and
                here it sat in the one line a reader skims on the way to the
                first field. */}
            <div
              className="flex items-center gap-m pb-m mb-s"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <span className="font-display text-m font-semibold text-text-primary">Set up a session</span>
            </div>

            <Row label="Run name">
              <Input
                value={runName}
                onChange={(e) => setRunName(e.target.value)}
                aria-label="Run name"
                size="lg"
                placeholder="e.g. Frost Festival — new player & whale"
              />
            </Row>

            <Row label="Build">
              <BuildField value={build} onChange={setBuild} />
            </Row>

            <Row label="Personas">
              <PersonaPicker personas={PERSONAS} value={personaIds} onChange={setPersonaIds} />
            </Row>

            <Row label="Agents">
              {personas.length === 0 ? (
                <span className="font-body text-s text-text-tertiary leading-[1.5] py-xs">Choose personas first.</span>
              ) : (
                <div
                  className="flex flex-col w-full rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--border-default)' }}
                >
                  {personas.map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-m px-m py-xs"
                      style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}
                    >
                      <i className="shrink-0 w-[8px] h-[8px] rounded-round" style={{ backgroundColor: PERSONA_TONE[p.label] ?? 'var(--text-secondary)' }} aria-hidden />
                      <span className="font-display text-s font-semibold text-text-primary leading-[1.5] whitespace-nowrap">{p.label}</span>
                      <span className="font-body text-xs text-text-tertiary leading-[1.5] truncate min-w-0">{p.detail}</span>
                      <span className="flex-1" />
                      <div
                        className="inline-flex items-center h-[32px] overflow-hidden"
                        style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-input)' }}
                        role="group"
                        aria-label={`${p.label} agents`}
                      >
                        <StepperButton label={`Fewer ${p.label} agents`} onClick={() => setCount(p.id, countOf(p.id) - 1)}>−</StepperButton>
                        <span className="w-[44px] text-center font-display text-s font-semibold text-text-primary">{countOf(p.id)}</span>
                        <StepperButton label={`More ${p.label} agents`} onClick={() => setCount(p.id, countOf(p.id) + 1)}>+</StepperButton>
                      </div>
                    </div>
                  ))}
                  {/* The total is the number the run is remembered by. */}
                  <div
                    className="flex items-center gap-xs px-m py-xs font-body text-s text-text-tertiary leading-[1.5]"
                    style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page-pale)' }}
                  >
                    {/* One is now the default, so the line has to survive it. */}
                    <span className="font-semibold text-text-primary">
                      {totalAgents} {totalAgents === 1 ? 'agent' : 'agents'}
                    </span>{' '}
                    in total
                  </div>
                </div>
              )}
            </Row>

            <Row label="Session length">
              <div className="flex items-center gap-s flex-wrap">
                <SegmentedControl<SessionLength>
                  ariaLabel="Session length"
                  value={length}
                  onChange={setLength}
                  options={[
                    { value: '15', label: '15 min' },
                    { value: '30', label: '30 min' },
                    { value: '60', label: '60 min' },
                    { value: 'custom', label: 'Custom' },
                  ]}
                />
                {length === 'custom' && (
                  <span className="inline-flex items-center gap-xs">
                    <input
                      value={customLength}
                      onChange={(e) => setCustomLength(e.target.value.replace(/\D/g, ''))}
                      inputMode="numeric"
                      aria-label="Custom session length in minutes"
                      className="w-[72px] rounded-m px-s py-xs font-body text-s text-text-primary outline-none testing-focus-ring"
                      style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elements)' }}
                    />
                    <span className="font-body text-s text-text-tertiary">min</span>
                  </span>
                )}
              </div>
            </Row>

            <Row label="Instructions" optional>
              <InstructionsField
                value={instructions}
                onChange={setInstructions}
                ariaLabel="Instructions for the AI players"
                placeholder="e.g. Focus on the new Frost Festival event. Whales should try the battle pass upgrade path."
              />
            </Row>

            <div
              className="flex items-center justify-end gap-s pt-m mt-s"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              {/* Both are required and neither is seeded any more, so the
                  button says which one is still missing rather than sitting
                  dead with no explanation. */}
              {(personas.length === 0 || !build) && (
                <span className="font-body text-s text-text-tertiary leading-[1.5] mr-auto">
                  {!build && personas.length === 0
                    ? 'Choose a build and at least one persona to run.'
                    : !build
                      ? 'Choose a build to run.'
                      : 'Choose at least one persona to run.'}
                </span>
              )}
              <Button variant="primary" size="lg" disabled={personas.length === 0 || !build} onClick={submit}>
                Submit
              </Button>
            </div>
          </div>

          <SetupNote>
            6labs produces a behavioural and UX report from the sessions, and you can query them exactly
            as you would human sessions. The agents play in the background — a run takes about as long as
            the session length you set, and the report lands in Run history when the last agent finishes.
          </SetupNote>
        </div>
      ) : (
        <RunHistoryList
          runs={runs}
          highlightId={highlightId}
          metaLabel="Personas"
          emptyTitle="No runs yet"
          emptyLabel="Choose personas and a build, run it, and the session report lands here."
          emptyAction={{ label: 'New run', onClick: () => setTab('new') }}
          /* A finished run lands on its report; one still playing has no report
             yet, so it lands on the live sessions instead. */
          onOpen={(run) => {
            setOpenSession(null)
            /* A run in flight lands on the live sessions; a queued one has none
               yet, so it lands on the Report tab that explains the wait. */
            setRunTab(run.state === 'progress' ? 'videos' : 'report')
            /* Opening the run is a request for the run, not for what is live in
               it — only "Watch live" narrows the list. */
            setRunVideosStatus('all')
            setOpenRun(run)
          }}
          /* Agents play in parallel, so "watch live" is a set, not a session.
             It lands on the run's Videos tab filtered to Live — always, even
             when only one agent is still going. The shortcut that opened a
             lone live session directly meant the same button went two
             different places depending on a count the reader could not see
             before pressing it, and there is no way back to the list from a
             player you did not choose to open. */
          onWatchLive={(run) => {
            setRunTab('videos')
            setRunVideosStatus('live')
            setOpenRun(run)
            setOpenSession(null)
          }}
        />
      )}
    </div>
  )
}

function Row({ label, optional, children }: { label: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="grid items-center gap-l py-s" style={{ gridTemplateColumns: '150px minmax(0, 1fr)' }}>
      <span className="font-display text-s font-semibold text-text-primary leading-[1.5]">
        {label}
        {optional && <span className="font-body font-normal text-text-tertiary"> (optional)</span>}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function StepperButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center w-[36px] h-full font-display text-l text-text-secondary testing-ink-hover"
      style={{ backgroundColor: 'var(--bg-page-pale)' }}
    >
      {children}
    </button>
  )
}
