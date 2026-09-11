/**
 * SelectedVideosStrip — what a run is about to read, at a glance.
 *
 * A row of up to five thumbnails (then "+N"), the count in words, the tags the
 * batch came from, and the two ways to change your mind. It sits inside the
 * composer card and the setup zones, so it stays on one line and never grows
 * into a gallery — the picker modal is where you look at the videos.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { PickerVideo } from '../../lib/types/userTest'

export interface SelectedVideosStripProps {
  videos: PickerVideo[]
  onChange?: () => void
  onClear?: () => void
  /** Thumbnails shown before collapsing into "+N". */
  maxThumbs?: number
  /** Hide the count line when the container already states it (a filled zone header). */
  showCount?: boolean
  className?: string
}

export function SelectedVideosStrip({
  videos,
  onChange,
  onClear,
  maxThumbs = 5,
  showCount = true,
  className,
}: SelectedVideosStripProps) {
  const shown = videos.slice(0, maxThumbs)
  const rest = videos.length - shown.length
  const tags = [...new Set(videos.map((v) => v.tag))]

  return (
    <div className={['flex items-center gap-s flex-wrap', className].filter(Boolean).join(' ')}>
      <div className="flex items-center gap-xs">
        {shown.map((v) => (
          <span
            key={v.id}
            /* A play mark, not a stripe: the thumbnails are stand-ins for real
               frames, so they have to say "video" on their own. The earlier
               translucent bar read as a rendering fault rather than a scrubber. */
            className="relative flex items-center justify-center shrink-0 w-[64px] h-[40px] rounded-m overflow-hidden"
            style={{ background: v.gradient, boxShadow: 'inset 0 0 0 1px rgba(3,13,45,0.10)' }}
            title={v.title}
            aria-hidden
          >
            <PlayMark />
          </span>
        ))}
        {rest > 0 && (
          <span
            className="flex items-center justify-center shrink-0 w-[64px] h-[40px] rounded-m font-display text-xs font-semibold"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            +{rest}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-xxxs min-w-0">
        {showCount && (
          <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
            {videos.length} video{videos.length === 1 ? '' : 's'} selected
          </span>
        )}
        {/* Separators, because the tag and the two actions are three different
            things — without them "Build V2.2 Change Clear" reads as one phrase. */}
        <span className="font-body text-xs text-text-tertiary leading-[1.5] flex items-center gap-xs flex-wrap">
          <span className="truncate">{tags.join(', ')}</span>
          {onChange && (
            <>
              <Dot />
              <button type="button" onClick={onChange} className="font-semibold text-text-brand hover:underline">
                Change
              </button>
            </>
          )}
          {onClear && (
            <>
              <Dot />
              <button type="button" onClick={onClear} className="font-semibold text-text-brand hover:underline">
                Clear
              </button>
            </>
          )}
        </span>
      </div>
    </div>
  )
}

function Dot() {
  return (
    <span className="text-text-placeholder" aria-hidden>
      ·
    </span>
  )
}

/**
 * The library's own play affordance, scaled to a 64x40 tile: the frosted disc
 * from `.video-lib-play`, sized down inline. A bare triangle on a gradient read
 * as a stray shape — the disc is what says "video" everywhere else in the app,
 * so the strip should not invent a second vocabulary for it.
 */
function PlayMark() {
  return (
    <span className="video-lib-play text-white" style={{ width: 24, height: 24 }} aria-hidden>
      <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M7.5 5.5L14 10L7.5 14.5V5.5Z" fill="currentColor" />
      </svg>
    </span>
  )
}
