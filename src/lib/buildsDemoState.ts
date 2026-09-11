/**
 * buildsDemoState — the builds an AI test can be pointed at, and their upload
 * states, for the build picker and the state machine dock.
 *
 * A build is not "there" the moment it is dropped: it uploads, then 6labs
 * verifies it (reads the manifest, signs it for the players), and only then
 * can a run use it — or it fails verification. The picker shows every one of
 * those states, and the dock can put the list into any of them so a reviewer
 * does not have to time a 500 MB upload.
 *
 * Shared by the AI functional and AI behavioural composers so an upload made
 * on one is there on the other.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'

export type BuildStatus = 'uploading' | 'verifying' | 'ready' | 'failed'

export interface BuildFile {
  id: string
  /** "v2.3.1" — read from the manifest once verified; the file name until then. */
  version: string
  fileName: string
  platform: 'APK' | 'IPA'
  sizeLabel: string
  /** "uploaded Aug 29" */
  uploadedLabel: string
  status: BuildStatus
  /** 0–100 while uploading. */
  progress?: number
  /** Why verification failed — one line. */
  error?: string
  /** The most recent verified build — the default pick. */
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
  seeded: 'Three verified builds, newest first.',
  uploading: 'A build mid-upload, then verifying, then ready — the whole arc in a few seconds.',
  failed: 'A file that did not verify, with retry and remove.',
  empty: 'Nothing uploaded yet — the picker leads with the upload zone.',
  many: 'Twenty-four builds: the list scrolls inside the dialog and gets a search.',
}

const SEEDED: BuildFile[] = [
  { id: 'b-231', version: 'v2.3.1', fileName: 'whiteout-2.3.1-release.apk', platform: 'APK', sizeLabel: '312 MB', uploadedLabel: 'uploaded Aug 29', status: 'ready', newest: true },
  { id: 'b-230', version: 'v2.3.0', fileName: 'whiteout-2.3.0-release.apk', platform: 'APK', sizeLabel: '308 MB', uploadedLabel: 'uploaded Aug 22', status: 'ready' },
  { id: 'b-229', version: 'v2.2.9', fileName: 'whiteout-2.2.9-release.apk', platform: 'APK', sizeLabel: '301 MB', uploadedLabel: 'uploaded Aug 14', status: 'ready' },
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
    fileName: `whiteout-${version.slice(1)}-release.apk`,
    platform: i % 7 === 3 ? 'IPA' : 'APK',
    sizeLabel: `${296 + ((i * 5) % 30)} MB`,
    uploadedLabel: `uploaded ${MONTHS[d.getMonth()]} ${d.getDate()}`,
    status: 'ready',
    newest: i === 0,
  }
})

const FAILED_ERROR = 'Not a valid Android package — the manifest could not be read. Export a release build and try again.'

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

/** Walks one build through upload → verifying → ready (or failed). */
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
    update(id, { status: 'verifying', progress: 100 })
    window.setTimeout(() => {
      if (outcome === 'failed') {
        update(id, { status: 'failed', error: FAILED_ERROR })
        return
      }
      /* The new build becomes the newest verified one; the old newest steps down. */
      builds = builds.map((b) => (b.id === id ? { ...b, status: 'ready', newest: true, uploadedLabel: 'uploaded just now' } : { ...b, newest: false }))
      emit()
    }, 1600)
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
        { id, version: 'whiteout-2.3.2-rc1.apk', fileName: 'whiteout-2.3.2-rc1.apk', platform: 'APK', sizeLabel: '318 MB', uploadedLabel: 'uploading', status: 'uploading', progress: 38 },
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
        { id: 'b-bad', version: 'whiteout-debug-unsigned.apk', fileName: 'whiteout-debug-unsigned.apk', platform: 'APK', sizeLabel: '296 MB', uploadedLabel: 'uploaded just now', status: 'failed', error: FAILED_ERROR },
        ...SEEDED,
      ]
      break
    default:
      builds = SEEDED
  }
  emit()
}

/** What the upload zone does in the prototype — a new build arrives and verifies. */
export function startUpload(kind: 'ok' | 'broken' = 'ok'): void {
  const id = `b-up-${Date.now()}`
  const fileName = kind === 'broken' ? 'whiteout-debug-unsigned.apk' : 'whiteout-2.3.2-rc1.apk'
  builds = [
    { id, version: fileName, fileName, platform: 'APK', sizeLabel: '318 MB', uploadedLabel: 'uploading', status: 'uploading', progress: 0 },
    ...builds,
  ]
  emit()
  run(id, 0, kind === 'broken' ? 'failed' : 'ready')
}

export function retryUpload(id: string): void {
  const b = builds.find((x) => x.id === id)
  if (!b) return
  update(id, { status: 'uploading', progress: 0, error: undefined, fileName: 'whiteout-2.3.2-rc1.apk', version: 'whiteout-2.3.2-rc1.apk' })
  run(id, 0, 'ready')
}

export function removeBuild(id: string): void {
  clearTimer(id)
  builds = builds.filter((b) => b.id !== id)
  emit()
}

/** Version label a verified build gets once its manifest is read. */
export const verifiedVersionOf = (b: BuildFile) => (b.status === 'ready' && b.version.endsWith('.apk') ? 'v2.3.2' : b.version)

export const getBuilds = (): BuildFile[] => builds
export const getBuildsDemoState = (): BuildsDemoState => preset

export function useBuilds(): BuildFile[] {
  return useSyncExternalStore(subscribe, getBuilds, getBuilds)
}

export function useBuildsDemoState(): BuildsDemoState {
  return useSyncExternalStore(subscribe, getBuildsDemoState, getBuildsDemoState)
}
