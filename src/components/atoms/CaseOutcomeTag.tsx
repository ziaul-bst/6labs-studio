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
  border?: string
  /** Solid colour for a dot or rule standing in for the tag. */
  dot: string
}

export const CASE_OUTCOME_STYLE: Record<CaseOutcome, CaseOutcomeStyle> = {
  pass: { label: 'Pass', bg: 'var(--success-bg)', ink: 'var(--success)', dot: 'var(--success)' },
  fail: { label: 'Fail', bg: 'var(--error-bg)', ink: 'var(--error)', dot: 'var(--error)' },
  review: {
    label: 'Need review',
    bg: 'var(--warning-bg)',
    inkClass: 'issue-amber-ink',
    dot: 'var(--warning)',
  },
  /* Neutral outcomes sit on a white chip with a border — a grey fill on the
     grey page read as a hole rather than a tag. */
  blocked: {
    label: 'Block',
    bg: 'var(--bg-elements)',
    ink: 'var(--text-secondary)',
    border: 'var(--border-default)',
    dot: 'var(--text-tertiary)',
  },
}

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
      style={{
        backgroundColor: style.bg,
        color: style.inkClass ? undefined : style.ink,
        border: style.border ? `1px solid ${style.border}` : undefined,
      }}
    >
      {style.label}
    </span>
  )
}
