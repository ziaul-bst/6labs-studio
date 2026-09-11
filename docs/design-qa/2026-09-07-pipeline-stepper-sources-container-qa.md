# Design QA — Pipeline Stepper + Sources Container

**Date:** 2026-09-07
**Scope:** `AgentPipelineLoader`, `SourcesGrid` (rewritten from the live Figma designs)
**Figma file:** `i9fxQ6pXrgRITEzopoXpWL` (6labs), page **GPT**, section **Components**
**Extraction method:** Figma Desktop Bridge (`figma_execute` + `exportAsync`). The REST
token is expired, so all specs and screenshots came from the plugin runtime.

---

## Audit scope

| Figma node | Type | Code |
|---|---|---|
| `6827:5` — Pipeline Stepper / Oracle | COMPONENT_SET, 5 variants | [AgentPipelineLoader.tsx](../../src/components/molecules/AgentPipelineLoader.tsx) |
| `6723:1168096` — Pipeline / Step Item | COMPONENT_SET, 6 variants | same (internal `StepRow`) |
| `7421:11508` — Note | COMPONENT_SET, 4 variants | same (internal `CalloutNote`) |
| `6534:100821` — Infinite Loader | COMPONENT_SET, 6 variants | same (`.pipeline-spinner` CSS) |
| `7610:82344` — Sources Container | COMPONENT_SET, 2 variants | [SourcesGrid.tsx](../../src/components/molecules/SourcesGrid.tsx) |
| `6899:74691` — Source Doc Card | COMPONENT, 2 states | same (internal `SourcePill`) |

**Step 0b (linked screens): N/A.** Both nodes sit in the shared **Components** section
alongside unrelated library items (logos, tags, icons). Nearest siblings were checked by
absolute-bounding-box distance — no adjacent flow frames, no detail pages, no popups.

**Step 0c (container chrome): N/A.** Neither node is a page frame, so there is no topbar,
footer or breadcrumb sibling to reconcile.

---

## Step 0 — Frame / variant enumeration

### Pipeline Stepper / Oracle (`6827:5`)

| Variant | Rows drawn | Rail | Code |
|---|---|---|---|
| `State=Pending` | 1 (title only, hollow marker) | 0% | `state="pending"` |
| `State=Mid Progress` | done rows + active row; later rows `visible:false` | partial | `state="running"` |
| `State=Complete` | all rows done | 100% | `state="complete"` |
| `State=Completet - Summarry` | 3-step summarization pipeline | 100% | `state="complete"` w/ 3 steps |
| `State=Generic Error` | error row + Try again button | hidden | `state="error"` |

The key behaviour recovered from the `visible` flags: **steps are revealed as they start.**
Rows below the active step are not drawn at all, and the pending row carries no duration
and no sub-line. This is why the previous implementation (which rendered every step up
front as "Waiting…") read wrong.

### Pipeline / Step Item (`6723:1168096`)

Axes `Status` (Done · Active · Pending · Error) × `Callout` (False · True) — all 8
combinations covered by `StepStatus` + optional `step.callout`.

### Sources Container (`7610:82344`)

| Variant | Content | Code |
|---|---|---|
| `Property 1=Default` | summary row only (fixed 64px) | `expanded === false` |
| `Property 1=Variant2` | summary + docs row + connectors row + 3-up videos | `expanded === true` |

---

## Step 2 — Token audit

### Pipeline stepper

| Element | Figma token | Code | Status |
|---|---|---|---|
| Rail track | Border/Subtle | `--border-subtle` | PASS |
| Rail fill | Brand Blue/500 | `--brand` | PASS |
| Done marker fill | Dark Green | `--success` | WARN — see note 1 |
| Done/error glyph | Neutral/White | `--text-on-brand` | PASS |
| Active ring track | Translucents Dark/Black-10 | `--border-default` | WARN — see note 2 |
| Active ring arc | (unbound) | `--text-primary` | PASS |
| Pending marker fill | Background/Container Darker | `--bg-page-pale` | PASS |
| Pending marker border | Border/Default @1.5px | `--border-default` @1.5px | PASS |
| Error marker fill | Status/Error | `--error` | PASS |
| Error title | Status/Error/Error | `--error` | PASS |
| Connector | Border/Default | `--border-default` | PASS |
| Step title | Text & Icon/Primary, 14/1.5 SemiBold | `--text-primary`, `text-s font-semibold` | PASS |
| Pending title | Text & Icon/Tertiary | `--text-tertiary` | PASS |
| Duration | Text & Icon/Tertiary, 10px Regular | `--text-tertiary`, `text-2xs` | PASS |
| Description | Text & Icon/Secondary, 12/1.5 Regular | `--text-secondary`, `text-xs` | PASS |

### Note / callout (`7421:11508`)

| Variant | Figma fill | Figma accent | Code | Status |
|---|---|---|---|---|
| Normal | Status/Success/Tint Light | Status/Success | `--success-bg` / `--success` | PASS *(was FAIL — fixed)* |
| Error | Status/Error/Tint Light | Status/Error | `--error-bg` / `--error` | PASS |
| Warning | Status/Warning/Tint Light | Status/Warning | `--warning-bg` / `--warning` | PASS |
| Notice | Status/Notice/Tint Light | Status/Notice | `--notice-bg` / `--notice` | PASS |

Geometry: radius 4 (`rounded-xs`), padding `12 12 12 16`, and the left accent bar is an
**`INNER_SHADOW` at `offset.x = 4`**, not a border — implemented as
`box-shadow: inset 4px 0 0 0 <accent>`.

> **Fixed during this audit:** `Type=Normal` was implemented as a neutral grey
> (`--bg-subtle` / `--border-default`). Figma's `Normal` is the **success-green** tint.

### Sources container

| Element | Figma token | Code | Status |
|---|---|---|---|
| Title "Sources" | Text & Icon/Primary, 16/1.5 SemiBold | `--text-primary`, `text-m` | PASS |
| Count labels | Text & Icon/Tertiary, 12/1.5 Regular | `--text-tertiary`, `text-xs` | PASS |
| Dot separator | Text & Icon/Placeholder, 2×2 | `--text-placeholder`, 2×2 | PASS |
| Chevron | Text & Icon/Secondary, 16px | `--text-secondary` | PASS |
| Doc pill fill | Background/Container Darker | `--bg-page-pale` | PASS |
| Doc pill border | Border/Subtle | `--border-subtle` | PASS |
| Doc pill label | Base/Base-600, 12px Medium | `--text-secondary` (#4F566C = Base-600) | PASS |
| Connector pill fill | Interactive/BG/Pressed | `--bg-subtle` | WARN — see note 3 |
| Connector pill label | Text & Icon/Tertiary, 12px Regular | `--text-tertiary` | PASS |
| Pill radius / padding | 8 / `8 12 8 8` | `rounded-m` / same | PASS |
| Icon tile radius | 6 | `rounded-s` | PASS |
| Thumbnail radius / gap | 8 / 12 | `rounded-m` / `gap-s` | PASS |
| Duration text | Neutral/White, 12px SemiBold | `text-white`, `text-xs font-semibold` | PASS |

**Notes**

1. `Dark Green` is a raw Apparatus primitive with no semantic alias in `globals.css`.
   `--success` (#16A34A) is the closest defined semantic token. Functionally correct.
2. `Translucents Dark/Black-10` (`rgba(0,0,0,0.10)`) has no alias and would be invisible
   in dark mode. `--border-default` is theme-aware and reads correctly in both themes.
3. `Interactive/BG/Pressed` has no alias in `globals.css`. `--bg-subtle` reproduces the
   "one step greyer than the doc pill" relationship the design relies on.

### CSS variable existence check

All 16 `var(--…)` references across both components were grepped against
`src/styles/globals.css` — **16/16 defined**. No raw hex remains in either component.

### Inline-style specificity check

No element carries both an inline `style` and a CSS `:hover`/`:focus` rule for the same
property. No `hover:bg-*` / `hover:text-*` Tailwind utilities on CSS-variable colors.

---

## Step 4 — Visual comparison

Figma captured with `figma_capture_screenshot`; code captured from Storybook
(`localhost:6006`) and the running app (`localhost:5173`).

| Frame | Result |
|---|---|
| Pending | PASS — hollow marker, muted title, no duration, no sub-line |
| Mid Progress | PASS — green checks, connector, two callouts, active ring on the running step |
| Complete | PASS — all rows done, rail 100% |
| Complete – Summary | PASS |
| Generic Error | PASS — red marker + white "!", red title, secondary "Try again" with refresh icon |
| Sources collapsed | PASS — `Sources · 2 docs · 2 connectors · 58 videos ⌄` |
| Sources expanded | PASS — doc pills, connector pills, 3-up thumbnails, chevron flipped |

Verified in the live app end-to-end: an Oracle query renders the Sources block (collapsed,
then expanded on click); a Churn Agent query renders the stepper with the rail advancing
25% → 75% → 100% in step with the pipeline. Console: **no errors**.

Dark mode checked for both components — all tokens are theme-aware and legible.

---

## Step 5 — State coverage

| Figma state | Implemented |
|---|---|
| Stepper: Pending / Mid Progress / Complete / Complete-Summary / Generic Error | Yes (`state` prop) |
| Step Item: Done / Active / Pending / Error | Yes (`StepStatus`) |
| Step Item: Callout True / False | Yes (`step.callout`) |
| Note: Normal / Error / Warning / Notice | Yes (`callout.type`) |
| Sources: Default / Variant2 | Yes (`expanded`) |
| Source Doc Card: Default / Clicked | Rendered as doc pill / connector pill — see deviations |

Every state has a Storybook story.

---

## Step 6 — Icon accuracy

All icons were exported from Figma as `SVG_STRING` via the Desktop Bridge — none redrawn.

| Icon | Source | Code |
|---|---|---|
| Refresh (Try again) | Apparatus Button `L Icon` slot inside `6827:5` | new [RefreshIcon.tsx](../../src/components/icons/RefreshIcon.tsx) |
| Doc | `Doc` instance inside `7610:82344` | new [SourceDocIcon.tsx](../../src/components/icons/SourceDocIcon.tsx) |
| Clock | `Length > Clock` inside the thumbnail | existing `ClockIcon` (path equivalent) |
| Chevron | `Arrows` (`Type=Down/Up`) | existing `ChevronIcon` (`direction`) |
| Snowflake / BigQuery | **raster IMAGE fills** in Figma | existing `SnowflakeIcon` / `BigQueryIcon` |

`SourceDocIcon` was added rather than reusing `FileDocIcon`: Figma's is a 16 viewBox at
1.5 stroke with square corners; `FileDocIcon` is a 20 viewBox at 1.25 stroke with rounded
corners, and is the upload-list variant.

The two connector marks are **placeholder raster images** in the Figma design. Code uses
the existing DS icon components instead. `BigQueryIcon` is a Google "G" on a white tile,
which is exactly what the design shows.

---

## Step 8 — Composition

- `Button` (`variant="secondary" size="md"`) reused for Try again — matches the Figma
  instance props (`Type=Secondary, State=Default`), not rebuilt.
- `ChevronIcon`, `ClockIcon`, `SnowflakeIcon`, `BigQueryIcon` reused.
- The progress rail is local to the stepper rather than the `ProgressBar` atom: the atom
  is 8px tall with `rounded-round` for upload progress, while this is a flush 3px square
  rail. Correct not to overload the atom.
- `SourcesGrid`'s outer 20px padding and `Background/Container` fill are intentionally
  **not** implemented — the component already sits inside the response card's `p-l`, and
  adding them would double the padding.

---

## Step 9 — Interaction / overflow

- The summary row is a real `<button>` with `aria-expanded`.
- The rail is a `role="progressbar"` with `aria-valuenow/min/max`.
- Active step carries `aria-current="step"`.
- Spinner honours `prefers-reduced-motion` (static 3/4 arc).
- Thumbnails are buttons that open the sources side panel.
- No overflow-clipped overlays; no destructive actions in scope.

---

## Deviations from Figma (deliberate)

1. **Rail is data-driven.** Figma pins the fill at 360/720 (50%) in both Pending and Mid
   Progress. Code derives it from `completedSteps / totalSteps`, so it tracks real
   progress. Pending resolves to 0%, matching how the Pending frame renders.
2. **Durations are timed live.** Figma shows literal labels (`1.2s`, `8.2s`). No duration
   data exists in `specializedAgents.tsx`, so the loader times each step and freezes the
   value when the step completes. A pinned `duration` on a step overrides this.
3. **Callout is single-line.** The Note component contains a `Body` text node and a
   `Warning` icon, both `visible: false` in every instance. Only the styled `Title`
   (semibold lead + regular remainder) is implemented.
4. **Doc-card secondary text omitted.** `Source Doc Card` holds `Progression design` and
   `Section 5.2` nodes, but the card clips to 18px so only the filename renders. Code
   models this as a single label rather than reproducing clipped content.
5. **"Consider more videos" checkbox omitted.** Present in the Sources Container structure
   but `visible: false` in **both** variants, so it is not part of the design as drawn.
6. **Connector pills are a separate row.** Figma reuses `Source Doc Card` with
   `States=Clicked` for connectors; code models docs and connectors as distinct props,
   which is what the "2 docs · 2 connectors" summary implies.

---

## Issues to fix

| # | Severity | Item | Status |
|---|---|---|---|
| 1 | FAIL | Note `Type=Normal` mapped to neutral grey instead of the success tint | **Fixed** |
| 2 | FAIL | `#FFFFFF` hardcoded on the done/error glyphs | **Fixed** → `--text-on-brand` |
| 3 | WARN | `Dark Green`, `Translucents Dark/Black-10`, `Interactive/BG/Pressed` have no aliases in `globals.css` | Open — semantic equivalents used; add aliases if these primitives are needed elsewhere |
| 4 | INFO | Connector brand marks are raster placeholders in Figma | Open — add real vector marks to Apparatus |

No MISSING states. No COMPOSITION failures.

**Verdict: PASS** (after fixing items 1 and 2).
