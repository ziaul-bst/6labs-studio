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
import { PersonaHitRates } from '../molecules/PersonaHitRates'
import { UserTestReport } from './UserTestReport'
import { FilterPill } from '../atoms/FilterPill'
import { ProgressBar } from '../atoms/ProgressBar'
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
  const inProgress = run.state === 'progress'
  /* Agents stopped, report not written. Nothing is live, so none of the live
     chrome applies — but nothing is exportable either, and the Report tab has
     to say which of the two waits the reader is in. */
  const analysing = run.state === 'analysing'
  const failure = runFailureText(run)
  const done = sessions.filter((s) => s.status === 'done').length
  const screensAnalysed = sessions.reduce((acc, s) => acc + s.reached, 0)
  const liveCount = sessions.length - done
  /* The session a reader is pointed at while the run plays — the furthest-along live one. */
  const liveSession = [...sessions].filter((s) => s.status === 'live').sort((a, b) => b.reached - a.reached)[0]

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
            {failure ? (
              <StatusPill bg="var(--error-bg)" ink="var(--error)">Failed · {sessions.length} of {meta.agents} saved</StatusPill>
            ) : inProgress ? (
              <StatusPill bg="var(--bg-tint)" ink="var(--text-brand)">
                <i className="agent-live-dot" aria-hidden />
                Live · {done} of {meta.agents} done
              </StatusPill>
            ) : analysing ? (
              <StatusPill bg="var(--bg-tint)" ink="var(--text-brand)">
                <span className="testing-spinner" aria-hidden />
                Analysing {meta.agents} {meta.agents === 1 ? 'session' : 'sessions'}
              </StatusPill>
            ) : (
              /* Status only. The finding count is the first thing the report
                 itself says, three lines down — in the bar it was a second
                 pill competing with the one fact the bar is for. */
              <StatusPill bg="var(--success-bg)" ink="var(--success)">Complete</StatusPill>
            )}
            <Button
              variant="secondary"
              size="md"
              leftIcon={<DownloadIcon size={16} />}
              disabled={inProgress || analysing || !!failure}
            >
              Export
            </Button>
          </>
        }
      />

      <div className="flex-1 w-full">
        <div className="flex flex-col gap-m w-full page-measure mx-auto pt-l pb-xxl3">
          {inProgress && liveSession && (
            /* While the run plays, the way into it is one click from anywhere:
               how many agents are on the build right now, and a live session. */
            <div
              className="flex items-center gap-s w-full rounded-xl px-l py-s"
              style={{ backgroundColor: 'var(--bg-tint-light)', border: '1px solid var(--border-tint)' }}
              role="status"
            >
              <i className="agent-live-dot text-text-brand shrink-0" aria-hidden />
              <span className="font-body text-s text-text-primary leading-[1.5]">
                <span className="font-semibold">{liveCount} AI {liveCount === 1 ? 'player is' : 'players are'} playing now</span>
                {' · '}
                {done} of {meta.agents} sessions finished
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => onOpenSession(liveSession.id)}
                className="inline-flex items-center gap-xxs font-body text-s font-semibold text-text-brand leading-[1.5] hover:underline whitespace-nowrap"
              >
                Watch agent {liveSession.index + 1} live
                <span aria-hidden>→</span>
              </button>
            </div>
          )}

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
            failure ? (
              <RunFailedNotice
                reason={failure}
                saved={
                  sessions.length > 0
                    ? `${sessions.length} of ${meta.agents} sessions finished before the run stopped and were saved — the report needs all of them.`
                    : 'No session finished before the run stopped.'
                }
                secondary={sessions.length > 0 ? { label: 'Watch saved sessions', onClick: () => onTabChange('videos') } : undefined}
              />
            ) : sessions.length === 0 ? (
              /* Nothing has been recorded yet, so there is nothing to analyse.
                 Distinct from the in-flight state below, which has sessions
                 arriving: this one is the run before any agent has produced a
                 frame, and saying "0 of 20 analysed" would imply work is
                 already underway on footage that does not exist. */
              <div
                className="flex flex-col gap-xs items-start w-full rounded-2xl px-xl py-xxl"
                style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
              >
                <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">
                  No behaviour to analyse yet
                </span>
                <span className="font-body text-s text-text-secondary leading-[1.7] max-w-[74ch]">
                  The {meta.agents} AI {meta.agents === 1 ? 'player has' : 'players have'} not recorded
                  anything on {meta.build} yet. The report is written from what they play, so it
                  appears here once the first sessions land.
                </span>
              </div>
            ) : inProgress || analysing ? (
              <ReportPending
                analysing={analysing}
                done={analysing ? meta.agents : done}
                total={meta.agents}
                liveLabel={!analysing && liveSession ? `Watch agent ${liveSession.index + 1} live` : undefined}
                onWatchLive={!analysing && liveSession ? () => onOpenSession(liveSession.id) : undefined}
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
          ) : (
            <VideosBody
              sessions={sessions}
              persona={persona}
              status={status}
              query={query}
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
 * Two waits, one card. While the agents are still playing, the thing that is
 * moving is the session count, and the way in is a live session. Once they have
 * all stopped, the count is finished and the only thing still happening is the
 * analysis — so the headline changes, the bar is full, and the only offer left
 * is the footage the report is being written from.
 *
 * Saying "20 of 20 sessions done" under "the report lands when all 20 sessions
 * finish" would be the screen contradicting itself.
 */
function ReportPending({
  analysing,
  done,
  total,
  liveLabel,
  onWatchLive,
  onWatch,
}: {
  analysing?: boolean
  done: number
  total: number
  liveLabel?: string
  onWatchLive?: () => void
  onWatch: () => void
}) {
  return (
    <div
      className="flex flex-col gap-m w-full rounded-2xl px-xl py-xl"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center gap-s">
        <span className="testing-spinner shrink-0" aria-hidden />
        <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">
          {analysing
            ? total === 1
              ? 'Writing the report from the session'
              : `Writing the report from all ${total} sessions`
            : total === 1
              ? 'The report lands when the session finishes'
              : `The report lands when all ${total} sessions finish`}
        </span>
      </div>
      <div className="flex items-center gap-s">
        <span className="font-body text-s text-text-secondary whitespace-nowrap">
          {analysing ? `all ${total} sessions played` : `${done} of ${total} sessions done`}
        </span>
        <ProgressBar value={(done / total) * 100} className="flex-1" />
      </div>
      <p className="font-body text-s text-text-secondary leading-[1.65] max-w-[80ch] m-0">
        {analysing
          ? 'Every agent has stopped. The findings are being ranked by how many of them hit each one, which is the last step and the one that needs the whole batch — the recordings themselves are all watchable now.'
          : "Every session is analysed screen by screen as it plays. Flagged screens become the report's findings, ranked by how many agents hit them — so the report cannot be written until the last agent has played."}
      </p>
      <div className="flex items-center gap-xs">
        {onWatchLive && liveLabel && (
          <Button variant="primary" size="md" onClick={onWatchLive}>
            {liveLabel}
          </Button>
        )}
        <Button variant={analysing ? 'primary' : 'secondary'} size="md" onClick={onWatch}>
          All sessions
        </Button>
      </div>
    </div>
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
      kicker: 'AI behavioural report',
      /* The noun each finding counts against — "16 / 20 agents". Still needed
         alongside `tiles`, which only replaces the masthead numbers. */
      sessionsLabel: 'agents',
      title: run.name,
      /* No subtitle line. It read "20 AI players · New player & Whale" directly
         above a tile row that now counts both of those things, and the tiles
         say it in the type size a masthead number deserves. */
      game: '',
      generated: meta.startedLabel,
      runId: run.id.toUpperCase(),
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
        { value: footageHours, label: 'footage reviewed' },
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
        if (!found || found.clips.length === 0) return null
        const hits = new Map<string, number>()
        for (const clip of found.clips) hits.set(clip.device, (hits.get(clip.device) ?? 0) + 1)
        const rates = meta.personas
          .filter((p) => hits.has(p))
          .map((p) => ({
            persona: p,
            hit: hits.get(p)!,
            of: sessions.filter((s) => s.persona === p).length,
            tone: PERSONA_TONE[p] ?? 'var(--text-tertiary)',
          }))
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
  onOpenSession,
}: {
  sessions: AgentSession[]
  persona: string
  status: VideosStatusFilter
  query: string
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
        <VideosEmpty sessions={sessions.length} filtered={persona !== 'all' || status !== 'all' || query.trim().length > 0} />
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
function VideosEmpty({ sessions, filtered }: { sessions: number; filtered: boolean }) {
  if (!filtered) {
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
