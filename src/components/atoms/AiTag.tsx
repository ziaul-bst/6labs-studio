/**
 * AiTag — Pill for AI-extracted tags (generated from video by the LLM).
 * Visually distinct from the neutral EventTag (user upload tags): a brand-tinted
 * fill with a sparkle glyph signalling the label is machine-generated.
 */
import { AISparkleIcon } from '../icons/AISparkleIcon'

interface AiTagProps {
  label: string
  /** Where the pill has a wide row to itself — a dialog, a detail panel. */
  wide?: boolean
  className?: string
}

export function AiTag({ label, wide = false, className }: AiTagProps) {
  return (
    <span
      /* Folds at the shared tag measure like EventTag and SystemTag — a label
         a model extracted is the LEAST predictable of the three in length. */
      title={label}
      className={[
        'inline-flex items-center gap-xxxs max-w-full',
        'px-s py-[4px]',
        'rounded-round',
        'font-body text-2xs font-medium tracking-[0.2px] leading-[16px]',
        'whitespace-nowrap',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: 'var(--bg-tint-light)', color: 'var(--brand)' }}
    >
      <AISparkleIcon size={12} className="shrink-0" />
      <span className={wide ? 'tag-label tag-label-wide' : 'tag-label'}>{label}</span>
    </span>
  )
}
