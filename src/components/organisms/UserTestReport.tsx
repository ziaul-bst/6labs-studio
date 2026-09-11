/**
 * UserTestReport — the same run, cut four ways.
 *
 * Issues is the default because the ranked list is the answer. The other three
 * cuts exist because different readers arrive with a different question:
 *   By tester    — QA reproducing a specific session.
 *   By game step — design asking which part of the flow is costing players.
 *   vs batch 1   — anyone who needs to know whether last sprint's fixes held.
 *
 * The step and comparison tabs both carry a caveat under the table rather than
 * beside it. They apply to the whole table, and a note that can be skipped past
 * on the way to the numbers is not a caveat.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useState } from 'react'
import type { ReactNode } from 'react'
import { UserTestIssueRow } from '../molecules/UserTestIssueRow'
import { PageTopbar } from '../molecules/PageTopbar'
import { SegmentedControl } from '../atoms/SegmentedControl'
import Button from '../ui/Button'
import {
  USER_TEST_COMPARISON_ROWS,
  USER_TEST_COMPARISON_STATS,
  USER_TEST_STEPS,
  USER_TEST_TESTERS,
} from '../../lib/mocks/user-test'
import type {
  ComparisonChange,
  UserTestComparisonRow,
  UserTestIssue,
} from '../../lib/types/userTest'

export type ReportTab = 'issues' | 'testers' | 'steps' | 'comparison'

export interface UserTestReportProps {
  runName: string
  /** Shown in the topbar — the report's own name, not the run's. */
  reportName?: string
  issues: UserTestIssue[]
  /** Which cut to land on — a "see what changed" link arrives on `comparison`. */
  tab?: ReportTab
  onTabChange?: (tab: ReportTab) => void
  /** Leaves the report for the run it belongs to. */
  onBackToRun?: () => void
  /** Opens a tester's recording — the "By tester" table's only action. */
  onOpenSession?: (testerId: string) => void
  className?: string
}

type IssueFilter = 'all' | 'bug' | 'friction' | 'new'

/** Counted from the data, so a filter can never claim a number the list can't show. */
function filterOptions(issues: UserTestIssue[]) {
  return [
    { value: 'all' as const, label: 'All', count: issues.length },
    { value: 'bug' as const, label: 'Bugs', count: issues.filter((i) => i.kind === 'bug').length },
    {
      value: 'friction' as const,
      label: 'Friction',
      count: issues.filter((i) => i.kind === 'friction').length,
    },
    {
      value: 'new' as const,
      label: 'New',
      count: issues.filter((i) => i.status === 'new').length,
    },
  ]
}

function applyFilter(issues: UserTestIssue[], filter: IssueFilter) {
  if (filter === 'all') return issues
  if (filter === 'new') return issues.filter((i) => i.status === 'new')
  return issues.filter((i) => i.kind === filter)
}

export function UserTestReport({
  runName,
  reportName = 'Report — Onboarding UT, batch 2',
  issues,
  tab,
  onTabChange,
  onBackToRun,
  onOpenSession,
  className,
}: UserTestReportProps) {
  const [internalTab, setInternalTab] = useState<ReportTab>('issues')
  const [filter, setFilter] = useState<IssueFilter>('all')
  const activeTab = tab ?? internalTab
  const setTab = (next: ReportTab) => {
    setInternalTab(next)
    onTabChange?.(next)
  }

  const visibleIssues = applyFilter(issues, filter)

  const tabs: { id: ReportTab; label: string }[] = [
    { id: 'issues', label: `Issues (${issues.length})` },
    { id: 'testers', label: `By tester (${USER_TEST_TESTERS.length})` },
    { id: 'steps', label: 'By game step' },
    { id: 'comparison', label: 'vs batch 1' },
  ]

  return (
    <div className={['flex flex-col w-full', className].filter(Boolean).join(' ')}>
      {/* Report-details header — same shape as the Oracle chat-details header.
          The report is a leaf: it has one place to go back to, and its two
          exports are the only page-level actions, so the 56px bar carries the
          whole header rather than an agent identity block repeating the run
          title the reader just came from. */}
      <PageTopbar
        title={reportName}
        onBack={() => onBackToRun?.()}
        actions={
          <>
            <Button variant="secondary" size="md">Export CSV</Button>
            <Button variant="primary" size="md">Send to Jira</Button>
          </>
        }
      />

      <div className="flex flex-col gap-m page-measure pt-l pb-xxl3">
        {/* The run this report reads — the topbar names the report, not the batch. */}
        <p className="font-body text-xs text-text-tertiary leading-[1.5]">
          {runName}
        </p>

        {/* ── Panel ── */}
        <div
          className="report-panel-host flex flex-col w-full rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="flex items-center gap-l px-l"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
            role="tablist"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setTab(t.id)}
                className="user-test-tab font-display text-s font-semibold whitespace-nowrap"
                style={{
                  padding: '14px 2px',
                  marginBottom: -1,
                  borderBottom: `2px solid ${activeTab === t.id ? 'var(--brand)' : 'transparent'}`,
                  color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'issues' && (
            <>
              <div
                className="flex items-center gap-xs px-l py-s"
                style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page-pale)' }}
              >
                <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                  Sorted by testers affected
                </span>
                <span className="flex-1" />
                <SegmentedControl
                  ariaLabel="Filter findings"
                  size="sm"
                  options={filterOptions(issues)}
                  value={filter}
                  onChange={setFilter}
                />
              </div>
              {visibleIssues.length === 0 ? (
                <p className="font-body text-s text-text-tertiary leading-[1.6] px-l py-xl">
                  No findings match this filter.
                </p>
              ) : (
                visibleIssues.map((issue, i) => (
                  <UserTestIssueRow key={issue.id} issue={issue} defaultOpen={i === 0} />
                ))
              )}
            </>
          )}

          {activeTab === 'testers' && <TesterTable onOpenSession={onOpenSession} />}
          {activeTab === 'steps' && <StepTable />}
          {activeTab === 'comparison' && <ComparisonTable />}
        </div>
      </div>
    </div>
  )
}

/* ── By tester ───────────────────────────────────────────────────────────── */

const TESTER_GRID = '80px 1fr 1.4fr 1.2fr 80px'

function TesterTable({ onOpenSession }: { onOpenSession?: (testerId: string) => void }) {
  return (
    <div className="flex flex-col w-full overflow-x-auto">
      <TableHead
        grid={TESTER_GRID}
        minWidth={720}
        cells={['Tester', 'Device', 'Completed onboarding', 'Issues hit', 'Video']}
      />
      {USER_TEST_TESTERS.map((t) => (
        <div
          key={t.id}
          className="grid items-center gap-m px-l py-s"
          style={{ minWidth: 720, gridTemplateColumns: TESTER_GRID, borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="font-display text-s font-semibold text-text-primary leading-[1.5]">{t.id}</span>
          <span className="font-body text-s text-text-secondary leading-[1.5]">{t.device}</span>
          <span
            className="font-body text-s leading-[1.5]"
            style={{ color: t.completed ? 'var(--text-secondary)' : 'var(--error)' }}
          >
            {t.completionLabel}
          </span>
          <span className="font-body text-s text-text-secondary leading-[1.5]">{t.issues.join(', ')}</span>
          <button
            type="button"
            onClick={() => onOpenSession?.(t.id)}
            className="justify-self-start font-body text-s font-semibold text-text-brand leading-[1.5] hover:underline"
          >
            Open
          </button>
        </div>
      ))}
    </div>
  )
}

/* ── By game step ────────────────────────────────────────────────────────── */

const STEP_GRID = '1.8fr 1fr 1fr 1.2fr 1.2fr'

function StepTable() {
  return (
    <div className="flex flex-col w-full overflow-x-auto">
      <TableHead
        grid={STEP_GRID}
        minWidth={760}
        cells={['Game step (from game understanding)', 'Testers reached', 'Issues', 'Avg time on step', 'Drop-off']}
      />
      {USER_TEST_STEPS.map((s) => (
        <div
          key={s.step}
          className="grid items-center gap-m px-l py-s"
          style={{ minWidth: 760, gridTemplateColumns: STEP_GRID, borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="font-display text-s font-semibold text-text-primary leading-[1.5]">{s.step}</span>
          <span className="font-body text-s text-text-secondary leading-[1.5]">{s.reached}</span>
          <span
            className="font-body text-s leading-[1.5]"
            style={{
              color: s.critical ? 'var(--error)' : 'var(--text-secondary)',
              fontWeight: s.critical ? 600 : 400,
            }}
          >
            {s.issues.length ? s.issues.join(', ') : '—'}
          </span>
          <span
            className="font-body text-s leading-[1.5]"
            style={{
              color: s.critical ? 'var(--error)' : 'var(--text-secondary)',
              fontWeight: s.critical ? 600 : 400,
            }}
          >
            {s.avgTime}
          </span>
          <span
            className="font-body text-s leading-[1.5]"
            style={{
              color: s.dropOff === '0' ? 'var(--text-secondary)' : 'var(--error)',
              fontWeight: s.dropOff === '0' ? 400 : 600,
            }}
          >
            {s.dropOff}
          </span>
        </div>
      ))}
      <Caveat>
        Step names come from the game understanding document attached to the run. If steps drift
        between runs, the “since batch 1” comparison degrades — keep the document stable across
        batches.
      </Caveat>
    </div>
  )
}

/* ── vs batch 1 ──────────────────────────────────────────────────────────── */

const CMP_GRID = '110px 1.6fr 1fr 1.2fr 1fr'

const CHANGE_META: Record<
  ComparisonChange,
  { label: string; color?: string; bg: string; inkClass?: string }
> = {
  new: { label: 'New', color: 'var(--error)', bg: 'var(--error-bg)' },
  open: { label: 'Still open', bg: 'var(--warning-bg)', inkClass: 'issue-amber-ink' },
  fixed: { label: 'Fixed', color: 'var(--success)', bg: 'var(--success-bg)' },
  'not-comparable': { label: 'No baseline', color: 'var(--text-tertiary)', bg: 'var(--bg-subtle)' },
}

const DELTA_COLOR = {
  good: 'var(--success)',
  bad: 'var(--error)',
  neutral: 'var(--text-tertiary)',
} as const

function ComparisonTable() {
  return (
    <div className="flex flex-col w-full overflow-x-auto">
      <div
        className="flex items-center gap-xs px-l py-s"
        style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page-pale)' }}
      >
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">
          Batch 2 (Aug 26, 10 testers) compared with batch 1 (Aug 12, 6 testers) · matched by game
          step and issue signature
        </span>
      </div>

      <div
        className="grid gap-s px-l py-m"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {USER_TEST_COMPARISON_STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-xxxs rounded-xl px-m py-s"
            style={{ backgroundColor: 'var(--bg-page-pale)', border: '1px solid var(--border-subtle)' }}
          >
            <span className="font-body text-xs font-medium text-text-tertiary leading-[1.5]">
              {s.label}
            </span>
            <span className="font-display text-l font-semibold text-text-primary leading-[1.3]">
              {s.value}
            </span>
            {s.delta && (
              <span
                className="font-body text-xs font-medium leading-[1.5]"
                style={{ color: DELTA_COLOR[s.deltaTone ?? 'neutral'] }}
              >
                {s.delta}
              </span>
            )}
          </div>
        ))}
      </div>

      <TableHead
        grid={CMP_GRID}
        minWidth={860}
        cells={['Change', 'Issue', 'Batch 1', 'Batch 2', 'Step']}
      />
      {USER_TEST_COMPARISON_ROWS.map((row) => (
        <ComparisonRow key={row.title} row={row} />
      ))}

      <Caveat>
        Percentages compare 6 and 10 testers — small samples. A shift from 67% to 50% is one tester.
        Treat direction as signal, magnitude as noise until batch sizes reach ~20.
      </Caveat>
    </div>
  )
}

function ComparisonRow({ row }: { row: UserTestComparisonRow }) {
  const meta = CHANGE_META[row.change]

  if (row.change === 'not-comparable') {
    return (
      <div
        className="grid items-center gap-m px-l py-s"
        style={{ minWidth: 860, gridTemplateColumns: CMP_GRID, borderTop: '1px solid var(--border-subtle)' }}
      >
        <ChangePill meta={meta} />
        <span className="font-body text-s text-text-tertiary leading-[1.6]" style={{ gridColumn: '2 / 6' }}>
          <strong className="font-semibold text-text-secondary">{row.title}</strong> — {row.note}
        </span>
      </div>
    )
  }

  return (
    <div
      className="grid items-center gap-m px-l py-s"
      style={{ minWidth: 860, gridTemplateColumns: CMP_GRID, borderTop: '1px solid var(--border-subtle)' }}
    >
      <ChangePill meta={meta} />
      <span className="font-display text-s font-semibold text-text-primary leading-[1.5]">
        {row.title}
      </span>
      <span className="font-body text-s text-text-tertiary leading-[1.5]">{row.baseline ?? '—'}</span>
      <span className="font-body text-s leading-[1.5]" style={{ color: row.change === 'fixed' ? 'var(--success)' : 'var(--text-primary)' }}>
        <strong className="font-semibold">{row.current}</strong>
        {row.delta && (
          <span className="font-normal" style={{ color: DELTA_COLOR[row.deltaTone ?? 'neutral'] }}>
            {' '}
            {row.delta}
          </span>
        )}
      </span>
      <span className="font-body text-s text-text-secondary leading-[1.5]">{row.step}</span>
    </div>
  )
}

function ChangePill({
  meta,
}: {
  meta: { label: string; color?: string; bg: string; inkClass?: string }
}) {
  return (
    <span
      className={[
        'inline-flex items-center justify-self-start px-xs py-xxxs rounded-xs font-body text-xs font-medium leading-[1.5] whitespace-nowrap',
        meta.inkClass,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      {meta.label}
    </span>
  )
}

/* ── Shared table bits ───────────────────────────────────────────────────── */

function TableHead({
  grid,
  cells,
  minWidth,
}: {
  grid: string
  cells: string[]
  /** Matches the body rows so header and data stay aligned while scrolling. */
  minWidth: number
}) {
  return (
    <div
      className="grid items-center gap-m px-l py-s"
      style={{
        minWidth: minWidth,
        gridTemplateColumns: grid,
        backgroundColor: 'var(--bg-page-pale)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {cells.map((c) => (
        <span
          key={c}
          className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary leading-[1.5]"
        >
          {c}
        </span>
      ))}
    </div>
  )
}

function Caveat({ children }: { children: ReactNode }) {
  return (
    <p
      className="font-body text-xs text-text-secondary leading-[1.6] m-l rounded-xl px-m py-s"
      style={{ backgroundColor: 'var(--bg-page-pale)', border: '1px solid var(--border-subtle)' }}
    >
      {children}
    </p>
  )
}
