/**
 * FilterTag — selectable pill tag for filter sections.
 * States: default (outlined), selected (brand tint bg + brand text).
 *
 * The label caps at the shared `.tag-label` measure: a tag row is a set of
 * choices read side by side, and one long imported label must not push the
 * rest of the set off the row. Full text on hover.
 *
 * @figmaComponent  Filter Tags
 * @figmaNode       6425:222911
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6425-222911
 */

interface FilterTagProps {
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function FilterTag({ label, selected = false, onClick, className = '' }: FilterTagProps) {
  return (
    <button
      type="button"
      className={`filter-tag ${className}`}
      data-selected={String(selected)}
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      <span className="tag-label">{label}</span>
    </button>
  )
}
