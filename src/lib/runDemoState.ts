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

export type RunDemoState =
  | 'composer'
  | 'running'
  | 'no-sessions'
  | 'analysing'
  | 'thread'
  | 'summary'
  | 'asking'
  | 'report'

/**
 * The screens a test can be held on, per test — they no longer share one list,
 * because they no longer have the same screens.
 *
 * None of the human tests keep `running`. A new run lands on its History tab as
 * a row in progress and the detail page is disabled until it finishes, so a
 * preset for a run in flight would hold open a page nothing routes to.
 */

/** User Test: a thread (an opened question), the run page, and the report. */
export const RUN_DEMO_STATES_USER_TEST: RunDemoState[] = [
  'composer',
  'thread',
  'summary',
  /* The follow-up loader is only up for ANSWER_DELAY_MS — too short to review
     without a preset holding it. */
  'asking',
  'report',
]

/**
 * Both functional tests — human and AI. Set it up, or read what it found;
 * nothing in between. The AI one used to be offered the behavioural list, so
 * its dock advertised "No videos yet" and "Analysing", two screens it does not
 * have, on a row nothing was listening to.
 */
export const RUN_DEMO_STATES_FUNCTIONAL: RunDemoState[] = ['composer', 'report']

/**
 * AI behavioural keeps `running` and the two states either side of it. Theirs
 * is a real destination: agents are playing the build, sessions are arriving
 * one at a time, and there is a live one to watch — none of which the row in a
 * list can show.
 */
export const RUN_DEMO_STATES_AI_BEHAVIOURAL: RunDemoState[] = [
  'composer',
  'no-sessions',
  'running',
  'analysing',
  'report',
]

export const RUN_DEMO_LABELS: Record<RunDemoState, string> = {
  composer: 'Composer',
  running: 'Running',
  analysing: 'Analysing',
  'no-sessions': 'No videos yet',
  thread: 'Thread',
  summary: 'Run summary',
  asking: 'Follow-up loading',
  report: 'Report',
}

export const RUN_DEMO_NOTES: Record<RunDemoState, string> = {
  composer: 'Before a run — pick footage, add context, name it.',
  running: 'A run in flight. Normally a 16-second window; this holds it open.',
  analysing:
    'Every agent has stopped and the report is being written — the sessions are all watchable, the report is not there yet.',
  thread: 'The finished run thread, with the answer and the follow-up dock.',
  'no-sessions':
    'A run that has started and recorded nothing yet. Opens on Videos — the tab the first session will arrive in — with the illustrated empty state.',
  summary: 'The run page a finished report opens on — what it found, and how big.',
  asking: 'A follow-up asked and still being answered — the pending answer sheet, held open.',
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
