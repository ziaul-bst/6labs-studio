/**
 * AreaSegment — the Intelligence / Testing switch at the top of the sidebar.
 *
 * Sits in the sidebar's first slot, above the nav list and separated from it by
 * a rule, so it reads as the top of the hierarchy rather than a filter on the
 * list below it.
 *
 * Entitlement-aware by design: with a single area it renders **nothing** — no
 * one-item segment, no dead chrome, and no "mode" concept for the majority of
 * studios that only own one side. A purchasable area renders as a muted tab
 * that opens a pitch screen instead of an empty product.
 *
 * Sized and coloured to outrank the nav rows beneath it — 40px tall, 16px
 * display type, and a solid brand fill with a white label on the active tab,
 * over a light tint track.
 * The active nav row uses only a brand *tint*, so the filled tab stays the
 * loudest thing in the sidebar.
 *
 * Collapsed (60px) has no room for a segmented control, so it degrades to two
 * stacked icon buttons sharing the same active treatment.
 */

import type { ComponentType } from 'react'
import { AREA_LABEL, type AreaEntitlement, type StudioArea } from '../../lib/studioAreas'
import { IntelligenceIcon } from '../icons/IntelligenceIcon'
import { TestRunIcon } from '../icons/TestRunIcon'
import { LockIcon } from '../icons/LockIcon'
import type { IconProps } from '../icons/types'

export interface AreaSegmentProps {
  /** Areas the account can see. One (or none) renders nothing. */
  areas: AreaEntitlement[]
  active: StudioArea
  onChange?: (area: StudioArea) => void
  collapsed?: boolean
}

/**
 * Area icons must not collide with any nav icon inside either area — collapsed
 * to 60px the segment and the nav list are the same column of glyphs, so a
 * repeat is unreadable. Neither of these is used by a nav row.
 */
const AREA_ICON: Record<StudioArea, ComponentType<IconProps>> = {
  intelligence: IntelligenceIcon,
  testing: TestRunIcon,
}

export function AreaSegment({ areas, active, onChange, collapsed = false }: AreaSegmentProps) {
  // Rule: one entitled area means there is no switch, not a switch with one option.
  if (areas.length < 2) return null

  if (collapsed) {
    return (
      <div className="flex flex-col gap-xxs items-center w-full px-xxs" role="tablist" aria-label="Studio area">
        {areas.map(({ area, entitlement }) => {
          const Icon = AREA_ICON[area]
          const isActive = area === active
          return (
            <button
              key={area}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={AREA_LABEL[area]}
              title={
                entitlement === 'purchasable'
                  ? `${AREA_LABEL[area]} — not on your plan`
                  : AREA_LABEL[area]
              }
              onClick={() => onChange?.(area)}
              className={[
                'flex items-center justify-center w-[40px] h-[40px] rounded-m cursor-pointer transition-colors shrink-0',
                isActive ? 'shadow-sm' : 'nav-hover-gradient text-text-secondary',
                entitlement === 'purchasable' && !isActive ? 'opacity-60' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                backgroundColor:
                  isActive && entitlement !== 'purchasable' ? 'var(--brand)' : undefined,
                color:
                  isActive && entitlement !== 'purchasable'
                    ? 'var(--text-on-brand)'
                    : isActive
                      ? 'var(--text-brand)'
                      : undefined,
                border:
                  entitlement === 'purchasable' ? '1px dashed var(--border-tint)' : undefined,
              }}
            >
              <Icon size={24} />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="px-s w-full">
      <div
        className="flex gap-xxs items-center p-xxs rounded-xl w-full"
        style={{ backgroundColor: 'var(--bg-tint-light)' }}
        role="tablist"
        aria-label="Studio area"
      >
        {areas.map(({ area, entitlement }) => {
          const isActive = area === active
          const purchasable = entitlement === 'purchasable'
          const Icon = AREA_ICON[area]
          return (
            <button
              key={area}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange?.(area)}
              className={[
                'flex flex-1 gap-xxs items-center justify-center h-[40px] px-xs rounded-m min-w-0',
                'font-display text-s leading-[1.4] cursor-pointer transition-colors',
                isActive ? 'font-semibold shadow-sm' : 'font-medium text-text-secondary',
                purchasable && !isActive ? 'opacity-70' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                /* Entitled + active fills with brand; a purchasable area stays
                   unfilled so the solid fill only ever means "this is yours". */
                backgroundColor: isActive && !purchasable ? 'var(--brand)' : isActive ? 'var(--bg-elements)' : 'transparent',
                color: isActive && !purchasable ? 'var(--text-on-brand)' : isActive ? 'var(--text-brand)' : undefined,
                border: purchasable ? '1px dashed var(--border-tint)' : '1px solid transparent',
              }}
            >
              <Icon size={20} />
              <span className="truncate">{AREA_LABEL[area]}</span>
              {/* Purchasable areas are marked, not locked out — the tab opens a pitch. */}
              {purchasable && (
                <span className="ml-xxs shrink-0 flex items-center text-text-tertiary" aria-hidden>
                  <LockIcon size={12} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
