/**
 * FindingSeverityTag — what a finding cost the tester.
 *
 * Severity is the axis the report is read on, so it leads every finding card.
 * It is not the same as kind: a cosmetic bug and a blocking one are both bugs
 * and nothing like the same problem, which is why "Bug" alone was never enough
 * to rank a list by.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { IssueSeverity } from '../../lib/types/userTest'

export const SEVERITY_STYLE: Record<
  IssueSeverity,
  { label: string; bg: string; ink?: string; inkClass?: string; dot: string }
> = {
  blocking: { label: 'Blocking', bg: 'var(--error-bg)', ink: 'var(--error)', dot: 'var(--error)' },
  disruptive: {
    label: 'Disruptive',
    bg: 'var(--warning-bg)',
    inkClass: 'issue-amber-ink',
    dot: 'var(--warning)',
  },
  /* Filled, like the other two. Cosmetic used to be the one outlined chip in
     the family, which made the lowest severity the most visually distinct
     thing in the row. It sits on a card now, not on the grey page, so a
     neutral fill reads as a tag rather than as a hole. */
  cosmetic: {
    label: 'Cosmetic',
    bg: 'var(--bg-subtle)',
    ink: 'var(--text-secondary)',
    dot: 'var(--text-tertiary)',
  },
}

export interface FindingSeverityTagProps {
  severity: IssueSeverity
  className?: string
}

export function FindingSeverityTag({ severity, className }: FindingSeverityTagProps) {
  const style = SEVERITY_STYLE[severity]
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
      }}
    >
      {style.label}
    </span>
  )
}

/**
 * The game step a finding sits on, as the report prints it.
 *
 * Not a chip. A tag classifies the finding — severity, kind — and the step does
 * not: it says where the thing happened. It was a brand-tinted pill here and
 * plain text on the run summary, which made one datum look like two different
 * kinds of thing depending on which screen you were reading. Plain text in both
 * now, and the chips are left to mean classification alone.
 */
export function FindingStepTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-body text-xs text-text-tertiary leading-[1.5]">{children}</span>
  )
}
