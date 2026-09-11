/**
 * PageTopbar — Full-width navigation bar with back arrow + breadcrumb label.
 * Sits above page content, 56px tall, white bg with subtle bottom border.
 * Sticks to the top of the scroll container so it stays visible while the
 * page body scrolls. Optional right-side `actions` slot for page-level CTAs.
 *
 * @figmaComponent  Page Topbar
 * @figmaNode       6419:75476
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6419-75476
 */

import type { ReactNode } from 'react'

interface PageTopbarProps {
  title: string
  onBack: () => void
  /**
   * Overrides the label next to the back arrow. Used when the page was reached
   * from somewhere other than its usual parent — e.g. arriving from an Oracle
   * citation reads "Back to response" rather than the session id.
   */
  backLabel?: string
  /** Optional right-aligned slot for page-level actions (e.g. Save changes). */
  actions?: ReactNode
}

export function PageTopbar({ title, onBack, backLabel, actions }: PageTopbarProps) {
  return (
    <div
      className="w-full h-[56px] flex items-center justify-between sticky top-0 z-30 shrink-0 pr-[20px]"
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid var(--bg-subtle)',
      }}
    >
      {/* Back button — positioned at left=20px, vertically centered */}
      <button
        className="ml-[20px] flex flex-1 min-w-0 gap-[10px] items-center cursor-pointer"
        onClick={onBack}
      >
        <div className="size-[24px] rounded-[100px] flex items-center justify-center">
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
        </div>
        {/* Long queries clip with an ellipsis rather than shoving the actions
            slot off the right edge. */}
        <span
          className="font-display text-s font-semibold leading-[1.5] min-w-0 truncate text-left"
          style={{ color: 'var(--text-secondary)' }}
        >
          {backLabel ?? title}
        </span>
      </button>

      {actions && (
        <div className="flex items-center gap-s shrink-0">{actions}</div>
      )}
    </div>
  )
}
