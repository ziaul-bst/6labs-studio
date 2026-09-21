/**
 * AIBehaviouralRunView — one behavioural run, read two ways.
 *
 * Report is what the run concluded; Videos is what it concluded it *from* —
 * every AI player's session, analysed screen by screen. The two tabs are the
 * same evidence at two zoom levels, and the screen says so: the report opens
 * with what it was built from, and each finding's clips open the exact screen
 * in the exact session.
 *
 * While the run is still playing, the report is not pretended: the Report tab
 * shows the count of sessions done and points at the live sessions instead.
 *
 * Code-first prototype — from the PM artifact (screen s47), no Figma source yet.
 */

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { TestingTabs } from '../molecules/TestingTabs'
import { AgentSessionCard } from '../molecules/AgentSessionCard'
import { VideosEmptyState } from '../molecules/VideosEmptyState'
import { MediaGridSkeleton, ReportSheetSkeleton } from '../molecules/TestingSkeletons'
import { usePageLoading } from '../../lib/pageLoading'
import { PersonaHitRates } from '../molecules/PersonaHitRates'
import { StatTile } from '../molecules/StatTile'
import { UserTestReport, PartHeader } from './UserTestReport'
import { FilterPill } from '../atoms/FilterPill'
import { ProgressBar } from '../atoms/ProgressBar'
import { Spinner } from '../atoms/Spinner'
import { Skeleton, SkeletonText } from '../atoms/Skeleton'
import { CheckIcon } from '../icons/CheckIcon'
import { RunFailedNotice, runFailureText } from '../molecules/RunFailedNotice'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { DownloadIcon } from '../icons/DownloadIcon'
import { SearchIcon } from '../icons/SearchIcon'
import { PERSONA_TONE, type AgentClipRef } from '../../lib/mocks/testing'
import type { AgentSession, AIBehaviouralRunMeta, TestRunHistoryItem } from '../../lib/types/testing'
import type { UserTestIssue } from '../../lib/types/userTest'

export type AIBehaviouralRunTab = 'report' | 'videos'

export type AgentIssue = UserTestIssue & { clipRefs: AgentClipRef[] }

export interface AIBehaviouralRunViewProps {
  run: TestRunHistoryItem
  meta: AIBehaviouralRunMeta
  sessions: AgentSession[]
  issues: AgentIssue[]
  tab: AIBehaviouralRunTab
  onTabChange: (tab: AIBehaviouralRunTab) => void
  /**
   * Seeds the Videos tab's status filter. "Watch live" on a history row arrives
   * with 'live', so the reader lands on the sessions playing right now rather
   * than on the whole batch.
   */
  initialStatus?: VideosStatusFilter
  onBack: () => void
  /** Opens a session, optionally landing on one of its screens. */
  onOpenSession: (sessionId: string, stepIndex?: number) => void
  className?: string
}

export type VideosStatusFilter = 'all' | 'live' | 'done'

/** Cards per page in the Videos grid — the same 12 the Gameplay Library pages at. */
const PAGE_SIZE = 12

/** "30 min" → 30. The run's own session length, in the unit it is written in. */
function minutesIn(label: string): number {
  return Number(label.match(/\d+/)?.[0] ?? 0)
}

/**
 * Minutes as hours, the way a footage total is read out loud: "10h", "10h 30m",
 * and "45m" while a run is small enough that hours would round to zero.
 */
function hoursLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/**
 * The report's identity, read by the finished report and by its loading state
 * so the masthead cannot say one thing while it waits and another when it lands.
 */
const REPORT_KICKER = 'AI behavioural report'
const runIdLabel = (run: TestRunHistoryItem) => run.id.toUpperCase()

export function AIBehaviouralRunView({
  run,
  meta,
  sessions,
  issues,
  tab,
  onTabChange,
  initialStatus = 'all',
  onBack,
  onOpenSession,
  className,
}: AIBehaviouralRunViewProps) {
  /* Submitted, no device yet. Nothing has been recorded and nothing can be
     watched, so none of the live chrome applies — but the run is not idle
     either, and the Report tab has to say which of the three waits this is. */
  const queued = run.state === 'queued'
  const inProgress = run.state === 'progress'
  /* Agents stopped, report not written. Nothing is live, so none of the live
     chrome applies — but nothing is exportable either, and the Report tab has
     to say which of the two waits the reader is in. */
  const analysing = run.state === 'analysing'
  const failure = runFailureText(run)
  const done = sessions.filter((s) => s.status === 'done').length
  const screensAnalysed = sessions.reduce((acc, s) => acc + s.reached, 0)
  const liveCount = sessions.length - done
  /* This screen's own beat, keyed on the run AND the tab: Report and Videos
     read different things, so switching between them is a fetch and the tab
     that arrives should arrive the way the first one did. */
  const loadPhase = usePageLoading(`${run.id}:${tab}`)
  /* The Videos tab's controls live in the tab row, so their state lives here. */
  const [status, setStatus] = useState<VideosStatusFilter>(initialStatus)
  const [persona, setPersona] = useState<string>('all')
  const [query, setQuery] = useState('')

  return (
    <div className={['flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      <PageTopbar
        title={run.name}
        /* The test this run belongs to — which is where the chevron goes. The
           bar named the run alone, so back was a guess. */
        trail={[{ label: 'AI behavioural test' }]}
        onBack={onBack}
        actions={
          <>
            {/* A badge only where the state is still moving — queued, live,
                analysing, failed. A finished run wears none: "Complete" said
                nothing the report under it does not say in its own masthead,
                and a green pill on every finished page trained readers to stop
                looking at the one place the bar's status matters. */}
            {failure ? (
              <StatusPill bg="var(--error-bg)" ink="var(--error)">Failed · {sessions.length} of {meta.agents} saved</StatusPill>
            ) : inProgress ? (
              <StatusPill bg="var(--bg-tint)" ink="var(--text-brand)">
                <i className="agent-live-dot" aria-hidden />
                Live · {done} of {meta.agents} done
              </StatusPill>
            ) : analysing ? (
              <StatusPill bg="var(--bg-tint)" ink="var(--text-brand)">
                <Spinner size={12} tone="current" />
                Analysing {meta.agents} {meta.agents === 1 ? 'session' : 'sessions'}
              </StatusPill>
            ) : queued ? (
              <StatusPill bg="var(--bg-subtle)" ink="var(--text-secondary)">Queued</StatusPill>
            ) : null}
            <Button
              variant="secondary"
              size="md"
              leftIcon={<DownloadIcon size={16} />}
              disabled={queued || inProgress || analysing || !!failure}
            >
              Export
            </Button>
          </>
        }
      />

      <div className="flex-1 w-full">
        <div className="flex flex-col gap-m w-full page-measure mx-auto pt-l pb-xxl3">
          {/* No live strip. "8 AI players are playing now · 12 of 20 sessions
              finished" repeated the topbar's own Live pill two inches below
              it, and its "Watch agent 16 live" link picked a session for the
              reader — the Videos tab's Live pill is the honest way in, because
              it shows the set and lets them choose. */}

          <TestingTabs<AIBehaviouralRunTab>
            ariaLabel="Run sections"
            className="mt-xs"
            value={tab}
            onChange={onTabChange}
            options={[
              { value: 'report', label: 'Report' },
              { value: 'videos', label: 'Videos', count: sessions.length },
            ]}
          />

          {tab === 'videos' && sessions.length > 0 && (
            /* One row of controls for one list: which persona (pills — the
               run's own dimension), how to lay it out, and search. Hidden
               while the run has recorded nothing: pills reading "All 0 · New
               player 0" are a filter over an empty set, and they crowd the
               one thing the tab has to say. */
            <div className="flex items-center gap-xs flex-wrap w-full">
              <FilterPill label="All" count={sessions.length} selected={persona === 'all'} onClick={() => setPersona('all')} />
              {meta.personas.map((p) => (
                <FilterPill
                  key={p}
                  label={p}
                  count={sessions.filter((s) => s.persona === p).length}
                  selected={persona === p}
                  onClick={() => setPersona(p)}
                />
              ))}
              {inProgress && (
                <>
                  <span className="w-px h-[24px] mx-xxs" style={{ backgroundColor: 'var(--border-subtle)' }} aria-hidden />
                  {/* "Live", the same word the card's own badge, the topbar
                      pill and the history row's button all use. It read
                      "Playing" here and "Live" three inches away on every card
                      it filtered to. */}
                  <FilterPill label="Live" count={liveCount} selected={status === 'live'} onClick={() => setStatus(status === 'live' ? 'all' : 'live')} />
                  <FilterPill label="Finished" count={done} selected={status === 'done'} onClick={() => setStatus(status === 'done' ? 'all' : 'done')} />
                </>
              )}
              <span className="flex-1" />
              <div className="library-search shrink-0 w-[300px]">
                <Input
                  size="lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sessions"
                  aria-label="Search sessions"
                  leftIcon={<SearchIcon size={16} />}
                />
              </div>
            </div>
          )}

          {tab === 'report' ? (
            /* Only the plain fetch. Queued, playing and analysing are waits
               with an agent behind them: they narrate themselves in
               ReportPending, and a skeleton over that would say the page is
               still arriving when the truth is that 6labs is working. */
            loadPhase && !failure && !queued && !inProgress && !analysing && sessions.length > 0 ? (
              <ReportSheetSkeleton sheetOnly label={`Loading ${run.name}`} />
            ) : failure ? (
              <RunFailedNotice
                reason={failure}
                saved={
                  sessions.length > 0
                    ? `${sessions.length} of ${meta.agents} sessions finished before the run stopped and were saved — the report needs all of them.`
                    : 'No session finished before the run stopped.'
                }
                secondary={sessions.length > 0 ? { label: 'Watch saved sessions', onClick: () => onTabChange('videos') } : undefined}
              />
            ) : queued || sessions.length === 0 || inProgress || analysing ? (
              /* The report is not pretended: the sheet arrives with the facts
                 the run already knows and the shape of the ones it does not.
                 Before any agent has produced a frame the sheet is dormant —
                 saying "0 of 20 analysed" would imply work already under way
                 on footage that does not exist. */
              <ReportPending
                phase={
                  queued ? 'queued' : sessions.length === 0 ? 'none' : analysing ? 'analysing' : 'playing'
                }
                run={run}
                meta={meta}
                done={analysing ? meta.agents : done}
                total={meta.agents}
                footageHours={hoursLabel(sessions.length * minutesIn(meta.lengthLabel))}
                onWatch={() => onTabChange('videos')}
              />
            ) : (
              <ReportBody
                run={run}
                meta={meta}
                sessions={sessions}
                issues={issues}
                screensAnalysed={screensAnalysed}
                onOpenSession={onOpenSession}
              />
            )
          ) : loadPhase ? (
            <MediaGridSkeleton label={`Loading sessions for ${run.name}`} count={Math.min(8, Math.max(4, sessions.length || 8))} />
          ) : (
            <VideosBody
              sessions={sessions}
              persona={persona}
              status={status}
              query={query}
              preparing={queued ? 'queued' : inProgress ? 'playing' : null}
              onOpenSession={(s) => onOpenSession(s.id)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Report ─────────────────────────────────────────────────────────────── */

/**
 * The report, arriving. Three waits, one sheet.
 *
 * It is the finished report's own masthead — kicker, run name, run id — with
 * the facts the run already knows printed for real (personas, sessions played)
 * and the ones it does not (footage, bugs, friction) drawn as skeleton tiles
 * exactly where the numbers will land. One status line says which wait this
 * is and how far along; the two parts under it hold the shape of the summary
 * and the findings. When the real report replaces it, nothing moves.
 *
 * Counted work gets a counted bar: while the agents play, the session count is
 * the one moving fact. Once they have all stopped, nothing is countable — the
 * findings are being ranked — so the bar is indeterminate and three beats say
 * where the analysis is. Before any agent has produced a frame the sheet is
 * dormant: same shape, no spinner, no bar, the shine frozen.
 *
 * No buttons inside the sheet. While the run plays, the live strip above the
 * tabs owns the one brand action; the status line carries a quiet text link
 * to the sessions so the Report tab always has a way in.
 */
type ReportPendingPhase = 'queued' | 'none' | 'playing' | 'analysing'

function ReportPending({
  phase,
  run,
  meta,
  done,
  total,
  footageHours,
  onWatch,
}: {
  phase: ReportPendingPhase
  run: TestRunHistoryItem
  meta: AIBehaviouralRunMeta
  done: number
  total: number
  /** Known once every agent has stopped. */
  footageHours: string
  onWatch: () => void
}) {
  const playing = phase === 'playing'
  const analysing = phase === 'analysing'
  const queued = phase === 'queued'
  /* 'none' is a run that HAS started and recorded nothing — dormant, because
     saying anything about its numbers would imply work under way on footage
     that does not exist. Queued is a live wait with a known resolution, so it
     shimmers. */
  const none = phase === 'none'
  const shimmer = !none
  /* Nothing has happened to a queued run, so none of its numbers have. The
     two input tiles used to print for real beside three skeletons — "2
     personas · 0 of 20 sessions played" is a row of facts about a run that has
     not begun, and a real number next to a grey bar reads as the grey bars
     being broken rather than as the run being early. */
  const knowsNothing = queued || none
  /* Nothing is turning and there is nothing to watch: no spinner, no link to
     sessions that do not exist yet. */
  const idle = queued || none
  const sessionsWord = total === 1 ? 'session' : 'sessions'

  return (
    <article
      className="report-sheet skeleton-surface flex flex-col w-full rounded-3xl overflow-hidden shadow-sm"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      aria-busy={shimmer || undefined}
    >
      <header
        className="report-masthead flex flex-col gap-xl px-xxxl pt-xxl pb-xl"
        style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex flex-col gap-xs">
          <div className="flex flex-wrap items-baseline gap-s">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary leading-[1.5]">
              {REPORT_KICKER}
            </span>
            <span className="flex-1" />
            <span className="font-code text-xs text-text-tertiary leading-[1.5] whitespace-nowrap">
              run #{runIdLabel(run)}
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-primary leading-[1.2]">{run.name}</h1>

          {/* The one moving fact — where the finished report prints "report generated …". */}
          <div className="flex items-center gap-s font-body text-m text-text-secondary leading-[1.6]" role="status">
            {!idle && <Spinner size={16} tone="brand" />}
            <span>
              {queued ? (
                <>Queued · {total === 1 ? 'the agent starts' : `${total} agents start`} as soon as devices free up</>
              ) : none ? (
                <>No behaviour to analyse yet · waiting for the first session on {meta.build}</>
              ) : playing ? (
                <>
                  Report lands when {total === 1 ? 'the session finishes' : `all ${total} sessions finish`} ·{' '}
                  <span className="font-semibold text-text-primary tabular-nums">
                    {done} of {total}
                  </span>{' '}
                  done
                </>
              ) : (
                <>Writing the report from {total === 1 ? 'the session' : `all ${total} sessions`}</>
              )}
            </span>
            <span className="flex-1" />
            {!idle && (
              <button
                type="button"
                onClick={onWatch}
                className="inline-flex items-center gap-xxs font-body text-s font-semibold text-text-brand leading-[1.5] hover:underline whitespace-nowrap"
              >
                {playing ? 'All sessions' : `Watch the ${total} ${sessionsWord}`}
                <span aria-hidden>→</span>
              </button>
            )}
          </div>

          {/* White track: the masthead band is the bar's own default grey. */}
          {playing && (
            <ProgressBar
              value={(done / Math.max(total, 1)) * 100}
              label="Sessions finished"
              track="var(--bg-elements)"
              className="mt-xxs"
            />
          )}
          {analysing && (
            <div className="flex flex-col gap-s mt-xxs">
              <ProgressBar indeterminate label="Writing the report" track="var(--bg-elements)" />
              <AnalysisBeats />
            </div>
          )}
        </div>

        <div className="stat-tiles gap-s">
          <StatTile
            surface="band"
            value={knowsNothing ? '' : String(meta.personas.length)}
            label={meta.personas.length === 1 ? 'persona' : 'personas'}
            loading={knowsNothing}
            shimmer={shimmer}
          />
          <StatTile
            surface="band"
            value={knowsNothing ? '' : String(done)}
            label={`of ${total} ${sessionsWord} played`}
            loading={knowsNothing}
            shimmer={shimmer}
          />
          {analysing ? (
            <StatTile surface="band" value={footageHours} label="session reviewed" />
          ) : (
            <StatTile surface="band" value="" label="session reviewed" loading shimmer={shimmer} />
          )}
          <StatTile surface="band" value="" label="bugs" dot="var(--error)" loading shimmer={shimmer} />
          <StatTile surface="band" value="" label="friction points" dot="var(--warning)" loading shimmer={shimmer} />
        </div>
      </header>

      <div className="report-body flex flex-col px-xxxl pt-xxl pb-xxl3">
        <PartHeader index="01" label="Summary" first />
        <SkeletonText lines={3} lineHeight={14} gap={14} lastWidth="62%" className="max-w-[86ch] pt-l" />

        <PartHeader
          index="02"
          label="Findings"
          meta={
            queued
              ? 'nothing has started yet'
              : none
                ? 'nothing recorded yet'
                : playing
                  ? 'ranked once the last agent has played'
                  : 'being ranked now'
          }
        />
        <div className="flex flex-col rounded-xl overflow-hidden mt-l" style={{ border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center h-[40px] px-m" style={{ backgroundColor: 'var(--bg-page-pale)' }}>
            <Skeleton variant="bar" width={120} height={10} shimmer={shimmer} />
          </div>
          {[62, 48, 55].map((w) => (
            <div key={w} className="flex items-center gap-s px-m py-s" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <Skeleton variant="circle" width={24} shimmer={shimmer} />
              <Skeleton variant="text" width={`${w}%`} height={12} shimmer={shimmer} />
              <span className="flex-1" />
              <Skeleton variant="bar" width={56} shimmer={shimmer} />
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

/**
 * The three beats of the analysis, in the dot vocabulary AnalysisProgressCard
 * uses — done tick, active ring, waiting ring. The status line above carries
 * the sheet's only spinner.
 */
function AnalysisBeats() {
  const beats = [
    { label: 'Sessions read', state: 'done' },
    { label: 'Findings ranked', state: 'active' },
    { label: 'Report written', state: 'waiting' },
  ] as const
  return (
    <ul className="flex flex-wrap items-center gap-m list-none m-0 p-0">
      {beats.map((b) => (
        <li key={b.label} className="flex items-center gap-xs">
          {b.state === 'done' ? (
            <span
              className="flex items-center justify-center shrink-0 w-[14px] h-[14px] rounded-round text-white"
              style={{ backgroundColor: 'var(--success)' }}
              aria-hidden
            >
              <CheckIcon size={12} />
            </span>
          ) : (
            <span
              className="shrink-0 w-[14px] h-[14px] rounded-round"
              style={{
                border: `1.5px solid ${b.state === 'active' ? 'var(--brand)' : 'var(--border-default)'}`,
                backgroundColor: b.state === 'active' ? 'var(--bg-tint-light)' : 'transparent',
              }}
              aria-hidden
            />
          )}
          <span
            className="font-body text-xs leading-[1.5]"
            style={{
              color:
                b.state === 'done'
                  ? 'var(--text-primary)'
                  : b.state === 'active'
                    ? 'var(--text-brand)'
                    : 'var(--text-tertiary)',
            }}
          >
            {b.label}
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * The report a finished behavioural run produces — the same document the User
 * Test report is, because it is the same document: findings grouped by what you
 * would fix together, each with its clips and a recommendation.
 *
 * It used to be a bespoke list with its own filter pills and stat row. Two
 * reports over the same kind of evidence, laid out two different ways, is two
 * things to learn and two places for a finding to look different; the agents
 * that produced these are named in the clips, which is the only part of the
 * document that has to know.
 */
function ReportBody({
  run,
  meta,
  sessions,
  issues,
  screensAnalysed,
  onOpenSession,
}: {
  run: TestRunHistoryItem
  meta: AIBehaviouralRunMeta
  sessions: AgentSession[]
  issues: AgentIssue[]
  screensAnalysed: number
  onOpenSession: (sessionId: string, stepIndex?: number) => void
}) {
  const bugs = issues.filter((i) => i.kind === 'bug').length
  const friction = issues.length - bugs
  const played = sessions.filter((s) => s.status === 'done').length
  /* Reviewed, not played: footage is generated first and analysed second, and
     on a run still in flight the two numbers differ. The report is written from
     the reviewed ones. */
  const reviewed = sessions.length
  const agentWord = meta.agents === 1 ? 'AI player' : 'AI players'
  /* Hours of footage, not a count of sessions: "20 sessions reviewed" sat next
     to "20 sessions played" and the pair read as the same number printed twice.
     How long the analysis actually watched is the fact the tile was reaching
     for, and it is the only one on the masthead denominated in something other
     than sessions. */
  const footageHours = hoursLabel(reviewed * minutesIn(meta.lengthLabel))

  const reportMeta = useMemo(
    () => ({
      kicker: REPORT_KICKER,
      /* The noun each finding counts against — "16 / 20 agents". Still needed
         alongside `tiles`, which only replaces the masthead numbers. */
      sessionsLabel: 'agents',
      title: run.name,
      /* No subtitle line. It read "20 AI players · New player & Whale" directly
         above a tile row that now counts both of those things, and the tiles
         say it in the type size a masthead number deserves. */
      game: '',
      generated: meta.startedLabel,
      runId: runIdLabel(run),
      sessions: meta.agents,
      footageLabel: `${screensAnalysed}`,
      /* What the run was made of, then what came out of it: how many kinds of
         player, how many sessions they produced, how many hours of that the
         analysis watched — then the two things it found. The agent count is
         gone from the row; on a finished run it and "sessions played" were the
         same number twice, and while one is in flight the honest number is the
         one in the topbar's own status pill. */
      tiles: [
        { value: String(meta.personas.length), label: meta.personas.length === 1 ? 'persona' : 'personas' },
        { value: String(played), label: played === 1 ? 'session played' : 'sessions played' },
        { value: footageHours, label: 'session reviewed' },
        { value: String(bugs), label: bugs === 1 ? 'bug' : 'bugs', dot: 'var(--error)' },
        {
          value: String(friction),
          label: friction === 1 ? 'friction point' : 'friction points',
          dot: 'var(--warning)',
        },
      ],
      narrative:
        issues.length === 0
          ? `${reviewed} ${reviewed === 1 ? 'session' : 'sessions'} played ${meta.lengthLabel} each on ${meta.build}, and nothing was flagged.`
          : `${meta.agents} ${agentWord} played ${meta.lengthLabel}${meta.agents === 1 ? '' : ' each'} on ${meta.build}. ${issues.length} finding${
              issues.length === 1 ? '' : 's'
            } across ${screensAnalysed} screens, ranked by how many agents hit ${issues.length === 1 ? 'it' : 'them'}.`,
    }),
    [run, meta, agentWord, played, reviewed, footageHours, bugs, friction, screensAnalysed, issues.length],
  )

  return (
    <UserTestReport
      sheetOnly
      issues={issues}
      meta={reportMeta}
      /* The run's own dimension, kept from the report this replaced: which
         personas hit each finding and how many of each. "6 of 20" reads very
         differently when all six are whales, and nothing else on the row says
         so — the shared document has no concept of a persona. */
      /* Which kinds of agent hit each finding — the run's own dimension, and
         the one thing "16 of 20 agents" cannot say. See PersonaHitRates. */
      findingMeta={(issue) => {
        const found = issues.find((i) => i.id === issue.id)
        if (!found) return null
        const rates = personaSplit(found, meta.personas, sessions)
        return rates.length > 0 ? <PersonaHitRates rates={rates} /> : null
      }}
      /* Each clip is one agent's screen, so its chip wears that agent's persona
         colour — the same colour the rate rows above it use. */
      clipTone={(clip) => PERSONA_TONE[clip.device]}
      /* A clip in this report is a screen in a session — opening it lands on
         that exact frame rather than on a player with no context. */
      onOpenClip={(issue, clip) => {
        const found = issues.find((i) => i.id === issue.id)
        const idx = found?.clips.indexOf(clip) ?? -1
        const ref = idx >= 0 ? found?.clipRefs[idx] : undefined
        if (ref) onOpenSession(ref.sessionId, ref.stepIndex)
      }}
    />
  )
}

/**
 * How a finding's affected agents divide between the personas in the run.
 *
 * The clips are the truth when there are any: each one is a screen in one
 * agent's session, and that agent's persona is on it. But a finding can be
 * ranked from the run without every one of its hits carrying a clip — and the
 * split used to be dropped entirely in that case, which is why most findings
 * on a behavioural report showed no persona rows at all. "16 of 20 agents"
 * with no breakdown is precisely the number this block exists to qualify, so
 * the rest of the split is apportioned across the personas by how many agents
 * of each played, largest remainder first, and every persona in the run gets a
 * row. A row saying "0 of 8" is a finding about the personas it did *not*
 * touch, which is half of what the reader came here for.
 */
function personaSplit(
  issue: AgentIssue,
  personas: string[],
  sessions: AgentSession[],
): { persona: string; hit: number; of: number; tone: string }[] {
  const of = (p: string) => sessions.filter((s) => s.persona === p).length
  const present = personas.filter((p) => of(p) > 0)
  if (present.length === 0) return []

  const counts = new Map<string, number>(present.map((p) => [p, 0]))
  for (const clip of issue.clips) {
    if (counts.has(clip.device)) counts.set(clip.device, counts.get(clip.device)! + 1)
  }
  /* A clip per agent, never more — two screens from one session are one agent
     hitting the finding twice, not two agents. */
  for (const p of present) counts.set(p, Math.min(counts.get(p)!, of(p)))

  const claimed = Math.min(issue.affected, sessions.length)
  const fromClips = present.reduce((n, p) => n + counts.get(p)!, 0)
  const headroom = present.map((p) => ({ p, room: of(p) - counts.get(p)! }))
  const room = headroom.reduce((n, h) => n + h.room, 0)
  /* The rows have to add up to the number on the right of the finding's title.
     Largest remainder, so they always do: each persona's share is proportional
     to how many of its agents are still unaccounted for, the floors are dealt
     first, and the leftover ones go to the largest fractions. Rounding each
     share independently left the column short by one or two on most findings,
     which is the one thing a breakdown of a stated total may not do. */
  let remainder = Math.max(0, Math.min(claimed - fromClips, room))
  if (remainder > 0) {
    const shares = headroom.map((h) => {
      const exact = (h.room / room) * remainder
      const base = Math.floor(exact)
      return { ...h, base, frac: exact - base }
    })
    let dealt = shares.reduce((n, sh) => n + sh.base, 0)
    for (const sh of shares) counts.set(sh.p, counts.get(sh.p)! + sh.base)
    remainder -= dealt
    for (const sh of [...shares].sort((a, b) => b.frac - a.frac || b.room - a.room)) {
      if (remainder <= 0) break
      if (counts.get(sh.p)! >= of(sh.p)) continue
      counts.set(sh.p, counts.get(sh.p)! + 1)
      remainder -= 1
    }
    /* Any left after one pass — possible when a persona hit its own ceiling —
       goes to whoever still has room. */
    for (const h of headroom) {
      if (remainder <= 0) break
      const take = Math.min(remainder, of(h.p) - counts.get(h.p)!)
      counts.set(h.p, counts.get(h.p)! + take)
      remainder -= take
    }
  }

  return present.map((p) => ({
    persona: p,
    hit: counts.get(p)!,
    of: of(p),
    tone: PERSONA_TONE[p] ?? 'var(--text-tertiary)',
  }))
}

/* ── Videos ─────────────────────────────────────────────────────────────── */

/**
 * One list in one container, cut by the pills above it: persona is the run's
 * own dimension, so it is a filter rather than a set of sections. Cards show
 * a frame from each session — the thing a session is opened for.
 */
function VideosBody({
  sessions,
  persona,
  status,
  query,
  preparing,
  onOpenSession,
}: {
  sessions: AgentSession[]
  persona: string
  status: VideosStatusFilter
  query: string
  /**
   * Footage is still coming: 'queued' before an agent has picked the build up,
   * 'playing' once they are on it. Two different waits and two different
   * sentences — "the agents are playing" on a run nothing has started is the
   * kind of claim that makes the next empty screen look broken.
   */
  preparing: 'queued' | 'playing' | null
  onOpenSession: (session: AgentSession) => void
}) {
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sessions.filter(
      (s) =>
        (persona === 'all' || s.persona === persona) &&
        (status === 'all' || s.status === status) &&
        (!q || `${s.persona} agent ${s.index + 1} ${s.steps[s.reached - 1]?.screen ?? ''}`.toLowerCase().includes(q)),
    )
  }, [sessions, persona, status, query])

  /* Twenty agents is the small run; a large-scale one is hundreds, and a grid
     that simply keeps going gives a reader no way to say where they got to.
     Pages, at the same 12-per-page the rest of the app uses for cards. */
  const [page, setPage] = useState(0)
  /* Narrowing the set is a new question — answering it on page 4 of the old
     one shows an empty grid and reads as "no sessions". */
  useEffect(() => {
    setPage(0)
  }, [persona, status, query])
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const visible = shown.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  return (
    <section
      className="flex flex-col w-full rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      aria-label="Sessions"
    >
      <div className="flex items-center gap-xs px-l pt-l pb-m">
        <span className="font-display text-s font-semibold text-text-primary leading-[1.5]">
          {persona === 'all' ? 'All sessions' : `${persona} sessions`}
        </span>
        {/* The persona's description used to ride on the right of this header.
            It describes the persona, not this set of recordings, and it said
            the same sentence every time the filter changed — the pill above
            already names who is being shown. */}
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">
          {shown.length} of {sessions.length}
        </span>
      </div>
      {shown.length === 0 ? (
        <VideosEmpty
          sessions={sessions.length}
          filtered={persona !== 'all' || status !== 'all' || query.trim().length > 0}
          preparing={preparing}
        />
      ) : (
        <>
          <div
            className="grid gap-m px-l pb-l pt-m"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', borderTop: '1px solid var(--border-subtle)' }}
          >
            {visible.map((s) => (
              <AgentSessionCard key={s.id} session={s} onOpen={onOpenSession} />
            ))}
          </div>
          {pageCount > 1 && (
            <div
              className="flex items-center gap-s px-l py-s"
              style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page-pale)' }}
            >
              <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, shown.length)} of {shown.length}
              </span>
              <span className="flex-1" />
              <Button
                variant="secondary"
                size="md"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="md"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

/**
 * Nothing in the grid — two different nothings, and they need different words
 * and different weights.
 *
 * A run with no sessions at all is the whole tab: nothing has been recorded,
 * there is nothing to filter, and the screen is this state. It gets the shared
 * illustrated fallback, the same one the Gameplay Library shows when it has no
 * footage — an empty grid area with two lines of grey text in it reads as a
 * list that failed to load.
 *
 * A filter that matches nothing is the reader's own doing, undone by widening
 * it, and it happens with a full grid one click away. That one stays as a line
 * of text: an illustration for a passing state is a page-sized answer to a
 * question the reader can retract.
 */
function VideosEmpty({
  sessions,
  filtered,
  preparing,
}: {
  sessions: number
  filtered: boolean
  preparing: 'queued' | 'playing' | null
}) {
  if (!filtered) {
    /* A run that is still producing footage is a wait, not an absence. The
       illustrated "No sessions yet" state is the right answer for a run with
       nothing coming; on one whose agents are mid-session it reads as a
       failure, because the reader was told a moment ago that twenty sessions
       were on the way. A wait gets a spinner and a sentence about what is
       happening to it. */
    if (preparing) {
      return (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex flex-col items-center gap-xs px-l pt-xxl pb-l text-center" role="status">
            <Spinner size={24} tone="brand" />
            <span className="font-display text-m font-semibold text-text-primary leading-[1.4] pt-xs">
              Videos are being prepared
            </span>
            <span className="font-body text-s text-text-secondary leading-[1.7] max-w-[62ch]">
              {preparing === 'queued'
                ? 'The run is waiting for devices. Sessions appear here one at a time as the agents pick the build up — nothing needs to stay open for them to land.'
                : 'The agents are playing. Each session appears here the moment its recording is ready — they arrive one at a time, and nothing needs to stay open for them to land.'}
            </span>
          </div>
          {/* The shape the first sessions will land in, under the sentence that
              says they are coming — the same pairing the Report tab makes,
              where the masthead states the wait in words and the tiles below
              hold the places the numbers will take. Four, not the run's whole
              count: this is a shape, not a promise about how many. */}
          <div
            className="grid gap-m px-l pb-l pt-xs"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
            aria-hidden
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                <Skeleton variant="block" width="100%" radius="rounded-none" style={{ height: 'auto', aspectRatio: '4 / 3' }} />
                <div className="px-m py-s">
                  <Skeleton variant="text" width={`${58 + ((i * 11) % 24)}%`} height={13} radius="rounded-xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return (
      <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <VideosEmptyState
          title="No sessions yet"
          message="The AI players have not recorded anything on this build yet. Each session appears here as its agent finishes the first screen — there is nothing to do but wait."
        />
      </div>
    )
  }
  return (
    <div
      className="flex flex-col gap-xs items-start px-l py-xxl"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">
        No sessions match
      </span>
      <span className="font-body text-s text-text-secondary leading-[1.7] max-w-[68ch]">
        {sessions === 1
          ? 'The one session in this run is outside the current filter. Clear a pill or the search to see it.'
          : `None of the ${sessions} sessions in this run match the current persona, status and search. Clear a pill or the search to widen it.`}
      </span>
    </div>
  )
}

/* ── Bits ───────────────────────────────────────────────────────────────── */

function StatusPill({ bg, ink, children }: { bg: string; ink: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-xs px-s py-xxs rounded-round font-body text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: bg, color: ink }}
    >
      {children}
    </span>
  )
}
