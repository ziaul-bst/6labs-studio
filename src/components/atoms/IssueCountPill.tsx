/**
 * IssueCountPill — how many issues a run found, coloured by what that means.
 *
 * One atom for every surface that shows the count (history rows, thread and
 * report headers), so the same number can never be green in one place and
 * amber in another. Issues are not good news: amber while there are any,
 * green only at zero. Run *status* (complete, in progress) is a different
 * fact and is never folded into this pill.
 *
 * Code-first prototype — no Figma source yet.
 */

export interface IssueCountPillProps {
  count: number
  className?: string
}

export function IssueCountPill({ count, className }: IssueCountPillProps) {
  const clean = count === 0
  return (
    <span
      className={[
        'inline-flex items-center px-s py-xxs rounded-round font-body text-xs font-semibold leading-[1.5] whitespace-nowrap',
        clean ? '' : 'issue-amber-ink',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        clean
          ? { backgroundColor: 'var(--success-bg)', color: 'var(--success)' }
          : { backgroundColor: 'var(--warning-bg)' }
      }
    >
      {clean ? 'No issues' : `${count} ${count === 1 ? 'issue' : 'issues'}`}
    </span>
  )
}
