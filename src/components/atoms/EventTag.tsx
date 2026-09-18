/**
 * EventTag — Pill-shaped label for tagging sessions/events.
 *
 * A tag is a label, not a sentence: the pill caps its label at the shared
 * `.tag-label` measure and ellipsises past it, so one imported tag like
 * "B.A.N.K..O.F..B.A.R.O.D.A.BossFightv1.2" cannot take a whole row away from
 * the tags beside it. The full text stays available on hover and to a screen
 * reader — nothing is lost, it is only folded.
 *
 * @figmaComponent  Event Tag
 * @figmaNode       107:23034
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=107-23034
 */

interface EventTagProps {
  label: string
  /** Where the pill has a wide row to itself — a dialog, a detail panel. */
  wide?: boolean
  className?: string
}

export function EventTag({ label, wide = false, className }: EventTagProps) {
  return (
    <span
      title={label}
      className={[
        'inline-flex items-center justify-center max-w-full',
        'px-s py-[4px]',
        'rounded-round',
        'bg-base-50',
        'font-body text-2xs font-medium tracking-[0.2px] text-base-900 leading-[16px]',
        'whitespace-nowrap',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={wide ? 'tag-label tag-label-wide' : 'tag-label'}>{label}</span>
    </span>
  )
}
