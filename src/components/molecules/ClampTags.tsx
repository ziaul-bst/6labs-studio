/**
 * ClampTags — Renders a wrapping row of tags limited to `maxRows`. Any tags that
 * would spill past the row budget are collapsed into a trailing "+N" chip.
 * A hidden ghost copy of the full set is measured to decide how many fit.
 */
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface ClampTagsProps {
  items: string[]
  /** Max number of wrapped rows before overflowing into a +N chip */
  maxRows: number
  renderItem: (item: string) => ReactNode
  className?: string
}

export function ClampTags({ items, maxRows, renderItem, className }: ClampTagsProps) {
  const ghostRef = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(items.length)

  useLayoutEffect(() => {
    const ghost = ghostRef.current
    if (!ghost) return

    const compute = () => {
      const kids = Array.from(ghost.children) as HTMLElement[]
      if (kids.length === 0) {
        setCount(0)
        return
      }
      const rowTops: number[] = []
      kids.forEach((k) => {
        if (!rowTops.includes(k.offsetTop)) rowTops.push(k.offsetTop)
      })
      rowTops.sort((a, b) => a - b)

      if (rowTops.length <= maxRows) {
        setCount(items.length)
        return
      }
      const maxTop = rowTops[maxRows - 1]
      let firstOverflow = kids.findIndex((k) => k.offsetTop > maxTop)
      if (firstOverflow === -1) firstOverflow = items.length
      // Reserve a slot for the +N chip so it always fits within the row budget.
      setCount(Math.max(1, firstOverflow - 1))
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(ghost)
    return () => ro.disconnect()
  }, [items, maxRows])

  const overflow = items.length - count

  return (
    <div className={['relative flex flex-wrap gap-xxs w-full min-w-0', className].filter(Boolean).join(' ')}>
      {items.slice(0, count).map((t) => renderItem(t))}
      {overflow > 0 && (
        <span className="inline-flex items-center px-s py-[4px] rounded-[6px] bg-base-50 font-body text-2xs font-medium text-base-900 leading-[16px] whitespace-nowrap">
          +{overflow}
        </span>
      )}

      {/* Measuring ghost — full set, out of flow & invisible */}
      <div
        ref={ghostRef}
        aria-hidden
        className="flex flex-wrap gap-xxs"
        style={{ position: 'absolute', inset: 0, visibility: 'hidden', pointerEvents: 'none', width: '100%' }}
      >
        {items.map((t) => renderItem(t))}
      </div>
    </div>
  )
}
