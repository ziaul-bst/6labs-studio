/**
 * TestingTabs — the two-tab switch under a test's header: the setup for a new
 * run, and the history of reports it has produced.
 *
 * Underline tabs rather than a segmented control: the two are *pages* of the
 * same screen, not a filter on one list, and the count pill on the history tab
 * tells you there is something behind it before you click.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ReactNode } from 'react'

export interface TestingTabOption<T extends string> {
  value: T
  label: string
  count?: number
}

export interface TestingTabsProps<T extends string> {
  options: TestingTabOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  /**
   * Controls that belong to the active tab's content — a layout switch, a
   * search — sit at the far end of the tab row rather than in a bar of their
   * own, so the row is the one line of chrome between header and content.
   */
  trailing?: ReactNode
  /** No rule of its own — for tabs that sit on the bottom edge of a card. */
  bare?: boolean
  className?: string
}

export function TestingTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  trailing,
  bare = false,
  className,
}: TestingTabsProps<T>) {
  return (
    <div
      className={['flex items-center gap-m w-full min-w-0', className].filter(Boolean).join(' ')}
      style={bare ? undefined : { borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div role="tablist" aria-label={ariaLabel} className="flex items-center gap-xs min-w-0">
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            className="testing-tab inline-flex items-center gap-xs px-m py-s font-display text-s font-semibold whitespace-nowrap"
            style={{
              marginBottom: -1,
              borderBottom: `2px solid ${selected ? 'var(--brand)' : 'transparent'}`,
              color: selected ? 'var(--text-brand)' : 'var(--text-tertiary)',
            }}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className="inline-flex items-center justify-center min-w-[22px] px-xs rounded-round font-body text-xs font-medium leading-[1.6]"
                style={{
                  /* These tabs sit straight on the page ground with no card
                     behind them, so the --bg-subtle chip used inside FilterPill
                     lands within a few percent of the pastel mesh and vanishes.
                     Both states therefore take an opaque fill.

                     The selected badge is solid brand, not a brand tint: a 14%
                     tint behind brand ink read fainter than the plain white
                     chip on the tab beside it, which put the count you are
                     looking at *below* the one you are not. Solid also means it
                     matches the underline instead of competing with it. */
                  backgroundColor: selected ? 'var(--brand)' : 'var(--bg-elements)',
                  border: `1px solid ${selected ? 'var(--brand)' : 'var(--border-default)'}`,
                  color: selected ? '#FFFFFF' : 'var(--text-secondary)',
                }}
              >
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
      </div>
      {trailing && <div className="flex items-center gap-xs ml-auto shrink-0 py-xxs">{trailing}</div>}
    </div>
  )
}
