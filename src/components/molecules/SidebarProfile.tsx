/**
 * SidebarProfile — User profile section in the sidebar footer.
 * Variants: Default (name + lang), Hover (tint bg + "Click to change").
 * Collapsed: stacked vertically (avatar + lang, no name).
 * Click opens language selector overlay.
 *
 * `gameName` switches the secondary line from language to the active game and
 * turns the row into the profile menu trigger. Used by the `footer` game
 * placement, where the game switcher is demoted into that menu — the indicator
 * is what keeps the scope of everything on screen visible.
 *
 * @figmaComponent  SidebarProfile
 * @figmaNode       4545:42646
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=4545-42646
 */

import { FlagIcon } from '../icons/FlagIcon'
import { ChevronIcon } from '../icons/ChevronIcon'

interface SidebarProfileProps {
  name: string
  initials: string
  language?: string
  /** When set, the secondary line shows the active game instead of the language. */
  gameName?: string
  /**
   * Renders just the avatar as a menu trigger. Used by the `footer-inline` game
   * placement, where the footer row is already carrying the game selector and
   * there is no width left for a name.
   */
  avatarOnly?: boolean
  collapsed?: boolean
  className?: string
  onClick?: () => void
}

export function SidebarProfile({
  name,
  initials,
  language = 'EN',
  gameName,
  avatarOnly = false,
  collapsed = false,
  className,
  onClick,
}: SidebarProfileProps) {
  const showGame = Boolean(gameName)
  const hint = showGame ? 'Click for options' : 'Click to change'

  /* ─── Avatar only: the whole control is the avatar ─── */
  if (avatarOnly) {
    return (
      <button
        className={[
          'flex items-center justify-center shrink-0 rounded-round cursor-pointer',
          'profile-hover transition-colors',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={onClick}
        aria-label={`${name} — account options`}
        title={name}
      >
        <div
          className="relative shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(-90deg, #7B4CFF 0%, #0EA4C5 100%)' }}
        >
          <span
            className="font-display font-semibold text-s leading-[1.5]"
            style={{ color: 'var(--text-on-brand)' }}
          >
            {initials}
          </span>
        </div>
      </button>
    )
  }
  /* ─── Collapsed: stacked avatar + language ─── */
  if (collapsed) {
    return (
      <button
        className="flex flex-col gap-xs items-center justify-center py-xs w-full cursor-pointer profile-hover transition-colors group/profile"
        onClick={onClick}
      >
        {/* Avatar — Gradient/Brand Gradient (hardcoded: no CSS var exists in DS yet) */}
        <div
          className="relative shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(-90deg, #7B4CFF 0%, #0EA4C5 100%)' }}
        >
          <span className="font-display font-semibold text-s leading-[1.5]" style={{ color: 'var(--text-on-brand)' }}>
            {initials}
          </span>
        </div>

        {/* Secondary row — game scope when the switcher lives in this menu, else language */}
        <div className="flex gap-xs items-center justify-center w-full">
          {showGame ? (
            <span
              className="font-display text-xs font-semibold text-text-brand leading-none truncate max-w-full px-xxs"
              title={gameName}
            >
              {gameName!.charAt(0)}
            </span>
          ) : (
            <div className="flex gap-xxs items-center">
              <FlagIcon code={language} size={14} />
              <span className="font-body text-xs font-normal text-text-tertiary">{language}</span>
            </div>
          )}
        </div>
      </button>
    )
  }

  /* ─── Expanded: horizontal layout ─── */
  return (
    <button
      className={[
        'flex gap-xs items-center px-xxs rounded-m cursor-pointer transition-colors',
        'profile-hover',
        'group/profile',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {/* Avatar — Gradient/Brand Gradient (hardcoded: no CSS var exists in DS yet) */}
      <div
        className="relative shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(-90deg, #7B4CFF 0%, #0EA4C5 100%)' }}
      >
        <span className="font-display font-semibold text-s leading-[1.5]" style={{ color: 'var(--text-on-brand)' }}>
          {initials}
        </span>
      </div>

      {/* User info */}
      <div className="flex flex-1 flex-col items-start justify-center min-w-0 text-left">
        <p className="w-full font-body text-s font-normal text-text-secondary leading-[1.5] truncate text-left">
          {name}
        </p>
        <div className="flex gap-xs items-center min-w-0">
          {showGame ? (
            <span
              className="font-display text-xs font-semibold text-text-brand leading-[1.5] truncate"
              title={gameName}
            >
              {gameName}
            </span>
          ) : (
            <div className="flex gap-xxs items-center">
              <FlagIcon code={language} size={14} />
              <span className="font-body text-xs font-normal text-text-tertiary">{language}</span>
            </div>
          )}
          {/* Hover hint */}
          <span className="hidden group-hover/profile:inline-flex items-center gap-xxs shrink-0">
            <span className="w-1 h-1 rounded-full bg-text-tertiary" />
            <span className="font-body text-xs font-normal text-text-tertiary whitespace-nowrap">
              {hint}
            </span>
          </span>
        </div>
      </div>

      {/* Clickable affordance — the menu opens upward, so the chevron points up */}
      <ChevronIcon direction="up" size={16} className="shrink-0 self-center text-text-tertiary" />
    </button>
  )
}
