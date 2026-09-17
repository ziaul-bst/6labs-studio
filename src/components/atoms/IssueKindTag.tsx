/**
 * IssueKindTag — says whether a User Test finding was *seen* or *inferred*.
 *
 * This is the load-bearing distinction in a User Test report, so it gets a tag
 * rather than a colour or an icon: a Bug is observable in the clip and can be
 * filed as-is, Friction is read off behaviour and has to be checked before
 * anyone acts on it. The optional qualifier carries the confidence in the same
 * pill ("Bug · verified") wherever the two are read as one claim.
 *
 * It shares its geometry and type with FindingSeverityTag — same padding,
 * radius, size, weight and case. The two sit side by side on every finding, and
 * an uppercase letterspaced chip next to a Title-Case one read as two
 * unrelated systems rather than as two facts about one finding.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { IssueKind } from '../../lib/types/userTest'

export interface IssueKindTagProps {
  kind: IssueKind
  /** Confidence phrase appended after a middot — "verified", "high confidence". */
  qualifier?: string
  className?: string
}

/**
 * Solid-fill pairing for the rank badge, shared so the two lists cannot drift.
 * Amber takes dark ink: white on #FFB700 is about 1.9:1, which is unreadable
 * and fails contrast outright — the badge carries a number, so it has to be
 * legible, not merely coloured.
 */
export const ISSUE_KIND_FILL: Record<IssueKind, { bg: string; ink: string }> = {
  bug: { bg: 'var(--error)', ink: '#FFFFFF' },
  friction: { bg: 'var(--warning)', ink: '#3D2B00' },
}

const KIND_META: Record<IssueKind, { label: string; color?: string; bg: string; inkClass?: string }> = {
  bug: { label: 'Bug', color: 'var(--error)', bg: 'var(--error-bg)' },
  friction: { label: 'Friction', bg: 'var(--warning-bg)', inkClass: 'issue-amber-ink' },
}

export function IssueKindTag({ kind, qualifier, className }: IssueKindTagProps) {
  const meta = KIND_META[kind]
  return (
    <span
      className={[
        'inline-flex items-center gap-xxs shrink-0',
        'px-xs py-xxxs rounded-xs',
        'font-body text-xs font-medium leading-[1.5] whitespace-nowrap',
        meta.inkClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      {meta.label}
      {qualifier && (
        <span className="font-normal opacity-80">· {qualifier}</span>
      )}
    </span>
  )
}
