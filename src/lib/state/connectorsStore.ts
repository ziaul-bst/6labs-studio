/**
 * connectorsStore — tiny module-level store for connector onboarding state.
 *
 * Models BigQuery's full lifecycle (not-connected → connected → error) plus a
 * registry of available connectors used by the chat-flyout "Add connector"
 * submenu. Persists to localStorage so the prototype survives page refresh.
 *
 * Code-first prototype only — replace with real per-workspace API state when
 * the backend lands.
 */

import { useSyncExternalStore } from 'react'

// ─── BigQuery connection model ───────────────────────────────────────────────

export type BigQueryErrorReason =
  | 'permission-revoked'
  | 'credentials-expired'
  | 'project-not-found'
  | 'network'
  | 'unknown'

export type BigQueryVerdict = 'GREEN' | 'YELLOW' | 'RED'

export interface BigQueryColumn {
  name: string
  type: string
  description: string
}

export interface BigQueryTable {
  fqn: string
  dataset: string
  tableId: string
  rows: number
  bytes: number
  description: string
  columns: BigQueryColumn[]
  /** Backend verdict for this table — GREEN ready, YELLOW needs more descriptions. */
  verdict: BigQueryVerdict
  verdictReasons: string[]
  /** Optional LLM-authored analyst report. Available even though it sits outside the v1 scope. */
  llmSummary?: string
}

export type BigQueryConnection =
  | { kind: 'not-connected' }
  | {
      kind: 'connected'
      projectId: string
      saEmail?: string
      onboardedAt: number
      /** True while the 6labs team's internal table review is in progress. */
      syncing: boolean
      /** Aggregate verdict across all imported tables. */
      verdict: BigQueryVerdict
      verdictReason: string
      /** ms epoch — null until the first successful refresh. */
      lastRefreshedAt: number | null
      /** Imported tables with editable table-level + column-level descriptions. */
      tables: BigQueryTable[]
      /** True when the connection is shared with the whole organisation.
       *  Now always true — every workspace member has access (no opt-out). */
      orgWideAccess: boolean
      /** Owner's choice: when true, teammates can edit this connection
       *  (descriptions etc.) — not just query it. Defaults to false. */
      orgWideEdit?: boolean
      /** fqn of the single table selected for chat queries. Only one table can
       *  be queried at a time, so this is single-select (not a multi-toggle). */
      selectedTableFqn: string | null
      /** GCP project the chat queries against (single-select in the composer
       *  connector menu). Defaults to `projectId` when unset. */
      selectedProjectId?: string | null
    }
  | {
      kind: 'error'
      projectId: string
      reason: BigQueryErrorReason
      /** ms epoch of the last known healthy state, if any. */
      lastRefreshedAt: number | null
    }

// ─── Snowflake connection model ──────────────────────────────────────────────
// Snowflake uses RSA key-pair auth (no credential-file upload). 6labs holds the
// private key; the client registers our public key against a read-only user and
// hands back four non-sensitive connection details. The post-connect table model
// is the same warehouse shape as BigQuery (reuses BigQueryTable/Column/Verdict).

export type SnowflakeErrorReason =
  | 'key-not-registered' // public key isn't set on the user (DESC USER shows no RSA_PUBLIC_KEY)
  | 'account-not-found' // bad account identifier / region
  | 'permission-denied' // role lacks SELECT on the schema
  | 'write-access-rejected' // user/role has write/admin scope — 6labs requires read-only
  | 'network'
  | 'unknown'

/** The four non-sensitive connection details the client returns (PDF Step 4). */
export interface SnowflakeConnectionDetails {
  /** e.g. xy12345.us-east-1 */
  accountIdentifier: string
  username: string
  warehouse: string
  database: string
}

export type SnowflakeConnection =
  | { kind: 'not-connected' }
  | ({
      kind: 'connected'
      onboardedAt: number
      syncing: boolean
      verdict: BigQueryVerdict
      verdictReason: string
      lastRefreshedAt: number | null
      tables: BigQueryTable[]
      /** Always true — every workspace member can query (no opt-out). */
      orgWideAccess: boolean
      /** Owner's choice: when true, teammates can edit this connection
       *  (descriptions etc.) — not just query it. Defaults to false. */
      orgWideEdit?: boolean
      selectedTableFqn: string | null
      /** Database the chat queries against (single-select in the composer
       *  connector menu). Defaults to `database` when unset. */
      selectedDatabase?: string | null
    } & SnowflakeConnectionDetails)
  | ({
      kind: 'error'
      reason: SnowflakeErrorReason
      lastRefreshedAt: number | null
    } & SnowflakeConnectionDetails)

// ─── Connector registry (mirrors CONNECTORS in ContextConnectorsView) ────────

/** A single-select query scope shown under a connector in the composer menu.
 *  For BigQuery this is a GCP project; for Snowflake a database. */
export interface ConnectorScope {
  id: string
  label: string
}

export interface OnboardedConnector {
  id: string
  label: string
  /** Secondary caption shown in the flyout (e.g. project id) */
  secondary?: string
  /** What the scope list represents — drives the "Select a …" header. */
  scopeKind: 'project' | 'database' | 'account'
  /** Single-select scope list (radio) the chat queries against. */
  scopes: ConnectorScope[]
  /** Currently-selected scope id. */
  selectedScopeId: string | null
}

// Mock scope lists for the composer menu. A real backend would return the
// projects/databases the read-only credential can see; the prototype seeds a
// realistic spread so the single-select radio has something to choose from.
const BQ_MOCK_PROJECTS = ['labs-demo-1', 'ultron-497407', 'sixlabs-qa', 'sixlabs-prod']

/** Returns the mock scope list with the live onboarded scope guaranteed present. */
function withLiveScope(mock: string[], live: string): string[] {
  return mock.includes(live) ? mock : [live, ...mock]
}

export interface AvailableConnector {
  id: string
  label: string
}

export const AVAILABLE_CONNECTORS: AvailableConnector[] = [
  { id: 'bigquery', label: 'BigQuery' },
  { id: 'snowflake', label: 'Snowflake' },
  { id: 'appsflyer', label: 'AppsFlyer' },
  { id: 'jira', label: 'Jira' },
  { id: 'slack', label: 'Slack' },
  { id: 'discord', label: 'Discord' },
  { id: 'facebook-ads', label: 'Facebook Ads' },
]

// ─── Store ───────────────────────────────────────────────────────────────────

interface ConnectorsState {
  bigQuery: BigQueryConnection
  snowflake: SnowflakeConnection
}

const STORAGE_KEY = '6labs.connectors.v3'

const NOT_CONNECTED: BigQueryConnection = { kind: 'not-connected' }
const NOT_CONNECTED_SF: SnowflakeConnection = { kind: 'not-connected' }

// ─── Mock onboarding payload (from connector.json, 2026-05-11) ───────────────
// Used to seed a realistic post-connect state for the prototype. Mirrors the
// shape the backend returns from the `onboard` job and the `connector_cache`.

const MOCK_APP_CLICK_DATA: BigQueryTable = {
  fqn: 'sixlabs-qa.oracleDataSet.app_click_data',
  dataset: 'oracleDataSet',
  tableId: 'app_click_data',
  rows: 1_035_226,
  bytes: 427_425_713,
  description: '',
  verdict: 'YELLOW',
  verdictReasons: ['table description missing', '21/31 columns described (67%)'],
  columns: [
    { name: 'guid', type: 'STRING', description: 'Unique user or device GUID' },
    { name: 'app_pkg', type: 'STRING', description: 'name of the app that was clicked/launched.' },
    { name: 'created_at', type: 'TIMESTAMP', description: 'Event timestamp in UTC for when the click event was recorded.' },
    { name: 'prod_ver', type: 'STRING', description: 'BlueStacks/client product version at event time.' },
    { name: 'user_state', type: 'STRING', description: '' },
    { name: 'app_type', type: 'STRING', description: '' },
    { name: 'country', type: 'STRING', description: 'Country associated with event/user (usually 2-letter style country signal).' },
    { name: 'oem', type: 'STRING', description: 'Original Equipment Manufacturer ex: nxt, nxt_mac2.' },
    { name: 'email', type: 'STRING', description: 'User email' },
    { name: 'app_name', type: 'STRING', description: 'Human-readable app name at event time.' },
    { name: 'app_ver', type: 'STRING', description: 'App version code/string for the clicked app.' },
    { name: 'home_app_ver', type: 'STRING', description: '' },
    { name: 'utm_campaign', type: 'STRING', description: 'Source of acquisition for the user (ad, direct URL, influencer, etc.).' },
    { name: 'ip', type: 'STRING', description: 'IP address observed at event time.' },
    { name: 'install_id', type: 'STRING', description: 'Install-level identifier for player/app installation instance.' },
    { name: 'vm_id', type: 'STRING', description: 'Virtual machine instance identifier.' },
    { name: 'vm_name', type: 'STRING', description: 'VM display/name label. ex: Pie64_10, Nougat32_15, Rvc64_141, Tiramisu64_11.' },
    { name: 'google_aid', type: 'STRING', description: 'Google Advertising ID associated with runtime/user context.' },
    { name: 'android_id', type: 'STRING', description: 'Android device identifier exposed in runtime context.' },
    { name: 'machine_id', type: 'STRING', description: 'Host machine identifier.' },
    { name: 'version_machine_id', type: 'STRING', description: '' },
    { name: 'app_ver_name', type: 'STRING', description: '' },
    { name: 'app_category', type: 'STRING', description: 'Category label of app (game/tools/etc).' },
    { name: 'externalsource_campaignid', type: 'STRING', description: '' },
    { name: 'externalsource_version', type: 'STRING', description: '' },
    { name: 'image_name', type: 'STRING', description: 'Runtime image/build label. ex: Pie64, Nougat32, Tiramisu64.' },
    { name: 'hypervisor', type: 'STRING', description: 'Hypervisor/runtime backend type.' },
    { name: 'source', type: 'STRING', description: 'Immediate source component/package from which the click was triggered.' },
    { name: 'arg1', type: 'STRING', description: '' },
    { name: 'arg2', type: 'STRING', description: '' },
    { name: 'arg3', type: 'STRING', description: '' },
  ],
  llmSummary: `**Core Identity**: This table is a filtered slice of app click event data scoped to a single game (com.nexon.ma — MapleStory: Idle RPG), recorded during April 2026.

**Mandatory query constraints**
• app_pkg = 'com.nexon.ma' — 100% constant. Don't group by it.
• app_category = 'game_roleplaying' — 100% constant.
• vm_id = '0' — 100% constant. Static default.
• Time range is 2026-03-31 → 2026-04-30. Never use CURRENT_DATE() — always pin explicit April 2026 bounds.

**Unusable columns** (100% NULL — never SELECT or GROUP BY): user_state, app_type, home_app_ver, externalsource_campaignid, externalsource_version, arg1, arg2, arg3.

**Best grouping dimensions**: country (KR 31% / TW 25% / US 17%), utm_campaign, app_name (acts as locale proxy), oem (nxt 86% Windows / nxt_mac2 9% Mac), image_name.

**Watch-outs**: 8,975 unique guid across 50k rows — always COUNT(DISTINCT guid) for user counts, never COUNT(*). app_ver_name (1.7.1 / 1.8.1) is the human-readable version; app_ver is the internal build code.`,
}

export function getMockBigQueryConnection(): Extract<BigQueryConnection, { kind: 'connected' }> {
  return {
    kind: 'connected',
    projectId: 'sixlabs-qa',
    saEmail: 'bq-oracle-limited-access@sixlabs-qa.iam.gserviceaccount.com',
    onboardedAt: Date.parse('2026-05-11T07:24:53Z'),
    syncing: false,
    verdict: 'YELLOW',
    verdictReason: "1 table(s) YELLOW: ['sixlabs-qa.oracleDataSet.app_click_data']",
    lastRefreshedAt: Date.parse('2026-05-11T07:24:53Z'),
    tables: [MOCK_APP_CLICK_DATA],
    orgWideAccess: true,
    // Alex has granted edit access to the whole company on THIS connector —
    // demos the "Shared · you can edit" state. Snowflake's shared connection
    // (getMockSnowflakeConnection) is left view-only so both states are
    // visible across the two connectors without any viewer-perspective toggle.
    orgWideEdit: true,
    selectedTableFqn: MOCK_APP_CLICK_DATA.fqn,
  }
}

// ─── Mock Snowflake onboarding payload ───────────────────────────────────────
// Seeds a realistic post-connect state for the prototype. Two tables exercise
// the verdict system: one YELLOW (missing descriptions) and one GREEN (fully
// documented). FQNs follow Snowflake's DATABASE.SCHEMA.TABLE convention.

const MOCK_SF_SESSIONS: BigQueryTable = {
  fqn: 'GAME_TELEMETRY.PUBLIC.PLAYER_SESSIONS',
  dataset: 'PUBLIC',
  tableId: 'PLAYER_SESSIONS',
  rows: 8_412_905,
  bytes: 3_221_225_472,
  description: '',
  verdict: 'YELLOW',
  verdictReasons: ['table description missing', '6/9 columns described (67%)'],
  columns: [
    { name: 'SESSION_ID', type: 'VARCHAR', description: 'Unique identifier for a single play session.' },
    { name: 'PLAYER_ID', type: 'VARCHAR', description: 'Stable player identifier across devices.' },
    { name: 'STARTED_AT', type: 'TIMESTAMP_NTZ', description: 'UTC timestamp when the session began.' },
    { name: 'ENDED_AT', type: 'TIMESTAMP_NTZ', description: 'UTC timestamp when the session ended.' },
    { name: 'DURATION_SEC', type: 'NUMBER', description: 'Session length in seconds.' },
    { name: 'PLATFORM', type: 'VARCHAR', description: 'Client platform (android, ios, windows, mac).' },
    { name: 'GAME_PKG', type: 'VARCHAR', description: '' },
    { name: 'COUNTRY', type: 'VARCHAR', description: '' },
    { name: 'APP_VER', type: 'VARCHAR', description: '' },
  ],
  llmSummary: `**Core identity**: One row per player session for the cloud-gaming client, spanning all titles.

**Best grouping dimensions**: PLATFORM (windows 71% / android 22% / ios 5% / mac 2%), COUNTRY, GAME_PKG.

**Watch-outs**: DURATION_SEC has a long right tail — prefer median/percentiles over AVG. Count distinct players with COUNT(DISTINCT PLAYER_ID), never COUNT(*).`,
}

const MOCK_SF_REVENUE: BigQueryTable = {
  fqn: 'GAME_TELEMETRY.PUBLIC.IAP_REVENUE',
  dataset: 'PUBLIC',
  tableId: 'IAP_REVENUE',
  rows: 1_204_771,
  bytes: 524_288_000,
  description: 'In-app purchase transactions, one row per completed purchase, net of refunds.',
  verdict: 'GREEN',
  verdictReasons: [],
  columns: [
    { name: 'TXN_ID', type: 'VARCHAR', description: 'Unique transaction identifier.' },
    { name: 'PLAYER_ID', type: 'VARCHAR', description: 'Purchasing player identifier.' },
    { name: 'PURCHASED_AT', type: 'TIMESTAMP_NTZ', description: 'UTC timestamp of the completed purchase.' },
    { name: 'SKU', type: 'VARCHAR', description: 'Store SKU of the purchased item.' },
    { name: 'AMOUNT_USD', type: 'NUMBER', description: 'Net revenue in USD after store fees and refunds.' },
    { name: 'STORE', type: 'VARCHAR', description: 'Billing store (play, app_store, direct).' },
  ],
}

export function getMockSnowflakeConnection(): Extract<SnowflakeConnection, { kind: 'connected' }> {
  const tables = [MOCK_SF_SESSIONS, MOCK_SF_REVENUE]
  return {
    kind: 'connected',
    accountIdentifier: 'xy12345.us-east-1',
    username: 'SIXLABS_READONLY',
    warehouse: 'ANALYTICS_WH',
    database: 'GAME_TELEMETRY',
    onboardedAt: Date.parse('2026-06-05T07:24:53Z'),
    syncing: false,
    verdict: 'YELLOW',
    verdictReason: "1 table(s) YELLOW: ['GAME_TELEMETRY.PUBLIC.PLAYER_SESSIONS']",
    lastRefreshedAt: Date.parse('2026-06-05T07:24:53Z'),
    tables,
    orgWideAccess: true,
    // Left view-only (no orgWideEdit) so both permission states are visible
    // without a viewer-perspective toggle: Snowflake demos "View only",
    // BigQuery demos "Shared · you can edit" (see getMockBigQueryConnection).
    selectedTableFqn: MOCK_SF_REVENUE.fqn,
  }
}

// ─── Company-shared connections (finalized sharing model) ────────────────────
// Connectors are company-scoped: a connection set up by any teammate is active
// for everyone. The store slot above remains *your own* connection (what the
// onboarding modal writes); the shared connection below belongs to a teammate
// and is view-only for you. Additive — no existing consumer changes shape.

export interface ConnectionOwner {
  id: string
  name: string
}

/** The teammate who set up the company-wide warehouse connections. */
export const SHARED_CONNECTION_OWNER: ConnectionOwner = { id: 'alex', name: 'Alex Chen' }

/** The signed-in user (prototype mock). Owns whatever the onboarding flow connects. */
export const CURRENT_USER: ConnectionOwner = { id: 'you', name: 'You' }

/** Company-wide BigQuery connection — healthy, set up by Alex Chen. */
export function getSharedBigQueryConnection(): Extract<BigQueryConnection, { kind: 'connected' }> {
  return getMockBigQueryConnection()
}

/** Company-wide Snowflake connection — healthy, set up by Alex Chen.
 *  (The error-on-existing-account state stays reachable in Storybook via
 *  SnowflakeDetailView's error stories.) */
export function getSharedSnowflakeConnection(): SnowflakeConnection {
  return getMockSnowflakeConnection()
}

function readStorage(): ConnectorsState {
  if (typeof window === 'undefined') return { bigQuery: NOT_CONNECTED, snowflake: NOT_CONNECTED_SF }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { bigQuery: NOT_CONNECTED, snowflake: NOT_CONNECTED_SF }
    const parsed = JSON.parse(raw) as Partial<ConnectorsState>
    return {
      bigQuery:
        parsed.bigQuery && isValidConnection(parsed.bigQuery)
          ? parsed.bigQuery
          : NOT_CONNECTED,
      snowflake:
        parsed.snowflake && isValidConnection(parsed.snowflake)
          ? parsed.snowflake
          : NOT_CONNECTED_SF,
    }
  } catch {
    return { bigQuery: NOT_CONNECTED, snowflake: NOT_CONNECTED_SF }
  }
}

function isValidConnection(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false
  const k = (v as { kind?: unknown }).kind
  return k === 'not-connected' || k === 'connected' || k === 'error'
}

function writeStorage(s: ConnectorsState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* ignore quota / private-mode errors */
  }
}

let state: ConnectorsState = readStorage()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function setState(next: Partial<ConnectorsState>) {
  state = { ...state, ...next }
  writeStorage(state)
  emit()
}

// ─── BigQuery actions ────────────────────────────────────────────────────────

/**
 * Marks BigQuery as connected. After the modal's success screen this is
 * called with `syncing: true` (the 6labs team's review is just starting).
 * Once the table list is back, the same store update flips `syncing: false`
 * and replaces `tables` with whatever the backend returned.
 */
export function markBigQueryConnected(args: {
  projectId: string
  saEmail?: string
  syncing?: boolean
  orgWideAccess?: boolean
  orgWideEdit?: boolean
}) {
  const syncing = args.syncing ?? true
  const previous = state.bigQuery
  const carriedTables =
    previous.kind === 'connected' && previous.projectId === args.projectId
      ? previous.tables
      : []
  setState({
    bigQuery: {
      kind: 'connected',
      projectId: args.projectId,
      saEmail: args.saEmail,
      onboardedAt:
        previous.kind === 'connected' && previous.projectId === args.projectId
          ? previous.onboardedAt
          : Date.now(),
      syncing,
      verdict: syncing
        ? 'YELLOW'
        : previous.kind === 'connected'
          ? previous.verdict
          : 'YELLOW',
      verdictReason: syncing ? 'Importing tables…' : '',
      lastRefreshedAt: syncing ? null : Date.now(),
      tables: carriedTables,
      orgWideAccess:
        args.orgWideAccess ??
        (previous.kind === 'connected' ? previous.orgWideAccess : true),
      orgWideEdit:
        args.orgWideEdit ??
        (previous.kind === 'connected' ? previous.orgWideEdit : false),
      selectedTableFqn:
        previous.kind === 'connected' ? previous.selectedTableFqn : null,
    },
  })
}

/** Drops the seeded mock tables into the store once the "sync" timer fires. */
export function markBigQuerySyncComplete(payload?: {
  tables?: BigQueryTable[]
  verdict?: BigQueryVerdict
  verdictReason?: string
}) {
  if (state.bigQuery.kind !== 'connected') return
  const tables = payload?.tables ?? getMockBigQueryConnection().tables
  const verdict = payload?.verdict ?? computeVerdict(tables)
  // Keep the prior selection if it still exists; otherwise default to the
  // first imported table so the chat always has a queryable table selected.
  const prevSelected = state.bigQuery.selectedTableFqn
  const selectedTableFqn =
    prevSelected && tables.some((t) => t.fqn === prevSelected)
      ? prevSelected
      : (tables[0]?.fqn ?? null)
  setState({
    bigQuery: {
      ...state.bigQuery,
      syncing: false,
      tables,
      verdict,
      verdictReason: payload?.verdictReason ?? buildVerdictReason(tables),
      lastRefreshedAt: Date.now(),
      selectedTableFqn,
    },
  })
}

// ─── Table + column edits ────────────────────────────────────────────────────

export function updateTableDescription(fqn: string, description: string) {
  if (state.bigQuery.kind !== 'connected') return
  const tables = state.bigQuery.tables.map((t) =>
    t.fqn === fqn ? recomputeTable({ ...t, description }) : t,
  )
  setState({
    bigQuery: {
      ...state.bigQuery,
      tables,
      verdict: computeVerdict(tables),
      verdictReason: buildVerdictReason(tables),
    },
  })
}

export function updateColumnDescription(
  fqn: string,
  columnName: string,
  description: string,
) {
  if (state.bigQuery.kind !== 'connected') return
  const tables = state.bigQuery.tables.map((t) => {
    if (t.fqn !== fqn) return t
    const columns = t.columns.map((c) =>
      c.name === columnName ? { ...c, description } : c,
    )
    return recomputeTable({ ...t, columns })
  })
  setState({
    bigQuery: {
      ...state.bigQuery,
      tables,
      verdict: computeVerdict(tables),
      verdictReason: buildVerdictReason(tables),
    },
  })
}

export function setBigQueryOrgWideAccess(value: boolean) {
  if (state.bigQuery.kind !== 'connected') return
  setState({
    bigQuery: { ...state.bigQuery, orgWideAccess: value },
  })
}

/** Owner's later toggle: whether teammates can edit this connection. */
export function setBigQueryOrgWideEdit(value: boolean) {
  if (state.bigQuery.kind !== 'connected') return
  setState({
    bigQuery: { ...state.bigQuery, orgWideEdit: value },
  })
}

/** Selects the single table the chat will query. Persisted as a user
 *  preference (localStorage stands in for the backend in this prototype). */
export function setBigQuerySelectedTable(fqn: string) {
  if (state.bigQuery.kind !== 'connected') return
  setState({
    bigQuery: { ...state.bigQuery, selectedTableFqn: fqn },
  })
}

/** Selects the GCP project the chat queries against (composer menu). */
export function setBigQuerySelectedProject(projectId: string) {
  if (state.bigQuery.kind !== 'connected') return
  setState({
    bigQuery: { ...state.bigQuery, selectedProjectId: projectId },
  })
}

function recomputeTable(t: BigQueryTable): BigQueryTable {
  const described = t.columns.filter((c) => c.description.trim().length > 0).length
  const total = t.columns.length
  const tableMissing = t.description.trim().length === 0
  const reasons: string[] = []
  if (tableMissing) reasons.push('table description missing')
  if (described < total)
    reasons.push(`${described}/${total} columns described (${total ? Math.round((described / total) * 100) : 0}%)`)
  const verdict: BigQueryVerdict = !tableMissing && described === total ? 'GREEN' : 'YELLOW'
  return { ...t, verdict, verdictReasons: reasons }
}

function computeVerdict(tables: BigQueryTable[]): BigQueryVerdict {
  if (tables.length === 0) return 'YELLOW'
  if (tables.every((t) => t.verdict === 'GREEN')) return 'GREEN'
  return 'YELLOW'
}

function buildVerdictReason(tables: BigQueryTable[]): string {
  const yellow = tables.filter((t) => t.verdict === 'YELLOW').map((t) => t.fqn)
  if (yellow.length === 0) return 'All tables documented and ready.'
  return `${yellow.length} table(s) YELLOW: [${yellow.map((f) => `'${f}'`).join(', ')}]`
}

export function markBigQueryError(reason: BigQueryErrorReason) {
  const projectId =
    state.bigQuery.kind === 'not-connected' ? '' : state.bigQuery.projectId
  const lastRefreshedAt =
    state.bigQuery.kind === 'not-connected' ? null : state.bigQuery.lastRefreshedAt
  setState({
    bigQuery: { kind: 'error', projectId, reason, lastRefreshedAt },
  })
}

export function disconnectBigQuery() {
  setState({ bigQuery: NOT_CONNECTED })
}

// Legacy shim for existing call sites that just toggle a project id.
export function setBigQueryConnected(projectId: string | null) {
  if (!projectId) {
    disconnectBigQuery()
    return
  }
  markBigQueryConnected({ projectId, syncing: true })
}

/** Seed the store with the sample sixlabs-qa payload — used by Storybook + demos. */
export function loadMockBigQueryConnection() {
  setState({ bigQuery: getMockBigQueryConnection() })
}

// ─── Snowflake actions ───────────────────────────────────────────────────────

/**
 * Marks Snowflake as connected. After the modal's success screen this is called
 * with `syncing: true` (table import just starting). The follow-up
 * markSnowflakeSyncComplete() flips syncing off and drops in the imported tables.
 */
export function markSnowflakeConnected(args: SnowflakeConnectionDetails & {
  syncing?: boolean
  orgWideAccess?: boolean
  orgWideEdit?: boolean
}) {
  const syncing = args.syncing ?? true
  const previous = state.snowflake
  const sameAccount =
    previous.kind !== 'not-connected' &&
    previous.accountIdentifier === args.accountIdentifier
  const carriedTables =
    previous.kind === 'connected' && sameAccount ? previous.tables : []
  setState({
    snowflake: {
      kind: 'connected',
      accountIdentifier: args.accountIdentifier,
      username: args.username,
      warehouse: args.warehouse,
      database: args.database,
      onboardedAt:
        previous.kind === 'connected' && sameAccount ? previous.onboardedAt : Date.now(),
      syncing,
      verdict: syncing
        ? 'YELLOW'
        : previous.kind === 'connected'
          ? previous.verdict
          : 'YELLOW',
      verdictReason: syncing ? 'Importing tables…' : '',
      lastRefreshedAt: syncing ? null : Date.now(),
      tables: carriedTables,
      orgWideAccess:
        args.orgWideAccess ??
        (previous.kind === 'connected' ? previous.orgWideAccess : true),
      orgWideEdit:
        args.orgWideEdit ??
        (previous.kind === 'connected' ? previous.orgWideEdit : false),
      selectedTableFqn:
        previous.kind === 'connected' ? previous.selectedTableFqn : null,
    },
  })
}

/** Drops the seeded mock tables into the store once the "sync" timer fires. */
export function markSnowflakeSyncComplete(payload?: {
  tables?: BigQueryTable[]
  verdict?: BigQueryVerdict
  verdictReason?: string
}) {
  if (state.snowflake.kind !== 'connected') return
  const tables = payload?.tables ?? getMockSnowflakeConnection().tables
  const verdict = payload?.verdict ?? computeVerdict(tables)
  const prevSelected = state.snowflake.selectedTableFqn
  const selectedTableFqn =
    prevSelected && tables.some((t) => t.fqn === prevSelected)
      ? prevSelected
      : (tables[0]?.fqn ?? null)
  setState({
    snowflake: {
      ...state.snowflake,
      syncing: false,
      tables,
      verdict,
      verdictReason: payload?.verdictReason ?? buildVerdictReason(tables),
      lastRefreshedAt: Date.now(),
      selectedTableFqn,
    },
  })
}

export function updateSnowflakeTableDescription(fqn: string, description: string) {
  if (state.snowflake.kind !== 'connected') return
  const tables = state.snowflake.tables.map((t) =>
    t.fqn === fqn ? recomputeTable({ ...t, description }) : t,
  )
  setState({
    snowflake: {
      ...state.snowflake,
      tables,
      verdict: computeVerdict(tables),
      verdictReason: buildVerdictReason(tables),
    },
  })
}

export function updateSnowflakeColumnDescription(
  fqn: string,
  columnName: string,
  description: string,
) {
  if (state.snowflake.kind !== 'connected') return
  const tables = state.snowflake.tables.map((t) => {
    if (t.fqn !== fqn) return t
    const columns = t.columns.map((c) =>
      c.name === columnName ? { ...c, description } : c,
    )
    return recomputeTable({ ...t, columns })
  })
  setState({
    snowflake: {
      ...state.snowflake,
      tables,
      verdict: computeVerdict(tables),
      verdictReason: buildVerdictReason(tables),
    },
  })
}

export function setSnowflakeOrgWideAccess(value: boolean) {
  if (state.snowflake.kind !== 'connected') return
  setState({ snowflake: { ...state.snowflake, orgWideAccess: value } })
}

/** Owner's later toggle: whether teammates can edit this connection. */
export function setSnowflakeOrgWideEdit(value: boolean) {
  if (state.snowflake.kind !== 'connected') return
  setState({ snowflake: { ...state.snowflake, orgWideEdit: value } })
}

export function setSnowflakeSelectedTable(fqn: string) {
  if (state.snowflake.kind !== 'connected') return
  setState({ snowflake: { ...state.snowflake, selectedTableFqn: fqn } })
}

/** Selects the database the chat queries against (composer menu). */
export function setSnowflakeSelectedDatabase(database: string) {
  if (state.snowflake.kind !== 'connected') return
  setState({ snowflake: { ...state.snowflake, selectedDatabase: database } })
}

export function markSnowflakeError(reason: SnowflakeErrorReason) {
  const prev = state.snowflake
  const details: SnowflakeConnectionDetails =
    prev.kind === 'not-connected'
      ? { accountIdentifier: '', username: '', warehouse: '', database: '' }
      : {
          accountIdentifier: prev.accountIdentifier,
          username: prev.username,
          warehouse: prev.warehouse,
          database: prev.database,
        }
  const lastRefreshedAt = prev.kind === 'connected' ? prev.lastRefreshedAt : null
  setState({ snowflake: { kind: 'error', reason, lastRefreshedAt, ...details } })
}

export function disconnectSnowflake() {
  setState({ snowflake: NOT_CONNECTED_SF })
}

/** Seed the store with the sample Snowflake payload — used by Storybook + demos. */
export function loadMockSnowflakeConnection() {
  setState({ snowflake: getMockSnowflakeConnection() })
}

// ─── Subscriptions / hooks ───────────────────────────────────────────────────

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): ConnectorsState {
  return state
}

export function useConnectorsState(): ConnectorsState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useBigQueryConnection(): BigQueryConnection {
  return useConnectorsState().bigQuery
}

export function useSnowflakeConnection(): SnowflakeConnection {
  return useConnectorsState().snowflake
}

/**
 * Hook returning the onboarded-connector list in the shape ChatActionMenuFlyout
 * expects. Connectors in error state are excluded — they're surfaced on their
 * detail page instead so the user can fix them.
 */
export function useOnboardedConnectors(): OnboardedConnector[] {
  const bq = useBigQueryConnection()
  const sf = useSnowflakeConnection()
  const list: OnboardedConnector[] = []
  if (bq.kind === 'connected') {
    const projects = withLiveScope(BQ_MOCK_PROJECTS, bq.projectId)
    list.push({
      id: 'bigquery',
      label: 'BigQuery',
      secondary: bq.projectId,
      scopeKind: 'project',
      scopes: projects.map((p) => ({ id: p, label: p })),
      selectedScopeId: bq.selectedProjectId ?? bq.projectId,
    })
  }
  if (sf.kind === 'connected') {
    // Connections are picked by ACCOUNT (username @account) under the sharing
    // model — the company connection plus your own, deduped.
    const shared = getSharedSnowflakeConnection()
    const accounts: ConnectorScope[] = []
    if (shared.kind !== 'not-connected') {
      accounts.push({
        id: `${shared.username}@${shared.accountIdentifier}`,
        label: `${shared.username} @${shared.accountIdentifier}`,
      })
    }
    const ownId = `${sf.username}@${sf.accountIdentifier}`
    if (!accounts.some((a) => a.id === ownId)) {
      accounts.push({ id: ownId, label: `${sf.username} @${sf.accountIdentifier}` })
    }
    list.push({
      id: 'snowflake',
      label: 'Snowflake',
      secondary: `${sf.username} @${sf.accountIdentifier}`,
      scopeKind: 'account',
      scopes: accounts,
      selectedScopeId:
        sf.selectedDatabase && accounts.some((a) => a.id === sf.selectedDatabase)
          ? sf.selectedDatabase
          : ownId,
    })
  }
  return list
}

export function useAvailableConnectors(): AvailableConnector[] {
  const bq = useBigQueryConnection()
  const sf = useSnowflakeConnection()
  // In error state we still treat a connector as "needs attention" — keep it out
  // of the "Add connector" submenu so the user doesn't double-onboard.
  const onboardedIds = new Set<string>()
  if (bq.kind === 'connected' || bq.kind === 'error') {
    onboardedIds.add('bigquery')
  }
  if (sf.kind === 'connected' || sf.kind === 'error') {
    onboardedIds.add('snowflake')
  }
  return AVAILABLE_CONNECTORS.filter((c) => !onboardedIds.has(c.id))
}

// ─── "Request onboarding" event ──────────────────────────────────────────────

type OnboardingHandler = (connectorId: string) => void
const onboardingHandlers = new Set<OnboardingHandler>()

export function requestConnectorOnboarding(connectorId: string) {
  onboardingHandlers.forEach((h) => h(connectorId))
}

export function onConnectorOnboardingRequest(handler: OnboardingHandler) {
  onboardingHandlers.add(handler)
  return () => {
    onboardingHandlers.delete(handler)
  }
}
