/**
 * RunFacts — the facts a run repeats on every one of its screens, as a row of
 * labelled values.
 *
 * The artifact carried these as one middot-separated line under the title,
 * which truncated at 20 agents and said nothing about what "v2.3.1" was. A
 * caption over each value makes every fact self-labelling, and a fact that is
 * a list (personas) can carry its colour dots without breaking the line.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ReactNode } from 'react'

export interface RunFact {
  label: string
  value: ReactNode
  /** Lets a long value (instructions) take the remaining width and truncate. */
  grow?: boolean
  /** Full text for a truncated value. */
  title?: string
}

export interface RunFactsProps {
  facts: RunFact[]
  className?: string
}

export function RunFacts({ facts, className }: RunFactsProps) {
  return (
    <dl className={['flex flex-wrap items-start gap-x-xl gap-y-s m-0 min-w-0', className].filter(Boolean).join(' ')}>
      {facts.map((f) => (
        <div key={f.label} className={['flex flex-col gap-xxxs min-w-0', f.grow ? 'flex-1 basis-[240px]' : ''].filter(Boolean).join(' ')}>
          <dt className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5] whitespace-nowrap">
            {f.label}
          </dt>
          <dd
            className="m-0 flex items-center gap-xs min-w-0 font-body text-s font-semibold text-text-primary leading-[1.5] truncate"
            title={f.title}
          >
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** A persona name with its colour dot — for the Personas fact. */
export function PersonaChip({ name, tone, count }: { name: string; tone: string; count?: number }) {
  return (
    <span className="inline-flex items-center gap-xxs whitespace-nowrap">
      <i className="w-[8px] h-[8px] rounded-round shrink-0" style={{ backgroundColor: tone }} aria-hidden />
      {name}
      {count !== undefined && <span className="font-body font-normal text-text-tertiary">×{count}</span>}
    </span>
  )
}
