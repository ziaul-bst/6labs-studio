/**
 * FunctionalTestReport — what a verification run found, case by case.
 *
 * A functional report answers one question per row — did this case happen —
 * so the page is a table, not a narrative. What it has to get right is the
 * three ways a reader arrives: taking the result (the summary), hunting a
 * specific case (search and the category select), or working a queue of
 * failures (the pills, then the detail modal's Previous/Next).
 *
 * The page has one claim and a body of evidence for it. The claim is the
 * VerificationSummary at the top — result beside coverage; the evidence is
 * everything under it. Nothing in the summary is a control, so the reader is
 * never filtering in two places at two different scales.
 *
 * Code-first prototype — from the reference flow (user-test-agent-flow v128).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { AnalysisProgressCard } from '../molecules/AnalysisProgressCard'
import { RunFailedNotice } from '../molecules/RunFailedNotice'
import { TestingMenuSelect } from '../molecules/TestingMenuSelect'
import { TestCaseDetailModal } from './TestCaseDetailModal'
import { CASE_OUTCOME_ORDER, CASE_OUTCOME_STYLE, CaseOutcomeTag } from '../atoms/CaseOutcomeTag'
import { SegmentedControl } from '../atoms/SegmentedControl'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { SearchIcon } from '../icons/SearchIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import { DownloadIcon } from '../icons/DownloadIcon'
import { VerificationSummary } from '../molecules/VerificationSummary'
import { VerifiedReportSkeleton } from '../molecules/TestingSkeletons'
import { usePageLoading } from '../../lib/pageLoading'
import { casesToCsv, csvFileName, downloadCsv } from '../../lib/testCaseCsv'
import { CASE_DEPTH_FIXTURES, useCaseDepthDemoState } from '../../lib/caseDepthDemoState'
import { useCaseLayoutDemoState } from '../../lib/caseLayoutDemoState'
import type { CaseModalLayout } from './TestCaseDetailModal'
import type { CaseOutcome, TestCaseFile, VerifiedCase, VerificationTotals } from '../../lib/types/testing'

export type FunctionalReportMode = 'human' | 'ai'

export interface FunctionalTestReportProps {
  title: string
  /**
   * "10 videos · regression-suite.xlsx · verified by 6labs agent". Kept on the
   * API — every caller has it and the history row it came from still needs it —
   * but no longer drawn: the run's provenance is one click away in history, and
   * on the report it was a line of grey metadata between the title and the
   * result, read by nobody and pushing the summary down.
   */
  subtitle: string
  mode: FunctionalReportMode
  /**
   * The build the AI players ran against. Coverage is denominated in it —
   * "64% reached in v2.3.1" — because an AI run produces its own footage and a
   * recording count says nothing a reader can compare between runs. Omitted on
   * a human run, where the footage someone uploaded *is* the scope.
   */
  buildLabel?: string
  /**
   * The run also carried a behavioural pass. Kept on the API — the history row
   * it came from still says "functional + UX" — but no longer drawn here: this
   * report answers "did each case happen", and two friction findings bolted to
   * the end of it were a different report's opening, with no way to reach the
   * other five or their clips. The behavioural pass has its own screen.
   */
  withUx?: boolean
  /**
   * The run has been submitted and nothing has started on it. This is the
   * first screen a reader sees after pressing the button, so it has to say
   * that the submission worked and that the wait is normal — a progress bar at
   * 0% says neither, and an empty report says the run failed.
   */
  queued?: boolean
  /** Start on the progress card and reveal the report when the ticks finish. */
  inProgress?: boolean
  /** The run stopped — show why instead of a report. */
  failure?: string
  /** Fires once when a run that started in progress completes. */
  onDone?: () => void
  onBack: () => void
  onRunAgain?: () => void
  /** Defaults to the review dock's case-depth fixture. */
  cases?: VerifiedCase[]
  totals?: VerificationTotals
  /**
   * The sheet(s) this run was verified against, handed back as a download.
   * A reader disputing a verdict is disputing the case, and the case lives in
   * the file someone uploaded weeks ago — the report is the only place that
   * still knows which one it was.
   */
  caseFiles?: TestCaseFile[]
  /** Rows per page. The list is the page's whole body, so it pages rather than scrolls forever. */
  pageSize?: number
  /** Show the list rail inside the detail modal. */
  modalNavigator?: boolean
  /** Shape of the case-detail modal. Defaults to the review dock's choice. */
  modalLayout?: CaseModalLayout
  className?: string
}

type Filter = 'all' | CaseOutcome

const ALL_CATEGORIES = '__all'
const TICK_MS = 1300

export function FunctionalTestReport({
  title,
  mode,
  buildLabel,
  queued = false,
  inProgress = false,
  failure,
  onDone,
  onBack,
  onRunAgain,
  cases: casesProp,
  totals: totalsProp,
  caseFiles,
  pageSize = 12,
  modalNavigator = true,
  modalLayout,
  className,
}: FunctionalTestReportProps) {
  /* Stories pass their own fixture; inside the app the review dock chooses
     between the tidy suite and the text-heavy one. */
  const depth = useCaseDepthDemoState()
  const dockLayout = useCaseLayoutDemoState()
  const fixture = CASE_DEPTH_FIXTURES[depth]
  const cases = casesProp ?? fixture.cases
  const totals = totalsProp ?? fixture.totals

  const progressItems = useMemo(
    () =>
      mode === 'ai'
        ? ['Agent 1 · Onboarding', 'Agent 2 · Store', 'Agent 3 · Progression', 'Agent 1 · Alliance', 'Agent 2 · Settings', 'Verification pass']
        : ['Mapping cases to videos', 'Launch · first run', 'Combat · skills and encounters', 'Store · purchases', 'Alliance · join and rally', 'Progression · daily systems'],
    [mode],
  )
  const [step, setStep] = useState(inProgress || queued ? 0 : progressItems.length)
  const running = step < progressItems.length
  const doneRef = useRef(false)

  useEffect(() => {
    /* The ticks belong to the analysis, not to the queue. A run waiting to
       start must not tick through "Mapping cases to videos" — that is a claim
       about work nobody has begun. */
    if (!running || queued) return
    const t = window.setTimeout(() => setStep((s) => s + 1), TICK_MS)
    return () => window.clearTimeout(t)
  }, [running, step, queued])

  useEffect(() => {
    if (!running && inProgress && !doneRef.current) {
      doneRef.current = true
      onDone?.()
    }
  }, [running, inProgress, onDone])

  /* This screen's own beat, keyed on the run — opening a different report is
     a different fetch. A run that is queued or still analysing is NOT this:
     those have something to say about themselves and say it in words, below. */
  const loadPhase = usePageLoading(title)
  const [filter, setFilter] = useState<Filter>('all')
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState<string | null>(null)

  const categories = useMemo(() => [...new Set(cases.map((c) => c.category))].sort(), [cases])

  /* Four outcomes, named and ordered where the tags are. The labels used to be
     written out here as well, and had drifted — "Fail" and "Block" on the
     filter against "Failed" and "Not verified" everywhere else — so a segment
     and the tag it filtered to did not read as the same word. */
  const count = (f: (c: VerifiedCase) => boolean) => cases.filter(f).length
  const filterOptions: { value: Filter; label: string; n: number }[] = [
    { value: 'all', label: 'All', n: cases.length },
    ...CASE_OUTCOME_ORDER.map((outcome) => ({
      value: outcome as Filter,
      label: CASE_OUTCOME_STYLE[outcome].label,
      n: count((c) => c.outcome === outcome),
    })),
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
  const paged = pageCount > 1

  /* Only the plain fetch. A queued or running report is a wait with an agent
     behind it and narrates itself; a skeleton over that would say the page is
     still arriving when the truth is that 6labs is working. */
  const skeleton = Boolean(loadPhase) && !queued && !running && !failure

  /* Built once and handed to both the skeleton and the report. The bar is the
     way back out of this screen and it is known the instant a history row is
     clicked, so it is never drawn as grey bars — see TestingSkeletons. */
  const topbar = (
    <PageTopbar
      title={title}
      trail={[{ label: mode === 'ai' ? 'AI functional test' : 'Functional test' }]}
      onBack={onBack}
        /* Export only. A report is a record of one run — "Run again" from
           inside it starts a *different* run, and the reader is here to read
           this one. It survives on the failed-run notice, where re-running is
           the only thing left to do.

           It exports every case in the run, not the filtered view: the button
           is in the page chrome, above and outside the toolbar, and a control
           up there that silently obeys a filter three sections down is how
           someone mails a partial report believing it is the whole one. */
      actions={
        <Button
          variant="secondary"
          size="md"
          leftIcon={<DownloadIcon size={16} />}
          disabled={running || skeleton || !!failure}
          onClick={() => downloadCsv(csvFileName(title), casesToCsv(cases))}
        >
          Export CSV
        </Button>
      }
    />
  )

  if (skeleton)
    return <VerifiedReportSkeleton topbar={topbar} label={`Loading ${title}`} className={className} />

  return (
    <div className={['flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      {topbar}

      <div className="flex flex-col gap-m page-measure pt-l pb-xxl3">
        {failure ? (
          <RunFailedNotice
            reason={failure}
            saved={
              mode === 'ai'
                ? 'The cases the players reached before the crash were kept — nothing else was recorded.'
                : 'The sessions are untouched in the Gameplay Library.'
            }
            onRunAgain={onRunAgain}
          />
        ) : queued ? (
          <QueuedNotice mode={mode} />
        ) : running ? (
          <AnalysisProgressCard
            label={mode === 'ai' ? 'AI players executing…' : 'Verifying cases against sessions…'}
            percent={3 + (step / progressItems.length) * 97}
            eta={`~${Math.max(1, progressItems.length - step)} min`}
            items={progressItems}
            currentIndex={step}
            onSkip={() => setStep(progressItems.length)}
          />
        ) : (
          <>
            {/* The claim the rest of the page is evidence for: verdict, then
                the two questions that have different denominators — how what
                ran did, and how much of the file ran at all. The run names
                itself in the card's own masthead rather than on the page above
                it — this card is what gets screenshotted and exported, and a
                title outside it does not travel. */}
            <VerificationSummary
              totals={totals}
              scope={buildLabel ? { kind: 'build', label: buildLabel } : { kind: 'sessions' }}
              masthead={
                <>
                  <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                    {mode === 'ai' ? 'AI functional test report' : 'Functional test report'}
                  </span>
                  <h1 className="font-display text-xl font-semibold text-text-primary leading-[1.25] tracking-[-0.01em] m-0">
                    {title}
                  </h1>
                </>
              }
            />

            {caseFiles && caseFiles.length > 0 && <CaseFileBar files={caseFiles} />}

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
              /* No overflow-hidden: it makes the card a scroll container and a
                 sticky footer inside one never sticks. The rows' own bottom
                 radius is on the pager instead. */
              className="verification-table flex flex-col w-full rounded-2xl"
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
                    /* Rounding lives on the last row now that the card no
                       longer clips, so a hovered last row can't square its
                       corner. Same pattern as the history table. */
                    style={{
                      borderTop: i > 0 ? '1px solid var(--border-subtle)' : undefined,
                      borderBottomLeftRadius: i === rows.length - 1 && !paged ? 15 : undefined,
                      borderBottomRightRadius: i === rows.length - 1 && !paged ? 15 : undefined,
                    }}
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
                    <span className="case-reason font-body text-s text-text-secondary leading-[1.5]">
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

              {paged && (
                /* The same pager the history tables carry: sticky on the card's
                   bottom edge, controls left with the range after them. Twelve
                   rows plus a header run past the fold on a 13" laptop, and a
                   pager you have to scroll to find reads as a list that simply
                   stops. The opaque fill and bottom radius are what let rows
                   pass behind it without showing through the rounded corner. */
                <div
                  className="sticky bottom-0 z-[1] flex items-center gap-s px-l py-s rounded-b-2xl"
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-elements)',
                  }}
                >
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<ChevronIcon size={16} direction="left" />}
                    disabled={clampedPage === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="font-body text-s text-text-secondary whitespace-nowrap px-xs">
                    Page {clampedPage + 1} of {pageCount}
                  </span>
                  <Button
                    variant="secondary"
                    size="md"
                    rightIcon={<ChevronIcon size={16} direction="right" />}
                    disabled={clampedPage >= pageCount - 1}
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  >
                    Next
                  </Button>
                  <span className="font-body text-s text-text-tertiary leading-[1.5] pl-xs">
                    {clampedPage * pageSize + 1}–{clampedPage * pageSize + rows.length} of{' '}
                    {visible.length}
                  </span>
                  <span className="flex-1" />
                </div>
              )}
            </div>


          </>
        )}
      </div>

      <TestCaseDetailModal
        testCase={openCase}
        cases={visible}
        /* An AI functional run's footage was played by an agent, not recorded
           by a person — the clip says so. */
        aiGenerated={mode === 'ai'}
        withNavigator={modalNavigator}
        layout={modalLayout ?? dockLayout}
        onSelect={setOpenId}
        onClose={() => setOpenId(null)}
      />
    </div>
  )
}

/**
 * What the run was verified against, offered back as a file.
 *
 * It sits between the summary and the toolbar because it belongs to the claim,
 * not to the evidence: the summary says how the cases scored, and this says
 * which cases. Below the table it would be a footnote to the rows; inside the
 * summary card it would be a link in the one block on the page that is
 * deliberately not interactive.
 *
 * A row, not a line of metadata — the whole point is that it is fetchable.
 */
/**
 * A submitted run, before anything has started on it.
 *
 * Deliberately not a progress card. A bar at 0% with a spinner claims work is
 * under way; what is true is that the run is accepted, in line, and will start
 * without anyone watching. So: the fact, why the wait exists, and an explicit
 * statement that the page does not have to be held open — which is the one
 * thing a reader who has just pressed a button wants to know.
 */
function QueuedNotice({ mode }: { mode: FunctionalReportMode }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-xs w-full rounded-2xl px-xl py-xxl3 text-center"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      role="status"
    >
      <span
        className="flex items-center justify-center w-[44px] h-[44px] rounded-xl mb-xs"
        style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
        aria-hidden
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </span>
      <span className="font-display text-l font-semibold text-text-primary leading-[1.35]">
        Queued
      </span>
      <span className="font-body text-s text-text-secondary leading-[1.7] max-w-[56ch]">
        {mode === 'ai'
          ? 'The run is in line for a device. It starts on its own once one frees up — nothing here needs to stay open.'
          : 'The run is in line. 6labs starts reading the sessions against your cases as soon as a slot frees up — nothing here needs to stay open.'}
      </span>
      <span className="font-body text-xs text-text-tertiary leading-[1.6] pt-xs">
        This page becomes the report when it is done. It is also in Run history.
      </span>
    </div>
  )
}

function CaseFileBar({ files }: { files: TestCaseFile[] }) {
  return (
    <div
      className="flex flex-wrap items-center gap-s rounded-xl px-m py-s"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]">
        Verified against
      </span>
      {files.map((f) => (
        <a
          key={f.name}
          href={f.href ?? '#'}
          download={f.name}
          className="inline-flex items-center gap-xs font-body text-s font-semibold text-text-brand leading-[1.5] hover:underline"
        >
          <DownloadIcon size={16} />
          {f.name}
          {/* The name alone. The count used to trail it, three inches under a
              Coverage meter that already reads "of the 1,956 cases in the
              file" — the same number, in the place that explains what it is
              the denominator of. */}
        </a>
      ))}
    </div>
  )
}

/** Re-exported so callers can colour a row or a rule the same way a tag is. */
export { CASE_OUTCOME_STYLE }
