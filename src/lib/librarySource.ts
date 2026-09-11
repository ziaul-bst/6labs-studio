/**
 * Where a Gameplay Library clip came from, and how it is classified.
 *
 * Source matters because the paths produce very different batches: the
 * Recorder app pushes one session at a time from a tester's device, the CLI
 * pushes hundreds at once from a build machine, browser upload is the ad-hoc
 * "I have this clip" path, and AI player sessions are produced by the AI tests
 * themselves. Being able to say "the 3 that came via CLI" is what makes a
 * mixed library legible.
 *
 * SDK was a fifth path until 2026-09-10 and is gone: nothing streams clips
 * into the library from a live build.
 *
 * Stage and test type (revamp 2026-09-09) are the two other facets every test
 * filters on: which release stage the footage is from, and which kind of test
 * produced it. Together with the batch tag they form the group header a clip
 * sits under — "Build V2.2 · Recorder app · Pre-release".
 *
 * Code-first prototype — no Figma source yet.
 */
export type VideoUploadSource = 'recorder' | 'cli' | 'upload' | 'ai-player'

/** Card meta line — reads after the date: "2 Sep 2026 · uploaded by Recorder app" */
export const SOURCE_LABEL: Record<VideoUploadSource, string> = {
  recorder: 'uploaded by Recorder app',
  cli: 'bulk upload via CLI',
  upload: 'uploaded from browser',
  'ai-player': 'played by AI player',
}

/** Filter chips and short references */
export const SOURCE_SHORT: Record<VideoUploadSource, string> = {
  recorder: 'Recorder app',
  cli: 'CLI',
  upload: 'Browser upload',
  'ai-player': 'AI player',
}

/** Results summary — reads after a count: "5 from Recorder app, 3 via CLI" */
export const SOURCE_SUMMARY: Record<VideoUploadSource, string> = {
  recorder: 'from Recorder app',
  cli: 'via CLI',
  upload: 'from browser upload',
  'ai-player': 'from AI players',
}

/** Stable display order, most-automated first */
export const SOURCE_ORDER: VideoUploadSource[] = ['recorder', 'cli', 'upload', 'ai-player']

// ── Stage ─────────────────────────────────────────────────────────────────────

export type VideoStage = 'pre-release' | 'cbt' | 'obt' | 'live'

export const STAGE_LABEL: Record<VideoStage, string> = {
  'pre-release': 'Pre-release',
  cbt: 'CBT',
  obt: 'OBT',
  live: 'Live',
}

export const STAGE_ORDER: VideoStage[] = ['pre-release', 'cbt', 'obt', 'live']

// ── Test type ─────────────────────────────────────────────────────────────────

export type LibraryTestType = 'functional' | 'user-test' | 'ai'

export const TEST_TYPE_LABEL: Record<LibraryTestType, string> = {
  functional: 'Functional',
  'user-test': 'User test',
  ai: 'AI',
}

export const TEST_TYPE_ORDER: LibraryTestType[] = ['functional', 'user-test', 'ai']
