/**
 * NavReviewSwitcher — floating review toolbar for the area-navigation
 * restructure.
 *
 * One thing is still open and needs to be seen rather than described:
 * **game placement**. `sidebar-top` keeps game → area → agent in one region;
 * `footer-inline` demotes the game to the footer but keeps it a real control
 * beside the avatar; `footer-menu` hides it in the profile menu and relies on
 * the persistent indicator on the profile row instead.
 *
 * Prototype scaffolding — remove once that is decided. Reuses the
 * `.proto-switcher` styles from the Oracle Excerpts review toolbar, with a
 * `.nav-review-switcher` override that moves it bottom-right and below the
 * sidebar flyouts — review chrome must not cover the UI being reviewed.
 */

import type { GamePlacement } from '../../lib/studioAreas'

const PLACEMENT_LABEL: Record<GamePlacement, string> = {
  'sidebar-top': 'Sidebar top',
  'footer-inline': 'Beside profile',
  'footer-menu': 'In profile menu',
}

const PLACEMENT_NOTE: Record<GamePlacement, string> = {
  'sidebar-top':
    'Game chip above the area switch — one region owns game → area → agent, and scope stays visible without opening anything.',
  'footer-inline':
    'Game demoted to the footer but still a real control beside the avatar — scope visible at rest, and account options move behind the avatar.',
  'footer-menu':
    'Switcher hidden inside the profile menu; the profile row carries the game name as the persistent scope indicator.',
}

const PLACEMENT_ORDER: GamePlacement[] = ['sidebar-top', 'footer-inline', 'footer-menu']

export interface NavReviewSwitcherProps {
  placement: GamePlacement
  onPlacementChange: (placement: GamePlacement) => void
}

export function NavReviewSwitcher({ placement, onPlacementChange }: NavReviewSwitcherProps) {
  return (
    <div className="proto-switcher nav-review-switcher">
      <div className="proto-switcher-note">{PLACEMENT_NOTE[placement]}</div>

      <div className="proto-switcher-row">
        <span className="proto-switcher-label">Game</span>
        {PLACEMENT_ORDER.map((p) => (
          <button
            key={p}
            type="button"
            className="proto-switcher-btn"
            data-active={p === placement}
            onClick={() => onPlacementChange(p)}
          >
            {PLACEMENT_LABEL[p]}
          </button>
        ))}
      </div>
    </div>
  )
}
