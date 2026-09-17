/**
 * PageTopbar — Full-width navigation bar with a back arrow and a breadcrumb
 * trail. Sits above page content, 56px tall, white bg with subtle bottom
 * border. Sticks to the top of the scroll container so it stays visible while
 * the page body scrolls. Optional right-side `actions` slot for page-level CTAs.
 *
 * The trail is `[ancestors…] · title`. Ancestors are muted and clickable, the
 * title is the page you are on and is not. Without a `trail` the bar shows the
 * title alone next to the chevron, which reads as "go back to the page you are
 * already on" — so pass the parent wherever one exists.
 *
 * @figmaComponent  Page Topbar
 * @figmaNode       6419:75476
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6419-75476
 */

import type { ReactNode } from 'react'

export interface PageTopbarCrumb {
  label: string
  /** Omit for an ancestor that is not itself a screen you can land on. */
  onClick?: () => void
}

interface PageTopbarProps {
  title: string
  onBack: () => void
  /**
   * Overrides the label next to the back arrow. Used when the page was reached
   * from somewhere other than its usual parent — e.g. arriving from an Oracle
   * citation reads "Back to response" rather than the session id. Ignored when
   * `trail` is given, since the trail already names where you came from.
   */
  backLabel?: string
  /**
   * Ancestors of this page, outermost first — `[{ label: 'User test' }]` renders
   * "‹ User test · <title>". The chevron and every ancestor without its own
   * `onClick` fall back to `onBack`.
   */
  trail?: PageTopbarCrumb[]
  /** Optional right-aligned slot for page-level actions (e.g. Save changes). */
  actions?: ReactNode
}

export function PageTopbar({ title, onBack, backLabel, trail, actions }: PageTopbarProps) {
  const hasTrail = (trail?.length ?? 0) > 0
  return (
    <div
      className="w-full h-[56px] flex items-center justify-between sticky top-0 z-30 shrink-0 pr-[20px]"
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid var(--bg-subtle)',
      }}
    >
      {/* Chevron + trail. The chevron is its own button so an ancestor crumb can
          carry a different destination than plain "back". */}
      <div className="ml-[20px] flex flex-1 min-w-0 gap-[10px] items-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="size-[24px] rounded-[100px] flex items-center justify-center shrink-0 cursor-pointer"
        >
          <svg
            width="7.5"
            height="13.5"
            viewBox="0 0 7.5 13.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.28033 0.21967C7.57322 0.512563 7.57322 0.987437 7.28033 1.28033L1.81066 6.75L7.28033 12.2197C7.57322 12.5126 7.57322 12.9874 7.28033 13.2803C6.98744 13.5732 6.51256 13.5732 6.21967 13.2803L0.21967 7.28033C-0.0732233 6.98744 -0.0732233 6.51256 0.21967 6.21967L6.21967 0.21967C6.51256 -0.0732233 6.98744 -0.0732233 7.28033 0.21967Z"
              fill="var(--text-secondary)"
            />
          </svg>
        </button>

        {/* Long titles clip with an ellipsis rather than shoving the actions
            slot off the right edge. */}
        <nav className="flex items-center gap-xs min-w-0" aria-label="Breadcrumb">
          {hasTrail ? (
            <>
              {trail!.map((crumb) => (
                <span key={crumb.label} className="flex items-center gap-xs min-w-0 shrink">
                  <button
                    type="button"
                    onClick={crumb.onClick ?? onBack}
                    className="page-topbar-crumb font-display text-s font-semibold leading-[1.5] min-w-0 max-w-[220px] truncate text-left"
                    style={{ color: 'var(--text-secondary)' }}
                    title={crumb.label}
                  >
                    {crumb.label}
                  </button>
                  <span style={{ color: 'var(--text-placeholder)' }} aria-hidden>
                    ·
                  </span>
                </span>
              ))}
              <span
                className="font-display text-s font-semibold leading-[1.5] flex-1 min-w-0 truncate"
                style={{ color: 'var(--text-primary)' }}
                aria-current="page"
              >
                {title}
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="page-topbar-crumb font-display text-s font-semibold leading-[1.5] min-w-0 truncate text-left"
              style={{ color: 'var(--text-secondary)' }}
            >
              {backLabel ?? title}
            </button>
          )}
        </nav>
      </div>

      {actions && (
        <div className="flex items-center gap-s shrink-0">{actions}</div>
      )}
    </div>
  )
}
