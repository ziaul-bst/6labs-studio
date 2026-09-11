/**
 * screenDemoStates — option lists for the state machine dock rows whose state
 * already lives in HomePage.
 *
 * Oracle's threads and Radiologist's sub-view are HomePage state, so unlike the
 * library / history / connectors fixtures these need no store of their own — the
 * dock row calls the setters HomePage already has. Only the labels and the notes
 * live here, to keep HomePage from growing another block of copy.
 *
 * Review chrome, not product.
 *
 * Code-first prototype — no Figma source yet.
 */

// ── Oracle ────────────────────────────────────────────────────────────────────

export type OracleDemoState = 'seeded' | 'first-run' | 'thread' | 'thinking'

export const ORACLE_DEMO_STATES: OracleDemoState[] = ['seeded', 'first-run', 'thread', 'thinking']

export const ORACLE_DEMO_LABELS: Record<OracleDemoState, string> = {
  seeded: 'Seeded',
  'first-run': 'First run',
  thread: 'Answered',
  thinking: 'Thinking',
}

export const ORACLE_DEMO_NOTES: Record<OracleDemoState, string> = {
  seeded: 'Four past queries in the sidebar, launcher on screen — the default.',
  'first-run': 'A brand-new workspace: no history at all, so the sidebar section disappears too.',
  thread: 'An answered thread open, with citations, sources and related prompts.',
  thinking: 'Mid-response: the question is in, the answer is still resolving.',
}

/** The seeded thread the "Answered" state opens — first entry of DEFAULT_ORACLE_HISTORY. */
export const ORACLE_DEMO_THREAD_ID = 'h2'

// ── Radiologist ───────────────────────────────────────────────────────────────

/*
 * No "no results" state here on purpose: the results list filters on the
 * FilterDialog facets, not on the search text, so an empty gallery is already
 * one dialog away by hand — and faking it would mean plumbing a filter
 * override through two components to reach a screen a reviewer can just click.
 */
export type RadiologistDemoState = 'home' | 'results' | 'panel' | 'details'

export const RADIOLOGIST_DEMO_STATES: RadiologistDemoState[] = [
  'home',
  'results',
  'panel',
  'details',
]

export const RADIOLOGIST_DEMO_LABELS: Record<RadiologistDemoState, string> = {
  home: 'Search',
  results: 'Results',
  panel: 'Side panel',
  details: 'Details',
}

export const RADIOLOGIST_DEMO_NOTES: Record<RadiologistDemoState, string> = {
  home: 'The query launcher, before any search.',
  results: 'The session gallery for the last query.',
  panel: 'Results with a session open in the side panel.',
  details: 'The full session details page, one level in from results.',
}
