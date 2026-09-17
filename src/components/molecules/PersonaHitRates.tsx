/**
 * PersonaHitRates — which kinds of AI player hit a finding, and how hard.
 *
 * A behavioural finding already says "16 of 20 agents". The question that
 * number cannot answer is the one that changes what you do about it: is this
 * everyone, or is it one kind of player? Eight of eight whales walking past the
 * battle pass is a finding about whales — a different fix, a different owner,
 * possibly a different quarter — and at the run level it is indistinguishable
 * from eight of twenty agents.
 *
 * So the unit here is the rate *within* each persona, never the share of the
 * total. Two consequences follow:
 *
 *   · Every bar is drawn on the same 0–100% scale, so their lengths are
 *     comparable by eye. The version this replaces drew one bar split by
 *     headcount, which made a persona with more agents in the run look like the
 *     one more affected by the finding.
 *   · The denominator is always printed. "10" is unreadable; "10 of 12" is a
 *     rate, and a rate is the only thing worth comparing between personas.
 *
 * No prose. The rows are ordered by rate, so the strongest signal is simply the
 * top row and the longest bar — a reader draws the conclusion, and the report
 * does not put words in the run's mouth.
 *
 * Code-first prototype — no Figma source yet.
 */

import { AIPlayerIcon } from '../icons/AIPlayerIcon'

export interface PersonaHitRate {
  persona: string
  /** Agents of this persona that hit the finding. */
  hit: number
  /** Agents of this persona in the run. */
  of: number
  /** The colour this persona carries everywhere else in the run. */
  tone: string
}

export interface PersonaHitRatesProps {
  rates: PersonaHitRate[]
  className?: string
}

export function PersonaHitRates({ rates, className }: PersonaHitRatesProps) {
  if (rates.length === 0) return null
  /* Strongest first: the row order is itself the finding about who this hits. */
  const ordered = [...rates].sort((a, b) => b.hit / b.of - a.hit / a.of)

  return (
    <div
      className={['flex flex-col gap-xxs w-full max-w-[420px]', className].filter(Boolean).join(' ')}
    >
      {/* The glyph, not just the words: this block sits in a report whose other
          sections are about human sessions, and the reader is scanning rather
          than reading labels. The dots stay the colour key — a row of tinted
          glyphs is harder to compare at a glance than a row of solid dots, and
          the same key has to hold across the evidence chips below. */}
      <span className="flex items-center gap-xs font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
        <AIPlayerIcon size={12} />
        By AI player
      </span>

      {ordered.map(({ persona, hit, of, tone }) => {
        const pct = of > 0 ? Math.round((hit / of) * 100) : 0
        return (
          <div
            key={persona}
            className="persona-rate-row items-center gap-s"
            role="group"
            aria-label={`${persona}: ${hit} of ${of} agents, ${pct} percent`}
          >
            <span className="flex items-center gap-xs min-w-0">
              <i
                className="w-[8px] h-[8px] rounded-round shrink-0"
                style={{ backgroundColor: tone }}
                aria-hidden
              />
              <span className="font-body text-s text-text-primary leading-[1.5] truncate">
                {persona}
              </span>
            </span>

            {/* The track is the persona's own agents, so a full bar means every
                one of them hit it — regardless of how many that is. */}
            <span
              className="flex h-[6px] w-full rounded-round overflow-hidden"
              style={{ backgroundColor: 'var(--bg-subtle)' }}
              aria-hidden
            >
              <span
                className="block h-full rounded-round"
                style={{ width: `${pct}%`, backgroundColor: tone, minWidth: hit > 0 ? 3 : 0 }}
              />
            </span>

            <span className="font-body text-xs text-text-secondary leading-[1.5] tabular-nums whitespace-nowrap text-right">
              {hit} of {of}
            </span>
          </div>
        )
      })}
    </div>
  )
}
