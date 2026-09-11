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
import { TestingPageHeader } from '../molecules/TestingPageHeader'
import { TestingTabs } from '../molecules/TestingTabs'
import { RunHistoryList } from '../molecules/RunHistoryList'
import { InstructionsField, SetupNote } from '../molecules/TestingSetupPieces'
import { SegmentedControl } from '../atoms/SegmentedControl'
import { AIBehaviouralRunView, type AIBehaviouralRunTab } from './AIBehaviouralRunView'
import { AIAgentSessionView } from './AIAgentSessionView'
import { BuildField } from './BuildPickerModal'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import Input from '../ui/Input'
import { AIBehaviouralIcon } from '../icons/AIBehaviouralIcon'
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'
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
    startedLabel: run.when === 'now' ? 'just now' : run.when,
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

const SIMULATED_RUN_MS = 16000

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
  const [build, setBuild] = useState<string | null>('v2.3.1')
  const [runName, setRunName] = useState('')
  /* Agents are asked per persona — "twelve new players, eight whales" is how a
     run is thought about — and the total is derived and shown, never typed. */
  const [counts, setCounts] = useState<Record<string, number>>({ 'new-player': 5, whale: 5 })
  const countOf = (id: string) => counts[id] ?? 5
  const setCount = (id: string, n: number) => setCounts((c) => ({ ...c, [id]: Math.min(100, Math.max(1, n)) }))
  const [personaIds, setPersonaIds] = useState<string[]>(['new-player', 'whale'])
  const [personasOpen, setPersonasOpen] = useState(false)
  const [length, setLength] = useState<SessionLength>('15')
  const [customLength, setCustomLength] = useState('45')
  const [instructions, setInstructions] = useState('')
  const [runs, setRuns] = useState<TestRunHistoryItem[]>(AI_BEHAVIOURAL_HISTORY)
  const [openRun, setOpenRun] = useState<TestRunHistoryItem | null>(null)
  const [runTab, setRunTab] = useState<AIBehaviouralRunTab>('report')
  /* The session being watched, and the screen a report clip pointed at. */
  const [openSession, setOpenSession] = useState<{ id: string; step?: number } | null>(null)
  /* How far the live sessions have got — ticks up while a run is in flight. */
  const [liveReached, setLiveReached] = useState(4)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const timers = useRef<number[]>([])
  const personaRef = useRef<HTMLDivElement>(null)

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
    if (state === 'composer') {
      setOpenRun(null)
      return
    }
    const base = AI_BEHAVIOURAL_HISTORY[0]
    if (state === 'running') {
      /* Distinct id — a seeded id resolves back to its finished copy in `runs`. */
      setOpenRun({ ...base, id: 'demo-running', state: 'progress', result: undefined, when: 'now' })
      setLiveReached(4)
      setRunTab('videos')
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
    const t = window.setInterval(() => setLiveReached((r) => Math.min(AI_BEHAVIOURAL_STEPS.length - 1, r + 1)), 2500)
    return () => window.clearInterval(t)
  }, [activeRun])
  const sessions = useMemo(() => {
    if (!activeRun || !activeMeta) return []
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
  useEffect(() => {
    if (!personasOpen) return
    const onDoc = (e: MouseEvent) => {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) setPersonasOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [personasOpen])

  const personas = PERSONAS.filter((p) => personaIds.includes(p.id))
  const lengthLabel = length === 'custom' ? `${customLength} min` : `${length} min`
  const totalAgents = personas.reduce((n, p) => n + countOf(p.id), 0)

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
      state: 'progress',
      when: 'now',
    }
    setRuns((prev) => [run, ...prev])
    setHighlightId(run.id)
    setRunName('')
    setTab('history')
    timers.current.push(window.setTimeout(() => finishRun(run.id), SIMULATED_RUN_MS))
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
          onBack={() => {
            setOpenSession(null)
            setRunTab('videos')
          }}
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
        onBack={() => {
          setOpenRun(null)
          setTab('history')
        }}
        onOpenSession={(id, step) => setOpenSession({ id, step })}
        className={className}
      />
    )
  }

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

      {tab === 'new' ? (
        <div className="flex flex-col gap-m w-full">
          <div
            className="flex flex-col w-full rounded-4xl px-xl pt-l pb-m"
            style={{
              backgroundColor: 'var(--bg-elements)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 10px 40px var(--bg-tint-light)',
            }}
          >
            <div
              className="flex items-center gap-m pb-m mb-s"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <span className="font-display text-m font-semibold text-text-primary">Set up a session</span>
              <span className="font-body text-s text-text-tertiary leading-[1.5]">
                Personas are derived from the player model and improve with every human session added.
              </span>
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
              <div ref={personaRef} className="relative w-full">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={personasOpen}
                  onClick={() => setPersonasOpen((v) => !v)}
                  /* Same 40px field as the Build select above it. */
                  className="flex items-center gap-xs w-full h-[40px] text-left px-s font-body text-s"
                  style={{
                    backgroundColor: 'var(--bg-elements)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-input)',
                    color: personas.length ? 'var(--text-primary)' : 'var(--text-placeholder)',
                  }}
                >
                  <span className="flex-1 truncate">
                    {personas.length ? personas.map((p) => p.label).join(', ') : 'Choose personas…'}
                  </span>
                  <DropdownArrowIcon size={16} className="shrink-0 text-text-tertiary" />
                </button>
                {personasOpen && (
                  <div
                    role="listbox"
                    aria-multiselectable
                    aria-label="Personas"
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 flex flex-col p-xxs rounded-xl shadow-big max-h-[340px] overflow-y-auto"
                    style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
                  >
                    {PERSONAS.map((p) => {
                      const on = personaIds.includes(p.id)
                      return (
                        <label
                          key={p.id}
                          className="testing-menu-row flex items-center gap-s px-s py-xs rounded-m cursor-pointer"
                        >
                          <Checkbox
                            checked={on}
                            onChange={() =>
                              setPersonaIds((prev) => (on ? prev.filter((x) => x !== p.id) : [...prev, p.id]))
                            }
                            aria-label={p.label}
                          />
                          <span className="flex-1 font-display text-s font-semibold text-text-primary">{p.label}</span>
                          <span className="font-body text-xs text-text-tertiary">{p.detail}</span>
                        </label>
                      )
                    })}
                    <div
                      className="px-s py-xs mt-xxs font-body text-xs text-text-tertiary"
                      style={{ borderTop: '1px solid var(--border-subtle)' }}
                    >
                      Personas come from the player model.
                    </div>
                  </div>
                )}
              </div>
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
                    <span className="font-semibold text-text-primary">{totalAgents} agents</span> in total
                    <span className="flex-1" />
                    <button
                      type="button"
                      className="font-semibold text-text-brand hover:underline"
                      onClick={() => setCounts((c) => Object.fromEntries(personas.map((p) => [p.id, c[personas[0].id] ?? 5])))}
                    >
                      Same for all
                    </button>
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
              <Button variant="primary" size="lg" disabled={personas.length === 0} onClick={submit}>
                Submit
              </Button>
            </div>
          </div>

          <SetupNote>
            6labs produces a behavioural and UX report from the recordings, and you can query them exactly
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
            setRunTab(run.state === 'progress' ? 'videos' : 'report')
            setOpenRun(run)
          }}
          /* Straight into the furthest-along live session of a run in flight —
             the same session the run screen's live strip points at. */
          onWatchLive={(run) => {
            const live = buildAgentSessions(run.id, metaForRun(run), liveReached)
              .filter((s) => s.status === 'live')
              .sort((a, b) => b.reached - a.reached)[0]
            setRunTab('videos')
            setOpenRun(run)
            setOpenSession(live ? { id: live.id } : null)
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
