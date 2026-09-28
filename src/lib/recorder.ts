/**
 * The Gameplay Recorder — the desktop app a studio installs on its test
 * machines so sessions reach the Gameplay Library without an SDK, an engine
 * plugin or a build change.
 *
 * One module for its facts, because the same links are quoted from more than
 * one screen: the download from the Library's setup card and the Recorder
 * page's platform list, the docs from three places on the Recorder page. Three
 * copies of a URL are three places for it to go stale when the next build ships.
 *
 * The App ID the Recorder is configured with is the workspace's own
 * (`ACTIVE_GAME.appId`), the same id the CLI's `--app-id` takes — it is not
 * repeated here.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useSyncExternalStore } from 'react'

/** The Windows x64 installer — a direct download of the .exe from 6labs' CDN. */
export const RECORDER_DOWNLOAD_URL =
  'https://cdn.6labs.ai/gamelibrarysetup/downloads/windows/x64/20260908152858/sixlabsgamelibrarysetup-1.4.4.exe'

/** Setup guide and reference docs. */
export const RECORDER_DOCS_URL = 'https://docs.6labs.ai/recorder'

/** The build the download link points at — keep in step with the URL above. */
export const RECORDER_VERSION = 'v1.4.4'
export const RECORDER_ARCH = 'x64'

// ─── Library setup card — dismissed for the session ─────────────────────────
/*
 * A module-level flag rather than component state: HomePage unmounts the
 * Library on every navigation, so a `useState` inside it would bring the card
 * back the moment someone opened the Recorder page and came back. Held for the
 * life of the tab and gone on reload, which is what "hide" means for a nudge —
 * it is not a preference. Same shape as libraryDemoState.
 */

let setupCardHidden = false
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setRecorderSetupCardHidden(next: boolean): void {
  if (next === setupCardHidden) return
  setupCardHidden = next
  listeners.forEach((fn) => fn())
}

export const getRecorderSetupCardHidden = (): boolean => setupCardHidden

export function useRecorderSetupCardHidden(): boolean {
  return useSyncExternalStore(subscribe, getRecorderSetupCardHidden, getRecorderSetupCardHidden)
}
