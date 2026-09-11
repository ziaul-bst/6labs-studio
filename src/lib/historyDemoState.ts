/**
 * historyDemoState — review chrome for a test's history tab.
 *
 * The list has states a reviewer cannot reach in one click: an empty history
 * needs a fresh account, a run in progress lasts a few seconds, and User Test's
 * kind filter only appears once a question has been asked. Storybook covers
 * them for developers, but PMs review in the running app, so the state is
 * switchable there too — from the StateMachineDock, next to the plan and library
 * presets.
 *
 * This is chrome, not product: it reseeds a fixture and nothing else reads it.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useEffect, useRef, useSyncExternalStore } from 'react'
import type { TestRunHistoryItem } from './types/testing'

export type HistoryDemoState = 'seeded' | 'empty' | 'progress' | 'failed' | 'many' | 'reports'

export const HISTORY_DEMO_STATES: HistoryDemoState[] = ['seeded', 'empty', 'progress', 'failed', 'many', 'reports']

/** Only User Test lists questions, so only it has a "reports only" state. */
export const HISTORY_DEMO_STATES_REPORTS_ONLY: HistoryDemoState[] = ['seeded', 'empty', 'progress', 'failed', 'many']

/** Switcher button copy — short, the row is one line in a small dock. */
export const HISTORY_DEMO_LABELS: Record<HistoryDemoState, string> = {
  seeded: 'Seeded',
  empty: 'No history',
  progress: 'In progress',
  failed: 'Failed run',
  many: 'Long history',
  reports: 'Reports only',
}

/** Shown under the row so a reviewer knows what they are looking at. */
export const HISTORY_DEMO_NOTES: Record<HistoryDemoState, string> = {
  seeded: 'The seeded history — a few finished runs.',
  empty: 'Nothing has run yet: the tab shows its empty copy.',
  progress: 'A run just started sits on top, tinted and spinning, marked "Just started".',
  failed: 'A run that stopped sits on top — red tile, Failed pill, the reason in its line. Open it for the notice.',
  many: 'Forty-two runs: the list pages, ten a screen, with the range and page count in its footer.',
  reports: 'Questions removed, so the kind filter above the list disappears.',
}

/**
 * Build the fixture for a state from a test's seeded history. `progress`
 * synthesises a just-started run from the first seeded report so the row
 * speaks the test's own language (videos, sessions, cases).
 */
export function seedHistory(
  base: TestRunHistoryItem[],
  state: HistoryDemoState,
): { runs: TestRunHistoryItem[]; highlightId: string | null } {
  switch (state) {
    case 'empty':
      return { runs: [], highlightId: null }
    case 'reports':
      return { runs: base.filter((r) => (r.kind ?? 'report') === 'report'), highlightId: null }
    case 'failed': {
      const first = base.find((r) => (r.kind ?? 'report') === 'report') ?? base[0]
      if (!first) return { runs: base, highlightId: null }
      const failed: TestRunHistoryItem = {
        ...first,
        id: 'demo-failed',
        kind: 'report',
        state: 'failed',
        result: undefined,
        failure: /sessions|cases/.test(first.detail)
          ? 'Build crashed on launch — the players could not get past the splash screen.'
          : 'Analysis stopped — 3 recordings could not be decoded.',
        when: 'Sep 9',
      }
      return { runs: [failed, ...base], highlightId: null }
    }
    case 'many': {
      /* Only finished reports are worth forty-two of — a never-run file is not history. */
      const reports = base.filter((r) => (r.kind ?? 'report') === 'report' && r.result)
      if (reports.length === 0) return { runs: base, highlightId: null }
      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const runs: TestRunHistoryItem[] = Array.from({ length: 42 }, (_, i) => {
        const b = reports[i % reports.length]
        const d = new Date(2026, 8, 9 - i * 2)
        const result =
          b.result?.kind === 'issues'
            ? { kind: 'issues' as const, count: Math.max(0, b.result.count + ((i * 7) % 5) - 2) }
            : b.result?.kind === 'counts'
              ? { ...b.result, failed: (i * 3) % 6, review: (i * 2) % 4 }
              : b.result
        return { ...b, id: `demo-many-${i}`, state: 'done', result, when: `${MONTHS[d.getMonth()]} ${d.getDate()}` }
      })
      return { runs, highlightId: null }
    }
    case 'progress': {
      const first = base.find((r) => (r.kind ?? 'report') === 'report') ?? base[0]
      const live: TestRunHistoryItem = first
        ? {
            ...first,
            id: 'demo-progress',
            kind: 'report',
            state: 'progress',
            result: undefined,
            detail: `${first.detail} · started just now`,
            when: 'now',
          }
        : { id: 'demo-progress', name: 'Run', detail: 'started just now', meta: '—', state: 'progress', when: 'now' }
      return { runs: [live, ...base], highlightId: live.id }
    }
    default:
      return { runs: base, highlightId: null }
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────
/* Module-level, like libraryDemoState: the lists live inside four test views
   and review chrome should not appear on their prop APIs. */

let current: HistoryDemoState = 'seeded'
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setHistoryDemoState(next: HistoryDemoState): void {
  if (next === current) return
  current = next
  listeners.forEach((fn) => fn())
}

export const getHistoryDemoState = (): HistoryDemoState => current

export function useHistoryDemoState(): HistoryDemoState {
  return useSyncExternalStore(subscribe, getHistoryDemoState, getHistoryDemoState)
}

export interface HistorySeed {
  runs: TestRunHistoryItem[]
  highlightId: string | null
  /** True on mount — the view should take the fixture but not jump tabs. */
  initial: boolean
}

/**
 * Reseed a view's run list whenever the preset changes. On mount it applies a
 * non-default preset silently (a reviewer who chose "No history" and moved to
 * another test expects it to hold); after that every switch calls `onSeed`
 * with `initial: false`, so the view can also open its History tab — the
 * whole point is fewer clicks.
 *
 * The guard keys off the last preset actually applied, not off "have I run
 * before": StrictMode runs every effect twice on mount, and a first-run flag
 * made the second run look like a switch — so every test opened on its
 * History tab instead of the new-run setup.
 */
export function useHistoryDemoSeed(base: TestRunHistoryItem[], onSeed: (seed: HistorySeed) => void): void {
  const state = useHistoryDemoState()
  const applied = useRef<HistoryDemoState | null>(null)
  const cb = useRef(onSeed)
  cb.current = onSeed
  useEffect(() => {
    const previous = applied.current
    if (previous === state) return
    applied.current = state
    const initial = previous === null
    if (initial && state === 'seeded') return
    cb.current({ ...seedHistory(base, state), initial })
  }, [state, base])
}
