# Loading & locked states — design spec (2026-09-18)

Status: implemented in the working tree, **not committed, not deployed** — awaiting Ziaul's review.

## Ask

> UI improvements on loading and locked states: 1.1 asking follow-up questions · 1.2 report page while the run is in progress and videos are live or completed · 1.3 any other page · 2 locked state. Aesthetically pleasing and clean.

## Direction (chosen by a 3-way design panel + 2 judges)

**One wait language, one lock language, fewest parts.**

- A loading surface is the finished surface with its facts missing. Known facts print for real; unknown ones are skeleton bars exactly where the value will land. Nothing moves when content arrives.
- One `role="status"` line per surface says what is happening and how far. Copy rule: verb + object + count where counted ("Reading 10 sessions…", "12 of 20 done"). Never "Loading…".
- Counted work → determinate bar. Uncounted work → indeterminate bar. A bar pinned at 100% while work continues is forbidden.
- Motion budget per surface: one spinner, one bar, one synchronised skeleton shine. Everything stops under `prefers-reduced-motion`.
- Locked is grey, crisp and clickable. One primary action per locked screen ("Contact sales"). One lock mark per surface. No dashed borders, no `opacity`, no `filter: saturate()` on locked content.

## Primitives

| Atom / molecule | What it is |
| --- | --- |
| `Spinner` (atoms) | The one ring. Sizes 12/16/18/24; tones brand / neutral / current / on-dark. Replaces `.testing-spinner`, `.testing-spinner-sm`, `.oracle-step-spinner`, `.pipeline-spinner` (all deleted from `globals.css`). |
| `Skeleton`, `SkeletonText` (atoms) | The one grey bar (text / bar / block / circle) with a slow shine; `shimmer={false}` freezes it. Tokens `--skeleton-base` / `--skeleton-shine` (light + dark). Wrap a surface in `.skeleton-surface`. |
| `ProgressBar` (atoms) | Gained `indeterminate`, `variant="rail"` (3px, for the pipeline stepper) and `track` (track colour, for bars on a `--bg-subtle` band). |
| `LockBadge` (atoms) | Grey chip (`sm`, `md`). A mark, never a control, and never laid over content. |
| `LockedPitchPieces` (molecules) | `PitchHero`, `PitchSection`, `PitchFlow`, `PitchOutcomes`, `UnlockSteps`, `PitchClose` — the bands both locked pitches are built from. |
| `PitchScene` (molecules) | Four hero scenes, one per live test, built from three shared parts (a recording, a case sheet, a persona brief). Draws the test's **setup**, not its report. |
| `PitchArt` (molecules) | Fourteen flat illustrations (`upload`, `aiplayer`, `analysis`, `report`, `document`, `verdicts`, `findings`, `clips`, `compare`, `ask`, `search`, `personas`, `clock`, `rerun`). Token fills, no gradients, one accent element each, `aria-hidden`. **No page may use the same drawing twice** — the flow's last stage is `report` and the preview row is `document`, so a result-shaped outcome takes `verdicts` or `findings`. |
| `StatTile.loading` | Same tile geometry with the value drawn as a skeleton bar; keeps its status dot. |
| `AgentPipelineLoader` | Active step uses `Spinner`; rail is `ProgressBar variant="rail"`; untyped callouts default to a new brand `info` tint (was amber warning); rows land with `.pipeline-step-enter` (220ms). |

Layout constant `--composer-clearance: 176px` — what "scroll to the end of a thread" stops short by under a sticky composer.

## Surfaces

### 1.1 Oracle follow-up (`AIResponseOracle`, `OracleAgentView`, `OracleChatView`)
- New `ORACLE_FOLLOWUP_STEPS` (3 steps, number-light, thread-aware) paced over `ORACLE_FOLLOWUP_MS` = 4 s, instead of the first question's 7 steps / 9 s that claimed "No prior context found in this thread".
- `ChatMessage.followUp` flag set on every message after the first; `AIResponseOracle` picks steps and pacing from it.
- The follow-up card is painted at its final height (232px) so it never grows under the composer; `OracleChatView` also follows the thread's growth with a ResizeObserver, only while the reader is already near the bottom.
- First-question pipeline unchanged in structure; callouts are brand-tinted information, not amber warnings.
- Review chrome: Oracle dock row gained **Follow-up thinking**.

### 1.2 AI behavioural run, Report tab while playing / analysing / nothing recorded (`AIBehaviouralRunView.ReportPending`)
- The report's own sheet arrives: real kicker, run name, run id; the status line replaces "report generated …" and carries the one moving fact plus a quiet text link to the sessions; tiles print personas and sessions played for real and skeleton the rest.
- Playing → determinate bar (12 of 20). Analysing → indeterminate bar + three beats (Sessions read ✓ · Findings ranked ○ · Report written ○). Nothing recorded → dormant sheet (no spinner, no bar, shine frozen).
- Body: real "01 Summary" and "02 Findings" part headers over skeleton prose and three skeleton finding rows.
- No buttons in the sheet. The live strip above the tabs owns the one brand action while playing.
- Topbar "Analysing" pill uses a 12px spinner.

### 1.3 Other pages
- User Test follow-up (`UserTestAskPanel.AnswerPending`): the signed answer sheet arrives with "01 Summary · ○ Reading 10 sessions…" and two skeleton paragraphs; the end sentinel has `scroll-margin-bottom: var(--composer-clearance)` so the sheet is visible above the composer.
- `RunHistoryList`, `AnalysisProgressCard`, `BuildPickerModal`, `ThinkingOracle`: legacy spinner classes swapped for the atom.
- `UserTestHome.SamplePreview`: hand-drawn bars → frozen `Skeleton`.
- Specialized agents inherit the pipeline changes; the churn callout is now explicitly `warning`.

### 2 Locked

First pass kept the old three-box shape (grey "not included" strip + bullet card + preview) and was rejected on review: nothing led, the page opened on the restriction, and the lock seal sat on top of the sample's own rows. Rebuilt as a four-band narrative, one idea per band, in the order the reader asks them.

- **Hero** (`PitchHero`) — the focal point: 64px accent gradient tile, an eyebrow naming the group and the footage source ("Human testing · your own recordings" / "AI player testing · 6labs plays your build"), the test name at 32px extrabold with a quiet "Not on your plan" chip beside it, and the promise sentence at 16px. The only control here is the secondary "View a sample report" — the ASK lives at the foot, after the argument that earns it. The right half carries a `PitchScene`, and **every live test has its own**. It draws the test's setup rather than its report:

  - *User test* — three recordings, each badged with a different tester. Three people, three sessions.
  - *Functional test* — your case sheet, rows ticking off, linked across to a recording one of your testers made.
  - *AI behavioural test* — a persona brief (three coloured personas and a session length) linked across to two devices carrying the 6labs sparkle, one mid-tap.
  - *AI functional test* — your case list nearly complete, linked to a device driven by a player, with a progress strip under it.

  One shared vocabulary — recording, case sheet, brief, person badge, sparkle badge — so the four read as a family without reading as the same picture.
- **How it works** (`PitchFlow`) — three stages with flat illustrations and an arrow between. **Only the first stage differs** between a human test and its AI twin: human = you add your own recordings; AI = no footage needed, 6labs' players produce it from a persona and a brief. Stages two and three are deliberately identical, because the analysis and the report really are the same — which is why the two pages were reading as one product, and this band is the fix.
- **What you get** (`PitchOutcomes`) — the three pitch outcomes as equal tiles, each opening on its own flat drawing in a pale well. Art is chosen per test in `OUTCOME_ART` inside the organism, not in the pitch data: the sentences stay the PM's copy.
- **How to unlock it** (`PitchClose`) — the three steps between asking and running (mail, with the real address; we enable it here; start where you are), then a brand-tinted footer with the page's one primary "Contact sales" and the plan line. **Nothing else lives in this band**: one control, and it is the sale.

**No inline sample run.** One was built (`PitchSampleReport`, a case report and a findings report) and then pulled: a made-up report only reads as the product for a test that produces one shape of document, and the roadmap has tests — localisation, large-scale — whose output it would misrepresent. "View a sample report" sits in the hero as a secondary action instead, which is also what keeps the closing band sales-only. `pitch.previewTitle` / `pitch.previewRows` in `studioAreas.ts` are now unread; they are kept as copy for whatever real sample viewer `onSeeSample` eventually opens.

**Preview row** (`PitchOffer`) — a sideways card between "What you get" and "How to unlock it": the report drawing, "Preview a finished report", one sentence naming what that test's sample is a report *of*, and a secondary lg "See a sample report". It sits there because that is the moment a reader wants to see the thing rather than read about it — not in the hero, where it meets them before the argument, and not in the closing band, where it competes with the sale.

**Copy correction.** User test's "Comparison against the previous build: new, still open and fixed" was removed at Ziaul's request, leaving it two outcomes; `PitchOutcomes` lays a row of fewer than three out horizontally so the drawings are not stranded in half-page wells. Functional test's equivalent — "Regressions surfaced against the previous build" — is removed too, so it is also down to two outcomes. Neither human test claims a build-over-build comparison now. (The SOON External agency test still carries a "Batch-over-batch comparison" line; it has no live pitch page, so it was left alone.)

**Plan presets.** `TESTING_PLAN_PRESETS` now has `unlocked`, `locked-functional` (Functional + AI functional) and `locked-behaviour` (User + AI behavioural), so all four live tests' locked pages are reachable from the Plan row of the state machine dock. Each preset leaves one test unlocked in each group, so a locked sidebar row always sits beside an entitled one.

**Motion.** This is the one animated surface in the studio — a page that is entirely an argument earns some, a page you work on does not. Bands arrive on a 90ms stagger (`.pitch-band`), clips drift out of phase (`.pitch-clip`). Both are `animation: none` under `prefers-reduced-motion`, verified in the browser.

Removed: the grey status banner, the second primary, the dashed panel, the saturate/opacity fade, the button-shaped pill, the centred seal over content, `#8A6300`, and the `LockedPreview` molecule and `LockBadge` `seal` size that the first pass introduced.

`AreaLockedPitch` (Storybook only) uses the same bands one scope up; its middle band is the area's own rows, since there is no PM-written outcomes list to show.
- `TestingOverview` tile chip → `LockBadge`. `UserProfileCard` locked strip → tokenised frost + `LockBadge`. `AreaSegment` purchasable tab: "↗" → `LockIcon` (dashed + muted treatment kept — locked decision). Sidebar row unchanged.

## Verification done
- `tsc --noEmit`: no errors outside the 35 pre-existing story / BigQuery ones.
- Playwright at 1440×900: every state re-shot in light, dark (`.dark`) and `prefers-reduced-motion`; no console errors. Shots in the session scratchpad (`before/`, `after/`, `after-dark/`, `after-rm/`).
- Not visually verified: `AreaLockedPitch` (unreachable in the app; Storybook only).

## Deferred (called out by the judges as separate tickets)
- Replace the local `Spinner()` in `BigQueryOnboardingModal` / `SnowflakeOnboardingModal` with the atom.
- `.oracle-shimmer-text` kept (Figma-mapped `ThinkingOracle`).
- Pre-existing dark-mode gaps noticed while shooting: PageTopbar title and user bubbles are near-invisible in `.dark`.
