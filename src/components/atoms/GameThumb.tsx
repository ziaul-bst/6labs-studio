/**
 * GameThumb — square game artwork used wherever a game is named in the sidebar.
 *
 * Shared by the footer game selector, the profile menu's game row and its
 * switch list, so the three can't drift apart. The fallback is deliberate
 * (brand gradient + initial), never a bare placeholder fill.
 */

export interface GameThumbGame {
  name: string
  genre?: string
  imageUrl?: string
}

export interface GameThumbProps {
  game: GameThumbGame
  size: number
}

export function GameThumb({ game, size }: GameThumbProps) {
  return (
    <div
      className="relative shrink-0 rounded-xs overflow-hidden"
      style={{ width: size, height: size }}
    >
      {game.imageUrl ? (
        <img src={game.imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-brand to-purple flex items-center justify-center">
          <span
            className="font-display font-semibold text-white leading-none"
            style={{ fontSize: Math.round(size * 0.4) }}
          >
            {game.name.charAt(0)}
          </span>
        </div>
      )}
    </div>
  )
}
