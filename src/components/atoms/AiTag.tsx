/**
 * AiTag — Pill for AI-extracted tags (generated from video by the LLM).
 * Visually distinct from the neutral EventTag (user upload tags): a brand-tinted
 * fill with a sparkle glyph signalling the label is machine-generated.
 */
import { AISparkleIcon } from '../icons/AISparkleIcon'

interface AiTagProps {
  label: string
  className?: string
}

export function AiTag({ label, className }: AiTagProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-xxxs',
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
      {label}
    </span>
  )
}
