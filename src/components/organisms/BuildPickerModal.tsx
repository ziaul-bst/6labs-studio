/**
 * BuildPickerModal — choose the build the AI players will run, or upload one.
 *
 * Picking a build is the same kind of act as picking recordings for a human
 * test, so it gets the same kind of surface: its own dialog, an upload zone
 * on top, and the list of what has already been uploaded underneath — not a
 * dropdown with an "upload…" row hidden at the bottom. Every state a build
 * passes through is visible in its row: uploading (progress), ready
 * (selectable, newest marked), failed (why, retry, remove). Only a build that
 * finished uploading can be chosen, and the footer says which one will be used
 * before the reader commits.
 *
 * Picking a file does not start the upload. The upload zone turns into a card
 * asking what the build is — its version, typed in, and its package name, read
 * from the APK and editable — and both are required. A 4 GB upload named after
 * its file would sit in the list as "whiteout-2.3.2-rc1.apk" for minutes, and
 * the package is what the players install, so a wrong one fails the whole run.
 *
 * The card opens in place of the zone, not as a step that replaces the dialog.
 * Swapping the whole dialog read as a second popup, and it hid the list at the
 * one moment it helps — typing a version is easier with the versions already
 * uploaded in view. While the card is open, "Use vX" is off: one live primary
 * at a time, and the card's own Cancel is the way back to picking.
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
import { Spinner } from '../atoms/Spinner'
import { SetupZone } from '../molecules/TestingSetupPieces'
import { CloseIcon } from '../icons/CloseIcon'
import { UploadIcon } from '../icons/UploadIcon'
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'
import { CheckIcon } from '../icons/CheckIcon'
import { SearchIcon } from '../icons/SearchIcon'
import {
  MAX_BUILD_LABEL,
  isValidPackageName,
  normalizeVersion,
  pickBuildFile,
  removeBuild,
  retryUpload,
  startUpload,
  useBuilds,
  versionOf,
  type BuildFile,
  type PickedBuild,
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
  /* Set once a file is picked: the dialog is asking what it is. */
  const [picked, setPicked] = useState<PickedBuild | null>(null)
  const [version, setVersion] = useState('')
  const [packageName, setPackageName] = useState('')
  const [touched, setTouched] = useState({ version: false, packageName: false })
  const dialogRef = useRef<HTMLDivElement>(null)
  const versionRef = useRef<HTMLInputElement>(null)

  /* Land on what the composer already has, else the newest build. */
  useEffect(() => {
    if (!isOpen) return
    const current = builds.find((b) => versionOf(b) === value && b.status === 'ready')
    const newest = builds.find((b) => b.status === 'ready' && b.newest) ?? builds.find((b) => b.status === 'ready')
    setSelected(current?.id ?? newest?.id ?? null)
    setQuery('')
    setPicked(null)
    dialogRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  /* The package is already filled in, so the version is the one field
     waiting on the reader. */
  useEffect(() => {
    if (picked) versionRef.current?.focus()
  }, [picked])

  /* A build that finishes uploading while the dialog is open becomes
     selectable; a selection that got removed or failed is dropped. */
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
  const inFlight = builds.filter((b) => b.status === 'uploading').length
  /* Past a handful the list scrolls inside the dialog and takes a search, so
     a studio with a build a day can still find last month's in two keystrokes. */
  const searchable = builds.length > SEARCH_FROM
  const q = query.trim().toLowerCase()
  const listed = q
    ? builds.filter((b) => `${versionOf(b)} ${b.packageName} ${b.fileName} ${b.uploadedOn ?? ''}`.toLowerCase().includes(q))
    : builds

  /* ── Upload card ── */
  const nextVersion = normalizeVersion(version)
  /* The version is what the composer and every run page name a build by, so
     two builds with one version would be two answers to "which build ran". */
  const versionTaken = nextVersion !== '' && builds.some((b) => b.version.toLowerCase() === nextVersion.toLowerCase())
  const packageValid = isValidPackageName(packageName)
  const versionError = !nextVersion
    ? touched.version
      ? 'Enter the version.'
      : undefined
    : versionTaken
      ? `${nextVersion} is already in your builds.`
      : undefined
  /* Format is checked on blur, not per keystroke — "com.gof." is on its way
     to being right, and flagging it mid-edit is noise. */
  const packageError = !packageName.trim()
    ? touched.packageName
      ? 'Enter the package name.'
      : undefined
    : touched.packageName && !packageValid
      ? 'Use the form com.studio.game.'
      : undefined
  const canUpload = nextVersion !== '' && !versionTaken && packageValid
  /* What still stands between the reader and "Upload build". A taken version
     says nothing here — its field already does. */
  const detailsHint = canUpload
    ? `Uploads as ${nextVersion}.`
    : !nextVersion
      ? 'Add the version to start the upload.'
      : !packageName.trim()
        ? 'Add the package name to start the upload.'
        : !packageValid
          ? 'Check the package name.'
          : ''

  /* The prototype's file picker — the zone becomes the upload card, on the
     picked APK or ZIP with its package name already read out of it. */
  const pickFile = () => {
    const file = pickBuildFile()
    setVersion('')
    setPackageName(file.packageName)
    setTouched({ version: false, packageName: false })
    setPicked(file)
  }
  const upload = () => {
    if (!canUpload) {
      setTouched({ version: true, packageName: true })
      return
    }
    if (!picked) return
    startUpload(picked, { version: nextVersion, packageName: packageName.trim() })
    setQuery('')
    setPicked(null)
  }

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
              Upload an APK or ZIP, or pick one you uploaded before. The AI players install the build you choose.
            </p>
          </div>
          <Button variant="transparent" size="md" iconOnly onClick={onClose} aria-label="Close">
            <CloseIcon size={16} />
          </Button>
        </div>

        <div className="flex flex-col gap-l px-xl pb-l overflow-y-auto min-h-0">
          {picked ? (
            /* The zone, filled: the picked file and what it is. The zone's
               radius and a solid rule, so it reads as the zone having taken
               the file rather than as a new panel. */
            <form
              noValidate
              aria-label="Upload a build"
              onSubmit={(e) => {
                e.preventDefault()
                upload()
              }}
              className="flex flex-col gap-m px-l py-l rounded-3xl shrink-0"
              style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elements)', boxShadow: 'var(--shadow-sm)' }}
            >
              {/* Neutral tile — the one an in-flight row wears, because
                  nothing has uploaded yet. */}
              <div className="flex items-center gap-m min-w-0">
                <span
                  className="flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-l font-code text-2xs font-semibold"
                  style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
                  aria-hidden
                >
                  {picked.format}
                </span>
                <span className="flex flex-col gap-xxxs flex-1 min-w-0">
                  <span className="font-display text-s font-semibold text-text-primary leading-[1.45] truncate">{picked.fileName}</span>
                  <span className="font-body text-xs text-text-tertiary leading-[1.5]">{picked.sizeLabel} · uploads when you confirm</span>
                </span>
                {/* type="button": the first button in a form is the one Enter
                    presses, and this one would discard the file. */}
                <Button type="button" variant="transparent" size="md" iconOnly onClick={() => setPicked(null)} aria-label="Remove file">
                  <CloseIcon size={16} />
                </Button>
              </div>

              <div className="grid gap-m items-start" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <Input
                  ref={versionRef}
                  id="build-version"
                  size="lg"
                  label="Version"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, version: true }))}
                  placeholder="e.g. 2.3.2"
                  autoComplete="off"
                  spellCheck={false}
                  error={!!versionError}
                  message={versionError ?? 'As your team numbers the build.'}
                />
                <Input
                  id="build-package"
                  size="lg"
                  label="Package name"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, packageName: true }))}
                  placeholder="com.studio.game"
                  autoComplete="off"
                  spellCheck={false}
                  error={!!packageError}
                  message={packageError ?? `Read from the ${picked.format === 'ZIP' ? 'APK inside the ZIP' : 'APK'} — edit it if it’s wrong.`}
                />
              </div>

              <div className="flex items-center gap-s">
                <span className="flex-1 min-w-0 font-body text-xs text-text-tertiary leading-[1.5]">{detailsHint}</span>
                <Button variant="primary" size="md" type="submit" disabled={!canUpload} leftIcon={<UploadIcon size={16} />}>
                  Upload build
                </Button>
              </div>
            </form>
          ) : (
            <SetupZone
              filled={false}
              icon={<UploadIcon size={20} />}
              title={builds.length === 0 ? 'Upload your first build' : 'Drop a build here or click to upload'}
              description="A release build of the game the AI players will install and play."
              formats={`APK · ZIP · up to ${MAX_BUILD_LABEL}`}
              accent="success"
              onClick={pickFile}
            />
          )}

          <div className="flex flex-col w-full rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-xs px-l py-s min-h-[56px]" style={{ backgroundColor: 'var(--bg-page-pale)' }}>
              <span className="font-display text-s font-semibold text-text-primary leading-[1.5]">Uploaded builds</span>
              <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                {builds.length === 0
                  ? 'none yet'
                  : q
                    ? `${listed.length} of ${builds.length} match`
                    : `${ready} ready${inFlight ? ` · ${inFlight} uploading` : ''}`}
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
                Nothing here yet. Drop an APK or ZIP above — once it finishes uploading it appears here, ready to run.
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
            {picked
              ? 'Upload the new build, or remove it to pick one below.'
              : chosen
                ? `The players will install ${versionOf(chosen)}.`
                : ready === 0
                  ? 'Upload a build to continue.'
                  : 'Pick a build.'}
          </span>
          <span className="flex-1" />
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={!chosen || picked !== null}
            onClick={() => {
              if (!chosen || picked) return
              onPick(versionOf(chosen))
              onClose()
            }}
          >
            {chosen ? `Use ${versionOf(chosen)}` : 'Use build'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Builds beyond this many get a search and a scrolling list. */
const SEARCH_FROM = 6

/* ── Row ────────────────────────────────────────────────────────────────── */

/* The trailing column carries the tick on a chosen build and the two recovery
   actions on a failed one, so it is sized for the wider of the two. The status
   column is 144px, not 200: its widest content is "Upload failed", and the
   package name needed the width in the name column more. */
const ROW_GRID = '24px 44px minmax(0, 1fr) 144px 132px'

function BuildRow({ build, selected, first, onSelect }: { build: BuildFile; selected: boolean; first: boolean; onSelect: () => void }) {
  const selectable = build.status === 'ready'
  const version = versionOf(build)
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
      {/* A failed upload is not a choice, so it gets no radio. An empty circle
          on a row that can never be picked is a control that does nothing, and
          the error-tinted tile beside it already says what the row is. */}
      {build.status === 'failed' ? (
        <span aria-hidden />
      ) : (
        <span
          className="flex items-center justify-center w-[18px] h-[18px] rounded-round"
          style={{
            border: `${selected ? 5 : 1.5}px solid ${selected ? 'var(--brand)' : selectable ? 'var(--border-default)' : 'var(--border-subtle)'}`,
            backgroundColor: 'var(--bg-elements)',
            opacity: selectable ? 1 : 0.5,
          }}
          aria-hidden
        />
      )}

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
        {build.format}
      </span>

      <span className="flex flex-col gap-xxxs min-w-0">
        <span className="flex items-center gap-xs min-w-0">
          {/* The version, in every state — it is given before the upload
              starts, so an in-flight or failed row is named the same way the
              ready one it becomes will be. */}
          <span className={['font-display text-s font-semibold leading-[1.45] truncate', selectable ? 'text-text-primary' : 'text-text-secondary'].join(' ')}>
            {version}
          </span>
          {build.newest && build.status === 'ready' && (
            <span className="inline-flex items-center px-xs py-xxxs rounded-xs font-display text-2xs font-semibold uppercase tracking-[0.08em]" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              newest
            </span>
          )}
        </span>
        {/* Package and date only. Size decides nothing once a build is in the
            list, "uploaded" repeats the list's own heading, and the file name
            is a hover away — version and package already say which build. */}
        <BuildPackageLine
          packageName={build.packageName}
          tail={build.uploadedOn}
          title={build.fileName}
          className="font-body text-xs text-text-tertiary leading-[1.5]"
        />

      </span>

      <StatusCell build={build} />

      {build.status === 'failed' ? (
        /* Both plain text at the same size — one secondary button beside one
           bare link read as two different kinds of thing. The hierarchy is
           colour: recovery in brand, the destructive one quiet. */
        <span className="flex items-center justify-end gap-m">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              retryUpload(build.id)
            }}
            className="build-row-action font-body text-xs font-semibold text-text-brand leading-[1.5] whitespace-nowrap"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeBuild(build.id)
            }}
            className="build-row-action font-body text-xs text-text-tertiary leading-[1.5] whitespace-nowrap"
          >
            Remove
          </button>
        </span>
      ) : (
        <span className="flex items-center justify-end text-text-tertiary" aria-hidden>
          {selected && <CheckIcon size={16} />}
        </span>
      )}
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
    case 'failed':
      /* One line, in the slot every other row says "Ready to run" in — the
         actions moved to the trailing column so a failed row is exactly as tall
         as the rest and the list keeps its rhythm. */
      return (
        <span className="font-body text-xs whitespace-nowrap" style={{ color: 'var(--error)' }}>
          {build.error ?? 'Upload failed'}
        </span>
      )
    default:
      return <span className="font-body text-xs text-text-tertiary whitespace-nowrap">Ready to run</span>
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
  const chosen = builds.find((b) => b.status === 'ready' && versionOf(b) === value)
  const inFlight = builds.filter((b) => b.status === 'uploading').length

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
            <BuildPlatformBadge>{chosen?.format ?? 'APK'}</BuildPlatformBadge>
            <span className="font-display text-s font-semibold text-text-primary leading-[1.5] whitespace-nowrap">{value}</span>
            {chosen && (
              <BuildPackageLine
                packageName={chosen.packageName}
                tail={buildDateTail(chosen)}
                className="font-body text-s text-text-tertiary leading-[1.5]"
              />
            )}
          </>
        ) : (
          <span className="font-body text-s text-text-placeholder leading-[1.5] truncate">{placeholder}</span>
        )}
        <span className="flex-1" />
        {inFlight > 0 && (
          <span className="inline-flex items-center gap-xxs font-body text-xs text-text-tertiary whitespace-nowrap">
            <Spinner size={12} tone="neutral" />
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

/**
 * A build's package name with a tail that never truncates — the date, and
 * "newest" where it applies. Application ids run long (CI-stamped internal
 * builds carry a hash), and one truncating line cut the date off first, so the
 * package shrinks and the tail holds.
 */
/** "Aug 29 · newest" — the tail a chosen build carries outside the list. */
export const buildDateTail = (b: BuildFile): string | undefined =>
  [b.uploadedOn, b.newest ? 'newest' : null].filter(Boolean).join(' · ') || undefined

export function BuildPackageLine({ packageName, tail, title, className }: { packageName: string; tail?: string; title?: string; className?: string }) {
  return (
    <span className={['flex min-w-0 whitespace-nowrap', className].filter(Boolean).join(' ')} title={title ?? packageName}>
      <span className="truncate min-w-0">{packageName}</span>
      {tail && <span className="shrink-0">&nbsp;· {tail}</span>}
    </span>
  )
}

/**
 * The build's package type — "APK" or "ZIP". Exported because the composer's filled
 * build zone wears the same mark: what is attached there is a package, and the
 * tick it used to carry said only "attached", which is what a filled zone is.
 *
 * `plain` drops the chip's own fill and box for use inside a tile that already
 * has both. The fill is rgba(22,163,74,0.07), so a chip on a tile of the same
 * token is not the same colour — the two alphas compound to ~0.135 and the
 * badge reads as a second, darker square floating inside the first.
 */
export function BuildPlatformBadge({ children, plain }: { children: ReactNode; plain?: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center shrink-0 font-code text-2xs font-semibold',
        plain ? 'leading-none' : 'px-xs h-[22px] rounded-xs',
      ].join(' ')}
      style={plain ? undefined : { backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
      aria-hidden
    >
      {children}
    </span>
  )
}
