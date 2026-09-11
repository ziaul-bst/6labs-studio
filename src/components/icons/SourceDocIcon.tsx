/**
 * SourceDocIcon — Document glyph used on source doc pills in Oracle responses.
 * 16px, squarer corners than FileDocIcon (which is the 20px upload-list variant).
 *
 * Paths exported verbatim from the Sources Container's "Doc" instance via the
 * Figma Desktop Bridge (exportAsync SVG_STRING) — not redrawn.
 *
 * @figmaFile i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl  https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=7610-82344
 */
import type { IconProps } from './types'

export function SourceDocIcon({ size = 16, className, 'aria-label': ariaLabel }: IconProps) {
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
        d="M8.78198 2H6.00065C4.74332 2 4.11532 2 3.72465 2.39067C3.33398 2.78133 3.33398 3.40933 3.33398 4.66667V11.3333C3.33398 12.5907 3.33398 13.2187 3.72465 13.6093C4.11532 14 4.74332 14 6.00065 14H10.0007C11.258 14 11.886 14 12.2767 13.6093C12.6673 13.2187 12.6673 12.5907 12.6673 11.3333V5.88533C12.6673 5.61333 12.6673 5.47667 12.6167 5.35467C12.566 5.23267 12.47 5.13533 12.2767 4.94267L9.72465 2.39067C9.53132 2.19733 9.43532 2.10133 9.31332 2.05067C9.19065 2 9.05398 2 8.78198 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M6 8.66663H10M6 11.3333H8.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M8.66797 2V4.66667C8.66797 5.29533 8.66797 5.60933 8.8633 5.80467C9.05864 6 9.37264 6 10.0013 6H12.668"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
