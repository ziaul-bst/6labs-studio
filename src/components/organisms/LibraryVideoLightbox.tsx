/**
 * LibraryVideoLightbox — watch one Gameplay Library clip.
 *
 * Replaces the details side panel (removed 2026-09-10). Once the panel was
 * stripped to file facts it repeated the card it was opened from — title, size,
 * date, source, tags, all already on the grid — and cost a 420px column to do
 * it. The one thing the card cannot do is play the video, so that is all this
 * does: the player, the title, and the file line under it.
 *
 * A modal rather than an inline player: only one clip can sensibly play at a
 * time, and a playing cell inside a grid of forty is cramped.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useEffect } from 'react'
import { VideoPlayerThumbnail } from '../molecules/VideoPlayerThumbnail'
import { LibrarySourceBadge } from '../atoms/LibrarySourceBadge'
import Button from '../ui/Button'
import { CloseIcon } from '../icons/CloseIcon'
import type { LibraryVideo } from './VideoLibraryView'

export interface LibraryVideoLightboxProps {
  /** The clip to play. `null` closes the lightbox. */
  video: LibraryVideo | null
  onClose: () => void
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  return `${Math.round(bytes / 1024 / 1024)} MB`
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function LibraryVideoLightbox({ video, onClose }: LibraryVideoLightboxProps) {
  /* Hook order note: this runs before the null return below, so it is safe to
     add more hooks above that line but never below it. */
  useEffect(() => {
    if (!video) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [video, onClose])

  if (!video) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-xl"
      style={{ backgroundColor: 'rgba(3,13,45,0.55)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex flex-col w-full max-w-[880px] rounded-3xl overflow-hidden shadow-big"
        style={{ backgroundColor: 'var(--bg-elements)' }}
        role="dialog"
        aria-modal="true"
        aria-label={video.title}
        /* The scrim closes; a click on the player itself must not. */
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-m px-l pt-l pb-s">
          <div className="flex flex-col gap-xxs min-w-0">
            <span
              className="font-display text-m font-semibold leading-[1.4] truncate min-w-0"
              style={{ color: 'var(--text-primary)' }}
            >
              {video.title}
            </span>
            <div className="flex items-center gap-xs">
              <span className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {formatSize(video.sizeBytes)} &middot; {formatDate(video.addedAt)}
              </span>
              <LibrarySourceBadge source={video.source} variant="inline" />
            </div>
          </div>
          <Button variant="transparent" size="md" iconOnly onClick={onClose} aria-label="Close player">
            <CloseIcon size={20} />
          </Button>
        </div>

        <div className="px-l pb-l">
          <VideoPlayerThumbnail
            thumbnailSrc={video.thumbnailSrc}
            duration={video.durationLabel ?? '0:00'}
            showControls
          />
        </div>
      </div>
    </div>
  )
}
