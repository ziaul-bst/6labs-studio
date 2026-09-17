/**
 * ClipLightbox — an evidence clip, played in the middle of the screen.
 *
 * It replaces the corner picture-in-picture the report used to open citations
 * in. The PiP was built to keep the reader's place in the paragraph, but a
 * 320px poster parked over the review dock was too small to actually watch: a
 * citation you cannot read the frame of is not evidence, it is a thumbnail.
 *
 * Watching a clip is a deliberate act — the reader has stopped reading and
 * asked to see the thing. So it gets the middle of the screen, the DS player
 * with its seek bar, and a scrim: one clip, at a size where the tester's taps
 * are visible, and the report still behind it to return to.
 *
 * The caption carries the finding it is evidence for and the note says what
 * happens in it, because a clip opened from the middle of a long report has to
 * re-state what it is proving.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useEffect } from 'react'
import { VideoPlayerThumbnail } from './VideoPlayerThumbnail'
import { CloseIcon } from '../icons/CloseIcon'

export interface ClipLightboxProps {
  /**
   * Who recorded it — "tester_01". The device used to ride along here; it says
   * nothing about the ten seconds being watched, and on a line already carrying
   * the tester, the range and the clip's position it was the fourth fact and the
   * least load-bearing. It stays on the finding, where it is read against the
   * other sessions.
   */
  tester: string
  /** "11:03 – 11:40" */
  timeRange: string
  /** What the tester did in it, in the clip's own terms. */
  note: string
  /** The finding it is evidence for. */
  caption?: string
  /** Walks the clips of the same finding without closing the player. */
  onPrev?: () => void
  onNext?: () => void
  /** "2 of 7" — where this clip sits in the finding's evidence. */
  position?: string
  onClose: () => void
}

/** "11:03 – 11:40" → 37. Falls back to a minute when the range is unreadable. */
function rangeSeconds(timeRange: string): number {
  const stamps = timeRange.match(/\d+:\d+/g)
  if (!stamps || stamps.length < 2) return 60
  const toSeconds = (s: string) => {
    const [m, sec] = s.split(':').map(Number)
    return m * 60 + sec
  }
  return Math.max(1, toSeconds(stamps[1]) - toSeconds(stamps[0]))
}

function durationLabel(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ClipLightbox({
  tester,
  timeRange,
  note,
  caption,
  onPrev,
  onNext,
  position,
  onClose,
}: ClipLightboxProps) {
  /* Escape closes, and the arrows walk the finding's other clips — the same
     two keys the case modal binds, so evidence behaves the same everywhere.
     Capture phase, so the report behind it never also handles the key. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const seconds = rangeSeconds(timeRange)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-xl"
      style={{ backgroundColor: 'rgba(3,13,45,0.55)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex flex-col w-full max-w-[760px] rounded-3xl overflow-hidden shadow-big"
        style={{ backgroundColor: 'var(--bg-elements)' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Clip from ${tester} at ${timeRange}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start gap-s px-l py-m"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <span className="flex flex-col gap-xxxs min-w-0 flex-1">
            {caption && (
              <span className="font-display text-m font-semibold text-text-primary leading-[1.4] truncate">
                {caption}
              </span>
            )}
            <span className="font-code text-xs text-text-tertiary leading-[1.5]">
              {tester} · {timeRange}
              {position ? ` · ${position}` : ''}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close clip"
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-round text-text-secondary"
            style={{ backgroundColor: 'var(--bg-page-pale)' }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="px-l pt-m pb-s">
          <VideoPlayerThumbnail duration={durationLabel(seconds)} totalDuration={seconds} />
        </div>

        <div className="flex flex-wrap items-center gap-m px-l pb-l">
          <span className="font-body text-s text-text-secondary leading-[1.6] flex-1 min-w-[200px]">
            {note}
          </span>
          {(onPrev || onNext) && (
            <span className="flex items-center gap-xs shrink-0">
              <PagerButton label="Previous clip" onClick={onPrev}>
                ‹
              </PagerButton>
              <PagerButton label="Next clip" onClick={onNext}>
                ›
              </PagerButton>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function PagerButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={label}
      className="clip-pager flex items-center justify-center w-8 h-8 rounded-round font-body text-m leading-none disabled:opacity-40"
      style={{
        backgroundColor: 'var(--bg-page-pale)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </button>
  )
}
