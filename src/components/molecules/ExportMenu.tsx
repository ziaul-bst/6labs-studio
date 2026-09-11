/**
 * ExportMenu — "Export" button with a format popup.
 *
 * Each format carries a description, because the choice isn't really about file
 * type — it's about who the export is for. "All chats in this conversation" and
 * "Meeting ready presentations" are different jobs that happen to produce
 * different files, and the label alone doesn't say which is which.

 */

import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { ChevronIcon } from '../icons/ChevronIcon'
import { DownloadIcon } from '../icons/DownloadIcon'
import { FilePdfIcon } from '../icons/FilePdfIcon'
import { ImageFrameIcon } from '../icons/ImageFrameIcon'
import { PresentationIcon } from '../icons/PresentationIcon'
import type { IconProps } from '../icons/types'

export type ExportFormat = 'pdf' | 'image' | 'ppt'

const FORMATS: {
  id: ExportFormat
  label: string
  description: string
  icon: ComponentType<IconProps>
}[] = [
  { id: 'pdf', label: 'PDF', description: 'All chats in this conversation', icon: FilePdfIcon },
  { id: 'image', label: 'Image', description: 'Analysis as Infographic', icon: ImageFrameIcon },
  { id: 'ppt', label: 'PPT', description: 'Meeting ready Presentations', icon: PresentationIcon },
]

export interface ExportMenuProps {
  onExport?: (format: ExportFormat) => void
}

export function ExportMenu({ onExport }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        className="flex gap-xs items-center h-[36px] px-s rounded-m cursor-pointer transition-colors profile-hover"
        style={{
          backgroundColor: 'var(--bg-elements)',
          border: '1px solid var(--border-default)',
        }}
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <DownloadIcon size={16} className="shrink-0 text-text-secondary" />
        <span className="font-display text-s font-semibold text-text-secondary leading-[1.5] whitespace-nowrap">
          Export
        </span>
        <ChevronIcon
          direction={open ? 'up' : 'down'}
          size={16}
          className="shrink-0 text-text-tertiary"
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-xs flex flex-col py-s rounded-2xl overflow-hidden shadow-big min-w-[340px] z-40"
          style={{
            backgroundColor: 'var(--bg-elements)',
            border: '1px solid var(--border-subtle)',
          }}
          role="menu"
          aria-label="Export format"
        >
          {FORMATS.map((format) => {
            const Icon = format.icon
            return (
              <button
                key={format.id}
                type="button"
                role="menuitem"
                className="flex gap-s items-center px-l py-s w-full cursor-pointer game-list-hover text-left"
                onClick={() => {
                  onExport?.(format.id)
                  setOpen(false)
                }}
              >
                <Icon size={24} className="shrink-0 text-text-secondary" />
                <span className="font-display text-l font-normal text-text-primary leading-[1.3] shrink-0">
                  {format.label}
                </span>
                <span className="font-body text-s font-normal text-text-tertiary leading-[1.4] min-w-0">
                  {format.description}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
