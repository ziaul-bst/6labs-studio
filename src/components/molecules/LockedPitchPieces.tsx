/**
 * LockedPitchPieces — the parts a locked test's or a locked area's pitch is
 * built from, so the two screens are one page at two scopes.
 *
 * The page they compose answers four questions in order, one per band, each
 * with a single idea in it:
 *
 *   1. What is this, and can I have it?      → PitchHero
 *   2. How does it work?                     → PitchFlow
 *   3. What would it do for me?              → PitchOutcomes
 *   4. How do I get it?                      → PitchClose
 *
 * The version this replaced put all four in three boxes of equal weight — a
 * grey "not included" strip, a bullet card and a faded preview — so nothing
 * led, the page opened on what the reader *cannot* do, and the lock was said
 * three times. Here the hero is the only loud thing on the screen, it opens
 * with the product rather than the restriction, and the lock is a quiet chip
 * beside the title.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { CSSProperties, ReactNode } from 'react'
import { LockBadge } from '../atoms/LockBadge'
import { PitchArt, type PitchArtKey } from './PitchArt'
import { TESTING_ACCENT_VARS, type TestingAccent, type TestingOutcome } from '../../lib/studioAreas'

export interface PitchHeroProps {
  /** The test's or area's own glyph, sized 32. */
  icon: ReactNode
  /** The same glyph at 128, for the watermark. Falls back to `icon`. */
  watermark?: ReactNode
  /**
   * Fills the hero's right half. A `PitchScene` on a test — each one draws
   * that test's own setup; the watermark alone when there is nothing to
   * picture (the area-level pitch).
   */
  visual?: ReactNode
  /**
   * The GROUP's colour — blue for human testing, green for AI — which is what
   * the eyebrow, the wash and every drawing on the page are keyed to.
   */
  accent: TestingAccent
  /**
   * The TEST's own colour, for the 64px identity tile alone. That tile is the
   * badge the sidebar row and the Overview tile also wear, so it stays the
   * test's; everything around it speaks about the group.
   */
  iconAccent?: TestingAccent
  /**
   * Which kind of test this is and where its footage comes from — "AI player
   * testing · 6labs plays your build". Two tests that end in the same report
   * were otherwise indistinguishable at a glance.
   */
  eyebrow?: string
  title: string
  /** One sentence: what this does. The largest body type on the page. */
  description: string
  /**
   * Normally omitted: the ASK lives in `PitchClose` at the foot of the page,
   * after the argument that earns it.
   */
  action?: ReactNode
  /**
   * A quieter offer that is not the ask — "View a sample report". It belongs
   * up here precisely because the closing band is reserved for sales.
   */
  secondaryAction?: ReactNode
  planLine?: string
  className?: string
}

/**
 * The page's focal point: the product's own identity at full size, wearing a
 * lock rather than being hidden behind one. The accent wash and the oversized
 * watermark are the only decoration on the screen — everything below is plain
 * white cards, so the eye starts here.
 */
export function PitchHero({
  icon,
  watermark,
  visual,
  accent,
  iconAccent,
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  planLine,
  className,
}: PitchHeroProps) {
  const vars = TESTING_ACCENT_VARS[accent]
  const badge = TESTING_ACCENT_VARS[iconAccent ?? accent]
  return (
    <section
      className={['pitch-band relative overflow-hidden rounded-4xl px-xxl2 py-xxl2', className].filter(Boolean).join(' ')}
      style={{
        backgroundColor: 'var(--bg-elements)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Accent wash — the test's own colour, at the weight of a paper stock. */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(120% 150% at 100% 0%, ${vars.bg} 0%, transparent 62%)` }}
        aria-hidden
      />
      {/* The right half: the evidence stack where a test has one, and the
          test's own glyph oversized and nearly invisible where it does not.
          Either way it sits in the empty half, never under the copy, and both
          disappear below lg rather than crowding the sentence. */}
      {visual ? (
        <span className="absolute hidden lg:flex items-center pointer-events-none" style={{ right: 40, top: 0, bottom: 0 }} aria-hidden>
          {visual}
        </span>
      ) : (
        <span
          className="absolute hidden lg:block pointer-events-none"
          style={
            {
              right: 56,
              top: '50%',
              color: vars.ink,
              opacity: 0.05,
              transform: 'translateY(-50%) scale(1.6)',
              transformOrigin: 'center',
            } as CSSProperties
          }
          aria-hidden
        >
          {watermark ?? icon}
        </span>
      )}

      <div className="relative flex flex-col gap-m max-w-[62ch]">
        <span
          className="flex items-center justify-center shrink-0 w-[64px] h-[64px] rounded-2xl text-white"
          style={{ background: badge.gradient, boxShadow: `0 8px 24px ${badge.bg}` }}
          aria-hidden
        >
          {icon}
        </span>

        <div className="flex flex-col gap-s">
          {eyebrow && (
            <span
              className="font-display text-xs font-semibold uppercase tracking-[0.1em] leading-[1.5]"
              style={{ color: vars.ink }}
            >
              {eyebrow}
            </span>
          )}
          <div className="flex items-center gap-s flex-wrap">
            <h1 className="font-display text-2xl font-extrabold text-text-primary leading-[1.15] tracking-[-0.01em]">
              {title}
            </h1>
            <LockBadge label="Not on your plan" />
          </div>
          <p className="font-body text-m text-text-secondary leading-[1.65] m-0">{description}</p>
        </div>

        {(action || secondaryAction) && (
          <div className="flex items-center gap-s flex-wrap pt-xxs">
            {action}
            {secondaryAction}
          </div>
        )}

        {planLine && (
          <p className="font-body text-s text-text-tertiary leading-[1.6] m-0">{planLine}</p>
        )}
      </div>
    </section>
  )
}

/**
 * PitchJumpLink — the way down to the ask from the top of the page.
 *
 * The one primary lives at the foot, after the argument that earns it, which
 * leaves a reader who has already decided with a page to scroll. This is the
 * shortcut, and it is deliberately a link rather than a button: a second
 * button in the hero would be a second ask.
 *
 * Not an `<a href="#…">` — the studio is hash-routed, so a fragment href would
 * be read as a route and navigate away.
 */
export function PitchJumpLink({ targetId, children }: { targetId: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        const el = document.getElementById(targetId)
        if (!el) return
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      }}
      className="inline-flex items-center gap-xxs font-body text-s font-semibold text-text-brand leading-[1.5] hover:underline"
    >
      {children}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 3.5v9M4.5 9 8 12.5 11.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export interface PitchSectionProps {
  /** Anchor for the hero's jump link. Carries its own scroll-margin. */
  id?: string
  /** Small-caps label — the question this band answers. */
  label: string
  /** Right-aligned mark, e.g. a "Sample data" chip. */
  trailing?: ReactNode
  children: ReactNode
  className?: string
  /** Carries `--pitch-delay`, so the bands arrive on a stagger. */
  style?: CSSProperties
}

/** A labelled band. The label is furniture; the content below it is the point. */
export function PitchSection({ id, label, trailing, children, className, style }: PitchSectionProps) {
  return (
    <section
      id={id}
      className={['pitch-band flex flex-col gap-m', className].filter(Boolean).join(' ')}
      style={{ scrollMarginTop: 24, ...style }}
    >
      <div className="flex items-center gap-s">
        <h2 className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5] m-0">
          {label}
        </h2>
        <span className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} aria-hidden />
        {trailing}
      </div>
      {children}
    </section>
  )
}

export interface PitchOutcomesProps {
  /** Three concrete things the studio gets — see TestingOutcome. */
  outcomes: TestingOutcome[]
  /** One illustration per outcome, in order. Falls back to the report drawing. */
  art?: PitchArtKey[]
  accent: TestingAccent
  className?: string
}

/**
 * The outcomes as three equal tiles rather than a bullet list inside a card.
 * A list reads as specification; three tiles under "What you get" read as
 * three things you would have.
 *
 * Each tile opens on a flat drawing of its own outcome, in a pale well. Three
 * sentences of equal weight in a row is a paragraph pretending to be a layout;
 * the drawing is what makes the three of them scannable, and it carries the
 * only accent colour in the band.
 *
 * Under the drawing the tile names itself before it argues. The title is what
 * carries across a row — three or four words you can compare tile to tile —
 * and the sentence is what you read once one of them has caught you. Without
 * it the band asked the reader to parse three full claims to find out what the
 * three tiles even were.
 */
export function PitchOutcomes({ outcomes, art, accent, className }: PitchOutcomesProps) {
  /* Three outcomes stack drawing-over-sentence and fill the measure. Two would
     each be half the page wide, which turns the well into a field of nothing
     around a small drawing — so a short row turns on its side instead. */
  const wide = outcomes.length < 3

  return (
    <div
      className={['grid gap-m items-stretch', className].filter(Boolean).join(' ')}
      style={{ gridTemplateColumns: `repeat(${Math.min(outcomes.length, 3)}, minmax(0, 1fr))` }}
    >
      {outcomes.map((outcome, i) => (
        <div
          key={outcome.title}
          className={[
            'rounded-3xl p-m',
            wide ? 'flex items-center gap-l' : 'flex flex-col gap-m',
          ].join(' ')}
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
        >
          <span
            className={[
              'flex items-center justify-center rounded-2xl',
              wide ? 'shrink-0 w-[196px] px-m py-m' : 'px-l py-m',
            ].join(' ')}
            style={{ backgroundColor: 'var(--bg-page-pale)' }}
          >
            <PitchArt art={art?.[i] ?? 'report'} accent={accent} className="max-w-[190px]" />
          </span>
          <div
            className={[
              'flex flex-col gap-xxs min-w-0',
              wide ? 'flex-1 pr-xs' : 'px-xs pb-xs',
            ].join(' ')}
          >
            <span className="font-display text-m font-semibold text-text-primary leading-[1.35] wrap-anywhere">
              {outcome.title}
            </span>
            {/* Secondary ink under the title: two lines of primary stacked on
                each other is two headlines, and the one that matters is the
                one you can compare across the row. */}
            <p className="font-body text-s text-text-secondary leading-[1.65] m-0">{outcome.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export interface PitchOfferProps {
  /** The drawing for the thing being offered — the report, usually. */
  art: PitchArtKey
  accent: TestingAccent
  title: string
  body: string
  /** One secondary control. This band is an offer, not the ask. */
  action: ReactNode
  className?: string
  /** Carries `--pitch-delay`, so this row joins the page's stagger. */
  style?: CSSProperties
}

/**
 * PitchOffer — one thing the reader can do before buying, on its own row.
 *
 * It exists because the sample report needed a home that was neither the hero
 * nor the closing band. In the hero it met the reader before the argument; in
 * the closing band it sat beside "Contact sales" and made the ask ambiguous.
 * Here it lands straight after "What you get", which is exactly the moment
 * someone wants to see the thing rather than read about it.
 *
 * Laid out sideways — drawing, then the offer, then the control — so it reads
 * as an aside between two bands rather than as a fifth section.
 *
 * Code-first prototype — no Figma source yet.
 */
export function PitchOffer({ art, accent, title, body, action, className, style }: PitchOfferProps) {
  return (
    <section
      className={['pitch-band flex items-center gap-l rounded-3xl p-m', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)', ...style }}
    >
      <span
        className="flex items-center justify-center shrink-0 w-[168px] rounded-2xl px-m py-m"
        style={{ backgroundColor: 'var(--bg-page-pale)' }}
      >
        <PitchArt art={art} accent={accent} className="max-w-[140px]" />
      </span>
      <span className="flex flex-col gap-xxs flex-1 min-w-0">
        <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">{title}</span>
        <span className="font-body text-s text-text-secondary leading-[1.6]">{body}</span>
      </span>
      <span className="shrink-0 pr-xs">{action}</span>
    </section>
  )
}

export interface PitchFlowStep {
  art: PitchArtKey
  title: string
  body: string
}

export interface PitchFlowProps {
  steps: PitchFlowStep[]
  accent: TestingAccent
  className?: string
}

/**
 * How it works — three stages, left to right, with an arrow between them.
 *
 * This band exists because two tests that produce the same report were reading
 * as the same product. They are not: on a human test the studio supplies the
 * footage and 6labs reads it; on an AI test 6labs' own players produce the
 * footage first. Only the first stage differs, and showing all three is what
 * makes that legible — the analysis and the report really are the same, which
 * is the point, not an oversight.
 */
export function PitchFlow({ steps, accent, className }: PitchFlowProps) {
  return (
    <ol className={['flex items-stretch gap-xs list-none m-0 p-0', className].filter(Boolean).join(' ')}>
      {steps.map((step, i) => (
        <li key={step.title} className="contents">
          <div
            className="flex flex-col gap-m flex-1 min-w-0 rounded-3xl p-m"
            style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
          >
            <span
              className="flex items-center justify-center rounded-2xl px-l py-m"
              style={{ backgroundColor: 'var(--bg-page-pale)' }}
            >
              <PitchArt art={step.art} accent={accent} className="max-w-[170px]" />
            </span>
            <span className="flex flex-col gap-xxs px-xs pb-xs">
              <span className="font-display text-s font-semibold text-text-primary leading-[1.4]">{step.title}</span>
              <span className="font-body text-s text-text-secondary leading-[1.6]">{step.body}</span>
            </span>
          </div>
          {i < steps.length - 1 && (
            <span className="hidden md:flex items-center shrink-0 text-text-tertiary" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

export interface UnlockStep {
  title: string
  body: ReactNode
}

export interface UnlockStepsProps {
  steps: UnlockStep[]
  className?: string
}

/**
 * How to unlock it, as a path rather than a button.
 *
 * "Contact sales" on its own says who to ask, not what happens next — so the
 * reader cannot tell whether they are starting a procurement cycle or a
 * two-minute mail. Three steps, ending in what they already have, answer that
 * before they click anything.
 */
export function UnlockSteps({ steps, className }: UnlockStepsProps) {
  return (
    <ol
      className={['grid gap-m list-none m-0 p-0 items-start', className].filter(Boolean).join(' ')}
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex flex-col gap-s">
          {/* The rail to the next step, drawn from this numeral's edge across
              the grid gap. It sits on the numeral's own line, which is why the
              numeral has a line to itself — run inline with the title and the
              rail strikes straight through the words. */}
          {i < steps.length - 1 && (
            <span
              className="absolute hidden md:block"
              style={{ left: 36, right: -16, top: 13, height: 1, backgroundColor: 'var(--border-tint)' }}
              aria-hidden
            />
          )}
          <span
            className="relative flex items-center justify-center shrink-0 w-7 h-7 rounded-round font-display text-xs font-bold tabular-nums"
            style={{ backgroundColor: 'var(--bg-tint)', color: 'var(--text-brand)' }}
            aria-hidden
          >
            {i + 1}
          </span>
          <span className="flex flex-col gap-xxs">
            <span className="font-display text-s font-semibold text-text-primary leading-[1.4]">{step.title}</span>
            <span className="font-body text-s text-text-secondary leading-[1.6]">{step.body}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export interface PitchCloseProps {
  steps: UnlockStep[]
  /** The page's one primary — and the only control in this band. */
  action: ReactNode
  /** What the plan *does* include — so the close is not only about the gap. */
  planLine?: string
  className?: string
}

/**
 * The band the page ends on: how to unlock it, then the button that starts it.
 *
 * The action used to sit in the hero, which meant a reader met the ask before
 * the argument and found nothing to press once they had finished reading. The
 * steps and the button belong to each other — step one *is* pressing it — so
 * they are one card, brand-tinted, and it is the last thing on the page.
 *
 * Exactly one control lives here. Anything a reader might do that is not
 * "start buying this" — viewing a sample, say — belongs further up the page,
 * or the band stops reading as the ask.
 */
export function PitchClose({ steps, action, planLine, className }: PitchCloseProps) {
  return (
    <div
      className={['flex flex-col rounded-4xl overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-tint)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="px-xxl pt-xl pb-xl">
        <UnlockSteps steps={steps} />
      </div>
      <div
        className="flex items-center gap-m flex-wrap px-xxl py-l"
        style={{
          borderTop: '1px solid var(--border-tint)',
          background: 'linear-gradient(90deg, var(--bg-tint) 0%, var(--bg-tint-light) 100%)',
        }}
      >
        {action}
        {planLine && (
          <p className="font-body text-s text-text-secondary leading-[1.6] m-0 flex-1 min-w-[280px]">{planLine}</p>
        )}
      </div>
    </div>
  )
}
