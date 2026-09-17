/**
 * SectionHeading — a numbered heading inside a long document.
 *
 * The run summary and the full report are the same document at two depths, so
 * their section headings are one component rather than two that drift. They
 * drifted once already: the report set its label as a 12px uppercase eyebrow
 * and the summary as a 20px display line, and the number — the one thing both
 * carried — was a loose mono glyph sitting on the title's baseline, reading as
 * a stray character rather than as a section marker.
 *
 * So the number gets a shape: a tinted square, tabular so 01 and 02 are the
 * same width, centred on the title instead of hung off its baseline. The title
 * carries the weight, because in a message this long the headings are the only
 * structure a reader has.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ReactNode } from 'react'

export interface SectionHeadingProps {
  /** Two-digit section number — "01", "02". */
  index: string
  title: string
  /** Optional qualifier, read at the same level as the title's own line. */
  meta?: ReactNode
  /** Renders the heading as an h2 (default) or an h3. */
  as?: 'h2' | 'h3'
  className?: string
}

export function SectionHeading({ index, title, meta, as = 'h2', className }: SectionHeadingProps) {
  const Tag = as
  return (
    <div
      className={['flex flex-wrap items-center gap-s', className].filter(Boolean).join(' ')}
    >
      {/* 24px, not 20px. A document this long runs four levels — masthead 32,
          part 24, group 20, finding title 16 — and at 20px the part tied with
          the group heading under it, separated only by weight. Four levels need
          four sizes; there is one in the scale between 20 and 32 and this is
          what it is for. */}
      <Tag className="flex items-center gap-s font-display text-xl font-bold text-text-primary leading-[1.25] tracking-[-0.015em]">
        <span
          className="flex items-center justify-center shrink-0 h-7 min-w-[30px] px-xxs rounded-s font-code text-xs font-semibold leading-none tabular-nums"
          style={{ backgroundColor: 'var(--bg-tint-light)', color: 'var(--text-brand)' }}
          aria-hidden
        >
          {index}
        </span>
        {title}
      </Tag>
      {meta && <span className="font-body text-s text-text-tertiary leading-[1.6]">{meta}</span>}
    </div>
  )
}
