# Video transcript + Oracle citation deep-links — design

**Date:** 2026-08-13
**Surfaces:** `SessionSidePanel`, `SessionDetailsPage`, `AIResponseOracle`
**Status:** approved design, pending implementation plan

---

## 1. Problem

Oracle responses assert claims grounded in gameplay video ("a player recorded just 1 death in 11
minutes"), but a reader cannot check them. Citations point at whole videos, not at moments, and the
narration that justifies each claim is not surfaced anywhere in the product.

Two gaps:

1. **No transcript surface.** Sessions expose an AI summary and detected events, but not the
   underlying narration — the full record the summary was compressed from.
2. **No verifiable citation.** A citation can name a video but cannot show the moment inside it.

The transcript is therefore not primarily a reading surface. It is the **evidence layer Oracle
points at**, and its design follows from that.

## 2. What the transcript is

AI-generated narration of gameplay — a timestamped, dense play-by-play produced by the vision
model. There are no speakers and no silence gaps, so it is uniform and continuous: the hardest
possible shape to read, and the reason chunking matters.

This rules out the speaker-block chunking used by Otter, Zoom, and Teams. Anchoring comes instead
from time and from the detected events already derived per session.

## 3. Industry patterns adopted

| Source | Pattern | Applied as |
|---|---|---|
| NotebookLM, Perplexity | Numbered chip → highlighted span in source; hover preview resolves most checks without navigation | The Oracle citation model |
| Gong, Fathom, Grain | Sticky video + scrolling transcript; AI insights deep-link into it | Details page layout |
| YouTube | Timestamp gutter, auto-scroll follows playhead, active line tinted, panel-swap drill-down | Row anatomy + panel level 3 |
| Loom | Transcript as a tab, not a stacked section | Details page tabs |
| Otter | Search field carries match count + prev/next steppers | `TranscriptSearchField` |
| Apple Podcasts, Spotify | Chapter-grouped transcript | Group by detected event |

Explicitly not adopted: Descript's transcript-as-editable-document (no editing), speaker labels
(no speakers), word-level karaoke highlighting (overkill for narration).

## 4. Data model

New file `src/lib/types/transcript.ts`:

```ts
export interface TranscriptSegment {
  /** `${videoId}:${startSec}` — stable across renders, addressable by a citation */
  id: string
  startSec: number
  endSec: number
  text: string
  /** Detected event this segment falls inside, when any. Drives "Group by event". */
  eventId?: string
}
```

`SessionData` in `src/lib/types/radiologist.ts` gains:

```ts
transcript?: TranscriptSegment[]
```

Citations gain a resolvable target. `OracleResponseData` gains:

```ts
citations: TranscriptCitation[]

export interface TranscriptCitation {
  /** The bracket number rendered in prose — `[28]` */
  n: number
  kind: 'video' | 'table'
  /** kind: 'video' */
  videoId?: string
  segmentIds?: string[]
  /** Exact span within those segments to highlight */
  quote?: string
  /** kind: 'table' — fully-qualified name, e.g. PLATSH.PLATSH.CHURN */
  tableFqn?: string
  /** kind: 'table' — the rows the claim rests on, for the preview */
  rows?: Array<Record<string, string>>
}
```

`SourceItem` gains `citedSegmentCount?: number`, so the sources grid can convey how much of each
video was referenced rather than only that it was.

Mock segments are generated from existing events plus duration using the deterministic-seed
approach already in `deriveDetails` (`LibraryVideoSidePanel.tsx:100`), so a given session yields a
stable transcript across reloads.

## 5. Shared highlight utility

`renderHighlightedText` is currently private to `AITextSummary.tsx:24` and hardcodes `#fff176`.
Extract it to `src/lib/text/highlight.tsx` and replace the literal with a token.

Three consumers then share one treatment: AI summary phrases, transcript search matches, and cited
spans. Cited spans additionally get a brief flash ring on arrival, so a user landing from a citation
sees where they landed.

## 6. Components

New molecules under `src/components/molecules/`:

- **`TranscriptRow`** — 48px tabular-figure timestamp gutter + text at `line-height: 1.5`. Click
  seeks the video. `aria-current="true"` on the row containing the playhead. Hover tint via a named
  CSS class in `globals.css` (Tailwind `hover:` cannot resolve CSS-variable colors).
- **`TranscriptSearchField`** — query input, match count (`2/7`), prev/next steppers.
- **`TranscriptList`** — owns rows; handles event grouping, auto-follow, the `Jump to playhead`
  pill, and virtualization past ~200 rows.
- **`TranscriptSection`** — the collapsed 3-row wrapper used in the side panel.

## 7. Side panel — three disclosure levels

Placed **after** Detected Events in `SessionSidePanel`. Narration is deeper evidence than events,
not a peer of the summary.

A 128-row transcript cannot be a plain accordion in a 420px column: expanded into the panel's single
scroll body it would bury the session info, stats, profile, and the "Available to all agents"
footer behind thousands of pixels. Hence three levels:

1. **Collapsed** — 3 preview rows + `Show full transcript (128)`, matching the existing
   `Show All Events (N)` pattern at `SessionSidePanel.tsx:222`. Three rather than the events
   section's two: a narration row carries less information per row than an event row, so two reads
   as a truncation artifact rather than a preview.
2. **Expanded** — a capped `max-h-[320px]` region with its own `flyout-scrollbar` and a sticky
   search field. The parent panel's scroll and footer stay reachable.
3. **Drill-down** — a `⤢` control swaps the panel body for a full-height transcript view with a
   back arrow (`← Transcript · 12:40`). The video stays pinned above, so click-to-seek keeps working.

**Known weak point:** level 2 is nested scrolling, and it interacts awkwardly with virtualization
and auto-follow. If it feels wrong in build, drop level 2 and have `Show full transcript` go
straight to level 3.

## 8. Details page — tabbed, sticky video

`SessionDetailsPage`'s left column gains a segmented control: `Detected events (N) | Transcript`.
Events and transcript are two views of one timeline, so tabbing keeps the page bounded. The video
becomes `sticky top-0` in that column and stays visible while either list scrolls. The right rail
(summary, tags, info, stats, profile) is unchanged.

Rejected: stacking the transcript beneath the events list. It makes the page 3–4× taller and leaves
the right rail floating beside empty space.

Transcript view carries a sticky search bar, a `Group by event` toggle that inserts event dividers
into the narration, a `max-w-[70ch]` measure, and auto-follow that disengages on manual scroll with
a `Jump to playhead` pill to re-engage.

Defaults: `Detected events` is the active tab on a normal page visit, `Transcript` on a citation
arrival. `Group by event` defaults **on** — the grouped form is the readable one, and flat is the
opt-out for users who want an uninterrupted record. Auto-follow defaults on only while the video is
playing.

`PageTopbar` gains a back **label** prop, so a citation arrival reads `← Back to response` and
restores `activeHistoryId` scrolled to that response, instead of the generic back-to-results.

## 9. Oracle citations

`contentHtml` renders through `dangerouslySetInnerHTML` (`AIResponseOracle.tsx:103`), so chips are
authored directly in the HTML string:

```html
<button class="oracle-cite" data-cite="28">28</button>
```

A `useCitations(containerRef, citations)` hook attaches one delegated listener for
`mouseenter` / `focus` / `click` on `[data-cite]` and drives a single `CitationPreview` instance
positioned from the chip's `getBoundingClientRect`. One card, no per-chip React nodes, no markdown
parser.

**Citations cluster.** From the answer corpus: `[4][5][17][18][23][27][29][50]` supports one table
cell, and that is typical. Any design requiring navigation per chip is unusable at that density,
which is why hover carries the primary load.

**`kind: 'video'`** — hover opens a preview: the clip cued to `startSec` and looping the cited span
only, muted, plus the transcript excerpt beneath with the claim span highlighted. The excerpt is
what explains *why* the clip is evidence. An `Open in transcript` action deep-links through.

**`kind: 'table'`** — hover shows the fully-qualified name plus the referenced rows with the cited
cell highlighted, and an `Open in Snowflake` action to the warehouse detail view. FQN alone is not
enough to check a claim.

Hover opens after a ~350ms delay so scanning prose does not fire a cascade of previews. The card is
pinnable so users can click inside it. Chips are focusable buttons: focus opens the card, so keyboard
and touch users are not dependent on hover. Adjacent chips in a cluster need a ≥24px hit area and
the card must reposition without flicker as the pointer crosses between them.

The copy handler at `AIResponseOracle.tsx:64` uses `textContent` and would leak bare chip numbers
into copied text. Strip `[data-cite]` elements before copying.

## 10. Deep-link contract

```ts
{ videoId: string, segmentId: string, scope: 'cited' | 'full', returnTo?: ReturnTarget }
```

The details page mounts the Transcript tab, filters to cited segments when `scope === 'cited'`,
scrolls to `segmentId`, and flash-rings it. Arriving scoped shows a banner:
`4 moments referenced by Oracle · Show full transcript`.

This is the key move for a text-heavy transcript: **the entry point sets the scope.** A citation
arrival never renders the full wall, which solves length more effectively than any show-more control.

Oracle sits on a different `activeNav` branch than the session details page, so `returnTo` carries
`{nav: 'oracle', historyId, responseId}` for the back path.

## 11. States

- Analyzing / uploading — no transcript yet; show the analyzing affordance already used for events.
- Analysis failed — transcript section absent, consistent with the failed branch.
- Zero search matches — empty state inside the list, search field retained.
- Playhead between segments — no row is `aria-current`; auto-follow holds the last passed row.
- Single-segment session — disclosure levels collapse; render the row with no show-more control.
- Citation resolving to a missing segment — preview degrades to the video-level card.

## 12. Scope

**In:** `SessionSidePanel`, `SessionDetailsPage`, `AIResponseOracle` citation chips and previews,
the transcript data model, the shared highlight utility.

**Out:** `LibraryVideoSidePanel`. Library videos have no details page
(`VideoLibraryView.tsx:638` mounts the panel only), so a citation cannot land anywhere for them.
Transcript reaches library videos in a later pass, once that page exists.

## 13. Verification

- Storybook stories per surface and per state, following the args-only pattern used across the
  project. Seed internal state via props where a story needs a non-default state — the pattern
  established by `initialError` on `BigQueryOnboardingModal` and `defaultRefreshConfirmOpen` on
  `BigQueryDetailView`.
- Stories must cover: collapsed, expanded, drill-down, scoped-from-citation, zero-match search,
  analyzing, and single-segment.
- `npm run typecheck` and a production build clean.
- Visual comparison of rendered output, not token audit alone — flex overflow and `min-w-0` on
  truncating rows are the likely failure modes in the 420px panel.
- No Figma source exists for these sections, so Figma-dependent checks (`/parity`, `/tether`,
  `figma-ds-compliance`, `/design-qa`) do not apply until one is created.

## 14. Implementation notes

Two fixes outside the original design turned out to be prerequisites, both found by running the
build rather than reading it.

**The details page left column could collapse to zero width.** The row was `flex` with a
`flex-1 min-w-0` left column and a `w-[380px] shrink-0` right rail. Whenever the available row width
fell below 380px — which happens at a 994px viewport once the nav sidebar and playlist take their
share — the rail consumed everything and the left column measured 0px. Pre-existing, but invisible
until the transcript became that column's primary content. Fixed by letting the row wrap:
`flex-wrap` on the row, `flex-1 basis-[420px] min-w-0` on the left, `basis-[380px] grow min-w-0` on
the rail. Side by side above ~1400px, stacked below, no horizontal overflow either way. Note that a
`min-w` on the left column is the wrong fix — it trades a collapsed column for a clipped one.

**Oracle conversations did not survive the citation round trip.** `OracleAgentView` owned its
`threads` store in local state, and `HomePage.renderContent()` unmounts the view on any `activeNav`
change. Navigating to a citation's evidence therefore destroyed the conversation the back arrow was
meant to return to — the user landed on Oracle's idle screen. Fixed by lifting the store to
`HomePage` via optional `threadStore` / `onThreadStoreChange` props, falling back to internal state
when omitted so stories and other call sites are unaffected. The thread-load effect also needed
`threads` in its dependency list, since on remount the store arrives after first render.
