/**
 * UserTestReport — the full report, as a document rather than a dashboard.
 *
 * The earlier version cut the same run four ways behind tabs. It was wrong for
 * what this screen is actually for: a report is read once, start to finish, and
 * then sent to someone. Tabs hid three quarters of the findings behind a click
 * nobody made, and nothing could be exported or scrolled as a whole.
 *
 * So it reads top to bottom. The masthead says what this is and of what; the
 * summary card sizes it and states the outcome in prose; the category table is
 * the only place the run is counted rather than described. Then every finding,
 * grouped by what a reader would fix together, each with its evidence clips and
 * one recommendation — because a finding without a recommendation is an
 * observation, and the report does not ship those.
 *
 * Severity leads each card, not kind. "Bug" does not tell you whether to stop
 * the build; "Blocking" does.
 *
 * Code-first prototype — from the reference flow (user-test-agent-flow v128).
 */

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { FindingSeverityTag, FindingStepTag, SEVERITY_STYLE } from '../atoms/FindingSeverityTag'
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
  runName: string
  issues: UserTestIssue[]
  meta?: UserTestReportMeta
  categories?: UserTestCategoryRow[]
  /** Leaves the report for the run it belongs to. */
  onBackToRun?: () => void
  /**
   * Fires when a reader pins an evidence clip. The preview itself is handled
   * here — this is only for a host that wants to mirror it somewhere else.
   */
  onOpenClip?: (issue: UserTestIssue, clip: UserTestClip) => void
  onExport?: () => void
  className?: string
}

export function UserTestReport({
  runName,
  issues,
  meta = USER_TEST_REPORT_META,
  categories = USER_TEST_CATEGORY_ROWS,
  onBackToRun,
  onOpenClip,
  onExport,
  className,
}: UserTestReportProps) {
  const bugs = issues.filter((i) => i.kind === 'bug').length
  const friction = issues.filter((i) => i.kind === 'friction').length

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
  /* Hovering an evidence chip previews the clip; clicking pins it. Both live
     here rather than in the card so only one clip is ever on screen. */
  const [preview, setPreview] = useState<{
    issue: UserTestIssue
    clip: UserTestClip
    pinned: boolean
  } | null>(null)
  const jumpTo = (id: FindingGroup) => {
    document.getElementById(`finding-group-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setFlashed(id)
    window.setTimeout(() => setFlashed((f) => (f === id ? null : f)), 1200)
  }

  const totalFindings = categories.reduce((n, c) => n + c.findings, 0)
  const totalBlocking = categories.reduce((n, c) => n + c.blocking, 0)

  return (
    <div className={['flex flex-col w-full', className].filter(Boolean).join(' ')}>
      <PageTopbar
        title={`Full report · ${runName}`}
        trail={[{ label: 'User Test' }]}
        onBack={() => onBackToRun?.()}
        actions={
          <Button variant="secondary" size="md" onClick={onExport}>
            Export PDF
          </Button>
        }
      />

      <div className="flex flex-col gap-l page-measure pt-xl pb-xxl3">
        {/* Masthead. A report that gets mailed around has to say what it is and
            what it is of, on its own, without the app around it. */}
        <header className="flex flex-col gap-xs">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary leading-[1.5]">
            User test report
          </span>
          {/* 2xl, not the `text-xxl` this carried before — that class is not in
              the scale, so the report's own title was rendering at 16px, under
              every heading beneath it. */}
          <h1 className="font-display text-2xl font-semibold text-text-primary leading-[1.2]">
            {meta.title}
          </h1>
          <div className="flex flex-wrap items-baseline gap-s">
            <span className="font-body text-s text-text-secondary leading-[1.6]">
              {meta.game} · report generated {meta.generated}
            </span>
            <span className="flex-1" />
            <span className="font-body text-s text-text-tertiary leading-[1.6] whitespace-nowrap">
              run #{meta.runId}
            </span>
          </div>
        </header>

        {/* ── Summary ── */}
        <PartHeader label="Summary" />

        <section
          className="report-card flex flex-col gap-m w-full rounded-2xl px-l py-l"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="stat-tiles gap-s">
            <Tile value={String(meta.sessions)} label="sessions" />
            <Tile value={meta.footageLabel} label="footage reviewed" />
            <Tile value={String(bugs)} label="bugs" dot="var(--error)" />
            <Tile value={String(friction)} label="friction points" dot="var(--warning)" />
          </div>

          <p className="font-body text-s text-text-secondary leading-[1.7] max-w-[92ch]">
            {meta.narrative}
          </p>

          <SectionLabel className="pt-s">Findings by category</SectionLabel>

          <div
            className="flex flex-col w-full rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="category-row px-m py-s font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <span>Category</span>
              <span>Findings</span>
              <span>Sessions affected</span>
              <span>Blocking</span>
            </div>
            {categories.map((row) => (
              <div
                key={row.label}
                className="category-row px-m py-s font-body text-s text-text-primary leading-[1.5]"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <span className="flex items-center gap-xs min-w-0">
                  <span
                    className="w-[7px] h-[7px] rounded-round shrink-0"
                    style={{
                      backgroundColor: row.tone === 'bug' ? 'var(--error)' : 'var(--warning)',
                    }}
                    aria-hidden
                  />
                  {row.label}
                </span>
                <span>{row.findings}</span>
                <span>{row.sessionsAffected}</span>
                <span>{row.blocking}</span>
              </div>
            ))}
            {/* Sessions affected has no total: the same session appears in
                several rows, so a column sum would claim more sessions than the
                batch has. An em dash is the honest cell. */}
            <div
              className="category-row px-m py-s font-body text-s font-semibold text-text-primary leading-[1.5]"
              style={{ borderTop: '1px solid var(--border-default)' }}
            >
              <span>All findings</span>
              <span>{totalFindings}</span>
              <span className="font-normal text-text-tertiary">—</span>
              <span>{totalBlocking}</span>
            </div>
          </div>
        </section>

        {/* ── Findings ──
            A part, marked the same way Summary is: the rule and the space do the
            separating, so the group headings below can be the largest type in
            this half of the document without two levels tying for loudest. */}
        <PartHeader
          label="Findings"
          meta={`${issues.length} findings in ${sections.length} groups · each with clips and a recommendation`}
        >
          <div className="flex flex-wrap items-center gap-xs pt-xxs">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpTo(s.id)}
                className="finding-chip inline-flex items-center gap-xs rounded-round px-m py-xxs font-body text-s text-text-primary leading-[1.5]"
                style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
              >
                {s.chip}
                <span className="font-semibold">{s.findings.length}</span>
              </button>
            ))}
          </div>
        </PartHeader>

        {sections.map((section) => (
          <section
            key={section.id}
            id={`finding-group-${section.id}`}
            className="finding-section flex flex-col gap-m scroll-mt-xl"
          >
            <h3
              className="flex flex-wrap items-baseline gap-s pb-xs font-display text-l font-semibold text-text-primary leading-[1.35]"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              {section.heading}
              <span className="font-body text-s font-normal text-text-tertiary leading-[1.6]">
                {section.findings.length} finding{section.findings.length === 1 ? '' : 's'}
                {section.note ? ` · ${section.note}` : ''}
              </span>
            </h3>

            <div className="flex flex-col gap-s">
              {section.findings.map((issue) => (
                <FindingCard
                  key={issue.id}
                  issue={issue}
                  flash={flashed === section.id}
                  activeClip={preview?.issue.id === issue.id ? preview.clip : null}
                  onPeekClip={(clip) =>
                    setPreview((p) => (p?.pinned ? p : { issue, clip, pinned: false }))
                  }
                  onLeaveClip={() => setPreview((p) => (p?.pinned ? p : null))}
                  onPinClip={(clip) => {
                    setPreview({ issue, clip, pinned: true })
                    onOpenClip?.(issue, clip)
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {preview && (
        <ClipPipPlayer
          tester={preview.clip.tester}
          timeRange={preview.clip.timeRange}
          note={preview.clip.note}
          caption={preview.issue.title}
          pinned={preview.pinned}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}

/* ── Building blocks ─────────────────────────────────────────────────────── */

function FindingCard({
  issue,
  flash,
  activeClip,
  onPeekClip,
  onLeaveClip,
  onPinClip,
}: {
  issue: UserTestIssue
  flash?: boolean
  activeClip?: UserTestClip | null
  onPeekClip?: (clip: UserTestClip) => void
  onLeaveClip?: () => void
  onPinClip?: (clip: UserTestClip) => void
}) {
  const tone = SEVERITY_STYLE[issue.severity]
  return (
    <article
      className="finding-card flex flex-col gap-xs w-full rounded-2xl px-l py-m"
      style={{
        backgroundColor: 'var(--bg-elements)',
        border: '1px solid var(--border-subtle)',
        /* Severity as a rule down the edge, not only as a chip: it is the axis
           the list is scanned on, and a 60px tag cannot carry that at arm's
           length. */
        borderLeft: `3px solid ${tone.dot}`,
        boxShadow: flash ? '0 0 0 3px var(--bg-tint)' : undefined,
        transition: 'box-shadow 400ms ease',
      }}
    >
      {/* The title owns its line. Everything that qualifies it — severity, the
          step, how many sessions — sits together on the row beneath, so the
          reader scans titles first and metadata only when one lands. */}
      <h4 className="font-display text-m font-semibold text-text-primary leading-[1.45]">
        {issue.title}
      </h4>

      <div className="flex flex-wrap items-center gap-xs">
        <FindingSeverityTag severity={issue.severity} />
        <FindingStepTag>{issue.stepLabel ?? issue.step}</FindingStepTag>
        <span className="flex-1" />
        <span className="font-body text-s text-text-secondary leading-[1.5] whitespace-nowrap">
          <strong className="font-display font-semibold text-text-primary">
            {issue.affected} / {issue.totalTesters}
          </strong>{' '}
          sessions
        </span>
      </div>

      <p className="font-body text-s text-text-secondary leading-[1.75] max-w-[88ch] pt-xxs">
        {issue.detail}
      </p>

      {issue.clips.length > 0 && (
        <div className="flex flex-wrap items-center gap-xs pt-xxs">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]">
            Evidence
          </span>
          {issue.clips.map((clip, i) => {
            const on = activeClip === clip
            return (
              <button
                key={`${clip.tester}-${i}`}
                type="button"
                onMouseEnter={() => onPeekClip?.(clip)}
                onMouseLeave={() => onLeaveClip?.()}
                onFocus={() => onPeekClip?.(clip)}
                onBlur={() => onLeaveClip?.()}
                onClick={() => onPinClip?.(clip)}
                aria-label={`Clip ${i + 1} — ${clip.tester} at ${clip.timeRange}. ${clip.note}`}
                className="evidence-chip flex items-center justify-center w-6 h-6 rounded-xs font-body text-xs leading-none"
                style={{
                  border: `1px solid ${on ? 'var(--border-tint)' : 'var(--border-subtle)'}`,
                  backgroundColor: on ? 'var(--bg-tint-light)' : undefined,
                  color: on ? 'var(--text-brand)' : 'var(--text-secondary)',
                }}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      )}

      {/* A filled block, not a rule: the recommendation is the one line in the
          finding that is an instruction rather than an observation, and a tint
          says so before the label is read. No border — the fill is the edge,
          and a border here made it read as a card inside the card. */}
      <div
        className="flex flex-col gap-xxs rounded-xl px-m py-s mt-xs"
        style={{ backgroundColor: 'var(--bg-tint-light)' }}
      >
        <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-brand leading-[1.5]">
          Recommendation
        </span>
        <span className="font-body text-s text-text-primary leading-[1.7]">
          {issue.recommendation}
        </span>
      </div>
    </article>
  )
}

/**
 * A part of the document — Summary, Findings. Marked by a rule and by the space
 * above it rather than by type size, so the group headings inside a part can be
 * the largest thing in it without two levels tying for loudest.
 */
function PartHeader({
  label,
  meta,
  children,
}: {
  label: string
  meta?: string
  children?: ReactNode
}) {
  return (
    <div
      className="report-part flex flex-col gap-xs pt-l"
      style={{ borderTop: '2px solid var(--border-default)' }}
    >
      <div className="flex flex-wrap items-baseline gap-s">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary leading-[1.5]">
          {label}
        </span>
        {meta && (
          <span className="font-body text-s text-text-tertiary leading-[1.6]">{meta}</span>
        )}
      </div>
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
