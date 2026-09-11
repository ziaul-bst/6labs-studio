/**
 * OracleExcerptCard — why this video was referenced to answer the user's query.
 *
 * One card renders any combination of blocks, so the concept's six
 * reference-data-point shapes are compositions rather than six layouts.
 *
 * Hierarchy, largest to smallest — the card previously rendered almost
 * everything at 12–14px, which left it flat and hard to scan:
 *   1. attribute values   14px display semibold, primary   — the facts
 *   2. body prose         14px body, secondary, 1.7        — the description
 *   3. eyebrows / labels  10px uppercase, tertiary         — orientation
 *   4. timestamps         10px mono, tertiary              — anchors
 *
 * Event categories use tertiary rather than brand: the card body carries no
 * accent colour, leaving the container header as the only brand element.
 *
 * Code-first prototype — no Figma source yet.
 */
import { formatClock } from '../../lib/mocks/transcript'
import { OracleIcon } from '../icons/OracleIcon'
import type { ExcerptBlock, OracleExcerpt } from '../../lib/types/excerpt'

interface OracleExcerptCardProps {
  excerpt: OracleExcerpt
  /** Click a timestamp to seek the player */
  onSeek?: (seconds: number) => void
  /** Compact type scale for the 380–420px rail and panel */
  dense?: boolean
  /**
   * 'full' shows the Oracle Excerpt label row for a standalone card. 'none' drops
   * it, which is what every in-app placement uses — the container already labels
   * the section.
   */
  headerMode?: 'full' | 'none'
  className?: string
}

function parseClockLabel(label: string): number {
  const parts = label.split(':').map((n) => parseInt(n, 10) || 0)
  return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0]
}

/** Small uppercase orientation label. */
function Eyebrow({ children }: { children: string }) {
  return (
    <span
      className="font-display text-2xs font-semibold uppercase tracking-[0.08em] whitespace-nowrap"
      style={{ color: 'var(--text-tertiary)' }}
    >
      {children}
    </span>
  )
}

function Timestamp({ label, dense }: { label: string; dense: boolean }) {
  return (
    <span
      className="font-code text-2xs shrink-0 tabular-nums"
      style={{ color: 'var(--text-tertiary)', paddingTop: dense ? 1 : 2 }}
    >
      {label}
    </span>
  )
}

export function OracleExcerptCard({
  excerpt,
  onSeek,
  dense = false,
  headerMode = 'full',
  className,
}: OracleExcerptCardProps) {
  const range =
    excerpt.startSec !== undefined && excerpt.endSec !== undefined
      ? `${formatClock(excerpt.startSec)} – ${formatClock(excerpt.endSec)}`
      : null

  return (
    <div
      className={['flex flex-col min-w-0', dense ? 'gap-m' : 'gap-l', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Label row for a standalone card only. The query line and the time range
          were both cut in PM review, so in-app placements render blocks alone. */}
      {headerMode === 'full' && (
        <div className="flex items-center gap-xxs min-w-0">
          <OracleIcon size={12} className="shrink-0" />
          <Eyebrow>Oracle Excerpt</Eyebrow>
          {range && (
            <>
              <span className="flex-1" />
              <Timestamp label={range} dense={dense} />
            </>
          )}
        </div>
      )}

      {excerpt.blocks.map((block, i) => (
        <ExcerptBlockView
          key={`${block.kind}-${i}`}
          block={block}
          dense={dense}
          onSeek={onSeek}
        />
      ))}
    </div>
  )
}

function ExcerptBlockView({
  block,
  dense,
  onSeek,
}: {
  block: ExcerptBlock
  dense: boolean
  onSeek?: (seconds: number) => void
}) {
  /** Prose measure — long lines are the other half of readability. */
  const proseStyle = {
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    maxWidth: dense ? undefined : '62ch',
  }

  switch (block.kind) {
    case 'attributes':
      /* Hairline separators only — the surrounding card already provides the
         container, so an outer border here made three nested boxes. */
      return (
        <div className="flex flex-col min-w-0">
          {block.rows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-m min-w-0 py-xs"
              style={{ borderTop: i === 0 ? undefined : '1px solid var(--border-subtle)' }}
            >
              <span
                className="font-body text-xs min-w-0 truncate"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {row.label}
              </span>
              <span
                className="font-display font-semibold shrink-0 text-right"
                style={{
                  fontSize: dense ? '13px' : '14px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )

    case 'events':
      return (
        <div className="flex flex-col gap-xxs min-w-0">
          {block.items.map((item) => (
            <button
              key={`${item.timestamp}-${item.category}`}
              type="button"
              onClick={() => onSeek?.(parseClockLabel(item.timestamp))}
              className="excerpt-row flex gap-s items-start text-left min-w-0 px-xs py-xs"
            >
              <Timestamp label={item.timestamp} dense={dense} />
              <span className="flex flex-col gap-xxxs min-w-0">
                <Eyebrow>{item.category}</Eyebrow>
                <span
                  className="font-body min-w-0"
                  style={{ ...proseStyle, fontSize: dense ? '13px' : '14px', lineHeight: 1.6 }}
                >
                  {item.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      )

    case 'transcript':
      return (
        <div className="flex flex-col gap-xxxs min-w-0">
          {block.points.map((point) => (
            <button
              key={point.timestamp}
              type="button"
              onClick={() => onSeek?.(parseClockLabel(point.timestamp))}
              className="excerpt-row flex gap-s items-start text-left min-w-0 px-xs py-xs"
            >
              <Timestamp label={point.timestamp} dense={dense} />
              <span
                className="font-body min-w-0"
                style={{ ...proseStyle, fontSize: dense ? '13px' : '14px', lineHeight: 1.6 }}
              >
                {point.text}
              </span>
            </button>
          ))}
        </div>
      )

    case 'text':
      return (
        <p
          className="font-body min-w-0"
          style={{ ...proseStyle, fontSize: dense ? '13px' : '14px' }}
        >
          {block.body}
        </p>
      )

  }
}
