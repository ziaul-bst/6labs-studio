/**
 * HeroSection — Central hero on the 6labs Studio homepage.
 * Anatomy: badge pill → 48px headline → agent tabs switcher → prompt input console.
 *
 * @figmaComponent  Hero Section
 * @figmaNode       2441:56017
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=2441-56017
 *
 * Source: studio/src/components/organisms/HeroSection.tsx
 * Synced: 2026-04-04
 */

import { useState, type ComponentProps } from 'react'
import { RadiologistIcon } from '../icons/RadiologistIcon'
import { OracleIcon } from '../icons/OracleIcon'
import { AgentTabItem } from '../molecules/AgentTabItem'
import InputFieldConsole from '../ui/InputFieldConsole'

type Agent = 'radiologist' | 'oracle'

const AGENT_PLACEHOLDERS: Record<Agent, string> = {
  radiologist: 'Search for actions, objects and events in your game...',
  oracle: 'Ask Oracle anything about your game data...',
}

interface HeroSectionProps {
  className?: string
  /** Controlled active agent — parent owns the state */
  activeAgent?: Agent
  /** Called when the user switches agent tabs */
  onAgentChange?: (agent: Agent) => void
  /** Controlled console source (platform) selection */
  selectedSource?: string
  /** Called when the user picks a source in the console popup */
  onSourceChange?: (value: string) => void
  /** Library tag options + selection for scoping the Library source */
  libraryTags?: ComponentProps<typeof InputFieldConsole>['libraryTags']
  selectedLibraryTags?: string[]
  onLibraryTagsChange?: (tags: string[]) => void
  /** Called when the user submits a query from the hero input */
  onSubmit?: (query: string, agent: Agent) => void
  /** Called when the user opens the Specialized Agents hub from the tab row */
}

export type { Agent }

export function HeroSection({ className, activeAgent: controlledAgent, onAgentChange, selectedSource, onSourceChange, libraryTags, selectedLibraryTags, onLibraryTagsChange, onSubmit }: HeroSectionProps) {
  const [internalAgent, setInternalAgent] = useState<Agent>('oracle')
  const activeAgent = controlledAgent ?? internalAgent

  const handleAgentChange = (agent: Agent) => {
    setInternalAgent(agent)
    onAgentChange?.(agent)
  }
  const [query, setQuery] = useState('')

  const placeholder = AGENT_PLACEHOLDERS[activeAgent]

  return (
    <div
      className={[
        'flex flex-col gap-[64px] items-center w-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Hero Section (Badge + Headline) ── */}
      <div className="flex flex-col gap-s items-center max-w-[720px] w-full">
        {/* Badge pill */}
        <div className="flex gap-[7px] items-center px-s py-xxs rounded-round border border-[rgba(10,133,237,0.3)] bg-white shadow-[0px_4px_16px_0px_rgba(10,133,237,0.2)]">
          <span className="font-display text-xs font-bold text-brand leading-[1.5] whitespace-nowrap">
            ✦&nbsp; AI trained on 1,000,000+ hours of gameplay data
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl font-extrabold leading-[1.2] text-center text-text-primary w-full">
          Get to{' '}
          <span className="text-brand">know your game</span>{' '}
          better!
        </h1>
      </div>

      {/* ── Tabs + Input console ── */}
      <div className="flex flex-col gap-xl items-center w-full">

        {/* Powered by label + tabs */}
        <div className="flex flex-col gap-xs items-center">
          <p className="font-body text-xs font-normal text-text-secondary leading-[1.5] text-center">
            Powered by{' '}
            <span className="text-brand">Sixth</span>
            <span className="text-text-primary">Sense™</span>
            {' '}
            <span className="text-text-primary">Engine</span>
          </p>

          {/* Agent tab switcher */}
          <div
            role="tablist"
            className="flex gap-xxs items-center justify-center p-xxs rounded-xl border border-border-subtle bg-bg-elements"
          >
            <AgentTabItem
              label="Oracle"
              icon={<OracleIcon size={20} />}
              active={activeAgent === 'oracle'}
              onClick={() => handleAgentChange('oracle')}
            />
            <AgentTabItem
              label="Radiologist"
              icon={<RadiologistIcon size={20} />}
              active={activeAgent === 'radiologist'}
              onClick={() => handleAgentChange('radiologist')}
            />
          </div>
        </div>

        {/* Prompt input console */}
        <InputFieldConsole
          value={query}
          onChange={setQuery}
          onSubmit={() => {
            if (query.trim() && onSubmit) {
              onSubmit(query.trim(), activeAgent)
            }
          }}
          placeholder={placeholder}
          selectedPlatform={selectedSource}
          onPlatformChange={onSourceChange}
          libraryTags={libraryTags}
          selectedLibraryTags={selectedLibraryTags}
          onLibraryTagsChange={onLibraryTagsChange}
        />
      </div>
    </div>
  )
}
