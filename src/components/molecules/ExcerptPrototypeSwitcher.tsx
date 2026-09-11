/**
 * ExcerptPrototypeSwitcher — floating review toolbar for the Oracle Excerpts
 * prototype. Lets a reviewer flip placement and reference-data-point shape
 * without a rebuild, and shows the trade-off for the selected placement so the
 * choice is reviewable rather than just visible.
 *
 * Prototype scaffolding — remove once a placement is chosen.
 */
import {
  EXCERPT_PLACEMENT_LABELS,
  EXCERPT_PLACEMENT_RATIONALE,
  EXCERPT_SHAPE_LABELS,
  type ExcerptPlacement,
  type ExcerptShape,
} from '../../lib/types/excerpt'
import { EXCERPT_SHAPE_ORDER } from '../../lib/mocks/excerpts'

const PLACEMENT_ORDER: ExcerptPlacement[] = ['banner', 'rail']

interface ExcerptPrototypeSwitcherProps {
  placement: ExcerptPlacement
  onPlacementChange: (placement: ExcerptPlacement) => void
  shape: ExcerptShape
  onShapeChange: (shape: ExcerptShape) => void
}

export function ExcerptPrototypeSwitcher({
  placement,
  onPlacementChange,
  shape,
  onShapeChange,
}: ExcerptPrototypeSwitcherProps) {
  return (
    <div className="proto-switcher">
      <div className="proto-switcher-note">{EXCERPT_PLACEMENT_RATIONALE[placement]}</div>

      <div className="proto-switcher-row">
        <span className="proto-switcher-label">Placement</span>
        {PLACEMENT_ORDER.map((p) => (
          <button
            key={p}
            type="button"
            className="proto-switcher-btn"
            data-active={p === placement}
            onClick={() => onPlacementChange(p)}
          >
            {EXCERPT_PLACEMENT_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="proto-switcher-row">
        <span className="proto-switcher-label">Excerpt</span>
        {EXCERPT_SHAPE_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            className="proto-switcher-btn"
            data-active={s === shape}
            onClick={() => onShapeChange(s)}
          >
            {EXCERPT_SHAPE_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  )
}
