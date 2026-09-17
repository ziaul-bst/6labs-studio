/**
 * FindingClipsPopover — the recordings behind one finding, opened from its
 * clips link.
 *
 * A finding claims that N testers hit something. The clips are what makes that
 * a fact rather than an assertion, and they were previously reachable only by
 * leaving for the full report — which costs the reader the list they were
 * scanning. So the evidence comes to them: the link opens the clips in place,
 * each row naming who recorded it, on what device, and when in their session.
 *
 * It is a popover rather than a panel because it answers a question asked in
 * passing ("which sessions?") and is dismissed the same way.
 *
 * It renders into a portal and positions itself against its trigger's viewport
 * rect. Every surface that carries a finding card — the run summary's panel,
 * the thread's report card — clips its own overflow to keep a rounded corner,
 * so an absolutely-positioned popover inside the flow lost its bottom edge on
 * the last finding in the list. A portal is the only placement that survives
 * all of them; it also flips above the trigger rather than running off the
 * bottom of the window.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PlayIcon } from '../icons/PlayIcon'
import type { UserTestClip } from '../../lib/types/userTest'

const WIDTH = 340
const GUTTER = 12
const OFFSET = 6

export interface FindingClipsPopoverProps {
  clips: UserTestClip[]
  /** The control it hangs off — measured to place the portal. */
  anchorRef: React.RefObject<HTMLElement | null>
  onClose: () => void
  /** Opens one clip. Rows are inert labels when no handler is given. */
  onOpenClip?: (clip: UserTestClip, index: number) => void
  className?: string
}

export function FindingClipsPopover({
  clips,
  anchorRef,
  onClose,
  onOpenClip,
  className,
}: FindingClipsPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number; maxHeight: number } | null>(null)

  /* Measured against the viewport, and re-measured while the page scrolls —
     the finding it hangs off is in a scrolling column. */
  useLayoutEffect(() => {
    const place = () => {
      const r = anchorRef.current?.getBoundingClientRect()
      if (!r) return
      const below = window.innerHeight - r.bottom - OFFSET - GUTTER
      const above = r.top - OFFSET - GUTTER
      const flip = below < 200 && above > below
      const height = Math.max(160, Math.min(320, flip ? above : below))
      setPos({
        /* Right-aligned to the trigger, the way it read before, but pulled back
           from the window edge rather than allowed past it. */
        left: Math.max(GUTTER, Math.min(r.right - WIDTH, window.innerWidth - WIDTH - GUTTER)),
        top: flip ? Math.max(GUTTER, r.top - OFFSET - height) : r.bottom + OFFSET,
        maxHeight: height,
      })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [anchorRef])

  /* Dismissed the way it was asked for — a click elsewhere or Escape. The
     pointerdown listener is captured on the document rather than on a backdrop
     so nothing is laid over the findings behind it. */
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      /* The trigger toggles itself — closing here too would reopen it. */
      if (!ref.current?.contains(t) && !anchorRef.current?.contains(t)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose, anchorRef])

  if (!pos) return null

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={`${clips.length} recorded sessions`}
      className={[
        'finding-clips-popover fixed z-50 flex flex-col rounded-xl overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: pos.left,
        top: pos.top,
        width: WIDTH,
        maxWidth: `calc(100vw - ${GUTTER * 2}px)`,
        /* The cap belongs on the popover, not on the list inside it: the header
           is part of what has to fit, and a list capped on its own let the
           whole thing run past the bottom of the window. */
        maxHeight: pos.maxHeight,
        backgroundColor: 'var(--bg-elements)',
        border: '1px solid var(--border-default)',
        boxShadow: '0px 8px 28px rgba(3,13,45,0.14)',
      }}
    >
      <span
        className="px-m py-s font-code text-2xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]"
        style={{
          backgroundColor: 'var(--bg-inset)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {clips.length} recorded {clips.length === 1 ? 'session' : 'sessions'}
      </span>

      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {clips.map((clip, i) => (
          <button
            key={`${clip.tester}-${clip.timeRange}`}
            type="button"
            onClick={() => onOpenClip?.(clip, i)}
            className="finding-clip-row flex items-start gap-s w-full px-m py-s text-left"
            style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : undefined}
          >
            <span
              className="flex items-center justify-center shrink-0 w-7 h-7 rounded-m text-text-brand"
              style={{ backgroundColor: 'var(--bg-tint-light)' }}
              aria-hidden
            >
              <PlayIcon size={12} />
            </span>
            <span className="flex flex-col gap-xxxs min-w-0">
              {/* What the tester did is the clip's name — "tester_03" names the
                  file, not the thing you are about to watch. */}
              <span className="font-display text-xs font-semibold text-text-primary leading-[1.45]">
                {clip.note}
              </span>
              <span className="font-code text-2xs text-text-tertiary leading-[1.5]">
                {clip.timeRange} · {clip.device} · {clip.tester}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>,
    document.body,
  )
}
