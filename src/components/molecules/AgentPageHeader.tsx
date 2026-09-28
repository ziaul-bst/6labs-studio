/**
 * AgentPageHeader — Large agent identity block used at the top of dedicated agent pages.
 * Anatomy: 72px gradient icon (rounded-12) + title (32px ExtraBold) + description (14px body).
 *
 * @figmaComponent  Header (Agent Page)
 * @figmaPath       Other agents / Oracle Page / Section / Header
 * @figmaNode       6418:100898
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6418-100898
 *
 * Source: 6labs/studio → src/components/molecules/AgentPageHeader.tsx
 * Synced: 2026-04-05
 */

import type { ReactNode } from 'react'

interface AgentPageHeaderProps {
  /** Agent display name */
  title: string
  /** Agent description line */
  description: string
  /** CSS background for the 72px icon container (gradient string) */
  iconGradient: string
  /** Agent icon rendered inside the 72px container (white, ~40px) */
  icon: ReactNode
  className?: string
}

export function AgentPageHeader({
  title,
  description,
  iconGradient,
  icon,
  className,
}: AgentPageHeaderProps) {
  return (
    <div
      className={['flex gap-xl items-start w-full', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* 72px gradient icon */}
      <div
        className="shrink-0 size-[72px] rounded-xl flex items-center justify-center"
        style={{ background: iconGradient }}
      >
        <div className="text-white">{icon}</div>
      </div>

      {/* Title + description */}
      <div className="flex flex-col items-start justify-center flex-1 min-w-0 leading-[1.5]">
        <h1 className="font-display text-2xl font-extrabold text-text-primary whitespace-nowrap">
          {title}
        </h1>
        {/* Balanced, so a description squeezed by header actions breaks into
            two even lines rather than leaving one word on the second. */}
        <p className="font-body text-s font-normal text-base-700 text-balance">
          {description}
        </p>
      </div>
    </div>
  )
}
