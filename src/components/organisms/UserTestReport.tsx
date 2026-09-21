/**
 * UserTestReport — the full report, as a document rather than a dashboard.
 *
 * The earlier version cut the same run four ways behind tabs. It was wrong for
 * what this screen is actually for: a report is read once, start to finish, and
 * then sent to someone. Tabs hid three quarters of the findings behind a click
 * nobody made, and nothing could be exported or scrolled as a whole.
 *
 * It now reads top to bottom inside a single sheet. That container is the point:
 * before it, the masthead, the part rules and the group headings floated on the
 * app's grey ground while only the summary and the finding cards were white, so
 * the report read as a stack of loose cards that happened to be adjacent. One
 * sheet makes it one object — the thing that gets scrolled, exported and mailed.
 *
 * Inside it there are exactly three levels, and each is carried by a different
 * device so none of them tie:
 *
 *   · the masthead — a filled band with its own rule, holding what the report is
 *     of and the four numbers that size it. Different ground, not bigger type,
 *     is what makes a header read as a header.
 *   · the parts — Summary and Findings, numbered, marked by a rule and by space.
 *   · the groups — each a bordered block with a filled header, findings stacked
 *     inside it on dividers. A group is now a container rather than a heading
 *     with cards loosely under it, so where one ends and the next starts is not
 *     a question about whitespace.
 *
 * Severity leads each finding, not kind. "Bug" does not tell you whether to stop
 * the build; "Blocking" does — so it is a rule down the edge of the row as well
 * as a tag, because a 60px chip cannot carry the axis a list is scanned on.
 *
 * Code-first prototype — from the reference flow (user-test-agent-flow v128).
 */

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { ReportSheetSkeleton } from '../molecules/TestingSkeletons'
import { usePageLoading } from '../../lib/pageLoading'
import { SectionHeading } from '../molecules/SectionHeading'
import { ReportFindingRow } from '../molecules/ReportFindingRow'
import { StatTile } from '../molecules/StatTile'
import { FindingsByCategoryTable, categoryRowsFor } from '../molecules/FindingsByCategoryTable'
import { ClipLightbox } from '../molecules/ClipLightbox'
import { ClipPipPlayer } from '../molecules/ClipPipPlayer'
import Button from '../ui/Button'
import {
  USER_TEST_CATEGORY_ROWS,
  USER_TEST_FINDING_GROUPS,
  USER_TEST_REPORT_META,
} from '../../lib/mocks/user-test'
import type {
  FindingGroup,
  UserTestCategoryRow,
  UserTestClip,
  UserTestIssue,
  UserTestReportMeta,
} from '../../lib/types/userTest'

export interface UserTestReportProps {
  /** The run this report belongs to — the topbar's parent crumb. */
  runName?: string
  /**
   * Renders the document alone, with no page chrome — the sheet, and the clip
   * players it opens. Used where the report is a tab inside another screen
   * (the AI behavioural run) rather than a page of its own; that host already
   * has a topbar, and a second one inside a tab is a page inside a page.
   */
  sheetOnly?: boolean
  issues: UserTestIssue[]
  meta?: UserTestReportMeta
  categories?: UserTestCategoryRow[]
  /** Leaves the report for the run it belongs to. */
  onBackToRun?: () => void
  /**
   * Fires when a reader opens an evidence clip. The player itself is handled
   * here — this is only for a host that wants to mirror it somewhere else.
   */
  onOpenClip?: (issue: UserTestIssue, clip: UserTestClip) => void
  /**
   * One extra line per finding, under its tags. The AI behavioural report fills
   * it with the persona split — the run's own dimension, which the shared
   * document has no way to know about.
   */
  findingMeta?: (issue: UserTestIssue) => ReactNode
  /** Tints each evidence chip by its clip's source — see ReportFindingRow. */
  clipTone?: (clip: UserTestClip) => string | undefined
  onExport?: () => void
  className?: string
}

export function UserTestReport({
  runName = '',
  sheetOnly = false,
  issues,
  meta = USER_TEST_REPORT_META,
  categories = USER_TEST_CATEGORY_ROWS,
  onBackToRun,
  onOpenClip,
  findingMeta,
  clipTone,
  onExport,
  className,
}: UserTestReportProps) {
  /* This screen's own beat, keyed on the run. `sheetOnly` opts out: there the
     report is embedded in a host that has already drawn its own wait, and two
     skeletons in one column read as a page that failed. */
  const loadPhase = usePageLoading(runName)
  const bugs = issues.filter((i) => i.kind === 'bug').length
  const friction = issues.filter((i) => i.kind === 'friction').length

  /* The category table counts the findings that are actually in this report.
     It used to render a fixture that travelled beside them, so a filtered cut —
     blockers only, a clean build — kept printing the full run's totals under a
     list that no longer matched. Only `sessionsAffected` still comes from the
     supplied rows: the same session appears in several categories, so the union
     is a fact the run has to report and this screen cannot derive. */
  /* Counted from the findings actually in this report — see categoryRowsFor.
     It used to render a fixture that travelled beside them, so a filtered cut —
     blockers only, a clean build — kept printing the full run's totals under a
     list that no longer matched. */
  const categoryRows = useMemo(() => categoryRowsFor(issues, categories), [issues, categories])

  /* Sections come from the fixture order, not from the data, so an empty group
     disappears instead of leaving a heading with nothing under it. */
  const sections = useMemo(
    () =>
      USER_TEST_FINDING_GROUPS.map((g) => ({
        ...g,
        findings: issues.filter((i) => i.group === g.id),
      })).filter((g) => g.findings.length > 0),
    [issues],
  )

  /* The chips jump; they do not filter. On a document, hiding six of seven
     findings behind a chip is the tab problem again with rounder corners. */
  const [flashed, setFlashed] = useState<FindingGroup | null>(null)
  /* Two ways into a clip, priced differently. Hovering a chip previews it in
     the corner — free, and enough to tell which clip a chip is. Clicking opens
     it full size in the middle of the screen, which is where you actually watch
     it. The open clip is held as a finding plus an index so the lightbox can
     walk that finding's other clips without going back to the page.

     Both live here rather than in the row so only one clip is ever on screen —
     and the preview is suppressed while the lightbox is open, or the corner
     would keep previewing chips behind the scrim. */
  const [peek, setPeek] = useState<{ issue: UserTestIssue; clip: UserTestClip } | null>(null)
  const [openClip, setOpenClip] = useState<{ issue: UserTestIssue; index: number } | null>(null)
  const active: UserTestClip | null = openClip ? openClip.issue.clips[openClip.index] ?? null : null
  const jumpTo = (id: FindingGroup) => {
    document.getElementById(`finding-group-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setFlashed(id)
    window.setTimeout(() => setFlashed((f) => (f === id ? null : f)), 1200)
  }

  /* "9 / 10" when the analysis covered fewer sessions than the batch held, so
     the masthead and every finding's denominator tell the same story. */
  const analysed = meta.analysedSessions
  const noun = meta.sessionsLabel ?? 'sessions'
  const sessionsTile =
    analysed !== undefined && analysed !== meta.sessions
      ? { value: `${analysed} / ${meta.sessions}`, label: `${noun} analysed` }
      : { value: String(meta.sessions), label: noun }

  const skeleton = Boolean(loadPhase) && !sheetOnly

  /* Built once and handed to both the skeleton and the document. The bar is
     the way back to the run page and it is known the instant this report is
     opened, so it is never drawn as grey bars — see TestingSkeletons. */
  const topbar = sheetOnly ? null : (
    <PageTopbar
      title={`Full report · ${runName}`}
      trail={[{ label: 'User Test Agent' }]}
      onBack={() => onBackToRun?.()}
      actions={
        <Button variant="secondary" size="md" disabled={skeleton} onClick={onExport}>
          Export PDF
        </Button>
      }
    />
  )

  if (skeleton)
    return (
      <ReportSheetSkeleton topbar={topbar} label={`Loading ${runName || 'report'}`} className={className} />
    )

  return (
    <div className={['flex flex-col w-full', className].filter(Boolean).join(' ')}>
      {topbar}

      <div className={sheetOnly ? 'w-full' : 'page-measure pt-xl pb-xxl3'}>
        {/* ── The sheet ──
            One container for the whole document. Everything below is inside it;
            nothing sits on the app's ground any more. */}
        <article
          className="report-sheet flex flex-col w-full rounded-3xl overflow-hidden shadow-sm"
          style={{
            backgroundColor: 'var(--bg-elements)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* ── Masthead ──
              A filled band with its own rule, not a heading that happens to be
              first. It says what this is, what it is of, and — in the tiles —
              how big it was, so a reader who opens the file cold has the shape
              of the run before the first sentence of prose. */}
          <header
            className="report-masthead flex flex-col gap-xl px-xxxl pt-xxl pb-xl"
            /* --bg-subtle, not the pale page fill. Pale is four values off the
               app's own ground, so the band read as page rather than as the
               top of the document; subtle is darker than both the ground and
               the sheet, which is what makes it land as a header. */
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            <div className="flex flex-col gap-xs">
              <div className="flex flex-wrap items-baseline gap-s">
                <span className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary leading-[1.5]">
                  {meta.kicker ?? 'User test report'}
                </span>
                <span className="flex-1" />
                {/* The run id belongs with the eyebrow — it identifies the
                    document, and left at the bottom of the block it read as a
                    footnote to the date. */}
                <span className="font-code text-xs text-text-tertiary leading-[1.5] whitespace-nowrap">
                  run #{meta.runId}
                </span>
              </div>
              <h1 className="font-display text-2xl font-semibold text-text-primary leading-[1.2]">
                {meta.title}
              </h1>
              {/* A run whose tiles already carry what it was made of leaves
                  `game` empty rather than printing the same facts twice — so
                  the separator has to go with it, not leave a leading "·". */}
              <span className="font-body text-m text-text-secondary leading-[1.6]">
                {meta.game ? `${meta.game} · ` : ''}report generated {meta.generated}
              </span>
            </div>

            {/* Tiles ride in the header rather than in a card inside Summary. A
                card inside the sheet inside the page was three nested containers
                for four numbers, and it made Summary the loudest part of a
                document whose subject is the findings. */}
            <div className="stat-tiles gap-s">
              {meta.tiles ? (
                /* A run that counts itself differently brings its own set — an
                   AI run has a pipeline (agents → sessions played → sessions
                   reviewed) where a human batch has one number. */
                meta.tiles.map((t) => (
                  <StatTile key={t.label} surface="band" value={t.value} label={t.label} dot={t.dot} />
                ))
              ) : (
                <>
              <StatTile surface="band" value={sessionsTile.value} label={sessionsTile.label} />
              <StatTile
                surface="band"
                value={meta.footageLabel}
                label={meta.footageTileLabel ?? 'session reviewed'}
              />
              <StatTile surface="band" value={String(bugs)} label="bugs" dot="var(--error)" />
              <StatTile
                surface="band"
                value={String(friction)}
                label="friction points"
                dot="var(--warning)"
              />
                </>
              )}
            </div>
          </header>

          <div className="report-body flex flex-col px-xxxl pt-xxl pb-xxl3">
            {/* ── 01 Summary ── */}
            <PartHeader index="01" label="Summary" first />

            {/* Document ink, not UI ink. Secondary is the right grey for a label
                beside a control; for four lines of prose that someone reads
                rather than scans it is a whisper, so the body of the report runs
                at primary and the metadata around it keeps the grey. */}
            <p className="font-body text-m text-text-primary leading-[1.75] max-w-[86ch] pt-l">
              {meta.narrative}
            </p>

            {/* A table of nothing is worse than no table: on a clean build the
                heading and the four column labels were the only thing left, and
                they read as a report that had failed to load. */}
            {categoryRows.length > 0 && (
              <>
            <SectionLabel className="pt-xxl pb-s">Findings by category</SectionLabel>
            <FindingsByCategoryTable rows={categoryRows} />
              </>
            )}

            {/* ── 02 Findings ── */}
            {/* No meta line. It read "9 findings in 4 groups · each with clips
                and a recommendation" directly above a rail of chips that says
                "Stability & functional 2 · Usability friction 4 · Struggle 2 ·
                Visual 1" — the same two numbers, spelled out, one line earlier.
                The exception is a clean build, where there are no chips and the
                heading would otherwise stand over nothing. */}
            <PartHeader
              index="02"
              label="Findings"
              meta={issues.length === 0 ? 'nothing to report' : undefined}
            >
              <div className="flex flex-wrap items-center gap-xs pt-xs">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => jumpTo(s.id)}
                    className="finding-chip inline-flex items-center gap-xs rounded-round px-m py-xxs font-body text-s text-text-primary leading-[1.5]"
                    style={{
                      backgroundColor: 'var(--bg-page-pale)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {s.chip}
                    <span className="font-semibold">{s.findings.length}</span>
                  </button>
                ))}
              </div>
            </PartHeader>

            <div className="flex flex-col pt-l">
              {/* A clean build is the outcome this run most wants to report, and
                  it had no state: the part header printed "0 findings in 0
                  groups · each with clips and a recommendation" over nothing at
                  all, which reads as a report that failed rather than as a build
                  that passed. Said plainly, and said as a result. */}
              {sections.length === 0 && (
                <div
                  className="flex flex-col gap-xs items-start w-full rounded-2xl px-xl py-xl"
                  style={{
                    backgroundColor: 'var(--bg-page-pale)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">
                    No findings in this run
                  </span>
                  <span className="font-body text-m text-text-secondary leading-[1.7] max-w-[74ch]">
                    Nothing blocked a session and nothing recoverable was recorded across the{' '}
                    {analysed ?? meta.sessions} session
                    {(analysed ?? meta.sessions) === 1 ? '' : 's'} the agent read. The footage is
                    still in the Gameplay Library if you want to watch it.
                  </span>
                </div>
              )}

              {sections.map((section) => {
                return (
                  <section
                    key={section.id}
                    id={`finding-group-${section.id}`}
                    className="finding-group flex flex-col w-full rounded-2xl overflow-hidden scroll-mt-xxl"
                    style={{
                      border: '1px solid var(--border-subtle)',
                      boxShadow: flashed === section.id ? '0 0 0 3px var(--bg-tint)' : undefined,
                      transition: 'box-shadow 400ms ease',
                    }}
                  >
                    {/* The group's own header — filled, so the block it opens is
                        unmistakable, and the count and the note sit on it rather
                        than trailing the heading as an afterthought. */}
                    <div
                      className="flex flex-col gap-xxs px-xl py-m"
                      style={{
                        backgroundColor: 'var(--bg-page-pale)',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-s">
                        {/* 20px: one step under the 24px part heading above it
                            and one step over the 16px finding titles beneath.
                            It sat at 20px against a 20px part and tied for
                            loudest, then at 16px against 16px titles and tied
                            with those instead — four levels need four sizes,
                            not three sizes and a weight. */}
                        {/* The blocking count used to sit here as a tag. It was
                            the third place the same fact was printed — the
                            summary table has a Blocking column, and every
                            blocking finding carries its own severity rule and
                            tag inside the group. A tag that only repeats what
                            the rows below it already say is noise on the
                            heading, so the heading carries the name alone. */}
                        <h3 className="flex-1 min-w-0 font-display text-l font-semibold text-text-primary leading-[1.35]">
                          {section.heading}
                        </h3>
                      </div>
                      {/* The note gets its own line. Beside the heading it
                          crowded the blocking badge as soon as the window
                          narrowed, and it is a caption, not a qualifier the
                          heading needs to be read with. */}
                      <span className="font-body text-s text-text-secondary leading-[1.6]">
                        {section.findings.length} finding{section.findings.length === 1 ? '' : 's'}
                        {section.note ? ` · ${section.note}` : ''}
                      </span>
                    </div>

                    {section.findings.map((issue) => (
                      <ReportFindingRow
                        key={issue.id}
                        issue={issue}
                        /* The chip stays lit for whichever of the two is
                           showing — the open clip wins, since the preview is
                           hidden behind it. */
                        meta={findingMeta?.(issue)}
                        countNoun={noun}
                        clipTone={clipTone}
                        activeClip={
                          openClip?.issue.id === issue.id
                            ? active
                            : peek?.issue.id === issue.id
                              ? peek.clip
                              : null
                        }
                        onPeekClip={(clip) => setPeek({ issue, clip })}
                        onLeaveClip={() => setPeek(null)}
                        onPinClip={(clip) => {
                          setPeek(null)
                          setOpenClip({ issue, index: issue.clips.indexOf(clip) })
                          onOpenClip?.(issue, clip)
                        }}
                      />
                    ))}
                  </section>
                )
              })}
            </div>
          </div>
        </article>
      </div>

      {peek && !openClip && (
        <ClipPipPlayer
          tester={peek.clip.tester}
          timeRange={peek.clip.timeRange}
          note={peek.clip.note}
          caption={peek.issue.title}
        />
      )}

      {openClip && active && (
        <ClipLightbox
          tester={active.tester}
          timeRange={active.timeRange}
          note={active.note}
          caption={openClip.issue.title}
          position={`clip ${openClip.index + 1} of ${openClip.issue.clips.length}`}
          onPrev={
            openClip.index > 0
              ? () => setOpenClip((c) => (c ? { ...c, index: c.index - 1 } : c))
              : undefined
          }
          onNext={
            openClip.index < openClip.issue.clips.length - 1
              ? () => setOpenClip((c) => (c ? { ...c, index: c.index + 1 } : c))
              : undefined
          }
          onClose={() => setOpenClip(null)}
        />
      )}
    </div>
  )
}

/* ── Building blocks ─────────────────────────────────────────────────────── */

/**
 * A part of the document — 01 Summary, 02 Findings. Marked by a rule, by the
 * space above it and by its number rather than by type size, so the group
 * headings inside a part can stay the largest thing in it without two levels
 * tying for loudest. The number is what makes the parts countable at a glance:
 * a reader who sees 01 knows there is a 02 below.
 */
/**
 * Exported for the report's own loading state, which draws the same parts in
 * the same places so nothing moves when the findings land.
 */
export function PartHeader({
  index,
  label,
  meta,
  first,
  children,
}: {
  index: string
  label: string
  meta?: string
  /** The masthead's own rule already separates the first part; a second rule
      under it read as a double border. */
  first?: boolean
  children?: ReactNode
}) {
  return (
    <div
      className={['report-part flex flex-col gap-xs', first ? 'report-part-first' : 'pt-xxl']
        .filter(Boolean)
        .join(' ')}
      style={first ? undefined : { borderTop: '2px solid var(--border-default)' }}
    >
      {/* Same heading the run summary uses — the report is that summary one
          level down, and a section that changes shape between the two reads as
          a different document. */}
      <SectionHeading index={index} title={label} meta={meta} />
      {children}
    </div>
  )
}

function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={[
        'font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
