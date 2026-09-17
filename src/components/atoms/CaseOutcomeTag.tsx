/**
 * CaseOutcomeTag — the verdict on one verified test case.
 *
 * Four outcomes, and the split that matters is not pass/fail: it is "the run
 * decided" (pass, fail) versus "the run could not decide" (needs review, not
 * verified). The first two are filled in their own colour; the second two are
 * deliberately quieter — a case nobody could verify is not a result, and
 * dressing it like one is how a coverage gap gets shipped as a green build.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { CaseOutcome } from '../../lib/types/testing'

export interface CaseOutcomeStyle {
  label: string
  bg: string
  /** Ink for the tag. Amber flips with the theme, so it goes through a class. */
  ink?: string
  inkClass?: string
  /** Solid colour for a dot or rule standing in for the tag. */
  dot: string
}

/**
 * Four outcomes, four names, and the names are fixed: Pass, Failed, Need
 * review, Not verified. They used to be spelled differently in each place that
 * printed them — "Fail" on the tag, "Failed" in the rail, "Block" on the
 * filter, "not verified" in the summary meter — so a reader filtering for
 * "Block" and a reader reading "not verified" had no way to know they were
 * looking at the same column. Everything that names an outcome reads it from
 * here (2026-09-16 dev call).
 */
export const CASE_OUTCOME_STYLE: Record<CaseOutcome, CaseOutcomeStyle> = {
  pass: { label: 'Pass', bg: 'var(--success-bg)', ink: 'var(--success)', dot: 'var(--success)' },
  fail: { label: 'Failed', bg: 'var(--error-bg)', ink: 'var(--error)', dot: 'var(--error)' },
  review: {
    label: 'Need review',
    bg: 'var(--warning-bg)',
    inkClass: 'issue-amber-ink',
    dot: 'var(--warning)',
  },
  /* Filled like the other three, in the neutral of the same family — it is
     still the quiet one, but by colour rather than by being the only outline
     in a row of fills. As a white chip with a border it read as an empty slot
     next to three filled ones, and on a white row it barely read at all.

     --bg-page-pale, not --bg-subtle: the three coloured fills are 7% tints and
     land around #F4–#FD on white, so #E6E7EA made the quiet outcome the
     heaviest chip in the row. */
  blocked: {
    label: 'Not verified',
    bg: 'var(--bg-page-pale)',
    ink: 'var(--text-secondary)',
    dot: 'var(--text-tertiary)',
  },
}

/** The order every outcome list is read in: decided first, undecided after. */
export const CASE_OUTCOME_ORDER: CaseOutcome[] = ['pass', 'fail', 'review', 'blocked']

export interface CaseOutcomeTagProps {
  outcome: CaseOutcome
  className?: string
}

export function CaseOutcomeTag({ outcome, className }: CaseOutcomeTagProps) {
  const style = CASE_OUTCOME_STYLE[outcome]
  return (
    <span
      className={[
        'inline-flex items-center px-xs py-xxxs rounded-xs font-body text-xs font-medium leading-[1.5] whitespace-nowrap',
        style.inkClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: style.bg, color: style.inkClass ? undefined : style.ink }}
    >
      {style.label}
    </span>
  )
}
