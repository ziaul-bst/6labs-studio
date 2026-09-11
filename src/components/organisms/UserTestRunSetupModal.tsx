/**
 * UserTestRunSetupModal — the two decisions a run needs before it can start:
 * which recordings, and what the game was supposed to do.
 *
 * Sessions come first because the batch is the run. Tags do the selecting —
 * a tester batch is tagged once at upload and then picked in a single click,
 * which is why the tag rail sits above the grid rather than inside a filter
 * menu. Videos still indexing are shown but not selectable: hiding them would
 * make the count look wrong to anyone who just uploaded twelve clips.
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
import type { PickerSource, PickerVideo } from '../../lib/types/userTest'

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
  const pool = useMemo(() => pickerVideosFor(demoState), [demoState])

  const readyCountByTag = useMemo(() => {
    const counts: Record<string, number> = {}
    pool.forEach((v) => {
      if (v.status === 'ready') counts[v.tag] = (counts[v.tag] ?? 0) + 1
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

  const groups = useMemo(() => {
    const byTag = new Map<string, PickerVideo[]>()
    visible.forEach((v) => {
      const list = byTag.get(v.tag) ?? []
      list.push(v)
      byTag.set(v.tag, list)
    })
    return [...byTag.entries()].sort(
      (a, b) =>
        Number(activeTags.has(b[0])) - Number(activeTags.has(a[0])) || b[1].length - a[1].length,
    )
  }, [visible, activeTags])

  if (!isOpen) return null

  const selectedCount = selected.size
  const minutes = Math.round(selectedCount * AVG_MINUTES_PER_VIDEO)
  const selectedTags = [...new Set(pool.filter((v) => selected.has(v.id)).map((v) => v.tag))]
  const docSelected = docId !== NO_CONTEXT

  const toggleVideo = (video: PickerVideo) => {
    if (video.status !== 'ready') return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(video.id)) next.delete(video.id)
      else next.add(video.id)
      return next
    })
  }

  /** Tag pills select the whole batch — that is the point of tagging on upload. */
  const toggleTag = (tag: string) => {
    const members = pool.filter(
      (v) => v.status === 'ready' && (tag === '__recent' ? v.recent : v.tag === tag),
    )
    setActiveTags((prev) => {
      const next = new Set(prev)
      const turningOn = !next.has(tag)
      if (turningOn) next.add(tag)
      else next.delete(tag)
      setSelected((prevSel) => {
        const sel = new Set(prevSel)
        members.forEach((m) => (turningOn ? sel.add(m.id) : sel.delete(m.id)))
        return sel
      })
      return next
    })
  }

  const setGroupSelection = (tag: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      pool.filter((v) => v.tag === tag && v.status === 'ready').forEach((v) =>
        on ? next.add(v.id) : next.delete(v.id),
      )
      return next
    })
  }

  const clearAll = () => {
    setSelected(new Set())
    setActiveTags(new Set())
  }

  /** Widens the view without touching the selection — the empty state's way out. */
  const clearFilters = () => {
    setActiveTags(new Set())
    setSource('all')
    setSearch('')
  }

  const pinnedTags = allTags.filter((t, i) => i < MAX_TAG_PILLS || activeTags.has(t))
  const overflowTags = allTags.filter((t) => !pinnedTags.includes(t))
  const recentCount = pool.filter((v) => v.recent && v.status === 'ready').length

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
  /* An empty library and an over-tight filter are different problems with
     different ways out, so they get different empty states. Before, a studio
     with nothing uploaded was told to "clear a filter" it had never set. */
  const libraryEmpty = pool.length === 0
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
                {libraryEmpty
                  ? 'Recordings from your Gameplay Library.'
                  : 'Recordings from your Gameplay Library. Pick a tag to select a whole batch.'}
              </p>
            </div>

            {/* Filter chrome — hidden when the library is empty. A tag rail
                reading "Last 24h · 0" over a "your library is empty" panel
                invites the reviewer to debug a filter that is not the problem. */}
            {!libraryEmpty && (
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

              <TagOverflowMenu
                tags={overflowTags}
                countByTag={readyCountByTag}
                active={activeTags}
                onToggle={toggleTag}
                totalTags={allTags.length}
              />

              <FilterPill
                label="Last 24h"
                count={recentCount}
                selected={activeTags.has('__recent')}
                onClick={() => toggleTag('__recent')}
                multi
              />
            </div>

            {/* Filter bar */}
            <div
              className="flex items-center gap-xs px-xl py-s"
              style={{
                backgroundColor: 'var(--bg-page-pale)',
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div className="w-[320px]">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search videos"
                  aria-label="Search videos"
                  size="lg"
                />
              </div>
              <span className="font-body text-s text-text-tertiary leading-[1.5] shrink-0">
                Source
              </span>
              <SourceFilter value={source} onChange={setSource} />
              <span className="flex-1" />
            </div>

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
              ) : (
                groups.length === 0 && (
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
              {groups.map(([tag, videos]) => {
                const ready = videos.filter((v) => v.status === 'ready')
                const chosen = ready.filter((v) => selected.has(v.id)).length
                const all = ready.length > 0 && chosen === ready.length
                /* Both held-back reasons are named: a clip still arriving will
                   become pickable, a failed one needs re-uploading. */
                const uploading = videos.filter((v) => v.status === 'uploading').length
                const failed = videos.filter((v) => v.status === 'failed').length

                return (
                  <div key={tag} className="flex flex-col gap-s">
                    <div
                      className="flex items-center gap-xs pb-xs"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <Checkbox
                        checked={all}
                        indeterminate={chosen > 0 && !all}
                        onChange={() => setGroupSelection(tag, !all)}
                        aria-label={`Select all ${tag} recordings`}
                      />
                      {/* Baseline-aligned, matching the Gameplay Library group
                          header — box-centring two type sizes drifts the smaller
                          one above the title's baseline. */}
                      <div className="flex items-baseline gap-xs min-w-0">
                        <span className="font-display text-s font-semibold text-text-primary">
                          {tag}
                        </span>
                        <span className="font-body text-xs text-text-tertiary whitespace-nowrap">
                          {videos.length} video{videos.length > 1 ? 's' : ''}
                          {uploading > 0 && ` · ${uploading} uploading`}
                          {failed > 0 && ` · ${failed} failed`}
                        </span>
                      </div>
                      <span className="flex-1" />
                      <button
                        type="button"
                        onClick={() => setGroupSelection(tag, !all)}
                        className="font-body text-xs font-semibold text-text-brand hover:underline"
                      >
                        {all ? 'Deselect ' + tag : 'Select all ' + tag}
                      </button>
                    </div>

                    <div className="grid gap-m" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
                      {videos.map((v) => (
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
                          selected={selected.has(v.id)}
                          onToggleSelect={() => toggleVideo(v)}
                          onOpen={() => toggleVideo(v)}
                          showRowActions={false}
                          className={v.status === 'ready' ? undefined : 'opacity-60 pointer-events-none'}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              className="flex items-center gap-s px-xl py-m"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <span className="font-body text-s text-text-secondary leading-[1.5]">
                <strong className="font-semibold text-text-primary">{selectedCount}</strong> selected
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
                onClick={() => (pickOnly ? onPick?.([...selected]) : setStep(2))}
              >
                {pickOnly
                  ? `Use ${selectedCount} video${selectedCount === 1 ? '' : 's'}`
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
                onClick={() => onStartRun?.([...selected], runName.trim())}
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
