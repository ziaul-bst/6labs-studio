/**
 * SystemTag — pill for a Gameplay Library tag the platform applied itself:
 * the batch or build a clip came in on, its release stage, the kind of test
 * that produced it.
 *
 * Deliberately the inverse of EventTag (user tags): outlined rather than
 * filled, and it names its facet — "Batch · Build V2.2" instead of a bare
 * "Build V2.2". The facet prefix is what makes it self-evidently assigned
 * rather than typed, so the two kinds of tag never have to be told apart by
 * memory. AiTag (brand tint + sparkle) is the third treatment, for
 * LLM-extracted labels.
 *
 * Code-first prototype — no Figma source yet.
 */
import { TAG_FACET_LABEL, type LibraryTag } from '../../lib/libraryTags'

interface SystemTagProps {
  tag: LibraryTag
  /** Drop the facet prefix where the surrounding section already names it */
  showFacet?: boolean
  /** Where the pill has a wide row to itself — a dialog, a detail panel. */
  wide?: boolean
  className?: string
}

export function SystemTag({ tag, showFacet = true, wide = false, className }: SystemTagProps) {
  const facet = showFacet && tag.facet ? TAG_FACET_LABEL[tag.facet] : null

  return (
    <span
      /* The facet is the part that makes the pill self-evidently assigned, so
         it never folds — only the label does. */
      title={facet ? `${facet} · ${tag.label}` : tag.label}
      className={[
        'inline-flex items-center gap-xxxs max-w-full',
        'px-s py-[3px]',
        'rounded-round',
        'font-body text-2xs font-medium tracking-[0.2px] leading-[16px]',
        'whitespace-nowrap',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: 'transparent',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)',
      }}
    >
      {facet && (
        <>
          <span className="shrink-0" style={{ color: 'var(--text-tertiary)' }}>
            {facet}
          </span>
          <span className="shrink-0" aria-hidden style={{ color: 'var(--border-default)' }}>
            ·
          </span>
        </>
      )}
      <span className={wide ? 'tag-label tag-label-wide' : 'tag-label'}>{tag.label}</span>
    </span>
  )
}
