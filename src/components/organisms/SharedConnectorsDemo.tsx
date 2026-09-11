/**
 * SharedConnectorsDemo — ISOLATED comparison of the two proposed solutions to the
 * "company connector, User B sees empty state" problem. Review/prototype surface
 * only: reachable at #/sharing-demo and NOT wired into the production connectors
 * nav. It REUSES the real detail-page components AND the real onboarding modals so
 * the pages/popups look and behave exactly like production.
 *
 *   • Option A — "Reflect & Lock": teammate sees the connector active + a read-only
 *     lock (no Disconnect / Refresh / Save).
 *   • Option B — "Shared company connectors": connections shown as TABS, ownership
 *     context per tab, and "Add connection" (opens the real onboarding modal).
 *
 * Header toggles: Option A/B × Alex (owner) / Priya (teammate = User B).
 *
 * Reuses (read-only, unmodified except the additive `readOnly` prop):
 * ContextConnectorsView.CONNECTORS, ConnectorDetailView, BigQueryDetailView,
 * SnowflakeDetailView, BigQueryOnboardingModal, SnowflakeOnboardingModal,
 * PageTopbar. Production is untouched.
 */
import { useState } from 'react'
import type { ReactNode } from 'react'

import { CONNECTORS } from './ContextConnectorsView'
import type { ConnectorDetail } from './ConnectorDetailView'
import { ConnectorDetailView } from './ConnectorDetailView'
import { BigQueryDetailView } from './BigQueryDetailView'
import { SnowflakeDetailView } from './SnowflakeDetailView'
import { BigQueryOnboardingModal, type BigQueryOnboardingState } from './BigQueryOnboardingModal'
import { SnowflakeOnboardingModal, type SnowflakeOnboardingState } from './SnowflakeOnboardingModal'
import { PageTopbar } from '../molecules/PageTopbar'
import { InfoFilledIcon } from '../icons/InfoFilledIcon'
import {
  getMockBigQueryConnection,
  getMockSnowflakeConnection,
  type BigQueryTable,
  type SnowflakeConnection,
  type SnowflakeConnectionDetails,
} from '../../lib/state/connectorsStore'

// ---------------------------------------------------------------------------
// Data (derived from the REAL connector registry + store fixtures)
// ---------------------------------------------------------------------------

type Option = 'A' | 'B'
type PersonId = 'alex' | 'priya'
type ProgressDetail = { step: number; errorAtStep?: number; errorMessage?: string; problemTableCount?: number; totalTableCount?: number }

const OWNER = { id: 'alex' as PersonId, name: 'Alex Chen' }
const VIEWER = { id: 'priya' as PersonId, name: 'Priya' }

const WAREHOUSE_IDS = ['bigquery', 'snowflake']
const AVAILABLE_IDS = ['appsflyer', 'jira', 'slack']

const bqConn = getMockBigQueryConnection()
const sfConn = getMockSnowflakeConnection()

const WAREHOUSE_META: Record<string, { project: string; when: string }> = {
  bigquery: { project: bqConn.projectId, when: 'Jun 2' },
  snowflake: { project: 'GAME_TELEMETRY.PUBLIC', when: 'May 28' },
}

// PM ask: demonstrate the error state on an EXISTING connected account —
// Snowflake's company connection has lost its registered key.
const SF_ERROR_CONNECTION: SnowflakeConnection = {
  kind: 'error',
  reason: 'key-not-registered',
  lastRefreshedAt: sfConn.lastRefreshedAt,
  accountIdentifier: sfConn.accountIdentifier,
  username: sfConn.username,
  warehouse: sfConn.warehouse,
  database: sfConn.database,
}

const detailById = (id: string): (ConnectorDetail & { description?: string }) | undefined =>
  CONNECTORS.find((c) => c.id === id)

// ---------------------------------------------------------------------------
// Presentational atoms (demo-local)
// ---------------------------------------------------------------------------

function Avatar({ who, size = 22 }: { who: PersonId; size?: number }) {
  const bg = who === 'alex' ? 'linear-gradient(135deg,#7B4CFF,#1770EF)' : 'linear-gradient(135deg,#F0653F,#F2A03F)'
  return (
    <span className="inline-flex items-center justify-center font-display font-semibold shrink-0" style={{ width: size, height: size, borderRadius: 999, background: bg, color: '#fff', fontSize: size * 0.42, border: '2px solid var(--bg-card)' }}>
      {who === 'alex' ? 'A' : 'P'}
    </span>
  )
}

function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'success' }) {
  const map = {
    neutral: { bg: 'var(--bg-subtle)', fg: 'var(--text-secondary)' },
    brand: { bg: 'var(--bg-tint)', fg: 'var(--brand)' },
    success: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  }[tone]
  return <span className="inline-flex items-center gap-xxs px-xs py-xxxs rounded-xs font-display text-2xs font-semibold" style={{ backgroundColor: map.bg, color: map.fg }}>{children}</span>
}

function Seg<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[] }) {
  return (
    <div className="inline-flex p-xxxs rounded-m" style={{ backgroundColor: 'var(--bg-subtle)' }}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} className="inline-flex items-center gap-xs px-s py-xxs rounded-s font-display text-xs font-semibold transition-all" style={{ background: active ? 'var(--bg-card)' : 'transparent', color: active ? 'var(--text-primary)' : 'var(--text-tertiary)', boxShadow: active ? '0 1px 3px rgba(3,13,45,0.12)' : 'none' }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Self-contained hub card (mirrors the DS ConnectorCard look). */
function DemoCard({ icon, name, description, footer, cta, onClick }: { icon: ReactNode; name: string; description: string; footer?: ReactNode; cta?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col gap-s p-m rounded-xl text-left transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', minHeight: 150, cursor: 'pointer' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      <div className="flex items-start gap-s">
        <div className="size-[40px] rounded-m overflow-hidden flex items-center justify-center shrink-0">{icon}</div>
        <div className="flex-1 min-w-0"><span className="font-display text-m font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</span></div>
      </div>
      <p className="font-body text-s flex-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{description}</p>
      <div className="flex items-center justify-between gap-s mt-auto">
        <div className="min-w-0">{footer}</div>
        <span className="flex items-center gap-xs font-display text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: 'var(--brand)' }}>{cta ?? 'View Details'} →</span>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface SharedConnectorsDemoProps {
  initialOption?: Option
  initialViewerIsOwner?: boolean
  initialOpenId?: string | null
  /** 'bigquery' | 'snowflake' — open that real onboarding modal on mount (Storybook). */
  initialOnboardingId?: string | null
  initialConnectedExtra?: string[]
}

export function SharedConnectorsDemo({
  initialOption = 'A',
  initialViewerIsOwner = false,
  initialOpenId = null,
  initialOnboardingId = null,
  initialConnectedExtra = [],
}: SharedConnectorsDemoProps = {}) {
  const [option, setOption] = useState<Option>(initialOption)
  const [viewerIsOwner, setViewerIsOwner] = useState(initialViewerIsOwner)
  const [openId, setOpenId] = useState<string | null>(initialOpenId)
  const [ownConnections, setOwnConnections] = useState<Record<string, boolean>>({})
  const [ownConnLabel, setOwnConnLabel] = useState<Record<string, string>>({})
  const [activeConn, setActiveConn] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [connectedExtra, setConnectedExtra] = useState<Record<string, PersonId>>(() => Object.fromEntries(initialConnectedExtra.map((id) => [id, VIEWER.id])))

  // Real onboarding-modal state (mirrors HomePage's wiring; prototype fake driver).
  const [bqState, setBqState] = useState<BigQueryOnboardingState | null>(initialOnboardingId === 'bigquery' ? 'idle' : null)
  const [bqProgress, setBqProgress] = useState<ProgressDetail>({ step: 0 })
  const [bqSummary, setBqSummary] = useState<{ projectId: string; tableCount: number; verdict: 'GREEN' | 'YELLOW' | 'RED'; verdictReason: string } | null>(null)
  const [bqProjectId, setBqProjectId] = useState('')
  const [sfState, setSfState] = useState<SnowflakeOnboardingState | null>(initialOnboardingId === 'snowflake' ? 'idle' : null)
  const [sfProgress, setSfProgress] = useState<ProgressDetail>({ step: 0 })
  const [sfSummary, setSfSummary] = useState<{ database: string; tableCount: number; verdict: 'GREEN' | 'YELLOW' | 'RED'; verdictReason: string } | null>(null)
  const [sfInitialStep, setSfInitialStep] = useState<1 | 2>(1)

  const viewerId: PersonId = viewerIsOwner ? OWNER.id : VIEWER.id

  const showToast = (msg: string) => {
    setToast(msg)
    window.clearTimeout((showToast as unknown as { _t?: number })._t)
    ;(showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 2400)
  }

  const connectedAvailable = AVAILABLE_IDS.filter((id) => connectedExtra[id])
  const availableToAdd = AVAILABLE_IDS.filter((id) => !connectedExtra[id])
  const activeCount = WAREHOUSE_IDS.length + connectedAvailable.length

  interface Conn { id: string; ownerId: PersonId; label: string; when: string; isNew?: boolean }
  function connectionsFor(whId: string): Conn[] {
    const meta = WAREHOUSE_META[whId]
    const list: Conn[] = [{ id: `${whId}-alex`, ownerId: 'alex', label: meta.project, when: meta.when }]
    if (option === 'B' && ownConnections[whId]) list.push({ id: `${whId}-mine`, ownerId: viewerId === 'alex' ? 'priya' : viewerId, label: ownConnLabel[whId] ?? 'my-connection', when: 'Just now', isNew: true })
    return list
  }

  // ── Connect entry point ──
  // Warehouses open the REAL onboarding modal; available connectors have no
  // production onboarding modal, so they connect directly.
  const openConnect = (id: string) => {
    if (id === 'bigquery') { setBqProjectId(''); setBqProgress({ step: 0 }); setBqSummary(null); setBqState('idle') }
    else if (id === 'snowflake') { setSfInitialStep(1); setSfProgress({ step: 0 }); setSfSummary(null); setSfState('idle') }
    else { setConnectedExtra((s) => ({ ...s, [id]: viewerId })); setOpenId(null); showToast(`${detailById(id)?.name ?? 'Connector'} connected`) }
  }

  // Prototype happy-path driver — advances the 4 stages then a review beat.
  const runSteps = (setProgress: (p: ProgressDetail) => void, mock: { tables: BigQueryTable[] }, finish: () => void) => {
    const delays = [700, 700, 700, 900]
    let step = 0
    const tick = () => {
      if (step < 4) { setProgress({ step }); const d = delays[step]; step += 1; window.setTimeout(tick, d); return }
      setProgress({ step: 4, problemTableCount: mock.tables.filter((t) => t.verdict !== 'GREEN').length, totalTableCount: mock.tables.length })
      window.setTimeout(finish, 1200)
    }
    tick()
  }

  const addOwnWarehouseConnection = (whId: string, label: string) => {
    setOwnConnections((s) => ({ ...s, [whId]: true }))
    setOwnConnLabel((s) => ({ ...s, [whId]: label }))
    setActiveConn((s) => ({ ...s, [whId]: `${whId}-mine` }))
    setOption('B')
  }

  const controlBar = (
    <div className="shrink-0 z-[70] flex flex-wrap items-center gap-m px-l" style={{ paddingTop: 8, paddingBottom: 8, backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' }}>
      <span className="inline-flex items-center px-xs py-xxxs rounded-xs font-display text-2xs font-semibold" style={{ background: 'var(--bg-subtle)', color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>PROTOTYPE</span>
      <span className="flex-1" />
      <div className="flex items-center gap-xs">
        <span className="font-body text-2xs" style={{ color: 'var(--text-tertiary)' }}>Option</span>
        <Seg value={option} onChange={setOption} options={[{ value: 'A', label: 'A · Lock' }, { value: 'B', label: 'B · Shared' }]} />
      </div>
      <div className="flex items-center gap-xs">
        <span className="font-body text-2xs" style={{ color: 'var(--text-tertiary)' }}>As</span>
        <Seg<'viewer' | 'owner'> value={viewerIsOwner ? 'owner' : 'viewer'} onChange={(v) => setViewerIsOwner(v === 'owner')} options={[{ value: 'viewer', label: <><Avatar who="priya" size={16} /> Priya</> }, { value: 'owner', label: <><Avatar who="alex" size={16} /> Alex</> }]} />
      </div>
    </div>
  )

  const overlays = (
    <>
      {/* Real BigQuery onboarding modal */}
      <BigQueryOnboardingModal
        isOpen={bqState !== null}
        lenient
        state={bqState ?? 'idle'}
        projectId={bqProjectId}
        progress={bqProgress}
        summary={bqSummary ?? undefined}
        onClose={() => { setBqState(null); setBqProgress({ step: 0 }); setBqSummary(null) }}
        onConnect={({ projectId }) => {
          setBqProjectId(projectId)
          setBqSummary(null)
          setBqProgress({ step: 0 })
          setBqState('progress')
          const mock = getMockBigQueryConnection()
          runSteps(setBqProgress, mock, () => {
            setBqSummary({ projectId, tableCount: mock.tables.length, verdict: mock.verdict, verdictReason: mock.verdictReason })
            setBqState('success')
            addOwnWarehouseConnection('bigquery', projectId)
          })
        }}
        onRetry={() => { setBqProgress({ step: 0 }); setBqState('idle') }}
        onDone={() => { setBqState(null); setBqProgress({ step: 0 }); setBqSummary(null); setOpenId('bigquery') }}
      />

      {/* Real Snowflake onboarding modal */}
      <SnowflakeOnboardingModal
        isOpen={sfState !== null}
        state={sfState ?? 'idle'}
        initialStep={sfInitialStep}
        details={{}}
        progress={sfProgress}
        summary={sfSummary ?? undefined}
        onClose={() => { setSfState(null); setSfProgress({ step: 0 }); setSfSummary(null) }}
        onConnect={(payload: SnowflakeConnectionDetails & { orgWideAccess?: boolean }) => {
          const label = payload.database || payload.accountIdentifier || 'my-connection'
          setSfSummary(null)
          setSfProgress({ step: 0 })
          setSfState('progress')
          const mock = getMockSnowflakeConnection()
          runSteps(setSfProgress, mock, () => {
            setSfSummary({ database: payload.database, tableCount: mock.tables.length, verdict: mock.verdict, verdictReason: mock.verdictReason })
            setSfState('success')
            addOwnWarehouseConnection('snowflake', label)
          })
        }}
        onRetry={() => { setSfProgress({ step: 0 }); setSfInitialStep(2); setSfState('idle') }}
        onDone={() => { setSfState(null); setSfProgress({ step: 0 }); setSfSummary(null); setOpenId('snowflake') }}
      />

      {toast && <div className="fixed left-1/2 z-[80] font-body text-s" style={{ bottom: 22, transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-card)', padding: '11px 18px', borderRadius: 10 }}>{toast}</div>}
    </>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // DETAIL — full page, same layout & components as production
  // ─────────────────────────────────────────────────────────────────────────
  if (openId) {
    const detail = detailById(openId)
    const isWarehouse = WAREHOUSE_IDS.includes(openId)
    const noop = () => {}

    // Edit rights for the connection currently shown:
    //  • Option A → only the owner can edit.
    //  • Option B → only the owner of the SELECTED connection can edit.
    const canEdit = (() => {
      if (!isWarehouse) return true
      if (option === 'A') return viewerIsOwner
      const conns = connectionsFor(openId)
      const sel = conns.find((c) => c.id === (activeConn[openId] ?? conns[0].id)) ?? conns[0]
      return sel.ownerId === viewerId
    })()

    // Full-width view-only strip pinned under the topbar (replaces the Option A lock banner).
    const viewOnlyOwner: string | null = (() => {
      if (option !== 'A') return null
      if (isWarehouse) return viewerIsOwner ? null : OWNER.name
      const who = connectedExtra[openId]
      if (!who || who === viewerId) return null
      return who === 'alex' ? OWNER.name : VIEWER.name
    })()

    return (
      <div className="h-full w-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
        {controlBar}
        <div className="shrink-0"><PageTopbar title="Connectors" onBack={() => setOpenId(null)} /></div>
        {viewOnlyOwner && (
          <div className="shrink-0 w-full flex items-center justify-center gap-xs" style={{ padding: '10px 16px', background: 'var(--bg-tint-light)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            <InfoFilledIcon size={16} />
            <span className="font-body text-s">Managed by <strong style={{ color: 'var(--text-primary)' }}>{viewOnlyOwner}</strong> · you have view-only access.</span>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          <div className="w-full max-w-[900px] mx-auto flex-1 flex flex-col gap-l" style={{ padding: '32px 32px 80px' }}>
            {renderOptionAffordances(openId)}
            {detail && isWarehouse && openId === 'bigquery' && (
              <BigQueryDetailView
                connector={detail}
                connection={bqConn}
                readOnly={!canEdit}
                onConnect={() => openConnect('bigquery')}
                onRefresh={() => showToast('Syncing latest tables…')}
                onRetry={() => showToast('Retrying…')}
                {...(canEdit ? { onReconnect: () => openConnect('bigquery'), onReuploadCredentials: () => openConnect('bigquery'), onDisconnect: () => showToast('Disconnected (demo)') } : {})}
              />
            )}
            {detail && isWarehouse && openId === 'snowflake' && (
              <SnowflakeDetailView
                connector={detail}
                connection={SF_ERROR_CONNECTION}
                readOnly={!canEdit}
                onConnect={() => openConnect('snowflake')}
                onRefresh={() => showToast('Syncing latest tables…')}
                onRetry={() => showToast('Retrying…')}
                onReconnect={canEdit ? () => openConnect('snowflake') : () => showToast(`Only ${OWNER.name} can reconnect this connection`)}
                onReregisterKey={canEdit ? () => openConnect('snowflake') : () => showToast(`Only ${OWNER.name} can re-register the key`)}
                {...(canEdit ? { onDisconnect: () => showToast('Disconnected (demo)') } : {})}
              />
            )}
            {detail && !isWarehouse && (
              <ConnectorDetailView connector={detail} onConnect={connectedExtra[openId] ? noop : () => openConnect(openId)} />
            )}
          </div>
        </div>
        </div>
        {overlays}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HUB
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
      {controlBar}
      <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-[840px] px-l" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="flex flex-col items-center text-center" style={{ marginBottom: 40 }}>
          <h1 className="font-display font-semibold" style={{ color: 'var(--text-primary)', fontSize: 30, letterSpacing: '-0.02em' }}>Connectors</h1>
          <p className="font-body text-m" style={{ color: 'var(--text-secondary)', marginTop: 10, maxWidth: 520, lineHeight: 1.6 }}>
            {viewerIsOwner
              ? 'Connections you own are editable. Teammates get view-only access.'
              : `Connectors already active for your company are shown below. You can view them${option === 'B' ? ' and add your own.' : '.'}`}
          </p>
        </div>

        {/* PM spec: once anything is connected, the page splits into
            "Active in your company" and "Available to add". Connected cards
            carry only owner icons + a connection count (no names / chips). */}
        <SectionLabel>Active in your company <Chip tone="brand">{activeCount} active</Chip></SectionLabel>

        <div className="grid grid-cols-2 gap-l" style={{ marginBottom: 34 }}>
          {WAREHOUSE_IDS.map((id) => {
            const d = detailById(id)!
            const conns = connectionsFor(id)
            const owners = [...new Set(conns.map((c) => c.ownerId))]
            return (
              <DemoCard key={id} icon={d.icon} name={d.name} description={d.description ?? ''} onClick={() => setOpenId(id)}
                footer={
                  <span className="flex items-center gap-xs font-body text-xs min-w-0" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex">{owners.map((o, i) => <span key={o} style={{ marginLeft: i === 0 ? 0 : -6 }}><Avatar who={o} size={18} /></span>)}</span>
                    <span className="truncate">{conns.length === 1 ? '1 connection' : `${conns.length} connections`}</span>
                  </span>
                }
              />
            )
          })}
          {connectedAvailable.map((id) => {
            const d = detailById(id)!
            return (
              <DemoCard key={id} icon={d.icon} name={d.name} description={d.description ?? ''} onClick={() => setOpenId(id)}
                footer={<span className="flex items-center gap-xs font-body text-xs min-w-0" style={{ color: 'var(--text-secondary)' }}><Avatar who={connectedExtra[id]} size={18} /><span className="truncate">1 connection</span></span>}
              />
            )
          })}
        </div>

        {availableToAdd.length > 0 && (
          <>
            <SectionLabel>Available to add</SectionLabel>
            <div className="grid grid-cols-3 gap-l">
              {availableToAdd.map((id) => {
                const d = detailById(id)!
                return <DemoCard key={id} icon={d.icon} name={d.name} description={d.description ?? ''} cta="Connect" onClick={() => setOpenId(id)} />
              })}
            </div>
          </>
        )}

        <p className="font-body text-xs text-center" style={{ color: 'var(--text-tertiary)', marginTop: 32, lineHeight: 1.6 }}>
          {option === 'A' ? 'Option A: the empty state is gone (cards show CONNECTED for teammates); opening a company connector as a teammate shows the same detail page with a read-only lock.' : 'Option B: existing + add-new are both visible. Open BigQuery as Priya and try “Add connection” to see the 1→many model.'}
        </p>
      </div>
      </div>
      {overlays}
    </div>
  )

  // ── Option A/B affordances rendered ABOVE the real detail page ──
  function renderOptionAffordances(id: string) {
    const isWarehouse = WAREHOUSE_IDS.includes(id)

    if (!isWarehouse) {
      // View-only (someone else's) is shown by the strip under the topbar; here we
      // only note connectors the current user owns.
      if (connectedExtra[id] === viewerId) {
        return (
          <Banner><Avatar who={viewerId} size={22} /><span><strong>Connected by you.</strong></span></Banner>
        )
      }
      return null
    }

    const conns = connectionsFor(id)
    const sel = conns.find((c) => c.id === (activeConn[id] ?? conns[0].id)) ?? conns[0]
    const isMine = sel.ownerId === viewerId

    // Option A — read-only lock is the strip under the topbar (handled outside);
    // nothing extra here.
    if (option === 'A') return null

    // Option B — connections as TABS (scales cleanly to many connections).
    const canAddOwn = !conns.some((c) => c.ownerId === viewerId)
    return (
      <div className="flex flex-col">
        <div role="tablist" className="flex items-center gap-l overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {conns.map((c) => {
            const active = c.id === sel.id
            return (
              <button key={c.id} role="tab" aria-selected={active} type="button" onClick={() => setActiveConn((s) => ({ ...s, [id]: c.id }))}
                className="flex items-center gap-xs shrink-0 font-display text-s font-semibold whitespace-nowrap transition-colors"
                style={{ padding: '10px 2px', marginBottom: -1, borderBottom: `2px solid ${active ? 'var(--brand)' : 'transparent'}`, color: active ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                <Avatar who={c.ownerId} size={18} />
                {c.label}
              </button>
            )
          })}
          {canAddOwn && (
            <button type="button" onClick={() => openConnect(id)} className="flex items-center gap-xxs shrink-0 font-display text-s font-semibold whitespace-nowrap" style={{ padding: '10px 4px', marginBottom: -1, borderBottom: '2px solid transparent', color: 'var(--brand)' }}>
              ＋ Add connection
            </button>
          )}
        </div>

        <div className="flex items-center gap-xs" style={{ marginTop: 12 }}>
          <Chip tone={isMine ? 'success' : 'neutral'}>{isMine ? 'You can edit' : 'View only'}</Chip>
          <span className="truncate font-body text-xs" style={{ color: 'var(--text-secondary)' }}>
            {isMine ? `Your connection · connected ${sel.when}` : `${OWNER.name}’s connection · connected ${sel.when}`}
          </span>
        </div>
      </div>
    )
  }
}

// ---------------------------------------------------------------------------
// tiny helpers
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-xs" style={{ marginBottom: 14 }}>
      <span className="font-display text-2xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>{children}</span>
      <span className="flex-1" style={{ height: 1, background: 'var(--border-subtle)' }} />
    </div>
  )
}
function Banner({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-xs font-body text-s" style={{ padding: '13px 14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{children}</div>
}
