/**
 * TestingMenuSelect — a field-shaped trigger that opens a menu of rich rows
 * (file badge, name, one line of meta). Used for the build picker on the AI
 * tests and the game-context picker on the User Test composer.
 *
 * Single-select. The trigger shows the chosen row's label with a caret, so a
 * filled chip still reads as changeable; a `placeholder` shows until something
 * is chosen. An optional trailing action row ("Upload a new build…") sits
 * under the options, ruled off, because it is a different kind of choice from
 * picking an existing item.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'

export interface MenuSelectOption {
  value: string
  label: string
  meta?: string
  /** Short badge on the left — "APK", "PDF", "DOCX". */
  badge?: string
}

export interface TestingMenuSelectProps {
  options: MenuSelectOption[]
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel: string
  /** Extra row under the options — an action, not a choice. */
  trailing?: { label: string; meta?: string; icon?: ReactNode; onSelect: () => void }
  /** Chip-shaped trigger for the composer bar, instead of a full field. */
  variant?: 'field' | 'chip'
  /** Opens upward — for a trigger sitting at the bottom of its card. */
  openUp?: boolean
  className?: string
}

export function TestingMenuSelect({
  options,
  value,
  onChange,
  placeholder = 'Choose…',
  ariaLabel,
  trailing,
  variant = 'field',
  openUp = false,
  className,
}: TestingMenuSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const chosen = options.find((o) => o.value === value) ?? null

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const chip = variant === 'chip'

  return (
    <div ref={rootRef} className={['relative', chip ? 'inline-block' : 'w-full', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center gap-xs text-left',
          chip
            ? 'rounded-round px-m py-xs font-body text-s font-medium'
            /* Matches Input size=lg exactly — 40px tall, same radius — so a select
               beside a text field reads as the same family of control. The radius
               lives in the class, not inline, so a toolbar that rounds its whole
               row can round this too. */
            : 'testing-select-trigger w-full h-[40px] px-s font-body text-s',
        ].join(' ')}
        style={{
          backgroundColor: chip && chosen ? 'var(--bg-tint-light)' : 'var(--bg-elements)',
          border: `1px solid ${chip && chosen ? 'var(--border-tint)' : 'var(--border-default)'}`,
          color: chosen ? (chip ? 'var(--text-brand)' : 'var(--text-primary)') : 'var(--text-placeholder)',
        }}
      >
        {chip && !chosen && (
          <span aria-hidden className="font-display text-m leading-none">+</span>
        )}
        <span className={chip ? 'truncate max-w-[320px]' : 'flex-1 truncate'}>
          {chosen ? chosen.label : placeholder}
        </span>
        {/* A filled chip otherwise reads as a static tag. The caret is the same
            signifier the field variant carries, so a chosen context still says
            "this opens a menu" and can be swapped or cleared. */}
        {(!chip || chosen) && (
          <DropdownArrowIcon
            size={chip ? 12 : 16}
            className={chip ? 'shrink-0' : 'shrink-0 text-text-tertiary'}
          />
        )}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={[
            'absolute left-0 z-40 flex flex-col p-xxs rounded-xl shadow-big',
            chip ? 'min-w-[420px]' : 'w-full min-w-[320px]',
            openUp ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]',
          ].join(' ')}
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
        >
          {options.map((opt) => {
            const selected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className="testing-menu-row flex items-center gap-s w-full text-left px-s py-xs rounded-m"
                style={{ backgroundColor: selected ? 'var(--bg-tint-light)' : undefined }}
              >
                {opt.badge && <Badge>{opt.badge}</Badge>}
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="font-display text-s font-semibold text-text-primary leading-[1.45] truncate">
                    {opt.label}
                  </span>
                  {opt.meta && (
                    <span className="font-body text-xs text-text-tertiary leading-[1.5] truncate">{opt.meta}</span>
                  )}
                </span>
              </button>
            )
          })}
          {trailing && (
            <button
              type="button"
              onClick={() => {
                trailing.onSelect()
                setOpen(false)
              }}
              className="testing-menu-row flex items-center gap-s w-full text-left px-s py-xs rounded-m mt-xxs"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <Badge dashed>{trailing.icon ?? '↑'}</Badge>
              <span className="flex flex-col min-w-0 flex-1">
                <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
                  {trailing.label}
                </span>
                {trailing.meta && (
                  <span className="font-body text-xs text-text-tertiary leading-[1.5]">{trailing.meta}</span>
                )}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Badge({ children, dashed }: { children: ReactNode; dashed?: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 w-[40px] h-[28px] rounded-s font-display text-2xs font-semibold uppercase tracking-[0.06em]"
      style={{
        backgroundColor: dashed ? 'transparent' : 'var(--bg-subtle)',
        color: 'var(--text-secondary)',
        border: dashed ? '1px dashed var(--border-default)' : undefined,
      }}
      aria-hidden
    >
      {children}
    </span>
  )
}
