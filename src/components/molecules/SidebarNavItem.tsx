/**
 * SidebarNavItem — Navigation item in the main sidebar.
 * States: Default, Hover (brand tint gradient + blue text), Active (same + 4px indicator).
 * Collapsed: icon-only, no label or badge.
 *
 * `nested` rows sit inside a ruled group (nav V1 · 1.1): the group's left rule
 * already marks the hierarchy, so the row drops the 4px indicator bar and
 * tightens to 40px.
 *
 * Every row is selected in brand blue, whatever group it sits in. Testing's AI
 * group once tinted its rows green to match its caption, but "selected" has to
 * mean one colour across the whole sidebar — a second selection colour reads as
 * a different kind of state, not a different section. The caption keeps its
 * tone; the rows do not.
 *
 * @figmaComponent  Sidebar nav item
 * @figmaNode       1894:18007
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=1894-18007
 */

import type { CSSProperties, ReactNode } from 'react'
import { SidebarLabel } from '../atoms/SidebarLabel'
import { LockIcon } from '../icons/LockIcon'

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
  /** Last row of its group — its branch elbow terminates the spine. */
  branchLast?: boolean
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
  branchLast = false,
  locked = false,
  onClick,
}: SidebarNavItemProps) {
  const Tag = disabled ? 'div' : 'a'

  /* The branch is the nesting cue, so it only exists where the group's caption
     and rule do — never in the collapsed 60px column. */
  const branched = nested && !collapsed

  return (
    <div
      className={[
        'relative flex items-center w-full group',
        collapsed ? 'h-[44px] px-s py-xxs' : nested ? 'h-[40px] py-xxxs' : 'h-[45px] px-s py-xxs',
        branched ? 'nav-branch' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-branch-last={branched && branchLast ? 'true' : undefined}
      style={branched && active ? ({ '--branch-ink': 'var(--brand)' } as CSSProperties) : undefined}
    >
      {/* Active left indicator bar — 4px brand, rounded right side. A nested
          row's group rule already marks the hierarchy, so it drops the bar. */}
      {active && !nested && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[36px] bg-brand rounded-tr-[12px] rounded-br-[11px]" />
      )}
      {/* Nested rows carry no indicator of their own: the branch elbow lights in
          the group's tone instead (see --branch-ink above), so the hierarchy
          line itself says where you are. */}

      {/* Nav item container */}
      <Tag
        className={[
          'flex flex-1 gap-[10px] items-start rounded-m',
          nested && !collapsed ? 'px-[10px] py-[8px]' : 'p-xs',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          active ? 'nav-active-gradient' : disabled ? '' : 'nav-hover-gradient',
          'nav-ink-brand',
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
