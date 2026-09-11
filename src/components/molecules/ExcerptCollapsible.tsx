/**
 * ExcerptCollapsible — accent container for an Oracle excerpt.
 *
 * Used wherever the excerpt leads rather than sits among peers. Collapses to a
 * single header row, because the excerpt is the reason the user arrived but not
 * something they need permanently occupying the viewport.
 *
 * The body is an elevated surface with only the header tinted. Tinting the whole
 * container flattened the contrast ladder — the tinted rationale block inside it
 * disappeared. White body > tinted header > tinted rationale now reads as three
 * distinct levels.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useState, type ReactNode } from 'react'
import { OracleIcon } from '../icons/OracleIcon'
import { ChevronIcon } from '../icons/ChevronIcon'

interface ExcerptCollapsibleProps {
  /** Header label — what this section is, not what it says */
  label?: string
  /** Short right-aligned meta, e.g. the excerpt's time range */
  meta?: string
  defaultOpen?: boolean
  dense?: boolean
  children: ReactNode
  className?: string
}

export function ExcerptCollapsible({
  label = 'Why this video',
  meta,
  defaultOpen = true,
  dense = false,
  children,
  className,
}: ExcerptCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={['flex flex-col rounded-xl min-w-0 overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: 'var(--bg-elements)',
        border: '1px solid var(--border-tint)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-xs w-full min-w-0 px-m py-s text-left"
        style={{
          backgroundColor: 'var(--bg-tint-light)',
          borderBottom: open ? '1px solid var(--border-tint)' : undefined,
        }}
      >
        <OracleIcon size={16} className="shrink-0" />
        <span
          className="font-display font-semibold whitespace-nowrap min-w-0 truncate"
          style={{ fontSize: dense ? '13px' : '14px', color: 'var(--brand)' }}
        >
          {label}
        </span>
        <span className="flex-1" />
        {meta && (
          <span
            className="font-code text-2xs shrink-0 tabular-nums"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {meta}
          </span>
        )}
        <ChevronIcon size={16} direction={open ? 'up' : 'down'} className="shrink-0" />
      </button>

      {open && <div className={['min-w-0', dense ? 'p-s' : 'p-m'].join(' ')}>{children}</div>}
    </div>
  )
}
