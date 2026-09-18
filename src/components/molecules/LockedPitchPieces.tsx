/**
 * LockedPitchPieces — the parts a locked test's or a locked area's pitch is
 * built from, so the two screens are one page at two scopes.
 *
 * The page they compose answers four questions in order, one per band, each
 * with a single idea in it:
 *
 *   1. What is this, and can I have it?      → PitchHero
 *   2. What would it do for me?              → PitchSection "What you get"
 *   3. What does it actually produce?        → PitchSection "…a finished run"
 *   4. How do I get it?                      → UnlockSteps
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
import { TESTING_ACCENT_VARS, type TestingAccent } from '../../lib/studioAreas'

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
  accent: TestingAccent
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
   * Optional, and normally omitted: the ask lives in `PitchClose` at the foot
   * of the page, after the argument that earns it.
   */
  action?: ReactNode
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
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  planLine,
  className,
}: PitchHeroProps) {
  const vars = TESTING_ACCENT_VARS[accent]
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
          style={{ background: vars.gradient, boxShadow: `0 8px 24px ${vars.bg}` }}
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

export interface PitchSectionProps {
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
export function PitchSection({ label, trailing, children, className, style }: PitchSectionProps) {
  return (
    <section className={['pitch-band flex flex-col gap-m', className].filter(Boolean).join(' ')} style={style}>
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
  /** Three concrete things the studio gets, phrased as outcomes. */
  outcomes: string[]
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
 */
export function PitchOutcomes({ outcomes, art, accent, className }: PitchOutcomesProps) {
  return (
    <div
      className={['grid gap-m items-stretch', className].filter(Boolean).join(' ')}
      style={{ gridTemplateColumns: `repeat(${Math.min(outcomes.length, 3)}, minmax(0, 1fr))` }}
    >
      {outcomes.map((outcome, i) => (
        <div
          key={outcome}
          className="flex flex-col gap-m rounded-3xl p-m"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
        >
          <span
            className="flex items-center justify-center rounded-2xl px-l py-m"
            style={{ backgroundColor: 'var(--bg-page-pale)' }}
          >
            <PitchArt art={art?.[i] ?? 'report'} accent={accent} className="max-w-[190px]" />
          </span>
          <p className="font-body text-s text-text-primary leading-[1.65] m-0 px-xs pb-xs">{outcome}</p>
        </div>
      ))}
    </div>
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
      className={['grid gap-m list-none m-0 p-0 items-stretch', className].filter(Boolean).join(' ')}
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step, i) => (
        <li key={step.title} className="flex flex-col gap-xs">
          <span className="flex items-center gap-xs">
            <span
              className="flex items-center justify-center shrink-0 w-6 h-6 rounded-round font-display text-2xs font-bold tabular-nums"
              style={{ backgroundColor: 'var(--bg-tint)', color: 'var(--text-brand)' }}
              aria-hidden
            >
              {i + 1}
            </span>
            <span className="font-display text-s font-semibold text-text-primary leading-[1.4]">{step.title}</span>
          </span>
          <p className="font-body text-s text-text-secondary leading-[1.6] m-0">{step.body}</p>
        </li>
      ))}
    </ol>
  )
}

export interface PitchCloseProps {
  steps: UnlockStep[]
  /** The page's one primary. */
  action: ReactNode
  secondaryAction?: ReactNode
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
 */
export function PitchClose({ steps, action, secondaryAction, planLine, className }: PitchCloseProps) {
  return (
    <div
      className={['flex flex-col rounded-4xl overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-tint)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="px-xl pt-xl pb-l">
        <UnlockSteps steps={steps} />
      </div>
      <div
        className="flex items-center gap-m flex-wrap px-xl py-l"
        style={{
          borderTop: '1px solid var(--border-tint)',
          background: 'linear-gradient(90deg, var(--bg-tint) 0%, var(--bg-tint-light) 100%)',
        }}
      >
        {action}
        {secondaryAction}
        {planLine && (
          <p className="font-body text-s text-text-secondary leading-[1.6] m-0 flex-1 min-w-[280px]">{planLine}</p>
        )}
      </div>
    </div>
  )
}
