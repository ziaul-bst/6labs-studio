/**
 * SidebarProfileMenu — flyout opened from the sidebar footer profile.
 *
 * Holds the game switcher (the `footer-menu` placement) plus the account
 * options, grouped by altitude rather than stacked as peers: the game is the
 * scope of everything on screen, language is a set-once preference, and logout
 * ends the session.
 *
 * **Both sub-lists pop out to the right**, aligned to the row that opened them.
 * Nothing ever replaces this menu or grows it taller than the footer it hangs
 * off — a sub-list that detaches from its trigger reads as an orphaned panel.
 * Only one is open at a time.
 *
 * With `showGame={false}` the menu is account options only — used by the
 * `footer-inline` placement, where the game selector already sits in the footer
 * and repeating it here would be two controls for one decision.
 *
 * Anchored above the footer so it never covers the nav list.
 */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GameThumb } from '../atoms/GameThumb'
import { LANGUAGES } from './LanguageSelector'
import { ChevronRightIcon } from '../icons/ChevronRightIcon'
import { FlagIcon } from '../icons/FlagIcon'
import { LogoutIcon } from '../icons/LogoutIcon'

export interface ProfileMenuGame {
  name: string
  genre: string
  imageUrl?: string
}

export interface SidebarProfileMenuProps {
  anchorRef: React.RefObject<HTMLElement | null>
  games: ProfileMenuGame[]
  /** The game every screen in the studio is currently scoped to. */
  activeGame: ProfileMenuGame
  onSelectGame?: (game: ProfileMenuGame) => void
  language: string
  onSelectLanguage?: (language: string) => void
  onLogout?: () => void
  onClose: () => void
  /** false = account options only, because the game lives outside the menu. */
  showGame?: boolean
}

type Submenu = 'game' | 'language'

const MENU_WIDTH = 248
const SUBMENU_WIDTH = 224

export function SidebarProfileMenu({
  anchorRef,
  games,
  activeGame,
  onSelectGame,
  language,
  onSelectLanguage,
  onLogout,
  onClose,
  showGame = true,
}: SidebarProfileMenuProps) {
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [submenu, setSubmenu] = useState<Submenu | null>(null)
  /** Offset of the row that opened the submenu, so the panel lines up with it. */
  const [submenuTop, setSubmenuTop] = useState(0)
  const multipleGames = showGame && games.length > 1

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    setPos({ left: rect.left + 8, bottom: window.innerHeight - rect.top + 4 })
  }, [anchorRef])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      // menuRef wraps the submenus too, so a selection doesn't dismiss the menu
      // before its handler runs.
      if (menuRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      // Escape backs out one level at a time.
      if (submenu) setSubmenu(null)
      else onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [anchorRef, onClose, submenu])

  /** Opening a submenu closes the other and pins the panel to this row. */
  const toggleSubmenu = (which: Submenu, trigger: HTMLElement | null) => {
    if (submenu === which) {
      setSubmenu(null)
      return
    }
    if (trigger) setSubmenuTop(trigger.offsetTop)
    setSubmenu(which)
  }

  if (!pos) return null

  const panelStyle = {
    backgroundColor: 'var(--bg-elements)',
    border: '1px solid var(--border-subtle)',
  }

  return createPortal(
    <div
      ref={menuRef}
      data-sidebar-profile-menu
      className="fixed z-50"
      style={{ left: pos.left, bottom: pos.bottom }}
    >
      <div className="relative">
        <div
          className="flex flex-col rounded-xl overflow-hidden shadow-normal"
          style={{ ...panelStyle, width: MENU_WIDTH }}
          role="menu"
        >
          {/* ── Game — the scope of everything in the studio ── */}
          {showGame && (
            <>
              <p className="px-s pt-s pb-xxs font-display text-2xs font-medium uppercase tracking-[1.5px] text-text-tertiary leading-normal">
                Game
              </p>

              <button
                type="button"
                role="menuitem"
                className={[
                  'flex gap-xs items-center px-s pb-xs pt-xxs w-full text-left',
                  multipleGames ? 'cursor-pointer nav-hover-gradient' : 'cursor-default',
                  submenu === 'game' ? 'nav-active-gradient' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={(e) => multipleGames && toggleSubmenu('game', e.currentTarget)}
                aria-haspopup={multipleGames ? 'menu' : undefined}
                aria-expanded={multipleGames ? submenu === 'game' : undefined}
                disabled={!multipleGames}
              >
                <GameThumb game={activeGame} size={32} />
                <div className="flex flex-1 flex-col items-start min-w-0">
                  <p className="w-full font-display text-s font-semibold text-text-primary leading-[1.5] truncate">
                    {activeGame.name}
                  </p>
                  <p className="w-full font-body text-xs font-normal text-text-tertiary leading-[1.5] truncate">
                    {activeGame.genre}
                  </p>
                </div>
                {multipleGames && (
                  <ChevronRightIcon size={16} className="shrink-0 self-center text-text-brand" />
                )}
              </button>

              <div className="h-px w-full" style={{ backgroundColor: 'var(--border-subtle)' }} />
            </>
          )}

          {/* ── Account preferences ── */}
          <button
            type="button"
            role="menuitem"
            className={[
              'flex gap-xs items-center px-s py-xs w-full cursor-pointer text-left',
              submenu === 'language' ? 'nav-active-gradient' : 'nav-hover-gradient',
            ].join(' ')}
            onClick={(e) => toggleSubmenu('language', e.currentTarget)}
            aria-haspopup="menu"
            aria-expanded={submenu === 'language'}
          >
            <FlagIcon code={language} size={16} />
            <span className="flex-1 font-body text-s text-text-secondary leading-[1.5]">Language</span>
            <span className="font-body text-xs text-text-tertiary">{language}</span>
            <ChevronRightIcon size={16} className="shrink-0 self-center text-text-brand" />
          </button>

          <div className="h-px w-full" style={{ backgroundColor: 'var(--border-subtle)' }} />

          <button
            type="button"
            role="menuitem"
            className="flex gap-xs items-center px-s py-xs w-full cursor-pointer nav-hover-gradient text-left"
            onClick={onLogout}
          >
            <LogoutIcon size={16} />
            <span className="flex-1 font-body text-s text-text-secondary leading-[1.5]">Log out</span>
          </button>
        </div>

        {/* ── Submenu — pops out right, top-aligned to the row that opened it ── */}
        {submenu && (
          <div
            className="absolute left-full ml-xxs flex flex-col py-xxs rounded-xl overflow-hidden shadow-normal"
            style={{ ...panelStyle, width: SUBMENU_WIDTH, top: submenuTop }}
            role="menu"
            aria-label={submenu === 'game' ? 'Switch game' : 'Select language'}
          >
            {submenu === 'game'
              ? games.map((game) => {
                  const isActive = game.name === activeGame.name
                  return (
                    <button
                      key={game.name}
                      type="button"
                      role="menuitem"
                      className="flex gap-xs items-center px-s py-xs w-full cursor-pointer game-list-hover text-left"
                      onClick={() => onSelectGame?.(game)}
                    >
                      <GameThumb game={game} size={24} />
                      <span
                        className={[
                          'flex-1 min-w-0 font-body text-s leading-[1.5] truncate',
                          isActive ? 'text-text-brand font-semibold' : 'text-text-secondary',
                        ].join(' ')}
                      >
                        {game.name}
                      </span>
                    </button>
                  )
                })
              : LANGUAGES.map((lang) => {
                  const isActive = lang.code === language
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      role="menuitem"
                      className="flex gap-xs items-center px-s py-xs w-full cursor-pointer game-list-hover text-left"
                      onClick={() => onSelectLanguage?.(lang.code)}
                    >
                      <FlagIcon code={lang.code} size={18} />
                      <span
                        className={[
                          'flex-1 min-w-0 font-body text-s leading-[1.5] truncate',
                          isActive ? 'text-text-brand font-semibold' : 'text-text-secondary',
                        ].join(' ')}
                      >
                        {lang.label}
                      </span>
                    </button>
                  )
                })}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
