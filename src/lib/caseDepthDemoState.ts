/**
 * caseDepthDemoState — how much prose a functional report's cases carry.
 *
 * The default fixture is a tidy suite: one-line reasons, one or two steps. Real
 * regression files are not that, and the screens that break are the ones where
 * a case is a paragraph of setup and eleven steps — a row whose reason wraps to
 * five lines, an Observed card three times the height of its Expected.
 *
 * So this is a review row rather than a product state: it swaps the whole case
 * set (and its totals) for the deep one, so a reviewer can see the report and
 * the case-detail modal at length without hunting for a run that happens to
 * have one.
 *
 * Review chrome, not product.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'
import { VERIFIED_CASES, VERIFICATION_TOTALS } from './mocks/verified-cases'
import { TEXT_HEAVY_CASES, TEXT_HEAVY_TOTALS } from './mocks/verified-cases-heavy'
import type { VerifiedCase, VerificationTotals } from './types/testing'

export type CaseDepthDemoState = 'standard' | 'deep'

export const CASE_DEPTH_DEMO_STATES: CaseDepthDemoState[] = ['standard', 'deep']

export const CASE_DEPTH_DEMO_LABELS: Record<CaseDepthDemoState, string> = {
  standard: 'Standard cases',
  deep: 'Text-heavy cases',
}

export const CASE_DEPTH_DEMO_NOTES: Record<CaseDepthDemoState, string> = {
  standard: 'One-line reasons, one or two steps — the tidy suite.',
  deep: 'Payments and account cases: paragraph preconditions, up to eleven steps.',
}

export const CASE_DEPTH_FIXTURES: Record<
  CaseDepthDemoState,
  { cases: VerifiedCase[]; totals: VerificationTotals }
> = {
  standard: { cases: VERIFIED_CASES, totals: VERIFICATION_TOTALS },
  deep: { cases: TEXT_HEAVY_CASES, totals: TEXT_HEAVY_TOTALS },
}

// ─── Store ───────────────────────────────────────────────────────────────────

let current: CaseDepthDemoState = 'standard'
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setCaseDepthDemoState(next: CaseDepthDemoState): void {
  if (next === current) return
  current = next
  listeners.forEach((fn) => fn())
}

export const getCaseDepthDemoState = (): CaseDepthDemoState => current

export function useCaseDepthDemoState(): CaseDepthDemoState {
  return useSyncExternalStore(subscribe, getCaseDepthDemoState, getCaseDepthDemoState)
}
