/**
 * SharedConnectorDetail — warehouse connector detail page under the finalized
 * company-sharing model ("Option B").
 *
 * Every warehouse connector carries a list of connections rendered as TABS:
 *   • the company-wide connection set up by a teammate (view-only for you), and
 *   • your own connection, added via the real onboarding modal ("＋ Add connection").
 *
 * The selected tab drives which connection feeds the real BigQuery/Snowflake
 * detail view and whether it renders read-only (descriptions static, no
 * Disconnect/Save — Refresh stays so viewers can re-sync). Recovery actions on
 * a view-only connection surface a toast instead of dead buttons.
 */
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { BigQueryDetailView } from './BigQueryDetailView'
import { SnowflakeDetailView } from './SnowflakeDetailView'
import { ConnectionTabsBar, type ConnectionTab } from '../molecules/ConnectionTabsBar'
import type { ConnectorDetail } from './ConnectorDetailView'
import {
  CURRENT_USER,
  SHARED_CONNECTION_OWNER,
  getSharedBigQueryConnection,
  getSharedSnowflakeConnection,
  setBigQueryOrgWideEdit,
  setSnowflakeOrgWideEdit,
  useBigQueryConnection,
  useSnowflakeConnection,
  type BigQueryConnection,
  type SnowflakeConnection,
} from '../../lib/state/connectorsStore'

export interface SharedConnectorDetailProps {
  connectorId: 'bigquery' | 'snowflake'
  connector: ConnectorDetail
  /** Opens the real onboarding modal to add your own connection. */
  onAddConnection: () => void
  /** Own-connection lifecycle handlers (wired to the existing HomePage flow). */
  onOwnRefresh?: () => void
  onOwnRetry?: () => void
  onOwnDisconnect?: () => void
  onOwnReconnect?: () => void
  onOwnReuploadCredentials?: () => void
  onOwnReregisterKey?: () => void
  onDirtyChange?: (dirty: boolean) => void
  resetSignal?: number
}

// alex/you get their real colors; any demo-scenario owner id falls back to a
// generic gradient + its first letter (matches ConnectionTabsBar.stories).
const OWNER_COLORS: Record<string, string> = {
  alex: 'linear-gradient(135deg, #7B4CFF, #1770EF)',
  you: 'linear-gradient(135deg, #F0653F, #F2A03F)',
}
function OwnerAvatar({ ownerId, size = 18 }: { ownerId: string; size?: number }) {
  const bg = OWNER_COLORS[ownerId] ?? 'linear-gradient(135deg, #68CA0C, #0F8A55)'
  const letter = ownerId === 'alex' ? 'A' : ownerId === 'you' ? 'Y' : (ownerId[0]?.toUpperCase() ?? '?')
  return (
    <span
      className="inline-flex items-center justify-center font-display font-semibold shrink-0"
      style={{ width: size, height: size, borderRadius: 999, background: bg, color: '#fff', fontSize: size * 0.44, border: '2px solid var(--bg-card)' }}
    >
      {letter}
    </span>
  )
}

// Demo-scenario-only fake connections — not real data. Their sole purpose is
// letting a reviewer see the tab-overflow dropdown live, on the real page,
// since today's data model never produces more than 2 real connections.
// Mirrors ConnectionTabsBar.stories' MANY_CONNECTIONS so Storybook and the
// live demo agree on what "many teammates" looks like.
const DEMO_PILL_MARGIN = 18

const DEMO_EXTRA_TABS: ConnectionTab[] = [
  { id: 'demo-priya', ownerId: 'priya', label: 'priya-sandbox' },
  { id: 'demo-sam', ownerId: 'sam', label: 'sam-analytics-ro' },
  { id: 'demo-jo', ownerId: 'jo', label: 'jo-dev-project' },
  { id: 'demo-lee', ownerId: 'lee', label: 'lee-staging-ro' },
  { id: 'demo-kim', ownerId: 'kim', label: 'kim-qa-svc' },
  { id: 'demo-ravi', ownerId: 'ravi', label: 'ravi-growth-ro' },
  { id: 'demo-noor', ownerId: 'noor', label: 'noor-finance-svc' },
  { id: 'demo-wei', ownerId: 'wei', label: 'wei-experiments' },
  { id: 'demo-dee', ownerId: 'dee', label: 'dee-legacy-ro' },
]

function Chip({ children, tone }: { children: ReactNode; tone: 'success' | 'neutral' | 'brand' }) {
  const map = {
    neutral: { bg: 'var(--bg-subtle)', fg: 'var(--text-secondary)' },
    success: { bg: 'var(--success-bg)', fg: 'var(--success)' },
    brand: { bg: 'var(--bg-tint)', fg: 'var(--brand)' },
  }[tone]
  return (
    <span className="inline-flex items-center px-xs py-xxxs rounded-xs font-display text-2xs font-semibold shrink-0" style={{ backgroundColor: map.bg, color: map.fg }}>
      {children}
    </span>
  )
}

/** Tab name — the service account / user the connection authenticates as.
 *  (PM call: the owner's name conveys nothing useful; the service name does.) */
function connectionTabName(id: 'bigquery' | 'snowflake', conn: BigQueryConnection | SnowflakeConnection): string {
  if (conn.kind === 'not-connected') return '—'
  if (id === 'bigquery') {
    const c = conn as Extract<BigQueryConnection, { kind: 'connected' | 'error' }>
    const sa = c.kind === 'connected' ? c.saEmail : undefined
    return sa ? sa.split('@')[0] : c.projectId
  }
  const c = conn as Extract<SnowflakeConnection, { kind: 'connected' | 'error' }>
  return c.username
}

function MiniSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="shrink-0"
      style={{ width: 34, height: 19, borderRadius: 999, border: '1px solid var(--border-default)', background: checked ? 'var(--brand)' : 'var(--bg-card)', position: 'relative', cursor: 'pointer', transition: 'background 120ms ease' }}
    >
      <span aria-hidden style={{ position: 'absolute', top: 2, left: checked ? 16 : 2, width: 13, height: 13, borderRadius: 999, background: checked ? '#fff' : 'var(--text-tertiary)', transition: 'left 120ms ease, background 120ms ease' }} />
    </button>
  )
}

export function SharedConnectorDetail({
  connectorId,
  connector,
  onAddConnection,
  onOwnRefresh,
  onOwnRetry,
  onOwnDisconnect,
  onOwnReconnect,
  onOwnReuploadCredentials,
  onOwnReregisterKey,
  onDirtyChange,
  resetSignal,
}: SharedConnectorDetailProps) {
  // Hooks run unconditionally; we pick per connector below.
  const ownBigQuery = useBigQueryConnection()
  const ownSnowflake = useSnowflakeConnection()
  const own = connectorId === 'bigquery' ? ownBigQuery : ownSnowflake
  const shared: BigQueryConnection | SnowflakeConnection =
    connectorId === 'bigquery' ? getSharedBigQueryConnection() : getSharedSnowflakeConnection()

  const ownExists = own.kind !== 'not-connected'
  const [selected, setSelected] = useState<'shared' | 'own'>('shared')
  // Refreshing the shared connection re-syncs its tables for you too — track the
  // sync time locally so the "Connected" card flips to "Last updated".
  const [sharedRefreshedAt, setSharedRefreshedAt] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const prevOwnExists = useRef(ownExists)

  // Demo scenarios — prototype chrome only, not product UI. Lets a reviewer
  // reach the permission/overflow states today's data model can't produce on
  // its own (a real second teammate, or Alex withholding edit access) without
  // needing Storybook. null = use the real seeded value.
  const [demoSharedEditOverride, setDemoSharedEditOverride] = useState<boolean | null>(null)
  const [demoExtraTabs, setDemoExtraTabs] = useState(false)
  const [demoMenuOpen, setDemoMenuOpen] = useState(false)
  const demoMenuRef = useRef<HTMLDivElement>(null)
  // Sits at the bottom-right and lifts to clear any bottom-docked bar (e.g.
  // "Save changes"). It used to stack above the "Proto hints" pill; that pill
  // is gone (2026-09-10 — it overlapped the state-machine dock), so this one
  // now takes the bottom slot itself.
  const [demoPillBottom, setDemoPillBottom] = useState(DEMO_PILL_MARGIN)

  useEffect(() => {
    if (!demoMenuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (demoMenuRef.current && !demoMenuRef.current.contains(e.target as Node)) setDemoMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDemoMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [demoMenuOpen])

  useEffect(() => {
    const compute = () => {
      const bars = [...document.querySelectorAll<HTMLElement>('.sticky.bottom-0, [class*="fixed"][class*="bottom-0"]')]
        .filter((el) => !el.closest('[data-demo-scenarios-pill]'))
      const tallest = bars.reduce((max, el) => {
        const r = el.getBoundingClientRect()
        const visible = r.bottom > window.innerHeight - 4 && r.height > 0 && r.width > 0
        return visible ? Math.max(max, r.height) : max
      }, 0)
      setDemoPillBottom(tallest > 0 ? tallest + DEMO_PILL_MARGIN : DEMO_PILL_MARGIN)
    }
    compute()
    const iv = window.setInterval(compute, 400)
    window.addEventListener('resize', compute)
    return () => {
      window.clearInterval(iv)
      window.removeEventListener('resize', compute)
    }
  }, [])

  // Auto-focus your connection when it first appears (right after onboarding),
  // and fall back to the shared tab if yours is disconnected.
  useEffect(() => {
    if (ownExists && !prevOwnExists.current) setSelected('own')
    if (!ownExists && selected === 'own') setSelected('shared')
    prevOwnExists.current = ownExists
  }, [ownExists, selected])

  const showToast = (msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2400)
  }

  // Apply any local re-sync timestamp to the (static) shared connection so the
  // date card reflects it.
  const sharedConn: BigQueryConnection | SnowflakeConnection =
    shared.kind === 'connected' && sharedRefreshedAt != null
      ? { ...shared, lastRefreshedAt: sharedRefreshedAt }
      : shared
  // The owner decides whether teammates may edit their connection. Demo
  // override lets a reviewer flip this without Alex actually being a real,
  // toggleable user.
  const sharedEditable = sharedConn.kind === 'connected' && (demoSharedEditOverride ?? !!sharedConn.orgWideEdit)
  const readOnly = selected === 'shared' && !sharedEditable
  const activeConn = selected === 'shared' ? sharedConn : own
  const ownerName = SHARED_CONNECTION_OWNER.name

  // Three permission states for the status chip:
  //  1. "View only"           — someone else's connection, edit not granted
  //  2. "You can edit"        — your own connection
  //  3. "Shared · you can edit" — someone else's connection, but they've
  //     turned on org-wide edit, so you can edit descriptions on it too
  const permissionState: 'view-only' | 'own-edit' | 'shared-edit' =
    selected === 'own' ? 'own-edit' : sharedEditable ? 'shared-edit' : 'view-only'
  const chipTone = permissionState === 'view-only' ? 'neutral' : permissionState === 'own-edit' ? 'success' : 'brand'
  const chipLabel =
    permissionState === 'view-only'
      ? 'View only'
      : permissionState === 'own-edit'
        ? 'You can edit'
        : 'Shared · you can edit'
  // Description-edit access (readOnly, above) is separate from connection
  // management: a teammate can be granted edit access to someone else's
  // connection without also being able to disconnect or repair its credentials.
  const canManage = selected === 'own'

  // Tabs are named after the service account/user the connection authenticates
  // as (owner is conveyed by the avatar + context line). Both pinned — today's
  // data model only ever produces these two, so ConnectionTabsBar's overflow
  // menu never triggers here; it's forward-looking for when a connector can
  // carry many distinct teammates' connections (see ConnectionTabsBar.stories).
  const tabs: ConnectionTab[] = [
    { id: 'shared', ownerId: 'alex', label: connectionTabName(connectorId, sharedConn), pinned: true },
    ...(ownExists ? [{ id: 'own', ownerId: 'you', label: connectionTabName(connectorId, own), pinned: true }] : []),
    // Demo-only: fake extra teammates so the overflow dropdown is visible
    // live. Clicking one is a no-op (see handleSelect) — they carry no real
    // connection data.
    ...(demoExtraTabs ? DEMO_EXTRA_TABS : []),
  ]

  const handleSelect = (id: string) => {
    if (id === 'shared' || id === 'own') {
      setSelected(id)
      return
    }
    showToast('Demo tab — for visualizing overflow only, not a real connection')
  }

  const contextText = selected === 'shared' ? `Connected by ${ownerName}` : `Connected by ${CURRENT_USER.name.toLowerCase()}`

  const ownEditToggle = own.kind === 'connected' ? !!own.orgWideEdit : false
  const handleOwnEditToggle = (v: boolean) => {
    if (connectorId === 'bigquery') setBigQueryOrgWideEdit(v)
    else setSnowflakeOrgWideEdit(v)
    showToast(v ? 'Teammates can now edit this connection' : 'Teammates now have view-only access')
  }

  const handleSharedRefresh = () => {
    setSharedRefreshedAt(Date.now())
    showToast('Synced latest tables')
  }

  // View-only recovery actions explain themselves instead of dead-ending.
  const viewOnlyBlocked = (action: string) => () => showToast(`Only ${ownerName} can ${action} this connection`)

  return (
    <div className="flex flex-col gap-l w-full flex-1">
      {/* Demo scenarios — prototype chrome only, not product UI. Floats at the
          bottom-right rather than living inline in page flow. */}
      <div className="relative shrink-0" ref={demoMenuRef}>
        <button
          type="button"
          data-demo-scenarios-pill
          onClick={() => setDemoMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={demoMenuOpen}
          className="fixed z-[93] inline-flex items-center gap-xs font-display text-xs font-semibold"
          style={{
            bottom: demoPillBottom,
            right: 18,
            transition: 'bottom 160ms ease',
            padding: '9px 14px',
            borderRadius: 999,
            border: `1.5px dashed ${demoMenuOpen ? 'var(--brand)' : 'var(--border-default)'}`,
            background: demoMenuOpen ? 'var(--bg-tint)' : 'var(--bg-card)',
            color: demoMenuOpen ? 'var(--brand)' : 'var(--text-secondary)',
            boxShadow: '0 4px 16px rgba(3,13,45,0.14)',
            cursor: 'pointer',
          }}
          title="Prototype-only controls for showing states the real data model can't reach yet"
        >
          🎭 Demo scenarios
        </button>
        {demoMenuOpen && (
          <div
            role="menu"
            className="fixed z-[93] flex flex-col gap-s w-[300px] p-s rounded-m"
            style={{
              bottom: demoPillBottom + 40,
              right: 18,
              backgroundColor: 'var(--bg-card)',
              border: '1.5px dashed var(--brand)',
              boxShadow: 'var(--shadow-normal)',
            }}
          >
            <span className="font-body text-2xs" style={{ color: 'var(--text-tertiary)' }}>
              Prototype chrome — not part of the product. For showing PMs/QA states today's data can't reach on its own.
            </span>
            <div className="flex items-center justify-between gap-m" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
              <span className="font-body text-xs font-medium min-w-0" style={{ color: 'var(--text-primary)' }}>
                {ownerName} granted org-wide edit
              </span>
              <MiniSwitch checked={sharedEditable} onChange={(v) => setDemoSharedEditOverride(v)} />
            </div>
            <div className="flex items-center justify-between gap-m">
              <span className="font-body text-xs font-medium min-w-0" style={{ color: 'var(--text-primary)' }}>
                Simulate 9 extra teammate connections
              </span>
              <MiniSwitch checked={demoExtraTabs} onChange={setDemoExtraTabs} />
            </div>
          </div>
        )}
      </div>

      {/* Connection tabs */}
      <div className="flex flex-col">
        <ConnectionTabsBar
          connections={tabs}
          selectedId={selected}
          onSelect={handleSelect}
          renderAvatar={(ownerId) => <OwnerAvatar ownerId={ownerId} />}
          onAddConnection={!ownExists ? onAddConnection : undefined}
        />

        {/* Context line for the selected connection */}
        <div className="flex items-center gap-xs" style={{ marginTop: 12 }}>
          <Chip tone={chipTone}>{chipLabel}</Chip>
          <span className="truncate font-body text-xs" style={{ color: 'var(--text-secondary)' }}>{contextText}</span>
          {selected === 'own' && own.kind === 'connected' && (
            <span
              className="flex items-center gap-xs shrink-0"
              style={{ marginLeft: 'auto' }}
              title={
                ownEditToggle
                  ? 'On — anyone in this workspace can edit table and column descriptions. Everyone can always query these tables (read-only).'
                  : 'Off — only you can edit table and column descriptions. Everyone can always query these tables (read-only).'
              }
            >
              <span className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>
                Allow members in your company to edit descriptions
              </span>
              <MiniSwitch checked={ownEditToggle} onChange={handleOwnEditToggle} />
            </span>
          )}
        </div>
      </div>

      {/* Real detail view, fed by the selected connection */}
      {connectorId === 'bigquery' ? (
        <BigQueryDetailView
          connector={connector}
          connection={activeConn as BigQueryConnection}
          readOnly={readOnly}
          canManage={canManage}
          onConnect={onAddConnection}
          onRefresh={canManage ? onOwnRefresh : handleSharedRefresh}
          onRetry={canManage ? onOwnRetry : viewOnlyBlocked('retry')}
          onReconnect={canManage ? onOwnReconnect : viewOnlyBlocked('reconnect')}
          onReuploadCredentials={canManage ? onOwnReuploadCredentials : viewOnlyBlocked('re-upload credentials for')}
          {...(canManage ? { onDisconnect: onOwnDisconnect } : {})}
          {...(!readOnly ? { onDirtyChange, resetSignal } : {})}
        />
      ) : (
        <SnowflakeDetailView
          connector={connector}
          connection={activeConn as SnowflakeConnection}
          readOnly={readOnly}
          canManage={canManage}
          onConnect={onAddConnection}
          onRefresh={canManage ? onOwnRefresh : handleSharedRefresh}
          onRetry={canManage ? onOwnRetry : viewOnlyBlocked('retry')}
          onReconnect={canManage ? onOwnReconnect : viewOnlyBlocked('reconnect')}
          onReregisterKey={canManage ? onOwnReregisterKey : viewOnlyBlocked('re-register the key for')}
          {...(canManage ? { onDisconnect: onOwnDisconnect } : {})}
          {...(!readOnly ? { onDirtyChange, resetSignal } : {})}
        />
      )}

      {toast && (
        <div className="fixed left-1/2 z-[80] font-body text-s" style={{ bottom: 22, transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-card)', padding: '11px 18px', borderRadius: 10 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
