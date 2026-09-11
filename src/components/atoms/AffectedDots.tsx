/**
 * AffectedDots — one dot per tester in the batch, filled for the ones who hit
 * the issue.
 *
 * A bar would read as a percentage, and percentages lie at these sample sizes —
 * 7 of 10 and 70 of 100 are not the same claim. Dots keep the denominator
 * visible, so "5 of 10" can't be mistaken for a rate.
 *
 * Code-first prototype — no Figma source yet.
 */

export interface AffectedDotsProps {
  affected: number
  total: number
  /** Colour of the filled dots — usually the issue kind's colour. */
  color?: string
  className?: string
}

export function AffectedDots({
  affected,
  total,
  color = 'var(--error)',
  className,
}: AffectedDotsProps) {
  return (
    <span
      className={['inline-flex items-center gap-xxxs', className].filter(Boolean).join(' ')}
      role="img"
      aria-label={`${affected} of ${total} testers affected`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="w-[7px] h-[7px] rounded-round shrink-0"
          style={{ backgroundColor: i < affected ? color : 'var(--border-subtle)' }}
          aria-hidden
        />
      ))}
    </span>
  )
}
