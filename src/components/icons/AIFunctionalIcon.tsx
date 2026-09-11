/**
 * AIFunctionalIcon — Testing › AI functional test (checked document + AI sparkle).
 * Apparatus export (AI Functional Testing.svg). Stroke converted to currentColor.
 *
 * Distinct from AIPlayerIcon, which is the agent itself — the gamepad glyph on
 * the AI Player source badge and on an agent's session. This one is the *test*:
 * cases verified against a build.
 * @figmaFile i9fxQ6pXrgRITEzopoXpWL
 */
import type { IconProps } from './types'

export function AIFunctionalIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <path
        d="M13 20.9989H4.71429C4.49701 21.0069 4.28028 20.972 4.07649 20.8962C3.87271 20.8204 3.68586 20.7052 3.52665 20.5572C3.36743 20.4091 3.23897 20.2311 3.1486 20.0334C3.05823 19.8357 3.00774 19.622 3 19.4048V4.59521C3.00774 4.37795 3.05823 4.16434 3.1486 3.96661C3.23897 3.76888 3.36743 3.5909 3.52665 3.44284C3.68586 3.29479 3.87271 3.17957 4.07649 3.10378C4.28028 3.02799 4.49701 2.9931 4.71429 3.00113H19.2857C19.503 2.9931 19.7197 3.02799 19.9235 3.10378C20.1273 3.17957 20.3141 3.29479 20.4734 3.44284C20.6326 3.5909 20.761 3.76888 20.8514 3.96661C20.9418 4.16434 20.9923 4.37795 21 4.59521V10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M16 8L10.6667 14L8 11.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 14L18.758 14.697C19.096 15.611 19.265 16.068 19.598 16.401C19.932 16.735 20.389 16.904 21.303 17.242L22 17.5L21.303 17.758C20.389 18.096 19.932 18.265 19.599 18.598C19.265 18.932 19.096 19.389 18.758 20.303L18.5 21L18.242 20.303C17.904 19.389 17.735 18.932 17.402 18.599C17.068 18.265 16.611 18.096 15.697 17.758L15 17.5L15.697 17.242C16.611 16.904 17.068 16.735 17.401 16.402C17.735 16.068 17.904 15.611 18.242 14.697L18.5 14Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
