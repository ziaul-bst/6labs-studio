/**
 * DownloadIcon — Download tray — arrow into a tray. Used as the Export trigger glyph.
 * Apparatus export (Export.svg). Fill/stroke converted to currentColor.
 * @figmaFile i9fxQ6pXrgRITEzopoXpWL
 */
import type { IconProps } from './types'

export function DownloadIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.3536 9.64645C11.5488 9.84171 11.5488 10.1583 11.3536 10.3536L8.35355 13.3536C8.25979 13.4473 8.13261 13.5 8 13.5C7.86739 13.5 7.74022 13.4473 7.64645 13.3536L4.64645 10.3536C4.45119 10.1583 4.45119 9.84171 4.64645 9.64645C4.84171 9.45119 5.15829 9.45119 5.35355 9.64645L7.5 11.7929L7.5 1C7.5 0.723858 7.72386 0.5 8 0.5C8.27614 0.5 8.5 0.723858 8.5 1L8.5 11.7929L10.6464 9.64645C10.8417 9.45119 11.1583 9.45119 11.3536 9.64645Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 13.5V11H1V13.5C1 14.3284 1.67157 15 2.5 15H13.5C14.3284 15 15 14.3284 15 13.5V11H16V13.5C16 14.8807 14.8807 16 13.5 16H2.5C1.11929 16 0 14.8807 0 13.5Z"
        fill="currentColor"
      />
    </svg>
  )
}
