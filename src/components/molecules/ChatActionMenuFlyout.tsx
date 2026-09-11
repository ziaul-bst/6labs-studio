/**
 * ChatActionMenuFlyout — Round "+" trigger that opens a 2-item flyout in the
 * Oracle chat composer.
 *
 * Items:
 *   1. Attach PDF          — opens a file picker (single .pdf for now)
 *   2. Connectors ▸        — opens a nested flyout; bottom row "Add connector ▸"
 *                            opens a third-level submenu with available
 *                            connectors that are not yet onboarded.
 *
 * Note: the Sources selector lives in the composer's actions row, outside the
 * "+" button — it stays visible so the user can always see which source the
 * query will run on.
 *
 * Hover behaviour:
 *   • Hovering a submenu row opens its nested panel.
 *   • Hovering a non-submenu row (Attach PDF) closes any open submenu.
 *   • Leaving the submenu row + nested panel schedules a short-delayed close.
 *   • Re-entering either cancels the close.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ChangeEvent,
} from 'react'
import Button from '../ui/Button'
import { PlusIcon } from '../icons/PlusIcon'
import { FileDocIcon } from '../icons/FileDocIcon'
import { ConnectorIcon } from '../icons/ConnectorIcon'
import { ActionMenuItem } from '../atoms/ActionMenuItem'

export interface ConnectorOption {
  id: string
  label: string
  /** Secondary caption (e.g. project id) shown below the label */
  secondary?: string
  icon?: ReactNode
  /** Whether the connector is used for queries in this chat (master toggle). */
  enabled: boolean
  /** What the scope list represents — drives the "Select a …" header. */
  scopeKind?: 'project' | 'database' | 'account'
  /** Single-select scope list (radio) shown in the connector's submenu. */
  scopes?: ConnectorScope[]
  /** id of the currently-selected scope (single-select). */
  selectedScopeId?: string | null
}

export interface ConnectorScope {
  id: string
  /** Label shown on the radio row. */
  label: string
}

export interface AddableConnector {
  id: string
  label: string
  icon?: ReactNode
}

interface ChatActionMenuFlyoutProps {
  connectors: ConnectorOption[]
  onConnectorsChange: (ids: string[]) => void
  /** Selects the single active scope (project/database) for a connector. */
  onSelectScope?: (connectorId: string, scopeId: string) => void

  /** Connectors available to onboard (not yet connected). */
  availableConnectors?: AddableConnector[]
  /** Called when the user picks an available connector to start onboarding. */
  onAddConnector?: (id: string) => void

  onAttachFile?: (file: File) => void

  /** Storybook control — force-open the panel at the named submenu. Pass a
   *  connector id to open that connector's scope panel. */
  defaultOpen?: 'root' | 'connectors' | 'add-connector' | (string & {})

  className?: string
}

// 'connectors' = the connector list panel; 'add-connector' = the onboard list;
// `conn:<id>` = a specific connector's scope panel. All nest off 'connectors'.
type Submenu = string | null

const isConnectorPanel = (s: Submenu): s is string => !!s && s.startsWith('conn:')
const connPanelId = (id: string) => `conn:${id}`

const SUBMENU_CLOSE_DELAY_MS = 120

export function ChatActionMenuFlyout({
  connectors,
  onConnectorsChange,
  onSelectScope,
  availableConnectors = [],
  onAddConnector,
  onAttachFile,
  defaultOpen,
  className,
}: ChatActionMenuFlyoutProps) {
  const [open, setOpen] = useState(!!defaultOpen)
  const initialSubmenu: Submenu =
    defaultOpen && defaultOpen !== 'root' ? defaultOpen : null
  const [submenu, setSubmenu] = useState<Submenu>(initialSubmenu)

  const rootRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const closeTimer = useRef<number | null>(null)

  // Cancel any queued submenu-close.
  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  // Queue collapsing the open submenu to `target` shortly. Each level uses its
  // own target so that leaving a deeply-nested panel only walks back one step
  // (e.g. leaving "Add connector" lands you back on the Connectors panel, not
  // a fully-closed menu).
  const scheduleClose = useCallback(
    (target: Submenu) => {
      cancelClose()
      closeTimer.current = window.setTimeout(() => {
        setSubmenu(target)
        closeTimer.current = null
      }, SUBMENU_CLOSE_DELAY_MS)
    },
    [cancelClose],
  )

  // Open a submenu (cancels any pending close).
  const openSubmenu = useCallback(
    (next: Submenu) => {
      cancelClose()
      setSubmenu(next)
    },
    [cancelClose],
  )

  // Clean up timer on unmount.
  useEffect(() => () => cancelClose(), [cancelClose])

  // Outside-click closes everything.
  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        cancelClose()
        setOpen(false)
        setSubmenu(null)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open, cancelClose])

  // Esc steps out one nested level at a time.
  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      cancelClose()
      if (submenu === 'add-connector' || isConnectorPanel(submenu)) setSubmenu('connectors')
      else if (submenu) setSubmenu(null)
      else setOpen(false)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, submenu, cancelClose])

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      cancelClose()
      setOpen((v) => !v)
      setSubmenu(null)
    },
    [cancelClose],
  )

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onAttachFile?.(file)
    e.target.value = ''
    setOpen(false)
    setSubmenu(null)
  }

  const handleToggleConnector = (id: string, next: boolean) => {
    const enabledIds = connectors
      .map((c) => (c.id === id ? { ...c, enabled: next } : c))
      .filter((c) => c.enabled)
      .map((c) => c.id)
    onConnectorsChange(enabledIds)
  }

  const handleAddConnector = (id: string) => {
    onAddConnector?.(id)
    setSubmenu(null)
    setOpen(false)
  }

  // Shared handlers for the wrapper that contains a parent row + its nested
  // panel. `closeTo` is the submenu state to land on when the mouse leaves
  // this entire wrapper — usually `null` for top-level submenus, but
  // `'connectors'` for the nested "Add connector" wrapper so leaving it walks
  // back to the Connectors panel instead of closing everything.
  const submenuWrapperHandlers = (
    name: Exclude<Submenu, null>,
    closeTo: Submenu = null,
  ) => ({
    onMouseEnter: () => openSubmenu(name),
    onMouseLeave: () => scheduleClose(closeTo),
  })

  return (
    <div
      ref={rootRef}
      className={['relative inline-flex items-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        variant="tertiary"
        size="md"
        iconOnly
        iconRound
        onClick={toggle}
        aria-label="Add to chat"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <PlusIcon size={20} />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 mb-xs z-50 flex flex-col w-[260px] p-xxs rounded-m"
          style={{
            backgroundColor: 'var(--bg-elements)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-normal)',
          }}
          onMouseEnter={cancelClose}
        >
          {/* Items without a submenu close any open nested panel on hover. */}
          <div onMouseEnter={() => openSubmenu(null)}>
            <ActionMenuItem
              leadingIcon={<FileDocIcon size={16} />}
              label="Attach PDF"
              onClick={handleAttachClick}
            />
          </div>

          <div className="relative" {...submenuWrapperHandlers('connectors')}>
            <ActionMenuItem
              leadingIcon={<ConnectorIcon size={16} />}
              label="Connectors"
              trailing="chevron"
              active={submenu != null}
              onClick={() => setSubmenu((v) => (v ? null : 'connectors'))}
            />
            {submenu != null && (
              <NestedPanel onMouseEnter={cancelClose}>
                {connectors.length === 0 && (
                  <div
                    className="px-s py-m font-body text-s text-center"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    No connectors onboarded yet.
                  </div>
                )}
                {connectors.map((c) => {
                  const panel = connPanelId(c.id)
                  const scopePhrase =
                    c.scopeKind === 'database'
                      ? 'Select a database'
                      : c.scopeKind === 'account'
                        ? 'Select an account'
                        : 'Select a project'
                  return (
                    <div
                      key={c.id}
                      className="relative"
                      {...submenuWrapperHandlers(panel, 'connectors')}
                    >
                      {/* Connector row: status (On/Off) + chevron into the scope panel. */}
                      <ActionMenuItem
                        leadingIcon={c.icon ?? <ConnectorIcon size={16} />}
                        label={c.label}
                        secondary={c.enabled ? 'On' : 'Off'}
                        trailing="chevron"
                        active={submenu === panel}
                        onClick={() =>
                          setSubmenu((v) => (v === panel ? 'connectors' : panel))
                        }
                      />
                      {submenu === panel && (
                        <NestedPanel onMouseEnter={cancelClose}>
                          {/* Master "use for queries" toggle */}
                          <ActionMenuItem
                            label={`Use ${c.label} for queries`}
                            trailing="toggle"
                            checked={c.enabled}
                            onToggleChange={(next) => handleToggleConnector(c.id, next)}
                          />
                          {c.scopes && c.scopes.length > 0 && (
                            <>
                              <Divider />
                              <SectionLabel>{scopePhrase}</SectionLabel>
                              <div
                                className="flex flex-col"
                                style={{ opacity: c.enabled ? 1 : 0.5 }}
                              >
                                {c.scopes.map((s) => (
                                  <ActionMenuItem
                                    key={s.id}
                                    label={s.label}
                                    trailing="radio"
                                    checked={c.selectedScopeId === s.id}
                                    disabled={!c.enabled}
                                    onClick={() => onSelectScope?.(c.id, s.id)}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </NestedPanel>
                      )}
                    </div>
                  )
                })}

                {availableConnectors.length > 0 && (
                  <>
                    {connectors.length > 0 && <Divider />}
                    <div
                      className="relative"
                      {...submenuWrapperHandlers('add-connector', 'connectors')}
                    >
                      <ActionMenuItem
                        leadingIcon={<PlusIcon size={16} />}
                        label="Add connector"
                        trailing="chevron"
                        active={submenu === 'add-connector'}
                        onClick={() =>
                          setSubmenu((v) =>
                            v === 'add-connector' ? 'connectors' : 'add-connector',
                          )
                        }
                      />
                      {submenu === 'add-connector' && (
                        <NestedPanel onMouseEnter={cancelClose}>
                          {availableConnectors.map((c) => (
                            <ActionMenuItem
                              key={c.id}
                              leadingIcon={c.icon ?? <ConnectorIcon size={16} />}
                              label={c.label}
                              onClick={() => handleAddConnector(c.id)}
                            />
                          ))}
                        </NestedPanel>
                      )}
                    </div>
                  </>
                )}
              </NestedPanel>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NestedPanel({
  children,
  onMouseEnter,
}: {
  children: ReactNode
  onMouseEnter?: () => void
}) {
  return (
    <div
      role="menu"
      onMouseEnter={onMouseEnter}
      className="absolute left-full top-0 z-50 flex flex-col w-[240px] p-xxs rounded-m"
      style={{
        backgroundColor: 'var(--bg-elements)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-normal)',
      }}
    >
      {children}
    </div>
  )
}

function Divider() {
  return (
    <div
      role="separator"
      className="my-xxs mx-s"
      style={{ height: 1, backgroundColor: 'var(--border-subtle)' }}
    />
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-s pt-xxs pb-xxs font-display text-2xs font-semibold uppercase tracking-[0.12em]"
      style={{ color: 'var(--text-tertiary)' }}
    >
      {children}
    </div>
  )
}
