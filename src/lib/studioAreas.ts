/**
 * Studio areas — the IA model behind the sidebar's area switch.
 *
 * The product splits into two areas: Intelligence (Oracle, Radiologist,
 * Forecaster) and Testing. Most studios are entitled to one side only, so the
 * switch is **derived from entitlement, not managed as a mode**:
 *
 *   1 entitled area                → no segment renders at all
 *   2 entitled areas               → segment with both tabs
 *   1 entitled + 1 purchasable     → muted tab that opens a pitch, never an
 *                                    empty product
 *
 * Testing (revamp 2026-09-09, from the CEO/PM review artifact
 * `user-test-agent-flow-v80.html`, nav V1 · style 1.1) is organised into two
 * groups that share one player model:
 *
 *   Human testing — your testers, your videos; 6labs analyses them
 *   AI player testing — 6labs AI players, powered by the player model
 *
 * plus two pinned rows above them: an Overview that lays both groups out, and
 * the Gameplay Library as the corpus every test reads from. Testing has no Context section of its own and
 * no sidebar history: each test keeps its own "Run history" tab.
 *
 * The sidebar's whole contents (nav, context, history) are a function of the
 * active area — there is no second structural sidebar variant to keep in sync.
 */

export type StudioArea = 'intelligence' | 'testing'

/** What the account may do with an area. */
export type Entitlement = 'entitled' | 'purchasable'

export interface AreaEntitlement {
  area: StudioArea
  entitlement: Entitlement
}

/**
 * Where the game context control lives. All three are under PM review — see
 * NavReviewSwitcher.
 *
 *  - `sidebar-top`   game chip above the area switch, so one region reads
 *                    game → area → agent and scope is visible at rest.
 *  - `footer-menu`   switcher hidden inside the profile menu; the profile row
 *                    carries the game name as a persistent indicator.
 *  - `footer-inline` switcher stays a visible control but moves to the footer,
 *                    beside the avatar, with account options behind the avatar.
 */
export type GamePlacement = 'sidebar-top' | 'footer-menu' | 'footer-inline'

export const AREA_LABEL: Record<StudioArea, string> = {
  intelligence: 'Intelligence',
  testing: 'Testing',
}

/** Pitch copy for an area the account hasn't bought yet. */
export const AREA_PITCH: Record<StudioArea, { title: string; body: string }> = {
  intelligence: {
    title: 'Intelligence isn’t on your plan yet',
    body: 'Ask questions of real player behaviour, get anomalies flagged for you, and forecast where a cohort is heading.',
  },
  testing: {
    title: 'Testing isn’t on your plan yet',
    body: 'Put a build in front of players — real or AI — and find what breaks before launch.',
  },
}

// ── Nav model ─────────────────────────────────────────────────────────────────

/** Icon keys resolved to components by the Sidebar. */
export type NavIconKey =
  | 'query'
  | 'overview'
  | 'oracle'
  | 'radiologist'
  | 'forecaster'
  | 'specialized'
  | 'uploads'
  | 'connectors'
  | 'functional-test'
  | 'agency-test'
  | 'user-test'
  | 'beta-test'
  | 'ai-functional-test'
  | 'ai-behavioural-test'
  | 'ai-scale-test'
  | 'test-case-gen'
  | 'lqa'
  | 'library'

/**
 * Colour a group speaks in. Testing's two groups each own a tone so the active
 * row, the sidebar caption and the Overview section all agree on who a test
 * belongs to. Intelligence groups tint their caption only.
 */
export type NavTone = 'brand' | 'purple' | 'success' | 'neutral'

export interface AreaNavItem {
  /** Matches HomePage's ActiveNav union. */
  nav: string
  label: string
  icon: NavIconKey
  badge?: string
  disabled?: boolean
}

export interface AreaNavGroup {
  /** Omitted for the pinned top group (Home). */
  label?: string
  /** Group collapses behind a chevron (Core Agents, History). */
  collapsible?: boolean
  /**
   * Caption ink. Groups with a label render as a small-caps caption over an
   * indented, ruled body — the caption's colour is what tells two captions
   * apart at a glance, and it matches the ink the Testing Overview gives the
   * same group heading.
   */
  captionTone?: NavTone
  /**
   * Tone for the active row inside the group. Only Testing's Human / AI groups
   * set it; everywhere else the active row keeps the brand tint.
   */
  tone?: Extract<NavTone, 'brand' | 'success'>
  items: AreaNavItem[]
}

export interface AreaNavConfig {
  groups: AreaNavGroup[]
  /**
   * Screen the area opens on. Stated explicitly so reordering rows never
   * silently changes where the area switch and `#/<area>` land.
   */
  landing: string
  /** Sidebar history section — area-scoped, so Oracle threads never show in Testing. */
  history: { label: string; kind: 'oracle-threads' | 'test-runs' } | null
}

export const AREA_NAV: Record<StudioArea, AreaNavConfig> = {
  intelligence: {
    groups: [
      /* Not an overview — this screen is the query launcher (agent tabs + query
         field), so it is named for what you start there. Deliberately
         agent-neutral: it opens Radiologist, Oracle and Specialized Agents. */
      { items: [{ nav: 'home', label: 'New Query', icon: 'query' }] },
      {
        label: 'Core Agents',
        collapsible: true,
        captionTone: 'purple',
        items: [
          { nav: 'oracle', label: 'Oracle', icon: 'oracle' },
          { nav: 'radiologist', label: 'Radiologist', icon: 'radiologist' },
          { nav: 'forecaster', label: 'Forecaster', icon: 'forecaster', badge: 'SOON', disabled: true },
        ],
      },
      {
        label: 'Context',
        captionTone: 'brand',
        items: [
          { nav: 'uploads', label: 'Documents', icon: 'uploads' },
          { nav: 'connectors', label: 'Connectors', icon: 'connectors' },
        ],
      },
    ],
    landing: 'home',
    history: { label: 'History', kind: 'oracle-threads' },
  },
  testing: {
    groups: [
      /* Pinned rows, uncaptioned like Intelligence's New Query: the area's front
         door, then the corpus every test reads from. Gameplay Library is not a
         test, and a one-row "Library" group only added chrome — so it sits here
         rather than in a caption of its own. Overview is where `#/testing` lands. */
      {
        items: [
          { nav: 'testing-home', label: 'Overview', icon: 'overview' },
          { nav: 'library', label: 'Gameplay Library', icon: 'library' },
        ],
      },
      {
        label: 'Human testing',
        collapsible: true,
        captionTone: 'brand',
        tone: 'brand',
        items: [
          { nav: 'user-test', label: 'User test', icon: 'user-test' },
          { nav: 'functional-test', label: 'Functional test', icon: 'functional-test' },
          { nav: 'agency-test', label: 'External agency test', icon: 'agency-test', badge: 'SOON', disabled: true },
          { nav: 'beta-test', label: 'Beta · CBT / OBT', icon: 'beta-test', badge: 'SOON', disabled: true },
        ],
      },
      {
        label: 'AI player testing',
        collapsible: true,
        captionTone: 'success',
        tone: 'success',
        items: [
          { nav: 'ai-behavioural-test', label: 'AI behavioural test', icon: 'ai-behavioural-test' },
          { nav: 'ai-functional-test', label: 'AI functional test', icon: 'ai-functional-test' },
          { nav: 'ai-scale-test', label: 'AI large-scale test', icon: 'ai-scale-test', badge: 'SOON', disabled: true },
          { nav: 'test-case-gen', label: 'Test case generation', icon: 'test-case-gen', badge: 'SOON', disabled: true },
          { nav: 'lqa', label: 'L-QA · localization', icon: 'lqa', badge: 'SOON', disabled: true },
        ],
      },
    ],
    landing: 'testing-home',
    /* Each test carries its own Run history tab — nothing to list here. */
    history: null,
  },
}

// ── Area ↔ nav derivation ─────────────────────────────────────────────────────

/**
 * Navs that exist in both areas. A shared nav must not change the active area,
 * so `areaOfNav` returns null and the caller keeps the area it already has.
 */
const SHARED_NAVS = new Set(['uploads'])

const TESTING_NAVS = new Set([
  'testing-home',
  'functional-test',
  'agency-test',
  'user-test',
  'beta-test',
  'ai-functional-test',
  'ai-behavioural-test',
  'ai-scale-test',
  'test-case-gen',
  'lqa',
  'library',
])

/**
 * Which area a nav belongs to, or `null` when it is shared between areas.
 * Nav ids are unique per area, so the area never has to be stored separately —
 * which is what keeps every existing Intelligence deep link working unchanged.
 */
export function areaOfNav(nav: string): StudioArea | null {
  if (SHARED_NAVS.has(nav)) return null
  return TESTING_NAVS.has(nav) ? 'testing' : 'intelligence'
}

/** The nav to land on when the user switches into an area. */
export function landingNav(area: StudioArea): string {
  return AREA_NAV[area].landing
}

/** Every nav id an area's sidebar can reach, disabled rows included. */
export function navsInArea(area: StudioArea): string[] {
  return AREA_NAV[area].groups.flatMap((g) => g.items.map((i) => i.nav))
}

export function isEntitled(entitlements: AreaEntitlement[], area: StudioArea): boolean {
  return entitlements.some((e) => e.area === area && e.entitlement === 'entitled')
}

/**
 * Named entitlement shapes. Not user-switchable — the account decides which one
 * applies. They live here rather than in the review toolbar so the model
 * survives that toolbar being deleted.
 */
export type EntitlementPreset = 'both' | 'intelligence-only' | 'testing-only' | 'testing-locked'

export const ENTITLEMENT_PRESETS: Record<EntitlementPreset, AreaEntitlement[]> = {
  both: [
    { area: 'intelligence', entitlement: 'entitled' },
    { area: 'testing', entitlement: 'entitled' },
  ],
  'intelligence-only': [{ area: 'intelligence', entitlement: 'entitled' }],
  'testing-only': [{ area: 'testing', entitlement: 'entitled' }],
  'testing-locked': [
    { area: 'intelligence', entitlement: 'entitled' },
    { area: 'testing', entitlement: 'purchasable' },
  ],
}

/** Tabs the segment should render. One tab means no segment at all. */
export function visibleAreas(entitlements: AreaEntitlement[]): AreaEntitlement[] {
  return entitlements.length > 1 ? entitlements : []
}

// ── Testing tests — shared identity ───────────────────────────────────────────

/**
 * Which of Testing's tests a screen belongs to, and how it presents itself.
 * The Overview tiles, each test's page header and the sidebar rows all read
 * from this one table so a rename or a tone change lands everywhere at once.
 */
export type TestingTestId =
  | 'functional-test'
  | 'agency-test'
  | 'user-test'
  | 'beta-test'
  | 'ai-functional-test'
  | 'ai-behavioural-test'
  | 'ai-scale-test'
  | 'test-case-gen'
  | 'lqa'

/**
 * Per-test accent. The artifact colours Human tests individually (teal /
 * purple / blue) and every AI test green, so "AI" reads as one family.
 */
export type TestingAccent = 'teal' | 'purple' | 'brand' | 'success' | 'emerald'

/** Sales copy for a test the studio hasn't bought — see TestLockedPitch. */
export interface TestingTestPitch {
  /** One sentence under the test name on the pitch screen. */
  headline: string
  /** Three concrete outcomes, phrased as what the studio gets. */
  outcomes: string[]
  /** Row titles for the greyed sample-report preview. */
  previewRows: string[]
}

export interface TestingTestMeta {
  id: TestingTestId
  group: 'human' | 'ai'
  label: string
  /** One line under the tile title on the Overview. */
  tagline: string
  icon: NavIconKey
  accent: TestingAccent
  soon?: boolean
  pitch: TestingTestPitch
}

export const TESTING_TESTS: TestingTestMeta[] = [
  {
    id: 'user-test', group: 'human', label: 'User test', tagline: 'Is it fun — where players struggle', icon: 'user-test', accent: 'brand',
    pitch: {
      headline: 'Find where real players struggle in recorded sessions, ranked by how many testers hit each issue.',
      outcomes: ['Bugs and friction points by game step, each backed by clips.', 'Comparison against the previous build: new, still open and fixed.', 'Ask the run questions and get answers grounded in the recordings.'],
      previewRows: ['“Upgrade Furnace” button unresponsive after tutorial hint', 'Repeated taps on locked Hero Recruit', 'Daily reward dialog overlaps chapter-complete popup', 'Backtracking between Alliance and World Map'],
    },
  },
  {
    id: 'functional-test', group: 'human', label: 'Functional test', tagline: 'Did it work — verified against your test cases', icon: 'functional-test', accent: 'teal',
    pitch: {
      headline: 'Verify the tests your team already ran against the footage, case by case, without re-running anything.',
      outcomes: ['Every test case marked passed, failed or not verifiable, with the clip behind each result.', 'Regressions surfaced against the previous build, so new failures stand out from known ones.', 'Recordings become searchable by case, module and outcome.'],
      previewRows: ['Battle Pass premium purchase', 'Furnace upgrade from tutorial hint', 'Purchase restore after reinstall', 'Complete the tutorial on a fresh install'],
    },
  },
  {
    id: 'agency-test', group: 'human', label: 'External agency test', tagline: 'Same analysis across every agency session', icon: 'agency-test', accent: 'purple', soon: true,
    pitch: {
      headline: 'Run the same objective analysis across every session your QA agency delivers, and hold them to comparable results.',
      outcomes: ['Independent verification of every case the agency was asked to execute.', 'Behavioural findings from the same sessions, included at no extra step.', 'Batch-over-batch comparison so agency quality is measured, not assumed.'],
      previewRows: ['Agency batch — 24 sessions verified', 'Store grid after an offer expires', 'Leave alliance during rally', 'Repeated taps on locked Hero Recruit'],
    },
  },
  {
    id: 'beta-test', group: 'human', label: 'Beta · CBT / OBT', tagline: 'The why behind the KPIs, via SDK', icon: 'beta-test', accent: 'brand', soon: true,
    pitch: { headline: 'Behavioural analysis of live beta sessions captured through the SDK.', outcomes: ['Why a KPI moved, not just that it did.', 'Cohort-level friction across CBT and OBT.', 'Session evidence attached to every finding.'], previewRows: ['Day-1 retention drop — tutorial step 4', 'Store hesitation among returning players', 'Alliance join abandonment', 'Event shop confusion'] },
  },
  {
    id: 'ai-behavioural-test', group: 'ai', label: 'AI behavioural test', tagline: 'Plays like new player, core, whale, lapsed', icon: 'ai-behavioural-test', accent: 'success',
    pitch: {
      headline: 'AI players play your build as real personas, and 6labs analyses the sessions exactly as it does human ones.',
      outcomes: ['Behavioural and UX findings before a single human tester is booked.', 'Personas derived from the player model, sharpened by every human session you add.', 'The same report and Q&A you get from a user test.'],
      previewRows: ['Frost Festival — new player & whale · 20 sessions', 'Whales skip the battle pass upgrade path', 'New players stall at Research screen', 'Event shop not discovered by day 3'],
    },
  },
  {
    id: 'ai-functional-test', group: 'ai', label: 'AI functional test', tagline: 'Regression and release validation across builds', icon: 'ai-functional-test', accent: 'emerald',
    pitch: {
      headline: 'AI players execute your test cases on any build and report what passed, failed or could not be reached, with video.',
      outcomes: ['A full regression pass in about 30 minutes, without a tester in the loop.', 'Re-run any earlier build to confirm when a failure was introduced.', 'Every outcome carries the recording the agent produced.'],
      previewRows: ['Season 9 — core loop · 24 cases', 'Battle Pass premium purchase', 'Chapter 2 unlock after Chapter 1 stars', 'Daily quest reset at 00:00 UTC'],
    },
  },
  {
    id: 'ai-scale-test', group: 'ai', label: 'AI large-scale test', tagline: 'Economy, balance, progression at scale', icon: 'ai-scale-test', accent: 'success', soon: true,
    pitch: { headline: 'Thousands of AI sessions to stress economy, balance and progression.', outcomes: ['Progression curves across persona mixes.', 'Economy sinks and sources under load.', 'Balance outliers before players find them.'], previewRows: ['Progression stall at chapter 12', 'Gold inflation after day 20', 'Hero tier gap widens at level 40', 'PvP matchmaking imbalance'] },
  },
  {
    id: 'test-case-gen', group: 'ai', label: 'Test case generation', tagline: 'Suites from game understanding, every build', icon: 'test-case-gen', accent: 'success', soon: true,
    pitch: { headline: 'Test suites generated from what 6labs already understands about your game.', outcomes: ['Cases regenerated for every build.', 'Coverage mapped to game steps.', 'Exports to TestRail and spreadsheets.'], previewRows: ['Onboarding · 12 cases', 'Store and purchases · 9 cases', 'Progression · 7 cases', 'Alliance and social · 6 cases'] },
  },
  {
    id: 'lqa', group: 'ai', label: 'L-QA · localization', tagline: 'Every language and region', icon: 'lqa', accent: 'success', soon: true,
    pitch: { headline: 'Localisation QA across every language and region your game ships in.', outcomes: ['Truncation and overflow caught per locale.', 'Untranslated and mis-translated strings flagged in context.', 'Screenshots per language for sign-off.'], previewRows: ['Korean — 14 truncations', 'German — 6 overflow labels', 'Japanese — 3 untranslated strings', 'Arabic — RTL alignment issues'] },
  },
]

// ── Per-test entitlement ──────────────────────────────────────────────────────

/**
 * Tests are sold separately. `locked` is a different state from `soon`: a SOON
 * test does not exist yet and is inert; a locked test exists, stays visible in
 * the sidebar and on the Overview, and resolves to a pitch instead of the
 * product. Never hide a locked test — it is the upsell.
 */
export type TestEntitlement = 'entitled' | 'locked'
export type TestingPlan = Partial<Record<TestingTestId, TestEntitlement>>

/*
 * Named by what the screen shows, not by what the account bought: the state
 * machine dock asks "am I looking at the locked treatment or not", and a plan
 * name ("Starter") does not answer that without knowing the price list. A
 * third preset, 'human-only' (both AI tests locked), was dropped when these
 * were renamed — nothing but its own label ever referenced it.
 */
export type TestingPlanKey = 'unlocked' | 'locked'

export const TESTING_PLAN_LABELS: Record<TestingPlanKey, string> = {
  unlocked: 'Unlocked',
  locked: 'Locked',
}

export const TESTING_PLAN_PRESETS: Record<TestingPlanKey, TestingPlan> = {
  unlocked: {},
  /* One test locked in each group, so both treatments are reviewable. Locked
     must sit on a live test — a SOON test doesn't exist yet, so there is
     nothing to sell. */
  locked: { 'functional-test': 'locked', 'ai-functional-test': 'locked' },
}

export function isTestLocked(plan: TestingPlan, id: string): boolean {
  return plan[id as TestingTestId] === 'locked'
}

export function lockedTests(plan: TestingPlan): TestingTestId[] {
  return (Object.keys(plan) as TestingTestId[]).filter((id) => plan[id] === 'locked')
}

/** Live tests the plan does include — named on the pitch so it isn't only about what's missing. */
export function includedTestLabels(plan: TestingPlan): string[] {
  return TESTING_TESTS.filter((t) => !t.soon && plan[t.id] !== 'locked').map((t) => t.label)
}

/** CSS variables behind each accent — declared in globals.css. */
export const TESTING_ACCENT_VARS: Record<TestingAccent, { ink: string; bg: string; gradient: string }> = {
  teal: { ink: 'var(--testing-teal)', bg: 'var(--testing-teal-bg)', gradient: 'linear-gradient(135deg, #2BB7A0 0%, #178F7C 100%)' },
  purple: { ink: 'var(--purple)', bg: 'var(--purple-tint-light)', gradient: 'linear-gradient(135deg, #9873FF 0%, #7B4CFF 100%)' },
  brand: { ink: 'var(--brand)', bg: 'var(--bg-tint-light)', gradient: 'linear-gradient(135deg, #4D8FF5 0%, #1770EF 100%)' },
  success: { ink: 'var(--success)', bg: 'var(--success-bg)', gradient: 'linear-gradient(135deg, #34C27A 0%, #16A34A 100%)' },
  /* The AI group's second green. Same family as --success, pulled cooler and
     deeper so the two AI tiles are told apart by their tile fill, not just by
     their icons. */
  emerald: { ink: 'var(--testing-emerald)', bg: 'var(--testing-emerald-bg)', gradient: 'linear-gradient(135deg, #2ED3A0 0%, #0E8F6B 100%)' },
}
