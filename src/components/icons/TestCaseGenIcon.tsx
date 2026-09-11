/**
 * TestCaseGenIcon — Testing › Test case generation (checked list).
 * Ported from the Testing revamp artifact (user-test-agent-flow-v80.html,
 * nav V1 · 1.1); stroke converted to currentColor. No Figma node yet.
 */
import type { IconProps } from './types'

export function TestCaseGenIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
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
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" />
    </svg>
  )
}
