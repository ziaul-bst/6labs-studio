/**
 * Skeleton — the shape of content that has not arrived yet.
 *
 * A loading surface should be the finished surface with its facts missing:
 * the masthead where the masthead will be, four tiles where the tiles will be,
 * rows where the rows will be. The reader then knows what is coming and where
 * to look for it, and nothing jumps when it lands. This atom is the one grey
 * bar that draws those shapes — a soft `--skeleton-base` fill with a slow
 * shine passing over it, which stops entirely under prefers-reduced-motion.
 *
 * Variants
 *   text   – one line of copy; height follows the type size it stands in for.
 *   bar    – a short label or a chip; 8–12px tall, rounded.
 *   block  – a tile, a frame, a card body; any size.
 *   circle – an avatar or a status dot.
 *
 * Always decorative (`aria-hidden`). The surface says what is loading with a
 * real `role="status"` line; bars do not talk.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { CSSProperties } from 'react'

export type SkeletonVariant = 'text' | 'bar' | 'block' | 'circle'

export interface SkeletonProps {
  variant?: SkeletonVariant
  /** CSS width; numbers are px. Text lines default to 100%. */
  width?: number | string
  /** CSS height; numbers are px. Defaults per variant (text 12, bar 10, block 64, circle = width). */
  height?: number | string
  /** Border radius token class, e.g. 'rounded-xl'. Defaults per variant. */
  radius?: string
  /** `false` freezes the shine — for dimmed previews and print. */
  shimmer?: boolean
  className?: string
  style?: CSSProperties
}

const DEFAULT_HEIGHT: Record<SkeletonVariant, number> = { text: 12, bar: 10, block: 64, circle: 24 }
const DEFAULT_RADIUS: Record<SkeletonVariant, string> = {
  text: 'rounded-xs',
  bar: 'rounded-round',
  block: 'rounded-xl',
  circle: 'rounded-round',
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  radius,
  shimmer = true,
  className,
  style,
}: SkeletonProps) {
  const h = height ?? (variant === 'circle' ? width ?? DEFAULT_HEIGHT.circle : DEFAULT_HEIGHT[variant])
  const w = width ?? (variant === 'circle' ? h : variant === 'block' ? '100%' : '100%')
  return (
    <span
      className={['skeleton block shrink-0', shimmer ? 'skeleton-shimmer' : '', radius ?? DEFAULT_RADIUS[variant], className]
        .filter(Boolean)
        .join(' ')}
      style={{ width: w, height: h, ...style }}
      aria-hidden
    />
  )
}

/**
 * A paragraph's worth of lines. The last line is shorter, the way prose ends,
 * so a block of skeleton text reads as text and not as a striped panel.
 */
export function SkeletonText({
  lines = 3,
  lineHeight = 12,
  gap = 10,
  lastWidth = '62%',
  className,
}: {
  lines?: number
  lineHeight?: number
  gap?: number
  lastWidth?: string
  className?: string
}) {
  return (
    <span className={['flex flex-col w-full', className].filter(Boolean).join(' ')} style={{ gap }} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} variant="text" height={lineHeight} width={i === lines - 1 && lines > 1 ? lastWidth : '100%'} />
      ))}
    </span>
  )
}
