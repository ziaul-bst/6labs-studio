/**
 * Tooltip — a short explanation, on hover or focus, for a mark that promises one.
 *
 * Built as a real component rather than a native `title` for two reasons that
 * are both about this being the ONLY way to reach the text: a `title` takes a
 * second to appear, cannot be styled, and never shows on a touch device or to
 * most screen readers. Anything a native title carries had better be optional;
 * this is not.
 *
 * It renders through a portal because the marks that need it sit inside
 * clipped surfaces — a status badge on a card thumbnail is `overflow: hidden`
 * three parents up, and a bubble positioned inside that is a bubble nobody
 * sees. Position is measured against the viewport on open and on scroll, and
 * flips above the trigger when there is not room below.
 *
 * The trigger is a button, so it is reachable by keyboard and announces the
 * bubble through `aria-describedby`. It stops its own clicks: these marks live
 * on cards that open something, and asking a question should not also open the
 * thing you were asking about.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface TooltipProps {
  /** The text. Kept to a sentence or two — past that it is not a tooltip. */
  content: ReactNode
  /** What the reader hovers: an icon, a word, a badge. */
  children: ReactNode
  /** Announced name for the trigger, e.g. "What does processing mean?" */
  label: string
  className?: string
}

const GAP = 8
const GUTTER = 12
const WIDTH = 260

export function Tooltip({ content, children, label, className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number; flip: boolean } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect()
      if (!r) return
      /* Measured after the first paint, so the flip decision uses the bubble's
         real height rather than a guess that is wrong for two lines. */
      const h = bubbleRef.current?.offsetHeight ?? 64
      const below = window.innerHeight - r.bottom - GAP - GUTTER
      const flip = below < h
      setPos({
        left: Math.max(
          GUTTER,
          Math.min(r.left + r.width / 2 - WIDTH / 2, window.innerWidth - WIDTH - GUTTER),
        ),
        top: flip ? r.top - GAP - h : r.bottom + GAP,
        flip,
      })
    }
    place()
    /* Two frames: the first to mount the bubble, the second to measure it. */
    const raf = requestAnimationFrame(place)
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        className={['tooltip-trigger', className].filter(Boolean).join(' ')}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        /* A click must not reach the card underneath — asking a question should
           not also open the thing you were asking about.

           It deliberately does NOT toggle: a click focuses the button first,
           which has already opened the bubble, so a toggle on top of that
           closes it again and the tooltip looks broken on every click. Focus
           opens it and blur closes it, which is also how a tap works on a
           touch device: tap the mark to read it, tap anywhere else to dismiss. */
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setOpen(true)
        }}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            ref={bubbleRef}
            id={id}
            role="tooltip"
            className="tooltip-bubble"
            style={{
              left: pos?.left ?? -9999,
              top: pos?.top ?? -9999,
              width: WIDTH,
              visibility: pos ? 'visible' : 'hidden',
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  )
}
