/**
 * StatTile — one headline number in a run's summary block.
 *
 * The run summary and the full report count the same four things at the top of
 * the same document, and each had its own copy of this tile. They had already
 * drifted — one filled pale with a border, one filled white without — so the
 * two depths of one document disagreed about what a headline number looks like.
 *
 * The only thing that legitimately differs is what they sit on, so that is the
 * only prop: `surface`. On a sheet the tile is a step *down* into the page
 * greys; on a filled band it is a step *up* into the sheet's own white. Same
 * type, same radius, same rhythm either way.
 *
 * Code-first prototype — no Figma source yet.
 */

export type StatTileSurface = 'sheet' | 'band'

export interface StatTileProps {
  /** The number, already formatted — "10", "2h 14m", "9 / 10". */
  value: string
  label: string
  /** Status colour for the dot that leads the value — bugs red, friction amber. */
  dot?: string
  /**
   * What the tile sits on. `sheet` (default) is a card or page in the element
   * colour; `band` is a filled header strip.
   */
  surface?: StatTileSurface
  className?: string
}

export function StatTile({ value, label, dot, surface = 'sheet', className }: StatTileProps) {
  const onBand = surface === 'band'
  return (
    <div
      className={['flex flex-col gap-xxxs rounded-xl px-m py-s', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: onBand ? 'var(--bg-elements)' : 'var(--bg-page-pale)',
        /* No border on a band: against a fill that dark the tile's own fill is
           already the edge, and the border only muddied it. */
        border: onBand ? undefined : '1px solid var(--border-subtle)',
      }}
    >
      <span className="flex items-center gap-xs font-display text-l font-semibold text-text-primary leading-[1.3] tabular-nums">
        {dot && (
          <span
            className="w-[8px] h-[8px] rounded-round shrink-0"
            style={{ backgroundColor: dot }}
            aria-hidden
          />
        )}
        {value}
      </span>
      <span className="font-body text-xs text-text-tertiary leading-[1.5]">{label}</span>
    </div>
  )
}
