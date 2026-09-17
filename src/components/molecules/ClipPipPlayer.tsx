/**
 * ClipPipPlayer — the evidence clip, floating over the report.
 *
 * Evidence is only evidence if it is cheap to check. A chip that navigates away
 * costs the reader their place in the finding they were halfway through, so the
 * clip comes to them instead: hovering a chip previews it in the corner, and
 * clicking opens it full size in ClipLightbox.
 *
 * The two are one gesture split by cost. The hover preview answers "is this the
 * clip I mean" for nothing — no click, no modal, no place lost. The lightbox
 * answers "what actually happens in it", and that is worth stopping for. Neither
 * is on screen at the same time as the other.
 *
 * Bottom-right rather than beside the chip: an anchored popover would cover the
 * paragraph the clip is evidence for, which is the one thing that must stay
 * readable. It sits above the review dock rather than on top of it — two
 * floating things fighting for the same corner is worse than either alone.
 *
 * Code-first prototype — no Figma source yet.
 */

import { PlayIcon } from '../icons/PlayIcon'

export interface ClipPipPlayerProps {
  /** Who recorded it — "tester_04". */
  tester: string
  /** "03:30 – 04:12" */
  timeRange: string
  /** What the tester did in it, in the clip's own terms. */
  note: string
  /** The finding it is evidence for, so the preview still says what it shows. */
  caption?: string
}

export function ClipPipPlayer({ tester, timeRange, note, caption }: ClipPipPlayerProps) {
  return (
    <div
      className="clip-pip fixed bottom-[76px] right-xl z-40 flex flex-col w-[320px] rounded-xl overflow-hidden shadow-big pointer-events-none"
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
      </div>

      <div className="flex flex-col gap-xxxs px-m py-s">
        {caption && (
          <span className="font-body text-xs text-text-tertiary leading-[1.5] truncate">{caption}</span>
        )}
        <span className="font-body text-s text-text-primary leading-[1.5]">{note}</span>
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">
          Click to open
        </span>
      </div>
    </div>
  )
}
