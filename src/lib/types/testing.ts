/**
 * Testing area — data model shared by the test screens added in the 2026-09-09
 * revamp (Functional / External agency / AI functional / AI behavioural), plus
 * the run-history rows every test lists under its history tab.
 *
 * User Test keeps its own richer model in `userTest.ts`; this file holds what
 * the other tests need and the shapes they have in common.
 *
 * Code-first prototype — no Figma source yet.
 */

export type TestRunState = 'progress' | 'done' | 'never' | 'failed'

/**
 * Result column of a history row. Functional tests count outcomes (passed /
 * failed / needs review); behavioural and user tests count issues.
 */
export type TestRunResult =
  | { kind: 'issues'; count: number }
  | { kind: 'counts'; passed: number; failed: number; review: number }

/**
 * What a history row records. Most tests only ever produce reports; User Test
 * also answers one-off questions, and its history lists both — so the kind is
 * what the row's icon and result pill are read from.
 */
export type TestRunKind = 'report' | 'question'

export interface TestRunHistoryItem {
  id: string
  /** Defaults to 'report' — only User Test writes questions into its history. */
  kind?: TestRunKind
  name: string
  /** "8 videos · regression-suite.xlsx" — what went in. */
  detail: string
  /** Third column: the build, the tag, or the personas. */
  meta: string
  state: TestRunState
  result?: TestRunResult
  /** "Sep 5", "now" */
  when: string
  /** Functional runs from an agency also carry a behavioural pass. */
  withUx?: boolean
  /** Why a failed run stopped — one line, shown in its row and on its screen. */
  failure?: string
}

/** A test-case file attached to a functional run. */
export interface TestCaseFile {
  name: string
  /** "48 cases · exported from TestRail" */
  meta: string
}

/** A build the AI players can be pointed at. */
export interface BuildOption {
  id: string
  version: string
  /** "uploaded Aug 29 · newest" */
  meta: string
}

export type CaseOutcome = 'pass' | 'fail' | 'review' | 'blocked'

// ── Verified test cases — the functional report's own row model ──────────────

/**
 * One step the tester (or AI player) was meant to take, and what the footage
 * shows happened. A case is only ever as credible as the moment it points at,
 * so every step carries the second it starts on.
 */
export interface VerifiedCaseStep {
  /** What the case asked for — "Tap close on the privacy notice". */
  action: string
  /** What the video shows instead, when it differs from the action. */
  observed?: string
  /** "01:14" — where in the clip this step begins. */
  at: string
}

/**
 * A test case checked against footage. Where FunctionalCase is the thin row the
 * old module list needed, this carries what the reader has to see to accept the
 * verdict: the clip, what was expected, and what was actually observed.
 *
 * `category` is the case's own suite; `path` is where in the game it sits. They
 * are different things — a Startup-notices case runs at Launch › First run —
 * and collapsing them loses the grouping the reader filters by.
 */
export interface VerifiedCase {
  id: string
  title: string
  category: string
  /** "Launch › First run" */
  path: string
  outcome: CaseOutcome
  /** One line: why the verdict is what it is. Shown on the row. */
  reason: string
  /** State the game had to be in before the case could run. */
  precondition: string
  expected: string
  /** Recording the verdict was read from — "qa-0902.mp4". */
  clip: string
  /** "01:14–01:31" */
  clipRange: string
  steps: VerifiedCaseStep[]
}

/** The counts above a verification report — every case the run touched. */
export interface VerificationTotals {
  /** Cases the run actually reached. */
  run: number
  /** Cases in the uploaded file. `run` can be lower; the gap is the point. */
  total: number
  videos: number
  pass: number
  fail: number
  blocked: number
  review: number
}

/** Persona the AI behavioural test can play as. Comes from the player model. */
export interface Persona {
  id: string
  label: string
  /** "day 0–3", "top 2% spend" */
  detail: string
}

export type SessionLength = '15' | '30' | '60' | 'custom'

// ── AI behavioural test — sessions and their screen-by-screen analysis ────────

/**
 * One screen an AI player went through. This is the unit the report is built
 * from: every session is read screen by screen, and a screen where the agent
 * hit something gets a flag that becomes (or feeds) a finding in the report.
 * The reasoning is kept because a behavioural finding is only credible if you
 * can see *why* the agent did what it did on that screen.
 */
export interface AgentStep {
  /** Screen the agent was on, in the game's own vocabulary — "Tutorial › Furnace". */
  screen: string
  /** What was on the screen — the observation the reasoning starts from. */
  saw: string
  /** Why it chose the action, in the persona's voice. */
  reasoning: string
  /** What it decided to do next. */
  action: string
  /** What the observe step after the action returned — "Observed 5000 ms · dialog appeared". */
  observed?: string
  /** Seconds into the session when this screen was reached. */
  atSec: number
  /** Fill for the stand-in frame — real builds ship a still here. */
  scene: string
  /** Set when this moment fed a finding. The id points into the run's issues. */
  flag?: { kind: 'bug' | 'friction'; issueId: string; note: string }
}

export type AgentSessionStatus = 'live' | 'done'

/** One AI player's session inside a behavioural run — one video in the Videos tab. */
export interface AgentSession {
  id: string
  /** 0-based position in the run — "agent 3" is index 2. */
  index: number
  persona: string
  personaDetail: string
  status: AgentSessionStatus
  /** Screens reached so far. Equals `steps.length` once the session is done. */
  reached: number
  steps: AgentStep[]
  /** "30 min" when done, "8m so far" while live. */
  durationLabel: string
}

/** The facts about a behavioural run every screen of it repeats. */
export interface AIBehaviouralRunMeta {
  build: string
  agents: number
  personas: string[]
  /** Agents asked for per persona; absent means an even split. */
  personaCounts?: Record<string, number>
  lengthLabel: string
  startedLabel: string
  /** Sessions finished — equals `agents` once the run is done. */
  finished: number
}
