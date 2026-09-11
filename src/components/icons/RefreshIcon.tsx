/**
 * RefreshIcon — Circular-arrow retry glyph. Used by the pipeline stepper's
 * "Try again" action on the error state.
 *
 * Paths exported verbatim from the Apparatus Button L-Icon slot via the Figma
 * Desktop Bridge (exportAsync SVG_STRING) — not redrawn.
 *
 * @figmaFile i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl  https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6827-5
 */
import type { IconProps } from './types'

export function RefreshIcon({ size = 16, className, 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <path
        d="M14.6663 7.99967C14.6663 9.58703 14.1 11.1223 13.069 12.3293C12.0381 13.5364 10.6104 14.3359 9.04257 14.5843C7.47476 14.8326 5.86979 14.5133 4.51635 13.6839C3.16291 12.8546 2.14982 11.5695 1.6593 10.0598C1.16878 8.55012 1.23302 6.91498 1.84048 5.44845C2.44793 3.98193 3.55873 2.78027 4.97307 2.05963C6.38741 1.33899 8.01248 1.14665 9.55598 1.51721C11.0995 1.88777 12.4601 2.79691 13.3931 4.08111"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14.6667 1.33301L10.5 5.49967H14.6667V1.33301Z" fill="currentColor" />
    </svg>
  )
}
