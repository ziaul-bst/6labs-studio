/**
 * FunctionalTestReport — what a verification run found, case by case.
 *
 * A functional report answers one question per row — did this case happen —
 * so the page is a table, not a narrative. What it has to get right is the
 * three ways a reader arrives: counting the damage (the tiles), hunting a
 * specific case (search and the category select), or working a queue of
 * failures (the pills, then the detail modal's Previous/Next).
 *
 * The header counts cases *run* against cases *in the file*, and says out loud
 * how many were never reached. A report that only counted what it managed to
 * check would read as complete coverage, which is the single most expensive
 * thing this screen could imply.
 *
 * Code-first prototype — from the reference flow (user-test-agent-flow v128).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { AnalysisProgressCard } from '../molecules/AnalysisProgressCard'
import { RunFailedNotice } from '../molecules/RunFailedNotice'
import { TestingMenuSelect } from '../molecules/TestingMenuSelect'
import { TestCaseDetailModal } from './TestCaseDetailModal'
import { CASE_OUTCOME_STYLE, CaseOutcomeTag } from '../atoms/CaseOutcomeTag'
import { SegmentedControl } from '../atoms/SegmentedControl'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { SearchIcon } from '../icons/SearchIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import { UserTestIssueCard } from '../molecules/UserTestIssueCard'
import { VERIFICATION_TOTALS, VERIFIED_CASES } from '../../lib/mocks/verified-cases'
import { USER_TEST_ISSUES } from '../../lib/mocks/user-test'
import type { CaseOutcome, VerifiedCase, VerificationTotals } from '../../lib/types/testing'

export type FunctionalReportMode = 'human' | 'ai'

export interface FunctionalTestReportProps {
  title: string
  /** "10 videos · regression-suite.xlsx · verified by 6labs agent" */
  subtitle: string
  mode: FunctionalReportMode
  /**
   * Append the behavioural findings from the same sessions. An agency batch was
   * paid for functional coverage, so the UX pass comes free — and holding an
   * agency to more than "did it pass" is the reason to read both together.
   */
  withUx?: boolean
  /** Start on the progress card and reveal the report when the ticks finish. */
  inProgress?: boolean
  /** The run stopped — show why instead of a report. */
  failure?: string
  /** Fires once when a run that started in progress completes. */
  onDone?: () => void
  onBack: () => void
  onRunAgain?: () => void
  cases?: VerifiedCase[]
  totals?: VerificationTotals
  /** Rows per page. The list is the page's whole body, so it pages rather than scrolls forever. */
  pageSize?: number
  /** Show the list rail inside the detail modal. */
  modalNavigator?: boolean
  className?: string
}

type Filter = 'all' | CaseOutcome

const ALL_CATEGORIES = '__all'
const TICK_MS = 1300

export function FunctionalTestReport({
  title,
  subtitle,
  mode,
  withUx = false,
  inProgress = false,
  failure,
  onDone,
  onBack,
  onRunAgain,
  cases = VERIFIED_CASES,
  totals = VERIFICATION_TOTALS,
  pageSize = 12,
  modalNavigator = true,
  className,
}: FunctionalTestReportProps) {
  const progressItems = useMemo(
    () =>
      mode === 'ai'
        ? ['Agent 1 · Onboarding', 'Agent 2 · Store', 'Agent 3 · Progression', 'Agent 1 · Alliance', 'Agent 2 · Settings', 'Verification pass']
        : ['Mapping cases to videos', 'Launch · first run', 'Combat · skills and encounters', 'Store · purchases', 'Alliance · join and rally', 'Progression · daily systems'],
    [mode],
  )
  const [step, setStep] = useState(inProgress ? 0 : progressItems.length)
  const running = step < progressItems.length
  const doneRef = useRef(false)

  useEffect(() => {
    if (!running) return
    const t = window.setTimeout(() => setStep((s) => s + 1), TICK_MS)
    return () => window.clearTimeout(t)
  }, [running, step])

  useEffect(() => {
    if (!running && inProgress && !doneRef.current) {
      doneRef.current = true
      onDone?.()
    }
  }, [running, inProgress, onDone])

  const [filter, setFilter] = useState<Filter>('all')
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState<string | null>(null)

  const categories = useMemo(() => [...new Set(cases.map((c) => c.category))].sort(), [cases])

  const count = (f: (c: VerifiedCase) => boolean) => cases.filter(f).length
  const filterOptions: { value: Filter; label: string; n: number }[] = [
    { value: 'all', label: 'All', n: cases.length },
    { value: 'pass', label: 'Pass', n: count((c) => c.outcome === 'pass') },
    { value: 'fail', label: 'Fail', n: count((c) => c.outcome === 'fail') },
    { value: 'blocked', label: 'Block', n: count((c) => c.outcome === 'blocked') },
    { value: 'review', label: 'Need review', n: count((c) => c.outcome === 'review') },
  ]

  const visible = useMemo(
    () =>
      cases.filter((c) => {
        if (filter !== 'all' && c.outcome !== filter) return false
        if (category !== ALL_CATEGORIES && c.category !== category) return false
        if (!search) return true
        const q = search.toLowerCase()
        return `${c.id} ${c.title} ${c.category} ${c.reason}`.toLowerCase().includes(q)
      }),
    [cases, filter, category, search],
  )

  /* A filter that leaves the reader on page 4 of a one-page result is a bug
     they experience as an empty screen. */
  useEffect(() => {
    setPage(0)
  }, [filter, category, search])

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize))
  const clampedPage = Math.min(page, pageCount - 1)
  const rows = visible.slice(clampedPage * pageSize, clampedPage * pageSize + pageSize)
  const openCase = openId ? (visible.find((c) => c.id === openId) ?? null) : null
  const unreached = totals.total - totals.run

  return (
    <div className={['flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      <PageTopbar
        title={title}
        trail={[{ label: mode === 'ai' ? 'AI functional test' : 'Functional test' }]}
        onBack={onBack}
        actions={
          <>
            <Button variant="secondary" size="md">Export</Button>
            <Button variant="primary" size="md" onClick={onRunAgain}>Run again</Button>
          </>
        }
      />

      <div className="flex flex-col gap-m page-measure pt-l pb-xxl3">
        <p className="font-body text-s text-text-secondary leading-[1.5]">{subtitle}</p>

        {failure ? (
          <RunFailedNotice
            reason={failure}
            saved={
              mode === 'ai'
                ? 'The cases the players reached before the crash were kept — nothing else was recorded.'
                : 'The recordings are untouched in the Gameplay Library.'
            }
            onRunAgain={onRunAgain}
          />
        ) : running ? (
          <AnalysisProgressCard
            label={mode === 'ai' ? 'AI players executing…' : 'Verifying cases against videos…'}
            percent={3 + (step / progressItems.length) * 97}
            eta={`~${Math.max(1, progressItems.length - step)} min`}
            items={progressItems}
            currentIndex={step}
            onSkip={() => setStep(progressItems.length)}
          />
        ) : (
          <>
            {/* Coverage, then outcomes. Six equal cards gave six equal
                headlines; this is one headline — how much of the file the run
                actually reached — with the outcome split reading as its
                breakdown, which is what it is. */}
            <section
              className="flex flex-col gap-m w-full rounded-2xl px-l py-m"
              style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex flex-wrap items-end justify-between gap-m">
                <div className="flex flex-col gap-xxxs">
                  <span className="flex items-baseline gap-xs">
                    <span className="font-display text-2xl font-semibold text-text-primary leading-[1.15]">
                      {totals.run.toLocaleString()}
                    </span>
                    <span className="font-body text-m text-text-tertiary leading-[1.4]">
                      of {totals.total.toLocaleString()} cases verified
                    </span>
                  </span>
                  <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                    across {totals.videos} recordings
                  </span>
                </div>
                <OutcomeLegend totals={totals} />
              </div>

              {/* One bar, in outcome order, so coverage and result are the same
                  picture. The unreached remainder is the unfilled track. */}
              <CoverageBar totals={totals} />

              {unreached > 0 && (
                <p className="font-body text-xs text-text-tertiary leading-[1.6] max-w-[92ch]">
                  {unreached.toLocaleString()} cases in the file were never reached in this footage —
                  neither passed nor failed, and nothing below reports on them.
                </p>
              )}
            </section>

            {/* Two rows, not one wrap: finding a case and narrowing the set are
                different jobs, and eight controls on one line read as none. */}
            <div className="flex flex-col gap-s">
              <div className="report-toolbar flex flex-wrap items-center gap-s">
                <div className="flex-1 min-w-[240px]">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search id, name, category or reason…"
                    aria-label="Search test cases"
                    size="lg"
                    leftIcon={<SearchIcon size={20} />}
                  />
                </div>
                <div className="shrink-0 w-[200px]">
                  <TestingMenuSelect
                    value={category}
                    onChange={setCategory}
                    ariaLabel="Filter by category"
                    placeholder="All categories"
                    options={[
                      { value: ALL_CATEGORIES, label: 'All categories' },
                      ...categories.map((c) => ({
                        value: c,
                        label: c,
                        meta: `${cases.filter((x) => x.category === c).length} cases`,
                      })),
                    ]}
                  />
                </div>
              </div>

              {/* Scrolls rather than clips: five segments do not fit a tablet
                  column, and a half-visible "Need review" is a filter the
                  reader cannot tell is there. */}
              <div className="segment-scroll">
                <SegmentedControl
                  ariaLabel="Filter by outcome"
                  size="lg"
                  value={filter}
                  onChange={setFilter}
                  options={filterOptions.map((f) => ({ value: f.value, label: f.label, count: f.n }))}
                  className="w-max"
                />
              </div>
            </div>

            <div
              className="verification-table flex flex-col w-full rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="verification-head verification-row px-l py-s font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <span>ID</span>
                <span>Test case</span>
                <span>Category</span>
                <span>Reason</span>
                <span>Status</span>
                <span />
              </div>

              {rows.length === 0 ? (
                <p className="px-l py-xl font-body text-s text-text-tertiary leading-[1.6] text-center">
                  No cases match this filter.
                </p>
              ) : (
                rows.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setOpenId(c.id)}
                    className="verification-row case-row px-l py-m text-left"
                    style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : undefined}
                  >
                    <span className="font-code text-xs text-text-tertiary leading-[1.6]">{c.id}</span>
                    <span className="font-body text-s text-text-primary leading-[1.5]">{c.title}</span>
                    <span className="flex flex-col gap-xxxs min-w-0">
                      <span className="font-body text-s text-text-primary leading-[1.5]">
                        {c.category}
                      </span>
                      <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                        {c.path}
                      </span>
                    </span>
                    <span className="font-body text-s text-text-secondary leading-[1.5]">
                      {c.reason}
                    </span>
                    <span>
                      <CaseOutcomeTag outcome={c.outcome} />
                    </span>
                    <span className="flex items-center justify-end text-text-tertiary" aria-hidden>
                      <ChevronIcon size={16} />
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* A pager on a single page is a control that can only disappoint. */}
            <div className="flex items-center gap-s">
              {pageCount > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={clampedPage === 0}
                    leftIcon={<ChevronIcon size={16} direction="left" />}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                    Page {clampedPage + 1} of {pageCount}
                  </span>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={clampedPage >= pageCount - 1}
                    rightIcon={<ChevronIcon size={16} />}
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  >
                    Next
                  </Button>
                </>
              )}
              <span className="flex-1" />
              <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                {visible.length === 0
                  ? '0 cases'
                  : `${clampedPage * pageSize + 1}–${clampedPage * pageSize + rows.length} of ${visible.length}`}
              </span>
            </div>

            {withUx && (
              <div
                className="flex flex-col gap-s w-full rounded-2xl px-l py-l mt-m"
                style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
              >
                <h3 className="flex items-center gap-xs font-display text-m font-semibold text-text-primary leading-[1.4]">
                  <span
                    className="inline-flex items-center px-xs py-xxxs rounded-xs font-display text-2xs font-semibold uppercase tracking-[0.12em]"
                    style={{ backgroundColor: 'var(--warning-bg)' }}
                  >
                    <span className="issue-amber-ink">UX</span>
                  </span>
                  Behavioural findings from the same sessions
                </h3>
                <div className="flex flex-col gap-xxs">
                  {USER_TEST_ISSUES.filter((i) => i.kind === 'friction')
                    .slice(0, 2)
                    .map((issue) => (
                      <UserTestIssueCard key={issue.id} issue={issue} />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TestCaseDetailModal
        testCase={openCase}
        cases={visible}
        withNavigator={modalNavigator}
        onSelect={setOpenId}
        onClose={() => setOpenId(null)}
      />
    </div>
  )
}

const OUTCOME_ORDER: { key: 'pass' | 'fail' | 'blocked' | 'review'; label: string; colour: string }[] = [
  { key: 'pass', label: 'pass', colour: 'var(--success)' },
  { key: 'fail', label: 'fail', colour: 'var(--error)' },
  { key: 'review', label: 'need review', colour: 'var(--warning)' },
  /* Block is neutral, the same as its tag: a case nobody could verify is not a
     result, and colouring it like one invites it to be counted as a pass. */
  { key: 'blocked', label: 'block', colour: 'var(--text-tertiary)' },
]

function OutcomeLegend({ totals }: { totals: VerificationTotals }) {
  return (
    <div className="flex flex-wrap items-baseline gap-l">
      {OUTCOME_ORDER.map((o) => (
        <span key={o.key} className="flex flex-col gap-xxxs">
          <span className="flex items-center gap-xs">
            <span
              className="w-[8px] h-[8px] rounded-round shrink-0"
              style={{ backgroundColor: o.colour }}
              aria-hidden
            />
            <span className="font-display text-l font-semibold text-text-primary leading-[1.25]">
              {totals[o.key].toLocaleString()}
            </span>
          </span>
          <span className="font-body text-xs text-text-tertiary leading-[1.5] pl-[16px]">
            {o.label}
          </span>
        </span>
      ))}
    </div>
  )
}

function CoverageBar({ totals }: { totals: VerificationTotals }) {
  const width = (n: number) => `${(n / totals.total) * 100}%`
  return (
    <div
      className="flex w-full h-[8px] rounded-round overflow-hidden"
      style={{ backgroundColor: 'var(--bg-subtle)' }}
      role="img"
      aria-label={`${totals.run} of ${totals.total} cases verified: ${totals.pass} pass, ${totals.fail} fail, ${totals.review} need review, ${totals.blocked} blocked`}
    >
      {OUTCOME_ORDER.map((o) => (
        <span key={o.key} style={{ width: width(totals[o.key]), backgroundColor: o.colour }} />
      ))}
    </div>
  )
}

/** Re-exported so callers can colour a row or a rule the same way a tag is. */
export { CASE_OUTCOME_STYLE }
