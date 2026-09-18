/**
 * Spinner — the one ring the studio uses to say "working".
 *
 * Before this atom the product carried four: a 16px grey ring in Oracle's
 * thinking line, a swept ring in the pipeline stepper, an 18px brand ring in
 * Testing and a 12px amber ring on pending answers. Four idioms for one idea
 * meant a reader learnt "busy" four times. This is the single drawing — a
 * quiet track with a brand arc that rotates and breathes — sized to sit in a
 * label (12/16), a button or pill (18) or on its own (24).
 *
 * `tone`
 *   brand    – default. Brand arc on the brand tint track.
 *   neutral  – secondary-text arc on the subtle border track; for text lines.
 *   current  – inherits `color`, track at 22% of it; for pills and buttons.
 *   on-dark  – white arc for the video frame.
 *
 * Decorative by default (`aria-hidden`). Pass `label` when the ring is the
 * only thing announcing the wait, and it becomes `role="status"`.
 *
 * Code-first prototype — no Figma source yet.
 */

export type SpinnerSize = 12 | 16 | 18 | 24
export type SpinnerTone = 'brand' | 'neutral' | 'current' | 'on-dark'

export interface SpinnerProps {
  size?: SpinnerSize
  tone?: SpinnerTone
  /** Announced to assistive tech; without it the ring is decorative. */
  label?: string
  className?: string
}

const TONE: Record<SpinnerTone, { track: string; arc: string }> = {
  brand: { track: 'var(--bg-tint)', arc: 'var(--brand)' },
  neutral: { track: 'var(--border-subtle)', arc: 'var(--text-secondary)' },
  current: { track: 'color-mix(in srgb, currentColor 22%, transparent)', arc: 'currentColor' },
  'on-dark': { track: 'rgba(255,255,255,0.22)', arc: 'var(--text-on-brand)' },
}

export function Spinner({ size = 16, tone = 'brand', label, className }: SpinnerProps) {
  const stroke = size <= 16 ? 1.5 : 2
  const r = (size - stroke) / 2
  const c = size / 2
  const t = TONE[tone]
  return (
    <svg
      className={['spinner shrink-0', className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx={c} cy={c} r={r} stroke={t.track} strokeWidth={stroke} />
      <circle
        className="spinner-arc"
        cx={c}
        cy={c}
        r={r}
        stroke={t.arc}
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={100}
      />
    </svg>
  )
}
