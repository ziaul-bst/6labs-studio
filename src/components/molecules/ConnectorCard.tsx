/**
 * ConnectorCard — Integration card for the Connectors page.
 * Anatomy: brand icon (40x40 rounded-m) + name + description.
 * Hover: border highlights to brand, "Connect" link fades in, subtle shadow lift.
 *
 * @figmaComponent  Context / Connector Card
 * @figmaPath       Context / Connector / Section / Frame 1244831478 / Stats row / Context/ Connector Card
 * @figmaNode       6419:74803
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6419-74803
 */

import type { ReactNode } from 'react'

interface ConnectorCardProps {
  icon: ReactNode
  name: string
  description: string
  connected?: boolean
  onConnect?: () => void
  className?: string
  /** Persistent footer content (owner avatars + connection count on active
   *  connectors). Sits on one row with the hover "View Details" link. */
  footer?: ReactNode
}

export function ConnectorCard({
  icon,
  name,
  description,
  connected = false,
  onConnect,
  className,
  footer,
}: ConnectorCardProps) {
  return (
    <div
      className={[
        'group flex flex-col gap-s p-m rounded-xl cursor-pointer connector-card transition-all duration-200',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onConnect}
      role="button"
      tabIndex={0}
    >
      {/* Top row: icon + name */}
      <div className="flex gap-s items-center">
        <div className="shrink-0 size-[40px] rounded-m overflow-hidden flex items-center justify-center">
          {icon}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-xs">
            <span className="font-display text-m font-semibold" style={{ color: 'var(--text-primary)' }}>
              {name}
            </span>
            {connected && (
              <span
                className="inline-flex items-center px-xs py-xxxs rounded-xs font-display text-2xs font-semibold uppercase tracking-[0.15em]"
                style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
              >
                CONNECTED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="font-body text-s leading-[1.5] flex-1" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>

      {/* Footer row — persistent footer (if any) + hover "View Details" link */}
      <div className={`flex items-center gap-s mt-auto ${footer ? 'justify-between' : 'justify-end'}`}>
        {footer && <div className="min-w-0">{footer}</div>}
        <span
          className="flex items-center gap-xs font-display text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0"
          style={{ color: 'var(--brand)' }}
        >
          View Details
          <svg width="12" height="10" viewBox="0 0 12.5 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.5 5.00001H12M12 5.00001L8 0.500005M12 5.00001L8 9.50001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </div>
  )
}
