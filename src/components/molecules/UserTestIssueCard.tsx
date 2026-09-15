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
import { FindingSeverityTag } from '../atoms/FindingSeverityTag'
import { PlayIcon } from '../icons/PlayIcon'
import type { UserTestIssue } from '../../lib/types/userTest'

export interface UserTestIssueCardProps {
  issue: UserTestIssue
  onClick?: () => void
  className?: string
}

export function UserTestIssueCard({
  issue,
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

        {/* Severity first, kind second: "Bug" does not say whether to stop the
            build, and the list is scanned for the ones that do. Three tags is
            the ceiling — the confidence qualifier and the baseline chip both
            said something the full report says properly, and a row carrying
            five chips is read as none. */}
        <span className="flex flex-wrap items-center gap-xs pt-xxs">
          <FindingSeverityTag severity={issue.severity} />
          <IssueKindTag kind={issue.kind} />
          <span className="font-body text-xs text-text-tertiary leading-[1.5]">{issue.step}</span>
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
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">sessions</span>
        {(issue.metric || issue.scopeNote) && (
          <span className="font-body text-xs text-text-tertiary leading-[1.5] whitespace-nowrap">
            {issue.metric ?? issue.scopeNote}
          </span>
        )}
      </span>
    </button>
  )
}
