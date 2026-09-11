/**
 * BuildComparisonIcon — Two overlapping build/version panels with a diff arrow,
 * for the Build Comparison Agent.
 * Prototype icon: replace with an Apparatus-sourced icon before any Figma handoff.
 */
import type { IconProps } from './types'

export function BuildComparisonIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    >
      {/* Back panel (previous build) */}
      <rect x="3.5" y="3.5" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Front panel (latest build) */}
      <rect x="9.5" y="9.5" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Diff arrow inside the latest build */}
      <path d="M12.6 15L17.4 15M17.4 15L15.5 13.1M17.4 15L15.5 16.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
