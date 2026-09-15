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
  { id: 'ut-q-onboarding', kind: 'question', name: 'Which testers quit before finishing onboarding, and what were they doing right before?', detail: '6 videos · 3 follow-ups', meta: 'Build V2.2', state: 'done', when: 'Sep 8' },
  { id: 'ut-v22', name: 'Onboarding flow v3', detail: '10 videos', meta: 'Build V2.2', state: 'done', result: { kind: 'issues', count: 7 }, when: 'Sep 7' },
  { id: 'ut-v21', name: 'Onboarding flow v3', detail: '10 videos', meta: 'Build V2.1', state: 'done', result: { kind: 'issues', count: 7 }, when: 'Aug 26' },
  { id: 'ut-alliance', name: 'Alliance join — pilot', detail: '5 videos · no game context', meta: 'Alliance', state: 'done', result: { kind: 'issues', count: 3 }, when: 'Aug 19' },
]

export const FUNCTIONAL_HISTORY: TestRunHistoryItem[] = [
  { id: 'ft-v22', name: 'Tutorial regression', detail: '8 videos · regression-suite.xlsx', meta: 'Build V2.2', state: 'done', result: { kind: 'counts', passed: 42, failed: 3, review: 2 }, when: 'Sep 5' },
  { id: 'ft-agency', name: 'Agency batch — Digital Hearts', detail: '24 videos · agency-cases-aug.xlsx', meta: 'CBT', state: 'done', result: { kind: 'counts', passed: 118, failed: 9, review: 4 }, when: 'Sep 2', withUx: true },
]

export const AI_FUNCTIONAL_HISTORY: TestRunHistoryItem[] = [
  { id: 'aif-s9', name: 'Season 9 — core loop', detail: '24 cases · FreeFire-PRD-s9-cases.xlsx', meta: 'v2.3.1', state: 'done', result: { kind: 'counts', passed: 19, failed: 2, review: 3 }, when: 'Aug 29' },
  { id: 'aif-bp', name: 'Battle Pass v2 — store', detail: '5 cases · BattlePass-cases-v2.csv', meta: '—', state: 'never', when: 'Aug 28' },
]

export const AI_BEHAVIOURAL_HISTORY: TestRunHistoryItem[] = [
  /* Personas live in `meta` (the "Personas" column) — the name is the scenario. */
  { id: 'aib-frost', name: 'Frost Festival', detail: '20 sessions · 30 min · v2.3.1', meta: 'New player ×12, Whale ×8', state: 'done', result: { kind: 'issues', count: 9 }, when: 'Sep 6' },
  { id: 'aib-onb', name: 'Onboarding', detail: '10 sessions · 15 min · v2.3.0', meta: 'New player ×10', state: 'done', result: { kind: 'issues', count: 6 }, when: 'Aug 30' },
]

// ── Functional report ─────────────────────────────────────────────────────────


/** Sample test-case files the upload zones resolve to (prototype only). */
export const SAMPLE_TEST_CASE_FILES = [
  { name: 'regression-suite.xlsx', meta: '48 cases · exported from TestRail' },
  { name: 'FreeFire-PRD-s9-cases.xlsx', meta: '24 cases' },
  { name: 'checkout-flow-cases.csv', meta: '12 cases' },
  { name: 'alliance-rally-cases.csv', meta: '9 cases' },
  { name: 'settings-smoke.csv', meta: '6 cases' },
]

// ── Builds and personas (AI tests) ────────────────────────────────────────────

export const BUILDS: BuildOption[] = [
  { id: 'v2.3.1', version: 'v2.3.1', meta: 'uploaded Aug 29 · newest' },
  { id: 'v2.3.0', version: 'v2.3.0', meta: 'uploaded Aug 22' },
  { id: 'v2.2.9', version: 'v2.2.9', meta: 'uploaded Aug 14' },
]

export const PERSONAS: Persona[] = [
  { id: 'new-player', label: 'New player', detail: 'day 0–3' },
  { id: 'core', label: 'Core', detail: 'day 7–30' },
  { id: 'whale', label: 'Whale', detail: 'top 2% spend' },
  { id: 'lapsed', label: 'Lapsed', detail: 'returning after 14d' },
  { id: 'competitive', label: 'Competitive', detail: 'PvP-first, rally-heavy' },
  { id: 'casual', label: 'Casual', detail: 'short sessions, no spend' },
  { id: 'explorer', label: 'Explorer', detail: 'opens every screen' },
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
 * The screens a session walks through — the same script for every agent so a
 * reviewer can compare sessions, with flags that vary per agent (see
 * `buildAgentSessions`). Flags point at the issues the report lists.
 */
export const AI_BEHAVIOURAL_STEPS: AgentStep[] = [
  { screen: 'Splash', saw: 'Splash screen with the game logo and a loading bar at 40%.', reasoning: 'Nothing to do until the load completes — a Play button should appear.', action: 'Tap Play', observed: 'Observed 5000 ms · sign-in dialog appeared', atSec: 0, scene: scene(0) },
  { screen: 'Sign-in', saw: 'Sign-in dialog: email and password fields, and a Continue as guest option.', reasoning: 'The brief gives a test account, so sign in rather than continue as a guest.', action: 'Enter credentials, tap Sign in', observed: 'Observed 5000 ms · World Map loaded with the tutorial pointer', atSec: 12, scene: scene(1) },
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
    summary: 'Whale agents told to try the upgrade looked for it inside Frost Festival and gave up after two screens.',
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
    summary: 'New-player agents scrolled the rules once and started without reading — the text is below the fold.',
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
    const reached = done ? steps.length : Math.min(steps.length, Math.max(1, liveReached + (i % 4) - 1))
    return {
      id: `${runId}-a${i + 1}`,
      index: i,
      persona,
      personaDetail: PERSONA_DETAIL[persona] ?? '',
      status: done ? 'done' : 'live',
      reached,
      steps,
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
      t.replace(/\s?\((T\d\d)(, T\d\d)*\)/g, '').replace(/Testers/g, 'Agents').replace(/testers/g, 'agents')
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
