/**
 * ImageFrameIcon — Framed picture with a sun and horizon. Export format: Image.
 * Apparatus export (Image.svg). Fill/stroke converted to currentColor.
 * @figmaFile i9fxQ6pXrgRITEzopoXpWL
 */
import type { IconProps } from './types'

export function ImageFrameIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
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
        d="M4.16667 2.5H15.8333C16.7538 2.5 17.5 3.24619 17.5 4.16667V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.49984 9.16536C6.57936 9.16536 5.83317 8.41917 5.83317 7.4987C5.83317 6.57822 6.57936 5.83203 7.49984 5.83203C8.42031 5.83203 9.1665 6.57822 9.1665 7.4987C9.1665 8.41917 8.42031 9.16536 7.49984 9.16536Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 15L12.5 10L5 17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
