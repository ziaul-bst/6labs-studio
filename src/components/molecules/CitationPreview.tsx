/**
 * CitationPreview — the card shown when a citation chip is hovered or focused.
 *
 * Video citations show the clip cued to the cited moment plus the transcript
 * excerpt with the claim span highlighted. The excerpt is the part that explains
 * *why* the clip is evidence — a cued player alone leaves the reader guessing.
 *
 * Table citations show the fully-qualified name plus the referenced rows with
 * the cited cell highlighted. An FQN on its own cannot settle a claim.
 *
 * Code-first prototype — no Figma source yet.
 */
import { renderHighlightedText } from '../../lib/text/highlight'
import { formatClock } from '../../lib/mocks/transcript'
import { VideoPlayIcon } from '../icons/VideoPlayIcon'
import { ConnectorIcon } from '../icons/ConnectorIcon'
import type { ActiveCitation } from '../../lib/hooks/useCitations'
import type { TranscriptSegment } from '../../lib/types/transcript'

/** Card width must match .oracle-cite-preview in globals.css. */
const CARD_WIDTH = 340
const CARD_MARGIN = 12

interface CitationPreviewProps {
  active: ActiveCitation
  /** Resolves a video citation's segments to narration text */
  resolveSegments: (videoId: string, segmentIds: string[]) => TranscriptSegment[]
  onOpen: () => void
  onPointerEnter: () => void
  onPointerLeave: () => void
}

export function CitationPreview({
  active,
  resolveSegments,
  onOpen,
  onPointerEnter,
  onPointerLeave,
}: CitationPreviewProps) {
  const { citation, anchor } = active

  // Prefer below the chip; flip above when there is not room.
  const spaceBelow = window.innerHeight - anchor.bottom
  const placeAbove = spaceBelow < 220
  const left = Math.max(
    CARD_MARGIN,
    Math.min(anchor.left, window.innerWidth - CARD_WIDTH - CARD_MARGIN),
  )

  const positioning = placeAbove
    ? { left, bottom: window.innerHeight - anchor.top + 6 }
    : { left, top: anchor.bottom + 6 }

  return (
    <div
      className="oracle-cite-preview"
      style={positioning}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      role="dialog"
      aria-label={`Source ${citation.n} preview`}
    >
      {citation.kind === 'video' ? (
        <VideoCitationBody
          citation={citation}
          segments={resolveSegments(citation.videoId, citation.segmentIds)}
          onOpen={onOpen}
        />
      ) : (
        <TableCitationBody citation={citation} onOpen={onOpen} />
      )}
    </div>
  )
}

function VideoCitationBody({
  citation,
  segments,
  onOpen,
}: {
  citation: Extract<ActiveCitation['citation'], { kind: 'video' }>
  segments: TranscriptSegment[]
  onOpen: () => void
}) {
  const first = segments[0]
  const last = segments[segments.length - 1]

  return (
    <div className="flex flex-col gap-s p-s">
      {/* Header — which clip, and where it starts */}
      <div className="flex items-center gap-xs min-w-0">
        <VideoPlayIcon size={16} className="shrink-0" />
        <span
          className="font-display text-xs font-semibold truncate min-w-0"
          style={{ color: 'var(--text-primary)' }}
        >
          [{citation.n}] {citation.label ?? citation.videoId}
        </span>
        {first && (
          <span
            className="font-code text-2xs shrink-0 tabular-nums"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {formatClock(first.startSec)}
            {last && last !== first ? `–${formatClock(last.endSec)}` : ''}
          </span>
        )}
      </div>

      {/* Clip cued to the cited moment — loops the cited span, muted */}
      <div
        className="relative w-full overflow-hidden rounded-m"
        style={{ aspectRatio: '16 / 9', backgroundColor: 'black' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoPlayIcon size={24} className="text-white opacity-70" />
        </div>
        <span
          className="absolute bottom-[6px] left-[6px] px-xxs rounded-s font-code text-2xs tabular-nums"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF' }}
        >
          {first ? formatClock(first.startSec) : '0:00'}
        </span>
      </div>

      {/* The narration that makes this clip evidence */}
      {segments.length > 0 ? (
        <div className="flex flex-col gap-xxs min-w-0">
          {segments.slice(0, 2).map((segment) => (
            <p
              key={segment.id}
              className="font-body text-xs min-w-0"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
            >
              {renderHighlightedText(segment.text, citation.quote ? [citation.quote] : [])}
            </p>
          ))}
        </div>
      ) : (
        <p className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Transcript not available for this clip.
        </p>
      )}

      <button
        type="button"
        onClick={onOpen}
        className="font-display text-xs font-semibold text-left"
        style={{ color: 'var(--brand)' }}
      >
        Open in transcript →
      </button>
    </div>
  )
}

function TableCitationBody({
  citation,
  onOpen,
}: {
  citation: Extract<ActiveCitation['citation'], { kind: 'table' }>
  onOpen: () => void
}) {
  return (
    <div className="flex flex-col gap-s p-s min-w-0">
      <div className="flex items-center gap-xs min-w-0">
        <ConnectorIcon size={16} className="shrink-0" />
        <span
          className="font-code text-2xs truncate min-w-0"
          style={{ color: 'var(--text-secondary)' }}
        >
          {citation.warehouse ? `${citation.warehouse} · ` : ''}
          {citation.tableFqn}
        </span>
      </div>

      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {citation.columns.map((col) => (
              <th
                key={col}
                className="font-body text-2xs text-left px-xxs py-xxs truncate"
                style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-subtle)' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {citation.rows.map((row, i) => (
            <tr key={i}>
              {citation.columns.map((col) => {
                const isHighlight =
                  citation.highlightCell?.column === col && citation.highlightCell?.value === row[col]
                return (
                  <td
                    key={col}
                    className="font-body text-2xs px-xxs py-xxs truncate"
                    style={
                      isHighlight
                        ? {
                            backgroundColor: 'var(--highlight-match)',
                            color: 'var(--highlight-match-text)',
                            fontWeight: 600,
                          }
                        : { color: 'var(--text-secondary)' }
                    }
                  >
                    {row[col]}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {citation.totalRows !== undefined && (
        <span className="font-body text-2xs" style={{ color: 'var(--text-tertiary)' }}>
          {citation.rows.length} of {citation.totalRows.toLocaleString()} rows
        </span>
      )}

      <button
        type="button"
        onClick={onOpen}
        className="font-display text-xs font-semibold text-left"
        style={{ color: 'var(--brand)' }}
      >
        Open in {citation.warehouse ?? 'warehouse'} →
      </button>
    </div>
  )
}
