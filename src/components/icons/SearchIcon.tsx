/**
 * SearchIcon — magnifier for search fields.
 *
 * Promoted from the local `SearchGlyph` that FunctionalReportView had been
 * carrying, so the Testing area's search fields share one glyph instead of
 * redrawing it per view.
 *
 * Prototype glyph pending the Apparatus export — same status as LockIcon.
 */
import type { IconProps } from './types'

export function SearchIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  )
}
