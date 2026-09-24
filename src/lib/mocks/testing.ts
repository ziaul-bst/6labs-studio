/**
 * Testing fixtures — the runs, cases, builds and personas behind the test
 * screens. Numbers match the artifact (`user-test-agent-flow-v80.html`) so a
 * reviewer comparing prototype and studio sees the same batch everywhere.
 */

import type {
  AgentSession,
  AgentStep,
  AIBehaviouralRunMeta,
  BuildOption,
  Persona,
  TestCaseFile,
  TestRunHistoryItem,
} from '../types/testing'
import type { UserTestIssue } from '../types/userTest'
import { USER_TEST_ISSUES } from './user-test'

// ── Run history per test ──────────────────────────────────────────────────────

export const USER_TEST_HISTORY: TestRunHistoryItem[] = [
  /* User Test's history holds both kinds. A question keeps the thread it was
     asked in, so its row counts the follow-ups rather than issues.
     Each fact appears once: the library tag lives in `meta` (the "Tag"
     column), the game-context flow is the run's name, and `detail` holds only
     what went in. */
  { id: 'ut-q-onboarding', kind: 'question', name: 'Which testers quit before finishing onboarding, and what were they doing right before?', detail: '6 sessions · 3 follow-ups', meta: 'Build V2.2', tags: ['Build V2.2'], state: 'done', when: 'Sep 8' },
  /* Picked from three tags — the row the Tag column has to survive. */
  { id: 'ut-v22', name: 'Onboarding flow v3', detail: '10 sessions', meta: 'Build V2.2, Tutorial, Last 24h', tags: ['Build V2.2', 'Tutorial', 'Last 24h'], state: 'done', result: { kind: 'issues', count: 7 }, when: 'Sep 7' },
  { id: 'ut-v21', name: 'Onboarding flow v3', detail: '10 sessions', meta: 'Build V2.1', tags: ['Build V2.1'], state: 'done', result: { kind: 'issues', count: 7 }, when: 'Aug 26' },
  { id: 'ut-alliance', name: 'Alliance join — pilot', detail: '5 sessions · no game context', meta: 'Alliance, New event', tags: ['Alliance', 'New event'], state: 'done', result: { kind: 'issues', count: 3 }, when: 'Aug 19' },
]

export const FUNCTIONAL_HISTORY: TestRunHistoryItem[] = [
  { id: 'ft-v22', name: 'Tutorial regression', detail: '8 sessions · regression-suite.xlsx', meta: 'Build V2.2, Tutorial', tags: ['Build V2.2', 'Tutorial'], caseFiles: [{ name: 'regression-suite.xlsx', meta: '48 cases', href: '#/files/regression-suite.xlsx' }], state: 'done', result: { kind: 'counts', passed: 42, failed: 3, review: 2, blocked: 1 }, when: 'Sep 5' },
  { id: 'ft-agency', name: 'Agency batch — Digital Hearts', detail: '24 sessions · agency-cases-aug.xlsx', meta: 'CBT', tags: ['CBT'], caseFiles: [{ name: 'agency-cases-aug.xlsx', meta: '131 cases', href: '#/files/agency-cases-aug.xlsx' }], state: 'done', result: { kind: 'counts', passed: 118, failed: 9, review: 4, blocked: 2 }, when: 'Sep 2', withUx: true },
]

export const AI_FUNCTIONAL_HISTORY: TestRunHistoryItem[] = [
  { id: 'aif-s9', name: 'Season 9 — core loop', detail: '24 cases · FreeFire-PRD-s9-cases.xlsx', meta: 'v2.3.1', caseFiles: [{ name: 'FreeFire-PRD-s9-cases.xlsx', meta: '24 cases', href: '#/files/FreeFire-PRD-s9-cases.xlsx' }], state: 'done', result: { kind: 'counts', passed: 19, failed: 2, review: 3, blocked: 1 }, when: 'Aug 29' },
  { id: 'aif-bp', name: 'Battle Pass v2 — store', detail: '5 cases · BattlePass-cases-v2.csv', meta: '—', caseFiles: [{ name: 'BattlePass-cases-v2.csv', meta: '5 cases', href: '#/files/BattlePass-cases-v2.csv' }], state: 'never', when: 'Aug 28' },
]

export const AI_BEHAVIOURAL_HISTORY: TestRunHistoryItem[] = [
  /* Personas ride in `tags`, not in `meta`: a run with four of them used to
     truncate mid-name in a 184px column ("New player ×12, Wha…"), which is the
     one thing the Personas column exists to say. Pills clamp to the row and
     put what will not fit on a "+N", the same way every other history table's
     tag column does — `meta` is kept as the plain-text fallback. */
  { id: 'aib-frost', name: 'Frost Festival', detail: '20 sessions · 30 min · v2.3.1', meta: 'New player ×12, Whale ×8', tags: ['New player ×12', 'Whale ×8'], state: 'done', result: { kind: 'issues', count: 9 }, when: 'Sep 6' },
  { id: 'aib-onb', name: 'Onboarding', detail: '10 sessions · 15 min · v2.3.0', meta: 'New player ×10', tags: ['New player ×10'], state: 'done', result: { kind: 'issues', count: 6 }, when: 'Aug 30' },
  { id: 'aib-smoke', name: 'Store smoke check', detail: '1 session · 10 min · v2.3.2', meta: 'Generic ×1', tags: ['Generic ×1'], state: 'done', result: { kind: 'issues', count: 2 }, when: 'Sep 8' },
  /* Four personas — the row the clamped Personas column has to survive. */
  { id: 'aib-season', name: 'Season 9 — full sweep', detail: '32 sessions · 60 min · v2.3.1', meta: 'Generic ×8, New player ×8, Core ×8, Whale ×8', tags: ['Generic ×8', 'New player ×8', 'Core ×8', 'Whale ×8'], state: 'done', result: { kind: 'issues', count: 14 }, when: 'Sep 4' },
]

// ── Functional report ─────────────────────────────────────────────────────────


/** Sample test-case files the upload zones resolve to (prototype only). */
/* Size and date, not a case count. Nothing has parsed the sheet at the moment
   it is attached, so the count the row used to print was invented — and the
   report's Coverage meter is the place that number belongs, denominated and
   explained. What the composer can honestly say about a file it has just
   received is how big it is and when it arrived. */
export const SAMPLE_TEST_CASE_FILES: TestCaseFile[] = [
  { name: 'regression-suite.xlsx', meta: '182 KB · Sep 12', href: '#/files/regression-suite.xlsx' },
  { name: 'FreeFire-PRD-s9-cases.xlsx', meta: '96 KB · Sep 9', href: '#/files/FreeFire-PRD-s9-cases.xlsx' },
  { name: 'checkout-flow-cases.csv', meta: '14 KB · Sep 4', href: '#/files/checkout-flow-cases.csv' },
  { name: 'alliance-rally-cases.csv', meta: '11 KB · Aug 28', href: '#/files/alliance-rally-cases.csv' },
  { name: 'settings-smoke.csv', meta: '7 KB · Aug 21', href: '#/files/settings-smoke.csv' },
]

/**
 * What a case file has to contain for 6labs to verify anything, and a sheet in
 * that shape to start from.
 *
 * The three required columns are not house style: a verdict is the comparison
 * of an expected result against footage, taken from the state the precondition
 * names, and a sheet missing any of them produces cases the run can only mark
 * Not verified. Saying so on the upload zone is cheaper than saying it in the
 * report.
 *
 * TODO: point `href` at the real sample sheet once it is shared (dev call,
 * 2026-09-16) — the link is deliberately here and wired now so the copy around
 * it does not have to change later.
 */
export const SAMPLE_TEST_CASE_SHEET = {
  href: '#/sample-test-case-sheet.xlsx',
  label: 'See a sample sheet',
  /* Order is the brief's (2026-09-23): a reader follows Precondition → Steps →
     Expected result, which is also the order the columns sit in the sheet. */
  required: ['Precondition', 'Steps', 'Expected result'],
}

// ── Builds and personas (AI tests) ────────────────────────────────────────────

export const BUILDS: BuildOption[] = [
  { id: 'v2.3.1', version: 'v2.3.1', meta: 'uploaded Aug 29 · newest' },
  { id: 'v2.3.0', version: 'v2.3.0', meta: 'uploaded Aug 22' },
  { id: 'v2.2.9', version: 'v2.2.9', meta: 'uploaded Aug 14' },
]

/**
 * The personas a run can be played by.
 *
 * Two texts per persona, and they are not the same text shortened. The
 * `detail` is a qualifier written for the SET — six words, leading with what
 * makes this one different from the one above it, so a column of them can be
 * scanned rather than read. The `description` is the player model's own
 * sentence about that persona, read one at a time when you are deciding
 * between two of them.
 *
 * The model's sentences share a template — "<adjective> player who <verb>s
 * <object>" — which is fine in isolation and useless in a list: the first four
 * words of every one of them are the same, so the eye has to get past the
 * boilerplate twelve times to find the word that differs. That is the whole
 * reason the picker separates the two texts instead of stacking a sentence
 * under every name.
 */
export const PERSONAS: Persona[] = [
  /* First, and deliberately not a persona: a run that just wants the build
     played needs an option that says so, rather than a "New player" whose
     behaviour it did not ask for and cannot tell apart from the real thing. */
  {
    id: 'generic',
    label: 'Generic',
    detail: 'no persona — plays the build as-is',
    description:
      'No behavioural model. Plays the build the way the build asks to be played, so the run reports the product rather than a player type.',
  },
  {
    id: 'new-player',
    label: 'New player',
    detail: 'day 0–3',
    description:
      'First session, no prior knowledge of the game. Follows whatever the tutorial highlights and gives up quickly when a screen does not say what to do next.',
  },
  {
    id: 'core',
    label: 'Core',
    detail: 'day 7–30',
    description:
      'Knows the loop and chases progression. Skips tutorials, goes straight for the highest-value action on screen, and notices when a reward curve changes.',
  },
  {
    id: 'whale',
    label: 'Whale',
    detail: 'top 2% spend',
    description:
      'Optimises for power and buys early. Opens the store from anywhere it is offered and treats a blocked purchase path as the thing worth reporting.',
  },
  {
    id: 'lapsed',
    label: 'Lapsed',
    detail: 'returning after 14d',
    description:
      'Coming back after two weeks away. Re-learns the loop from the UI rather than from memory, and is the first to hit anything that changed while they were gone.',
  },
  {
    id: 'competitive',
    label: 'Competitive',
    detail: 'PvP-first, rally-heavy',
    description:
      'Grinds leaderboards and competitive content aggressively. Prioritises anything ranked, and reads any queue or matchmaking delay as a fault.',
  },
  {
    id: 'casual',
    label: 'Casual',
    detail: 'short sessions, no spend',
    description:
      'Plays in short bursts without competitive pressure and never opens the store. Leaves the moment a session asks for more time than it promised.',
  },
  {
    id: 'explorer',
    label: 'Explorer',
    detail: 'opens every screen',
    description:
      'Relaxed and story-focused, explores side content for its own sake. Reaches screens a goal-directed player never sees, which is where unfinished UI turns up.',
  },
  {
    id: 'collector',
    label: 'Collector',
    detail: 'completes item sets',
    description:
      'Collection-driven: completes item sets and pursues rare rewards. Spends the session in inventory, crafting and reward screens rather than in the main loop.',
  },
  {
    id: 'completionist',
    label: 'Completionist',
    detail: 'chases 100%',
    description:
      'Pursues total content completion relentlessly. Will re-enter a finished chapter to clear the last objective, so it finds content that cannot be completed.',
  },
  {
    id: 'event-chaser',
    label: 'Event chaser',
    detail: 'limited-time content only',
    description:
      'Spikes engagement for limited-time content and rewards. Enters through the event banner and ignores everything the event does not lead to.',
  },
  {
    id: 'farm-specialist',
    label: 'Farm specialist',
    detail: 'repeats resource loops',
    description:
      'Efficiency-obsessed: repeatedly farms the optimal resource loop. Runs the same few screens hundreds of times, which is where a rate or a cap goes wrong.',
  },
  {
    id: 'min-maxer',
    label: 'Min-maxer',
    detail: 'optimal builds only',
    description:
      'Strategic optimiser pursuing mathematically optimal builds and resource paths. Compares numbers across screens and reports any that disagree.',
  },
  {
    id: 'occasional',
    label: 'Occasional player',
    detail: 'one session a week',
    description:
      'Returns about once a week and plays for a few minutes. Never accumulates enough context to be carried by habit, so the UI has to re-orient them every time.',
  },
]

// ── Run thread ────────────────────────────────────────────────────────────────

/** Tester sessions in the analysed batch, in the order the agent reads them. */
export const THREAD_SESSIONS = [
  'T01 · Pixel 7', 'T02 · iPhone 13', 'T03 · Pixel 7', 'T04 · iPhone 13', 'T05 · iPhone 13',
  'T06 · Galaxy S23', 'T07 · Pixel 7', 'T08 · Galaxy S23', 'T09 · Pixel 7', 'T10 · Galaxy S23',
]

/** Interim notes the agent posts while it is still reading — keyed by sessions done. */
export const THREAD_SO_FAR: Record<number, { title: string; body: string }> = {
  2: { title: 'So far (2 of 10)', body: 'Both testers tapped “Upgrade Furnace” 3+ times before it responded — watching for this in the rest.' },
  4: { title: 'So far (4 of 10)', body: 'Furnace tap issue in 3 of 4. One tester quit at Chapter 1 end with two dialogs open.' },
  6: { title: 'So far (6 of 10)', body: 'Furnace tap issue now in 5 of 6 — this is the headline. Two more quits, both on Galaxy S23.' },
  8: { title: 'So far (8 of 10)', body: 'Six issues so far. No new patterns in the last two — finishing up.' },
}

/** Prompts offered on the User Test home in "Ask questions" mode. */
export const USER_TEST_HOME_PROMPTS = [
  'Where did testers hesitate the longest, and on which screen?',
  'Which testers quit before finishing onboarding, and what were they doing right before?',
  'Did anyone tap a button repeatedly with no response? Show me the moments.',
  'Which game step lost the most time across all testers?',
]

// ── AI behavioural — sessions, screens and the findings they feed ─────────────

/** One line on who the persona is — shown wherever a session names its player. */
export const PERSONA_DETAIL: Record<string, string> = {
  Generic: 'No persona · plays the build as-is',
  'New player': 'Day 0–3 · first session, no prior knowledge',
  Whale: 'Top 2% spend · optimises for power, buys early',
  Core: 'Day 7–30 · knows the loop, chases progression',
  Lapsed: 'Returning after 14 days · re-learning',
  Competitive: 'PvP-first, rally-heavy',
  Casual: 'Short sessions, no spend',
  Explorer: 'Opens every screen',
}

/** Accent per persona — the one colour a session card carries. */
export const PERSONA_TONE: Record<string, string> = {
  /* Neutral on purpose — Generic is the absence of a persona, so it does not
     take a colour that would read as one more player type beside the others. */
  Generic: 'var(--text-tertiary)',
  'New player': 'var(--success)',
  Whale: 'var(--purple)',
  Core: 'var(--brand)',
  Lapsed: 'var(--testing-teal)',
  Competitive: 'var(--error)',
  Casual: 'var(--warning)',
  Explorer: 'var(--testing-emerald)',
}

const SCENE_HUES = ['#3f5f92', '#345381', '#2f4a75', '#3a5a8c', '#4a6a9a', '#3f5f92', '#2f4a75', '#5a4a8a', '#4a4a9a', '#5a3f8a', '#3f5f92', '#345381']
const scene = (i: number) =>
  `radial-gradient(120% 80% at 30% 70%, ${SCENE_HUES[i % SCENE_HUES.length]} 0%, #2f4a75 60%, #1f2c55 100%)`

/**
 * The same stand-in frame, for surfaces outside a run that still have to show
 * what a recording looks like — the locked pitch's evidence stack. Exported so
 * sample footage everywhere is the same footage.
 */
export const sceneGradient = scene

/**
 * A skill file, as a player actually loads one. Nobody reads this — it is here
 * because the panel has to survive it: four thousand monospaced characters
 * arriving under a one-line action, which is what a real session put there.
 */
const WHITEOUT_SKILL = `# Whiteout Survival Game Agent Skill

You are an expert Whiteout Survival player controlling the game on a mobile
device. The game package name is \`com.gof.global\`. Your goal is to play the
game efficiently, making smart decisions based on what you see on screen.

## 0. Skill File Scope

This file covers game mechanics, navigation, visual identification, and
conservative default behaviour for playing Whiteout Survival. It describes what
is available, how to navigate, and what is typically efficient — not a rigid
prescription for every session.

**Absolute rules — always apply regardless of session goals:**

- Real-money in-app purchases are BLOCKED BY DEFAULT: do NOT open, confirm, or
  complete a payment/checkout dialog. The ONLY exception is when the current
  sub-task's \`constraints\` or behavioural directives EXPLICITLY authorise
  real-money spending — specifically the verbatim permission "Real-money in-app
  purchases are explicitly authorized for this sub-task (high-spend persona)";
  in that case a real-money purchase that gives clear value is permitted.
  Absent that explicit authorisation, treat any real-money purchase as
  requiring explicit user action and do not initiate it.
- Never attack other players, join rallies, send messages, leave or modify the
  alliance, use teleporter items (Random/Advanced/Alliance Teleporter that
  relocate the city on the world map), or dismiss troops without explicit user
  permission. This does not apply to in-event teleport mechanics that are part
  of an event mode (for example, the "Teleport to center" action in Frostfire
  Mine).

All other guidance reflects cautious defaults. Spending, retry, and exploration
decisions should be guided by the current session's goals and play style.

## 1. Game Launch and Pop-Up Handling

### 1.1 Launching the Game

- ALWAYS use LaunchApp with packageName \`com.gof.global\`
- The game takes 10-20 seconds to fully load; expect loading screens with
  progress bars
- Wait until the main city view appears before taking any action
- **First-time login**: you may encounter a server selection screen or
  guest/social login options
  - If server selection appears, ask the user which server to join before
    proceeding
  - Ask the user before creating a character, linking an account, or changing
    accounts. These are credential actions and are never yours to take.

### 1.2 Pop-Ups on Entry

Expect two to five pop-ups on entering the city. Close them from the top of the
stack down. A pop-up that asks for an account action is not a pop-up to close —
it is a stop.
`

/**
 * The screens a session walks through — the same script for every agent so a
 * reviewer can compare sessions, with flags that vary per agent (see
 * `buildAgentSessions`). Flags point at the issues the report lists.
 *
 * Two of these screens are here because of their LENGTH rather than their
 * content: the skill load carries four thousand characters of payload, and the
 * account wall carries the kind of reasoning a model writes when it has hit
 * something it is not allowed to do. Both came off real sessions. A screen
 * script made only of one-line steps is a script that never tests the panel.
 */
export const AI_BEHAVIOURAL_STEPS: AgentStep[] = [
  { screen: 'Splash', saw: 'Splash screen with the game logo and a loading bar at 40%.', reasoning: 'Nothing to do until the load completes — a Play button should appear.', action: 'Tap Play', observed: 'Observed 5000 ms · sign-in dialog appeared', atSec: 0, scene: scene(0) },
  { screen: 'Launch Whiteout Survival › Load skill', saw: 'The device home screen, with Whiteout Survival on the second row.', reasoning: 'Before launching I load the game-specific skill so the rest of the session reads the screens in the game’s own vocabulary rather than guessing at them.', action: 'Loading Whiteout Survival skill for game-specific knowledge.', payload: { label: 'Whiteout Survival Game Agent skill', body: WHITEOUT_SKILL }, observed: 'Observed 5000 ms · skill loaded', atSec: 6, scene: scene(1) },
  { screen: 'Sign-in', saw: 'Sign-in dialog: email and password fields, and a Continue as guest option.', reasoning: 'The brief gives a test account, so sign in rather than continue as a guest.', action: 'Enter credentials, tap Sign in', observed: 'Observed 5000 ms · World Map loaded with the tutorial pointer', atSec: 12, scene: scene(2) },
  {
    screen: 'Play Whiteout Survival › Requesting takeover',
    saw: 'A Tips dialog over the loading screen: "To ensure the security of your account and character, please create your character on the mobile version first before logging in." Two buttons — Change Account and Quit.',
    reasoning:
      'I was set to play Whiteout Survival for a couple of minutes as this persona. The game launched, but a Tips screen has come up that wants either a character created or the account changed, and the executor is stuck behind it.\n\nMy instructions on this are not ambiguous: I am not to touch account creation, login, or anything credential-related without explicit permission, and this screen is asking for exactly that. The persona’s goal for this session is to explore, which is the priority, and a retry is technically available — but a retry here would be a retry against an account wall, and this is the most sensitive area in the playbook. The screen is asking for a user-only action.\n\nSo the only move left is to hand it back. I request a takeover, name what is blocking, and say what I will do once it is cleared: resume from the loading screen, take the tutorial in order, and keep the session’s remaining time for the event the brief actually asked about.',
    action: 'Blocked by the account/character creation screen. Please handle the login or character creation to continue.',
    observed: 'Observed 5000 ms · waiting on the user',
    atSec: 28,
    scene: scene(3),
  },
  { screen: 'Tutorial › Furnace', saw: 'Tutorial overlay; a pointer highlights the Upgrade Furnace button.', reasoning: 'As a first-time player I follow the highlighted action.', action: 'Tap Upgrade Furnace', observed: 'Observed 5000 ms · no change on screen', atSec: 41, scene: scene(2), flag: { kind: 'bug', issueId: 'furnace', note: 'No response to the first tap — hint overlay may be intercepting' } },
  { screen: 'Tutorial › Furnace', saw: 'Same screen — the hint is still up and the button has not changed state.', reasoning: 'The tap may have been swallowed by the overlay; retry before treating it as a blocker.', action: 'Tap Upgrade Furnace (retry ×3)', observed: 'Observed 5000 ms · upgrade animation played', atSec: 58, scene: scene(3), flag: { kind: 'bug', issueId: 'furnace', note: '3 taps, 17s lost before the upgrade went through' } },
  { screen: 'Tutorial › Hero screen', saw: 'Furnace upgraded; the tutorial advanced to the Hero screen with a Continue prompt.', reasoning: 'Keep following the tutorial.', action: 'Tap Continue', observed: 'Observed 5000 ms · hero roster visible', atSec: 84, scene: scene(4) },
  { screen: 'Tutorial › Hero screen', saw: 'Hero roster; a Recruit button in the same colour as the active ones, with a small padlock.', reasoning: 'A new player would try Recruit once to see what it does.', action: 'Tap Recruit', observed: 'Observed 5000 ms · no feedback', atSec: 110, scene: scene(5), flag: { kind: 'friction', issueId: 'hero-recruit', note: 'Locked button gave no feedback — tapped twice' } },
  { screen: 'World Map', saw: 'Still the hero roster; nothing changed after two taps.', reasoning: 'The button is locked with no feedback — note it and move on to the map.', action: 'Open World Map', observed: 'Observed 5000 ms · World Map with a Frost Festival banner', atSec: 131, scene: scene(6) },
  { screen: 'Event › Frost Festival', saw: 'World Map with a Frost Festival banner top-right.', reasoning: 'The brief says to focus on Frost Festival — enter the event.', action: 'Tap Frost Festival', observed: 'Observed 5000 ms · event screen with rules', atSec: 162, scene: scene(7) },
  { screen: 'Event › Frost Festival', saw: 'Event screen: banner above the fold, rules text below it, a Start button.', reasoning: 'A new player skims the rules once and starts.', action: 'Scroll once, tap Start event', observed: 'Observed 5000 ms · stage 1 started', atSec: 190, scene: scene(8) },
  { screen: 'Event › Reward', saw: 'Stage 1 complete; a reward dialog opened on top of the chapter-complete popup.', reasoning: 'Two dialogs are stacked — close the top one to continue.', action: 'Tap Close', observed: 'Observed 5000 ms · dialog still open', atSec: 236, scene: scene(9), flag: { kind: 'bug', issueId: 'daily-reward', note: 'Two dialogs open at once' } },
  { screen: 'Event › Reward', saw: 'The close button sits outside the visible area at this aspect ratio.', reasoning: 'Close is unreachable — try the system back gesture instead.', action: 'Back gesture', observed: 'Observed 5000 ms · both dialogs dismissed', atSec: 258, scene: scene(10), flag: { kind: 'bug', issueId: 'daily-reward', note: 'Close button outside the safe area — recovered with back' } },
  { screen: 'Alliance', saw: 'World Map again; the event suggests joining an alliance.', reasoning: 'Follow the suggestion — Alliance is the next step in the loop.', action: 'Open Alliance', observed: 'Observed 5000 ms · Alliance screen', atSec: 281, scene: scene(11) },
]

/** Two findings only an AI run surfaces — added on top of the shared seven. */
const AI_ONLY_ISSUES: UserTestIssue[] = [
  {
    id: 'bp-path',
    rank: 8,
    kind: 'friction',
    severity: 'disruptive',
    group: 'usability',
    category: 'Friction — monetization',
    title: 'Battle pass upgrade path not reachable from the event screen',
    summary: 'Whale AI players told to try the upgrade looked for it inside Frost Festival and gave up after two screens.',
    detail: 'Every whale session opened the event, scrolled the rules, and backed out to the store — the upgrade lives three taps away with no link from the event it boosts.',
    step: 'Event › Frost Festival',
    status: 'no-baseline',
    confidence: 'high',
    affected: 6,
    totalTesters: 20,
    metric: '2 screens avg before giving up',
    recommendation:
      'Link the upgrade from the event screen it boosts, or surface the pass tier inline on the event reward list.',
    clips: [],
  },
  {
    id: 'rules-text',
    rank: 9,
    kind: 'friction',
    severity: 'cosmetic',
    group: 'usability',
    category: 'Friction — usability',
    title: 'Event rules skipped in under 3 seconds',
    summary: 'New-player AI players scrolled the rules once and started without reading — the text is below the fold.',
    detail: 'Time on the rules screen was 2–3s in every new-player session. Only the banner is above the fold; the rules start below it.',
    step: 'Event › Frost Festival',
    status: 'no-baseline',
    confidence: 'medium',
    affected: 5,
    totalTesters: 20,
    recommendation:
      'Lift the first two rules above the fold, or collapse them into a one-line summary with a "full rules" link.',
    clips: [],
  },
]

/** Meta for the seeded history rows — what every screen of a run repeats. */
export const AI_BEHAVIOURAL_RUN_META: Record<string, AIBehaviouralRunMeta> = {
  'aib-frost': { build: 'v2.3.1', agents: 20, personas: ['New player', 'Whale'], personaCounts: { 'New player': 12, Whale: 8 }, lengthLabel: '30 min', startedLabel: 'Sep 6', finished: 20 },
  'aib-onb': { build: 'v2.3.0', agents: 10, personas: ['New player'], personaCounts: { 'New player': 10 }, lengthLabel: '15 min', startedLabel: 'Aug 30', finished: 10 },
  /* A one-agent smoke run. Kept as a fixture because N=1 is the size every
     count, label and layout in this test has to survive — "1 / 1 agents",
     "sessions played", a one-card grid, a single-row persona split — and it is
     a real way to use the product, not an edge case to be reasoned about. */
  'aib-smoke': { build: 'v2.3.2', agents: 1, personas: ['New player'], personaCounts: { 'New player': 1 }, lengthLabel: '10 min', startedLabel: 'Sep 8', finished: 1 },
  /* The Frost Festival run with three AI players that failed — the "Partly
     failed" dock preset. Spread across both personas and both stages: two
     failed part-way (they have footage up to the stop), one never started (it
     has none). A few red cards among many finished ones, not a block of them. */
  'demo-partial': {
    build: 'v2.3.1',
    agents: 20,
    personas: ['New player', 'Whale'],
    personaCounts: { 'New player': 12, Whale: 8 },
    lengthLabel: '30 min',
    startedLabel: 'Sep 6',
    finished: 20,
    failedIndices: [3, 10, 16],
    neverStartedIndices: [10],
  },
}

export const formatSessionTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

/**
 * The sessions in a run. Deterministic from the run meta so the Videos tab and
 * the report agree: the flags on these steps are the clips the issues cite.
 * While the run is live, the first `finished` sessions are done and the rest
 * are somewhere mid-script — `liveReached` says how far.
 */
/** Which persona the i-th agent plays: the run's own counts when it has them, else an even spread. */
function personaAt(meta: AIBehaviouralRunMeta, i: number): string {
  if (!meta.personaCounts) return meta.personas[i % meta.personas.length]
  let acc = 0
  for (const p of meta.personas) {
    acc += meta.personaCounts[p] ?? 0
    if (i < acc) return p
  }
  return meta.personas[meta.personas.length - 1]
}

export function buildAgentSessions(runId: string, meta: AIBehaviouralRunMeta, liveReached = 6): AgentSession[] {
  return Array.from({ length: meta.agents }, (_, i) => {
    const persona = personaAt(meta, i)
    const done = i < meta.finished
    /* Not every agent hits every flag — that variation is what makes "7 of 20"
       a real count rather than a script. */
    const steps = AI_BEHAVIOURAL_STEPS.map((s) => {
      if (!s.flag) return s
      if (s.flag.issueId === 'hero-recruit' && i % 3 === 1) return { ...s, flag: undefined }
      if (s.flag.issueId === 'daily-reward' && i % 2 === 0) return { ...s, flag: undefined }
      if (s.flag.issueId === 'furnace' && i % 5 === 4) return { ...s, flag: undefined }
      return s
    })
    /* A live session can walk as far as the run has captured — up to every
       screen. Capping it below the last one parked the live viewer on a
       screen it could never leave. */
    const failed = (meta.failedIndices ?? []).includes(i)
    if (failed && (meta.neverStartedIndices ?? []).includes(i)) {
      /* Failed before its first screen: nothing was recorded, so there is
         nothing to show and nothing to open. */
      return {
        id: `${runId}-a${i + 1}`,
        index: i,
        persona,
        personaDetail: PERSONA_DETAIL[persona] ?? '',
        status: 'failed' as const,
        reached: 0,
        steps: [],
        durationLabel: 'Did not start',
        stoppedFraction: 0,
      }
    }
    if (failed) {
      /* Stopped part-way: every screen up to the stop is real and watchable,
         nothing after it exists. Varied per player so three failures do not
         all die on the same screen. */
      const stoppedAt = Math.min(steps.length - 1, 3 + (i % 5))
      const lengthMin = Number(meta.lengthLabel.match(/\d+/)?.[0] ?? 30)
      const stoppedMin = Math.max(1, Math.round((stoppedAt / steps.length) * lengthMin))
      return {
        id: `${runId}-a${i + 1}`,
        index: i,
        persona,
        personaDetail: PERSONA_DETAIL[persona] ?? '',
        status: 'failed' as const,
        reached: stoppedAt,
        /* Cut at the stop, so every count downstream — "Screen 6 of 6", the
           transport's length, "6 screens analysed" — is the session that
           exists. Leaving the script's remaining screens in made the viewer say
           "Screen 6 of 14", as if eight more were coming. */
        steps: steps.slice(0, stoppedAt),
        /* Said against the session's own length — a player that got 4 of 14
           screens into a 30-minute session stopped about 9 minutes in. */
        durationLabel: `Stopped at ${stoppedMin}m`,
        stoppedFraction: stoppedMin / lengthMin,
      }
    }
    const reached = done ? steps.length : Math.min(steps.length, Math.max(1, liveReached + (i % 4) - 1))
    /* A live session knows which screen its agent is on a beat before it has
       the picture of it — the analysis arrives over the wire, the frame after.
       So the newest screen of a live session carries no frame, and the well
       shows what it is waiting for. Stripping it here rather than in the step
       script keeps it a property of being LIVE, which is what it is. */
    const withPendingFrame =
      done || reached < 1
        ? steps
        : steps.map((s, si) => (si === reached - 1 ? { ...s, scene: undefined } : s))
    return {
      id: `${runId}-a${i + 1}`,
      index: i,
      persona,
      personaDetail: PERSONA_DETAIL[persona] ?? '',
      status: done ? 'done' : 'live',
      reached,
      steps: withPendingFrame,
      durationLabel: done ? meta.lengthLabel : `${Math.max(1, Math.round(steps[reached - 1].atSec / 60))}m so far`,
    }
  })
}

/** Screens flagged in a session so far. */
export const flaggedCount = (s: AgentSession) => s.steps.slice(0, s.reached).filter((st) => st.flag).length

/** A report clip that knows which session and screen it came from. */
export interface AgentClipRef {
  sessionId: string
  stepIndex: number
}

/**
 * The run's findings, sized to the batch: `count` issues, each with the
 * sessions that actually flagged it as its clips — so a clip in the report
 * always opens a real moment in a real session. `clipRefs` runs parallel to
 * `clips` and carries the pointer back into the session.
 */
export function buildAgentIssues(
  sessions: AgentSession[],
  count: number,
): Array<UserTestIssue & { clipRefs: AgentClipRef[] }> {
  const n = sessions.length
  return [...USER_TEST_ISSUES, ...AI_ONLY_ISSUES].slice(0, count).map((issue, i) => {
    const hits = sessions.flatMap((s) => {
      const idx = s.steps.slice(0, s.reached).findIndex((st) => st.flag?.issueId === issue.id)
      if (idx < 0) return []
      const st = s.steps[idx]
      const end = s.steps[idx + 1]?.atSec ?? st.atSec + 20
      return [
        {
          clip: {
            tester: `Agent ${s.index + 1}`,
            device: s.persona,
            note: st.flag!.note,
            timeRange: `${formatSessionTime(st.atSec)} – ${formatSessionTime(end)}`,
          },
          ref: { sessionId: s.id, stepIndex: idx },
        },
      ]
    })
    const affected = hits.length || Math.max(1, Math.round((issue.affected / issue.totalTesters) * n) - (i % 2))
    /* The shared findings were written about human testers; an AI run reads
       them about agents, and never names a tester id. */
    const forAgents = (t: string) =>
      t.replace(/\s?\((T\d\d)(, T\d\d)*\)/g, '').replace(/Testers/g, 'AI players').replace(/testers/g, 'AI players')
    return {
      ...issue,
      summary: forAgents(issue.summary),
      detail: forAgents(issue.detail),
      rank: i + 1,
      totalTesters: n,
      affected,
      clips: hits.map((h) => h.clip),
      clipRefs: hits.map((h) => h.ref),
      status: 'no-baseline' as const,
    }
  })
}
