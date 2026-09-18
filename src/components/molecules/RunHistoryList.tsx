/**
 * RunHistoryList — a test's history tab.
 *
 * A small table, not a feed: a header row names each column, so a reader
 * never has to guess what "V2.2" or "Sep 7" is. One row per entry — an icon
 * tile that carries the kind (report or question) and spins while a run is in
 * flight, the name with one line of what went in, the grouping column (the
 * tag, build or personas — whichever the test groups by, named by the
 * caller), the result, and when.
 *
 * Every fact appears once. The kind lives in the icon only; the grouping value
 * lives in its column only, never repeated in the name or detail; the result
 * column holds the outcome and nothing else. A row that has no outcome to
 * score — a question, a file never run — says so in plain muted text instead
 * of a pill, so the pills that remain all mean "here is a score".
 *
 * Results speak the test's language: functional runs show passed / failed /
 * not-verified counts, everything else shows an issue count — amber while
 * there are issues, green only at zero.
 *
 * Most tests only ever write reports. User Test also answers questions and
 * lists both here, so a kind filter appears above the list — but only once
 * there is more than one kind to filter.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useMemo, useState, type ReactNode } from 'react'
import { SegmentedControl } from '../atoms/SegmentedControl'
import { Spinner } from '../atoms/Spinner'
import { IssueCountPill } from '../atoms/IssueCountPill'
import { EventTag } from '../atoms/EventTag'
import { CASE_OUTCOME_STYLE } from '../atoms/CaseOutcomeTag'
import { ClampTags } from './ClampTags'
import { RunHistoryEmptyState, type RunHistoryEmptyAction } from './RunHistoryEmptyState'
import { FailedGlyph } from './RunFailedNotice'
import Button from '../ui/Button'
import { ChevronIcon } from '../icons/ChevronIcon'
import type { TestRunHistoryItem, TestRunKind } from '../../lib/types/testing'

export interface RunHistoryListProps {
  runs: TestRunHistoryItem[]
  onOpen?: (run: TestRunHistoryItem) => void
  /**
   * A way straight into a run that is still playing — the AI tests can show
   * the live session. Rendered as a link on in-progress rows only.
   */
  onWatchLive?: (run: TestRunHistoryItem) => void
  /** Run to mark as just-created, so the list shows evidence something happened. */
  highlightId?: string | null
  /**
   * Header of the grouping column — what `meta` holds for this test. User and
   * functional tests group footage by library tag; AI functional by build; AI
   * behavioural by the personas that played.
   */
  metaLabel?: string
  /** Header of the name column. Defaults to "Run", or follows the kind filter when the list mixes kinds. */
  nameLabel?: string
  /** Empty state headline — what has not happened yet. */
  emptyTitle?: string
  /** Empty state body — what will land here. */
  emptyLabel?: string
  /** Empty state way out — usually the New run tab. */
  emptyAction?: RunHistoryEmptyAction
  /** Rows per page. A history past this many pages rather than scrolls forever. */
  pageSize?: number
  className?: string
}

/* Every row is its own grid, so every column that isn't the flexible name must
   be a fixed width — an `auto` result column would resize per row and walk
   the tag column left and right. 184px fits a two-persona split ("New player
   ×12, Whale ×8"), 200px fits the widest result (the four outcome counts, or
   the Failed pill with its reason under it), and 136px fits
   the longest row action. */
const GRID = '40px minmax(0, 1fr) 184px 200px 72px 124px'

type KindFilter = 'all' | TestRunKind

const FILTER_LABEL: Record<KindFilter, string> = {
  all: 'All',
  report: 'Reports',
  question: 'Questions',
}

/* What the first column is called when the list mixes reports and questions
   and the caller hasn't said. */
const MIXED_NAME_LABEL: Record<KindFilter, string> = {
  all: 'Report or question',
  report: 'Report',
  question: 'Question',
}

export function RunHistoryList({
  runs,
  onOpen,
  onWatchLive,
  highlightId,
  metaLabel = 'Tag',
  nameLabel,
  emptyTitle,
  emptyLabel,
  emptyAction,
  pageSize = 10,
  className,
}: RunHistoryListProps) {
  const [filter, setFilterState] = useState<KindFilter>('all')
  const [page, setPage] = useState(0)
  const setFilter = (next: KindFilter) => {
    setFilterState(next)
    setPage(0)
  }

  /* The filter is a property of the data, not a prop: a list that only holds
     reports has nothing to filter, so it renders as it always did. */
  const mixed = useMemo(() => runs.some((r) => r.kind === 'question'), [runs])
  const counts = useMemo(
    () => ({
      all: runs.length,
      report: runs.filter((r) => (r.kind ?? 'report') === 'report').length,
      question: runs.filter((r) => r.kind === 'question').length,
    }),
    [runs],
  )
  const shown = mixed && filter !== 'all' ? runs.filter((r) => (r.kind ?? 'report') === filter) : runs
  const firstHeader = nameLabel ?? (mixed ? MIXED_NAME_LABEL[filter] : 'Run')
  /* Pages, not an endless scroll: a reader looking for last month's run wants
     to know how far back the list goes and to jump, not to keep pulling. */
  const pageCount = Math.max(1, Math.ceil(shown.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const visible = shown.slice(safePage * pageSize, (safePage + 1) * pageSize)
  const paged = pageCount > 1

  return (
    <div
      /* No overflow clipping: the outcome counts carry a hover label that has
         to escape the row. The rounded card is kept by rounding the last row
         instead; the header always owns the top corners. */
      className={['flex flex-col w-full rounded-2xl', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      {mixed && (
        /* The shared segmented control rather than a row of chips: one track,
           one raised segment, so the three read as one choice and the state is
           carried by position instead of by colour. Same control the video
           picker filters its sources with. */
        <div className="flex items-center px-l py-m" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <SegmentedControl<KindFilter>
            ariaLabel="Filter history by kind"
            /* Matches the composer's mode switch a tab away — the two controls
               on this screen should not be lettered differently. */
            size="md"
            value={filter}
            onChange={setFilter}
            options={(['all', 'report', 'question'] as KindFilter[]).map((key) => ({
              value: key,
              label: FILTER_LABEL[key],
              count: counts[key],
            }))}
          />
        </div>
      )}

      {runs.length > 0 && (
        /* Column names, styled as captions so they sit under the rows rather
           than compete with them. The icon column is unlabelled — the icon is
           its own label. */
        <div
          className="grid items-center gap-m px-l pt-m pb-xs"
          style={{ gridTemplateColumns: GRID, borderBottom: '1px solid var(--border-subtle)' }}
          role="row"
        >
          <span aria-hidden />
          <HeaderCell>{firstHeader}</HeaderCell>
          <HeaderCell>{metaLabel}</HeaderCell>
          <HeaderCell>Result</HeaderCell>
          <HeaderCell align="right">Date</HeaderCell>
          <span aria-hidden />
        </div>
      )}

      {/* Two empties, two weights: no history at all gets the illustrated
          state with a way out; a filter that matches nothing is a passing
          moment and gets one line. */}
      {runs.length === 0 && <RunHistoryEmptyState title={emptyTitle} message={emptyLabel} action={emptyAction} />}
      {runs.length > 0 && shown.length === 0 && (
        <p className="font-body text-s text-text-tertiary leading-[1.6] px-l py-l">
          {`No ${FILTER_LABEL[filter].toLowerCase()} yet.`}
        </p>
      )}

      {visible.map((run, i) => {
        const inProgress = run.state === 'progress'
        /* The evidence exists and the report does not. Unlike 'progress' this
           row always opens: every session is finished and watchable, so the
           detail screen has a full Videos tab to show while the report is
           being written — which is exactly where someone waiting on it wants
           to be. */
        const analysing = run.state === 'analysing'
        const pending = inProgress || analysing
        const failed = run.state === 'failed'
        const kind: TestRunKind = run.kind ?? 'report'
        const isQuestion = kind === 'question'
        const last = i === visible.length - 1 && !paged
        /* A run still recording has no page worth opening — the detail screen
           would be a progress bar, which this row already is. The tests whose
           agents can be watched play live pass `onWatchLive` and keep their way
           in; everything else is inert until the run has something to show. */
        const openable = !inProgress || Boolean(onWatchLive)
        return (
          <div
            key={run.id}
            role={openable ? 'button' : undefined}
            tabIndex={openable ? 0 : undefined}
            aria-disabled={openable ? undefined : true}
            onClick={openable ? () => onOpen?.(run) : undefined}
            onKeyDown={
              openable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onOpen?.(run)
                    }
                  }
                : undefined
            }
            className={[
              'run-history-row grid items-center gap-m px-l py-m',
              openable ? 'cursor-pointer' : 'run-history-row-inert cursor-default',
            ].join(' ')}
            style={{
              gridTemplateColumns: GRID,
              borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
              /* Rounding lives on the last row now that the card no longer
                 clips, so a tinted last row can't square its corner. */
              borderBottomLeftRadius: last ? 15 : undefined,
              borderBottomRightRadius: last ? 15 : undefined,
              backgroundColor:
                run.id === highlightId ? 'var(--bg-tint-light)' : pending ? 'var(--bg-page-pale)' : undefined,
            }}
          >
            <span
              className="flex items-center justify-center w-[40px] h-[40px] rounded-xl"
              /* The tile is the only place the kind is said. A question is a
                 lighter act than a run, and its tile says so before the name
                 is read. */
              style={
                failed
                  ? { backgroundColor: 'var(--error-bg)', color: 'var(--error)' }
                  : isQuestion
                    ? { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }
                    : { backgroundColor: 'var(--bg-tint-light)', color: 'var(--text-brand)' }
              }
              role="img"
              aria-label={
                inProgress ? 'In progress' : analysing ? 'Analysing' : failed ? 'Failed' : isQuestion ? 'Question' : 'Report'
              }
            >
              {pending ? <Spinner size={18} tone="current" /> : failed ? <FailedGlyph size={18} /> : isQuestion ? <QuestionGlyph /> : <ReportGlyph />}
            </span>

            <span className="flex flex-col gap-xxxs min-w-0">
              {/* Run names are short; a question is a whole sentence, so the
                  name wraps to two lines rather than truncating mid-question. */}
              <span className="flex items-start gap-xs min-w-0">
                <span className="font-display text-s font-semibold text-text-primary leading-[1.45] line-clamp-2 min-w-0">
                  {run.name}
                </span>
              </span>
              {/* What went in, on every row and in every state. A failed run
                  still read 8 videos and a case file, and hiding that behind
                  the failure left the reader unable to tell the rows apart —
                  the reason now sits with the status instead. */}
              <span className="font-body text-xs text-text-tertiary leading-[1.5] truncate">
                {run.detail}
                {run.withUx ? ' · functional + UX' : ''}
              </span>
            </span>

            <MetaCell run={run} />

            <ResultCell kind={kind} run={run} />

            <span className="font-body text-s text-text-tertiary leading-[1.5] text-right whitespace-nowrap">{run.when}</span>

            {/* The row is clickable, but a table of ten rows needs the verb
                spelled out somewhere — and a run still playing is opened for a
                different reason than a finished one. */}
            <span className="flex items-center justify-end">
              {inProgress && onWatchLive ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation()
                    onWatchLive(run)
                  }}
                  leftIcon={<i className="agent-live-dot" aria-hidden />}
                >
                  Watch live
                </Button>
              ) : analysing ? (
                /* Live, not disabled. The same word the human tests use while
                   their agent reads the footage — but here the footage is
                   already recorded, so the button goes somewhere: the run's
                   Videos tab, full of finished sessions. */
                <Button
                  variant="secondary"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpen?.(run)
                  }}
                  leftIcon={<Spinner size={16} tone="current" />}
                >
                  Analysing…
                </Button>
              ) : inProgress ? (
                /* Disabled rather than absent: the column keeps its width, and
                   a greyed control says "not yet" where an empty cell would
                   read as "nothing here". */
                <Button variant="secondary" size="md" disabled>
                  Analysing…
                </Button>
              ) : run.state === 'never' ? null : (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpen?.(run)
                  }}
                >
                  {failed ? 'View details' : isQuestion ? 'View answer' : 'View report'}
                </Button>
              )}
            </span>
          </div>
        )
      })}

      {paged && (
        /* Sticky, not just last: ten rows plus the header run past the fold on
           a 13" laptop, and a pager you have to scroll to find reads as a list
           that simply stops. It sits on the viewport's bottom edge for as long
           as the card is in view, then settles onto the card's own end. The
           opaque fill and the bottom radius are what let rows pass behind it
           without showing through the card's rounded corner. */
        <div
          className="sticky bottom-0 z-[1] flex items-center gap-s px-l py-s rounded-b-2xl"
          style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elements)' }}
        >
          {/* Controls to the left, range after them: pinned to the bottom
              edge, a right-hand Next lands under whatever floats in that
              corner. The range is the label, so it follows what it labels. */}
          <Button
            variant="secondary"
            size="md"
            leftIcon={<ChevronIcon size={16} direction="left" />}
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            Previous
          </Button>
          <span className="font-body text-s text-text-secondary whitespace-nowrap px-xs">
            Page {safePage + 1} of {pageCount}
          </span>
          <Button
            variant="secondary"
            size="md"
            rightIcon={<ChevronIcon size={16} direction="right" />}
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
          >
            Next
          </Button>
          <span className="font-body text-s text-text-tertiary leading-[1.5] pl-xs">
            {safePage * pageSize + 1}–{Math.min(shown.length, (safePage + 1) * pageSize)} of {shown.length}
          </span>
          <span className="flex-1" />
        </div>
      )}
    </div>
  )
}

function HeaderCell({ children, align }: { children: ReactNode; align?: 'right' }) {
  return (
    <span
      className={[
        'font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5] truncate',
        align === 'right' ? 'text-right' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="columnheader"
    >
      {children}
    </span>
  )
}

/**
 * The third column — a rail of tag pills when the run carries `tags`, the plain
 * string otherwise (a build, a persona split).
 *
 * Tags used to be joined with commas into that same string, which failed in the
 * one place it mattered: a run built from three tags rendered
 * "Build V2.1, Build V2.2, Tut…" and the ellipsis ate the fact that there were
 * three. Pills fail better — the rail shows whole tags and says how many it
 * could not fit, so the count is never the thing that gets truncated.
 *
 * One row, not two: this is a table, and a cell that grows to two rows drags
 * every other column's baseline down with it. What the row cannot fit goes on
 * the "+N" chip's hover label — the same instant CSS tooltip the outcome counts
 * use, because a native `title` waits about a second, which reads as nothing
 * happening on a chip you are pointing at to ask one question.
 */
function MetaCell({ run }: { run: TestRunHistoryItem }) {
  if (!run.tags?.length) {
    return <span className="font-body text-s text-text-secondary leading-[1.5] truncate">{run.meta}</span>
  }
  return (
    <span className="flex items-center min-w-0">
      <ClampTags
        items={run.tags}
        maxRows={1}
        renderItem={(t) => <EventTag key={t} label={t} className="!rounded-[6px]" />}
        renderOverflow={(hidden) => (
          <span
            key="more"
            className="count-tip inline-flex items-center px-s py-[4px] rounded-[6px] bg-base-50 font-body text-2xs font-medium text-base-900 leading-[16px] whitespace-nowrap cursor-default"
            data-tip={hidden.join(' · ')}
            data-tip-wrap=""
          >
            +{hidden.length}
            {/* The chip says how many; this says which, for a reader who cannot
                hover to find out. */}
            <span className="sr-only">{` more tags: ${hidden.join(', ')}`}</span>
          </span>
        )}
      />
    </span>
  )
}

function ResultCell({ kind, run }: { kind: TestRunKind; run: TestRunHistoryItem }) {
  const { state, result } = run
  if (state === 'progress') {
    return <Pill bg="var(--bg-tint)" ink="var(--text-brand)">In progress</Pill>
  }
  /* A different wait, so a different word: "In progress" on a run whose agents
     have all stopped tells a reader the recording is still going. */
  if (state === 'analysing') {
    return <Pill bg="var(--bg-tint)" ink="var(--text-brand)">Analysing</Pill>
  }
  /* Failed is a status, not a score, but it is the one status that must be
     seen from across the room — so it takes a pill, in the error pair, with
     the reason directly under it: the status says stop, the line says why.

     One line, not two. Which failure it was decides what you do next — a build
     that crashed on launch is re-run, recordings that would not decode are
     re-uploaded — and the opening clause carries that. Two clamped lines in a
     200px column did not: they broke mid-word ("could not get past the…"),
     read as a paragraph nobody could finish, and made the failed row taller
     than every other row in the table. The whole sentence is on the hover, and
     in full on the run's own screen. */
  if (state === 'failed') {
    return (
      <span className="flex flex-col items-start gap-xxs w-full min-w-0">
        <Pill bg="var(--error-bg)" ink="var(--error)">Failed</Pill>
        {run.failure && (
          <span
            className="font-body text-xs leading-[1.45] w-full truncate"
            style={{ color: 'var(--error)' }}
            title={run.failure}
          >
            {run.failure}
          </span>
        )}
      </span>
    )
  }
  /* No outcome to score: plain text, not a pill, so a pill always means a
     score. A question was answered; its follow-up count is in its detail. */
  if (kind === 'question') {
    return <Muted>Answered</Muted>
  }
  if (state === 'never' || !result) {
    return <Muted>Never run</Muted>
  }
  if (result.kind === 'issues') {
    /* Shared with the thread header, so the count reads the same colour there. */
    return <IssueCountPill count={result.count} />
  }
  /* All four outcomes a case can carry, in the order the report lists them and
     under the names the report gives them — the amber chip used to be labelled
     "Not verified" while holding the need-review count, and there was no chip
     for the cases nobody could verify at all. Bare numbers only read once you
     know the convention, so each names itself on hover; the aria-label says the
     same thing in one pass for anyone who can't hover. */
  /* Colours come from CASE_OUTCOME_STYLE, so a count and the tag it counts are
     the same chip — they were written out here as well and the neutral one had
     already drifted into an outlined white chip the tag no longer uses. */
  const counts = [
    { outcome: 'pass' as const, n: result.passed },
    { outcome: 'fail' as const, n: result.failed },
    { outcome: 'review' as const, n: result.review },
    { outcome: 'blocked' as const, n: result.blocked },
  ]
  return (
    <span
      className="inline-flex items-center gap-xxs"
      aria-label={counts.map((c) => `${c.n} ${CASE_OUTCOME_STYLE[c.outcome].label.toLowerCase()}`).join(', ')}
    >
      {counts.map((c) => {
        const chip = CASE_OUTCOME_STYLE[c.outcome]
        return (
          <Count key={c.outcome} bg={chip.bg} ink={chip.ink} inkClass={chip.inkClass} tip={chip.label}>
            {c.n}
          </Count>
        )
      })}
    </span>
  )
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="font-body text-s text-text-tertiary leading-[1.5] whitespace-nowrap">{children}</span>
}

function Pill({ bg, ink, children }: { bg: string; ink: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-s py-xxs rounded-round font-body text-xs font-semibold leading-[1.5] whitespace-nowrap"
      style={{ backgroundColor: bg, color: ink }}
    >
      {children}
    </span>
  )
}

function Count({
  bg,
  ink,
  inkClass,
  tip,
  children,
}: {
  bg: string
  ink?: string
  inkClass?: string
  /** Hover label — what this number counts. See .count-tip in globals.css. */
  tip?: string
  children: ReactNode
}) {
  return (
    <span
      className={['count-tip inline-flex items-center justify-center min-w-[28px] px-xs py-xxs rounded-m font-display text-s font-semibold', inkClass]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: bg, color: ink }}
      data-tip={tip}
    >
      {children}
    </span>
  )
}

/** Small "report" glyph — a page with two lines. */
function ReportGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6M10 17h6" />
    </svg>
  )
}

/** Small "question" glyph — a speech bubble, for a row that was asked. */
function QuestionGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z" />
      <path d="M10 8.5a2 2 0 1 1 2.7 1.9c-.5.2-.7.6-.7 1.1v.4" />
      <path d="M12 14.4h.01" />
    </svg>
  )
}
