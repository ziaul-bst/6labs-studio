/**
 * RadiologistAgentView — Dedicated Radiologist agent page content.
 * Anatomy: AgentPageHeader → InputFieldConsole (with suggestions) → VideosContainer gallery.
 * Shown when Radiologist is the active agent in the sidebar.
 *
 * @figmaComponent  Radiologist Page
 * @figmaPath       Other agents / Radiologist Page
 * @figmaNode       6418:100938
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6418-100938
 *
 * Source: 6labs/studio → src/components/organisms/RadiologistAgentView.tsx
 * Synced: 2026-04-06
 */

import { useState, useRef, type ComponentProps } from 'react'
import { AgentPageHeader } from '../molecules/AgentPageHeader'
import { RadiologistIcon } from '../icons/RadiologistIcon'
import InputFieldConsole from '../ui/InputFieldConsole'
import { VideosContainer } from './VideosContainer'
import { SuggestionsDropdown } from '../molecules/SuggestionsDropdown'

const RADIOLOGIST_GRADIENT =
  'linear-gradient(180deg, #7B4CFF 0%, #B44CFF 100%)'

interface RadiologistAgentViewProps {
  className?: string
  onSubmit?: (query: string) => void
  /** Controlled console source (platform) selection */
  selectedSource?: string
  /** Called when the user picks a source in the console popup */
  onSourceChange?: (value: string) => void
  /** Library tag options + selection for scoping the Library source */
  libraryTags?: ComponentProps<typeof InputFieldConsole>['libraryTags']
  selectedLibraryTags?: string[]
  onLibraryTagsChange?: (tags: string[]) => void
  /** Sessions for the gallery — defaults to the demo session set */
  sessions?: ComponentProps<typeof VideosContainer>['sessions']
}

export function RadiologistAgentView({ className, onSubmit, selectedSource, onSourceChange, libraryTags, selectedLibraryTags, onLibraryTagsChange, sessions }: RadiologistAgentViewProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>()

  const handleFocus = () => {
    clearTimeout(blurTimeout.current)
    setShowSuggestions(true)
  }

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setShowSuggestions(false), 150)
  }

  const handleSubmit = () => {
    if (query.trim()) {
      setShowSuggestions(false)
      onSubmit?.(query.trim())
    }
  }

  const handleSuggestionSelect = (text: string) => {
    setQuery(text)
    setShowSuggestions(false)
    onSubmit?.(text)
  }

  return (
    <div
      className={['flex flex-col items-center w-full', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Top section: header + console (centered, max 800px) */}
      <div className="flex flex-col gap-xxxl items-start page-measure">
        <AgentPageHeader
          title="Radiologist"
          description="Examine gameplay moment-by-moment with video-backed evidence"
          iconGradient={RADIOLOGIST_GRADIENT}
          icon={<RadiologistIcon size={40} />}
        />

        <div className="relative w-full">
          <InputFieldConsole
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search for actions, objects and events in your game..."
            selectedPlatform={selectedSource}
            onPlatformChange={onSourceChange}
            libraryTags={libraryTags}
            selectedLibraryTags={selectedLibraryTags}
            onLibraryTagsChange={onLibraryTagsChange}
          />

          {showSuggestions && !query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-xs z-20">
              <SuggestionsDropdown onSelect={handleSuggestionSelect} />
            </div>
          )}
        </div>
      </div>

      {/* Videos gallery — full content width */}
      <div className="w-full mt-xxl4">
        <VideosContainer sessions={sessions} />
      </div>
    </div>
  )
}
