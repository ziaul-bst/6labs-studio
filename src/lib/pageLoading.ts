/**
 * usePageLoading — the beat between a screen mounting and its data arriving,
 * and which *part* of the screen that beat covers.
 *
 * Every Testing screen reads something before it can draw: a run history, a
 * report, a session's frames, an entitlement. In the prototype all of that is a
 * module import, so the screens have always painted instantly and their loading
 * frame has never existed to be designed. It does exist in the product, and a
 * screen whose first frame is its finished layout is a screen nobody checked
 * the loading frame of.
 *
 * Three things make it work per screen rather than per page:
 *
 *  - It is called by the SCREEN component, not by the view that routes to it.
 *    A report, a run page and a session viewer each mount when they are opened,
 *    so each gets its own beat. Calling it once in the routing parent meant the
 *    composer had a loading state and everything it navigated to had none.
 *  - `key` restarts the beat without a remount, for the screens that swap
 *    content in place — a tab change from New run to Run history is a fetch,
 *    and the list should arrive the way the composer did.
 *  - It returns a PHASE, not a boolean, because the two loads cover different
 *    amounts of the screen. See below.
 *
 * ── initial vs refresh ──
 *
 * `initial` is the screen arriving: nothing of it is on the page yet, so the
 * whole thing is unknown and the whole thing is drawn as skeleton — header,
 * tabs and body.
 *
 * `refresh` is the screen fetching again while it is already up: a tab change,
 * a different filter. Its header has not changed and its tab bar has not
 * changed, so neither may blink. Redrawing them would be a lie twice over — it
 * would claim facts are arriving that are already on screen and correct, and
 * it would erase the control the reader just pressed at the moment they
 * pressed it, taking the active-tab marker with it. Only the panel that is
 * actually refetching goes grey.
 *
 * The dock pins whichever phase is honest: pin it while a screen is up and you
 * hold its refresh state; navigate somewhere new with it pinned and you hold
 * that screen's arrival. See lib/loadingDemoState.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useEffect, useRef, useState } from 'react'
import { useLoadingDemoState } from './loadingDemoState'

/** Long enough to be seen, short enough not to be a wait. */
export const PAGE_LOAD_MS = 650

/** `null` is loaded. See the note above for why the other two differ. */
export type PageLoadPhase = 'initial' | 'refresh' | null

/**
 * @param key Restarts the beat when it changes — a tab, a run id, a filter
 *            that refetches. Omit for a screen that only ever loads on mount.
 */
export function usePageLoading(key?: string | number, ms: number = PAGE_LOAD_MS): PageLoadPhase {
  const pinned = useLoadingDemoState() === 'loading'
  const [loading, setLoading] = useState(true)
  /**
   * Has this screen ever finished a load — which is the same question as "is
   * its own chrome already on the page". Written only by the timer that ends a
   * load, so StrictMode's double mount cannot advance it, and the pin never
   * does either: while pinned no timer runs at all, so a screen that arrives
   * pinned stays in `initial` instead of collapsing to `refresh` after 650ms.
   */
  const rendered = useRef(false)

  /* No "have I already run" guard. StrictMode mounts, tears down and remounts,
     which means the cleanup cancels the first timer — a guard that skipped the
     second run left the screen loading forever with nothing scheduled to end
     it. Re-arming unconditionally is both simpler and correct: the effect only
     re-runs when `key`, `ms` or the pin changes, and restarting the beat is
     exactly what a key change is for. */
  useEffect(() => {
    setLoading(true)
    if (pinned) return
    const t = window.setTimeout(() => {
      rendered.current = true
      setLoading(false)
    }, ms)
    return () => window.clearTimeout(t)
  }, [key, ms, pinned])

  if (!loading) return null
  return rendered.current ? 'refresh' : 'initial'
}
