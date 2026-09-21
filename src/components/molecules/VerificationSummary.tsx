/**
 * VerificationSummary — the two meters a functional report opens on.
 *
 * Two questions, both denominated in the whole file:
 *
 *   Result   — how many of your cases passed.
 *   Coverage — how many of them the run reached at all.
 *
 * Result used to be scored against the cases that ran, which flattered every
 * run with poor coverage: 1,186 of 1,247 reached cases is "95% passed" on a
 * suite of 1,956, where 709 cases nobody exercised are silently excluded from
 * the verdict. A case that was never verified has not passed, and the headline
 * number now says so — the four tiles under it still break out where the rest
 * of the file went, and Coverage beside it says how much was reachable.
 *
 * Under Result the four outcomes are tiles, not a dot-and-count legend: they
 * wear their own tags' chip colours, because a count here and a Fail tag on a
 * row below are the same fact.
 *
 * Nothing here is a control. The card states the result; the toolbar below
 * filters the evidence. Making these counts clickable would put the same
 * filter in two places at two different scales.
 *
 * Code-first prototype — no Figma source yet.
 */

import { CASE_OUTCOME_STYLE } from '../atoms/CaseOutcomeTag'
import type { CaseOutcome, VerificationTotals } from '../../lib/types/testing'

export interface VerificationSummaryProps {
  totals: VerificationTotals
  /**
   * What the run was executed against, in the Coverage caption and in the
   * line under it: a build for an AI run ("reached in v2.3.1"), the sessions
   * for a human one. AI players produce their own footage from one build, so
   * naming a recording count there answered a question nobody asked — the
   * build is the thing a coverage number is comparable across.
   */
  scope?: { kind: 'build'; label: string } | { kind: 'sessions' }
  /**
   * What the report is of — eyebrow and run name — as a band across the top of
   * this card rather than a heading floating above it on the page ground. The
   * card is the object that gets scrolled to, screenshotted and exported, so
   * the title has to travel inside it; the same reason the User Test report
   * keeps its masthead inside its own sheet.
   */
  masthead?: React.ReactNode
  className?: string
}

const OUTCOME_ORDER: { key: CaseOutcome; label: string; colour: string }[] = [
  { key: 'pass', label: 'passed', colour: 'var(--success)' },
  { key: 'fail', label: 'failed', colour: 'var(--error)' },
  { key: 'review', label: 'need review', colour: 'var(--warning)' },
  /* Block is neutral, the same as its tag: a case nobody could verify is not a
     result, and colouring it like one invites it to be counted as a pass. */
  { key: 'blocked', label: 'not verified', colour: 'var(--text-tertiary)' },
]

const n = (v: number) => v.toLocaleString()
const plural = (v: number, one: string, many: string) => (v === 1 ? one : many)

/** Never rounds up into a clean number it has not earned — 99.6% is not 100%. */
function pct(part: number, whole: number) {
  if (whole <= 0) return 0
  if (part >= whole) return 100
  return Math.min(99, Math.max(1, Math.round((part / whole) * 100)))
}

export function VerificationSummary({
  totals,
  scope = { kind: 'sessions' },
  masthead,
  className,
}: VerificationSummaryProps) {
  const unreached = Math.max(0, totals.total - totals.run)
  const byBuild = scope.kind === 'build'

  return (
    <section
      className={['verification-summary flex flex-col w-full rounded-2xl overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      {/* A filled band, not a heading on the same white as the meters: a
          different ground is what makes a header read as a header. */}
      {masthead && (
        <header
          className="flex flex-col gap-xxxs px-l py-m"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          {masthead}
        </header>
      )}

      {/* Two questions, two denominators, two meters. */}
      <div className="summary-meters">
        <Meter
          eyebrow="Result"
          scope={`of the ${n(totals.total)} ${plural(totals.total, 'case', 'cases')} in the file`}
          headline={`${pct(totals.pass, totals.total)}%`}
          caption="passed"
          bar={
            /* The track is the whole file, so the gap at the end of the bar is
               the cases nothing was said about — which is the fact a
               pass-rate over "cases that ran" was hiding. */
            <Bar
              label={`${totals.pass} pass, ${totals.fail} fail, ${totals.review} need review, ${totals.blocked} not verified, out of ${totals.total} cases in the file`}
              segments={OUTCOME_ORDER.map((o) => ({
                key: o.key,
                width: `${(totals[o.key] / Math.max(1, totals.total)) * 100}%`,
                colour: o.colour,
                empty: totals[o.key] === 0,
              }))}
            />
          }
        >
          {/* Four tiles, not four dots in a caption. These are the numbers a
              reader came for — a dot-and-count legend under a bar reads as the
              bar's footnote, and "23 failed" is not a footnote. Each tile wears
              its own outcome's chip colours, so a count here and a tag on a row
              below are recognisably the same thing. */}
          <dl className="outcome-tiles m-0">
            {OUTCOME_ORDER.map((o) => {
              const chip = CASE_OUTCOME_STYLE[o.key]
              return (
                <div
                  key={o.key}
                  className={[
                    'flex flex-col gap-xxxs rounded-m px-s py-xs min-w-0',
                    chip.inkClass,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ backgroundColor: chip.bg, color: chip.inkClass ? undefined : chip.ink }}
                >
                  <dd className="font-display text-l font-semibold leading-[1.2] m-0">
                    {n(totals[o.key])}
                  </dd>
                  <dt className="font-body text-xs font-medium leading-[1.4]">{o.label}</dt>
                </div>
              )
            })}
          </dl>
        </Meter>

        <Meter
          eyebrow="Coverage"
          scope={`of the ${n(totals.total)} ${plural(totals.total, 'case', 'cases')} in the file`}
          headline={`${pct(totals.run, totals.total)}%`}
          caption={
            byBuild
              ? `reached in ${scope.label}`
              : `reached across ${n(totals.videos)} ${plural(totals.videos, 'session', 'sessions')}`
          }
          divided
          bar={
            <Bar
              label={`${totals.run} of ${totals.total} cases reached`}
              segments={[
                {
                  key: 'run',
                  width: `${(totals.run / Math.max(1, totals.total)) * 100}%`,
                  colour: 'var(--brand)',
                  empty: totals.run === 0,
                },
              ]}
            />
          }
        >
          {/* One sentence. The gloss that followed it — "neither passed nor
              failed, nothing below reports on them" — is what the Result
              meter's own denominator already says, and a two-line footnote
              under a one-line meter unbalanced the pair. */}
          <p className="font-body text-xs text-text-secondary leading-[1.6] max-w-[46ch]">
            {unreached > 0
              ? `${n(unreached)} ${plural(unreached, 'case was', 'cases were')} never exercised in ${
                  byBuild ? 'this build' : 'these sessions'
                }.`
              : 'Every case in the file was reached.'}
          </p>
        </Meter>
      </div>
    </section>
  )
}

function Meter({
  eyebrow,
  scope,
  headline,
  caption,
  bar,
  divided,
  children,
}: {
  eyebrow: string
  /** The denominator, said out loud — the reason there are two of these. */
  scope: string
  headline: string
  caption: string
  bar: React.ReactNode
  /** Rules off from the meter beside it, only where they sit side by side. */
  divided?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={['summary-meter flex flex-col gap-s px-l py-m', divided && 'summary-meter-divided']
        .filter(Boolean)
        .join(' ')}
    >
      <span className="flex flex-wrap items-baseline gap-xs">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary leading-[1.5]">
          {eyebrow}
        </span>
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">{scope}</span>
      </span>

      <span className="flex items-baseline gap-xs">
        <span className="font-display text-2xl font-semibold text-text-primary leading-[1.1]">
          {headline}
        </span>
        <span className="font-body text-s text-text-secondary leading-[1.4]">{caption}</span>
      </span>

      {bar}
      {children}
    </div>
  )
}

function Bar({
  label,
  segments,
}: {
  label: string
  segments: { key: string; width: string; colour: string; empty?: boolean }[]
}) {
  return (
    <div
      className="flex w-full h-[8px] rounded-round overflow-hidden"
      style={{ backgroundColor: 'var(--bg-subtle)' }}
      role="img"
      aria-label={label}
    >
      {/* A non-zero outcome never renders as a hairline. 31 failures out of
          1,247 is 2.5% of the track — under 3px it reads as a clean green bar,
          which is the one thing this report must not say. */}
      {segments.map((s) => (
        <span
          key={s.key}
          style={{ width: s.width, minWidth: s.empty ? 0 : 3, backgroundColor: s.colour }}
        />
      ))}
    </div>
  )
}
