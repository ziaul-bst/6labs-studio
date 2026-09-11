/**
 * BetaTestIcon — Testing › Beta · CBT / OBT (KPI line chart).
 * Ported from the Testing revamp artifact (user-test-agent-flow-v80.html,
 * nav V1 · 1.1); stroke converted to currentColor. No Figma node yet.
 */
import type { IconProps } from './types'

export function BetaTestIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 4-5 3 3 5-7" />
    </svg>
  )
}
