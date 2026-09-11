/**
 * FilePdfIcon — Document with a folded corner and text lines. Export format: PDF.
 * Apparatus export (PDF.svg). Fill/stroke converted to currentColor.
 * @figmaFile i9fxQ6pXrgRITEzopoXpWL
 */
import type { IconProps } from './types'

export function FilePdfIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
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
      <path
        d="M10.9765 2.5H7.49984C5.92817 2.5 5.14317 2.5 4.65484 2.98833C4.1665 3.47667 4.1665 4.26167 4.1665 5.83333V14.1667C4.1665 15.7383 4.1665 16.5233 4.65484 17.0117C5.14317 17.5 5.92817 17.5 7.49984 17.5H12.4998C14.0715 17.5 14.8565 17.5 15.3448 17.0117C15.8332 16.5233 15.8332 15.7383 15.8332 14.1667V7.35667C15.8332 7.01667 15.8332 6.84583 15.7698 6.69333C15.7065 6.54083 15.5865 6.41917 15.3448 6.17833L12.1548 2.98833C11.9132 2.74667 11.7932 2.62667 11.6407 2.56333C11.4873 2.5 11.3165 2.5 10.9765 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7.5 10.832H12.5M7.5 14.1654H10.8333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.833 2.5V5.83333C10.833 6.61917 10.833 7.01167 11.0772 7.25583C11.3213 7.5 11.7138 7.5 12.4997 7.5H15.833"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
