/**
 * UserTestRunSetupModal — the two decisions a run needs before it can start:
 * which recordings, and what the game was supposed to do.
 *
 * Sessions come first because the batch is the run. Tags do the selecting —
 * a tester batch is tagged once at upload and then picked in a single click,
 * which is why the tag rail sits above the grid rather than inside a filter
 * menu. Only READY clips reach this grid at all: a picker is a list of things
 * you can pick, and a run that cannot read a clip has no use for it on screen.
 * Anything still processing or failed is accounted for in the empty state
 * instead, where the count and the reason belong together.
 *
 * Step 2 is the game context. Without a document the run still finds issues,
 * it just can't group them by game step or compare them to a previous batch —
 * so "Run without context" is offered as a real choice with its consequence
 * stated, not hidden behind a skip link. Comparison depends on the document,
 * so it disables itself when there isn't one.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { VideoLibraryCard } from '../molecules/VideoLibraryCard'
import { batchTag } from '../../lib/libraryTags'
import { CheckIcon } from '../icons/CheckIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import { SearchIcon } from '../icons/SearchIcon'
import { useLibraryDemoState } from '../../lib/libraryDemoState'
import { VideosEmptyState } from '../molecules/VideosEmptyState'
import { FilterPill } from '../atoms/FilterPill'
import { TagOverflowMenu } from '../molecules/TagOverflowMenu'
import { SegmentedControl } from '../atoms/SegmentedControl'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import Input from '../ui/Input'
import { CloseIcon } from '../icons/CloseIcon'
import { FilePdfIcon } from '../icons/FilePdfIcon'
import { FileDocIcon } from '../icons/FileDocIcon'
import { UploadIcon } from '../icons/UploadIcon'
import {
  GAME_CONTEXT_DOCS,
  PICKER_SOURCE_LABELS,
  PICKER_VIDEOS,
  pickerVideosFor,
} from '../../lib/mocks/user-test'
import type { PickerSource, PickerStatus, PickerVideo } from '../../lib/types/userTest'

export interface UserTestRunSetupModalProps {
  isOpen: boolean
  onClose: () => void
  /** Fires with the selected video ids and the run's name once it is started. */
  onStartRun?: (videoIds: string[], runName: string) => void
  /** Tag pre-selected on open — the batch the user most likely means. */
  defaultTag?: string
  /** Seeds the wizard on a given step, so Storybook can show step 2 directly. */
  defaultStep?: 1 | 2
  /**
   * Picker-only mode: step 1 alone, no game-context step. Used by the composer
   * homes (User Test, Functional test), where name and context live on the
   * page and the modal's one job is choosing the recordings.
   */
  pickOnly?: boolean
  /** Fires with the chosen video ids in `pickOnly` mode. */
  onPick?: (videoIds: string[]) => void
  /** Selection to open with — so "Change selection" resumes, not restarts. */
  initialSelected?: string[]
  /**
   * Way out of the empty-library state. Without it the empty state is just a
   * message; with it the reviewer can go and upload something.
   */
  onOpenLibrary?: () => void
  className?: string
}

/** Rough play-time estimate per clip, so the footer total moves as you select. */
const AVG_MINUTES_PER_VIDEO = 12.5
/**
 * Same page size as the Gameplay Library, for the same reasons — see
 * VideoLibraryView. The picker reads the same corpus, so a studio whose
 * library pages at 200 cannot have a picker that renders all 1,000: it is the
 * same grid of the same cards, and here it sits inside a dialog.
 */
const PAGE_SIZE = 200
const MAX_TAG_PILLS = 5
const NO_CONTEXT = 'none'

export function UserTestRunSetupModal({
  isOpen,
  onClose,
  onStartRun,
  defaultTag = 'Build V2.2',
  defaultStep = 1,
  pickOnly = false,
  onPick,
  initialSelected,
  onOpenLibrary,
  className,
}: UserTestRunSetupModalProps) {
  const [step, setStep] = useState<1 | 2>(defaultStep)
  const [selected, setSelected] = useState<Set<string>>(() =>
    initialSelected ? new Set(initialSelected) : seedSelection(defaultTag),
  )
  const [activeTags, setActiveTags] = useState<Set<string>>(() =>
    initialSelected ? new Set() : new Set([defaultTag]),
  )
  const [source, setSource] = useState<PickerSource | 'all'>('all')
  /**
   * "Every clip that matches", held as a flag rather than as a set of ids —
   * see VideoLibraryView, which settled this. Here it resolves to real ids at
   * one moment only: when the run is confirmed. That is one enumeration of the
   * corpus instead of one per render, and it is the moment the ids are
   * actually needed.
   */
  const [allMatching, setAllMatching] = useState(false)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [runName, setRunName] = useState('Build V2.3 — onboarding (Sep 7)')
  const [docId, setDocId] = useState<string>(GAME_CONTEXT_DOCS[0].id)
  const [compare, setCompare] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // A dialog that only closes by clicking its scrim traps anyone on a keyboard.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Move focus into the dialog so the next Tab lands inside it, not behind it.
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus()
  }, [isOpen])

  /* The picker shows whatever the library holds, so it follows the same
     reviewer state pill — see lib/libraryDemoState. */
  const demoState = useLibraryDemoState()
  const library = useMemo(() => pickerVideosFor(demoState), [demoState])

  /* The picker's pool is the ready clips and nothing else. Showing the rest
     greyed out put un-pickable cards in every count on the screen — the tag
     pills, "Select all N", the grid itself — and asked the reader to sort the
     usable from the unusable by opacity. What is still processing or failed is
     a library matter, and the empty state below says so when it is ALL of
     them; it is not a decision to be made one card at a time. */
  const pool = useMemo(() => library.filter((v) => v.status === 'ready'), [library])

  const readyCountByTag = useMemo(() => {
    const counts: Record<string, number> = {}
    pool.forEach((v) => {
      counts[v.tag] = (counts[v.tag] ?? 0) + 1
    })
    return counts
  }, [pool])

  const allTags = useMemo(
    () =>
      Object.keys(readyCountByTag).sort(
        (a, b) => readyCountByTag[b] - readyCountByTag[a] || a.localeCompare(b),
      ),
    [readyCountByTag],
  )

  const visible = useMemo(
    () =>
      pool.filter((v) => {
        if (source !== 'all' && v.source !== source) return false
        if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false
        if (activeTags.size === 0) return true
        return activeTags.has(v.tag) || (activeTags.has('__recent') && v.recent)
      }),
    [pool, source, search, activeTags],
  )

  /* One flat grid, like the Gameplay Library. Sections by tag restated the tag
     rail directly above them and the Batch pill on every card, and each header
     carried its own "Select all <tag>" — a third way to do what the rail and
     the card checkboxes already did. Clips the active tags picked out lead, so
     filtering still surfaces what you asked for first. */
  const shown = useMemo(
    () =>
      [...visible].sort(
        (a, b) => Number(activeTags.has(b.tag)) - Number(activeTags.has(a.tag)),
      ),
    [visible, activeTags],
  )

  /** The cards that actually render. */
  const loaded = useMemo(() => shown.slice(0, pages * PAGE_SIZE), [shown, pages])

  /* Narrowing the batch changes what "all of them" means, so the page depth,
     the flag and the ticked ids all reset with it. Held in state and compared
     against committed state rather than mutated on a ref — a ref written
     during render is discarded by StrictMode's second pass. */
  const facetKey = `${search.trim().toLowerCase()}|${source}|${[...activeTags].sort().join(',')}`
  const [lastFacetKey, setLastFacetKey] = useState(facetKey)
  if (lastFacetKey !== facetKey) {
    setLastFacetKey(facetKey)
    setPages(1)
    setAllMatching(false)
  }

  if (!isOpen) return null

  const remaining = shown.length - loaded.length
  const nextPageSize = Math.min(PAGE_SIZE, remaining)
  /* Under a filter "all of them" is the matches, not the library. */
  const scopeLabel = search.trim() || source !== 'all' || activeTags.size > 0 ? 'matching these filters' : 'in the library'

  const isSelected = (id: string) => allMatching || selected.has(id)
  const loadedSelected = allMatching
    ? loaded.length
    : loaded.reduce((n, v) => n + (selected.has(v.id) ? 1 : 0), 0)
  const allShownSelected = loaded.length > 0 && loadedSelected === loaded.length
  const someShownSelected = loadedSelected > 0

  const selectedCount = allMatching ? shown.length : selected.size
  const minutes = Math.round(selectedCount * AVG_MINUTES_PER_VIDEO)
  const selectedTags = allMatching
    ? [...new Set(shown.map((v) => v.tag))]
    : [...new Set(pool.filter((v) => selected.has(v.id)).map((v) => v.tag))]
  const docSelected = docId !== NO_CONTEXT
  /** The ids a run is actually started with — resolved once, on confirm. */
  const resolveSelection = () => (allMatching ? shown.map((v) => v.id) : [...selected])

  /* Taking one card out of "all of them" drops back to the page, the way it
     does in a mail client: a selection with exceptions is a list of ids again. */
  const toggleVideo = (video: PickerVideo) => {
    if (allMatching) {
      setAllMatching(false)
      setSelected(new Set(loaded.filter((v) => v.id !== video.id).map((v) => v.id)))
      return
    }
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(video.id)) next.delete(video.id)
      else next.add(video.id)
      return next
    })
  }

  /** Tag pills select the whole batch — that is the point of tagging on upload. */
  const toggleTag = (tag: string) => {
    const members = pool.filter((v) => (tag === '__recent' ? v.recent : v.tag === tag))
    setActiveTags((prev) => {
      const next = new Set(prev)
      const turningOn = !next.has(tag)
      if (turningOn) next.add(tag)
      else next.delete(tag)
      setAllMatching(false)
      setSelected((prevSel) => {
        const sel = new Set(prevSel)
        members.forEach((m) => (turningOn ? sel.add(m.id) : sel.delete(m.id)))
        return sel
      })
      return next
    })
  }

  /* Scoped to what is on screen — a select-all under an active filter has to
     mean the clips you can see. */
  const setAllShownSelected = (on: boolean) => {
    setAllMatching(false)
    setSelected((prev) => {
      const next = new Set(prev)
      loaded.forEach((v) => (on ? next.add(v.id) : next.delete(v.id)))
      return next
    })
  }

  const clearAll = () => {
    clearSelection()
    setActiveTags(new Set())
  }

  /** Drops the selection and leaves the filters alone — the banner's way out. */
  const clearSelection = () => {
    setAllMatching(false)
    setSelected(new Set())
  }

  /** Widens the view without touching the selection — the empty state's way out. */
  const clearFilters = () => {
    setActiveTags(new Set())
    setSource('all')
    setSearch('')
  }

  const pinnedTags = allTags.filter((t, i) => i < MAX_TAG_PILLS || activeTags.has(t))
  const overflowTags = allTags.filter((t) => !pinnedTags.includes(t))
  const recentCount = pool.filter((v) => v.recent).length

  /* Named back to the user, because "no results" without the reason reads as a
     bug — but as terms, not a sentence: spelled out, six tags and a query ran
     to three lines and stopped being readable. Tags past two collapse to a
     count, and the selection note is a clause, not its own sentence. */
  const activeFilters = [
    search.trim() && `“${search.trim()}”`,
    source !== 'all' && PICKER_SOURCE_LABELS[source],
    summarizeTags([...activeTags].filter((t) => t !== '__recent')),
    activeTags.has('__recent') && 'last 24h',
  ].filter(Boolean) as string[]
  /* Three different reasons for an empty grid, three different ways out. A
     studio with nothing uploaded was once told to "clear a filter" it had never
     set; a studio whose whole batch is still processing would now be told its
     library is empty, which is worse — it is looking at twelve clips on the
     Library page. So the middle case is named: the clips exist, none of them
     are readable yet, and here is when that changes. */
  const libraryEmpty = library.length === 0
  const countOf = (status: PickerStatus) => library.filter((v) => v.status === status).length
  const uploadingCount = countOf('uploading')
  const processingCount = countOf('processing')
  const failedCount = countOf('failed')
  const nothingReady = !libraryEmpty && pool.length === 0
  /* Both states hide the filter chrome: nothing on the rail can widen a grid
     whose contents are not ready to be picked. */
  const nothingToPick = libraryEmpty || nothingReady
  /* Three clauses because they are three different waits. An upload finishes
     in minutes and needs no explanation; processing is the one with a bound
     worth quoting; a failure is not a wait at all and needs an action. */
  const sessionWord = (n: number) => `${n} session${n === 1 ? '' : 's'}`
  const pendingMessage = [
    uploadingCount > 0 && `${sessionWord(uploadingCount)} still uploading.`,
    processingCount > 0 &&
      `${sessionWord(processingCount)} still processing — processing can take up to 24 hours, and they appear here once it completes.`,
    failedCount > 0 &&
      `${sessionWord(failedCount)} failed to upload; retry ${failedCount === 1 ? 'it' : 'them'} in the Gameplay Library.`,
  ]
    .filter(Boolean)
    .join(' ')
  const emptyMessage =
    activeFilters.length === 0
      ? 'Upload or record a session — it appears here as soon as it finishes uploading.'
      : `Filters: ${activeFilters.join(' · ')}${
          selectedCount > 0 ? ` — your ${selectedCount} picks stay selected.` : '. Drop one to widen the batch.'
        }`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-xl"
      style={{ backgroundColor: 'rgba(3,13,45,0.45)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Set up a user test run"
        onClick={(e) => e.stopPropagation()}
        className={[
          'flex flex-col w-full max-w-[1080px] max-h-[calc(100vh-48px)] rounded-4xl overflow-hidden shadow-big',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ backgroundColor: 'var(--bg-elements)' }}
      >
        {/* ── Step crumbs ── */}
        <div className="flex items-center justify-between gap-m px-xl pt-l">
          <div className="flex items-center gap-xs font-display text-xs font-semibold uppercase tracking-[0.08em]">
            {pickOnly ? (
              <span className="text-text-tertiary">Gameplay Library</span>
            ) : (
              <>
                <Crumb index={1} label="Sessions" step={step} onClick={() => setStep(1)} />
                <span className="text-text-placeholder" aria-hidden>›</span>
                <Crumb index={2} label="Game context & run" step={step} />
              </>
            )}
          </div>
          <Button variant="transparent" size="md" iconOnly onClick={onClose} aria-label="Close">
            <CloseIcon size={16} />
          </Button>
        </div>

        {step === 1 ? (
          <>
            <div className="flex flex-col gap-xxs px-xl pt-s pb-m">
              <h2 className="font-display text-l font-semibold text-text-primary leading-[1.3]">
                Pick sessions
              </h2>
              <p className="font-body text-s text-text-secondary leading-[1.6] max-w-[80ch]">
                {nothingToPick
                  ? 'Recordings from your Gameplay Library.'
                  : 'Recordings from your Gameplay Library. Pick a tag to select a whole batch.'}
              </p>
            </div>

            {/* Filter chrome — hidden when the library is empty. A tag rail
                reading "Last 24h · 0" over a "your library is empty" panel
                invites the reviewer to debug a filter that is not the problem. */}
            {!nothingToPick && (
              <>
            {/* Tag rail — the fast path */}
            <div className="flex flex-wrap items-center gap-xs px-xl pb-m">
              <span className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Select by tag
              </span>
              {pinnedTags.map((tag) => (
                <FilterPill
                  key={tag}
                  label={tag}
                  count={readyCountByTag[tag]}
                  selected={activeTags.has(tag)}
                  onClick={() => toggleTag(tag)}
                  multi
                />
              ))}

              <FilterPill
                label="Last 24h"
                count={recentCount}
                selected={activeTags.has('__recent')}
                onClick={() => toggleTag('__recent')}
                multi
              />

              {/* Same order as the Gameplay Library rail: everything left of
                  the rule filters on click, the tail opens a menu. */}
              <span
                className="w-px h-[20px] shrink-0"
                style={{ backgroundColor: 'var(--border-default)' }}
                aria-hidden
              />

              <TagOverflowMenu
                tags={overflowTags}
                countByTag={readyCountByTag}
                active={activeTags}
                onToggle={toggleTag}
                totalTags={allTags.length}
              />

            </div>

            {/* Filter bar */}
            <div
              className="flex items-center gap-l px-xl py-s flex-nowrap"
              style={{
                backgroundColor: 'var(--bg-page-pale)',
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              {/* Same toolbar order as the Gameplay Library: the one control
                  that acts on the collection leads, a rule separates it from the
                  two that only narrow it, and search sits opposite on the right. */}
              {loaded.length > 0 && (
                <>
                  {/* Checkbox, label and count as one group at a tighter gap;
                      the rule after them takes the row's full gap. */}
                  <div className="flex items-center gap-s shrink-0">
                  <label className="flex items-center gap-xs shrink-0 cursor-pointer">
                    <Checkbox
                      checked={allShownSelected}
                      indeterminate={someShownSelected && !allShownSelected}
                      onChange={() => setAllShownSelected(!allShownSelected)}
                      aria-label={allShownSelected ? 'Deselect all loaded videos' : 'Select all loaded videos'}
                    />
                    {/* The number is the one the control ACTS on, so pressing
                        the banner's whole-library offer visibly moves it. */}
                    {/* One number; the total rides on it greyed — see the
                        Gameplay Library's toolbar, which this mirrors. */}
                    <span
                      className="font-body text-s leading-[1.5] whitespace-nowrap"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {allShownSelected
                        ? `Deselect all ${selectedCount.toLocaleString()}`
                        : `Select all ${loaded.length}`}
                      {remaining > 0 && !allMatching && (
                        <span style={{ color: 'var(--text-tertiary)' }}>
                          {' '}of {shown.length.toLocaleString()}
                        </span>
                      )}
                    </span>
                  </label>
                  </div>
                  <span
                    className="w-px h-[20px] shrink-0"
                    style={{ backgroundColor: 'var(--border-default)' }}
                    aria-hidden
                  />
                </>
              )}

              {/* The source segments give way on a narrow dialog — they scroll
                  rather than clip, so the last option stays reachable and the
                  toolbar stays one line with the search opposite it. */}
              <span className="flex items-center gap-s min-w-0 segment-scroll">
                <span className="font-body text-s text-text-tertiary leading-[1.5] shrink-0">
                  Source
                </span>
                <SourceFilter value={source} onChange={setSource} />
              </span>
              <span className="flex-1" />
              <div className="library-search w-[240px] min-w-[150px] shrink">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search videos"
                  aria-label="Search videos"
                  size="lg"
                  leftIcon={<SearchIcon size={20} />}
                />
              </div>
            </div>

            {/* ── The second half of the selection ──
                Only once the page is fully ticked and there is more behind it.
                Two grounds on purpose: the offer is neutral, taking it turns
                brand and grows a mark — the difference between a run over 200
                sessions and a run over 1,000 is the whole banner. */}
            {(allMatching || (allShownSelected && remaining > 0)) && (
              <div
                className="flex items-center justify-center gap-xs px-xl py-s w-full text-center flex-wrap"
                style={{
                  backgroundColor: allMatching ? 'var(--bg-tint)' : 'var(--bg-page-pale)',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
                role="status"
              >
                {allMatching && (
                  <span
                    className="inline-flex items-center justify-center shrink-0 w-[18px] h-[18px] rounded-round text-white"
                    style={{ backgroundColor: 'var(--brand)' }}
                    aria-hidden
                  >
                    <CheckIcon size={12} />
                  </span>
                )}
                <span
                  className="font-body text-s leading-[1.5]"
                  style={{ color: allMatching ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  {allMatching ? (
                    <>
                      All <strong className="font-semibold">{shown.length.toLocaleString()} sessions</strong>{' '}
                      {scopeLabel} are selected.
                    </>
                  ) : (
                    `All ${loaded.length} sessions on this page are selected.`
                  )}
                </span>
                <button
                  type="button"
                  className="font-body text-s font-semibold leading-[1.5] hover:underline"
                  style={{ color: 'var(--brand)' }}
                  onClick={() => (allMatching ? clearSelection() : setAllMatching(true))}
                >
                  {allMatching
                    ? 'Clear selection'
                    : `Select all ${shown.length.toLocaleString()} ${scopeLabel}`}
                </button>
              </div>
            )}

              </>
            )}

            {/* Groups */}
            <div className="flex flex-col gap-xl flex-1 min-h-0 overflow-y-auto px-xl py-l">
              {libraryEmpty ? (
                /* Nothing in the library at all — the way out is the Library
                   page, not a filter. */
                <VideosEmptyState
                  title="Your Gameplay Library is empty"
                  message="Upload gameplay clips to the library and they become available to pick here."
                  action={
                    onOpenLibrary ? (
                      <Button variant="secondary" size="lg" onClick={onOpenLibrary}>
                        Open Gameplay Library
                      </Button>
                    ) : undefined
                  }
                />
              ) : nothingReady ? (
                /* The clips are there, they just cannot be read yet. The bound
                   is the whole answer here — it is what decides whether to wait
                   or come back tomorrow — so it leads, and the failures are a
                   separate clause because they need a different action. */
                <VideosEmptyState
                  title="No sessions are ready to pick yet"
                  message={pendingMessage}
                  action={
                    onOpenLibrary ? (
                      <Button variant="secondary" size="lg" onClick={onOpenLibrary}>
                        Open Gameplay Library
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                shown.length === 0 && (
                  /* The dialog used to shrink to one grey line here, which read
                     as a broken picker rather than an empty result — and hid the
                     fact that a selection was still held. So: the library's own
                     fallback, the filters that caused it named back, and one way
                     out that keeps what is already picked. */
                  <VideosEmptyState
                    title="No recordings match these filters"
                    message={emptyMessage}
                    action={
                      activeFilters.length > 0 ? (
                        <Button variant="secondary" size="lg" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      ) : undefined
                    }
                  />
                )
              )}
              {loaded.length > 0 && (
                <div className="grid gap-m" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
                  {loaded.map((v) => (
                    <VideoLibraryCard
                      key={v.id}
                      title={v.title}
                      dateLabel={v.meta}
                      sourceLabel={PICKER_SOURCE_LABELS[v.source]}
                      durationLabel={v.duration}
                      gradient={v.gradient}
                      status={v.status}
                      progress={100}
                      tags={[batchTag(v.tag)]}
                      selected={isSelected(v.id)}
                      onToggleSelect={() => toggleVideo(v)}
                      onOpen={() => toggleVideo(v)}
                      showRowActions={false}
                    />
                  ))}
                </div>
              )}

              {/* The next page — the same full-bleed control the Gameplay
                  Library and the Radiologist's session grid use. */}
              {remaining > 0 && (
                <Button
                  variant="tertiary"
                  size="lg"
                  pill
                  rightIcon={<ChevronIcon direction="down" size={16} />}
                  className="w-full"
                  onClick={() => setPages((n) => n + 1)}
                  aria-label={`Show ${nextPageSize} more sessions`}
                >
                  Show more
                </Button>
              )}
            </div>

            <div
              className="flex items-center gap-s px-xl py-m"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <span className="font-body text-s text-text-secondary leading-[1.5]">
                <strong className="font-semibold text-text-primary">{selectedCount.toLocaleString()}</strong> selected
                {' · '}
                {Math.floor(minutes / 60)}h {minutes % 60}m of play
                {selectedTags.length > 0 && (
                  <span className="text-text-tertiary"> · {summarizeTags(selectedTags)}</span>
                )}
              </span>
              <span className="flex-1" />
              <Button
                variant="secondary"
                size="lg"
                onClick={clearAll}
                disabled={selectedCount === 0}
              >
                Clear all
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={selectedCount === 0}
                onClick={() => (pickOnly ? onPick?.(resolveSelection()) : setStep(2))}
              >
                {pickOnly
                  ? `Use ${selectedCount.toLocaleString()} session${selectedCount === 1 ? '' : 's'}`
                  : 'Next'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-xxs px-xl pt-s pb-m">
              <h2 className="font-display text-l font-semibold text-text-primary leading-[1.3]">
                Game context &amp; run
              </h2>
              <p className="font-body text-s text-text-secondary leading-[1.6] max-w-[80ch]">
                Name the run, add how the game is meant to play, and start.
              </p>
            </div>

            <div className="flex flex-col gap-l flex-1 min-h-0 overflow-y-auto px-xl pb-l">
              <Field label="Run name">
                <Input
                  value={runName}
                  onChange={(e) => setRunName(e.target.value)}
                  aria-label="Run name"
                />
              </Field>

              <Field
                label="Game context"
                help="A GDD, onboarding flow, or feature spec — it gives the run the game steps to group findings by."
              >
                <div
                  className="flex flex-col rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--border-subtle)' }}
                >
                  {GAME_CONTEXT_DOCS.map((doc, i) => (
                    <DocRow
                      key={doc.id}
                      first={i === 0}
                      selected={docId === doc.id}
                      onSelect={() => setDocId(doc.id)}
                      badge={doc.fileType}
                      name={doc.name}
                      meta={doc.meta}
                    />
                  ))}
                  {/* An opt-out, not a fifth document — ruled off so it reads
                      as the other kind of choice. */}
                  <DocRow
                    first={false}
                    separated
                    selected={docId === NO_CONTEXT}
                    onSelect={() => {
                      setDocId(NO_CONTEXT)
                      setCompare(false)
                    }}
                    name="Run without context"
                    meta="Findings per video, not grouped by step."
                  />
                </div>
                <Button variant="secondary" size="md" leftIcon={<UploadIcon size={16} />} className="self-start">
                  Upload new
                </Button>
              </Field>

              <Field
                label="Compare with a previous run"
                help={
                  docSelected
                    ? 'Shows which issues are new, still open, and fixed.'
                    : 'Needs a game context document — comparison matches issues by game step.'
                }
                disabled={!docSelected}
              >
                {/* A filled button here would read as the recommended action and
                    would compete with Start run — this is a state, not a CTA. */}
                <SegmentedControl<'no' | 'yes'>
                  ariaLabel="Compare with a previous run"
                  className="self-start"
                  disabled={!docSelected}
                  value={compare ? 'yes' : 'no'}
                  onChange={(v) => setCompare(v === 'yes')}
                  options={[
                    { value: 'no', label: 'No' },
                    { value: 'yes', label: 'Yes' },
                  ]}
                />
                {compare && docSelected && (
                  <div
                    className="flex items-center gap-xs rounded-xl px-m py-s"
                    style={{ backgroundColor: 'var(--bg-page-pale)', border: '1px solid var(--border-subtle)' }}
                  >
                    <span className="font-body text-s text-text-primary leading-[1.5]">
                      Build V2.1 — onboarding (Aug 26)
                    </span>
                    <span
                      className="inline-flex items-center px-xs py-xxxs rounded-xs font-body text-xs text-text-secondary"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    >
                      10 videos · 7 issues
                    </span>
                  </div>
                )}
              </Field>
            </div>

            <div
              className="flex items-center gap-s px-xl py-m"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <span className="font-body text-s text-text-tertiary leading-[1.5]">
                {selectedCount} recordings · {Math.floor(minutes / 60)}h {minutes % 60}m of play
              </span>
              <span className="flex-1" />
              <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={!runName.trim()}
                onClick={() => onStartRun?.(resolveSelection(), runName.trim())}
              >
                Start run
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

/**
 * Two names read faster than six. Past that the list stops being scannable and
 * the count is the useful part — the pills above already say which batches.
 */
function summarizeTags(tags: string[]): string {
  if (tags.length === 0) return ''
  if (tags.length <= 2) return tags.join(', ')
  return `${tags.length} batches`
}

/* Seeds the opening selection from the default fixture only — the other
   reviewer states have nothing pickable to pre-select, and the picker clears
   the selection when the state changes anyway. */
function seedSelection(tag: string) {
  return new Set(PICKER_VIDEOS.filter((v) => v.status === 'ready' && v.tag === tag).map((v) => v.id))
}

function Crumb({
  index,
  label,
  step,
  onClick,
}: {
  index: 1 | 2
  label: string
  step: 1 | 2
  onClick?: () => void
}) {
  const state = index === step ? 'on' : index < step ? 'done' : 'todo'
  /* A completed step is a place you can go back to. Back is not the only route,
     and a crumb that looks like a trail but isn't one is a dead end. */
  const interactive = state === 'done' && Boolean(onClick)
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={interactive ? 'hover:underline cursor-pointer' : 'cursor-default'}
      style={{
        color:
          state === 'on'
            ? 'var(--text-brand)'
            : state === 'done'
              ? 'var(--text-secondary)'
              : 'var(--text-placeholder)',
      }}
    >
      {index}&nbsp;&nbsp;{label}
    </button>
  )
}

function SourceFilter({
  value,
  onChange,
}: {
  value: PickerSource | 'all'
  onChange: (v: PickerSource | 'all') => void
}) {
  /* A segmented control on a neutral track, not the pill used by the tag rail
     directly above. Two filter axes that look identical read as one. */
  return (
    <SegmentedControl<PickerSource | 'all'>
      ariaLabel="Filter by capture source"
      size="sm"
      tone="contrast"
      value={value}
      onChange={onChange}
      options={[
        { value: 'all', label: 'All' },
        { value: 'recorder', label: PICKER_SOURCE_LABELS.recorder },
        { value: 'direct', label: PICKER_SOURCE_LABELS.direct },
        { value: 'cli', label: PICKER_SOURCE_LABELS.cli },
      ]}
    />
  )
}

function Field({
  label,
  help,
  disabled,
  children,
}: {
  label: string
  help?: string
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <div
      className="flex flex-col gap-xs"
      style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
    >
      <span className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">
        {label}
      </span>
      {children}
      {help && (
        <span className="font-body text-xs text-text-tertiary leading-[1.6]">{help}</span>
      )}
    </div>
  )
}

function DocRow({
  first,
  separated,
  selected,
  onSelect,
  badge,
  name,
  meta,
}: {
  first: boolean
  /** Heavier rule above — marks a choice that is not one of the documents. */
  separated?: boolean
  selected: boolean
  onSelect: () => void
  badge?: 'pdf' | 'docx'
  name: string
  meta: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="user-test-doc-row flex items-center gap-s w-full text-left px-m py-s"
      style={{
        borderTop: first
          ? 'none'
          : `1px solid ${separated ? 'var(--border-default)' : 'var(--border-subtle)'}`,
        backgroundColor: selected ? 'var(--bg-tint-light)' : 'transparent',
      }}
    >
      <Checkbox radio checked={selected} onChange={onSelect} aria-label={name} />
      <span
        className="shrink-0 w-5 flex items-center justify-center"
        style={{ color: badge === 'pdf' ? 'var(--error)' : 'var(--brand)' }}
        aria-hidden
      >
        {badge === 'docx' ? (
          <FileDocIcon size={20} />
        ) : badge === 'pdf' ? (
          <FilePdfIcon size={20} />
        ) : (
          <span
            className="w-3 h-px"
            style={{ backgroundColor: 'var(--border-default)' }}
          />
        )}
      </span>
      <span className="flex flex-col gap-xxxs min-w-0">
        <span className="font-display text-s font-semibold text-text-primary leading-[1.45] truncate">
          {name}
        </span>
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">{meta}</span>
      </span>
    </button>
  )
}
