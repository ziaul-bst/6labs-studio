/**
 * LibraryFilterDialog — Filter modal for the Gameplay Library. Reuses the same
 * modal shell/style as the Radiologist FilterDialog (filter-dialog-* classes)
 * but its content is the Library's own filters: status, tags, and source.
 * Draft state commits on Apply.
 *
 * This is the single place tags, status and source are chosen; what ends up
 * applied reads back as removable chips above the grid.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '../ui/Button'
import { FilterPill } from '../atoms/FilterPill'
import { SOURCE_SHORT, type VideoUploadSource } from '../../lib/librarySource'

export type LibraryStatusFilter = 'all' | 'processing' | 'ready' | 'failed'

export interface LibraryFilterValue {
  status: LibraryStatusFilter
  tags: string[]
  sources: VideoUploadSource[]
}

interface LibraryFilterDialogProps {
  isOpen: boolean
  onClose: () => void
  /** All tags present across the library */
  allTags: string[]
  /** All sources present across the library */
  allSources: VideoUploadSource[]
  /** Current applied filter, used to seed the draft when opened */
  value: LibraryFilterValue
  onApply: (next: LibraryFilterValue) => void
}

const STATUS_OPTIONS: { value: LibraryStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
]

export function LibraryFilterDialog({
  isOpen,
  onClose,
  allTags,
  allSources,
  value,
  onApply,
}: LibraryFilterDialogProps) {
  const [status, setStatus] = useState<LibraryStatusFilter>(value.status)
  const [tags, setTags] = useState<Set<string>>(new Set(value.tags))
  const [sources, setSources] = useState<Set<VideoUploadSource>>(new Set(value.sources))

  // Re-seed the draft from the applied value each time the dialog opens.
  useEffect(() => {
    if (isOpen) {
      setStatus(value.status)
      setTags(new Set(value.tags))
      setSources(new Set(value.sources))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  if (!isOpen) return null

  const toggleTag = (t: string) => {
    const n = new Set(tags)
    n.has(t) ? n.delete(t) : n.add(t)
    setTags(n)
  }
  const toggleSource = (s: VideoUploadSource) => {
    const n = new Set(sources)
    n.has(s) ? n.delete(s) : n.add(s)
    setSources(n)
  }

  const selectedCount = (status !== 'all' ? 1 : 0) + tags.size + sources.size

  const clearAll = () => {
    setStatus('all')
    setTags(new Set())
    setSources(new Set())
  }

  const apply = () => {
    onApply({ status, tags: Array.from(tags), sources: Array.from(sources) })
    onClose()
  }

  return createPortal(
    <div className="filter-dialog-overlay" onClick={onClose}>
      <div
        className="filter-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Filter library"
      >
        {/* Header */}
        <div className="filter-dialog-header">
          <span className="filter-dialog-title">Filters</span>
          <button type="button" className="filter-dialog-close" onClick={onClose} aria-label="Close filters">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="filter-dialog-body">
          <div className="flex flex-col gap-xl w-full overflow-y-auto flyout-scrollbar p-l">
            {/* Status */}
            <div className="flex flex-col gap-s items-start w-full">
              <span className="font-display text-s font-semibold" style={{ color: 'var(--text-primary)' }}>
                Status
              </span>
              <div className="flex items-center gap-xs flex-wrap">
                {STATUS_OPTIONS.map((s) => (
                  <FilterPill
                    key={s.value}
                    label={s.label}
                    selected={status === s.value}
                    onClick={() => setStatus(s.value)}
                  />
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-s items-start w-full">
              <span className="font-display text-s font-semibold" style={{ color: 'var(--text-primary)' }}>
                Tags
              </span>
              <p className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Set at upload, or added in bulk from the selection bar
              </p>
              {allTags.length > 0 ? (
                <div className="flex items-center gap-xs flex-wrap">
                  {allTags.map((t) => (
                    <FilterPill key={t} label={t} selected={tags.has(t)} onClick={() => toggleTag(t)} multi />
                  ))}
                </div>
              ) : (
                <span className="font-body text-xs" style={{ color: 'var(--text-placeholder)' }}>
                  No tags yet
                </span>
              )}
            </div>

            {/* Source */}
            <div className="flex flex-col gap-s items-start w-full">
              <span className="font-display text-s font-semibold" style={{ color: 'var(--text-primary)' }}>
                Source
              </span>
              <p className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
                How the clip reached the library
              </p>
              <div className="flex items-center gap-xs flex-wrap">
                {allSources.map((s) => (
                  <FilterPill
                    key={s}
                    label={SOURCE_SHORT[s]}
                    selected={sources.has(s)}
                    onClick={() => toggleSource(s)}
                    multi
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-dialog-footer">
          <div className="filter-footer-left">
            <Button variant="tertiary" size="lg" onClick={clearAll}>
              Clear all
            </Button>
            {selectedCount > 0 && <span className="filter-selected-count">{selectedCount} Selected</span>}
          </div>
          <div className="flex items-center gap-s">
            <Button variant="tertiary" size="lg" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="lg" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
