/**
 * PersonaPicker — who plays this run.
 *
 * The list grew from eight personas to fourteen, and the player model now
 * ships a sentence with each one. Stacking that sentence under every name is
 * the obvious move and the wrong one: fourteen two-line rows is a thousand
 * pixels of menu over a six-row form, and the sentences share a template
 * ("<adjective> player who <verb>s <object>"), so the first four words of
 * every one of them are the same. A reader gets past the boilerplate fourteen
 * times to reach the word that differs.
 *
 * So the two texts are separated by how they are read:
 *   - NAMES are the scan target. One line each, 36px, the whole set visible
 *     without scrolling — you are choosing between them, so they have to be
 *     comparable at a glance.
 *   - The SENTENCE is the confirmation, and you only ever want one: the row
 *     under the cursor (or under keyboard focus) explains itself in a strip at
 *     the foot of the menu. Always the same place, never clamped, and the
 *     model's sentence can run as long as it likes without costing the list a
 *     pixel.
 *
 * The strip is never empty — at rest it explains the first selected persona,
 * or the first row — so it reads as part of the menu rather than as something
 * that appears.
 *
 * Search arrives with the ninth persona, not before: a filter over eight
 * visible rows is a control that makes the list look longer than it is.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Checkbox from '../ui/Checkbox'
import Input from '../ui/Input'
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'
import type { Persona } from '../../lib/types/testing'

export interface PersonaPickerProps {
  personas: Persona[]
  /** Selected persona ids, in the order they were chosen. */
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  className?: string
}

/** Past this many, the list gets a filter. */
const SEARCH_FROM = 9

/* The menu measures its room rather than assuming it. This field is the third
   row of a form, so "cap it at 480px" puts the strip below the fold on a
   laptop — which is exactly the failure a cap was meant to prevent. */
const GAP = 8
const GUTTER = 16
const MIN_MENU = 240
const MAX_MENU = 480
/** Roughly three more rows — below this, flipping buys nothing and only moves things. */
const WORTH_FLIPPING = 120

/**
 * Two names, then a count. Six comma-separated persona names in a 40px field
 * is a string nobody reads to the end — and the Agents row under this one
 * already lists every choice with its own count, so the field's job is to say
 * how many and roughly which, not to repeat the set.
 */
function summarise(selected: Persona[], placeholder: string): string {
  if (selected.length === 0) return placeholder
  if (selected.length <= 2) return selected.map((p) => p.label).join(', ')
  return `${selected[0].label}, ${selected[1].label} +${selected.length - 2}`
}

export function PersonaPicker({
  personas,
  value,
  onChange,
  placeholder = 'Choose personas…',
  className,
}: PersonaPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)
  const [box, setBox] = useState<{ maxHeight: number; flip: boolean }>({ maxHeight: MAX_MENU, flip: false })
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = useMemo(
    () => value.map((id) => personas.find((p) => p.id === id)).filter(Boolean) as Persona[],
    [value, personas],
  )

  const needle = query.trim().toLowerCase()
  const shown = useMemo(
    () =>
      needle
        ? personas.filter(
            (p) =>
              p.label.toLowerCase().includes(needle) ||
              p.detail.toLowerCase().includes(needle) ||
              p.description.toLowerCase().includes(needle),
          )
        : personas,
    [personas, needle],
  )

  /* What the strip explains: the row being pointed at, else the first thing
     already chosen, else the top of the list. Never nothing. */
  const explained =
    shown.find((p) => p.id === hovered) ?? selected.find((p) => shown.includes(p)) ?? shown[0] ?? null

  /* Opens downward by default, because that is where the eye already is, and
     flips above when there is MEANINGFULLY more room there — not merely when
     it does not fit below. A menu that technically fits in 300px shows five of
     fourteen personas; the same menu opened upward shows nine, over two rows
     the reader has already answered. Either way it is capped to the room it
     actually has, so the explaining strip is never below the fold. */
  useEffect(() => {
    if (!open) return
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect()
      if (!r) return
      const below = window.innerHeight - r.bottom - GAP - GUTTER
      const above = r.top - GAP - GUTTER
      const flip = below < MIN_MENU ? above > below : above > below + WORTH_FLIPPING
      const room = flip ? above : below
      setBox({ maxHeight: Math.max(MIN_MENU, Math.min(MAX_MENU, room)), flip })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  /* A filter that survives a close is a menu that opens showing four of
     fourteen options with no visible reason. */
  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])

  return (
    <div ref={rootRef} className={['relative w-full', className].filter(Boolean).join(' ')}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        /* Same 40px field as the Build select above it. */
        className="flex items-center gap-xs w-full h-[40px] text-left px-s font-body text-s"
        style={{
          backgroundColor: 'var(--bg-elements)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-input)',
          color: selected.length ? 'var(--text-primary)' : 'var(--text-placeholder)',
        }}
      >
        <span className="flex-1 truncate">{summarise(selected, placeholder)}</span>
        <DropdownArrowIcon size={16} className="shrink-0 text-text-tertiary" />
      </button>

      {open && (
        <div
          className={[
            'persona-menu absolute left-0 right-0 z-40 flex flex-col rounded-xl shadow-big overflow-hidden',
            box.flip ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]',
          ].join(' ')}
          style={{
            backgroundColor: 'var(--bg-elements)',
            border: '1px solid var(--border-subtle)',
            maxHeight: box.maxHeight,
          }}
        >
          {personas.length >= SEARCH_FROM && (
            <div className="p-xxs shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${personas.length} personas…`}
                aria-label="Search personas"
                size="lg"
                autoFocus
              />
            </div>
          )}

          <div
            role="listbox"
            aria-multiselectable
            aria-label="Personas"
            className="persona-menu-list flex flex-col p-xxs overflow-y-auto"
            onMouseLeave={() => setHovered(null)}
          >
            {shown.length === 0 ? (
              <p className="px-s py-s m-0 font-body text-s" style={{ color: 'var(--text-tertiary)' }}>
                No persona matches “{query.trim()}”.
              </p>
            ) : (
              shown.map((p) => {
                const on = value.includes(p.id)
                return (
                  <label
                    key={p.id}
                    role="option"
                    aria-selected={on}
                    data-explained={explained?.id === p.id ? 'true' : 'false'}
                    className="persona-row testing-menu-row flex items-center gap-s px-s py-xs rounded-m cursor-pointer"
                    onMouseEnter={() => setHovered(p.id)}
                    onFocus={() => setHovered(p.id)}
                  >
                    <Checkbox checked={on} onChange={() => toggle(p.id)} aria-label={p.label} />
                    {/* Name and qualifier on one line — the qualifier is written
                        for the set, so it compares down the column. The
                        sentence is in the strip below. */}
                    <span className="flex-1 min-w-0 font-display text-s font-semibold text-text-primary truncate">
                      {p.label}
                    </span>
                    <span className="shrink-0 font-body text-xs text-text-tertiary">{p.detail}</span>
                  </label>
                )
              })
            )}
          </div>

          {/* One sentence, always in the same place. The persona it belongs to
              is named, because a description with no subject under a list of
              fourteen is a sentence you have to attribute before you can read
              it. */}
          {explained && (
            <div
              className="persona-explain flex flex-col gap-xxxs px-s py-s"
              style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-inset)' }}
              aria-live="polite"
            >
              <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                {explained.label}
              </span>
              <span className="font-body text-xs text-text-secondary leading-[1.55] wrap-anywhere">
                {explained.description}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
