/**
 * connectorsDemoState — the Connectors screen's states, for the state machine dock.
 *
 * Unlike the library and history fixtures, this one holds no data of its own.
 * `connectorsStore` already models the real lifecycle — not-connected, syncing
 * while 6labs reviews the imported tables, connected with a GREEN or YELLOW
 * verdict, and errored — so each state here is just the store transition that
 * gets you there. Applying a state drives the same code paths the product does,
 * which is the point: a reviewer sees the real screen, not a mock of it.
 *
 * Where these show: mostly the connector's DETAIL view. The Connectors landing
 * page splits into "Active in your company" from a hardcoded SHARED_ACTIVE_IDS
 * list, not from this store, so BigQuery and Snowflake are always listed there
 * and its own flat-grid "nothing connected" branch is unreachable. What the
 * store does change on the landing page is the owner count per card — "1
 * connection" (the company's) vs "2 connections" (plus yours).
 *
 * Review chrome, not product.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'
import {
  disconnectBigQuery,
  disconnectSnowflake,
  loadMockBigQueryConnection,
  loadMockSnowflakeConnection,
  markBigQueryConnected,
  markBigQueryError,
  markBigQuerySyncComplete,
} from './state/connectorsStore'

export type ConnectorsDemoState = 'seeded' | 'none' | 'syncing' | 'review' | 'ready' | 'error'

export const CONNECTORS_DEMO_STATES: ConnectorsDemoState[] = [
  'seeded',
  'none',
  'syncing',
  'review',
  'ready',
  'error',
]

export const CONNECTORS_DEMO_LABELS: Record<ConnectorsDemoState, string> = {
  seeded: 'Seeded',
  /* Not "None": the page always lists the company's connections, so this state
     is "you have not added your own", which is a different screen. */
  none: 'Not yours',
  syncing: 'Syncing',
  review: 'Needs work',
  ready: 'Ready',
  error: 'Error',
}

export const CONNECTORS_DEMO_NOTES: Record<ConnectorsDemoState, string> = {
  seeded: 'Whatever the session has done so far — connecting, editing, disconnecting.',
  none: 'You have added neither — the cards show the company connection only, one owner each.',
  syncing: 'BigQuery connected, 6labs still reviewing the imported tables. Open the card to see it.',
  review: 'YELLOW verdict — open BigQuery: missing descriptions, flagged tables, ready/needs-work split.',
  ready: 'GREEN and queryable, Snowflake connected too. Open either card.',
  error: 'Permissions revoked after a healthy connection — open BigQuery for the reconnect path.',
}

const DEMO_PROJECT = 'sixlabs-qa'

/**
 * Drives `connectorsStore` into the shape the state names. 'seeded' is the
 * escape hatch: it applies nothing, so a reviewer who has been clicking through
 * the real onboarding keeps what they built.
 */
export function applyConnectorsDemoState(next: ConnectorsDemoState): void {
  switch (next) {
    case 'seeded':
      return

    case 'none':
      disconnectBigQuery()
      disconnectSnowflake()
      return

    case 'syncing':
      disconnectSnowflake()
      markBigQueryConnected({ projectId: DEMO_PROJECT, syncing: true })
      return

    case 'review':
      /* The sample payload is YELLOW already — one table short on descriptions. */
      disconnectSnowflake()
      loadMockBigQueryConnection()
      return

    case 'ready':
      loadMockBigQueryConnection()
      /* Override the verdict rather than hand-editing descriptions: the point
         is the GREEN screen, not the route to it. */
      markBigQuerySyncComplete({ verdict: 'GREEN', verdictReason: 'All tables ready.' })
      loadMockSnowflakeConnection()
      return

    case 'error':
      loadMockBigQueryConnection()
      markBigQueryError('permission-revoked')
      disconnectSnowflake()
      return
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────
/* Only the dock's own row selection lives here; the screen reads
   connectorsStore as it always did and needs no changes. */

let current: ConnectorsDemoState = 'seeded'
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setConnectorsDemoState(next: ConnectorsDemoState): void {
  current = next
  applyConnectorsDemoState(next)
  listeners.forEach((fn) => fn())
}

export const getConnectorsDemoState = (): ConnectorsDemoState => current

export function useConnectorsDemoState(): ConnectorsDemoState {
  return useSyncExternalStore(subscribe, getConnectorsDemoState, getConnectorsDemoState)
}
