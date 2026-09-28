/**
 * WindowsIcon — Microsoft Windows platform mark (four panes).
 *
 * STAND-IN: path from Simple Icons v9 (CC0), converted to currentColor. Apparatus
 * has no platform marks yet; replace with the Apparatus export (exportAsync
 * SVG_STRING over the Desktop Bridge) once it is added there.
 */
import type { IconProps } from './types'

export function WindowsIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
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
        fill="currentColor"
        d="M0,0H11.377V11.372H0ZM12.623,0H24V11.372H12.623ZM0,12.623H11.377V24H0Zm12.623,0H24V24H12.623"
      />
    </svg>
  )
}
