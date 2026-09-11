/**
 * User Test fixtures — the "Build V2.1 — onboarding" batch, compared against
 * batch 1. Numbers are internally consistent on purpose: the tester table, the
 * step table and the comparison table all resolve to the same seven issues, so
 * a reviewer can cross-check any figure against another screen and it holds.
 */

import { MANY_TAG_BATCHES, type LibraryDemoState } from '../libraryDemoState'
import type {
  GameContextDoc,
  UserTestAskAnswer,
  PickerSource,
  PickerStatus,
  PickerVideo,
  UserTestComparisonRow,
  UserTestComparisonStat,
  UserTestIssue,
  UserTestRun,
  UserTestStepRow,
  UserTestTester,
} from '../types/userTest'

export const USER_TEST_RUNS: UserTestRun[] = [
  {
    id: 'v22',
    name: 'Build V2.2 — onboarding (Sep 2)',
    subtitle: 'Started 2 min ago by Mohit · tag Build V2.2',
    videoCount: 8,
    footageLabel: '1h 52m',
    scope: 'Bug report',
    status: 'running',
    analysed: 3,
  },
  {
    id: 'v21',
    name: 'Build V2.1 — onboarding (Aug 26)',
    subtitle: 'Completed Aug 26 · tag Build V2.1',
    videoCount: 10,
    footageLabel: '2h 14m',
    scope: 'Bugs + UX issues',
    status: 'complete',
    issueCount: 7,
  },
  {
    id: 'alliance',
    name: 'Alliance join flow — pilot',
    subtitle: 'Completed Aug 19 · tag Alliance',
    videoCount: 5,
    footageLabel: '48m',
    scope: 'Bug report',
    status: 'complete',
    issueCount: 3,
  },
  {
    id: 'v20',
    name: 'Build V2.0 — onboarding (Aug 12)',
    subtitle: 'Completed Aug 12 · tag Build V2.0',
    videoCount: 6,
    footageLabel: '1h 20m',
    scope: 'Bug report',
    status: 'complete',
    issueCount: 5,
  },
]

export const USER_TEST_ISSUES: UserTestIssue[] = [
  {
    id: 'furnace',
    rank: 1,
    kind: 'bug',
    title: '“Upgrade Furnace” button unresponsive after tutorial hint',
    summary:
      'Testers tap the highlighted button 3–7 times before it responds. Hint overlay is intercepting the tap.',
    detail:
      'The tutorial hint overlay stays mounted for ~2s after the “Tap to upgrade” pointer appears, and swallows taps on the button beneath it. Testers who waited before tapping (T04, T08, T09) didn’t hit it. Reproduces on both device sizes in the batch.',
    step: 'Tutorial › Furnace upgrade',
    status: 'new',
    confidence: 'verified',
    affected: 7,
    totalTesters: 10,
    metric: 'avg 34s lost',
    clips: [
      { tester: 'T01', device: 'Pixel 7', note: '5 taps, no response, then success at 6th', timeRange: '03:42 – 04:18' },
      { tester: 'T02', device: 'iPhone 13', note: '3 taps, backs out to map, returns', timeRange: '02:57 – 03:49' },
      { tester: 'T03', device: 'Pixel 7', note: '7 taps, 41s stuck', timeRange: '04:05 – 04:46' },
      { tester: 'T05', device: 'iPhone 13', note: '4 taps', timeRange: '03:11 – 03:38' },
      { tester: 'T06', device: 'Galaxy S23', note: '3 taps, closes game (reopened later)', timeRange: '03:30 – 03:57' },
      { tester: 'T07', device: 'Pixel 7', note: '6 taps', timeRange: '02:48 – 03:29' },
      { tester: 'T10', device: 'Galaxy S23', note: '3 taps', timeRange: '03:19 – 03:44' },
    ],
  },
  {
    id: 'hero-recruit',
    rank: 2,
    kind: 'friction',
    title: 'Repeated taps on locked Hero Recruit',
    summary:
      'Locked state isn’t visually distinct from active. Testers try it, get no feedback, try again.',
    detail:
      'Locked and active Recruit buttons share the same colour; only a small padlock differs. Testers tap the locked state 2–4 times with no feedback. Inferred from repeated-tap pattern with no state change — not a crash.',
    step: 'Tutorial › Hero screen',
    status: 'open',
    confidence: 'high',
    affected: 5,
    totalTesters: 10,
    metric: '2.8 taps avg',
    clips: [
      { tester: 'T01', device: 'Pixel 7', note: '3 taps', timeRange: '06:12 – 06:20' },
      { tester: 'T04', device: 'iPhone 13', note: '4 taps', timeRange: '05:48 – 06:01' },
      { tester: 'T05', device: 'iPhone 13', note: '2 taps', timeRange: '06:40 – 06:44' },
    ],
  },
  {
    id: 'daily-reward',
    rank: 3,
    kind: 'bug',
    title: 'Daily reward dialog overlaps chapter-complete popup',
    summary:
      'Two dialogs open at once at Chapter 1 end; close button of the top dialog is off-screen on 18:9 devices.',
    detail:
      'Both dialogs fire on the same frame. On 18:9 screens the top dialog’s close button renders outside the safe area.',
    step: 'Chapter 1 › Completion',
    status: 'new',
    confidence: 'verified',
    affected: 4,
    totalTesters: 10,
    scopeNote: '18:9 devices only',
    clips: [
      { tester: 'T02', device: 'iPhone 13', note: 'Close button off-screen, force-quit', timeRange: '11:03 – 11:40' },
    ],
  },
  {
    id: 'alliance-backtrack',
    rank: 4,
    kind: 'friction',
    title: 'Backtracking between Alliance and World Map',
    summary: 'Testers open Alliance, leave, return within 15s — looking for where to join.',
    detail:
      'Open → leave → return within 15s, repeated. Consistent with searching for the Join button, but intent isn’t directly observable — treat as a hypothesis to check in interviews.',
    step: 'Post-tutorial › Alliance',
    status: 'open',
    confidence: 'medium',
    affected: 4,
    totalTesters: 10,
    metric: '2.5 round-trips',
    clips: [],
  },
  {
    id: 'chat-swipe',
    rank: 5,
    kind: 'bug',
    title: 'Chat panel opens on accidental swipe during march',
    summary: 'Edge-swipe gesture region overlaps the map drag area on the left edge.',
    detail: 'Edge-swipe gesture region overlaps the map drag area on the left edge.',
    step: 'Post-tutorial › World Map',
    status: 'no-baseline',
    confidence: 'verified',
    affected: 3,
    totalTesters: 10,
    clips: [],
  },
  {
    id: 'research-hesitation',
    rank: 6,
    kind: 'friction',
    title: 'Hesitation >20s at Research screen',
    summary: 'No taps for 20–40s on first visit, then exit without researching anything.',
    detail: 'No taps for 20–40s on first visit, then exit without researching anything.',
    step: 'Post-tutorial › Research',
    status: 'open',
    confidence: 'medium',
    affected: 3,
    totalTesters: 10,
    clips: [],
  },
  {
    id: 'tutorial-skip',
    rank: 7,
    kind: 'friction',
    title: 'Tutorial skipped at step 4',
    summary: 'Skip tapped within 3s of step 4 appearing.',
    detail:
      'Skip tapped within 3s of step 4 appearing. Both testers later got stuck at Furnace upgrade (issue 1).',
    step: 'Tutorial › Step 4',
    status: 'open',
    confidence: 'high',
    affected: 2,
    totalTesters: 10,
    clips: [],
  },
]

export const USER_TEST_TESTERS: UserTestTester[] = [
  { id: 'T01', device: 'Pixel 7', completed: true, completionLabel: 'Yes · 14:20', issues: [1, 2, 5] },
  { id: 'T02', device: 'iPhone 13', completed: false, completionLabel: 'No · quit 11:40', issues: [1, 3] },
  { id: 'T03', device: 'Pixel 7', completed: true, completionLabel: 'Yes · 16:05', issues: [1, 4, 6] },
  { id: 'T04', device: 'iPhone 13', completed: true, completionLabel: 'Yes · 12:48', issues: [2, 7] },
  { id: 'T05', device: 'iPhone 13', completed: true, completionLabel: 'Yes · 13:31', issues: [1, 2, 4] },
  { id: 'T06', device: 'Galaxy S23', completed: false, completionLabel: 'No · quit 03:57', issues: [1] },
  { id: 'T07', device: 'Pixel 7', completed: true, completionLabel: 'Yes · 15:12', issues: [1, 3, 4, 5] },
  { id: 'T08', device: 'Galaxy S23', completed: false, completionLabel: 'No · quit 09:20', issues: [3, 6] },
  { id: 'T09', device: 'Pixel 7', completed: true, completionLabel: 'Yes · 13:55', issues: [2, 4] },
  { id: 'T10', device: 'Galaxy S23', completed: false, completionLabel: 'No · quit 07:44', issues: [1, 3, 7] },
]

export const USER_TEST_STEPS: UserTestStepRow[] = [
  { step: 'Tutorial › Steps 1–3', reached: 10, issues: [], avgTime: '1m 40s', dropOff: '0' },
  { step: 'Tutorial › Step 4', reached: 10, issues: [7], avgTime: '0m 22s', dropOff: '0' },
  { step: 'Tutorial › Furnace upgrade', reached: 10, issues: [1], avgTime: '1m 04s', dropOff: '1 (T06)', critical: true },
  { step: 'Tutorial › Hero screen', reached: 9, issues: [2], avgTime: '0m 48s', dropOff: '0' },
  { step: 'Chapter 1 › Completion', reached: 9, issues: [3], avgTime: '0m 31s', dropOff: '2 (T02, T10)' },
  { step: 'Post-tutorial › Alliance', reached: 7, issues: [4], avgTime: '1m 12s', dropOff: '0' },
  { step: 'Post-tutorial › Research', reached: 7, issues: [6], avgTime: '0m 44s', dropOff: '1 (T08)' },
  { step: 'Post-tutorial › World Map', reached: 6, issues: [5], avgTime: '2m 03s', dropOff: '0' },
]

export const USER_TEST_COMPARISON_STATS: UserTestComparisonStat[] = [
  { label: 'Completed onboarding', value: '60%', delta: '↑ from 50%', deltaTone: 'good' },
  { label: 'Avg time to complete', value: '14m 18s', delta: '↓ 2m 40s', deltaTone: 'good' },
  { label: 'Testers hitting ≥1 bug', value: '80%', delta: '↑ from 67%', deltaTone: 'bad' },
  { label: 'Worst step', value: 'Furnace upgrade', delta: 'was: Hero screen', deltaTone: 'bad' },
]

export const USER_TEST_COMPARISON_ROWS: UserTestComparisonRow[] = [
  {
    change: 'new',
    title: '“Upgrade Furnace” button unresponsive after hint',
    current: '7/10 · verified',
    step: 'Tutorial › Furnace',
  },
  {
    change: 'new',
    title: 'Daily reward dialog overlaps chapter-complete popup',
    current: '4/10 · verified',
    step: 'Chapter 1 › Completion',
  },
  {
    change: 'open',
    title: 'Repeated taps on locked Hero Recruit',
    baseline: '4/6',
    current: '5/10',
    delta: '67% → 50%',
    deltaTone: 'good',
    step: 'Tutorial › Hero screen',
  },
  {
    change: 'open',
    title: 'Backtracking between Alliance and World Map',
    baseline: '3/6',
    current: '4/10',
    delta: '50% → 40%',
    deltaTone: 'good',
    step: 'Post-tutorial › Alliance',
  },
  {
    change: 'open',
    title: 'Hesitation >20s at Research screen',
    baseline: '2/6',
    current: '3/10',
    delta: '33% → 30%',
    deltaTone: 'neutral',
    step: 'Post-tutorial › Research',
  },
  {
    change: 'open',
    title: 'Tutorial skipped at step 4',
    baseline: '1/6',
    current: '2/10',
    delta: '17% → 20%',
    deltaTone: 'neutral',
    step: 'Tutorial › Step 4',
  },
  {
    change: 'fixed',
    title: 'Loading spinner stuck after first login',
    baseline: '5/6 · verified',
    current: '0/10',
    step: 'Tutorial › Step 1',
  },
  {
    change: 'fixed',
    title: 'Map pinch-zoom inverted on Android',
    baseline: '3/6 · verified',
    current: '0/10',
    step: 'Post-tutorial › World Map',
  },
  {
    change: 'fixed',
    title: 'Reward chest not tappable on 18:9 devices',
    baseline: '2/6 · verified',
    current: '0/10',
    step: 'Chapter 1 › Completion',
  },
  {
    change: 'not-comparable',
    title: 'New (bug) — Chat panel on accidental swipe',
    note: 'Not comparable: World Map wasn’t reached by any batch 1 tester, so there is no baseline for this step.',
  },
]

const GRADIENTS = {
  a: 'linear-gradient(135deg, #2F9FD8 0%, #3FBF8A 100%)',
  b: 'linear-gradient(135deg, #7A4BD8 0%, #C74F8E 100%)',
  c: 'linear-gradient(135deg, #1F2C55 0%, #3A4F7A 100%)',
}

/**
 * Library recordings offered by the run setup picker. Clips that are not
 * 'ready' are shown but cannot be selected — the count in the group header says
 * how many are held back rather than hiding them silently.
 */
export const PICKER_VIDEOS: PickerVideo[] = [
  { id: 'ut-0912', title: 'ut-0912 — first session walkthrough.mp4', duration: '12:04', meta: '284 MB · Sep 1', tag: 'Build V2.2', status: 'ready', source: 'recorder', recent: true, gradient: GRADIENTS.a },
  { id: 'ut-0911', title: 'ut-0911 — first session.mp4', duration: '9:41', meta: '212 MB · Sep 1', tag: 'Build V2.2', status: 'ready', source: 'recorder', recent: true, gradient: GRADIENTS.b },
  { id: 'ut-0910', title: 'ut-0910 — tutorial complete.mp4', duration: '8:20', meta: '190 MB · Sep 1', tag: 'Tutorial', status: 'ready', source: 'recorder', recent: true, gradient: GRADIENTS.c },
  { id: 'ut-0908', title: 'ut-0908 — returning player.mp4', duration: '15:22', meta: '341 MB · Sep 1', tag: 'New event', status: 'ready', source: 'cli', recent: true, gradient: GRADIENTS.c },
  { id: 'ut-0904', title: 'ut-0904 — first session.mp4', duration: '11:18', meta: '260 MB · Aug 31', tag: 'Build V2.2', status: 'ready', source: 'recorder', recent: false, gradient: GRADIENTS.a },
  { id: 'ut-0899', title: 'ut-0899 — tutorial exit.mp4', duration: '7:52', meta: '168 MB · Aug 31', tag: 'Tutorial', status: 'ready', source: 'direct', recent: false, gradient: GRADIENTS.b },
  { id: 'ut-0895', title: 'ut-0895 — event shop.mp4', duration: '6:10', meta: '140 MB · Aug 31', tag: 'New event', status: 'ready', source: 'recorder', recent: false, gradient: GRADIENTS.a },
  { id: 'ut-0891', title: 'ut-0891 — returning player.mp4', duration: '18:30', meta: '402 MB · Aug 30', tag: 'Build V2.1', status: 'ready', source: 'cli', recent: false, gradient: GRADIENTS.c },
  { id: 'ut-0887', title: 'ut-0887 — first session.mp4', duration: '10:05', meta: '230 MB · Aug 30', tag: 'Build V2.1', status: 'ready', source: 'recorder', recent: false, gradient: GRADIENTS.a },
  { id: 'ut-0884', title: 'ut-0884 — alliance join.mp4', duration: '6:40', meta: '150 MB · Aug 29', tag: 'Alliance', status: 'ready', source: 'direct', recent: false, gradient: GRADIENTS.b },
  { id: 'ut-0880', title: 'ut-0880 — store browse.mp4', duration: '5:12', meta: '120 MB · Aug 29', tag: 'Store', status: 'uploading', source: 'direct', recent: false, gradient: GRADIENTS.b },
  { id: 'ut-0876', title: 'ut-0876 — first session.mp4', duration: '13:12', meta: '300 MB · Aug 29', tag: 'Build V2.1', status: 'ready', source: 'recorder', recent: false, gradient: GRADIENTS.c },
  { id: 'ut-0871', title: 'ut-0871 — boss fight.mp4', duration: '9:00', meta: '210 MB · Aug 28', tag: 'Boss fight', status: 'ready', source: 'recorder', recent: false, gradient: GRADIENTS.a },
  { id: 'ut-0866', title: 'ut-0866 — daily quests.mp4', duration: '4:30', meta: '100 MB · Aug 28', tag: 'Daily quest', status: 'ready', source: 'cli', recent: false, gradient: GRADIENTS.b },
  { id: 'ut-0860', title: 'ut-0860 — rally.mp4', duration: '7:45', meta: '180 MB · Aug 27', tag: 'Rally', status: 'uploading', source: 'recorder', recent: false, gradient: GRADIENTS.c },
  { id: 'ut-0855', title: 'ut-0855 — hero screen.mp4', duration: '5:50', meta: '130 MB · Aug 27', tag: 'Hero screen', status: 'ready', source: 'recorder', recent: false, gradient: GRADIENTS.a },
  { id: 'ut-0850', title: 'ut-0850 — settings.mp4', duration: '3:10', meta: '80 MB · Aug 26', tag: 'Settings', status: 'ready', source: 'direct', recent: false, gradient: GRADIENTS.b },
  { id: 'ut-0845', title: 'ut-0845 — chat.mp4', duration: '4:05', meta: '95 MB · Aug 26', tag: 'Chat', status: 'ready', source: 'recorder', recent: false, gradient: GRADIENTS.c },
]

export const GAME_CONTEXT_DOCS: GameContextDoc[] = [
  { id: 'onboarding-v3', name: 'Whiteout Survival — onboarding flow v3.pdf', fileType: 'pdf', meta: '12 intended steps · Aug 20' },
  { id: 'gdd-v4', name: 'Whiteout Survival — GDD v4.docx', fileType: 'docx', meta: 'Full design spec · Jul 2' },
  { id: 'alliance-spec', name: 'Alliance & rally spec.pdf', fileType: 'pdf', meta: 'Join flow and rally rules · Aug 11' },
  { id: 'frost-festival', name: 'New event — Frost Festival spec.docx', fileType: 'docx', meta: 'Event flow and rewards · Aug 28' },
]

export const PICKER_SOURCE_LABELS: Record<PickerVideo['source'], string> = {
  recorder: 'Recorder app',
  direct: 'Direct upload',
  cli: 'CLI',
}

/* ── Canned answers for the Ask panel ─────────────────────────────────────
   Each one is derived from the fixtures above, so a reviewer can check any
   number in the answer against the report and find it. The last entry is the
   one that matters most to the design: a question this run cannot answer,
   answered by saying so. */

export const USER_TEST_ASK_SUGGESTIONS = [
  'Which device saw the most bugs?',
  'Show me every clip where a tester quit',
  'Why is issue 4 medium confidence?',
  'Is the Furnace tap issue visible in live player data?',
]

const READ_SCOPE = 'Read 10 recordings · 7 findings · 21 clips · onboarding flow v3'

export const USER_TEST_ASK_ANSWERS: Record<string, UserTestAskAnswer> = {
  'Which device saw the most bugs?': {
    scope: READ_SCOPE,
    body: [
      'Galaxy S23. All three S23 testers hit at least one verified bug, and all three quit before finishing onboarding — the only device where that is true of every tester in the batch.',
      'Device is confounded with screen ratio here: issue 3 only reproduces on 18:9, which covers the S23 and the iPhone 13 but not the Pixel 7. Three testers per device is too few to separate the two.',
    ],
    table: {
      head: ['Device', 'Testers', 'Hit ≥1 bug', 'Completed'],
      rows: [
        ['Galaxy S23', '3', '3', '0'],
        ['iPhone 13', '3', '3', '2'],
        ['Pixel 7', '4', '4', '4'],
      ],
    },
    evidence: [
      { kind: 'tester', label: 'T06' },
      { kind: 'tester', label: 'T08' },
      { kind: 'tester', label: 'T10' },
      { kind: 'issue', label: 'Issue 3', issueId: 'daily-reward' },
    ],
  },
  'Show me every clip where a tester quit': {
    scope: 'Read 10 recordings · 4 sessions ended before onboarding completed',
    body: [
      'Four testers quit. Three of the four were on the Furnace upgrade or the Chapter 1 completion dialog when they stopped — the two steps carrying the batch’s new bugs.',
    ],
    table: {
      head: ['Tester', 'Quit at', 'Step', 'Last issue hit'],
      rows: [
        ['T02 · iPhone 13', '11:40', 'Chapter 1 › Completion', 'Issue 3'],
        ['T06 · Galaxy S23', '03:57', 'Tutorial › Furnace upgrade', 'Issue 1'],
        ['T08 · Galaxy S23', '09:20', 'Post-tutorial › Research', 'Issue 6'],
        ['T10 · Galaxy S23', '07:44', 'Chapter 1 › Completion', 'Issue 3'],
      ],
    },
    evidence: [
      { kind: 'clip', label: 'T02 · 11:03 – 11:40', issueId: 'daily-reward' },
      { kind: 'clip', label: 'T06 · 03:30 – 03:57', issueId: 'furnace' },
    ],
  },
  'Why is issue 4 medium confidence?': {
    scope: 'Read finding 4 · 4 sessions · Post-tutorial › Alliance',
    body: [
      'Because the behaviour is observable but the reason for it is not. Four testers opened Alliance, left, and came back within 15 seconds, 2.5 times on average — that part is in the recordings.',
      'The claim that they were looking for the Join button is an inference. Nothing in the footage shows what they were searching for, and no tester was asked. A verified label is reserved for things visible in the clip, so this one stays at medium until an interview or an instrumented build confirms it.',
    ],
    evidence: [
      { kind: 'issue', label: 'Issue 4', issueId: 'alliance-backtrack' },
      { kind: 'step', label: 'Post-tutorial › Alliance' },
    ],
  },
  'Is the Furnace tap issue visible in live player data?': {
    scope: 'Read 10 recordings · tester batch only',
    body: [
      'This run cannot answer that. It reads ten tester recordings from a controlled batch — it has no view of live players, and ten sessions could not tell you a live rate even if it did.',
    ],
    evidence: [{ kind: 'issue', label: 'Issue 1', issueId: 'furnace' }],
    outOfScope: {
      reason:
        'Live player behaviour sits outside this run’s corpus. Oracle reads production sessions and can answer it.',
      handoffLabel: 'Ask Oracle, with finding 1 attached',
    },
  },
}

/** Shown for anything typed that has no canned answer behind it. */
export const USER_TEST_ASK_FALLBACK: UserTestAskAnswer = {
  scope: READ_SCOPE,
  body: [
    'Nothing in this run answers that directly. Every claim User Test can make has to trace to a frame in one of these ten recordings, and this question does not have one behind it.',
    'Try one of the suggested questions, or open the full report and ask about a specific finding.',
  ],
  evidence: [],
}

/* ── Reviewer state presets ───────────────────────────────────────────────────
   The picker reads the same library the Gameplay Library page does, so it has
   to answer the same states: nothing uploaded yet, a batch still arriving, a
   batch that failed, and a studio whose tag list outgrew the rail. Driven by
   the shared pill — see lib/libraryDemoState. */

export function pickerVideosFor(state: LibraryDemoState): PickerVideo[] {
  if (state === 'empty') return []

  if (state === 'uploading') {
    return PICKER_VIDEOS.map((v) => ({ ...v, status: 'uploading' as PickerStatus }))
  }

  if (state === 'failed') {
    return PICKER_VIDEOS.map((v) => ({ ...v, status: 'failed' as PickerStatus }))
  }

  if (state === 'many-tags') {
    /* One clip per batch. The picker groups by tag, so this is also the state
       where the group list itself gets long, not just the "+N more" menu. */
    const cycle = [GRADIENTS.a, GRADIENTS.b, GRADIENTS.c]
    const sources: PickerSource[] = ['recorder', 'direct', 'cli']
    return MANY_TAG_BATCHES.map((tag, i) => ({
      id: `mt-${i}`,
      title: `ut-${1200 - i * 7} — ${tag.toLowerCase()} session.mp4`,
      duration: `${4 + (i % 14)}:${String((i * 7) % 60).padStart(2, '0')}`,
      meta: `${120 + i * 11} MB · Sep ${1 + (i % 9)}`,
      tag,
      status: 'ready' as PickerStatus,
      source: sources[i % sources.length],
      recent: i < 4,
      gradient: cycle[i % cycle.length],
    }))
  }

  return PICKER_VIDEOS
}
