/**
 * uploadsDemoState — the Context uploads screen's states, for the state
 * machine dock.
 *
 * ContextUploadsView already documents its own lifecycle in its header —
 * empty → uploading → uploaded (describe) → indexed — but every step past
 * "empty" needs a file, so the only way to review the later screens was to drag
 * one in and race the progress timer. These presets seed the file list directly.
 *
 * Review chrome, not product.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'
import type { UploadStatus } from '../components/molecules/ContextFileCard'

export type UploadsDemoState = 'empty' | 'uploading' | 'describe' | 'indexed' | 'mixed'

export const UPLOADS_DEMO_STATES: UploadsDemoState[] = [
  'empty',
  'uploading',
  'describe',
  'indexed',
  'mixed',
]

export const UPLOADS_DEMO_LABELS: Record<UploadsDemoState, string> = {
  empty: 'Empty',
  uploading: 'Uploading',
  describe: 'Describe',
  indexed: 'Indexed',
  mixed: 'Mixed',
}

export const UPLOADS_DEMO_NOTES: Record<UploadsDemoState, string> = {
  empty: 'First run — the full-size drop zone and nothing else.',
  uploading: 'Transfers in flight, with progress. The bars advance on their own.',
  describe: 'Uploaded and waiting for a description — the step that makes a file useful to agents.',
  indexed: 'Saved with descriptions: the settled library plus the compact uploader.',
  mixed: 'All three at once, which is what a real session looks like mid-upload.',
}

/** The seeded file shape — mirrors ContextUploadsView's own internal model. */
export interface UploadsDemoFile {
  id: string
  name: string
  size: string
  date: string
  type: 'image' | 'document'
  progress: number
  status: UploadStatus
  saved?: boolean
  savedDescription?: string
}

const DATE = 'Sep 8, 2026'

const indexed = (id: string, name: string, size: string, description: string): UploadsDemoFile => ({
  id,
  name,
  size,
  date: DATE,
  type: name.endsWith('.png') || name.endsWith('.jpg') ? 'image' : 'document',
  progress: 100,
  status: 'uploaded',
  saved: true,
  savedDescription: description,
})

const describing = (id: string, name: string, size: string): UploadsDemoFile => ({
  id,
  name,
  size,
  date: DATE,
  type: name.endsWith('.png') || name.endsWith('.jpg') ? 'image' : 'document',
  progress: 100,
  status: 'uploaded',
})

const uploading = (id: string, name: string, size: string, progress: number): UploadsDemoFile => ({
  id,
  name,
  size,
  date: DATE,
  type: name.endsWith('.png') || name.endsWith('.jpg') ? 'image' : 'document',
  progress,
  status: 'uploading',
})

export function uploadsFilesFor(state: UploadsDemoState): UploadsDemoFile[] {
  switch (state) {
    case 'empty':
      return []

    case 'uploading':
      return [
        uploading('u1', 'Game design doc v4.pdf', '2.4 MB', 34),
        uploading('u2', 'Economy balance sheet.xlsx', '840 KB', 68),
        uploading('u3', 'Tutorial storyboard.png', '1.1 MB', 12),
      ]

    case 'describe':
      return [
        describing('d1', 'Game design doc v4.pdf', '2.4 MB'),
        describing('d2', 'Economy balance sheet.xlsx', '840 KB'),
      ]

    case 'indexed':
      return [
        indexed('i1', 'Game design doc v4.pdf', '2.4 MB', 'Full design intent for Build V2.2 — systems, progression and the tutorial beats.'),
        indexed('i2', 'Economy balance sheet.xlsx', '840 KB', 'Soft and hard currency sinks per level band, with the intended sink/source ratio.'),
        indexed('i3', 'Tutorial storyboard.png', '1.1 MB', 'Intended first-session flow, screen by screen, as handed to the art team.'),
      ]

    case 'mixed':
      return [
        uploading('m1', 'Alliance war rules.docx', '620 KB', 46),
        describing('m2', 'Tutorial storyboard.png', '1.1 MB'),
        indexed('m3', 'Game design doc v4.pdf', '2.4 MB', 'Full design intent for Build V2.2 — systems, progression and the tutorial beats.'),
      ]
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────

let current: UploadsDemoState = 'empty'
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setUploadsDemoState(next: UploadsDemoState): void {
  if (next === current) return
  current = next
  listeners.forEach((fn) => fn())
}

export const getUploadsDemoState = (): UploadsDemoState => current

export function useUploadsDemoState(): UploadsDemoState {
  return useSyncExternalStore(subscribe, getUploadsDemoState, getUploadsDemoState)
}
