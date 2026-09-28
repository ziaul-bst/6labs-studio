/**
 * RecordIcon — the Gameplay Recorder's mark: a ring and a dot.
 *
 * STAND-IN: drawn from two boxes rather than exported, because Apparatus has no
 * record glyph yet. Replace with the Apparatus export (exportAsync SVG_STRING
 * over the Desktop Bridge) once one is added there.
 *
 * Sizes are even and the dot is sized so its gap is a whole pixel on every side
 * (18/20 → 8px dot, 24 → 10px) — a dot half a pixel off centre was caught on
 * review. The ring is 1.5px below 24 so it sits at the weight of the Apparatus
 * line icons beside it (Upload draws at ~1.25px), and 2px from 24 up.
 */
import type { IconProps } from './types'

export function RecordIcon({ size = 20, className, 'aria-label': ariaLabel }: IconProps) {
  const dot = Math.round((size - 4) / 4) * 2
  const ring = size >= 24 ? 2 : 1.5
  return (
    <span
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={['inline-flex items-center justify-center shrink-0 rounded-round', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, border: `${ring}px solid currentColor` }}
    >
      <span className="block rounded-round bg-current" style={{ width: dot, height: dot }} />
    </span>
  )
}
