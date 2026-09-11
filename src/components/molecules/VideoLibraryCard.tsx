/**
 * VideoLibraryCard — media card for a single uploaded gameplay video in the
 * Gameplay Library.
 *
 * Status model: 'uploading' → 'ready' | 'failed'
 *   - uploading: progress bar + % (transfer in flight)
 *   - ready:     duration + play affordance, clickable. NO badge — nothing
 *                works on a library clip after upload, so "ready" is simply
 *                the resting state and a badge on every card said nothing.
 *   - failed:    error message + Retry (re-runs the upload)
 *
 * There is no analysing state (removed 2026-09-10): no AI runs over library
 * footage, so a clip is either still arriving or it is here.
 *
 * The body is deliberately thin — title, date, tags — so a grid of forty clips
 * stays scannable.
 *
 * Source rides the thumbnail as a badge rather than the meta line, because a
 * library mixes five ingest paths and "which of these is AI footage" is a
 * scanning question, not a reading one. Tags carry their origin in the pill
 * itself: outlined + facet prefix for the batch/build the platform assigned,
 * filled bare label for what a person typed.
 *
 * Row actions (edit / delete) reveal on hover over the thumbnail rather than
 * taking a permanent footer row. The select checkbox does NOT hide on hover —
 * it is the only entry point to the bulk action bar, so it stays at rest.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useState } from 'react'
import { ProgressBar } from '../atoms/ProgressBar'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import { TrashIcon } from '../icons/TrashIcon'
import { EditIcon } from '../icons/EditIcon'
import { PlusIcon } from '../icons/PlusIcon'
import { CheckIcon } from '../icons/CheckIcon'
import { EventTag } from '../atoms/EventTag'
import { SystemTag } from '../atoms/SystemTag'
import { LibrarySourceBadge } from '../atoms/LibrarySourceBadge'
import { UserAvatar } from '../atoms/UserAvatar'
import { ClampTags } from './ClampTags'
import { partitionTags, toLibraryTags, type LibraryTag } from '../../lib/libraryTags'
import type { VideoUploadSource } from '../../lib/librarySource'

export type VideoStatus = 'uploading' | 'ready' | 'failed'

export interface VideoLibraryCardProps {
  /** grid = vertical media card; list = horizontal row for dense scanning */
  layout?: 'grid' | 'list'
  title: string
  dateLabel: string
  /**
   * Where the clip came from — rendered as a badge on the thumbnail. Preferred
   * over `sourceLabel`; when both are given the badge wins and the meta line
   * drops the label rather than saying it twice.
   */
  source?: VideoUploadSource
  /** Legacy free-text source, for surfaces with their own source vocabulary */
  sourceLabel?: string
  /**
   * Who put the clip in the library. The library is company-wide — everyone
   * sees everyone's footage — so "whose is this" is a question the card has to
   * answer without being opened.
   */
  uploadedBy?: string
  /** The uploader is the signed-in user, so the card says "You". */
  uploadedByYou?: boolean
  durationLabel?: string
  thumbnailSrc?: string
  /** Background gradient for the thumbnail fallback — varied per card for rhythm */
  gradient?: string
  status: VideoStatus
  progress: number
  /**
   * The clip's tags. `LibraryTag[]` carries origin — system tags (batch, stage,
   * test type) render outlined with their facet, user tags render as filled
   * neutral pills. Bare strings are treated as user tags.
   */
  tags?: (string | LibraryTag)[]
  errorMessage?: string
  /** Selection (bulk actions) — the checkbox is always visible, so the bulk bar is findable */
  selected?: boolean
  onToggleSelect?: () => void
  onDelete?: () => void
  onRetry?: () => void
  /** `tags` carries the edited USER tags only — system tags are not editable here */
  onSaveMeta?: (next: { title: string; tags: string[] }) => void
  /**
   * Tagging entry point for a clip nobody has tagged yet. Given a handler, a
   * dashed pill takes the place the user tags would occupy — same shape and
   * spot, so the empty slot reads as "this is where tags go" rather than as
   * nothing. Omit it where tagging is not the job (the run-setup picker).
   */
  onAddTags?: () => void
  /**
   * Thumbnail click (fires for any status). What it means is the host's call:
   * the Library opens the player, the run-setup picker toggles selection — so
   * the card no longer ships a tooltip claiming either.
   */
  onOpen?: () => void
  /**
   * Hover edit/delete affordances. Off when the card is being used to *pick*
   * rather than to manage — a run-setup picker has no business deleting a clip
   * out of the library.
   */
  showRowActions?: boolean
  /**
   * `hover` keeps the thumbnail clean at rest: the checkbox appears on hover,
   * when the card is selected, or while any selection is active (the host sets
   * `data-selecting` on the grid). Pickers keep `always`, since selecting is the
   * whole job there.
   */
  checkboxVisibility?: 'always' | 'hover'
  className?: string
}

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1770EF 0%, #7B4CFF 100%)'

/* Only the two states worth announcing. Ready is the resting state and carries
   no badge — see the status model above. */
const STATUS_META: Partial<Record<VideoStatus, { color: string; label: string }>> = {
  uploading: { color: 'var(--brand)', label: 'UPLOADING' },
  failed: { color: 'var(--error)', label: 'FAILED' },
}

function StatusBadge({ status }: { status: VideoStatus }) {
  const s = STATUS_META[status]
  if (!s) return null
  return (
    <span
      className="video-lib-badge inline-flex items-center gap-xxs px-xs py-xxxs rounded-round font-display text-2xs font-semibold uppercase tracking-[0.12em] leading-[1.5] shrink-0"
      style={{ color: s.color }}
    >
      <span className="video-lib-dot" style={{ backgroundColor: s.color }} aria-hidden />
      {s.label}
    </span>
  )
}

const PlayGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M7.5 5.5L14 10L7.5 14.5V5.5Z" fill="currentColor" />
  </svg>
)

export function VideoLibraryCard({
  layout = 'grid',
  title,
  dateLabel,
  source,
  sourceLabel,
  uploadedBy,
  uploadedByYou = false,
  durationLabel,
  thumbnailSrc,
  gradient = DEFAULT_GRADIENT,
  status,
  progress,
  tags = [],
  errorMessage,
  selected = false,
  onToggleSelect,
  onDelete,
  onRetry,
  onSaveMeta,
  onAddTags,
  onOpen,
  showRowActions = true,
  checkboxVisibility = 'always',
  className,
}: VideoLibraryCardProps) {
  const libraryTags = toLibraryTags(tags)
  const { system: systemTags, user: userTags } = partitionTags(libraryTags)
  const userLabels = userTags.map((t) => t.label)

  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)
  const [draftTags, setDraftTags] = useState(userLabels.join(', '))

  const isReady = status === 'ready'
  const isFailed = status === 'failed'
  const isUploading = status === 'uploading'

  /* Source is on the badge when we have the real facet; the meta line only
     falls back to free text for callers with their own source vocabulary. */
  const metaLine = [dateLabel, source ? null : sourceLabel].filter(Boolean).join(' · ')

  const startEdit = () => {
    setDraftTitle(title)
    setDraftTags(userLabels.join(', '))
    setEditing(true)
  }
  const saveEdit = () => {
    onSaveMeta?.({
      title: draftTitle.trim() || title,
      tags: draftTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
    setEditing(false)
  }

  // ── List layout — dense horizontal row for large libraries ──
  if (layout === 'list') {
    return (
      <div
        className={['video-lib-card group/lib flex rounded-xl overflow-hidden', className]
          .filter(Boolean)
          .join(' ')}
        data-selected={String(selected)}
      >
        {/* Thumbnail — fixed 168px, full row height */}
        <div
          className="relative shrink-0 w-[168px] self-stretch min-h-[94px] overflow-hidden cursor-pointer"
          onClick={onOpen}
          title={isReady ? undefined : 'Available once the upload finishes'}
        >
          {thumbnailSrc ? (
            <img src={thumbnailSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: gradient }} />
          )}
          <div className="absolute inset-0 video-lib-thumb-texture" aria-hidden />
          {!isReady && <div className="absolute inset-0 video-lib-dim" aria-hidden />}

          {isReady && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="video-lib-play video-lib-play-sm text-white">
                <PlayGlyph />
              </span>
            </div>
          )}

          {/* select checkbox */}
          <div className="absolute top-xs left-xs" onClick={(e) => e.stopPropagation()}>
            <span className="video-lib-check-bg">
              <Checkbox checked={selected} onChange={() => onToggleSelect?.()} aria-label={`Select ${title}`} />
            </span>
          </div>

          {isReady && durationLabel && (
            <span className="video-lib-duration absolute bottom-xs right-xs px-xs py-xxxs rounded-xs font-display text-2xs font-semibold text-white">
              {durationLabel}
            </span>
          )}

          {isUploading && (
            <div className="absolute inset-x-xs bottom-xs">
              <ProgressBar value={progress} />
            </div>
          )}
        </div>

        {/* Content */}
        {editing ? (
          <div className="flex flex-col flex-1 min-w-0 gap-s p-m">
            <div className="flex flex-col gap-xxs">
              <label className="font-display text-2xs font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--text-tertiary)' }}>
                Title
              </label>
              <Input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Video title"
                aria-label="Video title"
              />
            </div>
            <div className="flex flex-col gap-xxs">
              <label className="font-display text-2xs font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--text-tertiary)' }}>
                Your tags
              </label>
              <Input
                value={draftTags}
                onChange={(e) => setDraftTags(e.target.value)}
                placeholder="Tags, comma separated"
                aria-label="Your tags"
              />
              {/* Batch and build came with the clip — shown so the edit box
                  never reads as the whole tag set. */}
              {systemTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-xxs pt-xxs">
                  <span className="font-body text-2xs" style={{ color: 'var(--text-tertiary)' }}>
                    Assigned at upload
                  </span>
                  {systemTags.map((t) => (
                    <SystemTag key={`sys-edit-${t.facet}-${t.label}`} tag={t} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-xs">
              <Button variant="outline" size="md" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" leftIcon={<CheckIcon size={16} />} onClick={saveEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center flex-1 min-w-0 gap-m p-m">
            {/* Title + meta + status */}
            <div className="flex flex-col flex-1 min-w-0 gap-xxs">
              <div className="flex items-center gap-s min-w-0">
                <span
                  className="font-display text-s font-semibold truncate min-w-0"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </span>
                <StatusBadge status={status} />
                {source && <LibrarySourceBadge source={source} variant="inline" className="shrink-0" />}
              </div>
              <span className="flex items-center gap-xxs font-body text-xs" style={{ color: 'var(--text-placeholder)' }}>
                {uploadedBy && (
                  <>
                    <UserAvatar name={uploadedBy} isYou={uploadedByYou} size={14} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {uploadedByYou ? 'You' : uploadedBy}
                    </span>
                    <span aria-hidden>·</span>
                  </>
                )}
                {metaLine}
              </span>
              {isFailed && errorMessage && (
                <span className="font-body text-2xs truncate" style={{ color: 'var(--error)' }}>
                  {errorMessage}
                </span>
              )}
            </div>

            {/* Tags — system (outlined, facet-prefixed) lead, then the user's own */}
            {libraryTags.length > 0 && (
              <div className="hidden lg:flex items-center gap-xxs shrink-0 max-w-[300px] flex-wrap justify-end">
                {systemTags.slice(0, 2).map((t) => (
                  <SystemTag key={`sys-${t.facet}-${t.label}`} tag={t} />
                ))}
                {userLabels.slice(0, 2).map((t) => (
                  <EventTag key={`up-${t}`} label={t} />
                ))}
                {libraryTags.length > 4 && (
                  <span className="font-body text-2xs" style={{ color: 'var(--text-tertiary)' }}>
                    +{libraryTags.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-xs shrink-0">
              {isFailed && (
                <Button variant="outline" size="md" onClick={onRetry}>
                  Retry
                </Button>
              )}
              {showRowActions && isReady && (
                <Button variant="transparent" size="md" iconOnly onClick={startEdit} aria-label="Edit details">
                  <EditIcon size={16} />
                </Button>
              )}
              {showRowActions && !isUploading && (
                <Button variant="transparent" size="md" iconOnly onClick={onDelete} aria-label="Delete video">
                  <TrashIcon size={16} />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={['video-lib-card group/lib flex flex-col rounded-xl overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
      data-selected={String(selected)}
    >
      {/* ── Media ── */}
      <div
        className="relative aspect-video w-full shrink-0 overflow-hidden cursor-pointer"
        onClick={onOpen}
        title={isReady ? undefined : 'Available once the upload finishes'}
      >
        {/* base layer */}
        {thumbnailSrc ? (
          <img src={thumbnailSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: gradient }} />
        )}
        {/* dot texture for depth */}
        <div className="absolute inset-0 video-lib-thumb-texture" aria-hidden />
        {/* dim scrim for non-ready so it reads as "not yet usable" */}
        {!isReady && <div className="absolute inset-0 video-lib-dim" aria-hidden />}
        {/* bottom gradient for badge/duration legibility */}
        <div className="absolute inset-x-0 bottom-0 h-16 video-lib-scrim pointer-events-none" aria-hidden />

        {/* center play affordance — ready only */}
        {isReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="video-lib-play text-white">
              <PlayGlyph />
            </span>
          </div>
        )}

        {/* select checkbox — on hover / when selected / while selecting, or always for pickers */}
        <div
          className="video-lib-check absolute top-s left-s"
          data-visibility={checkboxVisibility}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="video-lib-check-bg">
            <Checkbox checked={selected} onChange={() => onToggleSelect?.()} aria-label={`Select ${title}`} />
          </span>
        </div>

        {/* status badge — top-right. Renders nothing at rest: only uploading
            and failed have anything to say. */}
        <div className="absolute top-s right-s">
          <StatusBadge status={status} />
        </div>

        {/* source — bottom-left, over the scrim; duration takes the right corner.
            Not top-left: the checkbox owns that corner while selecting. */}
        {source && !isUploading && (
          <LibrarySourceBadge source={source} variant="overlay" className="absolute bottom-s left-s z-[2]" />
        )}

        {/* duration — bottom-right, only meaningful when ready */}
        {isReady && durationLabel && (
          <span className="video-lib-duration absolute bottom-s right-s px-xs py-xxxs rounded-xs font-display text-2xs font-semibold text-white">
            {durationLabel}
          </span>
        )}

        {/* uploading progress overlay */}
        {isUploading && (
          <div className="absolute inset-x-m bottom-s flex items-center gap-s">
            <div className="flex-1">
              <ProgressBar value={progress} />
            </div>
            <span className="font-display text-2xs font-semibold text-white tabular-nums">{progress}%</span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      {editing ? (
        <div className="flex flex-col gap-s p-m">
          <div className="flex flex-col gap-xxs">
            <label className="font-display text-2xs font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--text-tertiary)' }}>
              Title
            </label>
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Video title"
              aria-label="Video title"
            />
          </div>
          <div className="flex flex-col gap-xxs">
            <label className="font-display text-2xs font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--text-tertiary)' }}>
              Your tags
            </label>
            <Input
              value={draftTags}
              onChange={(e) => setDraftTags(e.target.value)}
              placeholder="Tags, comma separated"
              aria-label="Your tags"
            />
            {/* Batch and build came with the clip — shown so the edit box
                never reads as the whole tag set. */}
            {systemTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-xxs pt-xxs">
                <span className="font-body text-2xs" style={{ color: 'var(--text-tertiary)' }}>
                  Assigned at upload
                </span>
                {systemTags.map((t) => (
                  <SystemTag key={`sys-edit-${t.facet}-${t.label}`} tag={t} />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-xs">
            <Button variant="outline" size="md" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" leftIcon={<CheckIcon size={16} />} onClick={saveEdit}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-xxs p-m min-w-0">
          <div className="flex items-start gap-xs min-w-0">
            <span
              className="flex-1 min-w-0 font-display text-s font-semibold line-clamp-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </span>
            {/* edit / delete — quiet, hover-revealed, and off the thumbnail so they
                never compete with the play affordance, the badge or the checkbox */}
            {showRowActions && !isUploading && (
              <div
                className="video-lib-row-actions flex items-center gap-xxxs shrink-0 -mt-xxxs -mr-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {isReady && (
                  <Button variant="transparent" size="md" iconOnly onClick={startEdit} aria-label={`Edit ${title}`}>
                    <EditIcon size={16} />
                  </Button>
                )}
                <Button variant="transparent" size="md" iconOnly onClick={onDelete} aria-label={`Delete ${title}`}>
                  <span className="inline-flex video-lib-danger"><TrashIcon size={16} /></span>
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-xxs min-w-0">
            {uploadedBy && (
              <>
                <UserAvatar name={uploadedBy} isYou={uploadedByYou} size={16} />
                <span
                  className="font-body text-xs truncate min-w-0"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {uploadedByYou ? 'You' : uploadedBy}
                </span>
                <span style={{ color: 'var(--text-placeholder)' }} aria-hidden>
                  ·
                </span>
              </>
            )}
            <span className="font-body text-xs shrink-0" style={{ color: 'var(--text-placeholder)' }}>
              {metaLine}
            </span>
          </div>

          {/* Tags — the only labels on the card. System tags (batch/stage/test)
              take their own line above
              the user's, unclamped: there are only ever a couple and they are
              the axis a test picks its footage along. */}
          {(libraryTags.length > 0 || onAddTags) && (
            <div className="flex flex-col gap-xxs pt-xs w-full min-w-0">
              {systemTags.length > 0 && (
                <div className="flex flex-wrap gap-xxs w-full min-w-0">
                  {systemTags.map((t) => (
                    <SystemTag key={`sys-${t.facet}-${t.label}`} tag={t} className="!rounded-[6px]" />
                  ))}
                </div>
              )}
              {userLabels.length > 0 ? (
                <ClampTags
                  items={userLabels}
                  maxRows={2}
                  renderItem={(t) => <EventTag key={`up-${t}`} label={t} className="!rounded-[6px]" />}
                />
              ) : (
                onAddTags && (
                  <div className="flex flex-wrap gap-xxs w-full min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        /* The card body opens the player; this must not. */
                        e.stopPropagation()
                        onAddTags()
                      }}
                      className="video-lib-add-tags inline-flex items-center gap-xxxs px-s py-[3px] rounded-[6px] font-body text-2xs font-medium tracking-[0.2px] leading-[16px] whitespace-nowrap"
                      aria-label={`Add tags to ${title}`}
                    >
                      <PlusIcon size={12} />
                      Add tags
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* failed error + retry */}
          {isFailed && (
            <div className="flex flex-col gap-s pt-xs">
              {errorMessage && (
                <p className="font-body text-xs leading-[1.5]" style={{ color: 'var(--error)' }}>
                  {errorMessage}
                </p>
              )}
              <Button variant="outline" size="md" className="self-start" onClick={onRetry}>
                Retry
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
