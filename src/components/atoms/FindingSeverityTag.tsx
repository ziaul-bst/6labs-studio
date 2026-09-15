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
  { label: string; bg: string; ink?: string; inkClass?: string; border?: string; dot: string }
> = {
  blocking: { label: 'Blocking', bg: 'var(--error-bg)', ink: 'var(--error)', dot: 'var(--error)' },
  disruptive: {
    label: 'Disruptive',
    bg: 'var(--warning-bg)',
    inkClass: 'issue-amber-ink',
    dot: 'var(--warning)',
  },
  /* Cosmetic sits on a bordered white chip rather than a grey fill — on the
     grey page a grey chip read as a hole rather than a tag. */
  cosmetic: {
    label: 'Cosmetic',
    bg: 'var(--bg-elements)',
    ink: 'var(--text-secondary)',
    border: 'var(--border-default)',
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
        border: style.border ? `1px solid ${style.border}` : undefined,
      }}
    >
      {style.label}
    </span>
  )
}

/** The game step a finding sits on, as the report prints it. */
export function FindingStepTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-xs py-xxxs rounded-xs font-body text-xs leading-[1.5]"
      style={{ backgroundColor: 'var(--bg-tint-light)', color: 'var(--text-brand)' }}
    >
      {children}
    </span>
  )
}
