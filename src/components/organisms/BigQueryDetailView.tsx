/**
 * BigQueryDetailView — Detail page for the BigQuery connector. Wraps the
 * generic ConnectorDetailView for the "not connected" state and replaces
 * its body with state-specific UI once onboarding has happened.
 *
 * Post 2026-05-18 review:
 *  • The status pill is now tri-state (Ready / Needs descriptions / Error) so
 *    YELLOW is visible to the user.
 *  • The imported table list is rendered with per-table verdict and editable
 *    table + column descriptions — Oracle answers depend on them.
 *  • LLM-authored analyst summaries surface in a collapsed section so the
 *    initial scope (basic imports + editable descriptions) stays the default.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

// Adds/removes `key` in a pending-edits record. Drops the key when the next
// value matches `committed` so an edit that lands back at the saved value
// stops contributing to the dirty flag.
function stagePending(
  prev: Record<string, string>,
  key: string,
  next: string,
  committed: string,
): Record<string, string> {
  if (next === committed) {
    if (!(key in prev)) return prev
    const { [key]: _omit, ...rest } = prev
    return rest
  }
  if (prev[key] === next) return prev
  return { ...prev, [key]: next }
}
import Button from '../ui/Button'
import { ConnectorDetailView, type ConnectorDetail } from './ConnectorDetailView'
import { ConnectionStatusPill } from '../atoms/ConnectionStatusPill'
import {
  WarehouseTableCard,
  InfoBanner,
  SummaryGrid,
  formatRelative,
  verdictToPillVariant,
  type BannerTone,
} from '../molecules/WarehouseTableCard'
import {
  setBigQueryOrgWideAccess,
  updateColumnDescription,
  updateTableDescription,
  type BigQueryConnection,
  type BigQueryErrorReason,
} from '../../lib/state/connectorsStore'

export interface BigQueryDetailViewProps {
  connector: ConnectorDetail
  connection: BigQueryConnection

  /** Open the onboarding modal in "idle" state (first-time connect). */
  onConnect?: () => void
  /** Open the onboarding modal in "idle" state for re-auth. */
  onReconnect?: () => void
  /** Open the onboarding modal pre-focused on the file dropzone. */
  onReuploadCredentials?: () => void
  /** Kick off another internal table review pass. */
  onRefresh?: () => void
  /** Retry the last failing call (network errors). */
  onRetry?: () => void
  /** Remove the connection entirely. */
  onDisconnect?: () => void
  /** Notifies parent when the unsaved-changes flag flips, so the parent can
   *  intercept navigation and prompt the user. */
  onDirtyChange?: (dirty: boolean) => void
  /** Imperative reset signal — when this number changes, pending edits are
   *  thrown away. Used by the parent's "Discard & leave" confirmation. */
  resetSignal?: number

  /** Storybook-only: open the disconnect-confirmation popup on mount. */
  defaultDisconnectConfirmOpen?: boolean

  /** When true, hides description-editing affordances (FieldEditor inputs,
   *  Save bar) for viewers without edit access. Refresh stays available so
   *  viewers can re-sync. Defaults to false — production is unaffected. */
  readOnly?: boolean
  /** When false, hides connection-management actions (Disconnect) regardless
   *  of `readOnly` — a teammate can be granted description-edit access to a
   *  connection they don't own, but can't disconnect or repair someone else's
   *  credentials. Defaults to true — production is unaffected. */
  canManage?: boolean

  className?: string
}

export function BigQueryDetailView({
  connector,
  connection,
  onConnect,
  onReconnect,
  onReuploadCredentials,
  onRefresh,
  onRetry,
  onDisconnect,
  onDirtyChange,
  resetSignal,
  defaultDisconnectConfirmOpen,
  readOnly = false,
  canManage = true,
  className,
}: BigQueryDetailViewProps) {
  // Pending edits buffer — table descriptions, column descriptions and the
  // org-wide-access toggle stay local until the user clicks "Save changes".
  // Keyed by fqn (tables) and `${fqn}::${columnName}` (columns).
  const [pendingTableDescs, setPendingTableDescs] = useState<Record<string, string>>({})
  const [pendingColumnDescs, setPendingColumnDescs] = useState<Record<string, string>>({})
  const [pendingOrgWide, setPendingOrgWide] = useState<boolean | null>(null)
  // Disconnect removes the connection entirely, so it's gated behind a
  // confirmation popup. Kept above the early return to satisfy the rules of hooks.
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(
    defaultDisconnectConfirmOpen ?? false,
  )

  const isError = connection.kind === 'error'
  const isSyncing = connection.kind === 'connected' && connection.syncing
  const dirty =
    connection.kind === 'connected' &&
    (Object.keys(pendingTableDescs).length > 0 ||
      Object.keys(pendingColumnDescs).length > 0 ||
      (pendingOrgWide !== null && pendingOrgWide !== connection.orgWideAccess))

  // Reset the buffer when we switch to a different connection state — avoids
  // stale edits surviving a disconnect/reconnect cycle.
  useEffect(() => {
    setPendingTableDescs({})
    setPendingColumnDescs({})
    setPendingOrgWide(null)
  }, [connection.kind])

  // Notify parent when the dirty flag flips so it can intercept navigation.
  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  // Imperative reset from parent (used by the unsaved-changes confirm modal).
  useEffect(() => {
    if (resetSignal === undefined) return
    setPendingTableDescs({})
    setPendingColumnDescs({})
    setPendingOrgWide(null)
  }, [resetSignal])

  // Warn on browser-level navigation away (tab close, refresh, deep link).
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // Not connected — defer to the generic "About / Benefits / Steps" template.
  if (connection.kind === 'not-connected') {
    return (
      <ConnectorDetailView
        connector={connector}
        onConnect={onConnect}
        className={className}
      />
    )
  }

  const handleSave = () => {
    if (connection.kind !== 'connected') return
    Object.entries(pendingTableDescs).forEach(([fqn, desc]) => {
      updateTableDescription(fqn, desc)
    })
    Object.entries(pendingColumnDescs).forEach(([key, desc]) => {
      const sep = key.indexOf('::')
      if (sep === -1) return
      const fqn = key.slice(0, sep)
      const col = key.slice(sep + 2)
      updateColumnDescription(fqn, col, desc)
    })
    if (pendingOrgWide !== null && pendingOrgWide !== connection.orgWideAccess) {
      setBigQueryOrgWideAccess(pendingOrgWide)
    }
    setPendingTableDescs({})
    setPendingColumnDescs({})
    setPendingOrgWide(null)
  }

  const handleDiscard = () => {
    setPendingTableDescs({})
    setPendingColumnDescs({})
    setPendingOrgWide(null)
  }

  const pendingCount =
    Object.keys(pendingTableDescs).length +
    Object.keys(pendingColumnDescs).length +
    (pendingOrgWide !== null &&
    connection.kind === 'connected' &&
    pendingOrgWide !== connection.orgWideAccess
      ? 1
      : 0)

  return (
    <div
      className={['flex flex-col w-full flex-1', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <Header
        connector={connector}
        connection={connection}
        primaryAction={
          isError ? (
            <PrimaryErrorAction
              connection={connection}
              onReconnect={onReconnect}
              onReuploadCredentials={onReuploadCredentials}
              onRetry={onRetry}
            />
          ) : !isSyncing ? (
            <Button
              variant="outline"
              size="lg"
              onClick={onRefresh}
            >
              Refresh
            </Button>
          ) : null
        }
        secondaryAction={
          !readOnly && canManage ? (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDisconnectConfirmOpen(true)}
            >
              Disconnect
            </Button>
          ) : undefined
        }
      />

      {/* Disconnect confirmation — removes the connection entirely, so we
          always confirm first. */}
      {disconnectConfirmOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-m"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bq-disconnect-confirm-title"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDisconnectConfirmOpen(false)}
              aria-hidden
            />
            <div
              className="relative flex flex-col gap-l bg-bg-elements rounded-m shadow-normal p-l w-[440px]"
            >
              <div className="flex flex-col gap-xs">
                <span
                  id="bq-disconnect-confirm-title"
                  className="font-display text-l font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Disconnect BigQuery?
                </span>
                <span
                  className="font-body text-s leading-[1.5]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Oracle will lose access to these tables immediately, and every
                  teammate sharing this connection loses access too. You&rsquo;ll
                  need to reconnect and re-import tables to restore it.
                </span>
              </div>
              <div className="flex gap-m w-full">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={() => setDisconnectConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    setDisconnectConfirmOpen(false)
                    onDisconnect?.()
                  }}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Body */}
      <div className="flex flex-col gap-[40px] mt-[60px] w-full">
        {connection.kind === 'connected' && (
          <ConnectedBody
            connection={connection}
            readOnly={readOnly}
            pendingTableDescs={pendingTableDescs}
            pendingColumnDescs={pendingColumnDescs}
            onEditTable={(fqn, value) => {
              const committed =
                connection.tables.find((t) => t.fqn === fqn)?.description ?? ''
              setPendingTableDescs((prev) => stagePending(prev, fqn, value, committed))
            }}
            onEditColumn={(fqn, col, value) => {
              const table = connection.tables.find((t) => t.fqn === fqn)
              const committed = table?.columns.find((c) => c.name === col)?.description ?? ''
              setPendingColumnDescs((prev) =>
                stagePending(prev, `${fqn}::${col}`, value, committed),
              )
            }}
          />
        )}
        {connection.kind === 'error' && (
          <ErrorBody
            projectId={connection.projectId}
            reason={connection.reason}
            lastRefreshedAt={connection.lastRefreshedAt}
            onReconnect={onReconnect}
            onReuploadCredentials={onReuploadCredentials}
            onRetry={onRetry}
          />
        )}
      </div>

      {connection.kind === 'connected' && !isSyncing && !readOnly && (
        <SaveBottomBar
          dirty={dirty}
          pendingCount={pendingCount}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      )}
    </div>
  )
}

// ─── SaveBottomBar ───────────────────────────────────────────────────────────

function SaveBottomBar({
  dirty,
  pendingCount,
  onSave,
  onDiscard,
}: {
  dirty: boolean
  pendingCount: number
  onSave: () => void
  onDiscard: () => void
}) {
  return (
    <div
      className="sticky bottom-0 -mx-[32px] -mb-[80px] mt-auto h-[80px] flex items-center justify-between pl-[32px] pr-[20px] z-30"
      style={{
        backgroundColor: 'white',
        borderTop: '1px solid var(--bg-subtle)',
      }}
    >
      <span
        className="font-body text-s"
        style={{ color: 'var(--text-secondary)' }}
      >
        {pendingCount === 0
          ? 'No unsaved changes'
          : `${pendingCount} unsaved change${pendingCount === 1 ? '' : 's'}`}
      </span>
      <div className="flex items-center gap-s">
        {dirty && (
          <Button variant="outline" size="lg" onClick={onDiscard}>
            Discard
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          onClick={onSave}
          disabled={!dirty}
        >
          Save changes
        </Button>
      </div>
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header({
  connector,
  connection,
  primaryAction,
  secondaryAction,
}: {
  connector: ConnectorDetail
  connection: BigQueryConnection
  primaryAction: ReactNode
  secondaryAction: ReactNode
}) {
  const projectId =
    connection.kind === 'not-connected' ? null : connection.projectId
  const pillVariant: 'ready' | 'partial' | 'error' | 'disconnected' =
    connection.kind === 'error'
      ? 'error'
      : connection.kind === 'connected'
        ? connection.syncing
          ? 'partial'
          : verdictToPillVariant(connection.verdict)
        : 'disconnected'

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex gap-m items-center">
        <div
          className="shrink-0 size-[72px] rounded-xl overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: connector.iconTint }}
        >
          {connector.icon}
        </div>

        <div className="flex flex-col gap-s items-start">
          <div className="flex items-center gap-s">
            <h1
              className="font-display text-xl font-semibold whitespace-nowrap leading-normal"
              style={{ color: 'var(--text-primary)' }}
            >
              {connector.name}
            </h1>
            {pillVariant !== 'partial' && (
              <ConnectionStatusPill variant={pillVariant} />
            )}
          </div>
          <div className="flex gap-xs items-center flex-wrap">
            {connector.tags.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center justify-center px-s py-xxs rounded-[20px] font-body text-s font-medium whitespace-nowrap"
                style={
                  tag.variant === 'brand'
                    ? {
                        backgroundColor: 'var(--bg-tint-light)',
                        border: '1px solid var(--border-tint)',
                        color: 'var(--brand)',
                      }
                    : {
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-secondary)',
                      }
                }
              >
                {tag.label}
              </span>
            ))}
            {projectId && (
              <span
                className="inline-flex items-center justify-center gap-xxs px-s py-xxs rounded-[20px] font-body text-s font-medium whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ color: 'var(--text-tertiary)' }}>Project</span>
                <code style={{ fontFamily: 'inherit' }}>{projectId}</code>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-s shrink-0">
        {secondaryAction}
        {primaryAction}
      </div>
    </div>
  )
}

function PrimaryErrorAction({
  connection,
  onReconnect,
  onReuploadCredentials,
  onRetry,
}: {
  connection: Extract<BigQueryConnection, { kind: 'error' }>
  onReconnect?: () => void
  onReuploadCredentials?: () => void
  onRetry?: () => void
}) {
  if (connection.reason === 'network') {
    return (
      <Button variant="primary" size="lg" onClick={onRetry}>
        Retry
      </Button>
    )
  }
  if (connection.reason === 'credentials-expired') {
    return (
      <Button variant="primary" size="lg" onClick={onReuploadCredentials}>
        Re-upload JSON
      </Button>
    )
  }
  return (
    <Button variant="primary" size="lg" onClick={onReconnect}>
      Reconnect
    </Button>
  )
}

// ─── Connected body ──────────────────────────────────────────────────────────

function ConnectedBody({
  connection,
  readOnly = false,
  pendingTableDescs,
  pendingColumnDescs,
  onEditTable,
  onEditColumn,
}: {
  connection: Extract<BigQueryConnection, { kind: 'connected' }>
  readOnly?: boolean
  pendingTableDescs: Record<string, string>
  pendingColumnDescs: Record<string, string>
  onEditTable: (fqn: string, value: string) => void
  onEditColumn: (fqn: string, columnName: string, value: string) => void
}) {
  const { projectId, syncing, tables, lastRefreshedAt, onboardedAt, verdict } = connection

  if (syncing) {
    return (
      <InfoBanner
        tone="neutral"
        title="Importing your tables"
        body={
          <>
            We&rsquo;re scanning <strong>{projectId}</strong> and getting tables
            ready to query. This usually takes a few seconds. Description edits
            unlock once the table list is back.
          </>
        }
      />
    )
  }

  const yellowCount = tables.filter((t) => t.verdict === 'YELLOW').length
  const greenCount = tables.length - yellowCount
  // Missing-description tally for the banner copy.
  const missingColumnCount = tables.reduce(
    (n, t) => n + t.columns.filter((c) => !c.description.trim()).length,
    0,
  )
  const tablesNeedingWork = tables.filter(
    (t) => !t.description.trim() || t.columns.some((c) => !c.description.trim()),
  ).length

  return (
    <>
      {/* Aggregate verdict banner */}
      {verdict === 'YELLOW' && (
        <InfoBanner
          tone="warning"
          title="A few descriptions are missing"
          body={
            <>
              Oracle connected successfully and is ready to answer from these
              tables. Adding missing descriptions of{' '}
              <strong>
                {missingColumnCount} column{missingColumnCount === 1 ? '' : 's'} across{' '}
                {tablesNeedingWork} table{tablesNeedingWork === 1 ? '' : 's'}
              </strong>{' '}
              makes its answers even sharper.
            </>
          }
        />
      )}

      <SummaryGrid
        items={[
          {
            label: 'Tables imported',
            value: String(tables.length),
          },
          {
            label: 'Ready · Needs work',
            value: `${greenCount} · ${yellowCount}`,
          },
          {
            label: 'Connected / Updated',
            value: formatRelative(onboardedAt),
          },
          {
            label: 'Last refresh',
            value: formatRelative(lastRefreshedAt),
          },
        ]}
      />

      {/* Editable table list */}
      <section className="flex flex-col gap-s">
        <div className="flex items-baseline justify-between gap-m">
          <h2
            className="font-display text-m font-semibold leading-[1.5]"
            style={{ color: 'var(--text-primary)' }}
          >
            Tables
          </h2>
          <span
            className="font-body text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {readOnly ? 'Click any table to view descriptions' : 'Click any table to edit descriptions'}
          </span>
        </div>
        <div className="flex flex-col gap-s">
          {tables.map((t) => (
            <WarehouseTableCard
              key={t.fqn}
              table={t}
              pendingTableDesc={pendingTableDescs[t.fqn]}
              pendingColumnDescs={pendingColumnDescs}
              onEditTable={onEditTable}
              onEditColumn={onEditColumn}
              readOnly={readOnly}
            />
          ))}
        </div>
      </section>

      {/* View — same table list as above, minus row count/table size. Shares
          the same pending-edit state so an edit made here or in "Tables"
          reflects in both. */}
      <section className="flex flex-col gap-s">
        <div className="flex items-baseline justify-between gap-m">
          <h2
            className="font-display text-m font-semibold leading-[1.5]"
            style={{ color: 'var(--text-primary)' }}
          >
            View
          </h2>
          <span
            className="font-body text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Click any table to view descriptions
          </span>
        </div>
        <div className="flex flex-col gap-s">
          {tables.map((t) => (
            <WarehouseTableCard
              key={t.fqn}
              table={t}
              pendingTableDesc={pendingTableDescs[t.fqn]}
              pendingColumnDescs={pendingColumnDescs}
              onEditTable={onEditTable}
              onEditColumn={onEditColumn}
              readOnly={readOnly}
              hideSize
            />
          ))}
        </div>
      </section>

      <p
        className="font-body text-xs"
        style={{ color: 'var(--text-tertiary)' }}
      >
        6labs only reads from your warehouse — we never write back. Description
        edits live in 6labs and don&rsquo;t modify BigQuery metadata.
      </p>
    </>
  )
}

// ─── Error body ──────────────────────────────────────────────────────────────

function ErrorBody({
  projectId,
  reason,
  lastRefreshedAt,
  onReconnect,
  onReuploadCredentials,
  onRetry,
}: {
  projectId: string
  reason: BigQueryErrorReason
  lastRefreshedAt: number | null
  onReconnect?: () => void
  onReuploadCredentials?: () => void
  onRetry?: () => void
}) {
  const copy = ERROR_COPY[reason](projectId)
  const tone: BannerTone = reason === 'network' ? 'warning' : 'error'

  return (
    <>
      <InfoBanner
        tone={tone}
        title={copy.title}
        body={copy.body}
        action={copy.primaryAction({
          onReconnect,
          onReuploadCredentials,
          onRetry,
        })}
        helpLinkHref={copy.helpLinkHref}
        helpLinkLabel={copy.helpLinkLabel}
      />

      {lastRefreshedAt != null && (
        <p
          className="font-body text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Last healthy refresh: {formatRelative(lastRefreshedAt)}. Queries to
          Oracle won&rsquo;t use BigQuery until this is fixed.
        </p>
      )}
    </>
  )
}

type ErrorCopy = {
  title: string
  body: ReactNode
  helpLinkHref?: string
  helpLinkLabel?: string
  primaryAction: (handlers: {
    onReconnect?: () => void
    onReuploadCredentials?: () => void
    onRetry?: () => void
  }) => ReactNode
}

const ERROR_COPY: Record<BigQueryErrorReason, (projectId: string) => ErrorCopy> = {
  'permission-revoked': (projectId) => ({
    title: 'Action required · Permission revoked',
    body: (
      <>
        The service account no longer has the{' '}
        <strong>BigQuery Data Viewer</strong> role on{' '}
        <code>{projectId}</code>. Re-grant the role in GCP IAM, then click
        Reconnect to validate access.
      </>
    ),
    helpLinkHref: 'https://cloud.google.com/iam/docs/granting-changing-revoking-access',
    helpLinkLabel: 'How to grant IAM roles',
    primaryAction: ({ onReconnect }) => (
      <Button variant="primary" size="lg" onClick={onReconnect}>
        Reconnect
      </Button>
    ),
  }),
  'credentials-expired': (projectId) => ({
    title: 'Action required · Credentials revoked',
    body: (
      <>
        The service-account JSON we have on file for <code>{projectId}</code>{' '}
        was revoked or rotated. Generate a new key and upload it to reconnect.
      </>
    ),
    helpLinkHref: 'https://cloud.google.com/iam/docs/keys-create-delete',
    helpLinkLabel: 'How to rotate service-account keys',
    primaryAction: ({ onReuploadCredentials }) => (
      <Button variant="primary" size="lg" onClick={onReuploadCredentials}>
        Re-upload JSON
      </Button>
    ),
  }),
  'project-not-found': (projectId) => ({
    title: 'Action required · Project not found',
    body: (
      <>
        GCP couldn&rsquo;t find a project named <code>{projectId}</code>. It
        may have been renamed or deleted. Reconnect with the correct project
        ID and a valid service-account JSON.
      </>
    ),
    primaryAction: ({ onReconnect }) => (
      <Button variant="primary" size="lg" onClick={onReconnect}>
        Reconnect
      </Button>
    ),
  }),
  network: () => ({
    title: 'Temporary connection issue',
    body: (
      <>
        We couldn&rsquo;t reach BigQuery on the last refresh. This is usually
        transient — we&rsquo;ll keep retrying in the background. Hit Retry to
        force a check now.
      </>
    ),
    primaryAction: ({ onRetry }) => (
      <Button variant="primary" size="lg" onClick={onRetry}>
        Retry now
      </Button>
    ),
  }),
  unknown: () => ({
    title: 'Connection error',
    body: (
      <>
        Something went wrong on the last refresh and we couldn&rsquo;t classify
        the cause. Reconnect to revalidate access, or contact 6labs support if
        the issue persists.
      </>
    ),
    primaryAction: ({ onReconnect }) => (
      <Button variant="primary" size="lg" onClick={onReconnect}>
        Reconnect
      </Button>
    ),
  }),
}

