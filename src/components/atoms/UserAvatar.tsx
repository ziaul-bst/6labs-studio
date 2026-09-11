/**
 * UserAvatar — initials in a coloured disc, for naming the person behind a
 * thing: who uploaded a clip, who owns a connection.
 *
 * The colour is derived from the name, so the same person is the same colour
 * everywhere without anyone maintaining a palette-to-person map. `isYou` opts
 * into the one fixed colour, because recognising your own rows at a glance is
 * worth more than the hash.
 *
 * Code-first prototype — no Figma source yet.
 */

/** Two initials at most — "Priya Nair" → PN, "Mohit" → M. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* Gradients rather than flat fills so a 16px disc still reads as a person and
   not as a status dot. */
const GRADIENTS = [
  'linear-gradient(135deg, #7B4CFF, #1770EF)',
  'linear-gradient(135deg, #0E99BF, #05C290)',
  'linear-gradient(135deg, #C20568, #7B4CFF)',
  'linear-gradient(135deg, #F0653F, #F2A03F)',
  'linear-gradient(135deg, #1770EF, #0E99BF)',
  'linear-gradient(135deg, #16A34A, #05C290)',
]

const YOU_GRADIENT = 'linear-gradient(135deg, #030D2D, #4F566C)'

function gradientFor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return GRADIENTS[h % GRADIENTS.length]
}

interface UserAvatarProps {
  name: string
  /** The signed-in user — takes the fixed neutral colour instead of a hashed one. */
  isYou?: boolean
  size?: number
  /** A ring, for avatars that overlap in a stack. */
  ring?: boolean
  className?: string
}

export function UserAvatar({ name, isYou = false, size = 18, ring = false, className }: UserAvatarProps) {
  return (
    <span
      className={['inline-flex items-center justify-center font-display font-semibold shrink-0', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: isYou ? YOU_GRADIENT : gradientFor(name),
        color: '#FFFFFF',
        fontSize: Math.round(size * 0.44),
        lineHeight: 1,
        border: ring ? '2px solid var(--bg-card)' : undefined,
      }}
      title={name}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  )
}
