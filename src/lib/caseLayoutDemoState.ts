/**
 * caseLayoutDemoState — which shape the case-detail modal takes.
 *
 * Two answers to the same question, both worth putting in front of a PM —
 * split is what ships, stacked is the one to compare it against:
 *
 *   stacked — clip on top, Specified beside Observed. The case read top to
 *             bottom, and the shape that survives a narrow window.
 *   split   — clip and specification pinned in a left pane, Observed scrolling
 *             on the right. Every step is a seek control, so clicking step 9
 *             parks the clip on 13:52 with the frame still on screen.
 *
 * Split needs about 1100px to hold three columns beside the rail; under that
 * the modal falls back to stacked on its own, so this row is a preference, not
 * a guarantee.
 *
 * Review chrome, not product.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'
import type { CaseModalLayout } from '../components/organisms/TestCaseDetailModal'

export type CaseLayoutDemoState = CaseModalLayout

export const CASE_LAYOUT_DEMO_STATES: CaseLayoutDemoState[] = ['stacked', 'split']

export const CASE_LAYOUT_DEMO_LABELS: Record<CaseLayoutDemoState, string> = {
  stacked: 'Clip on top',
  split: 'Clip beside steps',
}

export const CASE_LAYOUT_DEMO_NOTES: Record<CaseLayoutDemoState, string> = {
  stacked: 'Clip above a Specified | Observed comparison — the case read top to bottom.',
  split: 'Clip and specification pinned left, steps scrolling right. Click a step to park the clip on it.',
}

// ─── Store ───────────────────────────────────────────────────────────────────

/* Split is the shipped default: the clip stays beside the steps, so a step
   clicked deep in a long case still has its frame on screen. Stacked stays in
   the dock as the comparison, and the modal falls back to it on its own under
   ~1100px. */
let current: CaseLayoutDemoState = 'split'
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setCaseLayoutDemoState(next: CaseLayoutDemoState): void {
  if (next === current) return
  current = next
  listeners.forEach((fn) => fn())
}

export const getCaseLayoutDemoState = (): CaseLayoutDemoState => current

export function useCaseLayoutDemoState(): CaseLayoutDemoState {
  return useSyncExternalStore(subscribe, getCaseLayoutDemoState, getCaseLayoutDemoState)
}
