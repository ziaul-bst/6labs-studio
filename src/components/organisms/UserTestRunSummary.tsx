/**
 * UserTestRunSummary — what a finished run says, before anyone opens the report.
 *
 * The run is the page; the report is a leaf of it. So this screen answers three
 * questions in the order a reader has them — how big was this, what did it
 * find, what do I do now — and then gets out of the way. Everything that would
 * qualify a finding rather than state it (clips, per-tester tables, the
 * comparison) lives in the full report, one click down.
 *
 * The previous version carried a right rail of qualifiers. It was dropped: the
 * rail competed with the findings for the same first screenful, and every panel
 * in it was a detail of something the report already states properly. What
 * survives is the one line the rail carried that nothing else does — what the
 * run could *not* see — because a report that never names its blind spots is a
 * claim.
 *
 * Code-first prototype — from the reference flow (user-test-agent-flow v128).
 */

import { useState, type ReactNode } from 'react'
import { UserTestIssueCard } from '../molecules/UserTestIssueCard'
import { PageTopbar } from '../molecules/PageTopbar'
import { UserTestAskPanel } from './UserTestAskPanel'
import Button from '../ui/Button'
import { ChevronRightIcon } from '../icons/ChevronRightIcon'
import type { UserTestAskTurn, UserTestEvidenceRef, UserTestIssue } from '../../lib/types/userTest'

/** One fact in the line under the title — what the numbers must be read against. */
export interface RunSummaryFacts {
  /** "10 videos · tag Build V2.1" */
  videos: string
  /** Game understanding document, or null when the run had none. */
  context: string | null
  /** "Pixel 7 · iPhone 13 · Galaxy S23" */
  devices?: string
  /** "Aug 26 · 31 min" */
  when: string
}

export interface UserTestRunSummaryProps {
  runName: string
  issues: UserTestIssue[]
  /** How many of the ranked findings to show before the "see all" row. */
  previewCount?: number
  facts?: RunSummaryFacts
  /** Sessions read, and how much footage that was — the two size tiles. */
  sessionCount?: number
  footageLabel?: string
  /**
   * The one paragraph the tiles exist to size. Written per run; the default is
   * the sample batch's.
   */
  headline?: ReactNode
  /** Follow-up thread, owned by the host so it survives the trip to the report. */
  askTurns?: UserTestAskTurn[]
  onAskTurnsChange?: (turns: UserTestAskTurn[]) => void
  onBack?: () => void
  onOpenReport?: () => void
  onOpenEvidence?: (ref: UserTestEvidenceRef) => void
  onHandoffToOracle?: (question: string) => void
  className?: string
}

const DEFAULT_FACTS: RunSummaryFacts = {
  videos: '10 videos · tag Build V2.1',
  context: 'Onboarding flow v3',
  devices: 'Pixel 7 · iPhone 13 · Galaxy S23',
  when: 'Aug 26 · 31 min',
}

const DEFAULT_HEADLINE =
  'The Furnace-upgrade tap failure blocked 7 of 9 sessions — the single most impactful finding this run. It accounts for roughly 38% of the time lost across the batch.'

export function UserTestRunSummary({
  runName,
  issues,
  previewCount = 4,
  facts = DEFAULT_FACTS,
  sessionCount = 10,
  footageLabel = '2h 14m',
  headline = DEFAULT_HEADLINE,
  askTurns,
  onAskTurnsChange,
  onBack,
  onOpenReport,
  onOpenEvidence,
  onHandoffToOracle,
  className,
}: UserTestRunSummaryProps) {
  const bugs = issues.filter((i) => i.kind === 'bug').length
  const friction = issues.filter((i) => i.kind === 'friction').length
  /* Uncontrolled fallback, so the component stands alone in Storybook. */
  const [localTurns, setLocalTurns] = useState<UserTestAskTurn[]>([])
  const turns = askTurns ?? localTurns
  const setTurns = onAskTurnsChange ?? setLocalTurns

  return (
    <div className={['flex flex-col w-full', className].filter(Boolean).join(' ')}>
      {/* The run names itself once, in the bar, with the test as its parent. */}
      <PageTopbar
        title={runName}
        trail={[{ label: 'User Test' }]}
        onBack={() => onBack?.()}
        actions={<Button variant="secondary" size="md">Share</Button>}
      />

      <div className="flex flex-col gap-m page-measure pt-l pb-xxl3">
        {/* What the run was — the facts the numbers below have to be read against. */}
        <div className="flex flex-wrap items-center gap-s font-body text-xs text-text-tertiary leading-[1.5]">
          <span
            className="inline-flex items-center gap-xxs font-medium"
            style={{ color: 'var(--success)' }}
          >
            <span
              className="w-[6px] h-[6px] rounded-round"
              style={{ backgroundColor: 'var(--success)' }}
              aria-hidden
            />
            Complete
          </span>
          <span>{facts.videos}</span>
          <span>
            {facts.context ? (
              <>
                Context:{' '}
                <strong className="font-semibold text-text-secondary">{facts.context}</strong>
              </>
            ) : (
              'No game context — findings are per video, not per step'
            )}
          </span>
          {facts.devices && <span>{facts.devices}</span>}
          <span>{facts.when}</span>
        </div>

        <Panel>
          <Section number="01" title="Summary">
            <div className="stat-tiles gap-s">
              <Tile value={String(sessionCount)} label="sessions" />
              <Tile value={footageLabel} label="footage reviewed" />
              <Tile value={String(bugs)} label="bugs" dot="var(--error)" />
              <Tile value={String(friction)} label="friction points" dot="var(--warning)" />
            </div>
            <p className="font-body text-s font-normal text-text-secondary leading-[1.7] pt-m max-w-[92ch]">
              {headline}
            </p>
          </Section>

          <Section number="02" title="Top findings" hint="ranked by sessions affected" divided>
            <div className="flex flex-col gap-xxs">
              {issues.slice(0, previewCount).map((issue) => (
                <UserTestIssueCard key={issue.id} issue={issue} onClick={onOpenReport} />
              ))}
            </div>
            {issues.length > previewCount && (
              <button
                type="button"
                onClick={onOpenReport}
                className="flex items-center gap-xxs self-start mt-xs px-l font-body text-s font-semibold text-text-brand leading-[1.5] hover:underline"
              >
                {issues.length - previewCount} more findings, ranked below these
                <ChevronRightIcon size={16} />
              </button>
            )}
            {/* The one qualifier the report cannot state for itself: a finding
                that was never looked for does not appear anywhere downstream.
                Ruled off, so it reads as a caveat on the list rather than as
                one more thing in it. */}
            <p
              className="font-body text-xs text-text-tertiary leading-[1.6] mx-l pt-m max-w-[92ch]"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              Not evaluated: audio cues, network latency and device performance — these recordings
              carry no audio track or device telemetry.
            </p>
          </Section>

          {/* The way down to the evidence. One row, because it is one decision,
              and inside the card because it is part of the same document. */}
          <div
            className="flex items-center gap-m mx-l mb-l rounded-2xl px-l py-m"
            style={{ backgroundColor: 'var(--bg-tint-light)', border: '1px solid var(--border-tint)' }}
          >
            <span
              className="flex items-center justify-center shrink-0 w-9 h-9 rounded-m text-text-brand"
              style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-tint)' }}
              aria-hidden
            >
              <ReportGlyph />
            </span>
            <span className="flex flex-col gap-xxxs flex-1 min-w-0">
              <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
                View full report
              </span>
              <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                Every finding, its clips and a recommendation — grouped by what you would fix together.
              </span>
            </span>
            <Button variant="primary" size="md" onClick={onOpenReport}>
              Open
            </Button>
          </div>

          {/* Asking comes after reading — you cannot question a result you have
              not seen — but it stays on this page so the answer sits next to
              the numbers it is about. */}
          <Section number="03" title="Ask about this run" divided>
            <p className="font-body text-xs text-text-tertiary leading-[1.6] max-w-[92ch] -mt-xs">
              Answered from this run's {sessionCount} recordings and {issues.length} findings, with
              the clip behind every claim. Questions that need live player data hand off to Oracle
              with the finding attached.
            </p>
            <UserTestAskPanel
              sessionCount={sessionCount}
              turns={turns}
              onTurnsChange={setTurns}
              hideHeading
              framed
              onOpenEvidence={onOpenEvidence}
              onHandoffToOracle={onHandoffToOracle}
            />
          </Section>
        </Panel>
      </div>
    </div>
  )
}

/* ── Building blocks ─────────────────────────────────────────────────────── */

function Panel({ children }: { children: ReactNode }) {
  return (
    <div
      className="summary-panel-host flex flex-col w-full rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      {children}
    </div>
  )
}

function Section({
  number,
  title,
  hint,
  divided,
  children,
}: {
  number: string
  title: string
  hint?: string
  divided?: boolean
  children: ReactNode
}) {
  return (
    <section
      className="flex flex-col gap-m px-l py-l"
      style={divided ? { borderTop: '1px solid var(--border-subtle)' } : undefined}
    >
      <h2 className="flex items-baseline gap-xs font-display text-m font-semibold text-text-primary leading-[1.4]">
        <span className="font-code text-xs font-normal text-text-brand">{number}</span>
        {title}
        {hint && <span className="font-body text-xs font-normal text-text-tertiary">{hint}</span>}
      </h2>
      {children}
    </section>
  )
}

function Tile({ value, label, dot }: { value: string; label: string; dot?: string }) {
  return (
    <div
      className="flex flex-col gap-xxxs rounded-xl px-m py-s"
      style={{ backgroundColor: 'var(--bg-page-pale)', border: '1px solid var(--border-subtle)' }}
    >
      <span className="flex items-center gap-xs font-display text-l font-semibold text-text-primary leading-[1.3]">
        {dot && (
          <span
            className="w-[8px] h-[8px] rounded-round shrink-0"
            style={{ backgroundColor: dot }}
            aria-hidden
          />
        )}
        {value}
      </span>
      <span className="font-body text-xs text-text-tertiary leading-[1.5]">{label}</span>
    </div>
  )
}

function ReportGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6M10 17h6" />
    </svg>
  )
}
