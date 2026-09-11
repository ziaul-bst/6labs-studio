/**
 * SpecializedAgentsView — Hub for purpose-built agents.
 * When no agent is selected, renders the landing grid of launch cards.
 * When an agent is selected, renders that agent's chat flow.
 *
 * The parent (HomePage) owns `selectedAgentId` so it can switch the content
 * area between scroll (grid) and fixed-height (chat) layouts.
 */
import { SpecializedAgentCard } from '../molecules/SpecializedAgentCard'
import { SpecializedAgentChatView } from './SpecializedAgentChatView'
import { SPECIALIZED_AGENTS, getSpecializedAgent } from '../../data/specializedAgents'

interface SpecializedAgentsViewProps {
  selectedAgentId: string | null
  onSelectAgent: (id: string) => void
  onBack: () => void
}

export function SpecializedAgentsView({
  selectedAgentId,
  onSelectAgent,
  onBack,
}: SpecializedAgentsViewProps) {
  const selectedAgent = getSpecializedAgent(selectedAgentId)

  if (selectedAgent) {
    return <SpecializedAgentChatView agent={selectedAgent} onBack={onBack} />
  }

  return (
    <div className="flex flex-col items-center pt-[120px] pb-xxl3 w-full">
      <div className="flex flex-col gap-xxl page-measure">
        {/* Page header */}
        <div className="flex flex-col gap-xs items-start">
          <h1 className="font-display text-4xl font-extrabold text-text-primary leading-[1.2]">
            Specialized <span className="text-brand">Agents</span>
          </h1>
          <p className="font-body text-m font-normal text-base-700 leading-[1.5] w-full">
            Purpose-built agents tuned for a specific job. Pick one to launch a guided,
            chat-based flow trained on the data that matters for that outcome.
          </p>
        </div>

        {/* Agent grid */}
        <div className="grid gap-l [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))] w-full">
          {SPECIALIZED_AGENTS.map((agent) => (
            <SpecializedAgentCard key={agent.id} agent={agent} onLaunch={onSelectAgent} />
          ))}
        </div>
      </div>
    </div>
  )
}
