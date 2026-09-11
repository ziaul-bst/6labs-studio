/**
 * PresentationIcon — Screen on a stand with a play arrow. Export format: PPT.
 * Apparatus export (PPT.svg). Fill/stroke converted to currentColor.
 * @figmaFile i9fxQ6pXrgRITEzopoXpWL
 */
import type { IconProps } from './types'

export function PresentationIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <path d="M1.6665 3.33203H18.3332Z" fill="currentColor" />
      <path
        d="M1.6665 3.33203H18.3332"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.33301 3.33203H16.6663V14.1654H3.33301V3.33203Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.1665 6.66406L11.2498 8.7474L9.1665 10.8307M6.6665 17.4974L9.99984 14.1641L13.3332 17.4974"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
