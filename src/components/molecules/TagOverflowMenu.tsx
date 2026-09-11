/**
 * TagOverflowMenu — the "+N more" end of a tag rail: the long tail of tags in a
 * searchable checklist, so a rail stays one line no matter how many tags a
 * library has accumulated.
 *
 * Two modes. Flat (`tags`) is one list — what the session picker uses. Sectioned
 * (`groups`) splits the list under headings, which is how the Gameplay Library
 * keeps its assigned batch tags legible against the team's own vocabulary now
 * that the rail itself is a single row: the rail shows the few tags you reach
 * for, and the grouping that used to cost two rows lives in here instead.
 *
 * It renders into a portal and positions itself against the trigger's viewport
 * rect. Both surfaces that carry the rail — the Gameplay Library card and the
 * session picker dialog — clip their own overflow (rounded corners on one, a
 * scrolling dialog on the other), so a menu positioned inside the flow gets its
 * bottom and right edges cut off. A portal is the only placement that survives
 * both. It also flips above the pill and pulls back from the right edge rather
 * than running off-screen.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FilterPill } from '../atoms/FilterPill'
import Checkbox from '../ui/Checkbox'
import Input from '../ui/Input'
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'

const MENU_WIDTH = 300
const GUTTER = 12
const OFFSET = 8

export interface TagOverflowSection {
  /** Stable key — the origin, facet, or whatever the caller groups by. */
  key: string
  heading: string
  tags: string[]
}

export interface TagOverflowMenuProps {
  /** The tags behind the pill — the tail the rail could not show. Flat mode. */
  tags?: string[]
  /**
   * Sectioned mode — takes precedence over `tags`. Sections render under their
   * headings in the order given, and a section whose tags all fail the search
   * drops out rather than leaving a bare heading.
   */
  groups?: TagOverflowSection[]
  /** Videos per tag, shown at the end of each row. */
  countByTag: Record<string, number>
  /** Selected tags — may include tags that are pinned on the rail. */
  active: Set<string>
  onToggle: (tag: string) => void
  /** Every tag in the library, for the search placeholder's count. */
  totalTags: number
  /** Names the whole slice, in flat mode. Ignored when `groups` is set. */
  heading?: string
  /**
   * Display text for a tag, when it differs from the value being filtered on —
   * the Library qualifies its stage and test-type tags ("Stage · CBT") so they
   * do not read as unrecognised batch names. Defaults to the tag itself.
   */
  labelFor?: (tag: string) => string
  className?: string
}

export function TagOverflowMenu({
  tags = [],
  groups,
  countByTag,
  active,
  onToggle,
  totalTags,
  heading,
  labelFor,
  className,
}: TagOverflowMenuProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState<{ left: number; top: number; maxHeight: number } | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  /* Fresh search and a list scrolled to the top on every open — reopening onto
     the middle of a long list reads as a broken menu. */
  useEffect(() => {
    if (!open) return
    setQuery('')
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [open])

  /* Measured against the viewport, then re-measured on scroll and resize —
     the rail sits inside a scrolling page on one surface and a scrolling
     dialog on the other. */
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect()
      if (!r) return
      const below = window.innerHeight - r.bottom - OFFSET - GUTTER
      const above = r.top - OFFSET - GUTTER
      const flip = below < 220 && above > below
      setPos({
        left: Math.max(GUTTER, Math.min(r.left, window.innerWidth - MENU_WIDTH - GUTTER)),
        top: flip ? Math.max(GUTTER, r.top - OFFSET - Math.min(above, 360)) : r.bottom + OFFSET,
        maxHeight: Math.max(200, Math.min(360, flip ? above : below)),
      })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      /* Stopped, or the picker dialog behind the menu would close too. */
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

  /* One code path for both modes: flat is just a single unheaded section. */
  const sections: TagOverflowSection[] =
    groups ?? (tags.length ? [{ key: 'all', heading: heading ?? '', tags }] : [])
  const total = sections.reduce((n, s) => n + s.tags.length, 0)
  if (total === 0) return null

  const display = labelFor ?? ((t: string) => t)
  const needle = query.trim().toLowerCase()
  const shown = sections
    .map((s) => ({ ...s, tags: s.tags.filter((t) => display(t).toLowerCase().includes(needle)) }))
    .filter((s) => s.tags.length > 0)
  const shownCount = shown.reduce((n, s) => n + s.tags.length, 0)

  return (
    <div ref={triggerRef} className={className}>
      <FilterPill
        label={`+${total} more`}
        selected={open}
        onClick={() => setOpen((v) => !v)}
        menu
        trailing={<DropdownArrowIcon size={16} />}
      />
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            role="group"
            aria-label={groups ? 'More tags, grouped' : heading ? `More ${heading.toLowerCase()}` : 'More tags'}
            className="fixed z-[60] flex flex-col gap-xxs rounded-xl p-xs shadow-big"
            style={{
              left: pos.left,
              top: pos.top,
              width: MENU_WIDTH,
              backgroundColor: 'var(--bg-elements)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {!groups && heading && (
              <span
                className="px-xs pt-xxs font-display text-2xs font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {heading}
              </span>
            )}
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${totalTags} tags…`}
              aria-label="Search tags"
              size="lg"
            />
            <div ref={scrollRef} className="flex flex-col overflow-y-auto" style={{ maxHeight: pos.maxHeight }}>
              {shownCount === 0 ? (
                <p className="px-xs py-s font-body text-s" style={{ color: 'var(--text-tertiary)' }}>
                  No tag matches “{query.trim()}”.
                </p>
              ) : (
                shown.map((section, si) => (
                  <div key={section.key} className="flex flex-col">
                    {/* Sectioned mode only: a lone heading over one flat list
                        would just repeat what the trigger already said. */}
                    {groups && section.heading && (
                      /* Sticky: a studio with forty tags scrolls this list, and
                         a heading that scrolls away leaves you unable to tell
                         an assigned batch from a tag someone typed — which is
                         the whole reason the sections exist. Opaque background
                         so rows do not show through underneath. */
                      <span
                        className={[
                          'sticky top-0 z-[1]',
                          'px-xs pb-xxs font-display text-2xs font-semibold uppercase tracking-[0.08em]',
                          si === 0 ? 'pt-xs' : 'pt-s',
                        ].join(' ')}
                        style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-elements)' }}
                      >
                        {section.heading}
                      </span>
                    )}
                    {section.tags.map((tag) => (
                      <label
                        key={tag}
                        className="user-test-tag-row flex items-center gap-xs px-xs py-xxs rounded-m cursor-pointer"
                      >
                        <Checkbox
                          checked={active.has(tag)}
                          onChange={() => onToggle(tag)}
                          aria-label={`Select ${display(tag)}`}
                        />
                        <span
                          className="flex-1 min-w-0 font-body text-s truncate"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {display(tag)}
                        </span>
                        <span className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {countByTag[tag]}
                        </span>
                      </label>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
