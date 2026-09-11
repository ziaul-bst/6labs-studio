/**
 * UserTestIssueCard — one ranked finding on the run summary.
 *
 * Ranked by *testers affected*, not by severity: a run has no way to know what
 * matters to the team, but it does know how many people hit the thing. The
 * count sits on the right at the same weight as the title so the ordering is
 * self-explaining rather than something the reader has to take on trust.
 *
 * Code-first prototype — no Figma source yet.
 */

import { ISSUE_KIND_FILL, IssueKindTag } from '../atoms/IssueKindTag'
import { PlayIcon } from '../icons/PlayIcon'
import type { UserTestIssue } from '../../lib/types/userTest'

export interface UserTestIssueCardProps {
  issue: UserTestIssue
  /** Name of the run this one is compared against — drives the "new since" chip. */
  baselineLabel?: string
  onClick?: () => void
  className?: string
}

const QUALIFIER: Record<UserTestIssue['confidence'], string> = {
  verified: 'verified',
  high: 'high confidence',
  medium: 'medium confidence',
}

export function UserTestIssueCard({
  issue,
  baselineLabel = 'batch 1',
  onClick,
  className,
}: UserTestIssueCardProps) {
  const fill = ISSUE_KIND_FILL[issue.kind]

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'user-test-issue flex items-start gap-m w-full text-left',
        'px-l py-m rounded-xl',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Rank — coloured by kind, so the list reads as bugs vs friction at a glance */}
      <span
        className="flex items-center justify-center shrink-0 w-7 h-7 rounded-m font-display text-s font-semibold"
        style={{ backgroundColor: fill.bg, color: fill.ink }}
        aria-hidden
      >
        {issue.rank}
      </span>

      <span className="flex flex-col gap-xxs flex-1 min-w-0">
        <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
          {issue.title}
        </span>
        <span className="font-body text-s font-normal text-text-secondary leading-[1.6]">
          {issue.summary}
        </span>

        <span className="flex flex-wrap items-center gap-xs pt-xxs">
          <IssueKindTag kind={issue.kind} qualifier={QUALIFIER[issue.confidence]} />
          <span className="font-body text-xs text-text-tertiary leading-[1.5]">{issue.step}</span>
          <StatusChip status={issue.status} baselineLabel={baselineLabel} />
          {issue.clips.length > 0 && (
            <span className="inline-flex items-center gap-xxs font-body text-xs text-text-brand leading-[1.5]">
              <PlayIcon size={12} />
              {issue.clips.length} clips
            </span>
          )}
        </span>
      </span>

      {/* Reach — the thing the list is sorted by */}
      <span className="flex flex-col items-end shrink-0 pl-s">
        <span className="font-display text-m font-semibold text-text-primary leading-[1.3] whitespace-nowrap">
          {issue.affected} / {issue.totalTesters}
        </span>
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">testers</span>
        {(issue.metric || issue.scopeNote) && (
          <span className="font-body text-xs text-text-tertiary leading-[1.5] whitespace-nowrap">
            {issue.metric ?? issue.scopeNote}
          </span>
        )}
      </span>
    </button>
  )
}

function StatusChip({
  status,
  baselineLabel,
}: {
  status: UserTestIssue['status']
  baselineLabel: string
}) {
  if (status === 'fixed') return null
  const isNew = status === 'new'
  const label =
    status === 'no-baseline'
      ? `No baseline in ${baselineLabel}`
      : isNew
        ? `New since ${baselineLabel}`
        : 'Still open'
  return (
    <span
      className="inline-flex items-center px-xs py-xxxs rounded-xs font-body text-xs font-medium leading-[1.5] whitespace-nowrap"
      style={
        isNew
          ? { color: 'var(--error)', backgroundColor: 'var(--error-bg)' }
          : { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-subtle)' }
      }
    >
      {label}
    </span>
  )
}
