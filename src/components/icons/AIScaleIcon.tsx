/**
 * AIScaleIcon — Testing › AI large-scale test (agent network).
 * Ported from the Testing revamp artifact (user-test-agent-flow-v80.html,
 * nav V1 · 1.1); stroke converted to currentColor. No Figma node yet.
 */
import type { IconProps } from './types'

export function AIScaleIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
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
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M8 7.5 10 10M16 7.5 14 10M8 16.5 10 14M16 16.5 14 14" />
    </svg>
  )
}
