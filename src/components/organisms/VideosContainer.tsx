/**
 * VideosContainer — Session gallery with filter header and video grid/list views.
 * Contains: grid/list view toggle, filter button, VideoCard grid/list, "Show more" CTA,
 * and fallback empty state.
 *
 * Variants: Grid (3-col), Grid Small (2-col), List (horizontal rows), Fallback (empty state)
 *
 * @figmaComponent  Videos Container
 * @figmaNode       2737:30104
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=2737-30104
 *
 * Source: studio/src/components/organisms/VideosContainer.tsx
 * Synced: 2026-04-05
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../ui/Button'
import { FilterIcon } from '../icons/FilterIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import { VideoCard } from '../molecules/VideoCard'
import { VideosEmptyState } from '../molecules/VideosEmptyState'
import { FilterDialog, type FilterState } from './FilterDialog'
import { MOCK_SESSIONS } from '../../lib/mocks/radiologist-sessions'
import type { VideoSource } from '../../lib/types/radiologist'

interface VideoSession {
  sessionId: string
  date: string
  duration: string
  description: string
  /** Origin of the video (defaults to 'live' when absent) */
  source?: VideoSource
  /** User-added upload tags */
  tags: string[]
  /** AI-extracted tags (optional) */
  aiTags?: string[]
}

const SOURCE_ORDER: VideoSource[] = ['live', 'manual-upload', 'ai-player']

interface VideosContainerProps {
  /** Which sessions to display — defaults to the Radiologist mock sessions */
  sessions?: VideoSession[]
  /** Number of columns for grid view (default: 3) */
  columns?: 2 | 3
  /** Called when a video card is clicked */
  onCardClick?: (session: VideoSession) => void
  /** Called with the count of sessions visible after filtering (for external headers) */
  onVisibleCountChange?: (count: number) => void
  className?: string
}

export function VideosContainer({
  sessions = MOCK_SESSIONS,
  columns = 3,
  onCardClick,
  onVisibleCountChange,
  className,
}: VideosContainerProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  // Applied Source & Tag filters (the only facets wired to the session data;
  // the FilterDialog's behavioural facets remain visual for now).
  const [sourceSel, setSourceSel] = useState<string[]>([])
  const [tagSel, setTagSel] = useState<string[]>([])
  const [aiTagSel, setAiTagSel] = useState<string[]>([])

  // Facet options present across the sessions.
  const allSources = useMemo(
    () => SOURCE_ORDER.filter((s) => sessions.some((v) => (v.source ?? 'live') === s)),
    [sessions],
  )
  const allTags = useMemo(
    () => Array.from(new Set(sessions.flatMap((v) => v.tags ?? []))).sort(),
    [sessions],
  )
  const allAiTags = useMemo(
    () => Array.from(new Set(sessions.flatMap((v) => v.aiTags ?? []))).sort(),
    [sessions],
  )

  const visible = useMemo(
    () =>
      sessions.filter((v) => {
        const src = v.source ?? 'live'
        const matchSource = sourceSel.length === 0 || sourceSel.includes(src)
        const matchTags = tagSel.length === 0 || (v.tags ?? []).some((t) => tagSel.includes(t))
        const matchAi = aiTagSel.length === 0 || (v.aiTags ?? []).some((t) => aiTagSel.includes(t))
        return matchSource && matchTags && matchAi
      }),
    [sessions, sourceSel, tagSel, aiTagSel],
  )

  const activeFilterCount = sourceSel.length + tagSel.length + aiTagSel.length

  // Report the filtered count up so an external "Found N sessions" header stays in sync.
  const lastReported = useRef<number>(-1)
  useEffect(() => {
    if (onVisibleCountChange && lastReported.current !== visible.length) {
      lastReported.current = visible.length
      onVisibleCountChange(visible.length)
    }
  }, [visible.length, onVisibleCountChange])

  const isEmpty = sessions.length === 0

  if (isEmpty) {
    return (
      <div className={['flex flex-col w-full', className].filter(Boolean).join(' ')}>
        <VideosEmptyState />
      </div>
    )
  }

  return (
    <div className={['flex flex-col w-full', className].filter(Boolean).join(' ')}>
      <div className="flex flex-col border border-border-subtle rounded-3xl overflow-hidden bg-bg-elements w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-end p-l bg-bg-elements z-[2] w-full">
          {/* Filter button — tertiary with left icon */}
          <Button
            variant="tertiary"
            size="md"
            leftIcon={<FilterIcon size={20} />}
            onClick={() => setFilterOpen(true)}
            className={filterOpen || activeFilterCount > 0 ? 'toggle-btn-active' : ''}
          >
            Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
          </Button>
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col gap-l items-start pb-l px-l z-[1] w-full">

          {visible.length === 0 ? (
            <VideosEmptyState />
          ) : (
            <>
              {/* Grid */}
              <div className={`grid ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-[12px] w-full`}>
                {visible.map((session) => (
                  <VideoCard key={session.sessionId} {...session} onClick={() => onCardClick?.(session)} />
                ))}
              </div>

              {/* Show more */}
              <Button
                variant="tertiary"
                size="md"
                pill
                rightIcon={<ChevronIcon direction="down" size={16} />}
                className="w-full"
              >
                Show more
              </Button>
            </>
          )}
        </div>

      </div>

      <FilterDialog
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        allSources={allSources}
        allTags={allTags}
        allAiTags={allAiTags}
        initialFilters={{ sources: sourceSel, sessionTags: tagSel, sessionAiTags: aiTagSel }}
        onApply={(filters: FilterState) => {
          setSourceSel(filters.sources)
          setTagSel(filters.sessionTags)
          setAiTagSel(filters.sessionAiTags)
          setFilterOpen(false)
        }}
      />
    </div>
  )
}
