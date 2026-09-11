/**
 * InputFieldConsole — Prompt input console for agent interactions.
 * Anatomy: text area → actions row (platform selector Button + send Button).
 * Types: Default (multiline) · Mini (single-line compact).
 * States: Default → Hover (brand border) → Active (brand border + send enabled).
 *
 * Sub-components from Apparatus:
 *   - Platform selector: Button variant="tertiary" size="md" pill
 *   - Platform dropdown: SelectDropdown (Popup/Droddown · 6348:80253)
 *   - Send CTA: Button variant="primary" size="lg" iconOnly iconRound
 *   - Platform icon: BlueStacksIcon (Social Icon set)
 *   - Dropdown indicator: DropdownArrowIcon (R Icon / Arrow)
 *   - Send icon: DirectionsArrowIcon rotated -90deg (Directions Arrow)
 *
 * @figmaComponent  Input Field Console Radiologist
 * @figmaNode       1889:17490
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=1889-17490
 *
 * Source: studio/src/components/ui/InputFieldConsole.tsx
 * Synced: 2026-04-05
 */

import { useEffect, useMemo, useState, useRef, type ReactNode, type KeyboardEvent } from 'react'
import Button from './Button'
import { DirectionsArrowIcon } from '../icons/DirectionsArrowIcon'
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'
import { BlueStacksIcon } from '../icons/BlueStacksIcon'
import { YoutubeIcon } from '../icons/YoutubeIcon'
import { SdkPcIcon } from '../icons/SdkPcIcon'
import { SdkMobileIcon } from '../icons/SdkMobileIcon'
import { VideoLibraryIcon } from '../icons/VideoLibraryIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { LibraryTagScope } from '../molecules/LibraryTagScope'
import type { LibraryTagOption } from '../../lib/librarySessions'
import { SelectDropdown } from '../molecules/SelectDropdown'
import {
  ChatActionMenuFlyout,
  type ConnectorOption,
} from '../molecules/ChatActionMenuFlyout'
import {
  useOnboardedConnectors,
  useAvailableConnectors,
  requestConnectorOnboarding,
  setBigQuerySelectedProject,
  setSnowflakeSelectedDatabase,
} from '../../lib/state/connectorsStore'
import { BigQueryIcon } from '../icons/connectors/BigQueryIcon'
import { SnowflakeIcon } from '../icons/connectors/SnowflakeIcon'

export type InputFieldConsoleType = 'default' | 'mini'

export interface PlatformOption {
  value: string
  label: string
  icon: ReactNode
}

export interface InputFieldConsoleProps {
  /** Multiline (default) or compact single-line (mini) */
  type?: InputFieldConsoleType
  /** Controlled input value */
  value: string
  /** Change handler */
  onChange: (value: string) => void
  /** Submit handler (fires on send click or Enter in mini) */
  onSubmit?: () => void
  /** Placeholder text */
  placeholder?: string
  /** Available platforms for the selector dropdown */
  platforms?: PlatformOption[]
  /** Currently selected platform value */
  selectedPlatform?: string
  /** Called when a platform is selected */
  onPlatformChange?: (value: string) => void
  /** Library tag options (grouped, counted) — shown when the Library source is active */
  libraryTags?: LibraryTagOption[]
  /** Currently selected library tags to scope the source */
  selectedLibraryTags?: string[]
  /** Called when the scoped tag set changes */
  onLibraryTagsChange?: (tags: string[]) => void
  /** Onboarded connectors shown in the flyout's Connectors submenu */
  connectors?: ConnectorOption[]
  /** Called with the new set of enabled connector ids */
  onConnectorsChange?: (ids: string[]) => void
  /** Called when the user attaches a PDF from the flyout */
  onAttachFile?: (file: File) => void
  /**
   * Hide the Sources pill. For composers whose corpus is fixed by the screen
   * (a test report asks *its* cases), a platform picker would be a lie.
   */
  hideSources?: boolean
  /** Number of visible rows for default type */
  rows?: number
  /** Focus/blur events for suggestion dropdown control */
  onFocus?: () => void
  onBlur?: () => void
  className?: string
}

const DEFAULT_PLATFORMS: PlatformOption[] = [
  { value: 'bluestacks', label: 'BlueStacks', icon: <BlueStacksIcon size={20} /> },
  { value: 'youtube', label: 'Youtube', icon: <YoutubeIcon size={20} /> },
  { value: 'sdk-pc', label: 'SDK - PC', icon: <SdkPcIcon size={20} /> },
  { value: 'sdk-mobile', label: 'SDK - Mobile', icon: <SdkMobileIcon size={20} /> },
  { value: 'library', label: 'Library', icon: <VideoLibraryIcon size={20} /> },
]

export default function InputFieldConsole({
  type = 'default',
  value,
  onChange,
  onSubmit,
  placeholder = 'Search for actions, objects and events in your game...',
  platforms = DEFAULT_PLATFORMS,
  selectedPlatform,
  onPlatformChange,
  libraryTags = [],
  selectedLibraryTags = [],
  onLibraryTagsChange,
  connectors = [],
  onConnectorsChange,
  onAttachFile,
  hideSources = false,
  rows = 2,
  onFocus,
  onBlur,
  className,
}: InputFieldConsoleProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sourceRootRef = useRef<HTMLDivElement>(null)
  const isMini = type === 'mini'
  const hasValue = value.trim().length > 0

  const [internalPlatform, setInternalPlatform] = useState(platforms[0]?.value ?? '')
  const activePlatformValue = selectedPlatform ?? internalPlatform
  const activePlatform = platforms.find((p) => p.value === activePlatformValue) ?? platforms[0]
  const isLibrary = activePlatformValue === 'library'
  const scopedCount = isLibrary ? selectedLibraryTags.length : 0

  const [sourceOpen, setSourceOpen] = useState(false)

  useEffect(() => {
    if (!sourceOpen) return
    const handleDocClick = (e: MouseEvent) => {
      if (!sourceRootRef.current) return
      if (!sourceRootRef.current.contains(e.target as Node)) setSourceOpen(false)
    }
    document.addEventListener('mousedown', handleDocClick)
    return () => document.removeEventListener('mousedown', handleDocClick)
  }, [sourceOpen])

  // Per-chat connector on/off. Connectors default to ON once onboarded (so a
  // freshly-connected warehouse is immediately usable); the user can turn one
  // off via the "Use … for queries" toggle. We track explicit *off* choices so
  // newly-onboarded connectors still default on without an effect.
  const [disabledConnectorIds, setDisabledConnectorIds] = useState<string[]>([])
  const onboarded = useOnboardedConnectors()
  const available = useAvailableConnectors()
  const composedConnectors: ConnectorOption[] = useMemo(() => {
    const iconFor = (id: string) =>
      id === 'bigquery' ? (
        <BigQueryIcon size={20} />
      ) : id === 'snowflake' ? (
        <SnowflakeIcon size={20} />
      ) : undefined
    const fromStore = onboarded.map((c) => ({
      id: c.id,
      label: c.label,
      secondary: c.secondary,
      icon: iconFor(c.id),
      scopeKind: c.scopeKind,
      scopes: c.scopes,
      selectedScopeId: c.selectedScopeId,
      enabled: !disabledConnectorIds.includes(c.id),
    }))
    // Allow callers to inject extra connector options (e.g. for Storybook).
    const propIds = new Set(connectors.map((c) => c.id))
    return [
      ...fromStore.filter((c) => !propIds.has(c.id)),
      ...connectors,
    ]
  }, [onboarded, disabledConnectorIds, connectors])

  const handleConnectorsChange = (ids: string[]) => {
    // The flyout reports the full *enabled* set; derive the disabled set from
    // the onboarded list so the default-on semantics hold.
    const enabled = new Set(ids)
    setDisabledConnectorIds(onboarded.filter((c) => !enabled.has(c.id)).map((c) => c.id))
    onConnectorsChange?.(ids)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isMini && e.key === 'Enter' && !e.shiftKey && hasValue) {
      e.preventDefault()
      onSubmit?.()
    }
    if (!isMini && e.key === 'Enter' && e.ctrlKey && hasValue) {
      e.preventDefault()
      onSubmit?.()
    }
  }

  const handleWrapperClick = () => {
    if (isMini) {
      inputRef.current?.focus()
    } else {
      textareaRef.current?.focus()
    }
  }

  const handlePlatformSelect = (val: string) => {
    if (onPlatformChange) {
      onPlatformChange(val)
    } else {
      setInternalPlatform(val)
    }
    // Keep the popup open for Library so the tag-scope panel is revealed in place;
    // other sources have nothing more to configure, so close.
    if (val !== 'library') setSourceOpen(false)
  }

  return (
    <div
      className={[
        'input-console',
        isMini ? 'input-console-mini' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleWrapperClick}
    >
      {/* Text input */}
      {isMini ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="input-console-textarea"
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          className="input-console-textarea"
        />
      )}

      {/* Scoped-to tag chips — visible when Library is scoped to specific tags */}
      {isLibrary && selectedLibraryTags.length > 0 && (
        <div
          className="flex items-center gap-xs flex-wrap px-xs pt-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-body text-2xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-tertiary)' }}>
            Scoped to
          </span>
          {selectedLibraryTags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-xxs pl-s pr-xs py-xxxs rounded-round font-body text-2xs"
              style={{ backgroundColor: 'var(--bg-tint-light)', color: 'var(--brand)' }}
            >
              {t}
              <button
                type="button"
                onClick={() => onLibraryTagsChange?.(selectedLibraryTags.filter((x) => x !== t))}
                aria-label={`Remove ${t}`}
                className="inline-flex"
              >
                <CloseIcon size={12} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onLibraryTagsChange?.([])}
            className="font-body text-2xs font-semibold"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Actions row */}
      <div className="input-console-actions">
        {/* Left cluster: "+" flyout (Attach PDF / Connectors) + always-visible Sources pill */}
        <div
          className="flex items-center gap-s"
          onClick={(e) => e.stopPropagation()}
        >
          <ChatActionMenuFlyout
            connectors={composedConnectors}
            onConnectorsChange={handleConnectorsChange}
            onSelectScope={(connectorId, scopeId) => {
              if (connectorId === 'bigquery') setBigQuerySelectedProject(scopeId)
              else if (connectorId === 'snowflake') setSnowflakeSelectedDatabase(scopeId)
            }}
            availableConnectors={available.map((c) => ({
              id: c.id,
              label: c.label,
              icon:
                c.id === 'bigquery' ? (
                  <BigQueryIcon size={20} />
                ) : c.id === 'snowflake' ? (
                  <SnowflakeIcon size={20} />
                ) : undefined,
            }))}
            onAddConnector={(id) => requestConnectorOnboarding(id)}
            onAttachFile={onAttachFile}
          />

          {/* Sources selector — visible so the user knows what their query runs on,
              unless the screen fixes the corpus. Click opens a SelectDropdown popover. */}
          {!hideSources && (
          <div ref={sourceRootRef} className="relative inline-flex items-center">
            <Button
              variant="tertiary"
              size="md"
              pill
              leftIcon={activePlatform?.icon ?? <BlueStacksIcon size={20} />}
              rightIcon={<DropdownArrowIcon size={16} />}
              onClick={() => setSourceOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={sourceOpen}
            >
              {activePlatform?.label ?? 'Sources'}
              {scopedCount > 0 ? ` · ${scopedCount}` : ''}
            </Button>
            {sourceOpen && (
              <div className="absolute bottom-full left-0 mb-xs z-50 flex flex-row items-end gap-xs">
                <SelectDropdown
                  className="min-w-[200px] shrink-0"
                  title="SOURCES"
                  groups={[
                    {
                      items: platforms.map((p) => ({
                        value: p.value,
                        label: p.label,
                        icon: p.icon,
                      })),
                    },
                  ]}
                  value={activePlatformValue}
                  onChange={handlePlatformSelect}
                />
                {isLibrary && libraryTags.length > 0 && (
                  <LibraryTagScope
                    options={libraryTags}
                    selected={selectedLibraryTags}
                    onChange={(tags) => onLibraryTagsChange?.(tags)}
                  />
                )}
              </div>
            )}
          </div>
          )}
        </div>

        {/* Right: Send CTA — Button primary large icon-only round */}
        <Button
          variant="primary"
          size="lg"
          iconOnly
          iconRound
          className={hasValue ? '' : 'input-console-send-disabled'}
          disabled={!hasValue}
          onClick={(e) => {
            e.stopPropagation()
            onSubmit?.()
          }}
          aria-label="Send query"
        >
          <DirectionsArrowIcon size={20} className="-rotate-90" />
        </Button>
      </div>
    </div>
  )
}
