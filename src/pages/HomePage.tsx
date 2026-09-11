/**
 * HomePage — 6labs Studio main landing page.
 * Layout: animated Sidebar (280px↔60px) + scrollable content area.
 * Renders agent-specific views (Oracle, Radiologist) or the default Hero + Videos.
 * Radiologist flow: home → results (with optional flyout) → details page.
 *
 * @figmaComponent  HomePage - Sidebar Expanded
 * @figmaNode       6352:91332
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6352-91332
 *
 * Source: studio/src/pages/HomePage.tsx
 * Synced: 2026-04-06
 */

import { useEffect, useState } from 'react'
import { Sidebar } from '../components/organisms/Sidebar'
import { HeroSection, type Agent } from '../components/organisms/HeroSection'
import { VideosContainer } from '../components/organisms/VideosContainer'
import { SuggestionCard } from '../components/molecules/SuggestionCard'
import { OracleAgentView } from '../components/organisms/OracleAgentView'
import { RadiologistAgentView } from '../components/organisms/RadiologistAgentView'
import { RadiologistResultsView } from '../components/organisms/RadiologistResultsView'
import { SessionDetailsPage } from '../components/organisms/SessionDetailsPage'
import type { ChatMessage } from '../components/organisms/OracleChatView'
import type { Citation } from '../lib/types/citation'
import type { OracleExcerpt, ExcerptPlacement, ExcerptShape } from '../lib/types/excerpt'
import { MOCK_EXCERPTS } from '../lib/mocks/excerpts'
import { DEFAULT_ORACLE_HISTORY, SEEDED_ORACLE_THREADS } from '../lib/mocks/oracle-threads'
import { ContextUploadsView } from '../components/organisms/ContextUploadsView'
import { SpecializedAgentsView } from '../components/organisms/SpecializedAgentsView'
import { VideoLibraryView } from '../components/organisms/VideoLibraryView'
import { getLibraryTagOptions, filterLibraryByTags } from '../lib/librarySessions'
import { MOCK_SESSIONS } from '../lib/mocks/radiologist-sessions'
import { ContextConnectorsView, CONNECTORS } from '../components/organisms/ContextConnectorsView'
import { ConnectorDetailView } from '../components/organisms/ConnectorDetailView'
import {
  BigQueryOnboardingModal,
  type BigQueryOnboardingState,
} from '../components/organisms/BigQueryOnboardingModal'
import { SharedConnectorDetail } from '../components/organisms/SharedConnectorDetail'
import {
  SnowflakeOnboardingModal,
  type SnowflakeOnboardingState,
} from '../components/organisms/SnowflakeOnboardingModal'
import {
  disconnectBigQuery,
  getMockBigQueryConnection,
  getSharedBigQueryConnection,
  getSharedSnowflakeConnection,
  SHARED_CONNECTION_OWNER,
  markBigQueryConnected,
  markBigQuerySyncComplete,
  onConnectorOnboardingRequest,
  useBigQueryConnection,
  disconnectSnowflake,
  getMockSnowflakeConnection,
  markSnowflakeConnected,
  markSnowflakeSyncComplete,
  useSnowflakeConnection,
  type SnowflakeConnectionDetails,
} from '../lib/state/connectorsStore'
import { PageTopbar } from '../components/molecules/PageTopbar'
import { PopupModal } from '../components/molecules/PopupModal'
import type { SessionData } from '../lib/types/radiologist'
import type { HistoryItem } from '../components/organisms/Sidebar'
import { BaristaSidePanel } from '../components/organisms/BaristaSidePanel'
import { BaristaSetupPage } from '../components/organisms/BaristaSetupPage'
import { BaristaTaskCreateDialog } from '../components/organisms/BaristaTaskCreateDialog'
import { BaristaTaskDetailPage } from '../components/organisms/BaristaTaskDetailPage'
import { BaristaPage } from '../components/organisms/BaristaPage'
import { useBarista } from '../state/BaristaContext'
import { AreaLockedPitch } from '../components/organisms/AreaLockedPitch'
import { TestLockedPitch } from '../components/organisms/TestLockedPitch'
import { ContactSalesDialog } from '../components/molecules/ContactSalesDialog'
import { StateMachineDock, type StateMachineDockRow } from '../components/organisms/StateMachineDock'
import { TESTING_PLAN_LABELS } from '../lib/studioAreas'
import {
  LIBRARY_DEMO_LABELS,
  LIBRARY_DEMO_NOTES,
  LIBRARY_DEMO_STATES,
  type LibraryDemoState,
} from '../lib/libraryDemoState'
import {
  HISTORY_DEMO_LABELS,
  HISTORY_DEMO_NOTES,
  HISTORY_DEMO_STATES,
  HISTORY_DEMO_STATES_REPORTS_ONLY,
  setHistoryDemoState,
  useHistoryDemoState,
  type HistoryDemoState,
} from '../lib/historyDemoState'
import { setLibraryDemoState, useLibraryDemoState } from '../lib/libraryDemoState'
import {
  RUN_DEMO_LABELS,
  RUN_DEMO_NOTES,
  RUN_DEMO_STATES,
  RUN_DEMO_STATES_NO_THREAD,
  setRunDemoState,
  useRunDemoState,
  type RunDemoState,
} from '../lib/runDemoState'
import {
  BUILDS_DEMO_LABELS,
  BUILDS_DEMO_NOTES,
  BUILDS_DEMO_STATES,
  setBuildsDemoState,
  useBuildsDemoState,
  type BuildsDemoState,
} from '../lib/buildsDemoState'
import {
  UPLOADS_DEMO_LABELS,
  UPLOADS_DEMO_NOTES,
  UPLOADS_DEMO_STATES,
  setUploadsDemoState,
  useUploadsDemoState,
  type UploadsDemoState,
} from '../lib/uploadsDemoState'
import {
  ORACLE_DEMO_LABELS,
  ORACLE_DEMO_NOTES,
  ORACLE_DEMO_STATES,
  ORACLE_DEMO_THREAD_ID,
  RADIOLOGIST_DEMO_LABELS,
  RADIOLOGIST_DEMO_NOTES,
  RADIOLOGIST_DEMO_STATES,
  type OracleDemoState,
  type RadiologistDemoState,
} from '../lib/screenDemoStates'
import {
  CONNECTORS_DEMO_LABELS,
  CONNECTORS_DEMO_NOTES,
  CONNECTORS_DEMO_STATES,
  setConnectorsDemoState,
  useConnectorsDemoState,
  type ConnectorsDemoState,
} from '../lib/connectorsDemoState'

/* Where the library fixture is observable: the Library itself, and the two
   tests whose run-setup picker reads from it. Anywhere else the pill would be
   chrome for something off screen. */
const LIBRARY_STATE_NAVS = new Set<ActiveNav>(['library', 'user-test', 'functional-test'])
/** Tests with a History tab the StateMachineDock can reseed. */
const HISTORY_STATE_NAVS = new Set<ActiveNav>(['user-test', 'functional-test', 'ai-functional-test', 'ai-behavioural-test'])
import { TestingOverview } from '../components/organisms/TestingOverview'
import { FunctionalTestView } from '../components/organisms/FunctionalTestView'
import { AIFunctionalTestView } from '../components/organisms/AIFunctionalTestView'
import { AIBehaviouralTestView } from '../components/organisms/AIBehaviouralTestView'
import { UserTestAgentView, type UserTestScreen } from '../components/organisms/UserTestAgentView'
import {
  areaOfNav,
  ENTITLEMENT_PRESETS,
  isEntitled,
  includedTestLabels,
  isTestLocked,
  landingNav,
  lockedTests,
  TESTING_PLAN_PRESETS,
  TESTING_TESTS,
  type TestingPlanKey,
  type TestingTestMeta,
  type GamePlacement,
  type StudioArea,
} from '../lib/studioAreas'

type ActiveNav =
  | 'home' | 'barista' | 'library' | 'radiologist' | 'oracle' | 'forecaster'
  | 'coach' | 'guardian' | 'specialized' | 'uploads' | 'connectors' | 'excerpt-review'
  // Testing area (revamp 2026-09-09). The SOON rows are in the union so the
  // sidebar callback type-checks; they are disabled and never navigate.
  | 'testing-home' | 'functional-test' | 'agency-test' | 'user-test' | 'beta-test'
  | 'ai-functional-test' | 'ai-behavioural-test' | 'ai-scale-test' | 'test-case-gen' | 'lqa'
type RadiologistView = 'home' | 'results' | 'details'

// ── URL-hash navigation (deep-link + reload support) ───────────────────────────
// The app is hash-routed (App.tsx owns `#/design-system`); everything else is a
// HomePage view. We mirror the primary view in the hash so links change the URL
// and a reload restores the same screen instead of dropping back to Home.
const HASH_NAVS: ActiveNav[] = [
  'home', 'library', 'radiologist', 'oracle', 'forecaster', 'specialized', 'uploads', 'connectors',
  'excerpt-review',
]

/**
 * Testing navs live under a `#/testing/...` prefix (and `#/testing` for its
 * Overview), which leaves every existing Intelligence deep link untouched. Nav
 * ids are unique per area, so the area itself never has to be stored in the
 * hash — `areaOfNav` derives it. `uploads` is shared by both areas, so it keeps
 * the area it was reached from.
 */
const TESTING_HASH_NAVS: ActiveNav[] = [
  'functional-test', 'user-test', 'ai-functional-test', 'ai-behavioural-test',
  'library', 'uploads',
]

/**
 * `#/excerpt-review/<placement>/<shape>` — lands straight on the Oracle Excerpt
 * review screen so reviewers skip the Oracle query and its loading state, and so
 * a specific variant can be shared by copying the address bar.
 */
const EXCERPT_SHAPES: ExcerptShape[] = [
  'attributes-text', 'events', 'text', 'attributes', 'transcript-points', 'transcript-text',
]

/**
 * `#/radiologist/results` and `#/radiologist/panel` land on the results view —
 * the latter with the first session's side panel already open — so reviewers can
 * reach the panel without typing and submitting a query.
 */
function parseRadiologistSub(): 'results' | 'panel' | null {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const [seg, sub] = raw.split('/')
  if (seg !== 'radiologist') return null
  return sub === 'panel' ? 'panel' : sub === 'results' ? 'results' : null
}

/** Query shown when arriving by deep link, since none was typed. */
const REVIEW_QUERY = 'guild help requests'

function parseExcerptReviewHash(): { placement: ExcerptPlacement; shape: ExcerptShape } {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const [, p, sh] = raw.split('/')
  return {
    placement: p === 'rail' ? 'rail' : 'banner',
    shape: (EXCERPT_SHAPES as string[]).includes(sh) ? (sh as ExcerptShape) : 'attributes-text',
  }
}

function parseNavHash(): { nav: ActiveNav; agentId: string | null } {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const [seg, sub] = raw.split('/')
  if (seg === 'testing') {
    // `#/testing` is the Overview. Anything unknown (including the pre-revamp
    // `runs` and `ai-player`) lands there too rather than on a blank screen.
    if (sub && (TESTING_HASH_NAVS as string[]).includes(sub)) return { nav: sub as ActiveNav, agentId: null }
    return { nav: landingNav('testing') as ActiveNav, agentId: null }
  }
  if (seg === 'specialized') return { nav: 'specialized', agentId: sub || null }
  if ((HASH_NAVS as string[]).includes(seg)) return { nav: seg as ActiveNav, agentId: null }
  return { nav: 'home', agentId: null }
}

function navToHash(
  nav: ActiveNav,
  agentId: string | null,
  review?: { placement: ExcerptPlacement; shape: ExcerptShape },
  radiologistSub?: 'results' | 'panel' | null,
): string {
  if (nav === 'specialized') return agentId ? `#/specialized/${agentId}` : '#/specialized'
  if (nav === 'excerpt-review' && review) {
    return `#/excerpt-review/${review.placement}/${review.shape}`
  }
  if (nav === 'radiologist' && radiologistSub) return `#/radiologist/${radiologistSub}`
  if (nav === 'testing-home') return '#/testing'
  if (areaOfNav(nav) === 'testing') return `#/testing/${nav}`
  if (nav === 'home') return '#/'
  return `#/${nav}`
}

const ORACLE_SUGGESTIONS = [
  'Show the top five most intense close-range fights.',
  "Summarize the player's rotations: drop spot, key moves, final zone path.",
  'List all loot and upgrade moments and gloo wall usage.',
  'Where did the player lose the most HP, and what caused it?',
]

// ─── BigQuery onboarding step driver ─────────────────────────────────────────
// Walks through the 4 stages with brief delays to give the UI a real-feeling
// pulse. In the prototype each stage just resolves on a timer — the real
// implementation would await network calls and surface their errors through
// `onError(stepIndex, message?)`.

const BQ_STEP_DELAYS_MS = [900, 700, 600, 1100] // connecting · testing · access · import

function runBigQueryOnboardingSteps({
  projectId,
  orgWideAccess: _orgWideAccess,
  onStep,
  onReviewComplete,
  onSuccess,
  onError,
}: {
  projectId: string
  orgWideAccess: boolean
  onStep: (stepIndex: number) => void
  onReviewComplete: (problemTableCount: number, totalTableCount: number) => void
  onSuccess: (summary: {
    projectId: string
    tableCount: number
    verdict: 'GREEN' | 'YELLOW' | 'RED'
    verdictReason: string
    needsDescriptions: number
  }) => void
  onError: (stepIndex: number, errorMessage?: string) => void
}) {
  let stepIndex = 0
  const advance = () => {
    onStep(stepIndex)
    // Duplicate guard — this project/service-account is already connected
    // company-wide. Match every identity the shared connection is known by
    // (project id, full SA email, SA name) since the UI surfaces the SA name.
    if (stepIndex === 1) {
      const sharedBq = getSharedBigQueryConnection()
      const sharedIds = [
        sharedBq.projectId,
        ...(sharedBq.saEmail ? [sharedBq.saEmail, sharedBq.saEmail.split('@')[0]] : []),
      ].map((s) => s.toLowerCase())
      if (sharedIds.includes(projectId.trim().toLowerCase())) {
        onError(
          1,
          `This BigQuery project is already connected company-wide by ${SHARED_CONNECTION_OWNER.name}.\n` +
            `• New tables missing? Refresh the connection on the Connections page.\n` +
            `• Want a new connection? Use a different service account.`,
        )
        return
      }
    }
    // Prototype-only "happy path" — fail at step 1 if the user typed a clearly
    // bogus project ID, so the error state is reachable without code edits.
    if (stepIndex === 1 && /not-?found|fake|test-error/i.test(projectId)) {
      onError(1)
      return
    }
    // Write-permission guard — 6labs requires a read-only key. If the key has
    // write/admin scope we reject the connection at the access-check step.
    if (stepIndex === 2 && /write|admin|editor|owner/i.test(projectId)) {
      onError(
        2,
        'This service account has write access to BigQuery. 6labs requires a read-only key (BigQuery Data Viewer). Re-export a read-only key and reconnect.',
      )
      return
    }
    if (stepIndex >= BQ_STEP_DELAYS_MS.length) {
      const mock = getMockBigQueryConnection()
      const problemTableCount = mock.tables.filter((t) => t.verdict !== 'GREEN').length
      // Surface the review summary inside the loader for a beat before the
      // success screen, so the user sees how many tables need attention.
      onReviewComplete(problemTableCount, mock.tables.length)
      window.setTimeout(() => {
        onSuccess({
          projectId,
          tableCount: mock.tables.length,
          verdict: mock.verdict,
          verdictReason: mock.verdictReason,
          needsDescriptions: problemTableCount,
        })
      }, 1400)
      return
    }
    window.setTimeout(() => {
      stepIndex += 1
      advance()
    }, BQ_STEP_DELAYS_MS[stepIndex])
  }
  advance()
}

// ─── Snowflake onboarding step driver ────────────────────────────────────────
// Mirrors the BigQuery driver. Prototype-only error triggers keyed off the
// entered details so every failure state is reachable without code edits:
//  • account identifier contains "notfound"/"fake"     → account-not-found (step 1)
//  • username contains "write"/"admin"/"owner"/"editor" → write-access-rejected (step 2)
//  • username contains "nokey"/"badkey"                 → key-not-registered (step 0)
//  • username contains "denied"                         → permission-denied (step 2)

const SF_STEP_DELAYS_MS = [900, 700, 600, 1100] // auth · account · access · import

function runSnowflakeOnboardingSteps({
  details,
  onStep,
  onReviewComplete,
  onSuccess,
  onError,
}: {
  details: SnowflakeConnectionDetails
  onStep: (stepIndex: number) => void
  onReviewComplete: (problemTableCount: number, totalTableCount: number) => void
  onSuccess: (summary: {
    database: string
    tableCount: number
    verdict: 'GREEN' | 'YELLOW' | 'RED'
    verdictReason: string
    needsDescriptions: number
  }) => void
  onError: (stepIndex: number, errorMessage?: string) => void
}) {
  let stepIndex = 0
  const advance = () => {
    onStep(stepIndex)
    if (stepIndex === 0 && /nokey|badkey/i.test(details.username)) {
      onError(0)
      return
    }
    if (stepIndex === 1 && /not-?found|fake|test-error/i.test(details.accountIdentifier)) {
      onError(1)
      return
    }
    // Duplicate guard — this account/user is already connected company-wide.
    // Match both the account identifier and the username, since the UI presents
    // connections by their username.
    {
      const sharedSf = getSharedSnowflakeConnection()
      if (
        stepIndex === 1 &&
        sharedSf.kind !== 'not-connected' &&
        (details.accountIdentifier.trim().toLowerCase() === sharedSf.accountIdentifier.toLowerCase() ||
          details.username.trim().toLowerCase() === sharedSf.username.toLowerCase())
      ) {
        onError(
          1,
          `This Snowflake account is already connected company-wide by ${SHARED_CONNECTION_OWNER.name}.\n` +
            `• New tables missing? Refresh the connection on the Connections page.\n` +
            `• Want a new connection? Use a different username.`,
        )
        return
      }
    }
    if (stepIndex === 2 && /write|admin|editor|owner/i.test(details.username)) {
      onError(
        2,
        'This user can write to Snowflake. 6labs requires a read-only role (SELECT only). Re-grant a read-only role and re-register the key.',
      )
      return
    }
    if (stepIndex === 2 && /denied|noaccess/i.test(details.username)) {
      onError(2)
      return
    }
    if (stepIndex >= SF_STEP_DELAYS_MS.length) {
      const mock = getMockSnowflakeConnection()
      const problemTableCount = mock.tables.filter((t) => t.verdict !== 'GREEN').length
      onReviewComplete(problemTableCount, mock.tables.length)
      window.setTimeout(() => {
        onSuccess({
          database: details.database,
          tableCount: mock.tables.length,
          verdict: mock.verdict,
          verdictReason: mock.verdictReason,
          needsDescriptions: problemTableCount,
        })
      }, 1400)
      return
    }
    window.setTimeout(() => {
      stepIndex += 1
      advance()
    }, SF_STEP_DELAYS_MS[stepIndex])
  }
  advance()
}

export function HomePage() {
  const barista = useBarista()
  const [activeNav, setActiveNav] = useState<ActiveNav>(() => parseNavHash().nav)
  const libraryDemoState = useLibraryDemoState()
  const connectorsDemoState = useConnectorsDemoState()
  const uploadsDemoState = useUploadsDemoState()
  const runDemoState = useRunDemoState()
  const buildsDemoState = useBuildsDemoState()
  /* Which tab the current test view is on. The dock offers Run or History,
     never both — they drive different halves of the same screen, and showing
     the one you are not looking at is just noise. Reset per nav so a test
     opened fresh is never described by the previous test's tab. */
  const [testingTab, setTestingTab] = useState<'new' | 'history'>('new')
  useEffect(() => setTestingTab('new'), [activeNav])
  /* Whether the session-picker popup is open. The Library fixture only changes
     what that popup offers, so the row appears with it and goes with it. */
  const [pickerOpen, setPickerOpen] = useState(false)
  useEffect(() => setPickerOpen(false), [activeNav])
  /* Oracle and Radiologist state already lives in this component, so these two
     rows keep only their own selection and drive the existing setters. */
  const [oracleDemoState, setOracleDemoState] = useState<OracleDemoState>('seeded')
  /* Bumped to remount OracleAgentView when a preset needs its internal message
     list discarded — the store alone cannot pull it back to the launcher. */
  const [oracleViewKey, setOracleViewKey] = useState(0)
  const [radiologistDemoState, setRadiologistDemoState] = useState<RadiologistDemoState>('home')
  const historyDemoState = useHistoryDemoState()
  /**
   * The active area. Derived from the nav on every change, so it can never
   * disagree with the screen — `uploads` is shared between areas and is the one
   * nav that leaves it alone.
   */
  const [area, setArea] = useState<StudioArea>(() => areaOfNav(parseNavHash().nav) ?? 'intelligence')
  /**
   * Which User Test screen is showing. Held here, not in the view, because the
   * page gradient is painted on the content region and never scrolls — it has
   * to know whether User Test is on a landing screen or inside a run.
   */
  const [userTestScreen, setUserTestScreen] = useState<UserTestScreen>('home')
  /** Same idea for the other tests — 'home' paints the gradient, anything else is a run. */
  const [testingSubScreen, setTestingSubScreen] = useState<'home' | 'report' | 'thread' | 'run' | 'session'>('home')

  /* Only on the composer screen does the tab exist. Inside a run the tab bar is
     gone, so the run is what the dock should describe, whatever the last tab was. */
  const onTestHomeScreen =
    activeNav === 'user-test' ? userTestScreen === 'home' : testingSubScreen === 'home'
  const onHistoryTab = testingTab === 'history' && onTestHomeScreen
  /* The library fixture only changes what the session picker offers, so inside
     a test the row belongs to the popup, not the screen behind it: it appears
     when the picker opens and goes when it closes. On the Library page itself
     the row is always on, because there the fixture IS the screen. */
  const showLibraryRow =
    area === 'testing' &&
    LIBRARY_STATE_NAVS.has(activeNav) &&
    (activeNav === 'library' || pickerOpen)
  /* Decided: the game switcher lives inside the footer profile menu. */
  const gamePlacement: GamePlacement = 'footer-menu'
  /* Entitlement is an account fact, not a session choice. Swap this constant to
     review the single-area or purchasable shapes. */
  const areas = ENTITLEMENT_PRESETS.both
  const areaEntitled = isEntitled(areas, area)
  /* Tests are sold separately. In the product this is an account fact; here it
     is switchable from the state machine dock so PMs and developers can see
     both the unlocked product and what a smaller plan sees. Unlocked is the
     default: the whole product is the baseline, and `locked` — one test locked
     per group — is the variation you go looking for. */
  const [testingPlanKey, setTestingPlanKey] = useState<TestingPlanKey>('unlocked')
  const testingPlan = TESTING_PLAN_PRESETS[testingPlanKey]
  const lockedTestIds = lockedTests(testingPlan)
  const activeTestLocked = isTestLocked(testingPlan, activeNav)
  /* "Contact sales" has no in-product purchase behind it — tests are
     enabled per workspace by our team — so it resolves to the support
     address instead of a fake "request sent" confirmation. */
  const [contactSalesTest, setContactSalesTest] = useState<TestingTestMeta | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [language, setLanguage] = useState('EN')
  /* Oracle is the default entry point on New Query. */
  const [heroAgent, setHeroAgent] = useState<Agent>('oracle')
  // Console source (sources popup) — 'library' switches the Radiologist gallery
  // to the videos available in the Library
  const [consoleSource, setConsoleSource] = useState('bluestacks')
  // Library tag scoping — narrows which library videos the agent references (OR match)
  const [libraryScopeTags, setLibraryScopeTags] = useState<string[]>([])
  // Only author-added upload tags are offered for scoping (AI tags are display-only)
  const libraryTagOptions = getLibraryTagOptions().filter((o) => o.group === 'upload')
  const gallerySessions =
    consoleSource === 'library' ? filterLibraryByTags(libraryScopeTags) : undefined
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null)
  // Specialized Agents hub: null = card grid, set = that agent's chat flow.
  const [specializedAgentId, setSpecializedAgentId] = useState<string | null>(() => parseNavHash().agentId)
  /** Placement + shape under review, mirrored into the hash so a variant is shareable. */
  const [reviewState, setReviewState] = useState(() => parseExcerptReviewHash())

  // React to deep links, manual hash edits, and browser back/forward.
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash.startsWith('#/design-system')) return
      const { nav, agentId } = parseNavHash()
      setActiveNav((prev) => (prev === nav ? prev : nav))
      setSpecializedAgentId((prev) => (prev === agentId ? prev : agentId))
      if (nav === 'excerpt-review') setReviewState(parseExcerptReviewHash())
      // Restore the radiologist sub-view too. Without this, a hash change into
      // `#/radiologist/panel` on an already-mounted app left the view on 'home',
      // and the writer effect below promptly overwrote the link back to
      // `#/radiologist` — so the deep link only worked on a full page load.
      const sub = parseRadiologistSub()
      if (nav === 'radiologist' && sub) {
        setRadiologistView('results')
        setSearchQuery((prev) => prev || REVIEW_QUERY)
        if (sub === 'panel') {
          setSelectedSession((prev) => prev ?? MOCK_SESSIONS[0])
          setFlyoutOpen(true)
        }
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  // Area follows the nav — one source of truth, so a deep link into a Testing
  // screen switches the sidebar with it and back/forward stays consistent.
  useEffect(() => {
    const navArea = areaOfNav(activeNav)
    if (navArea && navArea !== area) setArea(navArea)
  }, [activeNav, area])

  // Unsaved-changes guard for the connector detail view.
  const [connectorDirty, setConnectorDirty] = useState(false)
  const [pendingExit, setPendingExit] = useState<(() => void) | null>(null)
  const [connectorResetSignal, setConnectorResetSignal] = useState(0)
  const requestConnectorExit = (action: () => void) => {
    if (connectorDirty) {
      setPendingExit(() => action)
    } else {
      action()
    }
  }
  const [bigQueryModalState, setBigQueryModalState] =
    useState<BigQueryOnboardingState | null>(null)
  const [bigQueryProjectId, setBigQueryProjectId] = useState<string>('')
  const [bigQueryProgress, setBigQueryProgress] = useState<{
    step: number
    errorAtStep?: number
    errorMessage?: string
    problemTableCount?: number
    totalTableCount?: number
  }>({ step: 0 })
  const [bigQuerySummary, setBigQuerySummary] = useState<{
    projectId: string
    tableCount: number
    verdict: 'GREEN' | 'YELLOW' | 'RED'
    verdictReason: string
    needsDescriptions?: number
  } | null>(null)
  const bigQueryConnection = useBigQueryConnection()

  // Snowflake onboarding modal state (prototype — fake network)
  const [snowflakeModalState, setSnowflakeModalState] =
    useState<SnowflakeOnboardingState | null>(null)
  const [snowflakeInitialStep, setSnowflakeInitialStep] = useState<1 | 2>(1)
  const [snowflakeDetails, setSnowflakeDetails] = useState<Partial<SnowflakeConnectionDetails>>({})
  const [snowflakeProgress, setSnowflakeProgress] = useState<{
    step: number
    errorAtStep?: number
    errorMessage?: string
    problemTableCount?: number
    totalTableCount?: number
  }>({ step: 0 })
  const [snowflakeSummary, setSnowflakeSummary] = useState<{
    database: string
    tableCount: number
    verdict: 'GREEN' | 'YELLOW' | 'RED'
    verdictReason: string
    needsDescriptions?: number
  } | null>(null)
  const snowflakeConnection = useSnowflakeConnection()

  // Listen for "Add connector" picks from the chat flyout. BigQuery opens the
  // dedicated modal in place; everything else navigates to the Connectors page
  // (and its detail view) so the user can read about the integration.
  useEffect(() => {
    return onConnectorOnboardingRequest((connectorId) => {
      if (connectorId === 'bigquery') {
        setBigQueryProjectId('')
        setBigQueryModalState('idle')
        return
      }
      if (connectorId === 'snowflake') {
        setSnowflakeDetails({})
        setSnowflakeInitialStep(1)
        setSnowflakeModalState('idle')
        return
      }
      setActiveNav('connectors')
      setSelectedConnectorId(connectorId)
    })
  }, [])

  // ── Oracle history state ──
  /**
   * Oracle thread store, owned here so conversations survive OracleAgentView
   * unmounting when a citation navigates to its evidence and back.
   */
  /* Seeded so the sidebar's History works on a fresh session. It used to render
     four mock labels with no threads behind them, so clicking one navigated to
     Oracle and then silently did nothing. */
  const [oracleThreads, setOracleThreads] = useState<Record<string, ChatMessage[]>>(SEEDED_ORACLE_THREADS)
  const [oracleHistory, setOracleHistory] = useState<HistoryItem[]>(DEFAULT_ORACLE_HISTORY)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)

  const handleOracleQuerySubmit = (id: string, query: string) => {
    const newItem: HistoryItem = { id, query, state: 'loading' }
    setOracleHistory((prev) => [newItem, ...prev])
    /* A running query is already a reading surface — see the ground's
       data-depth below. The thread id only lands on completion, so without
       this flag the pastel mesh stays under the pipeline and then swaps to the
       detail trace the moment the answer appears. */
    setOracleRunning(true)
  }

  const handleOracleQueryComplete = (id: string) => {
    setOracleRunning(false)
    setOracleHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, state: 'complete' } : item,
      ),
    )
    setActiveHistoryId(id)

    // Clear the check mark after 3 seconds — it's a transient indicator
    setTimeout(() => {
      setOracleHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, state: 'default' } : item,
        ),
      )
    }, 3000)
  }

  // ── Radiologist flow state ──
  // Seeded from the hash so `#/radiologist/results` and `#/radiologist/panel`
  // land on those screens directly.
  const [radiologistView, setRadiologistView] = useState<RadiologistView>(() =>
    parseRadiologistSub() ? 'results' : 'home',
  )
  const [searchQuery, setSearchQuery] = useState(() =>
    parseRadiologistSub() ? REVIEW_QUERY : '',
  )
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(() =>
    parseRadiologistSub() === 'panel' ? MOCK_SESSIONS[0] : null,
  )
  const [flyoutOpen, setFlyoutOpen] = useState(() => parseRadiologistSub() === 'panel')

  /* ── State machine dock: Oracle ──
     These drive the same state the product does, so a reviewer lands on the
     real screen rather than a mock of it. See lib/screenDemoStates. */
  /** A query is in flight, and no thread id exists for it yet. */
  const [oracleRunning, setOracleRunning] = useState(false)

  const applyOracleDemoState = (next: OracleDemoState) => {
    setOracleDemoState(next)
    if (next === 'first-run') {
      setOracleRunning(false)
      /* A brand-new workspace: clearing history too is the point — the sidebar
         section goes with it. OracleAgentView keeps its own messages, so the
         open thread has to be closed the way onExitThread does it, by dropping
         the active id and remounting the view. */
      setOracleThreads({})
      setOracleHistory([])
      setActiveHistoryId(null)
      setOracleViewKey((k) => k + 1)
      return
    }
    setOracleRunning(next === 'thinking')
    if (next === 'thinking') {
      const question =
        DEFAULT_ORACLE_HISTORY.find((h) => h.id === ORACLE_DEMO_THREAD_ID)?.query ?? ''
      setOracleHistory(DEFAULT_ORACLE_HISTORY)
      setOracleThreads({
        ...SEEDED_ORACLE_THREADS,
        [ORACLE_DEMO_THREAD_ID]: [
          { id: `${ORACLE_DEMO_THREAD_ID}-user`, type: 'user', text: question },
          {
            id: `${ORACLE_DEMO_THREAD_ID}-ai`,
            type: 'ai',
            isLoading: true,
            /* An empty response shell, which is what the view builds while the
               answer is still resolving. */
            response: {
              id: `${ORACLE_DEMO_THREAD_ID}-resp`,
              sources: [],
              contentHtml: '',
              creditsUsed: 0,
              relatedPrompts: [],
            },
          },
        ],
      })
      setActiveHistoryId(ORACLE_DEMO_THREAD_ID)
      return
    }
    // 'seeded' and 'thread' share the fixtures and differ only in what is open.
    setOracleThreads(SEEDED_ORACLE_THREADS)
    setOracleHistory(DEFAULT_ORACLE_HISTORY)
    setActiveHistoryId(next === 'thread' ? ORACLE_DEMO_THREAD_ID : null)
    if (next === 'seeded') setOracleViewKey((k) => k + 1)
  }

  /* ── State machine dock: Radiologist ── */
  const applyRadiologistDemoState = (next: RadiologistDemoState) => {
    setRadiologistDemoState(next)
    setRadiologistView(next === 'details' ? 'details' : next === 'home' ? 'home' : 'results')
    setSearchQuery(next === 'home' ? '' : REVIEW_QUERY)
    setSelectedSession(next === 'home' || next === 'results' ? null : MOCK_SESSIONS[0])
    setFlyoutOpen(next === 'panel')
  }

  // Mirror the primary view into the URL hash so the address bar tracks
  // navigation and reloads restore the current screen.
  useEffect(() => {
    if (window.location.hash.startsWith('#/design-system')) return
    const radiologistSub =
      activeNav === 'radiologist' && radiologistView === 'results'
        ? flyoutOpen
          ? 'panel'
          : 'results'
        : null
    const target = navToHash(activeNav, specializedAgentId, reviewState, radiologistSub)
    const cur = window.location.hash
    const curIsHome = cur === '' || cur === '#' || cur === '#/'
    if (cur === target || (target === '#/' && curIsHome)) return
    window.location.hash = target
  }, [activeNav, specializedAgentId, reviewState, radiologistView, flyoutOpen])

  /**
   * Set when the details page was reached from an Oracle citation. Carries the
   * excerpt explaining why the video was referenced, plus the label the back
   * arrow should show.
   */
  const [oracleArrival, setOracleArrival] = useState<{
    excerpt: OracleExcerpt
    backLabel: string
    historyId: string | null
  } | null>(null)

  const enterRadiologistResults = (query: string) => {
    setActiveNav('radiologist')
    setRadiologistView('results')
    setSearchQuery(query)
    setFlyoutOpen(false)
    setSelectedSession(null)
  }

  const resetRadiologistState = () => {
    setRadiologistView('home')
    setSearchQuery('')
    setSelectedSession(null)
    setFlyoutOpen(false)
    setOracleArrival(null)
  }

  /**
   * Oracle citation → evidence. Video citations cross nav boundaries into the
   * radiologist details page, so we stash a return target for the back arrow.
   * Table citations route to the warehouse instead.
   */
  const handleOpenCitation = (citation: Citation) => {
    if (citation.kind === 'table') {
      setActiveNav('connectors')
      return
    }
    const session = MOCK_SESSIONS.find((candidate) => candidate.sessionId === citation.videoId)
    if (!session) return

    setSelectedSession(session)
    setOracleArrival({
      excerpt: MOCK_EXCERPTS['attributes-text'],
      backLabel: 'Back to response',
      historyId: activeHistoryId,
    })
    setActiveNav('radiologist')
    setRadiologistView('details')
  }

  const renderContent = () => {
    /* A locked test never opens an empty product — it resolves to its pitch. */
    if (activeTestLocked) {
      const test = TESTING_TESTS.find((t) => t.id === activeNav)
      if (test) {
        return (
          <TestLockedPitch
            test={test}
            includedTests={includedTestLabels(testingPlan)}
            carriesOver="Your 14 Gameplay Library recordings and game context carry over — nothing to set up again."
            onContactSales={(t) => setContactSalesTest(t)}
            onSeeSample={() => setTestingPlanKey('unlocked')}
          />
        )
      }
    }
    switch (activeNav) {
      case 'barista':
        return <BaristaPage />

      // Direct-entry review screen — skips the Oracle query and its 9s loading
      // state so reviewers land on the excerpt immediately.
      case 'excerpt-review':
        return (
          <SessionDetailsPage
            session={MOCK_SESSIONS[0]}
            fromOracle
            backLabel="Back to Oracle"
            defaultPlacement={reviewState.placement}
            defaultShape={reviewState.shape}
            onReviewStateChange={(placement, shape) => setReviewState({ placement, shape })}
            onBack={() => setActiveNav('oracle')}
          />
        )

      case 'oracle': {
        const runningTurn = [...barista.turns]
          .reverse()
          .find((t) => t.status === 'running')
        return (
          <OracleAgentView
            key={oracleViewKey}
            className="h-full"
            onOpenCitation={handleOpenCitation}
            threadStore={oracleThreads}
            onThreadStoreChange={setOracleThreads}
            onQuerySubmit={handleOracleQuerySubmit}
            onQueryComplete={handleOracleQueryComplete}
            activeThreadId={activeHistoryId}
            onOpenLibrary={() => setActiveNav('library')}
            onExitThread={() => {
              setActiveHistoryId(null)
              setOracleRunning(false)
              setActiveNav('home')
            }}
            externalQuery={runningTurn?.question ?? null}
            onExternalQueryComplete={(q) => barista.onOracleCompleted(q)}
          />
        )
      }

      case 'radiologist':
        // Nested radiologist flow
        switch (radiologistView) {
          case 'results':
            return (
              <RadiologistResultsView
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onQuerySubmit={() => {
                  // Re-submit with current query (refresh results)
                }}
                selectedSession={selectedSession}
                flyoutOpen={flyoutOpen}
                sidebarCollapsed={sidebarCollapsed}
                onCardClick={(session) => {
                  setSelectedSession(session)
                  setFlyoutOpen(true)
                }}
                onFlyoutClose={() => {
                  setFlyoutOpen(false)
                  setSelectedSession(null)
                }}
                onViewDetail={() => {
                  setRadiologistView('details')
                }}
              />
            )

          case 'details':
            return selectedSession ? (
              <SessionDetailsPage
                session={selectedSession}
                fromOracle={!!oracleArrival}
                backLabel={oracleArrival?.backLabel}
                onBack={() => {
                  // Arrived from a citation → return to the Oracle conversation.
                  if (oracleArrival) {
                    const historyId = oracleArrival.historyId
                    setOracleArrival(null)
                    setActiveNav('oracle')
                    if (historyId) setActiveHistoryId(historyId)
                    return
                  }
                  setRadiologistView('results')
                }}
              />
            ) : null

          default:
            return (
              <div className="flex flex-col items-center pt-[120px] pb-[64px] w-full">
                <RadiologistAgentView
                  className="w-full"
                  onSubmit={(query) => enterRadiologistResults(query)}
                  selectedSource={consoleSource}
                  onSourceChange={setConsoleSource}
                  libraryTags={libraryTagOptions}
                  selectedLibraryTags={libraryScopeTags}
                  onLibraryTagsChange={setLibraryScopeTags}
                  sessions={gallerySessions}
                />
              </div>
            )
        }

      case 'specialized':
        return (
          <SpecializedAgentsView
            selectedAgentId={specializedAgentId}
            onSelectAgent={setSpecializedAgentId}
            onBack={() => setSpecializedAgentId(null)}
          />
        )

      case 'uploads':
        return (
          <div className="flex flex-col items-center pt-[120px] pb-[64px]">
            <ContextUploadsView />
          </div>
        )

      // Gameplay Library — the Testing area's video corpus. Same view as before
      // the restructure, reached from Testing rather than Intelligence.
      case 'library':
        return (
          <VideoLibraryView />
        )

      // Testing's front door — both groups laid out as tiles.
      case 'testing-home':
      case 'agency-test':
      case 'beta-test':
      case 'ai-scale-test':
      case 'test-case-gen':
      case 'lqa':
        return <TestingOverview lockedTests={lockedTestIds} onOpenTest={(test) => setActiveNav(test)} />

      // User Test — composer home → run thread → full report. Screen state
      // lives inside the view; only the nav row is in the hash, because a run
      // has no id until it runs.
      case 'user-test':
        return (
          <UserTestAgentView
            libraryVideoCount={42}
            gameContextAdded
            onScreenChange={setUserTestScreen}
            onTabChange={setTestingTab}
            onPickerOpenChange={setPickerOpen}
            onOpenLibrary={() => setActiveNav('library')}
            onAskOracle={() => setActiveNav('oracle')}
          />
        )

      /* The agency variant of this view is parked while External agency test
         is SOON — FunctionalTestView still carries it (variant="agency").
         Restore the `agency-test` case here when the test goes live. */
      case 'functional-test':
        return (
          <FunctionalTestView
            key="functional"
            variant="functional"
            onScreenChange={setTestingSubScreen}
            onTabChange={setTestingTab}
            onPickerOpenChange={setPickerOpen}
            onOpenLibrary={() => setActiveNav('library')}
          />
        )

      case 'ai-functional-test':
        return <AIFunctionalTestView onScreenChange={setTestingSubScreen} onTabChange={setTestingTab} />

      case 'ai-behavioural-test':
        return (
          <AIBehaviouralTestView
            onScreenChange={setTestingSubScreen}
            onTabChange={setTestingTab}
            onOpenLibrary={() => setActiveNav('library')}
            onAskOracle={() => setActiveNav('oracle')}
          />
        )

      case 'connectors': {
        const selectedConnector = selectedConnectorId
          ? CONNECTORS.find((c) => c.id === selectedConnectorId)
          : null
        const openBigQueryModal = () => {
          setBigQueryProjectId(
            bigQueryConnection.kind !== 'not-connected'
              ? bigQueryConnection.projectId
              : '',
          )
          setBigQueryModalState('idle')
        }
        const handleBigQueryRefresh = () => {
          if (bigQueryConnection.kind !== 'connected') return
          markBigQueryConnected({
            projectId: bigQueryConnection.projectId,
            syncing: true,
          })
          window.setTimeout(() => markBigQuerySyncComplete(), 1500)
        }
        const openSnowflakeModal = (step: 1 | 2) => {
          const existing =
            snowflakeConnection.kind !== 'not-connected'
              ? {
                  accountIdentifier: snowflakeConnection.accountIdentifier,
                  username: snowflakeConnection.username,
                  warehouse: snowflakeConnection.warehouse,
                  database: snowflakeConnection.database,
                }
              : {}
          setSnowflakeDetails(existing)
          setSnowflakeInitialStep(step)
          setSnowflakeModalState('idle')
        }
        const handleSnowflakeRefresh = () => {
          if (snowflakeConnection.kind !== 'connected') return
          markSnowflakeConnected({
            accountIdentifier: snowflakeConnection.accountIdentifier,
            username: snowflakeConnection.username,
            warehouse: snowflakeConnection.warehouse,
            database: snowflakeConnection.database,
            syncing: true,
          })
          window.setTimeout(() => markSnowflakeSyncComplete(), 1500)
        }
        if (selectedConnector) {
          return (
            <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
              <PageTopbar
                title="Connectors"
                onBack={() => requestConnectorExit(() => setSelectedConnectorId(null))}
              />
              <div className="px-[32px] pt-[32px] pb-[80px] flex-1 flex flex-col">
                {selectedConnector.id === 'bigquery' ? (
                  <SharedConnectorDetail
                    connectorId="bigquery"
                    connector={selectedConnector}
                    onAddConnection={openBigQueryModal}
                    onOwnRefresh={handleBigQueryRefresh}
                    onOwnRetry={handleBigQueryRefresh}
                    onOwnDisconnect={disconnectBigQuery}
                    onOwnReconnect={openBigQueryModal}
                    onOwnReuploadCredentials={openBigQueryModal}
                    onDirtyChange={setConnectorDirty}
                    resetSignal={connectorResetSignal}
                  />
                ) : selectedConnector.id === 'snowflake' ? (
                  <SharedConnectorDetail
                    connectorId="snowflake"
                    connector={selectedConnector}
                    onAddConnection={() => openSnowflakeModal(1)}
                    onOwnRefresh={handleSnowflakeRefresh}
                    onOwnRetry={handleSnowflakeRefresh}
                    onOwnDisconnect={disconnectSnowflake}
                    onOwnReconnect={() => openSnowflakeModal(2)}
                    onOwnReregisterKey={() => openSnowflakeModal(1)}
                    onDirtyChange={setConnectorDirty}
                    resetSignal={connectorResetSignal}
                  />
                ) : (
                  <ConnectorDetailView connector={selectedConnector} />
                )}
              </div>
            </div>
          )
        }
        return (
          <div className="flex flex-col items-center pt-[120px] pb-[64px]">
            <ContextConnectorsView onSelectConnector={setSelectedConnectorId} />
          </div>
        )
      }

      default:
        return (
          <div className="flex flex-col items-center pt-[160px] pb-xxl3">
            <HeroSection
              className="page-measure"
              activeAgent={heroAgent}
              onAgentChange={setHeroAgent}
              selectedSource={consoleSource}
              onSourceChange={setConsoleSource}
              libraryTags={libraryTagOptions}
              selectedLibraryTags={libraryScopeTags}
              onLibraryTagsChange={setLibraryScopeTags}
              onSubmit={(query, agent) => {
                if (agent === 'radiologist') {
                  enterRadiologistResults(query)
                } else if (agent === 'oracle') {
                  setActiveNav('oracle')
                }
              }}
            />
            <div className="w-full mt-xxl4">
              {heroAgent === 'oracle' ? (
                <div className="flex flex-col gap-s items-center page-measure">
                  <p className="font-display text-xs font-semibold text-base-500 text-center w-full leading-[1.5]">
                    Try our suggested prompts
                  </p>
                  <div className="grid grid-cols-2 grid-rows-[72px_72px] gap-s w-full">
                    {ORACLE_SUGGESTIONS.map((text) => (
                      <SuggestionCard
                        key={text}
                        text={text}
                        onClick={() => setActiveNav('oracle')}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <VideosContainer sessions={gallerySessions} />
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex w-full h-full overflow-hidden bg-bg-page">

      {/* ── Sidebar (animated width) ── */}
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          /* The review screen has no sidebar entry, so nothing should highlight. */
          activeNav={activeNav === 'excerpt-review' ? undefined : activeNav}
          onNavChange={(nav) => {
            if (nav !== activeNav || nav !== 'radiologist') {
              resetRadiologistState()
            }
            // Pause Barista generation if user switches screens mid-turn
            if (nav !== activeNav) barista.notifyScreenSwitch()
            if (nav === 'barista') {
              setActiveNav('barista')
              setActiveHistoryId(null)
              if (barista.setupStatus === 'not-set-up') {
                barista.startSetup()
              }
              return
            }
            const applyNav = () => {
              setActiveNav(nav)
              setActiveHistoryId(null)
              if (nav !== 'connectors') setSelectedConnectorId(null)
              // Clicking the hub nav always returns to the agent grid.
              setSpecializedAgentId(null)
            }
            if (nav !== 'connectors') {
              requestConnectorExit(applyNav)
            } else {
              applyNav()
            }
          }}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          areas={areas}
          area={area}
          onAreaChange={(next) => {
            if (next === area) return
            barista.notifyScreenSwitch()
            resetRadiologistState()
            const applyArea = () => {
              setArea(next)
              // Land on the area's first nav rather than trying to find an
              // equivalent screen on the other side — there isn't one.
              setActiveNav(landingNav(next) as ActiveNav)
              setActiveHistoryId(null)
              setSelectedConnectorId(null)
              setSpecializedAgentId(null)
            }
            requestConnectorExit(applyArea)
          }}
          gamePlacement={gamePlacement}
          lockedNavs={lockedTestIds}
          language={language}
          onLanguageChange={setLanguage}
          /* Always passed, empty included: `undefined` makes Sidebar fall back
             to its own defaults, which made a no-history workspace impossible
             to render. Sidebar keeps the fallback for use in isolation. */
          historyItems={oracleHistory}
          activeHistoryId={activeHistoryId}
          onHistoryClick={(id) => {
            setActiveHistoryId(id)
            setActiveNav('oracle')
          }}
        />
      </div>

      {/* ── Main content area — mesh pinned, content scrolls ── */}
      <main className="relative flex-1 min-w-0 h-full overflow-hidden transition-all duration-300 ease-in-out homepage-content-bg">
        {barista.setupStatus === 'in-setup' && (
          <div className="absolute inset-0 z-20 overflow-hidden">
            <BaristaSetupPage
              onCancel={() => barista.cancelSetup()}
              onConfirm={(persona) => {
                // Persona commit happens inside BaristaSetupPage's
                // "Start Barista" CTA (two-step commit) — we receive it here
                // once the user confirms on the summary screen.
                barista.confirmSetup(persona)
                barista.openPanel()
              }}
              onGoToBarista={() => {
                // Called right after onConfirm from the Start Barista CTA —
                // the overlay will unmount because setupStatus is now 'complete'.
                barista.openPanel()
              }}
              initialPersona={barista.persona ?? undefined}
            />
          </div>
        )}
        {/* Ground mesh — pinned to main's box, never scrolls (see .studio-ground
            in globals.css). Home screens get the full-bleed pastel mesh; detail
            and report screens keep only a faint trace along the top edge, so the
            product still reads as one place without colour sitting under content.
            The hues shift per area: Intelligence leads with brand blue, Testing
            with the Core Agents purple and its AI-testing green. */}
        <div
          className="studio-ground"
          aria-hidden="true"
          data-area={area}
          data-depth={
            /* Oracle is a landing screen only until a query is asked — from the
               moment the pipeline starts it is a reading surface and takes the
               detail treatment, like a report, rather than waiting for the
               answer to land. */
            activeNav === 'home' || (activeNav === 'oracle' && activeHistoryId === null && !oracleRunning) || activeNav === 'uploads' || activeNav === 'library' || (activeNav === 'radiologist' && radiologistView === 'home') || (activeNav === 'specialized' && specializedAgentId === null) || (activeNav === 'connectors' && selectedConnectorId === null) || (activeNav === 'user-test' && userTestScreen === 'home') || activeNav === 'testing-home' || (['functional-test', 'ai-functional-test', 'ai-behavioural-test'].includes(activeNav) && (testingSubScreen === 'home' || activeTestLocked))
              ? 'home'
              : 'detail'
          }
        />

        {/* Scrollable content */}
        <div className={[
          'relative z-10 h-full',
          // A purchasable area owns the whole content region — the sidebar's
          // rows are visible but nothing behind them is real yet.
          !areaEntitled ? 'overflow-hidden' : '',
          // Views that manage their own scrolling
          (activeNav === 'radiologist' && radiologistView !== 'home') ||
          activeNav === 'barista' ||
          (activeNav === 'specialized' && specializedAgentId !== null) ||
          activeNav === 'library'
            ? 'overflow-hidden'
            // `page-scroll` reserves the scrollbar's width so the page measure
            // lands on the same pixels whether a screen scrolls or not. Only the
            // container that actually scrolls reserves it — a view that owns its
            // own scrolling reserves inside itself instead.
            : 'overflow-y-auto page-scroll',
        ].join(' ')}>
          {areaEntitled ? (
            renderContent()
          ) : (
            <AreaLockedPitch
              area={area}
              carriesOver="Your game context and 42 gameplay videos carry straight over."
            />
          )}
        </div>
      </main>

      {/* ── Barista right rail — active only on Oracle after setup ── */}
      {barista.panelOpen && barista.setupStatus === 'complete' && activeNav === 'oracle' && (
        <div className="sticky top-0 h-screen shrink-0">
          <BaristaSidePanel
            state={barista.panelState}
            activeTab={barista.activeTab}
            onTabChange={barista.setActiveTab}
            tasks={barista.tasks}
            onCreateTask={(prefill) => barista.openTaskDialog(prefill)}
            onOpenTask={(id) => barista.openTask(id)}
            onRunTask={(id) => barista.runTaskNow(id)}
            onEditTask={(id) => {
              const task = barista.tasks.find((t) => t.id === id)
              if (task)
                barista.openTaskDialog({ name: task.name, prompt: task.prompt }, false)
            }}
            onToggleTask={(id) => barista.toggleTaskEnabled(id)}
            autoMode={barista.autoMode}
            onAutoModeChange={barista.setAutoMode}
            personaSummary={
              barista.persona
                ? `You are assisting a ${barista.persona.department || 'team'} ${barista.persona.roles.join(' / ') || 'team member'} focused on ${barista.persona.focusAreas.join(', ').toLowerCase() || 'game insights'}.`
                : undefined
            }
            suggestedQuestion={barista.suggestedQuestion ?? undefined}
            turns={barista.turns}
            onStartBarista={() =>
              barista.setSuggestedQuestion(
                'What are the top frustration markers in the last week of Bermuda Battle Royale sessions?'
              )
            }
            onSendSuggested={(q) => barista.sendSuggested(q)}
            onEditSuggested={(q) => barista.setSuggestedQuestion(q)}
            onTryAnother={() =>
              barista.setSuggestedQuestion(
                'Which monetization touchpoints correlate with mid-match quits this cohort?'
              )
            }
            onStop={() => barista.pauseGeneration('manual')}
            onReset={() => barista.resetSession()}
            onClose={() => barista.closePanel()}
            onEditPersona={() => barista.startSetup()}
          />
        </div>
      )}

      {/* Task detail view — full-width overlay when a task is opened */}
      {barista.activeTaskId &&
        (() => {
          const task = barista.tasks.find((t) => t.id === barista.activeTaskId)
          if (!task) return null
          return (
            <div className="absolute inset-0 z-30">
              <BaristaTaskDetailPage
                task={task}
                onBack={() => barista.closeTask()}
                onRunNow={() => barista.runTaskNow(task.id)}
                onBranchInNewChat={(t) => {
                  // Prefill Oracle with the task's prompt + close task view.
                  barista.closeTask()
                  setActiveNav('oracle')
                  setActiveHistoryId(null)
                  setSearchQuery(t.prompt)
                }}
              />
            </div>
          )
        })()}

      {/* BigQuery onboarding modal (prototype — fake network) */}
      <BigQueryOnboardingModal
        isOpen={bigQueryModalState !== null}
        lenient
        state={bigQueryModalState ?? 'idle'}
        projectId={bigQueryProjectId}
        progress={bigQueryProgress}
        summary={bigQuerySummary ?? undefined}
        onClose={() => {
          setBigQueryModalState(null)
          setBigQueryProgress({ step: 0 })
          setBigQuerySummary(null)
        }}
        onConnect={({ projectId, orgWideAccess, orgWideEdit }) => {
          setBigQueryProjectId(projectId)
          setBigQuerySummary(null)
          setBigQueryProgress({ step: 0 })
          setBigQueryModalState('progress')
          runBigQueryOnboardingSteps({
            projectId,
            orgWideAccess,
            onStep: (step) => setBigQueryProgress({ step }),
            onReviewComplete: (problemTableCount, totalTableCount) =>
              setBigQueryProgress({
                step: 4,
                problemTableCount,
                totalTableCount,
              }),
            onSuccess: (summary) => {
              markBigQueryConnected({ projectId, syncing: true, orgWideAccess, orgWideEdit })
              markBigQuerySyncComplete()
              setBigQuerySummary(summary)
              setBigQueryModalState('success')
            },
            onError: (errorAtStep, errorMessage) => {
              setBigQueryProgress({ step: errorAtStep, errorAtStep, errorMessage })
              setBigQueryModalState('failed')
            },
          })
        }}
        onRetry={() => {
          setBigQueryProgress({ step: 0 })
          setBigQueryModalState('idle')
        }}
        onDone={() => {
          setBigQueryModalState(null)
          setBigQueryProgress({ step: 0 })
          setBigQuerySummary(null)
        }}
      />

      {/* Snowflake onboarding modal (prototype — fake network) */}
      <SnowflakeOnboardingModal
        isOpen={snowflakeModalState !== null}
        state={snowflakeModalState ?? 'idle'}
        initialStep={snowflakeInitialStep}
        details={snowflakeDetails}
        progress={snowflakeProgress}
        summary={snowflakeSummary ?? undefined}
        onClose={() => {
          setSnowflakeModalState(null)
          setSnowflakeProgress({ step: 0 })
          setSnowflakeSummary(null)
        }}
        onConnect={(payload) => {
          const { orgWideAccess, orgWideEdit, ...rest } = payload
          // The database question was dropped from the form — default the
          // prototype database when it wasn't provided.
          const details = { ...rest, database: rest.database || 'GAME_TELEMETRY' }
          setSnowflakeDetails(details)
          setSnowflakeSummary(null)
          setSnowflakeProgress({ step: 0 })
          setSnowflakeModalState('progress')
          runSnowflakeOnboardingSteps({
            details,
            onStep: (step) => setSnowflakeProgress({ step }),
            onReviewComplete: (problemTableCount, totalTableCount) =>
              setSnowflakeProgress({ step: 4, problemTableCount, totalTableCount }),
            onSuccess: (summary) => {
              markSnowflakeConnected({ ...details, syncing: true, orgWideAccess, orgWideEdit })
              markSnowflakeSyncComplete()
              setSnowflakeSummary(summary)
              setSnowflakeModalState('success')
            },
            onError: (errorAtStep, errorMessage) => {
              setSnowflakeProgress({ step: errorAtStep, errorAtStep, errorMessage })
              setSnowflakeModalState('failed')
            },
          })
        }}
        onRetry={() => {
          setSnowflakeProgress({ step: 0 })
          setSnowflakeInitialStep(2)
          setSnowflakeModalState('idle')
        }}
        onDone={() => {
          setSnowflakeModalState(null)
          setSnowflakeProgress({ step: 0 })
          setSnowflakeSummary(null)
        }}
      />

      {/* Task creation modal */}
      <BaristaTaskCreateDialog
        open={barista.taskDialog.open}
        postRun={barista.taskDialog.postRun}
        prefill={barista.taskDialog.prefill}
        onCancel={() => barista.closeTaskDialog()}
        onSaveAndSchedule={(data) => {
          barista.createTask(data)
          barista.closeTaskDialog()
        }}
        onRunOnce={(data) => {
          // Run once then show the schedule banner (opens Oracle with prompt).
          barista.closeTaskDialog()
          setActiveNav('oracle')
          setSearchQuery(data.prompt)
          // Leave the post-run re-open to the user via the schedule banner.
        }}
      />

      {/* Unsaved-changes warning when leaving the connector detail view */}
      <PopupModal
        isOpen={pendingExit !== null}
        onClose={() => setPendingExit(null)}
        title="Discard unsaved changes?"
        body="Your unsaved table and column descriptions will be lost. This action can't be undone."
        primaryLabel="Discard changes"
        primaryVariant="danger"
        secondaryLabel="Keep editing"
        onConfirm={() => {
          const exit = pendingExit
          setPendingExit(null)
          setConnectorResetSignal((n) => n + 1)
          setConnectorDirty(false)
          exit?.()
        }}
      />


      {/* Locked test → Contact sales: the address to mail, not a purchase flow */}
      <ContactSalesDialog
        isOpen={contactSalesTest !== null}
        onClose={() => setContactSalesTest(null)}
        testLabel={contactSalesTest?.label ?? ''}
        workspaceName="BlueStacks Studio"
      />

      {/* Review presets, one collapsed dock. Rows are chosen by the screen in
          view: the plan anywhere in Testing, the library fixture where a
          picker reads from it, the history fixture on a test with a History
          tab. The dock renders nothing when no row applies. */}
      <StateMachineDock
        rows={[
          ...(area === 'testing'
            ? [
                {
                  id: 'plan',
                  label: 'Plan',
                  value: testingPlanKey,
                  options: (Object.keys(TESTING_PLAN_LABELS) as TestingPlanKey[]).map((key) => ({
                    key,
                    label: TESTING_PLAN_LABELS[key],
                  })),
                  onChange: (key: string) => setTestingPlanKey(key as TestingPlanKey),
                  defaultKey: 'unlocked',
                } satisfies StateMachineDockRow,
              ]
            : []),
          ...(showLibraryRow
            ? [
                {
                  id: 'library',
                  label: 'Library',
                  value: libraryDemoState,
                  options: LIBRARY_DEMO_STATES.map((key) => ({
                    key,
                    label: LIBRARY_DEMO_LABELS[key],
                    note: LIBRARY_DEMO_NOTES[key],
                  })),
                  onChange: (key: string) => setLibraryDemoState(key as LibraryDemoState),
                } satisfies StateMachineDockRow,
              ]
            : []),
          ...(activeNav === 'oracle'
            ? [
                {
                  id: 'oracle',
                  label: 'Oracle',
                  value: oracleDemoState,
                  options: ORACLE_DEMO_STATES.map((key) => ({
                    key,
                    label: ORACLE_DEMO_LABELS[key],
                    note: ORACLE_DEMO_NOTES[key],
                  })),
                  onChange: (key: string) => applyOracleDemoState(key as OracleDemoState),
                } satisfies StateMachineDockRow,
              ]
            : []),
          ...(activeNav === 'radiologist'
            ? [
                {
                  id: 'radiologist',
                  label: 'Radiologist',
                  value: radiologistDemoState,
                  options: RADIOLOGIST_DEMO_STATES.map((key) => ({
                    key,
                    label: RADIOLOGIST_DEMO_LABELS[key],
                    note: RADIOLOGIST_DEMO_NOTES[key],
                  })),
                  onChange: (key: string) => applyRadiologistDemoState(key as RadiologistDemoState),
                } satisfies StateMachineDockRow,
              ]
            : []),
          ...(activeNav === 'uploads'
            ? [
                {
                  id: 'uploads',
                  label: 'Uploads',
                  value: uploadsDemoState,
                  options: UPLOADS_DEMO_STATES.map((key) => ({
                    key,
                    label: UPLOADS_DEMO_LABELS[key],
                    note: UPLOADS_DEMO_NOTES[key],
                  })),
                  onChange: (key: string) => setUploadsDemoState(key as UploadsDemoState),
                } satisfies StateMachineDockRow,
              ]
            : []),
          ...(activeNav === 'connectors'
            ? [
                {
                  id: 'connectors',
                  label: 'Connectors',
                  value: connectorsDemoState,
                  options: CONNECTORS_DEMO_STATES.map((key) => ({
                    key,
                    label: CONNECTORS_DEMO_LABELS[key],
                    note: CONNECTORS_DEMO_NOTES[key],
                  })),
                  onChange: (key: string) => setConnectorsDemoState(key as ConnectorsDemoState),
                } satisfies StateMachineDockRow,
              ]
            : []),
          /* Run while composing or inside a run; History on the history tab.
             Being inside a run outranks the tab: the tab bar is not even on
             screen there, so the last tab value says nothing about the view. */
          /* The AI tests' build picker — every state a build passes through. */
          ...((activeNav === 'ai-functional-test' || activeNav === 'ai-behavioural-test') && onTestHomeScreen && testingTab === 'new'
            ? [
                {
                  id: 'builds',
                  label: 'Builds',
                  value: buildsDemoState,
                  options: BUILDS_DEMO_STATES.map((key) => ({
                    key,
                    label: BUILDS_DEMO_LABELS[key],
                    note: BUILDS_DEMO_NOTES[key],
                  })),
                  onChange: (key: string) => setBuildsDemoState(key as BuildsDemoState),
                } satisfies StateMachineDockRow,
              ]
            : []),
          ...(area === 'testing' && HISTORY_STATE_NAVS.has(activeNav) && !onHistoryTab
            ? [
                {
                  id: 'run',
                  label: 'Run',
                  value: runDemoState,
                  /* Only User Test has a thread step between the composer and
                     the report; the rest go straight there. */
                  options: (activeNav === 'user-test'
                    ? RUN_DEMO_STATES
                    : RUN_DEMO_STATES_NO_THREAD
                  ).map((key) => ({
                    key,
                    label: RUN_DEMO_LABELS[key],
                    note: RUN_DEMO_NOTES[key],
                  })),
                  onChange: (key: string) => setRunDemoState(key as RunDemoState),
                } satisfies StateMachineDockRow,
              ]
            : []),
          ...(area === 'testing' && HISTORY_STATE_NAVS.has(activeNav) && onHistoryTab
            ? [
                {
                  id: 'history',
                  label: 'History',
                  /* "Reports only" is a User Test state; elsewhere it behaves as
                     seeded and the row shows it that way. */
                  value:
                    activeNav !== 'user-test' && historyDemoState === 'reports' ? 'seeded' : historyDemoState,
                  options: (activeNav === 'user-test' ? HISTORY_DEMO_STATES : HISTORY_DEMO_STATES_REPORTS_ONLY).map(
                    (key) => ({ key, label: HISTORY_DEMO_LABELS[key], note: HISTORY_DEMO_NOTES[key] }),
                  ),
                  onChange: (key: string) => setHistoryDemoState(key as HistoryDemoState),
                } satisfies StateMachineDockRow,
              ]
            : []),
        ]}
      />


    </div>
  )
}
