/**
 * recordingDemoState — review chrome for the shape of the footage.
 *
 * Every 6labs recording is a phone screen capture, so PORTRAIT is the product
 * default and what the wells are built for. Landscape is real but rare — a
 * tablet build, an emulator run rotated — and a reviewer cannot reach it by
 * clicking, because it is a property of the device that produced the file.
 *
 * So it is switchable from the StateMachineDock, next to the plan preset, on
 * every screen that shows a recording. This is chrome, not product: it sets
 * `AgentSession.orientation` on the fixtures and nothing else reads it.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'
import type { RecordingOrientation } from './types/testing'

export const RECORDING_DEMO_STATES: RecordingOrientation[] = ['portrait', 'landscape']

export const RECORDING_DEMO_LABELS: Record<RecordingOrientation, string> = {
  portrait: 'Portrait',
  landscape: 'Landscape',
}

export const RECORDING_DEMO_NOTES: Record<RecordingOrientation, string> = {
  portrait:
    'A phone capture — what every 6labs recording actually is. The frame narrows to the footage and the reading beside it takes the width that is left.',
  landscape:
    'A tablet or a rotated emulator run. The frame takes the width and the reading holds its 380px column.',
}

// ─── Store ───────────────────────────────────────────────────────────────────
/* Module-level rather than props, for the same reason libraryDemoState is: the
   session viewer mounts three levels down and review chrome has no business on
   a product component's prop API. */

let current: RecordingOrientation = 'portrait'
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setRecordingDemoState(next: RecordingOrientation): void {
  if (next === current) return
  current = next
  listeners.forEach((fn) => fn())
}

/** Read outside React (fixtures, event handlers). */
export const getRecordingDemoState = (): RecordingOrientation => current

/** Subscribe from a component — re-renders on every switch. */
export function useRecordingDemoState(): RecordingOrientation {
  return useSyncExternalStore(subscribe, getRecordingDemoState, getRecordingDemoState)
}
