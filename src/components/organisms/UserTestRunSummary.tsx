/**
 * UserTestRunSummary — what a finished run says, before anyone opens the report.
 *
 * Three sections, in the order a reader needs them: what happened, what was
 * found, what to do next. The ranked findings sit in the middle because they
 * are the answer; the tiles above exist to size that answer, and the actions
 * below exist so the screen ends in a decision rather than a scroll.
 *
 * The right rail holds everything that qualifies the findings rather than
 * stating them — the comparison against the previous batch, the run's own
 * settings, how to read the two kinds of finding, and, deliberately last, what
 * the run could *not* see. Naming the blind spots on the summary rather than in
 * a footnote is the difference between a report and a claim.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ReactNode } from 'react'
import { UserTestIssueCard } from '../molecules/UserTestIssueCard'
import { IssueKindTag } from '../atoms/IssueKindTag'
import { PageTopbar } from '../molecules/PageTopbar'
import Button from '../ui/Button'
import { ChevronRightIcon } from '../icons/ChevronRightIcon'
import { AISparkleIcon } from '../icons/AISparkleIcon'
import type { UserTestIssue } from '../../lib/types/userTest'

export interface UserTestRunSummaryProps {
  runName: string
  issues: UserTestIssue[]
  /** How many of the ranked findings to show before the "see all" row. */
  previewCount?: number
  onBack?: () => void
  onOpenReport?: () => void
  onOpenComparison?: () => void
  onNewRun?: () => void
  /** Opens the docked Q&A — the conversation itself lives outside this screen. */
  onOpenAsk?: () => void
  className?: string
}

export function UserTestRunSummary({
  runName,
  issues,
  previewCount = 4,
  onBack,
  onOpenReport,
  onOpenComparison,
  onNewRun,
  onOpenAsk,
  className,
}: UserTestRunSummaryProps) {
  const bugs = issues.filter((i) => i.kind === 'bug').length
  const friction = issues.filter((i) => i.kind === 'friction').length

  return (
    <div className={['flex flex-col w-full', className].filter(Boolean).join(' ')}>
      {/* Run-details header — the same 56px bar the chat-details page uses. It
          names the run once and holds the run-level actions; the identity block
          that used to sit here repeated the title the reader had just clicked. */}
      <PageTopbar title={runName} onBack={() => onBack?.()} actions={
        <>
          <Button variant="secondary" size="md">Share</Button>
          <Button variant="primary" size="md" onClick={onNewRun}>
            Run again with new batch
          </Button>
        </>
      } />

      <div className="run-summary-host flex flex-col gap-m page-measure pt-l pb-xxl3">
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
          <span>10 videos · tag <strong className="font-semibold text-text-secondary">ut-batch-2</strong></span>
          <span>Bugs + UX issues</span>
          <span>Ran Aug 26 · 31 min</span>
        </div>

        <button
          type="button"
          onClick={onOpenAsk}
          className="user-test-ask-banner flex items-center gap-s w-full text-left rounded-xl px-m py-s"
          style={{
            backgroundColor: 'var(--bg-tint-light)',
            border: '1px solid var(--border-tint)',
          }}
        >
          <span
            className="flex items-center justify-center shrink-0 w-7 h-7 rounded-round text-white"
            style={{ background: 'linear-gradient(135deg, #7B4CFF 0%, #5A2FD0 100%)' }}
            aria-hidden
          >
            <AISparkleIcon size={16} />
          </span>
          <span className="flex flex-col gap-xxxs flex-1 min-w-0">
            <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
              Ask User Test about this run
            </span>
            <span className="font-body text-xs text-text-tertiary leading-[1.5]">
              Answered from these 10 recordings and 7 findings, with the clip behind every claim.
              Questions needing live player data hand off to Oracle.
            </span>
          </span>
          <span className="shrink-0 text-text-brand">
            <ChevronRightIcon size={16} />
          </span>
        </button>

      {/* ── Body: findings + qualifiers ── */}
      <div className="run-summary-body gap-l w-full items-start">
        <div className="flex flex-col gap-l min-w-0">
          <Panel>
            <Section number="01" title="What happened">
              <div className="stat-tiles gap-s">
                <Tile value="10" label="tester recordings" />
                <Tile value="2h 14m" label="footage reviewed" />
                <Tile value="7" label="issues found" />
                <Tile value={String(bugs)} label="bugs · verified" dot="var(--error)" />
                <Tile value={String(friction)} label="friction · with confidence" dot="var(--warning)" />
                <Tile value="6 / 10" label="completed onboarding" delta="↑ from 3/6" highlight />
              </div>
              <p className="font-body text-s font-normal text-text-secondary leading-[1.7] pt-m max-w-[92ch]">
                Seven of ten testers were blocked at the same step — the Furnace upgrade — and that
                one bug accounts for most of the time lost in this batch. The three fixes from batch
                1 all held.
              </p>
            </Section>

            <Section
              number="02"
              title="What User Test found"
              hint="ranked by testers affected"
              divided
            >
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
            </Section>

            <Section number="03" title="What to do next" divided>
              <div className="flex flex-col gap-xs">
                <NextAction
                  title="Open the full report"
                  detail="Every issue, every clip, by tester and by game step"
                  primary
                  onClick={onOpenReport}
                />
                <NextAction
                  title="Export to Jira"
                  detail="7 tickets with counts and evidence clips as links"
                />
              </div>
            </Section>


          </Panel>
        </div>

        {/* ── Right rail ── */}
        <div className="flex flex-col gap-s min-w-0">
          <RailPanel title="Since batch 1 (Aug 12)">
            <KeyValue label="New issues" value="2" valueColor="var(--error)" />
            <KeyValue label="Still open" value="4" valueClass="issue-amber-ink" />
            <KeyValue label="Fixed" value="3" valueColor="var(--success)" />
            <KeyValue label="Completed onboarding" value="6/10" delta="↑ from 3/6" />
            <button
              type="button"
              onClick={onOpenComparison}
              className="flex items-center gap-xxs pt-xs font-body text-s font-semibold text-text-brand leading-[1.5] hover:underline"
            >
              See what changed
              <ChevronRightIcon size={16} />
            </button>
          </RailPanel>

          <RailPanel title="Run details">
            <KeyValue label="Videos" value="10 · tag Build V2.1" />
            <KeyValue label="Scope" value="Bugs + UX issues" />
            <KeyValue label="Game understanding" value="Onboarding flow v3" />
            <KeyValue label="Compared against" value="Batch 1 (Aug 12)" />
            <KeyValue label="Devices" value="Pixel 7 · iPhone 13 · Galaxy S23" />
            <KeyValue label="Run time" value="31 min" />
          </RailPanel>

          <RailPanel title="How to read this">
            <div className="flex gap-xs items-start">
              <IssueKindTag kind="bug" />
              <span className="font-body text-xs text-text-secondary leading-[1.6]">
                Observable in the clip. Timestamped, reproducible, safe to file as-is.
              </span>
            </div>
            <div className="flex gap-xs items-start">
              <IssueKindTag kind="friction" />
              <span className="font-body text-xs text-text-secondary leading-[1.6]">
                Inferred from behaviour (repeat taps, backtracking, hesitation). Check the clip
                before acting on it.
              </span>
            </div>
          </RailPanel>

          <RailPanel title="Not observable">
            <p className="font-body text-xs text-text-secondary leading-[1.6]">
              Audio cues, network latency, and device performance were not evaluated — recordings
              carry no audio track or device telemetry.
            </p>
          </RailPanel>
        </div>
      </div>
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
        {hint && (
          <span className="font-body text-xs font-normal text-text-tertiary">{hint}</span>
        )}
      </h2>
      {children}
    </section>
  )
}

function Tile({
  value,
  label,
  dot,
  delta,
  highlight,
}: {
  value: string
  label: string
  dot?: string
  delta?: string
  highlight?: boolean
}) {
  return (
    <div
      className="flex flex-col gap-xxxs rounded-xl px-m py-s"
      style={{
        backgroundColor: highlight ? 'var(--bg-tint-light)' : 'var(--bg-page-pale)',
        border: `1px solid ${highlight ? 'var(--border-tint)' : 'var(--border-subtle)'}`,
      }}
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
      <span className="font-body text-xs text-text-tertiary leading-[1.5]">
        {label}
        {delta && (
          <span className="font-medium" style={{ color: 'var(--success)' }}>
            {' '}
            {delta}
          </span>
        )}
      </span>
    </div>
  )
}

function NextAction({
  title,
  detail,
  primary,
  onClick,
}: {
  title: string
  detail: string
  primary?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="user-test-next flex items-center gap-m w-full text-left rounded-xl px-m py-s"
      style={{
        backgroundColor: primary ? 'var(--bg-tint-light)' : 'var(--bg-page-pale)',
        border: `1px solid ${primary ? 'var(--border-tint)' : 'var(--border-subtle)'}`,
      }}
    >
      <span className="flex flex-col gap-xxxs flex-1 min-w-0">
        <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
          {title}
        </span>
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">{detail}</span>
      </span>
      <span className="shrink-0 text-text-brand">
        <ChevronRightIcon size={16} />
      </span>
    </button>
  )
}

function RailPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="flex flex-col gap-xs rounded-2xl px-m py-m"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      <h3 className="font-display text-s font-semibold text-text-primary leading-[1.45]">
        {title}
      </h3>
      {children}
    </div>
  )
}

function KeyValue({
  label,
  value,
  valueColor,
  valueClass,
  delta,
}: {
  label: string
  value: string
  valueColor?: string
  /** Use when the ink has to flip with the theme — see .issue-amber-ink. */
  valueClass?: string
  delta?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-s">
      <span className="font-body text-xs text-text-tertiary leading-[1.6]">{label}</span>
      <span
        className={['font-display text-xs font-semibold leading-[1.6] text-right', valueClass]
          .filter(Boolean)
          .join(' ')}
        style={valueClass ? undefined : { color: valueColor ?? 'var(--text-primary)' }}
      >
        {value}
        {delta && (
          <span className="font-body font-medium" style={{ color: 'var(--success)' }}>
            {' '}
            {delta}
          </span>
        )}
      </span>
    </div>
  )
}
