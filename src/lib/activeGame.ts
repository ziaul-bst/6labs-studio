/**
 * The game a workspace is scoped to. Two halves, because they answer to
 * different readers: the name is what a person recognises in the sidebar, and
 * the app id is what a machine needs — it survives a rename and tells two
 * builds of the same title apart, which is why the CLI takes both.
 *
 * Code-first prototype — no Figma source yet.
 */

export interface ActiveGame {
  name: string
  genre: string
  /** Store package id — the value the CLI's `--app-id` takes. */
  appId: string
}

export const ACTIVE_GAME: ActiveGame = {
  name: 'Free Fire',
  genre: 'Action',
  appId: 'com.dts.freefireth',
}
