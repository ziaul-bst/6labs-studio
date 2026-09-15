/**
 * ClipPipPlayer — the evidence clip, floating over the report.
 *
 * Evidence is only evidence if it is cheap to check. A chip that navigates away
 * costs the reader their place in the finding they were halfway through, so the
 * clip comes to them instead: hovering a chip previews it in the corner,
 * clicking pins it there while they read on.
 *
 * Bottom-right rather than beside the chip: an anchored popover would cover the
 * paragraph the clip is evidence for, which is the one thing that must stay
 * readable. It sits above the review dock rather than on top of it — two
 * floating things fighting for the same corner is worse than either alone.
 *
 * Code-first prototype — no Figma source yet.
 */

import { PlayIcon } from '../icons/PlayIcon'
import { CloseIcon } from '../icons/CloseIcon'

export interface ClipPipPlayerProps {
  /** Who recorded it — "tester_04". */
  tester: string
  /** "03:30 – 04:12" */
  timeRange: string
  /** What the tester did in it, in the clip's own terms. */
  note: string
  /** The finding it is evidence for, so a pinned clip still says what it shows. */
  caption?: string
  /** Pinned clips stay until closed; a hover preview disappears on mouse-out. */
  pinned?: boolean
  onClose?: () => void
}

export function ClipPipPlayer({
  tester,
  timeRange,
  note,
  caption,
  pinned = false,
  onClose,
}: ClipPipPlayerProps) {
  return (
    <div
      className="clip-pip fixed bottom-[76px] right-xl z-40 flex flex-col w-[320px] rounded-xl overflow-hidden shadow-big"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-default)' }}
      role="group"
      aria-label={`Clip from ${tester} at ${timeRange}`}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: '16 / 9', background: 'linear-gradient(135deg, #1F2C55 0%, #3A4F7A 100%)' }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-white" aria-hidden>
          <span
            className="flex items-center justify-center w-10 h-10 rounded-round"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
          >
            <PlayIcon size={16} />
          </span>
        </span>
        <span
          className="absolute left-xs bottom-xs px-xs py-xxxs rounded-xs font-code text-xs text-white leading-[1.4]"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          {tester} · {timeRange}
        </span>
        {pinned && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close clip"
            className="absolute right-xs top-xs flex items-center justify-center w-6 h-6 rounded-round text-white"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <CloseIcon size={12} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-xxxs px-m py-s">
        {caption && (
          <span className="font-body text-xs text-text-tertiary leading-[1.5] truncate">{caption}</span>
        )}
        <span className="font-body text-s text-text-primary leading-[1.5]">{note}</span>
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">
          {pinned ? 'Pinned — close to dismiss' : 'Click to pin'}
        </span>
      </div>
    </div>
  )
}
