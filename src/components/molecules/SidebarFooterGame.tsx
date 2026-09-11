/**
 * SidebarFooterGame — compact game selector that lives in the sidebar footer,
 * beside the profile avatar.
 *
 * Used by the `footer-inline` game placement: the game stays a visible control
 * rather than an indicator you have to open a menu to reach, but it sits at the
 * bottom of the column instead of the top. The account options (language,
 * logout) move behind the avatar next to it.
 *
 * The list opens **upward**, since the anchor is already at the bottom of the
 * viewport — GameSelectorDropdown's `top-full` placement would fall off-screen.
 */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GameThumb } from '../atoms/GameThumb'
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'

export interface FooterGame {
  name: string
  genre: string
  imageUrl?: string
}

export interface SidebarFooterGameProps {
  games: FooterGame[]
  activeGame: FooterGame
  onSelectGame?: (game: FooterGame) => void
  collapsed?: boolean
}

export function SidebarFooterGame({
  games,
  activeGame,
  onSelectGame,
  collapsed = false,
}: SidebarFooterGameProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; bottom: number; width: number } | null>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const multipleGames = games.length > 1

  useEffect(() => {
    if (!open || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPos({
      left: rect.left,
      bottom: window.innerHeight - rect.top + 6,
      // Collapsed the anchor is a 32px thumb, too narrow to size a list by.
      width: collapsed ? 208 : Math.max(rect.width, 180),
    })
  }, [open, collapsed])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (listRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className={collapsed ? 'relative shrink-0' : 'relative flex-1 min-w-0'} ref={anchorRef}>
      <button
        type="button"
        className={[
          'flex gap-xs items-center rounded-m w-full text-left transition-colors',
          collapsed ? 'justify-center p-xxs' : 'px-xxs py-xxs',
          multipleGames ? 'cursor-pointer game-list-hover' : 'cursor-default',
        ].join(' ')}
        onClick={() => multipleGames && setOpen(!open)}
        aria-haspopup={multipleGames ? 'listbox' : undefined}
        aria-expanded={multipleGames ? open : undefined}
        aria-label={collapsed ? activeGame.name : undefined}
        title={collapsed ? activeGame.name : undefined}
        disabled={!multipleGames}
      >
        <GameThumb game={activeGame} size={collapsed ? 28 : 32} />
        {!collapsed && (
          <>
            <div className="flex flex-1 flex-col items-start min-w-0">
              <p className="w-full font-display text-s font-semibold text-text-primary leading-[1.4] truncate">
                {activeGame.name}
              </p>
              <p className="w-full font-body text-xs font-normal text-text-tertiary leading-[1.4] truncate">
                {activeGame.genre}
              </p>
            </div>
            {multipleGames && (
              <DropdownArrowIcon size={16} className="shrink-0 self-center text-text-brand" />
            )}
          </>
        )}
      </button>

      {open &&
        multipleGames &&
        pos &&
        createPortal(
          <div
            ref={listRef}
            data-sidebar-footer-game
            className="fixed z-50 flex flex-col py-xxs rounded-xl overflow-hidden shadow-normal"
            style={{
              left: pos.left,
              bottom: pos.bottom,
              width: pos.width,
              backgroundColor: 'var(--bg-elements)',
              border: '1px solid var(--border-subtle)',
            }}
            role="listbox"
            aria-label="Switch game"
          >
            {games.map((game) => {
              const isActive = game.name === activeGame.name
              return (
                <button
                  key={game.name}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className="flex gap-xs items-center px-s py-xs w-full cursor-pointer game-list-hover text-left"
                  onClick={() => {
                    onSelectGame?.(game)
                    setOpen(false)
                  }}
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
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}
