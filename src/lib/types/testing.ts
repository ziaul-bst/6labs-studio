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
export type CasePriority = 'p0' | 'p1' | 'p2'

export interface FunctionalCase {
  id: string
  title: string
  priority: CasePriority
  /** "critical" / "major" — only set on failures. */
  severity?: string
  outcome: CaseOutcome
}

export interface FunctionalModule {
  name: string
  cases: FunctionalCase[]
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
