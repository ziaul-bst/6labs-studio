/**
 * libraryDemoState — review chrome for the Gameplay Library and the run-setup
 * picker that reads from it.
 *
 * Both surfaces have states a reviewer cannot reach by clicking: an empty
 * library needs an empty account, an in-flight upload lasts a few seconds, a
 * failed transfer needs a transfer to fail, and the scrolling tag menu needs a
 * studio that has accumulated forty tags. Storybook covers them for developers,
 * but PMs review in the running app, so the state is switchable there too —
 * from the StateMachineDock, next to the plan preset.
 *
 * This is chrome, not product: it seeds fixtures and nothing else reads it.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'

export type LibraryDemoState =
  | 'default'
  | 'empty'
  | 'many-tags'
  | 'long-labels'
  | 'uploading'
  | 'processing'
  | 'failed'

export const LIBRARY_DEMO_STATES: LibraryDemoState[] = [
  'default',
  'empty',
  'many-tags',
  'long-labels',
  'uploading',
  'processing',
  'failed',
]

/** Switcher button copy — short, the pill is one row on a crowded screen. */
export const LIBRARY_DEMO_LABELS: Record<LibraryDemoState, string> = {
  default: 'Default',
  empty: 'Empty',
  'many-tags': 'Many tags',
  'long-labels': 'Long labels',
  uploading: 'Uploading',
  processing: 'Processing',
  failed: 'Failed',
}

/** Shown under the pill so a reviewer knows what they are looking at. */
export const LIBRARY_DEMO_NOTES: Record<LibraryDemoState, string> = {
  default: 'The seeded library — a few batches across every source.',
  empty: 'No videos at all: the first-run drop zone. The picker shows its own empty state.',
  'many-tags': '40+ tags, so the “+N more” menu has to scroll. Open it to check the list caps and scrolls.',
  'long-labels':
    'Tags and titles as they really arrive from an import — 40+ characters with nothing to break on. Every pill folds at one measure; the full string is on hover.',
  uploading:
    'Every clip mid-transfer: progress bars and no duration. The picker holds only ready clips, so it shows its “nothing ready yet” state instead.',
  processing:
    'Transferred but not analysed yet — the daily run has not reached them. They play and can be tagged here; the picker leaves them out until the analysis lands.',
  failed:
    'Failed uploads with the error and Retry. Retry restarts the transfer. The picker has nothing to offer, and says why.',
}

/**
 * Tags and titles exactly as an import writes them: a source system's own
 * naming, a pasted build path, a sentence somebody typed into a tag field.
 * None of these are hypothetical — the first is the one that arrived from a
 * partner's batch export and took the whole tag rail with it.
 */
export const LONG_LABEL_BATCHES: string[] = [
  'B.A.N.K..O.F..B.A.R.O.D.A.BossFightv1.2',
  'Build V2.2',
  'release/2026-09-16/candidate-4-hotfix-matchmaking',
  'Frost Festival',
]

export const LONG_LABEL_USER_TAGS: string[] = [
  'regression-suite-full-pass-before-store-submission',
  'onboarding',
  'whiteoutsurvival_com.gof.global_tutorial_furnace_upgrade',
  'retention',
]

/** A filename that came off a capture device rather than out of a person. */
export const LONG_LABEL_TITLES: string[] = [
  'ut-1209—WhiteoutSurvival_com.gof.global_2026-09-16T11-42-08Z_agent-02_portrait_1080x2340.mp4',
  'CqHgH14ReFvYjK0C2MvYgVRDmojfIuG6gacn8x68b6MaRBOkCV3ljkbYXw2hCLL.mp4',
]

/**
 * A long, plausible tag vocabulary for the `many-tags` state. Real studios grow
 * these by accident — one per build, one per feature, one per person's habit —
 * which is exactly why the menu needs to scroll rather than grow.
 */
export const MANY_TAG_BATCHES: string[] = [
  'Build V2.2',
  'Build V2.1',
  'Build V2.0',
  'Build V1.9',
  'Build V1.8',
  'Frost Festival',
  'Lunar Event',
  'Summer Splash',
  'New event',
  'Tutorial',
  'Alliance',
  'Store',
  'Boss fight',
  'Daily quest',
  'Rally',
  'Hero screen',
  'Settings',
  'Chat',
  'Matchmaking',
  'Onboarding v3',
]

export const MANY_TAG_USER_TAGS: string[] = [
  'onboarding',
  'regression',
  'retention',
  'frost-festival',
  'monetisation',
  'whale',
  'new-player',
  'day-3',
  'tutorial-skip',
  'crash-repro',
  'payments',
  'balance',
  'speedrun',
  'difficulty',
  'ftue-drop',
  'hand-picked',
  'localisation',
  'perf',
  'ui-polish',
  'audio',
]

// ─── Store ───────────────────────────────────────────────────────────────────
/*
 * A module-level store rather than props: the picker modal mounts two levels
 * down (UserTestHome / FunctionalTestView), and threading review chrome through
 * product components' prop APIs to reach it would put a `demoState` on
 * interfaces that have no business carrying one. Same shape as connectorsStore.
 */

let current: LibraryDemoState = 'default'
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setLibraryDemoState(next: LibraryDemoState): void {
  if (next === current) return
  current = next
  listeners.forEach((fn) => fn())
}

/** Read outside React (fixtures, event handlers). */
export const getLibraryDemoState = (): LibraryDemoState => current

/** Subscribe from a component — re-renders on every switch. */
export function useLibraryDemoState(): LibraryDemoState {
  return useSyncExternalStore(subscribe, getLibraryDemoState, getLibraryDemoState)
}
