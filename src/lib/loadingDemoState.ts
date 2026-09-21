/**
 * loadingDemoState — "show me this screen's loading state", for the dock.
 *
 * It is a row of its own rather than another value on the Run row, and that
 * distinction is the whole point. The Run row is a set of *destinations*:
 * Composer, Queued, Run page, Report are four different screens, and picking
 * one is a request to go there. Loading is not a destination — it is a phase
 * every screen passes through, including the ones the Run row cannot reach.
 *
 * Folded into the Run row it behaved accordingly and wrongly: choosing it from
 * inside a report threw the reader back to the composer's skeleton, because
 * the only screen listening for it was the composer. A reviewer asking "what
 * does the report look like while it loads" got a different screen entirely.
 *
 * So: a cross-cutting switch. Whatever screen is in view renders its own
 * skeleton and stays put. Every screen owns its skeleton — the shape it is
 * about to be, not a shared grey rectangle — and the switch simply pins it.
 *
 * What it does NOT cover: a wait with an agent behind it. A run that is queued,
 * playing or being analysed has something to say about itself and says it in
 * words; a skeleton there would claim the page is still arriving when what is
 * actually happening is that 6labs is working. Those states live on the Run
 * row, where they are destinations.
 *
 * Review chrome, not product.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'

export type LoadingDemoState = 'loaded' | 'loading'

export const LOADING_DEMO_STATES: LoadingDemoState[] = ['loaded', 'loading']

export const LOADING_DEMO_LABELS: Record<LoadingDemoState, string> = {
  loaded: 'Loaded',
  loading: 'Skeleton',
}

export const LOADING_DEMO_NOTES: Record<LoadingDemoState, string> = {
  loaded: 'The screen with its data. Each one still plays its own short skeleton on arrival.',
  loading:
    'Holds the screen you are on in its loading state — the finished layout with its facts missing. It does not navigate.',
}

let current: LoadingDemoState = 'loaded'
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setLoadingDemoState(next: LoadingDemoState): void {
  if (next === current) return
  current = next
  listeners.forEach((fn) => fn())
}

export const getLoadingDemoState = (): LoadingDemoState => current

export function useLoadingDemoState(): LoadingDemoState {
  return useSyncExternalStore(subscribe, getLoadingDemoState, getLoadingDemoState)
}
