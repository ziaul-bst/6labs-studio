/**
 * runDemoState — the New-run flow's screens, for the state machine dock.
 *
 * The History row seeds the list of past runs; this one seeds the run you are
 * *in*. Those screens were the last ones with no preset, and the hardest to
 * reach on purpose: a run takes SIMULATED_RUN_MS (16s) to finish, so the
 * in-progress thread is a sixteen-second window you have to catch, and the
 * report is only reachable by sitting through it.
 *
 * Each test view maps these onto its own screens — User Test has a thread step
 * between the composer and the report, the others go straight to the report —
 * so `RUN_DEMO_STATES_NO_THREAD` is the shorter list for those.
 *
 * Review chrome, not product.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useEffect, useRef } from 'react'
import { useSyncExternalStore } from 'react'

export type RunDemoState = 'composer' | 'running' | 'thread' | 'summary' | 'report'

export const RUN_DEMO_STATES: RunDemoState[] = ['composer', 'running', 'thread', 'summary', 'report']

/** For views with no thread step between composing and the report. */
export const RUN_DEMO_STATES_NO_THREAD: RunDemoState[] = ['composer', 'running', 'report']

export const RUN_DEMO_LABELS: Record<RunDemoState, string> = {
  composer: 'Composer',
  running: 'Running',
  thread: 'Thread',
  summary: 'Run summary',
  report: 'Report',
}

export const RUN_DEMO_NOTES: Record<RunDemoState, string> = {
  composer: 'Before a run — pick footage, add context, name it.',
  running: 'A run in flight. Normally a 16-second window; this holds it open.',
  thread: 'The finished run thread, with the answer and the follow-up dock.',
  summary: 'The run page a finished report opens on — what it found, and how big.',
  report: 'The full report: issues ranked by testers affected, with clips.',
}

// ─── Store ───────────────────────────────────────────────────────────────────

let current: RunDemoState = 'composer'
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setRunDemoState(next: RunDemoState): void {
  if (next === current) return
  current = next
  listeners.forEach((fn) => fn())
}

export const getRunDemoState = (): RunDemoState => current

export function useRunDemoState(): RunDemoState {
  return useSyncExternalStore(subscribe, getRunDemoState, getRunDemoState)
}

/**
 * Applies the preset inside a test view. Mirrors useHistoryDemoSeed: it skips
 * the very first run when the state is still the default, so mounting a view
 * never overrides whatever screen it was asked to open on.
 *
 * "First run" is the last preset applied, not a boolean — StrictMode runs
 * effects twice on mount, and a first-run flag let the second run apply the
 * default preset over the screen the view was asked to open on.
 */
export function useRunDemoSeed(onSeed: (state: RunDemoState) => void): void {
  const state = useRunDemoState()
  const applied = useRef<RunDemoState | null>(null)
  const cb = useRef(onSeed)
  cb.current = onSeed
  useEffect(() => {
    const previous = applied.current
    if (previous === state) return
    applied.current = state
    if (previous === null && state === 'composer') return
    cb.current(state)
  }, [state])
}
