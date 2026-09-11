/**
 * SidebarTaskItem — History query item in the sidebar.
 * States: Default, Hover (bg-page + primary text), Active (bg-page + indicator + primary text),
 * Loading (circular spinner visible), Complete (green check visible).
 *
 * @figmaComponent  Sidebar task item
 * @figmaNode       1900:49896
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=1900-49896
 */

import type { CSSProperties } from 'react'

type TaskState = 'default' | 'loading' | 'complete'

interface SidebarTaskItemProps {
  query: string
  active?: boolean
  state?: TaskState
  /** Row lives inside a captioned, left-ruled group — same geometry as a nested nav row. */
  nested?: boolean
  /** Last row of its group — its branch elbow terminates the spine. */
  branchLast?: boolean
  onClick?: () => void
}

export function SidebarTaskItem({
  query,
  active = false,
  state = 'default',
  nested = false,
  branchLast = false,
  onClick,
}: SidebarTaskItemProps) {
  return (
    <div
      className={[
        'relative flex items-center w-full group',
        nested ? 'nav-branch py-xxxs' : 'px-s py-xxs',
      ].join(' ')}
      data-branch-last={nested && branchLast ? 'true' : undefined}
      style={nested && active ? ({ '--branch-ink': 'var(--brand)' } as CSSProperties) : undefined}
    >
      {/* Active indicator — 4px bar at the sidebar edge, or the group rule lit
          beside the row when nested (same as SidebarNavItem). */}
      {active && !nested && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[36px] bg-brand rounded-tr-[12px] rounded-br-[11px]" />
      )}
      {/* Nested: no bar of its own — the branch elbow lights in brand instead. */}

      <a
        className={[
          'flex flex-1 items-start rounded-m cursor-pointer min-w-0',
          nested ? 'px-[10px] py-[8px]' : 'p-xs',
          active
            ? 'bg-bg-page'
            : 'hover:bg-bg-page',
        ].join(' ')}
        onClick={onClick}
      >
        <div className="flex flex-1 items-center justify-between min-w-0">
          <div className="flex flex-1 gap-xs items-center min-w-0">
            {/* Query text — primary on active/hover, secondary default */}
            <p
              className={[
                'flex-1 font-body text-s font-normal leading-[1.5] truncate text-left',
                active
                  ? 'text-text-primary'
                  : 'text-text-secondary group-hover:text-text-primary',
              ].join(' ')}
            >
              {query}
            </p>

            {/* Loading — circular spinner per Figma */}
            {state === 'loading' && (
              <div className="shrink-0 w-3 h-3">
                <svg
                  className="animate-spin"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="6"
                    cy="6"
                    r="5"
                    stroke="var(--border-subtle)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M6 1a5 5 0 0 1 5 5"
                    stroke="var(--brand)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            )}

            {/* Complete — green check per Figma */}
            {state === 'complete' && (
              <div className="shrink-0 w-3 h-3">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="6" cy="6" r="6" fill="var(--success)" />
                  <path
                    d="M3.5 6L5.25 7.75L8.5 4.5"
                    stroke="white"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* Default — hidden check placeholder (opacity-0 per Figma) */}
            {state === 'default' && (
              <div className="shrink-0 w-3 h-3 opacity-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="6" fill="var(--success)" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </a>
    </div>
  )
}
