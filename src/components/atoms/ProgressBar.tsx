/**
 * ProgressBar — the one horizontal bar for work that is under way.
 *
 * Three shapes, one idiom:
 *   bar (default)  8px pill, brand fill on the subtle track. Counted work —
 *                  "12 of 20 sessions", an upload at 64%.
 *   indeterminate  Same track, a brand segment sliding through it. Uncounted
 *                  work — the report being written, an answer being composed.
 *                  A determinate bar pinned at 100% while work continues reads
 *                  as stuck; this is what to show instead.
 *   rail           3px, square, flush to a card's top edge. The pipeline
 *                  stepper's progress line.
 *
 * @figmaComponent  Progress Segment
 * @figmaPath       Context / Game Intelligence - Uploading 1 / Section / Container / Uploaded files / Context/ File card / File Info / Progress Segment
 * @figmaNode       0:1464
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6419-74907
 */

export type ProgressBarVariant = 'bar' | 'rail'

interface ProgressBarProps {
  /** 0–100 percent complete. Ignored when `indeterminate`. */
  value?: number
  /** Work with no count — the segment sweeps instead of filling. */
  indeterminate?: boolean
  variant?: ProgressBarVariant
  /** Announced alongside the value, e.g. "Sessions analysed". */
  label?: string
  /**
   * Track colour. Defaults to the subtle grey, which vanishes on a surface of
   * the same grey — a bar on a report masthead passes `var(--bg-elements)`.
   */
  track?: string
  className?: string
}

export function ProgressBar({
  value = 0,
  indeterminate = false,
  variant = 'bar',
  label,
  track,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const rail = variant === 'rail'

  if (indeterminate) {
    return (
      <div
        className={['progress-indeterminate w-full', rail ? 'progress-indeterminate-rail' : '', className]
          .filter(Boolean)
          .join(' ')}
        style={track ? { backgroundColor: track } : undefined}
        role="progressbar"
        aria-label={label}
        aria-busy
      />
    )
  }

  return (
    <div
      className={['w-full overflow-hidden', rail ? 'h-[3px]' : 'h-[8px] rounded-round', className]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: track ?? (rail ? 'var(--border-subtle)' : 'var(--bg-subtle)') }}
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {rail ? (
        /* Scaled rather than width-animated — keeps the fill on the compositor
           and off the layout path. A pill fill keeps its width transition so the
           rounded end stays round. */
        <div
          className="h-full w-full origin-left transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${clamped / 100})`, backgroundColor: 'var(--brand)' }}
        />
      ) : (
        <div
          className="h-full rounded-round transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: 'var(--brand)' }}
        />
      )}
    </div>
  )
}
