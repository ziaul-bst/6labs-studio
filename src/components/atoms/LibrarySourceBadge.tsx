/**
 * LibrarySourceBadge — where a Gameplay Library clip came from, worn on the
 * clip itself. The library mixes five ingest paths in one grid, and the meta
 * line alone ("2 Sep 2026 · bulk upload via CLI") is not something you read
 * while scanning forty thumbnails.
 *
 * Sibling of the Radiologist's SourceBadge, which covers that flow's own
 * three-value source vocabulary. Same overlay/inline API and the same
 * placement habit, so a clip reads the same way on both surfaces.
 *
 * Two tones plus one exception, because that is the distinction that matters:
 *   - human-captured (Recorder app, browser upload) — neutral, muted dot
 *   - automated pipeline (CLI)                      — neutral, brand dot
 *   - AI player                                     — brand pill + gamepad
 *     glyph, since AI-produced footage is the one you must never mistake for
 *     a real session.
 *
 * Code-first prototype — no Figma source yet.
 */
import { AIPlayerIcon } from '../icons/AIPlayerIcon'
import { SOURCE_SHORT, type VideoUploadSource } from '../../lib/librarySource'

interface LibrarySourceBadgeProps {
  source: VideoUploadSource
  /** overlay = on a dark thumbnail (translucent, light text); inline = on a light surface */
  variant?: 'overlay' | 'inline'
  className?: string
}

/** Automated paths get the brand dot; a person pressing record gets a muted one. */
const AUTOMATED: ReadonlySet<VideoUploadSource> = new Set<VideoUploadSource>(['cli'])

export function LibrarySourceBadge({ source, variant = 'inline', className }: LibrarySourceBadgeProps) {
  const isAgent = source === 'ai-player'
  const overlay = variant === 'overlay'

  let style: React.CSSProperties
  if (overlay) {
    style = {
      backgroundColor: isAgent ? 'rgba(23,112,239,0.72)' : 'rgba(0,0,0,0.55)',
      color: '#FFFFFF',
      backdropFilter: 'blur(4px)',
    }
  } else if (isAgent) {
    style = { backgroundColor: 'var(--bg-tint)', color: 'var(--brand)' }
  } else {
    style = { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }
  }

  const dotColor = overlay
    ? AUTOMATED.has(source)
      ? '#8FB8F8'
      : 'rgba(255,255,255,0.72)'
    : AUTOMATED.has(source)
      ? 'var(--brand)'
      : 'var(--text-tertiary)'

  return (
    <span
      className={[
        'inline-flex items-center gap-xxs px-xs py-xxxs rounded-round whitespace-nowrap',
        'font-display text-2xs font-semibold leading-[1.4]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {isAgent ? (
        <AIPlayerIcon size={12} className="shrink-0" />
      ) : (
        <span
          className="w-[6px] h-[6px] rounded-round shrink-0"
          style={{ backgroundColor: dotColor }}
          aria-hidden
        />
      )}
      {SOURCE_SHORT[source]}
    </span>
  )
}
