/**
 * TestingSkeletons — one loading shape per screen in the Testing area.
 *
 * A loading surface should be the finished surface with its facts missing: the
 * masthead where the masthead will be, the tiles where the tiles will be, rows
 * where the rows will be. The reader then knows what is coming and where to
 * look for it before there is anything to look at, and nothing reflows when it
 * lands. A spinner in the middle of an empty page says "wait" and nothing else;
 * an empty page says "there is nothing here", which is the one wrong answer
 * while data is in flight.
 *
 * So these are not one shared grey rectangle reused six times. Each screen in
 * the area has its own, because each screen has its own shape:
 *
 *   TestingPageSkeleton   a page-header screen ARRIVING — header, tabs and
 *                         body, all unknown.
 *   TestingBodySkeleton   the same screen REFRESHING — its body alone, because
 *                         its header and its tab bar are already on the page
 *                         and correct. Blanking those would erase the tab the
 *                         reader just pressed, and the active-tab marker with
 *                         it. The body is a two-zone composer, one composer
 *                         card, or a run-history table.
 *   ReportSheetSkeleton   a report: topbar, then the sheet with its masthead
 *                         band, its tile row and its numbered parts.
 *   VerifiedReportSkeleton a functional report: the two meters, the case-file
 *                         bar, the toolbar, and the case table.
 *   RunPageSkeleton       the User Test run page — a request bubble, the
 *                         agent's reply panel, and the composer at the foot.
 *   SessionViewerSkeleton the agent session viewer — the recording well beside
 *                         its reading panel, and the filmstrip under it.
 *   MediaGridSkeleton     a grid of session cards.
 *   LibrarySkeleton       the Gameplay Library — its toolbar over a card grid.
 *   OverviewSkeleton      the Testing overview — hero, then two groups of test
 *                         cards.
 *
 * None of these covers a wait with an agent behind it. A run that is queued,
 * playing or being analysed has something to say about itself and says it in
 * words — see ReportPending and QueuedNotice. A skeleton there would claim the
 * page is still arriving when what is happening is that 6labs is working.
 *
 * ── The topbar is never a skeleton ──
 *
 * Every screen that has a PageTopbar passes its REAL one in through `topbar`.
 * That bar is navigation — the chevron and the trail are the way back out —
 * and a reader who cannot see the exit while a page loads is stuck in it. It
 * is also already true: the run's name came from the row that was clicked and
 * the parent is the screen you are standing in, so greying it blinks a title
 * that never changed. Nothing above the content is ever unknown.
 *
 * Decorative throughout: each surface announces itself once with a real
 * `role="status"` line that screen readers get, and none of the bars talk.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ReactNode } from 'react'
import { Skeleton, SkeletonText } from '../atoms/Skeleton'

/* ── Shared bits ──────────────────────────────────────────────────────────── */

/** The `role="status"` line every skeleton carries, and nothing draws. */
function Announce({ label }: { label: string }) {
  return (
    <span className="sr-only" role="status">
      {label}
    </span>
  )
}

/** The tile row a report masthead carries. */
function TileRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="stat-tiles gap-s" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex flex-col gap-xs rounded-xl px-m py-s"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
        >
          <Skeleton variant="text" width={54} height={22} radius="rounded-m" />
          <Skeleton variant="text" width={86} height={10} radius="rounded-xs" />
        </div>
      ))}
    </div>
  )
}

/** A numbered part heading — the index chip and its title. */
function PartHeadingSkeleton({ titleWidth = 120 }: { titleWidth?: number }) {
  return (
    <div className="flex items-center gap-s" aria-hidden>
      <Skeleton variant="block" width={22} height={22} radius="rounded-s" />
      <Skeleton variant="text" width={titleWidth} height={18} radius="rounded-xs" />
    </div>
  )
}

/** The sheet every report is drawn inside. */
function SheetSkeleton({ children }: { children: ReactNode }) {
  return (
    <article
      className="report-sheet skeleton-surface flex flex-col w-full rounded-3xl overflow-hidden shadow-sm"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      aria-busy
    >
      {children}
    </article>
  )
}

/* ── Page-header screens ──────────────────────────────────────────────────── */

export type TestingSkeletonBody = 'composer' | 'card' | 'list'

export interface TestingPageSkeletonProps {
  body?: TestingSkeletonBody
  /** What is loading, for assistive tech. Never drawn. */
  label?: string
  className?: string
}

export function TestingPageSkeleton({
  body = 'composer',
  label = 'Loading',
  className,
}: TestingPageSkeletonProps) {
  return (
    <div
      className={['flex flex-col gap-l page-measure pt-[120px] pb-xxl3', className].filter(Boolean).join(' ')}
      aria-busy
    >
      <Announce label={label} />

      {/* Header — icon tile, title, description, in the shape TestingPageHeader
          draws them. */}
      <div className="flex items-start gap-m w-full" aria-hidden>
        <Skeleton variant="block" width={64} height={64} radius="rounded-2xl" />
        <div className="flex flex-col gap-xs flex-1 min-w-0 pt-xxs">
          <Skeleton variant="text" width={260} height={28} radius="rounded-m" />
          <SkeletonText lines={2} lineHeight={13} gap={10} lastWidth="46%" className="max-w-[62ch]" />
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-l w-full pb-xs"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
        aria-hidden
      >
        <Skeleton variant="text" width={70} height={13} radius="rounded-xs" />
        <Skeleton variant="text" width={96} height={13} radius="rounded-xs" />
      </div>

      <TestingBodySkeleton body={body} />
    </div>
  )
}

/**
 * The body of a page-header screen, on its own — for a screen that is already
 * up and is refetching the panel below its tabs.
 */
export function TestingBodySkeleton({ body = 'composer' }: { body?: TestingSkeletonBody }) {
  return body === 'composer' ? <ComposerBody /> : body === 'card' ? <CardBody /> : <ListBody />
}

/** Two zones side by side, then the card that carries the action. */
function ComposerBody() {
  return (
    <div className="flex flex-col gap-m w-full" aria-hidden>
      <div className="grid gap-m w-full" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-xs rounded-3xl min-h-[200px] px-l"
            style={{ border: '2px dashed var(--border-subtle)', backgroundColor: 'var(--bg-elements)' }}
          >
            <Skeleton variant="block" width={44} height={44} radius="rounded-xl" />
            <Skeleton variant="text" width={150} height={15} radius="rounded-xs" />
            <Skeleton variant="text" width={220} height={12} radius="rounded-xs" />
          </div>
        ))}
      </div>
      <div
        className="flex flex-col gap-m rounded-3xl px-xl py-l w-full"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      >
        <Skeleton variant="text" width={80} height={11} radius="rounded-xs" />
        <Skeleton variant="block" width="100%" height={40} radius="rounded-l" />
        <div className="flex items-center gap-m pt-m" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="flex-1" />
          <Skeleton variant="block" width={140} height={40} radius="rounded-l" />
        </div>
      </div>
    </div>
  )
}

/**
 * One tall card — the shape User Test and AI behavioural compose in: a mode or
 * heading row ruled off, a body, then a ruled action row.
 */
function CardBody() {
  return (
    <div className="flex flex-col gap-m w-full" aria-hidden>
      <div
        className="flex flex-col w-full rounded-4xl px-xl pt-l pb-m"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className="flex items-center gap-xs pb-m mb-m"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <Skeleton variant="block" width={150} height={36} radius="rounded-m" />
          <Skeleton variant="block" width={130} height={36} radius="rounded-m" />
        </div>
        <div
          className="flex flex-col items-center justify-center gap-xs rounded-3xl py-xl"
          style={{ border: '1px dashed var(--border-subtle)' }}
        >
          <Skeleton variant="block" width={132} height={40} radius="rounded-l" />
          <Skeleton variant="text" width={280} height={12} radius="rounded-xs" />
        </div>
        <div className="flex flex-col gap-xs pt-m">
          <Skeleton variant="text" width={80} height={11} radius="rounded-xs" />
          <Skeleton variant="block" width="100%" height={40} radius="rounded-l" />
        </div>
        <div
          className="flex items-center gap-m pt-m mt-m"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <Skeleton variant="block" width={160} height={32} radius="rounded-round" />
          <span className="flex-1" />
          <Skeleton variant="block" width={140} height={40} radius="rounded-l" />
        </div>
      </div>
    </div>
  )
}

/** A table card: header row, then rows at the height a run history row is. */
function ListBody() {
  const GRID = '40px minmax(0, 1fr) 184px 200px 72px 124px'
  return (
    <div
      className="flex flex-col w-full rounded-2xl"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      aria-hidden
    >
      <div
        className="grid items-center gap-m px-l pt-m pb-xs"
        style={{ gridTemplateColumns: GRID, borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span />
        {[60, 44, 52, 38].map((w) => (
          <Skeleton key={w} variant="text" width={w} height={9} radius="rounded-xs" />
        ))}
        <span />
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="grid items-center gap-m px-l py-m"
          style={{
            gridTemplateColumns: GRID,
            borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
          }}
        >
          <Skeleton variant="block" width={40} height={40} radius="rounded-xl" />
          <div className="flex flex-col gap-xxs min-w-0">
            <Skeleton variant="text" width={`${52 + ((i * 11) % 30)}%`} height={13} radius="rounded-xs" />
            <Skeleton variant="text" width={`${32 + ((i * 7) % 20)}%`} height={11} radius="rounded-xs" />
          </div>
          <Skeleton variant="bar" width={96} height={20} radius="rounded-m" />
          <Skeleton variant="bar" width={110} height={20} radius="rounded-round" />
          <Skeleton variant="text" width={40} height={11} radius="rounded-xs" />
          <div className="flex justify-end">
            <Skeleton variant="block" width={104} height={32} radius="rounded-l" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Reports ──────────────────────────────────────────────────────────────── */

/**
 * A findings report — User Test's, and the AI behavioural one that shares it.
 * Masthead band with its tiles, then the numbered parts: a paragraph of
 * summary, a category table, and the finding rows.
 */
export function ReportSheetSkeleton({
  label = 'Loading report',
  tiles = 4,
  topbar,
  /**
   * The sheet alone, for a host that already owns the bar and the column —
   * the behavioural run screen draws the topbar and the Report/Videos tabs
   * above it, and a second bar under the real one reads as a broken page.
   */
  sheetOnly = false,
  className,
}: {
  label?: string
  tiles?: number
  /** The host's own PageTopbar — real, never drawn as bars. See the note above. */
  topbar?: ReactNode
  sheetOnly?: boolean
  className?: string
}) {
  const sheet = (
    <SheetSkeleton>
          <header
            className="report-masthead flex flex-col gap-xl px-xxxl pt-xxl pb-xl"
            style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}
            aria-hidden
          >
            <div className="flex flex-col gap-xs">
              <div className="flex items-baseline gap-s">
                <Skeleton variant="text" width={140} height={11} radius="rounded-xs" />
                <span className="flex-1" />
                <Skeleton variant="text" width={80} height={11} radius="rounded-xs" />
              </div>
              <Skeleton variant="text" width="46%" height={32} radius="rounded-m" />
              <Skeleton variant="text" width={260} height={14} radius="rounded-xs" />
            </div>
            <TileRowSkeleton count={tiles} />
          </header>

          <div className="report-body flex flex-col gap-l px-xxxl pt-xxl pb-xxl3" aria-hidden>
            <PartHeadingSkeleton />
            <SkeletonText lines={3} lineHeight={14} gap={14} lastWidth="58%" className="max-w-[86ch]" />

            {/* Findings by category — a table with four rows. */}
            <div
              className="flex flex-col rounded-xl overflow-hidden mt-s"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-l h-[40px] px-m" style={{ backgroundColor: 'var(--bg-page-pale)' }}>
                <Skeleton variant="text" width={90} height={9} radius="rounded-xs" />
                <span className="flex-1" />
                <Skeleton variant="text" width={60} height={9} radius="rounded-xs" />
                <Skeleton variant="text" width={110} height={9} radius="rounded-xs" />
              </div>
              {[62, 48, 55, 44].map((w) => (
                <div
                  key={w}
                  className="flex items-center gap-l px-m py-s"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <Skeleton variant="circle" width={8} />
                  <Skeleton variant="text" width={w * 2} height={12} radius="rounded-xs" />
                  <span className="flex-1" />
                  <Skeleton variant="text" width={24} height={12} radius="rounded-xs" />
                  <Skeleton variant="text" width={24} height={12} radius="rounded-xs" />
                </div>
              ))}
            </div>

            <PartHeadingSkeleton titleWidth={96} />
            {/* Two finding rows — title with its reach, tags, prose, evidence. */}
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-s w-full rounded-xl px-xl py-l"
                style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-baseline gap-s">
                  <Skeleton variant="text" width={`${54 + i * 8}%`} height={16} radius="rounded-xs" />
                  <span className="flex-1" />
                  <Skeleton variant="text" width={70} height={14} radius="rounded-xs" />
                </div>
                <div className="flex items-center gap-xs">
                  <Skeleton variant="bar" width={68} height={18} radius="rounded-s" />
                  <Skeleton variant="bar" width={120} height={18} radius="rounded-s" />
                </div>
                <SkeletonText lines={2} lineHeight={13} gap={12} lastWidth="52%" className="max-w-[86ch]" />
                <div className="flex items-center gap-xs">
                  {[0, 1, 2, 3, 4].map((c) => (
                    <Skeleton key={c} variant="block" width={28} height={28} radius="rounded-s" />
                  ))}
                </div>
                <div className="rounded-xl px-l py-m" style={{ backgroundColor: 'var(--bg-tint-light)' }}>
                  <SkeletonText lines={2} lineHeight={13} gap={12} lastWidth="40%" />
                </div>
              </div>
          ))}
        </div>
      </SheetSkeleton>
  )

  if (sheetOnly) {
    return (
      <div className={['w-full', className].filter(Boolean).join(' ')}>
        <Announce label={label} />
        {sheet}
      </div>
    )
  }

  return (
    <div className={['flex flex-col w-full', className].filter(Boolean).join(' ')}>
      <Announce label={label} />
      {topbar}
      <div className="page-measure pt-xl pb-xxl3">{sheet}</div>
    </div>
  )
}

/**
 * A functional report — the two meters, the sheet the run was verified
 * against, the toolbar, and the case table. A different document from the
 * findings report, so a different skeleton: what arrives here is a table, and
 * a reader waiting on one should be looking at where its columns will be.
 */
export function VerifiedReportSkeleton({
  label = 'Loading report',
  topbar,
  className,
}: {
  label?: string
  /** The host's own PageTopbar — real, never drawn as bars. */
  topbar?: ReactNode
  className?: string
}) {
  return (
    <div className={['flex flex-col w-full', className].filter(Boolean).join(' ')}>
      <Announce label={label} />
      {topbar}
      <div className="flex flex-col gap-m page-measure pt-l pb-xxl3" aria-hidden>
        {/* The two meters, in one card, under the run's own masthead band. */}
        <section
          className="skeleton-surface flex flex-col w-full rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
          aria-busy
        >
          <header
            className="flex flex-col gap-xs px-l py-m"
            style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}
          >
            <Skeleton variant="text" width={150} height={10} radius="rounded-xs" />
            <Skeleton variant="text" width="38%" height={24} radius="rounded-m" />
          </header>
          <div className="summary-meters">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={['summary-meter flex flex-col gap-s px-l py-m', i === 1 && 'summary-meter-divided']
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="flex items-baseline gap-xs">
                  <Skeleton variant="text" width={62} height={10} radius="rounded-xs" />
                  <Skeleton variant="text" width={140} height={10} radius="rounded-xs" />
                </div>
                <div className="flex items-baseline gap-s">
                  <Skeleton variant="text" width={96} height={30} radius="rounded-m" />
                  <Skeleton variant="text" width={70} height={13} radius="rounded-xs" />
                </div>
                <Skeleton variant="bar" width="100%" height={8} />
                {i === 0 ? (
                  <div className="outcome-tiles m-0">
                    {[0, 1, 2, 3].map((t) => (
                      <div key={t} className="flex flex-col gap-xxs rounded-m px-s py-xs">
                        <Skeleton variant="text" width={48} height={18} radius="rounded-xs" />
                        <Skeleton variant="text" width={62} height={10} radius="rounded-xs" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Skeleton variant="text" width="60%" height={11} radius="rounded-xs" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Verified against */}
        <div
          className="flex items-center gap-s rounded-xl px-m py-s"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
        >
          <Skeleton variant="text" width={110} height={10} radius="rounded-xs" />
          <Skeleton variant="text" width={170} height={12} radius="rounded-xs" />
        </div>

        {/* Toolbar: search, category select, then the outcome segments. */}
        <div className="flex flex-col gap-s">
          <div className="flex items-center gap-s">
            <Skeleton variant="block" width="100%" height={40} radius="rounded-l" className="flex-1" />
            <Skeleton variant="block" width={200} height={40} radius="rounded-l" />
          </div>
          <div className="flex items-center gap-xs">
            {[64, 78, 84, 108, 106].map((w) => (
              <Skeleton key={w} variant="block" width={w} height={32} radius="rounded-m" />
            ))}
          </div>
        </div>

        {/* The case table. */}
        <div
          className="flex flex-col w-full rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="grid items-center gap-m px-l py-s"
            style={{
              gridTemplateColumns: '84px minmax(0, 1fr) 150px minmax(0, 1fr) 96px 24px',
              backgroundColor: 'var(--bg-page-pale)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {[30, 70, 64, 52, 46].map((w) => (
              <Skeleton key={w} variant="text" width={w} height={9} radius="rounded-xs" />
            ))}
            <span />
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="grid items-center gap-m px-l py-m"
              style={{
                gridTemplateColumns: '84px minmax(0, 1fr) 150px minmax(0, 1fr) 96px 24px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              <Skeleton variant="text" width={58} height={11} radius="rounded-xs" />
              <Skeleton variant="text" width={`${62 + ((i * 9) % 28)}%`} height={13} radius="rounded-xs" />
              <div className="flex flex-col gap-xxs">
                <Skeleton variant="text" width={82} height={12} radius="rounded-xs" />
                <Skeleton variant="text" width={64} height={10} radius="rounded-xs" />
              </div>
              <Skeleton variant="text" width={`${54 + ((i * 13) % 30)}%`} height={12} radius="rounded-xs" />
              <Skeleton variant="bar" width={64} height={20} radius="rounded-s" />
              <Skeleton variant="circle" width={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Run page ─────────────────────────────────────────────────────────────── */

/**
 * The User Test run page, read as a conversation: the request you sent, the
 * agent's reply under it, and the composer waiting at the foot. The reply is
 * the tall one — agent block, sources band, tiles, prose — so that is where
 * the shape has to be right.
 */
export function RunPageSkeleton({
  label = 'Loading run',
  topbar,
  className,
}: {
  label?: string
  /** The host's own PageTopbar — real, never drawn as bars. */
  topbar?: ReactNode
  className?: string
}) {
  return (
    <div className={['flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      <Announce label={label} />
      {topbar}
      <div className="flex-1 w-full">
        <div className="flex flex-col gap-l page-measure pt-l pb-m" aria-hidden>
          {/* The request — right-aligned, the way a sent message reads. */}
          <div className="flex justify-end w-full">
            <Skeleton variant="block" width={300} height={48} radius="rounded-2xl" />
          </div>

          <div
            className="skeleton-surface flex flex-col w-full rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
            aria-busy
          >
            {/* Who answered */}
            <div className="flex items-center gap-s px-l pt-l pb-m">
              <Skeleton variant="block" width={44} height={44} radius="rounded-xl" />
              <div className="flex flex-col gap-xxs">
                <Skeleton variant="text" width={132} height={15} radius="rounded-xs" />
                <Skeleton variant="text" width={180} height={12} radius="rounded-xs" />
              </div>
            </div>
            {/* Sources band */}
            <div
              className="flex items-center gap-s px-l py-m"
              style={{
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-inset)',
              }}
            >
              <Skeleton variant="text" width={100} height={13} radius="rounded-xs" />
            </div>
            {/* 01 Summary — tiles, then the paragraph they size. */}
            <div className="flex flex-col gap-m px-l py-l">
              <PartHeadingSkeleton />
              <TileRowSkeleton />
              <SkeletonText lines={2} lineHeight={15} gap={14} lastWidth="54%" className="max-w-[86ch]" />
            </div>
            {/* 02 Top findings */}
            <div className="flex flex-col gap-m px-l py-l" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <PartHeadingSkeleton titleWidth={104} />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-s rounded-xl px-m py-s"
                  style={{ border: '1px solid var(--border-subtle)' }}
                >
                  <Skeleton variant="block" width={24} height={24} radius="rounded-s" />
                  <Skeleton variant="text" width={`${48 + ((i * 11) % 26)}%`} height={13} radius="rounded-xs" />
                  <span className="flex-1" />
                  <Skeleton variant="text" width={56} height={12} radius="rounded-xs" />
                </div>
              ))}
            </div>
            {/* The way down to the evidence */}
            <div
              className="flex items-center gap-m px-l py-m"
              style={{ backgroundColor: 'var(--bg-tint-light)', borderTop: '1px solid var(--border-subtle)' }}
            >
              <Skeleton variant="text" width={220} height={13} radius="rounded-xs" />
              <span className="flex-1" />
              <Skeleton variant="block" width={150} height={40} radius="rounded-l" />
            </div>
          </div>
        </div>
      </div>
      {/* The composer, where it always is. */}
      <div className="sticky bottom-0 w-full flex justify-center py-m" aria-hidden>
        <div className="page-measure w-full">
          <Skeleton variant="block" width="100%" height={72} radius="rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

/* ── Session viewer ───────────────────────────────────────────────────────── */

/**
 * One agent's session: the recording well on the left at the one size every
 * well now is, the screen-by-screen reading beside it, and the filmstrip under
 * it. The well is drawn as the matte it uses when it has no frame, not as a
 * grey bar — the pane is the subject of this screen and it has its own colour.
 */
export function SessionViewerSkeleton({
  label = 'Loading session',
  topbar,
  className,
}: {
  label?: string
  /** The host's own PageTopbar — real, never drawn as bars. */
  topbar?: ReactNode
  className?: string
}) {
  return (
    <div className={['flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      <Announce label={label} />
      {topbar}
      <div className="flex flex-col gap-m w-full page-measure page-measure-wide mx-auto pt-l pb-xxl3" aria-hidden>
        <div
          className="skeleton-surface flex flex-col w-full rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
          aria-busy
        >
          <div className="flex items-center gap-s px-l py-m" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <Skeleton variant="block" width={40} height={40} radius="rounded-xl" />
            <div className="flex flex-col gap-xxs">
              <Skeleton variant="text" width={180} height={15} radius="rounded-xs" />
              <Skeleton variant="text" width={220} height={12} radius="rounded-xs" />
            </div>
            <span className="flex-1" />
            <Skeleton variant="text" width={60} height={13} radius="rounded-xs" />
            <Skeleton variant="text" width={72} height={13} radius="rounded-xs" />
          </div>

          <div className="agent-session-layout w-full" data-media="portrait">
            <div className="flex flex-col min-w-0">
              {/* The well, in its own waiting treatment rather than as a grey
                  block — same matte and sweep a live session shows while the
                  frame is still coming. */}
              <div className="recording-well" data-orientation="portrait" data-pending="true">
                <div className="recording-well-waiting">
                  <div className="recording-well-waiting-device" />
                </div>
              </div>
              <div className="flex items-center gap-s px-m py-s" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <Skeleton variant="circle" width={28} />
                <Skeleton variant="text" width={72} height={11} radius="rounded-xs" />
                <Skeleton variant="bar" width="100%" height={6} className="flex-1" />
                <Skeleton variant="text" width={80} height={11} radius="rounded-xs" />
              </div>
            </div>

            {/* The reading of the current screen. */}
            <div className="agent-screen-panel flex flex-col gap-m px-l py-l">
              <Skeleton variant="text" width={110} height={10} radius="rounded-xs" />
              <Skeleton variant="text" width={160} height={24} radius="rounded-m" />
              <Skeleton variant="text" width={60} height={10} radius="rounded-xs" />
              <SkeletonText lines={2} lineHeight={13} gap={12} lastWidth="62%" />
              <div className="rounded-xl px-m py-s" style={{ backgroundColor: 'var(--bg-page-pale)' }}>
                <Skeleton variant="text" width={72} height={10} radius="rounded-xs" />
                <div className="pt-xs">
                  <SkeletonText lines={2} lineHeight={12} gap={10} lastWidth="48%" />
                </div>
              </div>
              <Skeleton variant="text" width={60} height={10} radius="rounded-xs" />
              <Skeleton variant="text" width="70%" height={15} radius="rounded-xs" />
              <Skeleton variant="text" width="52%" height={12} radius="rounded-xs" />
            </div>
          </div>

          {/* Filmstrip */}
          <div className="flex items-center gap-s px-l py-m" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="block" width={96} height={62} radius="rounded-m" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Media grid ───────────────────────────────────────────────────────────── */

/**
 * A grid of session cards — the Videos tab of a run, and any other card grid
 * in the area. The media slot keeps the well's own 4:3 card shape so the grid
 * does not resize when the real cards land.
 */
export function MediaGridSkeleton({
  label = 'Loading sessions',
  count = 8,
  className,
}: {
  label?: string
  count?: number
  className?: string
}) {
  return (
    <section
      className={['flex flex-col w-full rounded-2xl overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      aria-busy
    >
      <Announce label={label} />
      <div className="flex items-center gap-xs px-l pt-l pb-m" aria-hidden>
        <Skeleton variant="text" width={110} height={13} radius="rounded-xs" />
        <Skeleton variant="text" width={54} height={11} radius="rounded-xs" />
      </div>
      <div
        className="grid gap-m px-l pb-l pt-m"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          borderTop: '1px solid var(--border-subtle)',
        }}
        aria-hidden
      >
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            {/* `height: auto` explicitly — Skeleton writes its own height into
                the style attribute before the override, so an aspect ratio
                alone left the media slot at zero and the grid read as a stack
                of thin bars. */}
            <Skeleton
              variant="block"
              width="100%"
              radius="rounded-none"
              style={{ height: 'auto', aspectRatio: '4 / 3' }}
            />
            <div className="flex flex-col gap-xxs px-m py-s">
              <Skeleton variant="text" width={`${60 + ((i * 9) % 26)}%`} height={13} radius="rounded-xs" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * The Gameplay Library — a toolbar of tag pills and a search field over the
 * same card grid a run's Videos tab shows. Its own skeleton rather than the
 * grid's alone, because the toolbar is the part a reader reaches for first and
 * a grid that appears without it jumps when it arrives.
 */
export function LibrarySkeleton({
  label = 'Loading Gameplay Library',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={['flex flex-col gap-xl page-measure pt-[120px] pb-[120px]', className].filter(Boolean).join(' ')}
      aria-busy
    >
      <Announce label={label} />
      <div className="flex items-start gap-m w-full" aria-hidden>
        <Skeleton variant="block" width={56} height={56} radius="rounded-2xl" />
        <div className="flex flex-col gap-xs flex-1 min-w-0 pt-xxs">
          <Skeleton variant="text" width={240} height={26} radius="rounded-m" />
          <Skeleton variant="text" width={380} height={13} radius="rounded-xs" />
        </div>
        <Skeleton variant="block" width={140} height={40} radius="rounded-l" />
      </div>
      <div className="flex items-center gap-xs flex-wrap w-full" aria-hidden>
        {[64, 96, 86, 78, 70].map((w) => (
          <Skeleton key={w} variant="block" width={w} height={32} radius="rounded-round" />
        ))}
        <span className="flex-1" />
        <Skeleton variant="block" width={300} height={40} radius="rounded-l" />
      </div>
      <MediaGridSkeleton label={label} count={9} />
    </div>
  )
}

/* ── Overview ─────────────────────────────────────────────────────────────── */

/**
 * The Testing overview: the hero that says what the area is for, then the two
 * groups of test cards. Four cards per row, because that is what lands.
 */
export function OverviewSkeleton({
  label = 'Loading overview',
  className,
}: {
  label?: string
  className?: string
}) {
  const group = (rows: number) => (
    <div className="flex flex-col gap-m w-full">
      <div className="flex flex-col gap-xxs">
        <Skeleton variant="text" width={190} height={22} radius="rounded-m" />
        <Skeleton variant="text" width={240} height={13} radius="rounded-xs" />
      </div>
      <div className="grid gap-m w-full" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="flex flex-col gap-s rounded-2xl px-l py-l"
            style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-s">
              <Skeleton variant="block" width={40} height={40} radius="rounded-xl" />
              <span className="flex-1" />
              <Skeleton variant="bar" width={56} height={18} radius="rounded-s" />
            </div>
            <Skeleton variant="text" width="72%" height={16} radius="rounded-xs" />
            <SkeletonText lines={2} lineHeight={12} gap={10} lastWidth="56%" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div
      className={['flex flex-col gap-xxl3 page-measure pt-[120px] pb-xxl3', className].filter(Boolean).join(' ')}
      aria-busy
    >
      <Announce label={label} />
      <div className="flex flex-col items-center gap-m w-full pb-l" aria-hidden>
        <Skeleton variant="bar" width={340} height={28} radius="rounded-round" />
        <Skeleton variant="text" width="58%" height={44} radius="rounded-m" />
        <Skeleton variant="text" width="34%" height={44} radius="rounded-m" />
        <Skeleton variant="text" width={320} height={14} radius="rounded-xs" />
      </div>
      <div aria-hidden>{group(4)}</div>
      <div aria-hidden>{group(4)}</div>
    </div>
  )
}
