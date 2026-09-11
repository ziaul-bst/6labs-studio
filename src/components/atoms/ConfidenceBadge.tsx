/**
 * ConfidenceBadge — how much of the finding is observation and how much is
 * inference.
 *
 * `verified` is reserved for things visible in the clip with a timestamp; it is
 * the only value that licenses filing a ticket without watching the footage.
 * `high` and `medium` are behavioural reads, and stay deliberately quiet in
 * colour so they never look like a verified claim at a glance.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { IssueConfidence } from '../../lib/types/userTest'

export interface ConfidenceBadgeProps {
  confidence: IssueConfidence
  className?: string
}

const CONFIDENCE_META: Record<IssueConfidence, { label: string; color: string }> = {
  verified: { label: 'Verified · timestamped', color: 'var(--success)' },
  high: { label: 'High confidence', color: 'var(--text-secondary)' },
  medium: { label: 'Medium confidence', color: 'var(--text-tertiary)' },
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const meta = CONFIDENCE_META[confidence]
  return (
    <span
      className={[
        'inline-flex items-center gap-xxs whitespace-nowrap',
        'font-body text-xs font-medium leading-[1.5]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ color: meta.color }}
    >
      <span
        className="w-[6px] h-[6px] rounded-round shrink-0"
        style={{ backgroundColor: meta.color }}
        aria-hidden
      />
      {meta.label}
    </span>
  )
}
