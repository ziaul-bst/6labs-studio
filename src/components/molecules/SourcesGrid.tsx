/**
 * SourcesGrid — Sources block inside an Oracle AI response.
 *
 * Collapsed: a single summary row — "Sources · N docs · N connectors · N sessions"
 * with a chevron. Expanded: doc pills, connector pills, then a 3-up row of video
 * thumbnails. Rows with no items are omitted.
 *
 * Clicking a video thumbnail opens THAT video (`onSourceClick`) rather than a
 * list of all of them — the thumbnail you pressed is the one you meant, and
 * routing every click to the same panel made the row look decorative. It falls
 * back to `onExpandSources` when no handler is given. The expanded block ends
 * with a way into the Gameplay Library, for the footage behind the answer that
 * did not make the 3-up row.
 *
 * @figmaComponent  Sources Container
 * @figmaNode       7610:82344
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=7610-82344
 *
 * @figmaComponent  Source Doc Card
 * @figmaNode       6899:74691
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6899-74691
 */

import { useState } from 'react'
import { ChevronIcon } from '../icons/ChevronIcon'
import { ClockIcon } from '../icons/ClockIcon'
import { SourceDocIcon } from '../icons/SourceDocIcon'
import { SnowflakeIcon } from '../icons/connectors/SnowflakeIcon'
import { BigQueryIcon } from '../icons/connectors/BigQueryIcon'

export interface SourceItem {
  id: string
  thumbnailSrc?: string
  duration: string
  title?: string
}

/** Uploaded document cited by the response. */
export interface SourceDoc {
  id: string
  label: string
}

export type SourceConnectorKind = 'snowflake' | 'bigquery'

/** Warehouse / connector dataset cited by the response. */
export interface SourceConnector {
  id: string
  label: string
  kind: SourceConnectorKind
}

interface SourcesGridProps {
  /** Video sources — first 3 are shown in the thumbnail row. */
  sources: SourceItem[]
  docs?: SourceDoc[]
  connectors?: SourceConnector[]
  /**
   * Total videos consulted, for the summary count. Defaults to `sources.length`
   * — pass the real total when the thumbnail row is only a sample.
   */
  totalVideos?: number
  /** Starts expanded when true. */
  defaultExpanded?: boolean
  /** Opens the sources side panel — the summary row, and the thumbnail fallback. */
  onExpandSources: () => void
  /**
   * Opens one specific video. `index` is the source's position, which is how
   * callers holding a parallel session list resolve it.
   */
  onSourceClick?: (source: SourceItem, index: number) => void
  /** Adds a "See all in Gameplay Library" row to the expanded block. */
  onOpenLibrary?: () => void
  className?: string
}

const CONNECTOR_ICON: Record<SourceConnectorKind, (props: { size?: number }) => JSX.Element> = {
  snowflake: SnowflakeIcon,
  bigquery: BigQueryIcon,
}

export function SourcesGrid({
  sources,
  docs = [],
  connectors = [],
  totalVideos,
  defaultExpanded = false,
  onExpandSources,
  onSourceClick,
  onOpenLibrary,
  className,
}: SourcesGridProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const displaySources = sources.slice(0, 3)
  const videoCount = totalVideos ?? sources.length

  const counts = [
    docs.length > 0 && `${docs.length} ${docs.length === 1 ? 'doc' : 'docs'}`,
    connectors.length > 0 &&
      `${connectors.length} ${connectors.length === 1 ? 'connector' : 'connectors'}`,
    /* "sessions", the word every testing surface now uses for a gameplay
       recording — the block used to say "10 videos" directly under a report
       counting "10 sessions analysed". */
    videoCount > 0 && `${videoCount} ${videoCount === 1 ? 'session' : 'sessions'}`,
  ].filter(Boolean) as string[]

  return (
    <div className={['flex flex-col gap-s items-start w-full', className].filter(Boolean).join(' ')}>
      {/* Summary row — toggles the expanded detail */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="oracle-sources-title flex items-center gap-xxs"
      >
        <span className="font-display text-m font-semibold leading-[1.5] text-text-primary">
          Sources
        </span>
        {counts.map((label) => (
          <span key={label} className="flex items-center gap-xxs">
            <span
              className="rounded-round shrink-0"
              style={{ width: 2, height: 2, backgroundColor: 'var(--text-placeholder)' }}
              aria-hidden
            />
            <span className="font-body text-xs font-normal leading-[1.5] text-text-tertiary">
              {label}
            </span>
          </span>
        ))}
        <ChevronIcon
          size={16}
          direction={expanded ? 'up' : 'down'}
          className="text-text-secondary shrink-0"
        />
      </button>

      {expanded && (
        <>
          {docs.length > 0 && (
            <div className="flex flex-wrap gap-s items-start">
              {docs.map((doc) => (
                <SourcePill key={doc.id} label={doc.label} tone="doc">
                  <SourceDocIcon size={16} className="text-text-tertiary" />
                </SourcePill>
              ))}
            </div>
          )}

          {connectors.length > 0 && (
            <div className="flex flex-wrap gap-s items-start">
              {connectors.map((conn) => {
                const Icon = CONNECTOR_ICON[conn.kind]
                return (
                  <SourcePill key={conn.id} label={conn.label} tone="connector">
                    <span className="rounded-s overflow-hidden inline-flex shrink-0">
                      <Icon size={16} />
                    </span>
                  </SourcePill>
                )
              })}
            </div>
          )}

          {displaySources.length > 0 && (
            <div className="flex gap-s items-start w-full">
              {displaySources.map((source, i) => (
                <VideoThumb
                  key={source.id}
                  source={source}
                  onOpen={
                    onSourceClick ? () => onSourceClick(source, i) : onExpandSources
                  }
                />
              ))}
            </div>
          )}

          {onOpenLibrary && (
            /* The row only shows the first three; the rest of the footage the
               answer drew on lives in the library. */
            <button
              type="button"
              onClick={onOpenLibrary}
              className="oracle-sources-library inline-flex items-center gap-xxs font-body text-xs font-semibold"
              style={{ color: 'var(--text-brand)' }}
            >
              {videoCount > displaySources.length
                ? `See all ${videoCount} in Gameplay Library`
                : 'See these in Gameplay Library'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

/** Pill listing one cited doc or connector dataset. */
function SourcePill({
  label,
  tone,
  children,
}: {
  label: string
  tone: 'doc' | 'connector'
  children: React.ReactNode
}) {
  return (
    <div
      className="flex gap-xs items-start rounded-m shrink-0 overflow-hidden"
      style={{
        padding: '8px 12px 8px 8px',
        backgroundColor: tone === 'doc' ? 'var(--bg-page-pale)' : 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex gap-xxs items-center min-w-0">
        <span
          className="rounded-s inline-flex items-center justify-center shrink-0"
          style={{ width: 16, height: 16 }}
        >
          {children}
        </span>
        <span
          className={[
            'font-body text-xs leading-[1.5] truncate',
            tone === 'doc' ? 'font-medium text-text-secondary' : 'font-normal text-text-tertiary',
          ].join(' ')}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

/** 16:9 video thumbnail with top/bottom scrims and a duration badge. */
function VideoThumb({ source, onOpen }: { source: SourceItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title={source.title}
      className="flex-1 min-w-0 rounded-m overflow-hidden relative bg-black"
      style={{ aspectRatio: '219 / 123' }}
    >
      {source.thumbnailSrc ? (
        <img
          src={source.thumbnailSrc}
          alt={source.title || source.id}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-base-910 to-base-950" />
      )}

      {/* Scrims — top and bottom, per the Figma overlays */}
      <div className="absolute top-0 left-0 right-0 h-[40px] bg-gradient-to-b from-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-black/60 to-transparent" />

      {/* Duration badge */}
      <div className="absolute bottom-[12px] right-[12px] flex gap-[5px] items-center">
        <ClockIcon size={16} className="text-white shrink-0" />
        <span className="font-display text-xs font-semibold text-white leading-[1.5]">
          {source.duration}
        </span>
      </div>
    </button>
  )
}
