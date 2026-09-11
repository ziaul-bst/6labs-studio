/**
 * SpecializedAgentCard — Launch card for a single specialized agent on the hub.
 * Anatomy: gradient identity tile + category pill → name + description → "Use agent" CTA.
 * Entire card is the launch affordance; hover lifts and brightens the border.
 */
import { DirectionsArrowIcon } from '../icons/DirectionsArrowIcon'
import { InfoFilledIcon } from '../icons/InfoFilledIcon'
import type { SpecializedAgent } from '../../data/specializedAgents'

interface SpecializedAgentCardProps {
  agent: SpecializedAgent
  onLaunch: (id: string) => void
  className?: string
}

export function SpecializedAgentCard({ agent, onLaunch, className }: SpecializedAgentCardProps) {
  return (
    <button
      type="button"
      onClick={() => onLaunch(agent.id)}
      className={[
        'specialized-card group flex flex-col gap-l items-start text-left w-full p-l rounded-xl',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Identity row — gradient tile + category pill pinned to the top-right */}
      <div className="flex items-start justify-between w-full">
        <div
          className="shrink-0 size-[56px] rounded-xl flex items-center justify-center"
          style={{ background: agent.iconGradient }}
        >
          <div className="text-white">{agent.icon}</div>
        </div>
        <span className="shrink-0 font-display text-2xs font-semibold text-text-tertiary uppercase tracking-wide px-s py-xxs rounded-round bg-bg-page">
          {agent.tag}
        </span>
      </div>

      {/* Name + description */}
      <div className="flex flex-col gap-xxs items-start w-full min-w-0">
        <h3 className="font-display text-l font-bold text-text-primary leading-[1.3]">
          {agent.name}
        </h3>
        <p className="font-body text-s font-normal text-base-700 leading-[1.5]">
          {agent.description}
        </p>
        {agent.requirement && (
          <span className="inline-flex items-center gap-xxxs mt-xxs px-xs py-xxxs rounded-round bg-bg-tint-light text-text-secondary font-display text-2xs font-semibold">
            <InfoFilledIcon size={12} />
            {agent.requirement}
          </span>
        )}
      </div>

      {/* CTA */}
      <span className="flex items-center gap-xxs font-display text-s font-semibold text-text-brand mt-auto">
        Use agent
        <DirectionsArrowIcon size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </button>
  )
}
