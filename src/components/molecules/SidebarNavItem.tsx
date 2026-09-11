/**
 * SidebarNavItem — Navigation item in the main sidebar.
 * States: Default, Hover (brand tint gradient + blue text), Active (same + 4px indicator).
 * Collapsed: icon-only, no label or badge.
 *
 * `nested` rows sit inside a ruled group (nav V1 · 1.1): the group's left rule
 * already marks the hierarchy, so the row drops the 4px indicator bar and
 * tightens to 40px. `tone="success"` swaps the brand tint for the AI-testing
 * green so a row's colour says which group it belongs to.
 *
 * @figmaComponent  Sidebar nav item
 * @figmaNode       1894:18007
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=1894-18007
 */

import type { ReactNode } from 'react'
import { SidebarLabel } from '../atoms/SidebarLabel'
import { LockIcon } from '../icons/LockIcon'

export type SidebarNavTone = 'brand' | 'success'

interface SidebarNavItemProps {
  label: string
  icon: ReactNode
  active?: boolean
  badge?: string
  badgeVariant?: 'default' | 'outlined' | 'muted'
  disabled?: boolean
  collapsed?: boolean
  /** Row lives inside a captioned, left-ruled group. */
  nested?: boolean
  /** Active / hover colour family. */
  tone?: SidebarNavTone
  /**
   * Sold separately and not on this plan. Unlike `disabled` (a SOON row), a
   * locked row stays fully clickable — it resolves to the test's pitch — and is
   * marked with a lock rather than greyed out.
   */
  locked?: boolean
  onClick?: () => void
}

export function SidebarNavItem({
  label,
  icon,
  active = false,
  badge,
  badgeVariant = 'default',
  disabled = false,
  collapsed = false,
  nested = false,
  tone = 'brand',
  locked = false,
  onClick,
}: SidebarNavItemProps) {
  const Tag = disabled ? 'div' : 'a'
  const success = tone === 'success'
  const activeClass = success ? 'nav-active-success' : 'nav-active-gradient'
  const hoverClass = success ? 'nav-hover-success' : 'nav-hover-gradient'
  const inkClass = success ? 'nav-ink-success' : 'nav-ink-brand'

  return (
    <div
      className={[
        'relative flex items-center w-full group',
        collapsed ? 'h-[44px] px-s py-xxs' : nested ? 'h-[40px] py-xxxs' : 'h-[45px] px-s py-xxs',
      ].join(' ')}
    >
      {/* Active left indicator bar — 4px brand, rounded right side. A nested
          row's group rule already marks the hierarchy, so it drops the bar. */}
      {active && !nested && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[36px] bg-brand rounded-tr-[12px] rounded-br-[11px]" />
      )}
      {/* Nested: the group's 2px rule turns the tone colour beside the active row,
          so the hierarchy line itself says where you are. Sits exactly over the
          rule — 12px body padding plus the 2px rule. */}
      {active && nested && !collapsed && (
        <div
          className="absolute -left-[14px] top-[4px] bottom-[4px] w-[2px] rounded-round"
          style={{ backgroundColor: success ? 'var(--success)' : 'var(--brand)' }}
        />
      )}

      {/* Nav item container */}
      <Tag
        className={[
          'flex flex-1 gap-[10px] items-start rounded-m',
          nested && !collapsed ? 'px-[10px] py-[8px]' : 'p-xs',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          active ? activeClass : disabled ? '' : hoverClass,
          inkClass,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={!disabled ? onClick : undefined}
        aria-current={active ? 'page' : undefined}
        title={collapsed ? (locked ? `${label} — not on your plan` : label) : locked ? 'Not on your plan' : undefined}
      >
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-1 gap-xs items-center">
            {/* Icon — tone colour on active/hover, secondary default */}
            <span
              className={[
                'nav-ink shrink-0 w-5 h-5 flex items-center justify-center',
                active ? 'nav-ink-on' : disabled ? 'text-text-secondary' : 'text-text-secondary',
              ].join(' ')}
            >
              {icon}
            </span>

            {/* Label + badge — hidden in collapsed mode */}
            {!collapsed && (
              <>
                <span
                  className={[
                    'nav-ink flex-1 font-display text-s font-semibold leading-[1.5] text-left truncate',
                    active ? 'nav-ink-on' : 'text-text-secondary',
                  ].join(' ')}
                >
                  {label}
                </span>

                {/* Optional badge */}
                {badge && (
                  <SidebarLabel label={badge} variant={badgeVariant} className="shrink-0" />
                )}
                {locked && !badge && (
                  <span className="shrink-0 flex items-center text-text-tertiary" aria-label="Not on your plan">
                    <LockIcon size={16} />
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </Tag>
    </div>
  )
}
