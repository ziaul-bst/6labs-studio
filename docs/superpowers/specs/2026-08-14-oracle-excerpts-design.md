# Oracle Excerpts — design

**Date:** 2026-08-14
**Surfaces:** `SessionDetailsPage`, `SessionSidePanel`
**Status:** prototype built for PM review; details-page placement undecided by design
**Supersedes:** `2026-08-13-video-transcript-and-citations-design.md` (transcript UI)

---

## 1. What changed

The transcript UI is replaced by **Oracle Excerpts**: the evidence explaining *why* a video was
referenced to answer a user's query. Transcript survives only as one excerpt block type.

The driving insight is that an excerpt is **query-relative**. A video has detected events and a
transcript permanently; it only has an excerpt in the context of a specific question. Everything
below follows from that — most importantly, the excerpt surfaces are absent when there is no query.

## 2. Problems in the concept prototype

Reviewed at `6labs-studio.vercel.app/#/sessions/details/Session2847`, variants V1 / V3.1 / V3.2.

1. **"Oracle Excerpts (55)" is a dump, not an excerpt.** V1 buckets 55 raw passages by minute — the
   same wall problem the transcript had. If Oracle cited the video for a query, the answer is the
   few passages that answered it.
2. **The query is never shown.** The subtitle promises "what in this video answered your question"
   but the question is nowhere on screen. A query line was added to fix this, then **cut after PM
   review** — see §10.
3. **V1's column is too narrow**, rendering text as `game loading/animati ng (user cannot act)`.
4. **No visual system across the six shapes,** and mixed excerpts get cramped in the 380px rail.
5. **The rationale block appears in only one variant.** A "why this matters" block was trialled on
   every shape to fix this, then **cut after PM review** — see §10.

## 3. Block model

Six shapes, one card. The concept's Attributes / Events / Text / Transcript points /
Attributes + Text / Transcript + Text are compositions, not six layouts.

```ts
export type ExcerptBlock =
  | { kind: 'attributes'; rows: ExcerptAttributeRow[] }
  | { kind: 'events'; items: ExcerptEventItem[] }      // timestamp + category + description
  | { kind: 'transcript'; points: ExcerptTranscriptPoint[] }
  | { kind: 'text'; body: string }

export interface OracleExcerpt {
  id: string
  videoId: string
  query: string          // shown in the header
  startSec?: number      // absent for attribute-only excerpts
  endSec?: number
  blocks: ExcerptBlock[]
}
```

Cardinality is **exactly one excerpt per video per query**, internally composed. No list mechanics.

Every event and transcript row is a button that seeks the player. Attribute-only excerpts carry no
range, and the header correctly omits it.

## 4. Details page — two placements under review

Placements A (third tab) and D (full-width band) were cut. Two remain, switchable at runtime via a
floating review toolbar that also switches excerpt shape and shows the trade-off for the selection.

| | Placement | Trade-off |
|---|---|---|
| **B** | **Banner between video and events list** | Leads the column when arriving from Oracle, absent otherwise. Full width for mixed cards, video directly above. Recommended. |
| C | Card in the right rail (concept's V3.1/V3.2) | Sits beside the video with the other session facts, keeping the events list at the top of the column — but 380px is tight once attributes, prose and rationale stack. |

Both use the same `ExcerptCollapsible` container, so the options differ only in **where** the card
sits, not how it looks. C passes `dense`.

Note for reviewers: **C only reads as a rail at roughly ≥1400px.** Below that the content row wraps
and the rail stacks under the left column, so C and B look similar.

The tab bar is gone — with A cut there was never more than one tab, so the left column shows a plain
`Detected Events (N)` heading. `SessionContentTabs` was deleted.

## 5. Visual hierarchy

The first pass rendered nearly everything at 12–14px, which left the card flat. The type scale is now
explicit, largest to smallest:

| Level | Treatment | Role |
|---|---|---|
| 1 | 14px display semibold, primary | attribute values — the facts |
| 2 | 14px body, secondary, 1.7 | prose, event and transcript descriptions |
| 3 | 12px body, tertiary | attribute labels |
| 4 | 10px display semibold uppercase, tertiary | eyebrows — orientation only |
| 5 | 10px mono tabular, tertiary | timestamps |

Two rules hold it together:
- **One accent means one thing.** With the rationale block cut the card body carries no accent at
  all; brand survives only on the container header. Event categories use tertiary, not brand.
- **One container per level.** The collapsible body is an elevated surface with only its header
  tinted, rather than a wholly tinted container. The attributes block dropped its outer border for
  hairline separators, since the card already provides the box.

Prose is capped at 62ch at full width.

## 6. Side panel — placement F, decided

The excerpt is pinned at the top of the panel body, **above the AI summary**, inside a collapsible.
If the panel opened from an Oracle result, the query-specific answer outranks the generic
description. Absent entirely when the user simply browsed to the session.

Dense variant: smaller type, tighter spacing, `headerMode="none"`.

Rejected: a section after Detected Events (buries the reason the user opened the panel), and a
`Summary | Why referenced` toggle (hides one behind the other and adds a control to discover).

## 7. Removed

`TranscriptSection`, `TranscriptList`, `TranscriptSearchField`, `SessionContentTabs` and their
stories are deleted, along with the details-page Transcript tab and the transcript deep-link contract. Retained: `TranscriptRow`
(unused by excerpts but kept for the block styling reference), `lib/mocks/transcript.ts` for
`parseClock` / `formatClock`, and the shared `lib/text/highlight.tsx`.

`TranscriptDeepLink` is replaced by an `oracleArrival` object in `HomePage` carrying the excerpt, the
back label, and the Oracle history id for the return path.

## 8. Prototype scaffolding to remove once decided

- `ExcerptPrototypeSwitcher` and its CSS (`.proto-switcher*`)
- `ExcerptPlacement`, `EXCERPT_PLACEMENT_LABELS`, `EXCERPT_PLACEMENT_RATIONALE`, `ExcerptShape`,
  `EXCERPT_SHAPE_LABELS` in `lib/types/excerpt.ts`
- `defaultPlacement` / `defaultShape` / `hideSwitcher` props on `SessionDetailsPage`
- The hardcoded `MOCK_EXCERPTS['attributes-text']` in `HomePage.handleOpenCitation` and
  `OracleAgentView`, which should come from the response payload

## 9. Verification

- Typecheck holds at 36 pre-existing errors, all in untouched `.stories.tsx` files (HEAD baseline 43).
- Production build clean.
- Both details-page placements confirmed visually in the running app (B at 1280px, C at 1560px where
  the rail actually sits beside the video), including the rationale note updating per placement.
- Type hierarchy verified by computed style: five distinct levels, no accent colour in the card body.
- Side panel placement F verified at 420px both visually and by DOM measurement — no horizontal
  overflow, no clipped elements — across the attributes-and-text and attributes-only shapes.
- Stories cover all six shapes on the card, both placements plus the review build on the details
  page, and four Oracle-arrival cases on the panel.

## 10. Review feedback applied

**Rationale block cut (PM review).** A `rationale` block rendered a "WHY THIS MATTERS" panel — brand
rule, tinted fill — on every shape, stating why the evidence answered the query. PMs asked for it to
go, so the block kind, its renderer and all six fixture entries were removed. The card now shows the
evidence only, which is closer to the concept, where a rationale appeared in just one variant.

**Query line and time range cut (PM review, second pass).** The card header showed an `ANSWERING`
eyebrow with the query as a 16px headline, and the container header showed the excerpt's time range.
Both were struck out in review, so in-app placements now render blocks alone under a plain
`Why this video` header. `headerMode` reduced to `'full' | 'none'`; `'full'` survives only for the
standalone card in Storybook.

Consequence worth tracking: the card no longer states the query it answers, nor why the evidence
answers it, nor the span it covers. The container header is the only remaining framing. Three separate
removals have pulled the same thread, so if reviewers later ask "what question is this answering?"
the answer is that it was deliberately removed — worth re-raising rather than quietly re-adding.

**Excerpt added to the Radiologist side panel.** It was Oracle-only at first. Results are query-driven
too, so `RadiologistResultsView` now passes an excerpt carrying the **actual search query** rather
than the Oracle mock.

## 11. Review links

Deep links skip the Oracle query and its 9s loading state:

- `#/excerpt-review/<placement>/<shape>` — the review screen with the switcher. The URL tracks the
  switcher, so copying the address bar shares an exact variant. Placement is `banner` or `rail`;
  shape is any of the six.
- `#/radiologist/panel` — Radiologist results with the side panel already open.

Both restore correctly on a hash change as well as a full load, and the panel is seeded visible on
arrival rather than playing its slide-in.
