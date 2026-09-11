/**
 * LanguageSelector — Overlay dropdown for changing the app language.
 * Opens to the right of the sidebar footer on profile click.
 * Uses a portal to escape sidebar overflow-hidden clipping.
 *
 * @figmaComponent  Language Select
 * @figmaNode       2565:52762
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=2565-52762
 */

import { createPortal } from 'react-dom'
import { useEffect, useState, type RefObject } from 'react'
import { FlagIcon } from '../icons/FlagIcon'

export interface Language {
  code: string
  label: string
}

/** Exported so the profile menu's language submenu uses the same list. */
export const LANGUAGES: Language[] = [
  { code: 'EN', label: 'EN - English' },
  { code: 'JP', label: 'JP - 日本語' },
  { code: 'KR', label: 'KR - 한국어' },
  { code: 'CN', label: 'CN - 中文' },
]

interface LanguageSelectorProps {
  currentLanguage: string
  onSelect: (lang: string) => void
  onClose: () => void
  anchorRef: RefObject<HTMLDivElement | null>
}

export function LanguageSelector({
  currentLanguage,
  onSelect,
  anchorRef,
}: LanguageSelectorProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPos({
      top: rect.bottom - 200,
      left: rect.right + 8,
    })
  }, [anchorRef])

  if (!pos) return null

  return createPortal(
    <div
      className="fixed z-50 animate-in"
      data-lang-selector
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="flex flex-col bg-bg-elements border border-border-subtle rounded-xl shadow-normal overflow-hidden min-w-[200px]">
        {/* Header */}
        <div className="px-m pt-m pb-xs">
          <p className="font-display text-2xs font-medium uppercase tracking-[1.5px] text-text-tertiary leading-normal">
            Select Language
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col py-xxs">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLanguage
            return (
              <button
                key={lang.code}
                className={[
                  'flex items-center gap-xs px-m py-xs cursor-pointer transition-colors w-full text-left',
                  isSelected
                    ? ''
                    : 'profile-hover',
                ].join(' ')}
                style={isSelected ? { backgroundColor: 'var(--bg-tint)' } : undefined}
                onClick={() => onSelect(lang.code)}
              >
                <FlagIcon code={lang.code} size={18} />
                <span className="flex-1 font-body text-s font-normal text-text-primary leading-[1.5]">
                  {lang.label}
                </span>
                {isSelected && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-brand">
                    <path d="M3.5 8.5L6.5 11.5L12.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}
