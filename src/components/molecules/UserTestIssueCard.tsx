/**
 * UserTestIssueCard — one ranked finding on the run summary.
 *
 * Ranked by *testers affected*, not by severity: a run has no way to know what
 * matters to the team, but it does know how many people hit the thing. The
 * count sits on the right at the same weight as the title so the ordering is
 * self-explaining rather than something the reader has to take on trust.
 *
 * The row is not a link. It used to be a whole-card button to the full report,
 * which promised a destination for every part of it — the title, the tags, the
 * count — and delivered the same one. The only thing on it worth following is
 * the evidence, so the clips link is the only control, and it opens those clips
 * in place rather than spending the reader's position on the list.
 *
 * The qualifier line under the count ("avg 34s lost") is gone for a related
 * reason: it is the report's job, and on a scanned list it competed with the
 * count it was sitting under.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useRef, useState } from 'react'
import { ISSUE_KIND_FILL, IssueKindTag } from '../atoms/IssueKindTag'
import { FindingSeverityTag, FindingStepTag } from '../atoms/FindingSeverityTag'
import { FindingClipsPopover } from './FindingClipsPopover'
import { PlayIcon } from '../icons/PlayIcon'
import type { UserTestClip, UserTestIssue } from '../../lib/types/userTest'

export interface UserTestIssueCardProps {
  issue: UserTestIssue
  /** Opens one clip from the popover. Rows are inert without it. */
  onOpenClip?: (clip: UserTestClip, index: number) => void
  className?: string
}

export function UserTestIssueCard({ issue, onOpenClip, className }: UserTestIssueCardProps) {
  const fill = ISSUE_KIND_FILL[issue.kind]
  const [clipsOpen, setClipsOpen] = useState(false)
  const clipsBtnRef = useRef<HTMLButtonElement>(null)

  return (
    <div
      className={['user-test-issue flex items-start gap-m w-full px-l py-m rounded-xl', className]
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

      <div className="flex flex-col gap-xxs flex-1 min-w-0">
        <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
          {issue.title}
        </span>
        <span className="font-body text-s font-normal text-text-secondary leading-[1.6]">
          {issue.summary}
        </span>

        {/* Severity first, kind second: "Bug" does not say whether to stop the
            build, and the list is scanned for the ones that do. Then the step,
            through the same component the report uses. */}
        <span className="flex flex-wrap items-center gap-xs pt-xxs">
          <FindingSeverityTag severity={issue.severity} />
          <IssueKindTag kind={issue.kind} />
          <FindingStepTag>{issue.step}</FindingStepTag>
        </span>
      </div>

      {/* Reach — the thing the list is sorted by — and under it the one control
          on the row: the clips that prove the number above them. */}
      <div className="relative flex flex-col items-end shrink-0 pl-s">
        <span className="font-display text-m font-semibold text-text-primary leading-[1.3] whitespace-nowrap">
          {issue.affected} / {issue.totalTesters}
        </span>
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">sessions</span>
        {issue.clips.length > 0 && (
          <button
            ref={clipsBtnRef}
            type="button"
            onClick={() => setClipsOpen((v) => !v)}
            aria-expanded={clipsOpen}
            className="user-test-clip-link inline-flex items-center gap-xxs mt-xxs font-body text-xs font-semibold text-text-brand leading-[1.5] whitespace-nowrap"
          >
            <PlayIcon size={12} />
            {issue.clips.length} clips
          </button>
        )}
        {clipsOpen && (
          <FindingClipsPopover
            clips={issue.clips}
            anchorRef={clipsBtnRef}
            onClose={() => setClipsOpen(false)}
            /* Picking a clip is the answer to the question the popover asked,
               so the popover goes with it. Leaving it up put two surfaces on
               screen at once — a list floating over the player's own scrim,
               each offering a different way out. */
            onOpenClip={(clip, i) => {
              setClipsOpen(false)
              onOpenClip?.(clip, i)
            }}
          />
        )}
      </div>
    </div>
  )
}
