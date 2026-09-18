/**
 * LockBadge — "sold separately, not on this plan", as a mark.
 *
 * The product had drawn this four times by hand: the Overview tile's chip, the
 * pitch page's floating pill, the profile card's frosted strip and an inline
 * lock SVG. One mark, one colour: the subtle grey fill with secondary ink, so
 * a lock never competes with the single brand action on a locked screen.
 *
 * It is never a control — no hover, no onClick. In navigation the bare
 * `LockIcon` is used instead (a chip in a 40px row would outrank the label),
 * and it is never laid over content: a lock that covers the thing it is about
 * hides the only argument for unlocking it.
 *
 * Code-first prototype — no Figma source yet.
 */

import { LockIcon } from '../icons/LockIcon'

export interface LockBadgeProps {
  size?: 'sm' | 'md'
  /** Defaults to "Locked". */
  label?: string
  className?: string
}

export function LockBadge({ size = 'sm', label = 'Locked', className }: LockBadgeProps) {
  const md = size === 'md'
  return (
    <span
      role="img"
      aria-label={label === 'Locked' ? 'Not on your plan' : label}
      className={[
        'inline-flex items-center gap-xxs font-display font-semibold uppercase tracking-[0.12em] whitespace-nowrap shrink-0',
        md ? 'text-xs px-s py-xxs rounded-s' : 'text-2xs px-xs py-xxxs rounded-xs',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
    >
      <LockIcon size={12} />
      {label}
    </span>
  )
}
