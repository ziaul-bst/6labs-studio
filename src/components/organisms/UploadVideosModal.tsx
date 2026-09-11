/**
 * UploadVideosModal — upload entry point for the Library. Two paths:
 *
 *  1. "Upload files" — drag/browse a batch of clips and attach tags that apply
 *     to EVERY video in the batch (the common case: drop 20 clips, tag them all
 *     "tutorial" in one go). Files are validated + staged before commit.
 *
 *  2. "Bulk via CLI" — for large libraries, copyable 6labs CLI commands that
 *     push clips straight from the dev's machine (mirrors the nowStudio CLI).
 *     The batch tags entered on the Files tab flow into the example command.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'
import Button from '../ui/Button'
import { showToast } from '../atoms/Toast'
import { CloseIcon } from '../icons/CloseIcon'
import { CopyIcon } from '../icons/CopyIcon'
import { CheckIcon } from '../icons/CheckIcon'
import { UploadIcon } from '../icons/UploadIcon'
import { SegmentedControl } from '../atoms/SegmentedControl'
import { ACTIVE_GAME } from '../../lib/activeGame'

// ── Shared upload constants/helpers (imported by VideoLibraryView too) ──
export const MAX_BYTES = 500 * 1024 * 1024 // 500MB
export const VIDEO_EXT = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v']
export const ACCEPT = 'video/*,.mp4,.mov,.webm,.avi,.mkv,.m4v'

export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(0)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}
export function isVideoFile(f: File): boolean {
  if (f.type.startsWith('video/')) return true
  const lower = f.name.toLowerCase()
  return VIDEO_EXT.some((ext) => lower.endsWith(ext))
}

interface Rejection {
  name: string
  reason: string
}

export interface UploadVideosModalProps {
  isOpen: boolean
  onClose: () => void
  /** Files handed in from a page-level drop — staged automatically on open */
  initialFiles?: File[]
  /** Lowercased titles already in the library, for duplicate detection */
  existingNames?: Set<string>
  /** Commit staged files + batch tags to the library */
  onConfirm: (files: File[], tags: string[]) => void
  /** Demo: simulate a CLI batch import of N clips with the given tags */
  onSimulateImport?: (count: number, tags: string[]) => void
  /** The game this workspace uploads to — both halves reach the CLI command. */
  gameName?: string
  appId?: string
}

type Tab = 'files' | 'cli'

export function UploadVideosModal({
  isOpen,
  onClose,
  initialFiles,
  existingNames,
  onConfirm,
  onSimulateImport,
  gameName = ACTIVE_GAME.name,
  appId = ACTIVE_GAME.appId,
}: UploadVideosModalProps) {
  const [tab, setTab] = useState<Tab>('files')
  const [staged, setStaged] = useState<File[]>([])
  const [rejected, setRejected] = useState<Rejection[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Validate + add files to the staging list (dedupe against library + staged)
  const stageFiles = (files: File[], base: File[] = staged): { next: File[]; rejects: Rejection[] } => {
    const rejects: Rejection[] = []
    const seen = new Set<string>([
      ...(existingNames ? [...existingNames] : []),
      ...base.map((f) => f.name.toLowerCase()),
    ])
    const next = [...base]
    for (const f of files) {
      if (!isVideoFile(f)) {
        rejects.push({ name: f.name, reason: 'Not a video file' })
        continue
      }
      if (f.size > MAX_BYTES) {
        rejects.push({ name: f.name, reason: `Exceeds 500 MB (${formatSize(f.size)})` })
        continue
      }
      if (seen.has(f.name.toLowerCase())) {
        rejects.push({ name: f.name, reason: 'Already added' })
        continue
      }
      seen.add(f.name.toLowerCase())
      next.push(f)
    }
    return { next, rejects }
  }

  // Reset + auto-stage when opened
  useEffect(() => {
    if (!isOpen) return
    setTab('files')
    setTags([])
    setTagDraft('')
    setDragOver(false)
    if (initialFiles?.length) {
      const { next, rejects } = stageFiles(initialFiles, [])
      setStaged(next)
      setRejected(rejects)
    } else {
      setStaged([])
      setRejected([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialFiles])

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const addFiles = (files: File[]) => {
    const { next, rejects } = stageFiles(files)
    setStaged(next)
    setRejected(rejects)
  }
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(Array.from(e.target.files))
    e.target.value = ''
  }
  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) addFiles(Array.from(e.dataTransfer.files))
  }
  const removeStaged = (idx: number) => setStaged((prev) => prev.filter((_, i) => i !== idx))

  // Tags
  const commitTag = (raw: string) => {
    const t = raw.trim().replace(/,$/, '').trim()
    if (!t) return
    setTags((prev) => (prev.some((x) => x.toLowerCase() === t.toLowerCase()) ? prev : [...prev, t]))
    setTagDraft('')
  }
  const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTag(tagDraft)
    } else if (e.key === 'Backspace' && !tagDraft && tags.length) {
      setTags((prev) => prev.slice(0, -1))
    }
  }
  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t))

  const confirmUpload = () => {
    if (!staged.length) return
    // fold any half-typed tag in
    const finalTags = tagDraft.trim() ? [...tags, tagDraft.trim()] : tags
    onConfirm(staged, finalTags)
    onClose()
  }

  const cliTags = (tags.length ? tags : ['tutorial', 'onboarding']).join(',')
  /* --game-name over --game: the flag now sits beside --app-id, and "game"
     alone read as though either value would do. Both are printed — the name
     is how a person checks the command is aimed at the right title, the id is
     what the server actually matches on. */
  const uploadCmd = `6labs videos upload ./gameplay/*.mp4 \\
  --tags "${cliTags}" \\
  --game-name "${gameName}" \\
  --app-id "${appId}" \\
  --concurrency 4`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-l" role="dialog" aria-modal="true" aria-label="Upload videos">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div className="relative flex flex-col gap-m bg-bg-elements rounded-m shadow-normal p-l w-[600px] max-w-full max-h-[82vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-s w-full shrink-0">
          <div className="flex flex-col gap-xxs flex-1 min-w-0">
            <h2 className="font-display text-l font-bold" style={{ color: 'var(--text-primary)' }}>
              Upload videos
            </h2>
            <p className="font-body text-s" style={{ color: 'var(--text-secondary)' }}>
              Add gameplay clips for your agents to reference. Tag them so they’re easy to find later.
            </p>
          </div>
          <Button variant="transparent" size="md" iconOnly onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </Button>
        </div>

        <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={handleInput} />

        {/* Tabs */}
        {/* The shared control, not a pair of Buttons: these are two states of
            one choice, and a filled button reads as an action to take. */}
        <SegmentedControl<'files' | 'cli'>
          className="shrink-0"
          ariaLabel="Upload method"
          size="sm"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'files', label: 'Upload files' },
            { value: 'cli', label: 'Bulk via CLI' },
          ]}
        />

        {/* Body */}
        <div className="flex flex-col gap-m flex-1 min-h-0 overflow-y-auto">
          {tab === 'files' ? (
            <>
              {/* Dropzone */}
              <div
                className={[
                  'flex flex-col items-center gap-s p-xl rounded-2xl cursor-pointer transition-colors duration-150 shrink-0',
                  dragOver ? 'context-uploader-dragover' : 'context-uploader',
                ].join(' ')}
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <span style={{ color: 'var(--brand)' }}>
                  <UploadIcon size={24} />
                </span>
                <div className="flex flex-col items-center gap-xxs">
                  <p className="font-display text-s font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Drop videos here or click to browse
                  </p>
                  <p className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    MP4, MOV, WEBM, AVI, MKV · max 500 MB each · select many at once
                  </p>
                </div>
              </div>

              {/* Staged list */}
              {staged.length > 0 && (
                <div className="flex flex-col gap-xs shrink-0">
                  <span className="font-display text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>
                    {staged.length} video{staged.length > 1 ? 's' : ''} ready to upload
                  </span>
                  <div className="flex flex-col gap-xxs max-h-[160px] overflow-y-auto pr-xxs">
                    {staged.map((f, i) => (
                      <div
                        key={`${f.name}-${i}`}
                        className="flex items-center gap-s px-s py-xs rounded-lg"
                        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                      >
                        <span className="shrink-0" style={{ color: 'var(--brand)' }}>
                          <UploadIcon size={16} />
                        </span>
                        <span className="flex-1 min-w-0 truncate font-body text-s" style={{ color: 'var(--text-primary)' }}>
                          {f.name}
                        </span>
                        <span className="shrink-0 font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {f.size ? formatSize(f.size) : '—'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeStaged(i)}
                          className="shrink-0 inline-flex items-center justify-center"
                          style={{ color: 'var(--text-tertiary)' }}
                          aria-label={`Remove ${f.name}`}
                        >
                          <CloseIcon size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Batch tags */}
              <div className="flex flex-col gap-xs shrink-0">
                <span className="font-display text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>
                  Tags for {staged.length > 0 ? `all ${staged.length}` : 'all'} video{staged.length === 1 ? '' : 's'}
                </span>
                <div
                  className="flex items-center gap-xxs flex-wrap p-xs rounded-lg cursor-text"
                  style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-default)' }}
                  onClick={() => document.getElementById('batch-tag-input')?.focus()}
                >
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-xxs pl-s pr-xs py-xxxs rounded-round font-body text-xs"
                      style={{ backgroundColor: 'var(--bg-tint-light)', color: 'var(--brand)' }}
                    >
                      {t}
                      <button type="button" onClick={() => removeTag(t)} aria-label={`Remove tag ${t}`} className="inline-flex">
                        <CloseIcon size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    id="batch-tag-input"
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={handleTagKey}
                    onBlur={() => commitTag(tagDraft)}
                    placeholder={tags.length ? 'Add another…' : 'e.g. tutorial, boss-fight'}
                    className="flex-1 min-w-[120px] bg-transparent outline-none font-body text-s py-xxs"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
                <span className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Press Enter or comma to add. Tags apply to every video in this upload.
                </span>
              </div>

              {/* Rejections */}
              {rejected.length > 0 && (
                <div
                  className="flex flex-col gap-xxs p-s rounded-lg shrink-0"
                  style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)' }}
                >
                  <span className="font-display text-xs font-semibold" style={{ color: 'var(--error)' }}>
                    {rejected.length} skipped
                  </span>
                  {rejected.map((r) => (
                    <span key={r.name} className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-semibold">{r.name}</span> — {r.reason}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <CliTab uploadCmd={uploadCmd} hasTags={tags.length > 0} cliTags={cliTags} onSimulate={() => { onSimulateImport?.(6, tags.length ? tags : ['cli-import']); onClose() }} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-xs shrink-0 pt-xxs">
          <Button variant="secondary" size="md" onClick={onClose}>
            {tab === 'cli' ? 'Done' : 'Cancel'}
          </Button>
          {tab === 'files' && (
            <Button variant="primary" size="md" leftIcon={<UploadIcon size={16} />} disabled={!staged.length} onClick={confirmUpload}>
              Upload {staged.length || ''} {staged.length === 1 ? 'video' : 'videos'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CLI tab ──────────────────────────────────────────────────────────────────

function CliTab({
  uploadCmd,
  hasTags,
  cliTags,
  onSimulate,
}: {
  uploadCmd: string
  hasTags: boolean
  cliTags: string
  onSimulate: () => void
}) {
  return (
    <div className="flex flex-col gap-m">
      <p className="font-body text-s leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>
        Uploading hundreds of clips? Push them straight from your machine with the 6labs CLI — it runs in the
        background, retries on failure, and resumes interrupted uploads.
      </p>

      <CodeBlock label="1 · Install" code="npm install -g @6labs/cli" />
      <CodeBlock label="2 · Authenticate" code={`6labs login`} sublabel="Opens your browser to authorize this machine." />
      <CodeBlock
        label="3 · Upload a folder"
        code={uploadCmd}
        sublabel={hasTags ? `Using the tags you set: ${cliTags}` : undefined}
      />

      <div
        className="flex items-start gap-s p-s rounded-lg"
        style={{ backgroundColor: 'var(--bg-tint-light)', border: '1px solid var(--bg-tint)' }}
      >
        <span className="font-body text-xs leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>
          Globs like <code className="font-mono">./gameplay/**/*.mp4</code> upload nested folders.
          <code className="font-mono"> --concurrency</code> controls parallel uploads. Clips appear in the library
          as each one finishes.
        </span>
      </div>

      {/* Prototype affordance — show the batch result without a real CLI */}
      <button
        type="button"
        onClick={onSimulate}
        className="self-start font-body text-xs font-semibold underline underline-offset-2"
        style={{ color: 'var(--brand)' }}
      >
        Simulate a CLI import (demo)
      </button>
    </div>
  )
}

// ─── Copy affordance ─────────────────────────────────────────────────────────

/**
 * Clipboard with the textarea fallback — `navigator.clipboard` is refused in
 * sandboxed frames (Storybook, embedded previews), and a copy button that
 * silently does nothing is worse than none.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

function CopyLink({ text, toast }: { text: string; toast: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!(await copyToClipboard(text))) return
    setCopied(true)
    showToast(toast)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={toast.replace(/ copied$/, ' — copy')}
      className="inline-flex items-center gap-xxs shrink-0 font-body text-xs font-medium"
      style={{ color: copied ? 'var(--success)' : 'var(--brand)' }}
    >
      {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ─── Copyable code block ────────────────────────────────────────────────────────

function CodeBlock({ label, sublabel, code }: { label: string; sublabel?: string; code: string }) {
  return (
    <div className="flex flex-col gap-xxs">
      <div className="flex items-center justify-between gap-m">
        <label className="font-display text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </label>
        <CopyLink text={code} toast={`${label.replace(/^\d+\s·\s/, '')} copied`} />
      </div>
      {sublabel && (
        <span className="font-body text-xs leading-[1.5]" style={{ color: 'var(--text-tertiary)' }}>
          {sublabel}
        </span>
      )}
      <pre
        className="w-full min-w-0 overflow-x-auto p-m rounded-lg font-mono text-xs leading-[1.6] whitespace-pre"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
      >
        {code}
      </pre>
    </div>
  )
}
