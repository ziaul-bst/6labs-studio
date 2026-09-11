/**
 * TestRunThread — a run, read as a conversation.
 *
 * The request is the first message (what was asked, of how many sessions,
 * with what context). The agent answers in two beats: a progress message
 * while it reads — which session it is on, what it has noticed so far — and
 * then the report itself, posted in the thread the moment it is done. From
 * there the composer at the bottom asks *this run* questions, answered from
 * these recordings with clips as evidence (see UserTestAskPanel for why that
 * is User Test's job and not Oracle's).
 *
 * The same thread serves a User Test analysis of human sessions and an AI
 * behavioural session — only the request line and the progress noun change,
 * because the analysis is the same.
 *
 * In `question` mode the thread starts from a question asked on the home
 * screen rather than from an analysis request, and offers the full report as a
 * follow-up.
 *
 * Code-first prototype — from the revamp artifact (screen s6).
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { AnalysisProgressCard } from '../molecules/AnalysisProgressCard'
import { RunFailedNotice } from '../molecules/RunFailedNotice'
import { UserTestIssueCard } from '../molecules/UserTestIssueCard'
import { ANSWER_DELAY_MS, UserTestAskPanel, answerFor } from './UserTestAskPanel'
import Button from '../ui/Button'
import InputFieldConsole from '../ui/InputFieldConsole'
import { IssueCountPill } from '../atoms/IssueCountPill'
import { DownloadIcon } from '../icons/DownloadIcon'
import { MembersIcon } from '../icons/MembersIcon'
import { ChevronRightIcon } from '../icons/ChevronRightIcon'
import { THREAD_SO_FAR } from '../../lib/mocks/testing'
import { USER_TEST_ASK_ANSWERS, USER_TEST_ISSUES } from '../../lib/mocks/user-test'
import type { UserTestAskTurn, UserTestEvidenceRef } from '../../lib/types/userTest'

export interface TestRunThreadProps {
  title: string
  /** The opening message — what was asked for. */
  request: { headline: string; detail: string }
  agentName?: string
  agentIcon?: ReactNode
  /** Items the progress card walks through — "T01 · Pixel 7", "Whale · agent 2". */
  sessions: string[]
  /** Total in the batch, when more than the listed items. */
  totalSessions?: number
  /** Verb phrase for the progress label — "analysed" (default) or a running caption. */
  progressNoun?: string
  gameContext?: string | null
  /** Run was compared with a previous one — shows the comparison strip. */
  compared?: boolean
  /** Sample report — shown finished, labelled as a sample. */
  sample?: boolean
  inProgress: boolean
  /** The run stopped — the agent says why instead of posting a report. */
  failure?: string
  onDone?: () => void
  onBack: () => void
  /** Opens the full report screen. */
  onOpenReport?: () => void
  onOpenLibrary?: () => void
  onHandoffToOracle?: (question: string) => void
  /** Question mode: start the thread from this question instead of a request. */
  question?: string
  /** Controlled follow-up thread, so it survives leaving for the report and back. */
  askTurns?: UserTestAskTurn[]
  onAskTurnsChange?: (turns: UserTestAskTurn[]) => void
  onOpenEvidence?: (ref: UserTestEvidenceRef) => void
  className?: string
}

const TICK_MS = 1400

export function TestRunThread({
  title,
  request,
  agentName = 'User Test',
  agentIcon = <MembersIcon size={16} />,
  sessions,
  totalSessions,
  progressNoun = 'analysed',
  gameContext,
  compared = false,
  sample = false,
  inProgress,
  failure,
  onDone,
  onBack,
  onOpenReport,
  onOpenLibrary,
  onHandoffToOracle,
  question,
  askTurns,
  onAskTurnsChange,
  onOpenEvidence,
  className,
}: TestRunThreadProps) {
  const n = totalSessions ?? sessions.length
  const [step, setStep] = useState(inProgress ? 0 : sessions.length)
  const running = step < sessions.length
  const doneRef = useRef(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!running) return
    const t = window.setTimeout(() => setStep((s) => s + 1), TICK_MS)
    return () => window.clearTimeout(t)
  }, [running, step])

  useEffect(() => {
    if (!running && inProgress && !doneRef.current) {
      doneRef.current = true
      onDone?.()
      endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
    }
  }, [running, inProgress, onDone])

  const soFar = useMemo(() => {
    const keys = Object.keys(THREAD_SO_FAR).map(Number).filter((k) => k <= step)
    const last = keys.length ? Math.max(...keys) : null
    return last === null ? null : THREAD_SO_FAR[last]
  }, [step])

  /* Follow-up thread — controlled by the host when it has to survive a trip to
     the full report, otherwise owned here. Question mode seeds it with the
     question asked on the home screen and its canned answer. */
  const seededTurns = useMemo<UserTestAskTurn[]>(() => {
    if (!question) return []
    const answer =
      USER_TEST_ASK_ANSWERS[question] ??
      (/quit/i.test(question) ? USER_TEST_ASK_ANSWERS['Show me every clip where a tester quit'] : answerFor(question))
    return [{ id: 'seed', question, answer }]
  }, [question])
  const [ownTurns, setOwnTurns] = useState<UserTestAskTurn[]>(seededTurns)
  const turns = askTurns ?? ownTurns
  const turnsRef = useRef(turns)
  turnsRef.current = turns
  const setTurns = (next: UserTestAskTurn[]) => {
    if (askTurns) onAskTurnsChange?.(next)
    else setOwnTurns(next)
  }
  /* A controlled host starts empty, so the seed has to be pushed into it. */
  useEffect(() => {
    if (question && askTurns && askTurns.length === 0 && seededTurns.length) onAskTurnsChange?.(seededTurns)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question])
  const [draft, setDraft] = useState('')
  const ask = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    const id = `${Date.now()}`
    setTurns([...turnsRef.current, { id, question: trimmed, answer: null }])
    setDraft('')
    window.setTimeout(() => {
      setTurns(turnsRef.current.map((t) => (t.id === id ? { ...t, answer: answerFor(trimmed) } : t)))
    }, ANSWER_DELAY_MS)
  }

  const issues = USER_TEST_ISSUES
  const bugs = issues.filter((i) => i.kind === 'bug').length
  const friction = issues.filter((i) => i.kind === 'friction').length

  return (
    <div className={['flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      <PageTopbar
        title={title}
        onBack={onBack}
        actions={
          <>
            {/* Two facts, two pills. Status (complete, analysing) is one; what
                the run found is another, in the same IssueCountPill the history
                row uses — so the count is never green here and amber there.
                Analysing takes the brand tint, matching "In progress" in the
                history, and leaving amber to mean issues alone. */}
            {sample ? (
              <StatusPill bg="var(--bg-subtle)" ink="var(--text-secondary)">Sample</StatusPill>
            ) : question ? null : failure ? (
              <StatusPill bg="var(--error-bg)" ink="var(--error)">Failed</StatusPill>
            ) : running ? (
              <StatusPill bg="var(--bg-tint)" ink="var(--text-brand)">Analysing</StatusPill>
            ) : (
              <>
                <StatusPill bg="var(--success-bg)" ink="var(--success)">Complete</StatusPill>
                <IssueCountPill count={issues.length} />
              </>
            )}
            <Button variant="secondary" size="md" leftIcon={<DownloadIcon size={16} />}>
              Export
            </Button>
          </>
        }
      />

      {/* Same page measure as every other screen — gutters outside the cap.
          Grows to fill the screen so the composer below sits at the viewport
          bottom even when the thread is short. */}
      <div className="flex-1 w-full">
      {/* No tall bottom padding — the composer below is in flow, not floating
          over the thread, so padding for clearance would only push the last
          message off screen. */}
      <div className="flex flex-col gap-l page-measure pt-l pb-m">
        {!question && (
          <>
            {/* The request — right-aligned, brand fill, the way a sent message reads. */}
            <div className="flex justify-end w-full">
              <div
                className="flex flex-col gap-xxxs max-w-[78%] rounded-2xl px-l py-m text-white"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                <span className="font-display text-s font-semibold leading-[1.45]">{request.headline}</span>
                <span className="font-body text-xs leading-[1.5]" style={{ opacity: 0.85 }}>
                  {request.detail}
                </span>
              </div>
            </div>

            {failure && (
              <AgentMessage name={agentName} icon={agentIcon} wide>
                <RunFailedNotice
                  reason={failure}
                  saved="The recordings are untouched in the Gameplay Library — run the analysis again when the issue is fixed."
                  secondary={onOpenLibrary ? { label: 'Open the Library', onClick: onOpenLibrary } : undefined}
                />
              </AgentMessage>
            )}

            {!failure && running && (
              <AgentMessage name={agentName} icon={agentIcon}>
                <AnalysisProgressCard
                  bare
                  label={
                    step === 0
                      ? 'Starting…'
                      : progressNoun === 'analysed'
                        ? `${step} of ${n} analysed`
                        : `${progressNoun}… ${step} of ${n}`
                  }
                  percent={2 + (step / sessions.length) * 98}
                  eta={`~${Math.max(1, Math.round((sessions.length - step) * 2.5))} min`}
                  items={sessions}
                  currentIndex={step}
                  soFar={soFar}
                  onSkip={() => setStep(sessions.length)}
                />
              </AgentMessage>
            )}

            {!failure && !running && (
              <AgentMessage name={agentName} icon={agentIcon} wide>
                <div
                  className="flex flex-col w-full rounded-2xl overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-s px-l pt-l pb-m">
                    <span
                      className="flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-xl text-white"
                      style={{ background: 'linear-gradient(135deg, #4D8FF5 0%, #1770EF 100%)' }}
                      aria-hidden
                    >
                      {agentIcon}
                    </span>
                    <span className="flex flex-col gap-xxxs min-w-0">
                      <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">{agentName}</span>
                      <span className="font-body text-s text-text-secondary leading-[1.5]">
                        Analysed {n} sessions{gameContext ? ` · ${gameContext}` : ' · no game context'}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenLibrary}
                    className="run-history-row flex items-center gap-xs px-l py-s text-left font-body text-s"
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-page-pale)',
                    }}
                  >
                    <span className="font-semibold text-text-primary">Sources</span>
                    <span className="text-text-tertiary">· {n} videos</span>
                    <span className="text-text-tertiary" aria-hidden>
                      <ChevronRightIcon size={14} />
                    </span>
                  </button>

                  <div className="flex flex-col gap-m px-l py-l">
                    <div className="grid gap-s" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                      <Tile value={String(n)} label="sessions analysed" />
                      <Tile value={String(issues.length)} label="issues found" />
                      <Tile value={`${bugs} · ${friction}`} label="bugs · friction" />
                      <Tile value="6 / 10" label="completed onboarding" delta={compared ? '↑ from 3/6' : undefined} highlight />
                      <Tile value="7 / 10" label="hit the Furnace bug" />
                      <Tile value="2h 14m" label="footage reviewed" />
                    </div>
                    <p className="font-body text-s text-text-secondary leading-[1.7] max-w-[92ch]">
                      Seven of ten sessions were blocked at the same step — the Furnace upgrade — and that one
                      bug accounts for most of the time lost in this batch.
                      {compared ? ' The three fixes from the previous run all held.' : ''}
                    </p>
                  </div>

                  <div className="flex flex-col gap-xs px-xs pb-xs" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="flex items-baseline gap-xs px-m pt-m font-display text-s font-semibold text-text-primary">
                      What {agentName} found
                      <span className="font-body text-xs font-normal text-text-tertiary">ranked by testers affected</span>
                    </span>
                    {issues.slice(0, 4).map((issue) => (
                      <UserTestIssueCard key={issue.id} issue={issue} onClick={onOpenReport} baselineLabel="the previous run" />
                    ))}
                  </div>

                  <div
                    className="flex items-center gap-s px-l py-m"
                    style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page-pale)' }}
                  >
                    <span className="font-body text-s text-text-secondary leading-[1.5]">
                      {issues.length - 4} more findings, every clip, by tester and by game step.
                    </span>
                    <span className="flex-1" />
                    <Button variant="secondary" size="md">Export to Jira</Button>
                    <Button variant="primary" size="md" onClick={onOpenReport}>Open the full report</Button>
                  </div>
                </div>
              </AgentMessage>
            )}
          </>
        )}

        {/* Follow-ups — answered by this agent from this run's recordings. The
            composer itself is pinned below, like an Oracle response. */}
        {!failure && (!running || question || turns.length > 0) && (
          <div className="flex flex-col gap-s w-full">
            <UserTestAskPanel
              hideHeading
              hideComposer
              framed
              onAsk={ask}
              sessionCount={n}
              turns={turns}
              onTurnsChange={setTurns}
              onOpenEvidence={onOpenEvidence}
              onHandoffToOracle={onHandoffToOracle}
              className="px-0 py-0"
            />
            {question && onOpenReport && (
              <div
                className="flex items-center gap-s rounded-xl px-m py-s"
                style={{ backgroundColor: 'var(--bg-tint-light)', border: '1px solid var(--border-tint)' }}
              >
                <span className="font-body text-s text-text-secondary leading-[1.5]">
                  Want the full report on these {n} videos?
                </span>
                <span className="flex-1" />
                <Button variant="primary" size="md" onClick={onOpenReport}>Generate it</Button>
              </div>
            )}
          </div>
        )}
        <div ref={endRef} aria-hidden />
      </div>
      </div>

      {/* Nothing to ask about a run that read nothing. */}
      {!failure && (
        <div className="sticky bottom-0 w-full flex justify-center py-m oracle-input-overlay">
          <InputFieldConsole
            value={draft}
            onChange={setDraft}
            onSubmit={() => ask(draft)}
            placeholder={
              running
                ? `Ask ${agentName} about the sessions analysed so far…`
                : `Ask ${agentName} about these ${n} sessions…`
            }
            hideSources
            className="page-measure"
          />
        </div>
      )}
    </div>
  )
}

function AgentMessage({ name, icon, wide, children }: { name: string; icon: ReactNode; wide?: boolean; children: ReactNode }) {
  return (
    <div className={['flex flex-col gap-xs', wide ? 'w-full' : 'max-w-[78%] w-full'].join(' ')}>
      <span className="flex items-center gap-xs font-body text-xs text-text-secondary">
        <span className="text-text-brand" aria-hidden>{icon}</span>
        <span className="font-display font-semibold text-text-primary">{name}</span>
      </span>
      {wide ? (
        children
      ) : (
        <div
          className="rounded-2xl px-l py-m"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function Tile({ value, label, delta, highlight }: { value: string; label: string; delta?: string; highlight?: boolean }) {
  return (
    <div
      className="flex flex-col gap-xxxs rounded-xl px-m py-s"
      style={{
        backgroundColor: highlight ? 'var(--success-bg)' : 'var(--bg-page-pale)',
        border: `1px solid ${highlight ? 'rgba(22,163,74,0.25)' : 'var(--border-subtle)'}`,
      }}
    >
      <span
        className="flex items-baseline gap-xs font-display text-l font-extrabold leading-[1.1] tracking-[-0.02em]"
        style={{ color: highlight ? 'var(--success)' : 'var(--text-primary)' }}
      >
        {value}
        {delta && <span className="font-body text-xs font-medium" style={{ color: 'var(--success)' }}>{delta}</span>}
      </span>
      <span className="font-body text-xs text-text-tertiary leading-[1.5]">{label}</span>
    </div>
  )
}

function StatusPill({ bg, ink, children }: { bg: string; ink: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-s py-xxs rounded-round font-body text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: bg, color: ink }}
    >
      {children}
    </span>
  )
}
