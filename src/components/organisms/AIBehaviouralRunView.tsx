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

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { TestingTabs } from '../molecules/TestingTabs'
import { AgentSessionCard } from '../molecules/AgentSessionCard'
import { RunFacts, PersonaChip } from '../molecules/RunFacts'
import { UserTestIssueRow } from '../molecules/UserTestIssueRow'
import { SegmentedControl } from '../atoms/SegmentedControl'
import { FilterPill } from '../atoms/FilterPill'
import { IssueCountPill } from '../atoms/IssueCountPill'
import { ProgressBar } from '../atoms/ProgressBar'
import { RunFailedNotice, runFailureText } from '../molecules/RunFailedNotice'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { DownloadIcon } from '../icons/DownloadIcon'
import { SearchIcon } from '../icons/SearchIcon'
import { AIBehaviouralIcon } from '../icons/AIBehaviouralIcon'
import { PERSONA_DETAIL, PERSONA_TONE, type AgentClipRef } from '../../lib/mocks/testing'
import { TESTING_ACCENT_VARS } from '../../lib/studioAreas'
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

type IssueFilter = 'all' | 'bug' | 'friction'

export type VideosStatusFilter = 'all' | 'live' | 'done'

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
        onBack={onBack}
        actions={
          <>
            {failure ? (
              <StatusPill bg="var(--error-bg)" ink="var(--error)">Failed · {sessions.length} of {meta.agents} saved</StatusPill>
            ) : inProgress ? (
              <StatusPill bg="var(--bg-tint)" ink="var(--text-brand)">
                <i className="agent-live-dot" aria-hidden />
                Playing · {done} of {meta.agents} done
              </StatusPill>
            ) : (
              <>
                <StatusPill bg="var(--success-bg)" ink="var(--success)">Complete</StatusPill>
                <IssueCountPill count={issues.length} />
              </>
            )}
            <Button variant="secondary" size="md" leftIcon={<DownloadIcon size={16} />} disabled={inProgress || !!failure}>
              Export
            </Button>
          </>
        }
      />

      <div className="flex-1 w-full">
        <div className="flex flex-col gap-m w-full page-measure mx-auto pt-l pb-xxl3">
          {/* Who the run is: identity on the left, the facts every screen of it
              repeats on the right, on one surface. The tabs belong to the
              content and sit below the card, with the Videos controls at the
              end of the tab row. */}
          <header
            className="flex items-center gap-xl w-full min-w-0 flex-wrap rounded-2xl px-xl py-l"
            style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-m shrink-0 min-w-0">
              <span
                className="flex items-center justify-center shrink-0 w-[48px] h-[48px] rounded-xl text-white"
                style={{ background: TESTING_ACCENT_VARS.success.gradient }}
                aria-hidden
              >
                <AIBehaviouralIcon size={20} />
              </span>
              <h1 className="font-display text-xl font-semibold text-text-primary leading-[1.25] tracking-[-0.01em] m-0 truncate">
                {run.name}
              </h1>
            </div>
            <span className="flex-1" />
            <RunFacts
              className="w-auto shrink-0 gap-x-xxl"
              facts={[
                { label: 'Build', value: meta.build },
                { label: 'Agents', value: String(meta.agents) },
                {
                  label: 'Personas',
                  value: meta.personas.map((p) => (
                    <PersonaChip key={p} name={p} tone={PERSONA_TONE[p] ?? 'var(--text-secondary)'} count={meta.personaCounts?.[p]} />
                  )),
                },
                { label: 'Session length', value: meta.lengthLabel },
                { label: 'Started', value: meta.startedLabel },
              ]}
            />
          </header>

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

          {tab === 'videos' && (
            /* One row of controls for one list: which persona (pills — the
               run's own dimension), how to lay it out, and search. */
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
                  <FilterPill label="Playing" count={liveCount} selected={status === 'live'} onClick={() => setStatus(status === 'live' ? 'all' : 'live')} />
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
            ) : inProgress ? (
              <ReportPending
                done={done}
                total={meta.agents}
                liveLabel={liveSession ? `Watch agent ${liveSession.index + 1} live` : undefined}
                onWatchLive={liveSession ? () => onOpenSession(liveSession.id) : undefined}
                onWatch={() => onTabChange('videos')}
              />
            ) : (
              <ReportBody
                run={run}
                meta={meta}
                sessions={sessions}
                issues={issues}
                screensAnalysed={screensAnalysed}
                onSeeSessions={() => onTabChange('videos')}
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

function ReportPending({
  done,
  total,
  liveLabel,
  onWatchLive,
  onWatch,
}: {
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
          The report lands when all {total} sessions finish
        </span>
      </div>
      <div className="flex items-center gap-s">
        <span className="font-body text-s text-text-secondary whitespace-nowrap">
          {done} of {total} sessions done
        </span>
        <ProgressBar value={(done / total) * 100} className="flex-1" />
      </div>
      <p className="font-body text-s text-text-secondary leading-[1.65] max-w-[80ch] m-0">
        Every session is analysed screen by screen as it plays. Flagged screens become the report's
        findings, ranked by how many agents hit them — so the report cannot be written until the
        last agent has played.
      </p>
      <div className="flex items-center gap-xs">
        {onWatchLive && liveLabel && (
          <Button variant="primary" size="md" onClick={onWatchLive}>
            {liveLabel}
          </Button>
        )}
        <Button variant="secondary" size="md" onClick={onWatch}>
          All sessions
        </Button>
      </div>
    </div>
  )
}

function ReportBody({
  run,
  meta,
  sessions,
  issues,
  screensAnalysed,
  onSeeSessions,
  onOpenSession,
}: {
  run: TestRunHistoryItem
  meta: AIBehaviouralRunMeta
  sessions: AgentSession[]
  issues: AgentIssue[]
  screensAnalysed: number
  onSeeSessions: () => void
  onOpenSession: (sessionId: string, stepIndex?: number) => void
}) {
  const [filter, setFilter] = useState<IssueFilter>('all')
  const bugs = issues.filter((i) => i.kind === 'bug').length
  const friction = issues.length - bugs
  const visible = filter === 'all' ? issues : issues.filter((i) => i.kind === filter)
  const top = issues[0]
  const furnaceHit = issues.find((i) => i.id === 'furnace')?.affected ?? 0
  const completed = Math.max(1, meta.agents - Math.round(meta.agents * 0.35))
  const minutes = meta.agents * parseInt(meta.lengthLabel, 10)
  const footage = minutes % 60 === 0 ? `${minutes / 60}h` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`

  return (
    <div className="flex flex-col gap-m w-full">
      {/* What the report is made of. Stated first, because a behavioural claim
          from an AI player is only worth reading if you can see its evidence. */}
      <div
        className="flex items-center gap-m rounded-2xl px-l py-m"
        style={{ backgroundColor: 'var(--bg-page-pale)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex flex-col gap-xxxs min-w-0 flex-1">
          <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
            Built from {sessions.length} sessions · {screensAnalysed} screens analysed
          </span>
          <span className="font-body text-xs text-text-tertiary leading-[1.5]">
            Each finding below cites the screen it was seen on. Open a clip to see the agent's reasoning at that moment.
          </span>
        </div>
        <Button variant="secondary" size="md" onClick={onSeeSessions}>
          See the sessions
        </Button>
      </div>

      {/* What happened */}
      <section
        className="flex flex-col gap-m rounded-2xl px-l py-l"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      >
        <SectionTitle n="01">What happened</SectionTitle>
        <div className="grid gap-s" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <Tile value={String(sessions.length)} label="AI sessions" />
          <Tile value={String(issues.length)} label="issues found" />
          <Tile value={`${bugs} · ${friction}`} label="bugs · friction" />
          <Tile value={`${completed} / ${meta.agents}`} label="finished the flow" highlight />
          <Tile value={`${furnaceHit} / ${meta.agents}`} label="hit the Furnace bug" />
          <Tile value={footage} label="footage reviewed" />
        </div>
        {top && (
          <p className="font-body text-s text-text-secondary leading-[1.7] max-w-[92ch] m-0">
            {top.affected} of {meta.agents} agents were blocked at the same screen — {top.step} — and that one
            {top.kind === 'bug' ? ' bug' : ' issue'} accounts for most of the time lost in this run.
            {meta.personas.includes('Whale')
              ? ' Whale agents reached the event faster but none found the battle pass upgrade from inside it.'
              : ''}
          </p>
        )}
      </section>

      {/* Findings */}
      <section
        className="report-panel-host flex flex-col rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-m px-l pt-l pb-m flex-wrap">
          <SectionTitle n="02">
            What the AI players found
            <span className="font-body text-xs font-normal text-text-tertiary normal-case tracking-normal">
              ranked by agents affected
            </span>
          </SectionTitle>
          <span className="flex-1" />
          <SegmentedControl<IssueFilter>
            ariaLabel="Filter findings"
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: issues.length },
              { value: 'bug', label: 'Bugs', count: bugs },
              { value: 'friction', label: 'Friction', count: friction },
            ]}
          />
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {visible.length === 0 ? (
            <p className="font-body text-s text-text-tertiary leading-[1.6] px-l py-xl m-0">No findings of this kind.</p>
          ) : (
            visible.map((issue, i) => (
              <UserTestIssueRow
                key={issue.id}
                issue={issue}
                defaultOpen={i === 0}
                showBaseline={false}
                unitLabel="agents"
                onPlayClip={(clipIndex) => {
                  const ref = issue.clipRefs[clipIndex]
                  if (ref) onOpenSession(ref.sessionId, ref.stepIndex)
                }}
              />
            ))
          )}
        </div>
        <div
          className="flex items-center gap-s px-l py-m"
          style={{ backgroundColor: 'var(--bg-page-pale)' }}
        >
          <span className="font-body text-s text-text-secondary leading-[1.5]">
            {issues.length} findings across {sessions.length} sessions of {run.name}.
          </span>
          <span className="flex-1" />
          <Button variant="secondary" size="md">Export CSV</Button>
          <Button variant="primary" size="md">Send to Jira</Button>
        </div>
      </section>
    </div>
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
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">
          {shown.length} of {sessions.length}
        </span>
        {persona !== 'all' && PERSONA_DETAIL[persona] && (
          <>
            <span className="flex-1" />
            <span className="font-body text-xs text-text-tertiary leading-[1.5] truncate min-w-0">{PERSONA_DETAIL[persona]}</span>
          </>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="font-body text-s text-text-tertiary leading-[1.6] px-l pb-l m-0">No sessions match.</p>
      ) : (
        <div
          className="grid gap-m px-l pb-l pt-m"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', borderTop: '1px solid var(--border-subtle)' }}
        >
          {shown.map((s) => (
            <AgentSessionCard key={s.id} session={s} onOpen={onOpenSession} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ── Bits ───────────────────────────────────────────────────────────────── */

function SectionTitle({ n, children }: { n: string; children: ReactNode }) {
  return (
    <h2 className="flex items-baseline gap-s m-0 font-display text-s font-semibold text-text-primary leading-[1.5]">
      <span className="font-code text-xs font-medium text-text-tertiary">{n}</span>
      <span className="inline-flex items-baseline gap-xs flex-wrap">{children}</span>
    </h2>
  )
}

function Tile({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div
      className="flex flex-col gap-xxxs rounded-xl px-m py-s"
      style={{
        backgroundColor: highlight ? 'var(--success-bg)' : 'var(--bg-page-pale)',
        border: `1px solid ${highlight ? 'var(--testing-emerald-bg)' : 'var(--border-subtle)'}`,
      }}
    >
      <span
        className="font-display text-l font-extrabold leading-[1.1] tracking-[-0.02em]"
        style={{ color: highlight ? 'var(--success)' : 'var(--text-primary)' }}
      >
        {value}
      </span>
      <span className="font-body text-xs text-text-tertiary leading-[1.5]">{label}</span>
    </div>
  )
}

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
