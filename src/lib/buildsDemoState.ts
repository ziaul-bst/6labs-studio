/**
 * buildsDemoState — the builds an AI test can be pointed at, and their upload
 * states, for the build picker and the state machine dock.
 *
 * A build is not "there" the moment it is dropped: a release build can run to
 * gigabytes, so it uploads first and only then can a run use it — or the
 * upload fails. The picker shows every one of those states, and the dock can
 * put the list into any of them so a reviewer does not have to time a 4 GB
 * upload.
 *
 * The version and package name are asked for before the upload starts, so
 * every row — even one mid-upload or failed — is named the way the studio
 * names its builds, not by whatever the file happened to be called.
 *
 * Shared by the AI functional and AI behavioural composers so an upload made
 * on one is there on the other.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'
import { runDateLabel } from './runDate'

export type BuildStatus = 'uploading' | 'ready' | 'failed'

/**
 * What was uploaded. Android only for now — iOS builds are not accepted yet.
 * A ZIP is an APK packed with what it needs beside it (OBB expansion files,
 * typically); the players still install the APK inside it.
 */
export type BuildFormat = 'APK' | 'ZIP'

export interface BuildFile {
  id: string
  /** "v2.3.1" — typed in by whoever uploads it, before the upload starts. */
  version: string
  /** "com.gof.global" — read from the APK, editable before the upload starts. */
  packageName: string
  fileName: string
  format: BuildFormat
  /** "Aug 29" — set when the upload lands. Just the date: the list is already headed "Uploaded builds". */
  uploadedOn?: string
  status: BuildStatus
  /** 0–100 while uploading. */
  progress?: number
  /** Why the upload failed — one line. */
  error?: string
  /** The most recently uploaded build — the default pick. */
  newest?: boolean
}

export type BuildsDemoState = 'seeded' | 'empty' | 'uploading' | 'failed' | 'many'

export const BUILDS_DEMO_STATES: BuildsDemoState[] = ['seeded', 'empty', 'uploading', 'failed', 'many']

export const BUILDS_DEMO_LABELS: Record<BuildsDemoState, string> = {
  seeded: 'Seeded',
  empty: 'No builds',
  uploading: 'Uploading',
  failed: 'Failed upload',
  many: 'Many builds',
}

export const BUILDS_DEMO_NOTES: Record<BuildsDemoState, string> = {
  seeded: 'Three uploaded builds, newest first — one of them a ZIP.',
  uploading: 'A build mid-upload, then ready — the whole arc in a few seconds.',
  failed: 'An upload that did not finish, with retry and remove.',
  empty: 'Nothing uploaded yet — the picker leads with the upload zone.',
  many: 'Twenty-four builds: the list scrolls inside the dialog and gets a search.',
}

/** Whiteout Survival's application id — what its APK's manifest declares. */
const PACKAGE = 'com.gof.global'

/** Largest build the upload accepts. */
export const MAX_BUILD_LABEL = '4 GB'

/** The file a build is uploaded from, before it has a version. */
export interface PickedBuild {
  fileName: string
  format: BuildFormat
  /** What the manifest declares — from the APK itself, or the one inside the ZIP. */
  packageName: string
}

/**
 * What the file picker hands back in the prototype. The package name comes out
 * of the manifest; the version does not, because a studio's own build number
 * and the manifest's versionName often disagree — so it is asked for.
 */
export const PICKED_BUILD: PickedBuild = { fileName: 'whiteout-2.3.2-rc1.apk', format: 'APK', packageName: PACKAGE }

/* v2.2.9 carries a long application id — the shape a CI-stamped internal build
   takes — so the list shows a package name truncating while its date holds. */
const SEEDED: BuildFile[] = [
  { id: 'b-231', version: 'v2.3.1', packageName: PACKAGE, fileName: 'whiteout-2.3.1-release.apk', format: 'APK', uploadedOn: 'Aug 29', status: 'ready', newest: true },
  { id: 'b-230', version: 'v2.3.0', packageName: PACKAGE, fileName: 'whiteout-2.3.0-release.zip', format: 'ZIP', uploadedOn: 'Aug 22', status: 'ready' },
  { id: 'b-229', version: 'v2.2.9', packageName: 'com.gof.global_app_943a882067cdcf32cb9ea30962a125a1', fileName: 'whiteout-2.2.9-internal.apk', format: 'APK', uploadedOn: 'Aug 14', status: 'ready' },
]

/** A long shelf of builds — one every few days over three months. */
const MANY: BuildFile[] = Array.from({ length: 24 }, (_, i) => {
  const minor = 3 - Math.floor(i / 10)
  const patch = 9 - (i % 10)
  const version = `v2.${minor}.${patch}`
  const d = new Date(2026, 7, 29 - i * 4)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return {
    id: `b-many-${i}`,
    version,
    packageName: PACKAGE,
    fileName: `whiteout-${version.slice(1)}-release.apk`,
    format: 'APK',
    uploadedOn: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
    status: 'ready',
    newest: i === 0,
  }
})

/* Just the fact. The line used to name a cause and a percentage — "the
   connection dropped at 64%" — which the uploader cannot actually know, and
   "Try again" repeated the Retry button sitting under it. */
const FAILED_ERROR = 'Upload failed'

// ─── Store ───────────────────────────────────────────────────────────────────

let preset: BuildsDemoState = 'seeded'
let builds: BuildFile[] = SEEDED
const listeners = new Set<() => void>()
const timers = new Map<string, number>()

const emit = () => listeners.forEach((fn) => fn())
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

const update = (id: string, patch: Partial<BuildFile>) => {
  builds = builds.map((b) => (b.id === id ? { ...b, ...patch } : b))
  emit()
}

const clearTimer = (id: string) => {
  const t = timers.get(id)
  if (t) window.clearInterval(t)
  timers.delete(id)
}

/** Walks one build through upload → ready (or failed). */
function run(id: string, fromProgress: number, outcome: 'ready' | 'failed') {
  clearTimer(id)
  let progress = fromProgress
  const t = window.setInterval(() => {
    progress = Math.min(100, progress + 6 + Math.round(Math.random() * 8))
    if (progress < 100) {
      update(id, { status: 'uploading', progress })
      return
    }
    clearTimer(id)
    if (outcome === 'failed') {
      update(id, { status: 'failed', progress: 100, error: FAILED_ERROR })
      return
    }
    /* The new build becomes the newest one; the old newest steps down. */
    builds = builds.map((b) => (b.id === id ? { ...b, status: 'ready', progress: 100, newest: true, uploadedOn: runDateLabel() } : { ...b, newest: false }))
    emit()
  }, 260)
  timers.set(id, t)
}

export function setBuildsDemoState(next: BuildsDemoState): void {
  preset = next
  timers.forEach((_, id) => clearTimer(id))
  switch (next) {
    case 'empty':
      builds = []
      break
    case 'uploading': {
      const id = `b-up-${Date.now()}`
      builds = [
        { id, version: 'v2.3.2', ...PICKED_BUILD, status: 'uploading', progress: 38 },
        ...SEEDED,
      ]
      emit()
      run(id, 38, 'ready')
      break
    }
    case 'many':
      builds = MANY
      break
    case 'failed':
      builds = [
        { id: 'b-bad', version: 'v2.3.2', ...PICKED_BUILD, status: 'failed', error: FAILED_ERROR },
        ...SEEDED,
      ]
      break
    default:
      builds = SEEDED
  }
  emit()
}

/** What the details step hands the upload — both are required. */
export interface BuildDetails {
  version: string
  packageName: string
}

/** What the upload zone's file picker returns in the prototype. */
export const pickBuildFile = (): PickedBuild => PICKED_BUILD

/** What "Upload build" does in the prototype — the picked file uploads and lands. */
export function startUpload(file: PickedBuild, details: BuildDetails, kind: 'ok' | 'broken' = 'ok'): void {
  const id = `b-up-${Date.now()}`
  /* Same file either way — an upload fails on the connection, not the file. */
  builds = [
    { id, ...file, ...details, status: 'uploading', progress: 0 },
    ...builds,
  ]
  emit()
  run(id, 0, kind === 'broken' ? 'failed' : 'ready')
}

export function retryUpload(id: string): void {
  const b = builds.find((x) => x.id === id)
  if (!b) return
  /* Same file, same version and package — they were given before the first try. */
  update(id, { status: 'uploading', progress: 0, error: undefined })
  run(id, 0, 'ready')
}

export function removeBuild(id: string): void {
  clearTimer(id)
  builds = builds.filter((b) => b.id !== id)
  emit()
}

/** The version a build was uploaded as — what the composer stores and shows. */
export const versionOf = (b: BuildFile) => b.version

/**
 * "2.3.2" and "v2.3.2" are the same answer, so both land as "v2.3.2" — the
 * shape the seeded builds and the "Use v2.3.2" action already wear. Anything
 * that does not start with a digit ("nightly-14") is kept as typed.
 */
export function normalizeVersion(raw: string): string {
  const v = raw.trim()
  return /^v?\d/i.test(v) ? `v${v.replace(/^v/i, '')}` : v
}

/** An Android application id: two or more dot-separated segments, each starting with a letter. */
export const isValidPackageName = (raw: string): boolean => /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(raw.trim())

export const getBuilds = (): BuildFile[] => builds
export const getBuildsDemoState = (): BuildsDemoState => preset

export function useBuilds(): BuildFile[] {
  return useSyncExternalStore(subscribe, getBuilds, getBuilds)
}

export function useBuildsDemoState(): BuildsDemoState {
  return useSyncExternalStore(subscribe, getBuildsDemoState, getBuildsDemoState)
}