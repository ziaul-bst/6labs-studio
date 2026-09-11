/**
 * TestRunIcon — Testing area's "Runs" nav row (flask + sparkle).
 * Apparatus export (Test run.svg). Stroke converted to currentColor.
 * @figmaFile i9fxQ6pXrgRITEzopoXpWL
 */
import type { IconProps } from './types'

export function TestRunIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
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
        d="M13.7999 21H6.06622C5.69347 20.9998 5.32706 20.9035 5.00242 20.7203C4.67777 20.5371 4.40586 20.2733 4.21295 19.9544C4.02004 19.6354 3.91265 19.2721 3.90117 18.8995C3.8897 18.527 3.97451 18.1577 4.14742 17.8275L8.84992 8.85V3H13.3499V8.85L15.1499 12.2862M7.49992 3H14.6999M7.49992 11.55H14.6999"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.9499 14.7L16.7177 15.3273C16.4135 16.1499 16.2614 16.5612 15.9617 16.8609C15.6611 17.1615 15.2498 17.3136 14.4272 17.6178L13.7999 17.85L14.4272 18.0822C15.2498 18.3864 15.6602 18.5385 15.9608 18.8382C16.2614 19.1388 16.4135 19.5501 16.7177 20.3727L16.9499 21L17.1821 20.3727C17.4863 19.5501 17.6384 19.1388 17.9381 18.8391C18.2387 18.5385 18.6491 18.3864 19.4726 18.0822L20.0999 17.85L19.4726 17.6178C18.65 17.3136 18.2387 17.1615 17.939 16.8618C17.6384 16.5612 17.4863 16.1499 17.1821 15.3273L16.9499 14.7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
