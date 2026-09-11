/**
 * User Test agent — data model.
 *
 * A *run* reads a batch of recorded sessions from the Gameplay Library and
 * reports what went wrong in them. Two kinds of finding come out of it and the
 * distinction is the whole point of the model:
 *
 *   bug      — observable in the clip. Timestamped, reproducible, fileable as-is.
 *   friction — inferred from behaviour (repeat taps, backtracking, hesitation).
 *              Carries a confidence, because intent is never directly observable.
 *
 * Everything else hangs off that: confidence is only meaningful next to a kind,
 * and the comparison rows only make sense when two runs share a game-step
 * vocabulary (which comes from the game context document attached to the run).
 *
 * Code-first prototype — no Figma source yet.
 */

export type IssueKind = 'bug' | 'friction'

/** How much the finding can be trusted. `verified` only ever applies to bugs. */
export type IssueConfidence = 'verified' | 'high' | 'medium'

/**
 * Where the issue stands relative to the run it is compared against.
 * `no-baseline` is not a fourth outcome — it says the comparison cannot be
 * made, because the step it sits on was never reached in the baseline run.
 */
export type IssueStatus = 'new' | 'open' | 'fixed' | 'no-baseline'

/** One piece of evidence — a tester, a device, and the seconds it happened in. */
export interface UserTestClip {
  tester: string
  device: string
  /** What the tester actually did, in the clip's own terms. */
  note: string
  timeRange: string
}

export interface UserTestIssue {
  id: string
  /** Position in the ranked list — by testers affected, not by severity. */
  rank: number
  kind: IssueKind
  title: string
  /** One line under the title on the summary screen. */
  summary: string
  /** The evidence paragraph on the full report. */
  detail: string
  /** Game step the issue sits on, named by the game context document. */
  step: string
  status: IssueStatus
  confidence: IssueConfidence
  affected: number
  totalTesters: number
  /** Cost of the issue in the run's own units — "avg 34s lost", "2.8 taps avg". */
  metric?: string
  /** Narrowing condition, when the issue does not reproduce everywhere. */
  scopeNote?: string
  clips: UserTestClip[]
}

export interface UserTestTester {
  id: string
  device: string
  completed: boolean
  /** "Yes · 14:20" or "No · quit 11:40" — the timestamp matters either way. */
  completionLabel: string
  /** Ranks of the issues this tester hit. */
  issues: number[]
}

export interface UserTestStepRow {
  step: string
  reached: number
  /** Ranks of issues found on this step, or null when the step was clean. */
  issues: number[]
  avgTime: string
  dropOff: string
  /** Set when the step is the worst one in the batch — drives the red treatment. */
  critical?: boolean
}

export type ComparisonChange = 'new' | 'open' | 'fixed' | 'not-comparable'

export interface UserTestComparisonRow {
  change: ComparisonChange
  title: string
  /** Rate in the baseline run — absent for a new issue. */
  baseline?: string
  /** Rate in this run — absent for a row with no baseline to compare against. */
  current?: string
  /** Direction of travel, already phrased ("67% → 50%"). */
  delta?: string
  /** Whether the delta reads as an improvement, a regression, or neither. */
  deltaTone?: 'good' | 'bad' | 'neutral'
  step?: string
  /** Why the row can't be compared — only set for `not-comparable`. */
  note?: string
}

export interface UserTestComparisonStat {
  label: string
  value: string
  delta?: string
  deltaTone?: 'good' | 'bad' | 'neutral'
}

export type RunStatus = 'running' | 'complete'

export interface UserTestRun {
  id: string
  name: string
  /** "Started 2 min ago by Mohit · tag Build V2.2" */
  subtitle: string
  videoCount: number
  footageLabel: string
  /** What the run was asked to look for. */
  scope: string
  status: RunStatus
  /** Videos analysed so far — only meaningful while running. */
  analysed?: number
  issueCount?: number
}

/** Where a recording came from — shown so a batch can be filtered by capture path. */
export type PickerSource = 'recorder' | 'direct' | 'cli'

/**
 * Mirrors VideoStatus on VideoLibraryCard. Declared here rather than imported
 * so lib/types stays free of component imports; keep the two in step. There is
 * no analysing state — nothing runs over library footage.
 */
export type PickerStatus = 'uploading' | 'ready' | 'failed'

export interface PickerVideo {
  id: string
  title: string
  duration: string
  /** "284 MB · Sep 1" */
  meta: string
  tag: string
  /** Only ready clips can be picked — a run cannot read one still uploading. */
  status: PickerStatus
  source: PickerSource
  /** Uploaded in the last 24h — powers the recency quick-filter. */
  recent: boolean
  gradient: string
}

export interface GameContextDoc {
  id: string
  name: string
  fileType: 'pdf' | 'docx'
  /** "12 intended steps · Aug 20" */
  meta: string
}

/* ── Asking the run questions ─────────────────────────────────────────────
   Follow-up questions are answered by User Test, not Oracle. The distinction
   is the corpus, not the model: User Test holds this run's recordings,
   findings and clips and can point at the frame a claim came from. Oracle
   holds live player data and cannot. A question that needs the other corpus
   is handed over rather than guessed at — see `outOfScope`. */

export type EvidenceKind = 'clip' | 'issue' | 'step' | 'tester'

/** A pointer back into the report, so an answer is never just an assertion. */
export interface UserTestEvidenceRef {
  kind: EvidenceKind
  label: string
  /** Issue the reference belongs to, when following it should open one. */
  issueId?: string
}

export interface UserTestAskAnswer {
  /** What was read to produce the answer — stated up front, not in a footnote. */
  scope: string
  body: string[]
  /** Used when the answer is really a count per group. */
  table?: { head: string[]; rows: string[][] }
  evidence: UserTestEvidenceRef[]
  /**
   * Set when the question needs data this run does not hold. The answer then
   * states the limit and offers a handoff instead of inventing a number.
   */
  outOfScope?: {
    reason: string
    /** What Oracle would be asked, carried across with the finding attached. */
    handoffLabel: string
  }
}

export interface UserTestAskTurn {
  id: string
  question: string
  /** Null while the agent is still reading. */
  answer: UserTestAskAnswer | null
}
