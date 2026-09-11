/**
 * ConnectionTabsBar — the connector-detail tab strip, generalized to handle
 * more connections than fit on one line.
 *
 * Today's data model only ever produces two connections per connector (the
 * shared/company one + your own), so this never overflows in production yet.
 * It's built now — ready for whenever "many distinct teammates, each with
 * their own connection" lands — and is exercised via Storybook with 10+ mock
 * connections since the real app can't reach that state.
 *
 * Overflow rule: pin by RELEVANCE, not position. The two tabs almost every
 * viewer actually needs — the shared connection and (if present) your own —
 * always render as real tabs. Everyone else's connections collapse into a
 * trailing "＋N more" tab that opens a dropdown (same info as a tab row), so
 * reaching any of them is still one click, they just don't eat permanent
 * tab-bar space. The active tab is always shown as a real tab even if it
 * came from the dropdown, so re-selecting it later doesn't require reopening
 * the menu.
 *
 * How many show inline is NOT a fixed number — a narrow panel might fit 2,
 * a wide one 7+. The real available width (measured, not guessed) decides;
 * "＋N more ▾" and "＋ Add connection" live outside the scrolling tab track
 * so they're always reachable regardless of how that math comes out (see
 * SharedConnectorDetail's parent layout — those two render in a shrink-0
 * group, never inside the overflow-x-auto tablist).
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export interface ConnectionTab {
  id: string
  ownerId: 'alex' | 'you' | string
  label: string
  /** Always rendered as a visible tab, never collapsed into the overflow menu. */
  pinned?: boolean
}

interface ConnectionTabsBarProps {
  connections: ConnectionTab[]
  selectedId: string
  onSelect: (id: string) => void
  renderAvatar: (ownerId: string) => React.ReactNode
  /** Shown as a trailing "＋ Add connection" tab (omit to hide). */
  onAddConnection?: () => void
}

const tabButtonClass = 'flex items-center gap-xs shrink-0 font-display text-s font-semibold whitespace-nowrap transition-colors'
const tabButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: '10px 2px',
  marginBottom: -1,
  borderBottom: `2px solid ${active ? 'var(--brand)' : 'transparent'}`,
  color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
})

export function ConnectionTabsBar({ connections, selectedId, onSelect, renderAvatar, onAddConnection }: ConnectionTabsBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const pinned = connections.filter((c) => c.pinned)
  const rest = connections.filter((c) => !c.pinned)

  // Active-first: if the current tab lives in `rest`, it's measured and
  // rendered first among non-pinned tabs, so it's never the one pushed into
  // overflow — no reopening the menu just to see which one you're on.
  const activeInRest = rest.find((c) => c.id === selectedId)
  const orderedRest = activeInRest ? [activeInRest, ...rest.filter((c) => c.id !== selectedId)] : rest

  // How many of `orderedRest` actually fit is a measured fact, not a guess.
  // A hidden ruler renders every candidate tab off-screen (same markup, so
  // widths match exactly); we read real pixel widths back and fit as many
  // as the tablist's actual rendered width allows. Re-measures on resize and
  // whenever the tab set or its labels change.
  const tablistRef = useRef<HTMLDivElement>(null)
  const rulerRef = useRef<HTMLDivElement>(null)
  const [visibleRestCount, setVisibleRestCount] = useState(orderedRest.length)

  useLayoutEffect(() => {
    const measure = () => {
      const container = tablistRef.current
      const ruler = rulerRef.current
      if (!container || !ruler) return
      const available = container.clientWidth
      const children = [...ruler.children] as HTMLElement[]
      // The ruler lays out [...pinned, ...orderedRest] from x=0, same order
      // the real tablist renders — so a child's cumulative offsetLeft+width
      // already tells us exactly how much of `available` it would consume,
      // pinned tabs included, no separate reservation math needed.
      let fit = 0
      for (let i = pinned.length; i < children.length; i++) {
        const end = children[i].offsetLeft + children[i].offsetWidth
        if (end > available) break
        fit++
      }
      setVisibleRestCount(fit)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (tablistRef.current) ro.observe(tablistRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned.length, orderedRest.map((c) => c.id + c.label).join('|')])

  const restVisible = orderedRest.slice(0, visibleRestCount)
  const overflow = orderedRest.slice(visibleRestCount)
  const visible = [...pinned, ...restVisible]

  return (
    <div className="flex items-center gap-l" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      {/* Scrolls on its own — a long tab list can't push the overflow/add-
          connection controls below out past the edge of the viewport. Those
          two are the whole point of this bar when there are more connections
          than fit; they must never be scroll-dependent to reach. */}
      <div
        role="tablist"
        ref={tablistRef}
        className="flex items-center gap-l overflow-x-auto min-w-0 flex-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {visible.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === selectedId}
            type="button"
            onClick={() => onSelect(c.id)}
            className={tabButtonClass}
            style={tabButtonStyle(c.id === selectedId)}
          >
            {renderAvatar(c.ownerId)}
            {c.label}
          </button>
        ))}
      </div>

      {/* Hidden ruler — same tab markup as above, laid out unconstrained so
          each button's true rendered width (avatar + label + padding) can be
          read back. Never visible, never in the tab order. */}
      <div
        ref={rulerRef}
        aria-hidden
        className="flex items-center gap-l"
        style={{ position: 'absolute', visibility: 'hidden', top: -9999, left: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
      >
        {[...pinned, ...orderedRest].map((c) => (
          <button key={c.id} type="button" tabIndex={-1} className={tabButtonClass} style={tabButtonStyle(false)}>
            {renderAvatar(c.ownerId)}
            {c.label}
          </button>
        ))}
      </div>

      {/* Pinned, outside the scroll track — always visible regardless of how
          many tabs are ahead of them. */}
      {(overflow.length > 0 || onAddConnection) && (
        <div className="flex items-center gap-l shrink-0">
          {overflow.length > 0 && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-xxs shrink-0 font-display text-s font-semibold whitespace-nowrap"
                style={{ padding: '10px 4px', marginBottom: -1, borderBottom: '2px solid transparent', color: 'var(--text-tertiary)' }}
              >
                ＋{overflow.length} more ▾
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute top-full right-0 mt-xs z-50 flex flex-col w-[240px] p-xxs rounded-m max-h-[280px] overflow-y-auto"
                  style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-normal)' }}
                >
                  {overflow.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onSelect(c.id)
                        setMenuOpen(false)
                      }}
                      className="action-menu-item w-full flex items-center gap-s px-s py-xs rounded-s text-left"
                    >
                      {renderAvatar(c.ownerId)}
                      <span className="font-body text-s font-medium truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {onAddConnection && (
            <button
              type="button"
              onClick={onAddConnection}
              className="flex items-center gap-xxs shrink-0 font-display text-s font-semibold whitespace-nowrap"
              style={{ padding: '10px 4px', marginBottom: -1, borderBottom: '2px solid transparent', color: 'var(--brand)' }}
            >
              ＋ Add connection
            </button>
          )}
        </div>
      )}
    </div>
  )
}
