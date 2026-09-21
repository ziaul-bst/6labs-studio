/**
 * sessionTextDemoState — how much an agent wrote about a screen.
 *
 * The session viewer's right-hand column holds the agent's own account of the
 * screen it is on: what it saw, why it did what it did, what happened. That
 * text is the one thing on the screen whose length is not bounded — a routine
 * tap gets a sentence, a screen the agent refuses to act on gets five
 * paragraphs of reasoning about why. The seeded fixtures are mostly the short
 * kind, so the column was only ever reviewed at its easiest.
 *
 * This holds the hard case open: every screen in the session carries the long
 * form, so the fold, the scroll inside the panel, and the 72ch measure can all
 * be looked at without hunting for the one screen that happens to be wordy.
 *
 * Review chrome, not product — it lengthens the fixture and nothing else.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'
import type { AgentStep } from './types/testing'

export type SessionTextDemoState = 'standard' | 'long'

export const SESSION_TEXT_DEMO_STATES: SessionTextDemoState[] = ['standard', 'long']

export const SESSION_TEXT_DEMO_LABELS: Record<SessionTextDemoState, string> = {
  standard: 'Standard',
  long: 'Long reasoning',
}

export const SESSION_TEXT_DEMO_NOTES: Record<SessionTextDemoState, string> = {
  standard: 'The seeded account — a sentence or two per screen.',
  long: 'Every screen written at length: the panel scrolls inside itself, the reasoning folds, and the frame beside it does not move.',
}

/* A real refusal, which is where an agent writes most: it has to say what it
   saw, which instruction it is honouring, what it considered and rejected, and
   what it will do once a human clears the way. */
const LONG_SAW =
  'A Tips dialog over the loading screen: “To ensure the security of your account and character, please create your character on the mobile version first before logging in.” Two buttons — Change Account and Quit. The dialog is modal: the loading screen behind it is still at 40%, the progress bar has not moved in eleven seconds, and neither button dismisses without a decision. Nothing else on the screen is interactive.'

const LONG_REASONING =
  '“I was set to play Whiteout Survival for a couple of minutes as this persona. The game launched, but a Tips screen has come up that wants either a character created or the account changed, and the executor is stuck behind it. My instructions on this are not ambiguous: I am not to touch account creation, login, or anything credential-related without explicit permission, and this screen is asking for exactly that. The persona’s goal for this session is to explore, which is the priority, and a retry is technically available — but a retry here would be a retry against an account wall, and this is the most sensitive area in the playbook. The screen is asking for a user-only action. So the only move left is to hand it back. I request a takeover, name what is blocking, and say what I will do once it is cleared: resume from the loading screen, take the tutorial in order, and keep the session’s remaining time for the event the brief actually asked about.”'

const LONG_OBSERVED = 'Observed 5000 ms · waiting on the user, session clock paused'

/** Rewrites a session's steps in the long form. Identity at 'standard'. */
export function applySessionTextState(steps: AgentStep[], state: SessionTextDemoState): AgentStep[] {
  if (state === 'standard') return steps
  return steps.map((s) => ({
    ...s,
    saw: LONG_SAW,
    reasoning: LONG_REASONING,
    observed: LONG_OBSERVED,
  }))
}

let current: SessionTextDemoState = 'standard'
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setSessionTextDemoState(next: SessionTextDemoState): void {
  if (next === current) return
  current = next
  listeners.forEach((fn) => fn())
}

export const getSessionTextDemoState = (): SessionTextDemoState => current

export function useSessionTextDemoState(): SessionTextDemoState {
  return useSyncExternalStore(subscribe, getSessionTextDemoState, getSessionTextDemoState)
}
