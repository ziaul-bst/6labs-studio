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

export type LibraryDemoState = 'default' | 'empty' | 'many-tags' | 'uploading' | 'failed'

export const LIBRARY_DEMO_STATES: LibraryDemoState[] = [
  'default',
  'empty',
  'many-tags',
  'uploading',
  'failed',
]

/** Switcher button copy — short, the pill is one row on a crowded screen. */
export const LIBRARY_DEMO_LABELS: Record<LibraryDemoState, string> = {
  default: 'Default',
  empty: 'Empty',
  'many-tags': 'Many tags',
  uploading: 'Uploading',
  failed: 'Failed',
}

/** Shown under the pill so a reviewer knows what they are looking at. */
export const LIBRARY_DEMO_NOTES: Record<LibraryDemoState, string> = {
  default: 'The seeded library — a few batches across every source.',
  empty: 'No videos at all: the first-run drop zone. The picker shows its own empty state.',
  'many-tags': '40+ tags, so the “+N more” menu has to scroll. Open it to check the list caps and scrolls.',
  uploading: 'Every clip mid-transfer: progress bars, no duration, nothing selectable in the picker.',
  failed: 'Failed uploads with the error and Retry. Retry restarts the transfer.',
}

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
