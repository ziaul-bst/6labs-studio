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

/**
 * 'queued' is a run that has been submitted and not started — accepted, in
 * line, nothing happening to it yet. It is the state a run is in the moment
 * you press the button, and every test now lands you on the run's own page in
 * it, so "did that work?" is answered by the page rather than by a toast.
 *
 * 'progress' is the run *producing* evidence — agents playing, videos being
 * read. 'analysing' is the run reading what it produced: nothing is being
 * recorded any more, and the report is being written. They are three different
 * waits, and a test has to say which one a reader is in — "Watch live" on a
 * run whose agents have all stopped is a link to nothing, and on one that has
 * not started it is a link to nothing yet.
 */
export type TestRunState = 'queued' | 'progress' | 'analysing' | 'done' | 'never' | 'failed'

/**
 * Result column of a history row. Functional tests count outcomes — the same
 * four a case can carry (see CaseOutcome), so the row and the report never
 * name the outcomes differently; behavioural and user tests count issues.
 */
export type TestRunResult =
  | { kind: 'issues'; count: number }
  | { kind: 'counts'; passed: number; failed: number; review: number; blocked: number }

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
  /**
   * The run's library tags, when the third column is a Tag column. A batch is
   * picked by tag and nothing stops a reader picking three, so the column has
   * to hold a list — given these, the cell renders a rail of pills with a "+N"
   * for whatever the width cannot take, and `meta` is ignored.
   *
   * Left unset where the column is a single fact instead — the build on an AI
   * functional run, the personas on a behavioural one — which keep `meta`.
   */
  tags?: string[]
  state: TestRunState
  result?: TestRunResult
  /** "Sep 5", "now" */
  when: string
  /**
   * The case file(s) this run was verified against. Kept on the row so the
   * report can hand them back as a download — a reader disputing a verdict
   * wants the sheet the verdict was read from, and re-finding it in someone's
   * drive is how "the case was wrong" becomes an unanswerable argument.
   */
  caseFiles?: TestCaseFile[]
  /** Functional runs from an agency also carry a behavioural pass. */
  withUx?: boolean
  /** Why a failed run stopped — one line, shown in its row and on its screen. */
  failure?: string
}

/** A test-case file attached to a functional run. */
export interface TestCaseFile {
  name: string
  /** "48 cases · Aug 20" — what the run learned about the sheet after reading it. */
  meta: string
  /**
   * 'uploading' is the file in transit: the row exists, the sheet does not
   * yet. Defaults to 'ready' — a file that came off a finished run is by
   * definition already there.
   */
  status?: 'uploading' | 'ready'
  /** Where the uploaded sheet can be fetched back from. */
  href?: string
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
  /**
   * The qualifier that rides beside the name everywhere the persona is named —
   * a session header, a run fact, an agent row. Six words at most: it is read
   * in passing, not studied. "day 0–3", "top 2% spend".
   */
  detail: string
  /**
   * What the persona actually does, in a sentence. This is the player model's
   * own description, so its length is not ours to control — which is why it is
   * never laid out per row. The picker shows ONE of these at a time, for the
   * persona under the cursor, in a strip that is always in the same place.
   */
  description: string
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
  /**
   * Fill for the stand-in frame — real builds ship a still here.
   *
   * ABSENT means the frame has not been captured yet, which is a real state on
   * a live session: 6labs knows the agent reached this screen a beat before it
   * has the picture of it. The well shows its waiting treatment rather than a
   * blank box or, worse, the previous screen's frame.
   */
  scene?: string
  /**
   * The raw text an action carried, when it carried any — the skill file a
   * player loaded, a prompt it sent, a response it got back. Thousands of
   * characters, monospaced, and not prose: it is evidence you open when you
   * doubt the one-line action above it, so it ships collapsed.
   */
  payload?: { label: string; body: string }
  /** Set when this moment fed a finding. The id points into the run's issues. */
  flag?: { kind: 'bug' | 'friction'; issueId: string; note: string }
}

/**
 * `failed` is ONE AI player failing inside a run that otherwise went on. It is
 * not the run failing: the other sessions finished, and the report is written
 * from them. 6labs knows THAT a player failed and at which point, never why —
 * so no reason is carried, and every surface says it generically.
 *
 * It can fail at any stage. Part-way through, it keeps every screen it
 * reached and can be opened and watched up to the stop. Before starting, it
 * has no screens and no recording at all (`reached` 0, `steps` empty).
 */
export type AgentSessionStatus = 'live' | 'done' | 'failed'

/**
 * How the recording is shaped. Every 6labs recording is a phone screen
 * capture, so PORTRAIT is the norm and the wells are built for it; landscape
 * is the exception (a tablet build, an emulator run in landscape).
 *
 * It belongs to the session, not to the step: a device does not rotate
 * halfway through a run, and every well that shows this session — the hero
 * frame, the filmstrip, the card in the Videos grid — has to agree about the
 * shape before it lays anything out.
 */
export type RecordingOrientation = 'portrait' | 'landscape'

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
  /** Defaults to portrait — see RecordingOrientation. */
  orientation?: RecordingOrientation
  /**
   * How far into its session length a failed player got, 0–1 — 13 minutes
   * of a 30-minute session is 0.43. Its steps end at the stop, so this is the
   * only place the session's intended length survives.
   */
  stoppedFraction?: number
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
  /**
   * AI players that failed in an otherwise finished run, by 0-based index.
   * Absent or empty on a clean run. See AgentSessionStatus.
   */
  failedIndices?: number[]
  /** The subset of `failedIndices` that failed before starting — no recording. */
  neverStartedIndices?: number[]
}
