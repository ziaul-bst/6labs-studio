/**
 * PitchSampleReport — the sample on a locked test's pitch, in the shape of the
 * report that test actually produces.
 *
 * The four live tests do not produce one document, they produce two:
 *
 *   Functional and AI functional verify CASES. Their report leads with
 *   coverage — how much of the sheet ran at all — then marks each case pass,
 *   failed or need review. `SampleCaseReport` draws that.
 *
 *   User test and AI behavioural rank FINDINGS. Their report leads with what
 *   the run was made of, then lists findings by severity and by how much of
 *   the batch hit each one. `SampleFindingReport` draws that.
 *
 * Both were previously drawn as the same three-row table with a different
 * chip, which made two different products look like one. Every row still
 * carries its clips, because on both reports every result opens its footage.
 *
 * Code-first prototype — no Figma source yet.
 */

import { CASE_OUTCOME_STYLE, CaseOutcomeTag } from '../atoms/CaseOutcomeTag'
import { FindingSeverityTag } from '../atoms/FindingSeverityTag'
import { StatTile } from './StatTile'
import { PlayIcon } from '../icons/PlayIcon'
import type { CaseOutcome } from '../../lib/types/testing'
import type { IssueSeverity } from '../../lib/types/userTest'

const SHEET: React.CSSProperties = {
  backgroundColor: 'var(--bg-elements)',
  border: '1px solid var(--border-subtle)',
  boxShadow: 'var(--shadow-sm)',
}

function Masthead({ title, meta }: { title: string; meta: string }) {
  return (
    <div
      className="flex items-center gap-s px-xl py-m"
      style={{ backgroundColor: 'var(--bg-page-pale)', borderBottom: '1px solid var(--border-subtle)' }}
    >
      <span className="font-display text-m font-semibold text-text-primary truncate">{title}</span>
      <span className="flex-1" />
      <span className="font-body text-s text-text-tertiary whitespace-nowrap">{meta}</span>
    </div>
  )
}

function ClipChip({ clips }: { clips: number }) {
  return (
    <span className="inline-flex items-center justify-end gap-xxs w-[68px] shrink-0 font-body text-xs font-semibold text-text-brand leading-[1.5] whitespace-nowrap">
      <PlayIcon size={12} />
      {clips} clips
    </span>
  )
}

/* ── Cases ─────────────────────────────────────────────────────────────── */

export interface SampleCaseRow {
  label: string
  outcome: CaseOutcome
  clips: number
}

export interface SampleCaseReportProps {
  title: string
  meta: string
  /** "62 of 96 cases verified" — the claim the rest of the sheet supports. */
  headline: string
  /** Counts per outcome, in CASE_OUTCOME_ORDER, plus what never ran. */
  coverage: { pass: number; fail: number; review: number; notRun: number }
  rows: SampleCaseRow[]
  className?: string
}

export function SampleCaseReport({ title, meta, headline, coverage, rows, className }: SampleCaseReportProps) {
  const total = coverage.pass + coverage.fail + coverage.review + coverage.notRun
  const segments = [
    { key: 'pass' as const, n: coverage.pass, color: CASE_OUTCOME_STYLE.pass.dot },
    { key: 'fail' as const, n: coverage.fail, color: CASE_OUTCOME_STYLE.fail.dot },
    { key: 'review' as const, n: coverage.review, color: CASE_OUTCOME_STYLE.review.dot },
    { key: 'notRun' as const, n: coverage.notRun, color: 'var(--bg-subtle)' },
  ]

  return (
    <div className={['flex flex-col rounded-3xl overflow-hidden', className].filter(Boolean).join(' ')} style={SHEET} aria-hidden>
      <Masthead title={title} meta={meta} />

      {/* Coverage first: on a case report the question before "did it pass" is
          "how much of the sheet ran at all". */}
      <div className="flex flex-col gap-s px-xl pt-l pb-m">
        <span className="font-display text-l font-semibold text-text-primary leading-[1.3]">{headline}</span>
        <span className="flex h-[10px] w-full rounded-round overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
          {segments.map((seg) => (
            <span key={seg.key} style={{ width: `${(seg.n / total) * 100}%`, backgroundColor: seg.color }} />
          ))}
        </span>
        <span className="flex items-center gap-m flex-wrap">
          {segments.map((seg) => (
            <span key={seg.key} className="inline-flex items-center gap-xxs font-body text-xs text-text-secondary leading-[1.5]">
              <span className="w-[8px] h-[8px] rounded-round shrink-0" style={{ backgroundColor: seg.color }} />
              {seg.n} {seg.key === 'notRun' ? 'not run' : CASE_OUTCOME_STYLE[seg.key].label.toLowerCase()}
            </span>
          ))}
        </span>
      </div>

      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-m px-xl py-m" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="flex-1 min-w-0 font-body text-s text-text-primary truncate">{row.label}</span>
          <ClipChip clips={row.clips} />
          <span className="flex justify-end w-[100px] shrink-0">
            <CaseOutcomeTag outcome={row.outcome} />
          </span>
        </div>
      ))}

      <div
        className="flex items-center px-xl py-m"
        style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page-pale)' }}
      >
        <span className="font-body text-s text-text-tertiary leading-[1.5]">
          …and every other case on the sheet. Every result opens the footage it was read from.
        </span>
      </div>
    </div>
  )
}

/* ── Findings ──────────────────────────────────────────────────────────── */

export interface SampleFindingRow {
  label: string
  severity: IssueSeverity
  /** "6 / 10 sessions", "16 / 20 agents" — the run's own denominator. */
  reach: string
  clips: number
}

export interface SampleFindingReportProps {
  title: string
  meta: string
  /** What the run was made of — the masthead numbers, as the real report prints them. */
  tiles: Array<{ value: string; label: string; dot?: string }>
  rows: SampleFindingRow[]
  className?: string
}

export function SampleFindingReport({ title, meta, tiles, rows, className }: SampleFindingReportProps) {
  return (
    <div className={['flex flex-col rounded-3xl overflow-hidden', className].filter(Boolean).join(' ')} style={SHEET} aria-hidden>
      <Masthead title={title} meta={meta} />

      {/* What the run was made of, before what it found — the same tiles the
          real masthead carries. */}
      {/* Its own grid, not `.stat-tiles`: that one is a container query sized
          off `.report-masthead`, and this sheet is not one — it fell back to
          two columns and turned four numbers into a block four rows tall. */}
      <div
        className="grid gap-s px-xl pt-l pb-m"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
      >
        {tiles.map((t) => (
          <StatTile key={t.label} value={t.value} label={t.label} dot={t.dot} />
        ))}
      </div>

      {rows.map((row, i) => (
        <div key={row.label} className="flex items-center gap-m px-xl py-m" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {/* Findings are ranked, so they are numbered; cases are not. */}
          <span
            className="flex items-center justify-center shrink-0 w-7 h-7 rounded-m font-display text-xs font-semibold tabular-nums"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            {i + 1}
          </span>
          <span className="flex-1 min-w-0 font-body text-s text-text-primary truncate">{row.label}</span>
          <span className="font-body text-xs text-text-secondary tabular-nums whitespace-nowrap shrink-0">{row.reach}</span>
          <ClipChip clips={row.clips} />
          <span className="flex justify-end w-[100px] shrink-0">
            <FindingSeverityTag severity={row.severity} />
          </span>
        </div>
      ))}

      <div
        className="flex items-center px-xl py-m"
        style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page-pale)' }}
      >
        <span className="font-body text-s text-text-tertiary leading-[1.5]">
          …and every other finding, ranked the same way. Every result opens the footage it was read from.
        </span>
      </div>
    </div>
  )
}
