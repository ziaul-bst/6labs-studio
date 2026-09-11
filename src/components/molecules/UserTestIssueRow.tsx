/**
 * UserTestIssueRow — a finding in the full report, with its evidence folded
 * underneath.
 *
 * The header carries everything needed to triage without opening anything:
 * rank, title, step, kind, reach, confidence, cost. The body is the part that
 * takes time to read — the explanation of *why* the agent believes it, and the
 * clip list. Collapsed by default so seven issues fit on one screen; the first
 * one opens, because a report that shows no evidence at all reads like a claim.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useState } from 'react'
import { AffectedDots } from '../atoms/AffectedDots'
import { ConfidenceBadge } from '../atoms/ConfidenceBadge'
import { ISSUE_KIND_FILL, IssueKindTag } from '../atoms/IssueKindTag'
import { ChevronIcon } from '../icons/ChevronIcon'
import { PlayIcon } from '../icons/PlayIcon'
import type { UserTestIssue } from '../../lib/types/userTest'

export interface UserTestIssueRowProps {
  issue: UserTestIssue
  baselineLabel?: string
  /**
   * Off when the run has nothing to be compared against — an AI behavioural
   * run has no previous batch, and "no baseline" on every row says nothing.
   */
  showBaseline?: boolean
  /** What `affected` counts — "testers" for human sessions, "agents" for AI ones. */
  unitLabel?: string
  defaultOpen?: boolean
  onPlayClip?: (clipIndex: number) => void
  className?: string
}

export function UserTestIssueRow({
  issue,
  baselineLabel = 'batch 1',
  showBaseline = true,
  unitLabel = 'testers',
  defaultOpen = false,
  onPlayClip,
  className,
}: UserTestIssueRowProps) {
  const [open, setOpen] = useState(defaultOpen)
  const fill = ISSUE_KIND_FILL[issue.kind]
  const statusLabel =
    issue.status === 'new'
      ? `new since ${baselineLabel}`
      : issue.status === 'no-baseline'
        ? `no baseline in ${baselineLabel}`
        : issue.status === 'fixed'
          ? `fixed since ${baselineLabel}`
          : `open since ${baselineLabel}`

  return (
    <div
      className={['flex flex-col w-full', className].filter(Boolean).join(' ')}
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="user-test-issue-hd user-test-issue-grid items-center gap-m w-full text-left px-l py-m"
      >
        <span
          className="flex items-center justify-center shrink-0 w-7 h-7 rounded-m font-display text-s font-semibold"
          style={{ backgroundColor: fill.bg, color: fill.ink }}
          aria-hidden
        >
          {issue.rank}
        </span>

        <span className="flex flex-col gap-xxxs min-w-0">
          <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
            {issue.title}
          </span>
          <span className="flex flex-wrap items-center gap-xs font-body text-xs text-text-tertiary leading-[1.5]">
            Step: {issue.step}
            <IssueKindTag kind={issue.kind} />
            {showBaseline && <span>{statusLabel}</span>}
          </span>
        </span>

        <span className="flex flex-col gap-xxs min-w-0">
          <AffectedDots affected={issue.affected} total={issue.totalTesters} color={fill.bg} />
          <span className="font-body text-xs text-text-tertiary leading-[1.5]">
            {issue.affected} of {issue.totalTesters} {unitLabel}
          </span>
        </span>

        <ConfidenceBadge confidence={issue.confidence} />

        <span className="font-body text-xs text-text-tertiary leading-[1.5]">
          {issue.metric ?? issue.scopeNote ?? ''}
        </span>

        <span className="flex items-center justify-end text-text-tertiary">
          <ChevronIcon size={16} direction={open ? 'up' : 'down'} />
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-s px-l pb-l pl-[calc(var(--space-l)+28px+var(--space-m))]">
          <p className="font-body text-s font-normal text-text-secondary leading-[1.65] max-w-[92ch]">
            {issue.detail}
          </p>

          {issue.clips.length > 0 && (
            <div
              className="flex flex-col rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              {issue.clips.map((clip, i) => (
                <button
                  key={`${clip.tester}-${clip.timeRange}`}
                  type="button"
                  onClick={() => onPlayClip?.(i)}
                  className="user-test-clip grid items-center gap-m text-left px-m py-xs"
                  style={{
                    gridTemplateColumns: '150px minmax(0,1fr) 140px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                  }}
                >
                  <span className="font-display text-xs font-semibold text-text-primary leading-[1.5]">
                    {clip.tester} · {clip.device}
                  </span>
                  <span className="font-body text-xs text-text-secondary leading-[1.5] truncate">
                    {clip.note}
                  </span>
                  <span className="inline-flex items-center justify-end gap-xxs font-code text-xs text-text-brand leading-[1.5] whitespace-nowrap">
                    <PlayIcon size={12} />
                    {clip.timeRange}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
