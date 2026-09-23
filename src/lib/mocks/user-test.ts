/**
 * User Test fixtures — the "Build 2.2 — onboarding round" batch (run #UT-0412),
 * matching the reference flow's full report. Seven findings, four report
 * sections, five category rows; the summary card, the report and the category
 * table all resolve to the same seven, so a reviewer can cross-check any figure
 * against another screen and it holds.
 */

import {
  LONG_LABEL_BATCHES,
  LONG_LABEL_TITLES,
  MANY_TAG_BATCHES,
  type LibraryDemoState,
} from '../libraryDemoState'
import type {
  GameContextDoc,
  UserTestAskAnswer,
  PickerSource,
  PickerStatus,
  PickerVideo,
  FindingGroup,
  UserTestCategoryRow,
  UserTestIssue,
  UserTestReportMeta,
  UserTestRun,
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
    severity: 'blocking',
    group: 'stability',
    category: 'Bug — technical',
    title: '“Upgrade Furnace” button unresponsive while tutorial hint is showing',
    summary:
      'The hint overlay intercepts the tap; testers tap 3–7 times before it registers.',
    detail:
      'At tutorial step 4 the hint overlay sits over the Upgrade Furnace button, and taps on the button produce no state change until the overlay times out. Testers tapped 3 to 7 times before it responded. Three of the seven closed the app within a minute of the first failed tap and never reached step 5 — this one finding explains every tutorial abandon in the batch.',
    recommendation:
      'Let the hint overlay pass taps through to the highlighted control, or dismiss the hint on the first tap of its target. Verify on the 18:9 layout where the overlay covers the full button.',
    step: 'Tutorial › Furnace upgrade',
    stepLabel: 'Tutorial › Furnace upgrade · step 4 of 11',
    status: 'new',
    confidence: 'verified',
    affected: 7,
    totalTesters: 9,
    metric: 'avg 34s lost',
    clips: [
      { tester: 'tester_01', device: 'Pixel 7', note: '5 taps, no response, then success at the 6th', timeRange: '00:06 – 00:41' },
      { tester: 'tester_02', device: 'iPhone 13', note: '3 taps, backs out to the map, returns', timeRange: '02:57 – 03:49' },
      { tester: 'tester_03', device: 'Pixel 7', note: '7 taps, 41s stuck', timeRange: '04:05 – 04:46' },
      { tester: 'tester_05', device: 'iPhone 13', note: '4 taps, then closes the app', timeRange: '03:11 – 03:38' },
      { tester: 'tester_06', device: 'Galaxy S23', note: '3 taps, closes the app at step 4', timeRange: '03:30 – 03:57' },
      { tester: 'tester_07', device: 'Pixel 7', note: '6 taps', timeRange: '02:48 – 03:29' },
      { tester: 'tester_09', device: 'Galaxy S23', note: '3 taps, closes the app', timeRange: '03:19 – 03:44' },
    ],
  },
  {
    id: 'daily-reward',
    rank: 2,
    kind: 'bug',
    severity: 'blocking',
    group: 'stability',
    category: 'Bug — technical',
    title: 'Daily reward dialog opens on top of the chapter-complete popup',
    summary:
      'Two dialogs stack at Chapter 1 end; the top dialog’s close button is off-screen on 18:9 devices.',
    detail:
      'When Chapter 1 completes, the daily reward dialog opens on top of the chapter-complete popup, and on the 18:9 layout the top dialog’s close control sits outside the visible area. All four testers recovered with the system back gesture after 6–21 seconds. It is marked Blocking because progress is impossible from the on-screen controls, even though nobody abandoned here.',
    recommendation:
      'Queue the daily reward dialog behind chapter completion instead of stacking, and keep dialog close controls inside the safe area on tall screens.',
    step: 'Chapter 1 › Completion',
    stepLabel: 'Chapter 1 › Completion',
    status: 'new',
    confidence: 'verified',
    affected: 4,
    totalTesters: 9,
    scopeNote: '18:9 devices only',
    clips: [
      { tester: 'tester_02', device: 'iPhone 13', note: 'Close control off-screen, recovers with back gesture', timeRange: '11:03 – 11:24' },
      { tester: 'tester_04', device: 'iPhone 13', note: 'Back gesture after 6s', timeRange: '10:12 – 10:18' },
      { tester: 'tester_07', device: 'Pixel 7', note: 'Back gesture after 21s', timeRange: '12:40 – 13:01' },
      { tester: 'tester_08', device: 'Galaxy S23', note: 'Taps around the dialog before backing out', timeRange: '09:31 – 09:52' },
    ],
  },
  {
    id: 'alliance-backtrack',
    rank: 3,
    kind: 'friction',
    severity: 'disruptive',
    group: 'usability',
    category: 'Friction — flow',
    title: 'Backtracking between Alliance and World Map',
    summary: 'Testers open Alliance, leave, return within 15s — looking for where to join.',
    detail:
      'After the tutorial, four testers opened Alliance, left for the World Map, and came back — three or more times within 90 seconds — looking for where to join. Two of them eventually joined; two left the session without joining. The loop suggests the join action isn’t where testers expect it, though the recording can’t show what they were looking for.',
    recommendation:
      'Surface the join action from the World Map alliance marker, or add a “Join” call to action on the Alliance screen’s empty state.',
    step: 'Post-tutorial › Alliance',
    stepLabel: 'Post-tutorial › Alliance',
    status: 'open',
    confidence: 'medium',
    affected: 4,
    totalTesters: 9,
    metric: '2.5 round-trips',
    clips: [
      { tester: 'tester_01', device: 'Pixel 7', note: '3 round-trips in 80s, joins on the third', timeRange: '15:02 – 16:22' },
      { tester: 'tester_03', device: 'Pixel 7', note: '4 round-trips, leaves without joining', timeRange: '14:10 – 15:38' },
      { tester: 'tester_05', device: 'iPhone 13', note: '3 round-trips, joins from the roster', timeRange: '16:44 – 18:01' },
      { tester: 'tester_09', device: 'Galaxy S23', note: '3 round-trips, session ends', timeRange: '13:55 – 15:11' },
    ],
  },
  {
    id: 'reward-dismiss',
    rank: 4,
    kind: 'friction',
    severity: 'cosmetic',
    group: 'usability',
    category: 'Friction — usability',
    title: 'Reward summary dismiss lands on Exploration instead of City',
    summary: 'Dismissing the idle-income summary returns to Exploration, not the screen it started from.',
    detail:
      'After claiming idle income, dismissing the reward summary with “tap anywhere to exit” lands the tester on the Exploration screen instead of the City view they started from. Every tester recovered with a single back-tap, so the cost is small. It is listed because it happened in six of nine sessions and breaks the expectation that closing a popup returns you to where you were.',
    recommendation:
      'Return to the screen the claim was started from; if the Exploration redirect is intentional, offer it as an explicit button beside “Return to City”.',
    step: 'City view › Idle chest',
    stepLabel: 'City view › Idle chest',
    status: 'open',
    confidence: 'high',
    affected: 6,
    totalTesters: 9,
    metric: '1 back-tap each',
    clips: [
      { tester: 'tester_01', device: 'Pixel 7', note: 'Back-tap to City', timeRange: '08:14 – 08:20' },
      { tester: 'tester_02', device: 'iPhone 13', note: 'Back-tap to City', timeRange: '07:48 – 07:53' },
      { tester: 'tester_04', device: 'iPhone 13', note: 'Pauses, then back-taps', timeRange: '09:02 – 09:12' },
      { tester: 'tester_06', device: 'Galaxy S23', note: 'Back-tap to City', timeRange: '06:31 – 06:36' },
      { tester: 'tester_07', device: 'Pixel 7', note: 'Back-tap to City', timeRange: '10:20 – 10:25' },
      { tester: 'tester_08', device: 'Galaxy S23', note: 'Back-tap to City', timeRange: '05:57 – 06:02' },
    ],
  },
  {
    id: 'hero-recruit',
    rank: 5,
    kind: 'friction',
    severity: 'disruptive',
    group: 'struggle',
    category: 'Friction — usability',
    title: 'Repeated taps on locked Hero Recruit',
    summary: 'Locked state isn’t visually distinct. Testers try it, get no feedback, try again.',
    detail:
      'On the tutorial Hero screen the locked Recruit control looks the same as an active one. Five testers tapped it, got no feedback, and tapped again — a median of 4 taps and 20 occurrences in total before moving on. Nobody was blocked, but the repeated taps with no response are the clearest struggle pattern in the batch after the Furnace button.',
    recommendation:
      'Grey out or lock-badge the Recruit control until it is available, and show a one-line reason on tap (“Unlocks at step 9”).',
    step: 'Tutorial › Hero screen',
    stepLabel: 'Tutorial › Hero screen · step 7',
    status: 'open',
    confidence: 'high',
    affected: 5,
    totalTesters: 9,
    metric: 'median 4 taps',
    clips: [
      { tester: 'tester_01', device: 'Pixel 7', note: '3 taps', timeRange: '06:12 – 06:20' },
      { tester: 'tester_03', device: 'Pixel 7', note: '5 taps', timeRange: '05:20 – 05:34' },
      { tester: 'tester_04', device: 'iPhone 13', note: '4 taps', timeRange: '05:48 – 06:01' },
      { tester: 'tester_05', device: 'iPhone 13', note: '4 taps', timeRange: '06:40 – 06:52' },
      { tester: 'tester_08', device: 'Galaxy S23', note: '4 taps', timeRange: '07:02 – 07:15' },
    ],
  },
  {
    id: 'resource-icon',
    rank: 6,
    kind: 'friction',
    severity: 'disruptive',
    group: 'struggle',
    category: 'Friction — monetization',
    title: 'Tap on floating resource icon opens the building underneath',
    summary: 'Collectible icons sit over buildings; taps aimed at the icon open the building menu.',
    detail:
      'In the City view, floating resource icons hover over buildings, and taps aimed at the icon open the building menu underneath instead. Testers closed the menu and re-aimed 2 to 4 times per collection; 9 occurrences across 5 sessions, all recovered. It is a small cost each time, but it recurs every time resources are collected.',
    recommendation:
      'Give floating collectible icons tap priority over building hitboxes, or enlarge their tap target by ~30%.',
    step: 'City view',
    stepLabel: 'City view',
    status: 'open',
    confidence: 'high',
    affected: 5,
    totalTesters: 9,
    metric: '9 occurrences',
    clips: [
      { tester: 'tester_01', device: 'Pixel 7', note: 'Building menu opens twice before the icon registers', timeRange: '09:41 – 09:58' },
      { tester: 'tester_02', device: 'iPhone 13', note: 'Re-aims 3 times', timeRange: '08:22 – 08:44' },
      { tester: 'tester_03', device: 'Pixel 7', note: 'Re-aims twice', timeRange: '11:15 – 11:29' },
      { tester: 'tester_05', device: 'iPhone 13', note: 'Closes the menu, taps again', timeRange: '07:33 – 07:46' },
      { tester: 'tester_06', device: 'Galaxy S23', note: 'Re-aims 4 times', timeRange: '10:04 – 10:31' },
      { tester: 'tester_07', device: 'Pixel 7', note: 'Building menu opens on collection', timeRange: '12:18 – 12:29' },
      { tester: 'tester_09', device: 'Galaxy S23', note: 'Re-aims twice', timeRange: '06:50 – 07:04' },
    ],
  },
  {
    id: 'pack-truncated',
    rank: 7,
    kind: 'bug',
    severity: 'cosmetic',
    group: 'visual',
    category: 'Bug — visual',
    title: 'Pack name truncated in launch promo popup',
    summary: 'The promo card clips long pack titles at the card edge on the 18:9 layout.',
    detail:
      'On launch, the promo popup for “Sports Field Glory Pack 2” clips the pack name at the card edge on the 18:9 layout. No tester reacted to it and there is no behavioural consequence. Listed as cosmetic because it appeared in three sessions on the first screen testers see.',
    recommendation: 'Auto-shrink or wrap pack titles longer than 22 characters on the promo card.',
    step: 'Launch › Promo popup',
    stepLabel: 'Launch › Promo popup',
    status: 'open',
    confidence: 'verified',
    affected: 3,
    totalTesters: 9,
    scopeNote: '18:9 devices only',
    clips: [
      { tester: 'tester_02', device: 'iPhone 13', note: 'Title clipped at the card edge', timeRange: '00:04 – 00:09' },
      { tester: 'tester_06', device: 'Galaxy S23', note: 'Title clipped, dismissed immediately', timeRange: '00:03 – 00:07' },
      { tester: 'tester_08', device: 'Galaxy S23', note: 'Title clipped', timeRange: '00:05 – 00:10' },
    ],
  },
]

/**
 * The category table on the report. Sessions affected is a *union* across the
 * findings in a row, not a sum — the same tester usually hits several — so it
 * is carried rather than derived; nothing in the UI can compute a union from
 * per-finding counts.
 */
export const USER_TEST_CATEGORY_ROWS: UserTestCategoryRow[] = [
  { label: 'Bug — technical', tone: 'bug', findings: 2, sessionsAffected: 9, blocking: 2 },
  { label: 'Bug — visual', tone: 'bug', findings: 1, sessionsAffected: 4, blocking: 0 },
  { label: 'Friction — usability', tone: 'friction', findings: 2, sessionsAffected: 7, blocking: 0 },
  { label: 'Friction — flow', tone: 'friction', findings: 1, sessionsAffected: 4, blocking: 0 },
  { label: 'Friction — monetization', tone: 'friction', findings: 1, sessionsAffected: 3, blocking: 0 },
]

export const USER_TEST_REPORT_META: UserTestReportMeta = {
  title: 'Build 2.2 — onboarding round',
  game: 'Whiteout Survival',
  generated: '14 Sep 2026',
  runId: 'UT-0412',
  /* 10 recorded, 9 analysed. Every finding in this batch reads "n / 9" and the
     narrative says "7 of 9", so the tile has to say so too — it read "10
     sessions" over a page of ninths, which is the first thing a reader would
     have caught and the last thing a forwarded report can afford. */
  sessions: 10,
  analysedSessions: 9,
  footageLabel: '2h 14m',
  narrative:
    '7 of 9 sessions hit an unresponsive Upgrade Furnace button at tutorial step 4, and the 3 sessions that ended early all ended there. Two findings blocked progress, both in the tutorial or at Chapter 1 completion; the remaining five are recoverable friction in the City, Hero and Alliance screens. Everything after the tutorial was reached by 6 sessions with no further blockers.',
}

/** Section headings, in report order. The chip label is the short form. */
export const USER_TEST_FINDING_GROUPS: {
  id: FindingGroup
  chip: string
  heading: string
  note?: string
}[] = [
  {
    id: 'stability',
    chip: 'Stability & functional',
    heading: 'Stability & functional defects',
    note: '3 sessions ended on one of them',
  },
  { id: 'usability', chip: 'Usability friction', heading: 'Usability friction' },
  {
    id: 'struggle',
    chip: 'Struggle',
    heading: 'Struggle hotspots',
    note: 'where testers repeated actions without progress',
  },
  { id: 'visual', chip: 'Visual', heading: 'Visual defects' },
]

/* The per-tester, per-step and vs-previous-batch tables were dropped when the
   full report became a document — the reference has no tabs, and every cut they
   offered is now either in the category table or on the finding itself. Their
   fixtures went with them; the types stay for whatever brings the comparison
   back. */

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

/* The date a document was added, and nothing else. The meta line used to
   summarise each file — "12 intended steps", "Full design spec" — and neither
   is something 6labs knows: a step count is only true of a document that lists
   a single linear flow, and most of these do not. A picker that claims to have
   counted the steps in a GDD invites the reader to trust a grouping the run
   cannot actually make. */
export const GAME_CONTEXT_DOCS: GameContextDoc[] = [
  { id: 'onboarding-v3', name: 'Whiteout Survival — onboarding flow v3.pdf', fileType: 'pdf', meta: 'Added Aug 20' },
  { id: 'gdd-v4', name: 'Whiteout Survival — GDD v4.docx', fileType: 'docx', meta: 'Added Jul 2' },
  { id: 'alliance-spec', name: 'Alliance & rally spec.pdf', fileType: 'pdf', meta: 'Added Aug 11' },
  { id: 'frost-festival', name: 'New event — Frost Festival spec.docx', fileType: 'docx', meta: 'Added Aug 28' },
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

const READ_SCOPE = 'Read 10 sessions · 7 findings · 21 clips · onboarding flow v3'

export const USER_TEST_ASK_ANSWERS: Record<string, UserTestAskAnswer> = {
  'Show me every clip where a tester quit': {
    scope: 'Read 10 sessions · 4 ended before onboarding completed',
    body: [
      'Four testers quit. Three of the four were on the Furnace upgrade or the Chapter 1 completion dialog when they stopped — the two steps carrying the batch’s new bugs.',
    ],
    table: {
      head: ['Tester', 'Quit at', 'Step', 'Last issue hit'],
      /* Tester and time, no device. A row reading "T06 · Galaxy S23" invited
         the reader to group the quits by hardware, which is a claim this run
         cannot support — the device never came with the recording. */
      rows: [
        ['T02', '11:40', 'Chapter 1 › Completion', 'Issue 3'],
        ['T06', '03:57', 'Tutorial › Furnace upgrade', 'Issue 1'],
        ['T08', '09:20', 'Post-tutorial › Research', 'Issue 6'],
        ['T10', '07:44', 'Chapter 1 › Completion', 'Issue 3'],
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
      { kind: 'clip', label: 'T01 · 15:02 – 16:22', issueId: 'alliance-backtrack' },
      { kind: 'clip', label: 'T03 · 14:10 – 15:38', issueId: 'alliance-backtrack' },
      { kind: 'issue', label: 'Issue 4', issueId: 'alliance-backtrack' },
      { kind: 'step', label: 'Post-tutorial › Alliance' },
    ],
  },
  'Is the Furnace tap issue visible in live player data?': {
    scope: 'Read 10 sessions · tester batch only',
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
    'Nothing in this run answers that directly. Every claim User Test can make has to trace to a frame in one of these ten sessions, and this question does not have one behind it.',
    'Try one of the suggested questions, or open the full report and ask about a specific finding.',
  ],
  detail:
    'Nothing to show. The run holds ten sessions, seven findings and twenty-one clips, and none of them carry a frame this question could be answered from — so there is no table under this answer rather than an empty one.',
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

  /* A studio a year into shipping, same size as the Gameplay Library's own
     `large` fixture. The picker needs it for the same reason the library does:
     a 1,000-clip grid and a "select all" that means a run over all 1,000 are
     the two things paging and the two-step selection exist for, and neither
     shows itself against sixteen. Built by repeating the seeded clips so the
     tag rail and the source filter stay the ones every other state uses. */
  if (state === 'large') {
    return Array.from({ length: 1000 }, (_, i) => {
      const b = PICKER_VIDEOS[i % PICKER_VIDEOS.length]
      return {
        ...b,
        id: `pk-lg-${i}`,
        title: b.title.replace(/\d+/, String(2000 + i)),
        status: 'ready' as PickerStatus,
        recent: i < 40,
      }
    })
  }

  /* Mixed, like the library: the picker's whole job here is to show that some
     of what you can see is not yet pickable, and why. */
  if (state === 'processing') {
    return PICKER_VIDEOS.map((v, i) =>
      i % 3 === 0 ? v : { ...v, status: 'processing' as PickerStatus },
    )
  }

  /* The picker groups by tag, so a long tag lands in a GROUP HEADING here
     rather than in a pill — a different fold, same source data. */
  if (state === 'long-labels') {
    const cycle = [GRADIENTS.a, GRADIENTS.b, GRADIENTS.c]
    const sources: PickerSource[] = ['recorder', 'direct', 'cli']
    return LONG_LABEL_BATCHES.map((tag, i) => ({
      id: `ll-${i}`,
      title: LONG_LABEL_TITLES[i % LONG_LABEL_TITLES.length],
      duration: `${6 + i}:${String((i * 13) % 60).padStart(2, '0')}`,
      meta: `${140 + i * 23} MB · Sep ${12 + i}`,
      tag,
      status: 'ready' as PickerStatus,
      source: sources[i % sources.length],
      recent: i < 2,
      gradient: cycle[i % cycle.length],
    }))
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
