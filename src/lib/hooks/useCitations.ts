/**
 * useCitations — hydrates `[data-cite]` chips inside a response rendered via
 * dangerouslySetInnerHTML.
 *
 * One delegated listener drives a single preview card, rather than one React
 * node per chip: a response can carry dozens of citations and they cluster, so
 * per-chip components would be wasteful and the card would fight itself as the
 * pointer crosses between adjacent chips.
 *
 * Hover opens after HOVER_DELAY_MS so scanning prose does not fire a cascade of
 * previews. Focus opens immediately, so keyboard and touch users are not
 * dependent on hover.
 */
import { useEffect, useRef, useState } from 'react'
import type { Citation } from '../types/citation'

/** Long enough that scanning prose does not trigger previews. */
const HOVER_DELAY_MS = 350
/** Grace period so the pointer can travel from chip to card without closing it. */
const CLOSE_DELAY_MS = 200

export interface ActiveCitation {
  citation: Citation
  /** Viewport rect of the chip, for positioning the card */
  anchor: { top: number; left: number; bottom: number; right: number }
}

export function useCitations(
  containerRef: React.RefObject<HTMLElement | null>,
  citations: Citation[],
  onActivate?: (citation: Citation) => void,
) {
  const [active, setActive] = useState<ActiveCitation | null>(null)
  const openTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)
  /** True while the pointer is inside the card, which must not self-close. */
  const overCard = useRef(false)

  const byNumber = useRef<Map<number, Citation>>(new Map())
  byNumber.current = new Map(citations.map((c) => [c.n, c]))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const clearTimers = () => {
      if (openTimer.current !== null) window.clearTimeout(openTimer.current)
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
      openTimer.current = null
      closeTimer.current = null
    }

    const chipFrom = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof HTMLElement)) return null
      return target.closest('[data-cite]')
    }

    const open = (chip: HTMLElement, immediate: boolean) => {
      const n = Number(chip.dataset.cite)
      const citation = byNumber.current.get(n)
      if (!citation) return

      const show = () => {
        const rect = chip.getBoundingClientRect()
        setActive({
          citation,
          anchor: { top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right },
        })
      }

      clearTimers()
      if (immediate) show()
      else openTimer.current = window.setTimeout(show, HOVER_DELAY_MS)
    }

    const scheduleClose = () => {
      clearTimers()
      closeTimer.current = window.setTimeout(() => {
        if (!overCard.current) setActive(null)
      }, CLOSE_DELAY_MS)
    }

    const handleOver = (e: Event) => {
      const chip = chipFrom(e.target)
      if (chip) open(chip, false)
    }

    const handleOut = (e: Event) => {
      if (chipFrom(e.target)) scheduleClose()
    }

    const handleFocus = (e: Event) => {
      const chip = chipFrom(e.target)
      if (chip) open(chip, true)
    }

    const handleClick = (e: Event) => {
      const chip = chipFrom(e.target)
      if (!chip) return
      e.preventDefault()
      const citation = byNumber.current.get(Number(chip.dataset.cite))
      if (citation) onActivate?.(citation)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimers()
        setActive(null)
      }
    }

    container.addEventListener('mouseover', handleOver)
    container.addEventListener('mouseout', handleOut)
    container.addEventListener('focusin', handleFocus)
    container.addEventListener('focusout', handleOut)
    container.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimers()
      container.removeEventListener('mouseover', handleOver)
      container.removeEventListener('mouseout', handleOut)
      container.removeEventListener('focusin', handleFocus)
      container.removeEventListener('focusout', handleOut)
      container.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef, onActivate])

  /** Mark chips as buttons so they are focusable and announced correctly. */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.querySelectorAll<HTMLElement>('[data-cite]').forEach((chip) => {
      chip.setAttribute('role', 'button')
      chip.setAttribute('tabindex', '0')
      const n = chip.dataset.cite
      const citation = n ? byNumber.current.get(Number(n)) : undefined
      chip.setAttribute(
        'aria-label',
        citation?.kind === 'table'
          ? `Source ${n}: table ${citation.tableFqn}`
          : `Source ${n}: video clip`,
      )
    })
  }, [containerRef, citations])

  return {
    active,
    close: () => setActive(null),
    setOverCard: (value: boolean) => {
      overCard.current = value
      if (!value) setActive(null)
    },
  }
}
