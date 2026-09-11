/**
 * FilterPill — a pill-shaped filter with the size of the set it selects.
 *
 * Where FilterTag is a square-cornered tag for narrowing a library, this is
 * the filter for a *result set*: the count is the point, so it gets its own
 * badge inside the pill rather than being spliced into the label with a dot.
 * Fully round because it is a filter row, not a tag cloud — the pills read as
 * one control with several positions.
 *
 * States: default (white, ruled), selected (brand tint, brand ink, the count
 * badge deepens to the stronger tint), hover (border darkens).
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ReactNode } from 'react'

export interface FilterPillProps {
  label: string
  count?: number
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  /** Part of a multi-select set — announces as a checkbox rather than a radio. */
  multi?: boolean
  /**
   * Disclosure trigger rather than a filter position — a "+7 more" pill that
   * opens a menu. It takes the same shape as its neighbours but announces as a
   * plain expandable button, because nothing is selected by pressing it.
   */
  menu?: boolean
  /** Trailing glyph — the chevron on a `menu` pill. */
  trailing?: ReactNode
  className?: string
}

export function FilterPill({
  label,
  count,
  selected = false,
  onClick,
  disabled = false,
  multi = false,
  menu = false,
  trailing,
  className,
}: FilterPillProps) {
  return (
    <button
      type="button"
      role={menu ? undefined : multi ? 'checkbox' : 'radio'}
      aria-checked={menu ? undefined : selected}
      aria-expanded={menu ? selected : undefined}
      aria-label={count !== undefined ? `${label}, ${count}` : label}
      disabled={disabled}
      onClick={onClick}
      className={[
        /* 40px tall — the same height as an Input size=lg, so a search field can
           share the row without a visible step. */
        'filter-pill inline-flex items-center gap-xs rounded-round h-[40px] pl-m pr-xs',
        'font-display text-s font-semibold leading-[1.5] whitespace-nowrap',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: selected ? 'var(--bg-tint-light)' : 'var(--bg-elements)',
        border: `1px solid ${selected ? 'var(--border-tint)' : 'var(--border-default)'}`,
        color: selected ? 'var(--text-brand)' : 'var(--text-primary)',
        /* No count → symmetric padding, so a bare pill doesn't list to one side;
           a trailing chevron sits closer to the edge than a word would. */
        paddingRight:
          count !== undefined ? undefined : trailing ? 'var(--space-s, 12px)' : 'var(--space-m, 16px)',
      }}
    >
      {label}
      {count !== undefined && (
        <span
          className="inline-flex items-center justify-center min-w-[26px] px-xs rounded-round font-body text-xs font-medium leading-[1.6]"
          style={{
            backgroundColor: selected ? 'var(--bg-tint)' : 'var(--bg-subtle)',
            color: selected ? 'var(--text-brand)' : 'var(--text-secondary)',
          }}
        >
          {count}
        </span>
      )}
      {trailing && (
        <span className="inline-flex shrink-0 items-center" aria-hidden>
          {trailing}
        </span>
      )}
    </button>
  )
}
