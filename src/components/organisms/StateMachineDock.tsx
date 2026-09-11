/**
 * StateMachineDock — every state the current screen can be put into, in one place.
 *
 * Replaces the stack of floating pills (plan, library state) that grew one per
 * fixture. Collapsed, it is a single small button in the bottom-right corner;
 * open, it lists only the rows that apply to the screen in view — the plan on
 * any Testing screen, the library fixture where a picker reads from it, the
 * history fixture on a test with a History tab. A screen with nothing to
 * switch shows no dock at all.
 *
 * Review chrome, not product. Open state is remembered per browser so a
 * reviewer who keeps it open doesn't reopen it on every screen.
 */
import { useEffect, useState } from 'react'

export interface StateMachineDockOption {
  key: string
  label: string
  /** Shown under the row while this option is active. */
  note?: string
}

export interface StateMachineDockRow {
  id: string
  /** Row caption, e.g. "Plan", "Library", "History". */
  label: string
  value: string
  options: StateMachineDockOption[]
  onChange: (key: string) => void
  /** The product's own state — the closed dock counts rows that differ from it. Defaults to the first option. */
  defaultKey?: string
}

export interface StateMachineDockProps {
  rows: StateMachineDockRow[]
}

const STORAGE_KEY = 'studio.stateMachineDock.open'

function readOpen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function StateMachineDock({ rows }: StateMachineDockProps) {
  const [open, setOpen] = useState<boolean>(readOpen)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, open ? '1' : '0')
    } catch {
      /* private window — the dock just starts closed next time */
    }
  }, [open])

  if (rows.length === 0) return null

  /* How many rows sit off their default — a closed dock still tells the
     reviewer the screen is not showing the plain product. */
  const changed = rows.filter((r) => r.value !== (r.defaultKey ?? r.options[0]?.key)).length

  return (
    <div className="state-machine-dock" role="group" aria-label="State machine">
      {open && (
        <div className="state-machine-dock-panel">
          {rows.map((row) => {
            const active = row.options.find((o) => o.key === row.value)
            return (
              <div key={row.id} className="state-machine-dock-row">
                <div className="state-machine-dock-row-main">
                  <span className="proto-switcher-label">{row.label}</span>
                  <div className="state-machine-dock-options">
                    {row.options.map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        className="proto-switcher-btn"
                        data-active={row.value === o.key ? 'true' : 'false'}
                        aria-pressed={row.value === o.key}
                        onClick={() => row.onChange(o.key)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                {active?.note && <div className="state-machine-dock-note">{active.note}</div>}
              </div>
            )
          })}
        </div>
      )}
      <button
        type="button"
        className="state-machine-dock-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Hide state machine' : 'Show state machine'}
      >
        <span className="state-machine-dock-toggle-dot" data-changed={changed > 0 ? 'true' : 'false'} aria-hidden />
        State machine
        {changed > 0 && <span className="state-machine-dock-toggle-count">{changed}</span>}
      </button>
    </div>
  )
}
