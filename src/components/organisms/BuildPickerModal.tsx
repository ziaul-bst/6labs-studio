/**
 * BuildPickerModal — choose the build the AI players will run, or upload one.
 *
 * Picking a build is the same kind of act as picking recordings for a human
 * test, so it gets the same kind of surface: its own dialog, an upload zone
 * on top, and the list of what has already been uploaded underneath — not a
 * dropdown with an "upload…" row hidden at the bottom. Every state a build
 * passes through is visible in its row: uploading (progress), verifying
 * (spinner), ready (selectable, newest marked), failed (why, retry, remove).
 * Only a verified build can be chosen, and the footer says which one will be
 * used before the reader commits.
 *
 * `BuildField` is the composer-side trigger: a field that shows the chosen
 * build and opens this dialog.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { ProgressBar } from '../atoms/ProgressBar'
import { SetupZone } from '../molecules/TestingSetupPieces'
import { CloseIcon } from '../icons/CloseIcon'
import { UploadIcon } from '../icons/UploadIcon'
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'
import { CheckIcon } from '../icons/CheckIcon'
import { SearchIcon } from '../icons/SearchIcon'
import {
  removeBuild,
  retryUpload,
  startUpload,
  useBuilds,
  verifiedVersionOf,
  type BuildFile,
} from '../../lib/buildsDemoState'

export interface BuildPickerModalProps {
  isOpen: boolean
  /** Version currently chosen on the composer, if any. */
  value: string | null
  onClose: () => void
  onPick: (version: string) => void
  className?: string
}

export function BuildPickerModal({ isOpen, value, onClose, onPick, className }: BuildPickerModalProps) {
  const builds = useBuilds()
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  /* Land on what the composer already has, else the newest verified build. */
  useEffect(() => {
    if (!isOpen) return
    const current = builds.find((b) => verifiedVersionOf(b) === value && b.status === 'ready')
    const newest = builds.find((b) => b.status === 'ready' && b.newest) ?? builds.find((b) => b.status === 'ready')
    setSelected(current?.id ?? newest?.id ?? null)
    setQuery('')
    dialogRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  /* A build that just verified while the dialog is open becomes selectable; a
     selection that got removed or failed is dropped. */
  useEffect(() => {
    if (!selected) return
    const b = builds.find((x) => x.id === selected)
    if (!b || b.status !== 'ready') setSelected(null)
  }, [builds, selected])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const chosen = builds.find((b) => b.id === selected && b.status === 'ready') ?? null
  const ready = builds.filter((b) => b.status === 'ready').length
  const inFlight = builds.filter((b) => b.status === 'uploading' || b.status === 'verifying').length
  /* Past a handful the list scrolls inside the dialog and takes a search, so
     a studio with a build a day can still find last month's in two keystrokes. */
  const searchable = builds.length > SEARCH_FROM
  const q = query.trim().toLowerCase()
  const listed = q
    ? builds.filter((b) => `${verifiedVersionOf(b)} ${b.fileName} ${b.uploadedLabel}`.toLowerCase().includes(q))
    : builds

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
        aria-label="Select a build"
        onClick={(e) => e.stopPropagation()}
        className={['flex flex-col w-full max-w-[760px] max-h-[calc(100vh-48px)] rounded-4xl overflow-hidden shadow-big', className]
          .filter(Boolean)
          .join(' ')}
        style={{ backgroundColor: 'var(--bg-elements)' }}
      >
        <div className="flex items-start justify-between gap-m px-xl pt-l pb-m">
          <div className="flex flex-col gap-xxs min-w-0">
            <h2 className="font-display text-l font-semibold text-text-primary leading-[1.3] m-0">Select a build</h2>
            <p className="font-body text-s text-text-secondary leading-[1.55] m-0">
              Upload an APK or IPA, or pick one you uploaded before. 6labs verifies every build before the players can run it.
            </p>
          </div>
          <Button variant="transparent" size="md" iconOnly onClick={onClose} aria-label="Close">
            <CloseIcon size={16} />
          </Button>
        </div>

        <div className="flex flex-col gap-l px-xl pb-l overflow-y-auto min-h-0">
          <SetupZone
            filled={false}
            icon={<UploadIcon size={20} />}
            title={builds.length === 0 ? 'Upload your first build' : 'Drop a build here or click to upload'}
            description="A release build of the game the AI players will install and play."
            formats="APK · IPA · up to 500 MB"
            accent="success"
            onClick={() => startUpload('ok')}
          />

          <div className="flex flex-col w-full rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-xs px-l py-s min-h-[56px]" style={{ backgroundColor: 'var(--bg-page-pale)' }}>
              <span className="font-display text-s font-semibold text-text-primary leading-[1.5]">Uploaded builds</span>
              <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                {builds.length === 0
                  ? 'none yet'
                  : q
                    ? `${listed.length} of ${builds.length} match`
                    : `${ready} verified${inFlight ? ` · ${inFlight} in progress` : ''}`}
              </span>
              {searchable && (
                <>
                  <span className="flex-1" />
                  <div className="library-search shrink-0 w-[240px]">
                    <Input
                      size="md"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search builds"
                      aria-label="Search builds"
                      leftIcon={<SearchIcon size={16} />}
                    />
                  </div>
                </>
              )}
            </div>
            {builds.length > 0 && listed.length === 0 ? (
              <p className="font-body text-s text-text-tertiary leading-[1.6] px-l py-l m-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                No build matches “{query.trim()}”.
              </p>
            ) : builds.length === 0 ? (
              <p className="font-body text-s text-text-tertiary leading-[1.6] px-l py-l m-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                Nothing here yet. Drop an APK or IPA above — it uploads, gets verified, and appears here ready to run.
              </p>
            ) : (
              <div role="radiogroup" aria-label="Uploaded builds" className="flex flex-col overflow-y-auto max-h-[352px]">
                {listed.map((b, i) => (
                  <BuildRow
                    key={b.id}
                    build={b}
                    selected={b.id === selected}
                    first={i === 0}
                    onSelect={() => b.status === 'ready' && setSelected(b.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-s px-xl py-m"
          style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page-pale)' }}
        >
          <span className="font-body text-s text-text-tertiary leading-[1.5]">
            {chosen
              ? `The players will install ${verifiedVersionOf(chosen)}.`
              : ready === 0
                ? 'Upload and verify a build to continue.'
                : 'Pick a verified build.'}
          </span>
          <span className="flex-1" />
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={!chosen}
            onClick={() => {
              if (!chosen) return
              onPick(verifiedVersionOf(chosen))
              onClose()
            }}
          >
            {chosen ? `Use ${verifiedVersionOf(chosen)}` : 'Use build'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Builds beyond this many get a search and a scrolling list. */
const SEARCH_FROM = 6

/* ── Row ────────────────────────────────────────────────────────────────── */

const ROW_GRID = '24px 44px minmax(0, 1fr) 200px 24px'

function BuildRow({ build, selected, first, onSelect }: { build: BuildFile; selected: boolean; first: boolean; onSelect: () => void }) {
  const selectable = build.status === 'ready'
  const version = verifiedVersionOf(build)
  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-disabled={!selectable || undefined}
      tabIndex={selectable ? 0 : -1}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (selectable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect()
        }
      }}
      className={['grid items-center gap-m px-l py-s', selectable ? 'run-history-row cursor-pointer' : ''].join(' ')}
      style={{
        gridTemplateColumns: ROW_GRID,
        borderTop: first ? '1px solid var(--border-subtle)' : '1px solid var(--border-subtle)',
        backgroundColor: selected ? 'var(--bg-tint-light)' : undefined,
      }}
    >
      {/* Radio */}
      <span
        className="flex items-center justify-center w-[18px] h-[18px] rounded-round"
        style={{
          border: `${selected ? 5 : 1.5}px solid ${selected ? 'var(--brand)' : selectable ? 'var(--border-default)' : 'var(--border-subtle)'}`,
          backgroundColor: 'var(--bg-elements)',
          opacity: selectable ? 1 : 0.5,
        }}
        aria-hidden
      />

      {/* Platform tile */}
      <span
        className="flex items-center justify-center w-[44px] h-[44px] rounded-l font-code text-2xs font-semibold"
        style={
          build.status === 'failed'
            ? { backgroundColor: 'var(--error-bg)', color: 'var(--error)' }
            : build.status === 'ready'
              ? { backgroundColor: 'var(--success-bg)', color: 'var(--success)' }
              : { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }
        }
        aria-hidden
      >
        {build.platform}
      </span>

      <span className="flex flex-col gap-xxxs min-w-0">
        <span className="flex items-center gap-xs min-w-0">
          <span className={['font-display text-s font-semibold leading-[1.45] truncate', selectable ? 'text-text-primary' : 'text-text-secondary'].join(' ')}>
            {build.status === 'ready' ? version : build.fileName}
          </span>
          {build.newest && build.status === 'ready' && (
            <span className="inline-flex items-center px-xs py-xxxs rounded-xs font-display text-2xs font-semibold uppercase tracking-[0.08em]" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              newest
            </span>
          )}
        </span>
        <span className="font-body text-xs text-text-tertiary leading-[1.5] truncate">
          {build.status === 'ready' ? `${build.fileName} · ${build.sizeLabel} · ${build.uploadedLabel}` : build.sizeLabel}
        </span>
      </span>

      <StatusCell build={build} />

      <span className="flex items-center justify-end text-text-tertiary" aria-hidden>
        {selected && <CheckIcon size={16} />}
      </span>
    </div>
  )
}

function StatusCell({ build }: { build: BuildFile }) {
  switch (build.status) {
    case 'uploading':
      return (
        <span className="flex items-center gap-s min-w-0">
          <ProgressBar value={build.progress ?? 0} className="flex-1" />
          <span className="font-code text-xs text-text-secondary whitespace-nowrap w-[36px] text-right">{build.progress ?? 0}%</span>
        </span>
      )
    case 'verifying':
      return (
        <span className="inline-flex items-center gap-xs font-body text-xs text-text-secondary whitespace-nowrap">
          <span className="testing-spinner-sm shrink-0" aria-hidden />
          Verifying the package…
        </span>
      )
    case 'failed':
      return (
        <span className="flex flex-col items-start gap-xxs min-w-0">
          <span className="font-body text-xs leading-[1.5]" style={{ color: 'var(--error)' }}>
            {build.error ?? 'Could not be verified.'}
          </span>
          <span className="flex items-center gap-xs">
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); retryUpload(build.id) }}>
              Retry
            </Button>
            <Button variant="transparent" size="sm" onClick={(e) => { e.stopPropagation(); removeBuild(build.id) }}>
              Remove
            </Button>
          </span>
        </span>
      )
    default:
      return <span className="font-body text-xs text-text-tertiary whitespace-nowrap">Verified · ready to run</span>
  }
}

/* ── Composer field ─────────────────────────────────────────────────────── */

export interface BuildFieldProps {
  value: string | null
  onChange: (version: string) => void
  placeholder?: string
  ariaLabel?: string
  className?: string
}

/** The Build field on an AI test composer — shows the pick, opens the dialog. */
export function BuildField({ value, onChange, placeholder = 'Choose a build…', ariaLabel = 'Build', className }: BuildFieldProps) {
  const [open, setOpen] = useState(false)
  const builds = useBuilds()
  const chosen = builds.find((b) => b.status === 'ready' && verifiedVersionOf(b) === value)
  const inFlight = builds.filter((b) => b.status === 'uploading' || b.status === 'verifying').length

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={['testing-focus-ring flex items-center gap-s w-full h-[40px] px-s text-left', className].filter(Boolean).join(' ')}
        style={{
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-input)',
          backgroundColor: 'var(--bg-elements)',
        }}
      >
        {value ? (
          <>
            <Badge>{chosen?.platform ?? 'APK'}</Badge>
            <span className="font-display text-s font-semibold text-text-primary leading-[1.5] whitespace-nowrap">{value}</span>
            {chosen && (
              <span className="font-body text-s text-text-tertiary leading-[1.5] truncate min-w-0">
                {chosen.uploadedLabel}
                {chosen.newest ? ' · newest' : ''}
              </span>
            )}
          </>
        ) : (
          <span className="font-body text-s text-text-placeholder leading-[1.5] truncate">{placeholder}</span>
        )}
        <span className="flex-1" />
        {inFlight > 0 && (
          <span className="inline-flex items-center gap-xxs font-body text-xs text-text-tertiary whitespace-nowrap">
            <span className="testing-spinner-sm shrink-0" aria-hidden />
            {inFlight} uploading
          </span>
        )}
        <span className="font-body text-s text-text-brand font-semibold whitespace-nowrap">{value ? 'Change' : 'Select'}</span>
        <DropdownArrowIcon size={16} className="text-text-tertiary shrink-0" />
      </button>
      <BuildPickerModal isOpen={open} value={value} onClose={() => setOpen(false)} onPick={onChange} />
    </>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 px-xs h-[22px] rounded-xs font-code text-2xs font-semibold"
      style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
      aria-hidden
    >
      {children}
    </span>
  )
}
