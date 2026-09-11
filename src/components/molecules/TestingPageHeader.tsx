/**
 * TestingPageHeader — identity block at the top of every Testing screen.
 *
 * A 64px gradient tile carrying the test's own icon, then the title and one
 * line of purpose. The gradient is the test's accent (see TESTING_ACCENT_VARS),
 * so a Functional test page is teal, an agency page purple, every AI page
 * green — the same colour the Overview tile and the sidebar row use.
 *
 * Optional `action` slot on the right for a page-level CTA (Gameplay Library
 * keeps "Upload videos" there).
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ReactNode } from 'react'
import { TESTING_ACCENT_VARS, type TestingAccent } from '../../lib/studioAreas'

export interface TestingPageHeaderProps {
  title: string
  description: string
  icon: ReactNode
  accent?: TestingAccent
  action?: ReactNode
  className?: string
}

export function TestingPageHeader({
  title,
  description,
  icon,
  accent = 'brand',
  action,
  className,
}: TestingPageHeaderProps) {
  const vars = TESTING_ACCENT_VARS[accent]
  return (
    <div className={['flex items-start gap-l w-full', className].filter(Boolean).join(' ')}>
      <div
        className="shrink-0 flex items-center justify-center w-[64px] h-[64px] rounded-2xl text-white"
        style={{ background: vars.gradient, boxShadow: `0 8px 24px ${vars.bg}` }}
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex flex-col gap-xxs flex-1 min-w-0 pt-xxxs">
        <h1 className="font-display text-2xl font-extrabold text-text-primary leading-[1.15] tracking-[-0.01em]">
          {title}
        </h1>
        <p className="font-body text-s text-text-secondary leading-[1.55] max-w-[78ch]">
          {description}
        </p>
      </div>
      {action && <div className="shrink-0 pt-xs">{action}</div>}
    </div>
  )
}
