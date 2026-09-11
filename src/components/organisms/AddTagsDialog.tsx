/**
 * AddTagsDialog — bulk-tag a selection of Gameplay Library videos.
 *
 * Tagging is how a batch becomes findable later ("ut-batch-3"), and clips
 * arrive untagged from the Recorder app and the CLI, so tagging after the fact
 * has to be as cheap as tagging at upload. Two ways in:
 *   - type a new tag (Enter / comma commits it)
 *   - pick one already used in the library, so the vocabulary stays flat
 *     instead of sprouting near-duplicates
 *
 * Tags are ADDED to whatever each video already carries — this never replaces
 * a video's existing tags.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useEffect, useState, type KeyboardEvent } from 'react'
import Button from '../ui/Button'
import { FilterTag } from '../atoms/FilterTag'
import { CloseIcon } from '../icons/CloseIcon'

export interface AddTagsDialogProps {
  isOpen: boolean
  onClose: () => void
  /** How many videos the tags will be applied to */
  count: number
  /** Tags already used anywhere in the library, offered as quick picks */
  suggestions?: string[]
  onConfirm: (tags: string[]) => void
}

export function AddTagsDialog({ isOpen, onClose, count, suggestions = [], onConfirm }: AddTagsDialogProps) {
  const [tags, setTags] = useState<string[]>([])
  const [draft, setDraft] = useState('')

  // Fresh draft each time the dialog opens.
  useEffect(() => {
    if (!isOpen) return
    setTags([])
    setDraft('')
  }, [isOpen])

  if (!isOpen) return null

  const has = (t: string) => tags.some((x) => x.toLowerCase() === t.toLowerCase())

  const commit = (raw: string) => {
    const t = raw.trim().replace(/,$/, '').trim()
    if (!t || has(t)) {
      setDraft('')
      return
    }
    setTags((prev) => [...prev, t])
    setDraft('')
  }
  const toggle = (t: string) =>
    setTags((prev) => (has(t) ? prev.filter((x) => x.toLowerCase() !== t.toLowerCase()) : [...prev, t]))
  const remove = (t: string) => setTags((prev) => prev.filter((x) => x !== t))

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const finalTags = draft.trim() && !has(draft.trim()) ? [...tags, draft.trim()] : tags

  const apply = () => {
    if (!finalTags.length) return
    onConfirm(finalTags)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-l"
      role="dialog"
      aria-modal="true"
      aria-label="Add tags"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div className="relative flex flex-col gap-m bg-bg-elements rounded-m shadow-normal p-l w-[480px] max-w-full max-h-[82vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-s w-full shrink-0">
          <div className="flex flex-col gap-xxs flex-1 min-w-0">
            <h2 className="font-display text-l font-bold" style={{ color: 'var(--text-primary)' }}>
              Add tags to {count} {count === 1 ? 'video' : 'videos'}
            </h2>
            <p className="font-body text-s" style={{ color: 'var(--text-secondary)' }}>
              Tags are added to what each video already has — nothing is replaced.
            </p>
          </div>
          <Button variant="transparent" size="md" iconOnly onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </Button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-m flex-1 min-h-0 overflow-y-auto flyout-scrollbar">
          {/* Tag input */}
          <div className="flex flex-col gap-xs">
            <span
              className="font-display text-xs font-semibold uppercase tracking-[0.1em]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              New tags
            </span>
            <div
              className="flex items-center gap-xxs flex-wrap p-xs rounded-lg cursor-text"
              style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-default)' }}
              onClick={() => document.getElementById('bulk-tag-input')?.focus()}
            >
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-xxs pl-s pr-xs py-xxxs rounded-round font-body text-xs"
                  style={{ backgroundColor: 'var(--bg-tint-light)', color: 'var(--brand)' }}
                >
                  {t}
                  <button type="button" onClick={() => remove(t)} aria-label={`Remove tag ${t}`} className="inline-flex">
                    <CloseIcon size={12} />
                  </button>
                </span>
              ))}
              <input
                id="bulk-tag-input"
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKey}
                onBlur={() => commit(draft)}
                placeholder={tags.length ? 'Add another…' : 'e.g. ut-batch-3'}
                className="flex-1 min-w-[140px] bg-transparent outline-none font-body text-s py-xxs"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
            <span className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Press Enter or comma to add.
            </span>
          </div>

          {/* Existing vocabulary */}
          {suggestions.length > 0 && (
            <div className="flex flex-col gap-xs">
              <span
                className="font-display text-xs font-semibold uppercase tracking-[0.1em]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Already in your library
              </span>
              <div className="flex items-center gap-xs flex-wrap">
                {suggestions.map((t) => (
                  <FilterTag key={t} label={t} selected={has(t)} onClick={() => toggle(t)} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-xs shrink-0 pt-xxs">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" disabled={!finalTags.length} onClick={apply}>
            Add {finalTags.length || ''} {finalTags.length === 1 ? 'tag' : 'tags'}
          </Button>
        </div>
      </div>
    </div>
  )
}
