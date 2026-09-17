/**
 * FindingsByCategoryTable — the run's findings counted by category.
 *
 * It answers the question a reader has before they read any single finding:
 * where is this run's damage concentrated. Four columns, and each is a
 * different denominator — how many findings, how many sessions they touched,
 * how many of them stop the build — so the table is read across rather than
 * summed down.
 *
 * Shared by the run page and the full report. It was written once inside the
 * report, and the run page is the screen most readers stop at; a reader who
 * never opens the report should still get the shape of the run, and the two
 * screens must not count it differently.
 *
 * The rows are derived from the findings actually in hand — see
 * `categoryRowsFor` — so a filtered cut cannot print the whole run's totals
 * under a list that no longer matches.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { UserTestCategoryRow, UserTestIssue } from '../../lib/types/userTest'

export interface FindingsByCategoryTableProps {
  rows: UserTestCategoryRow[]
  className?: string
}

/**
 * Counts the findings in hand by category, in the supplied order.
 *
 * Only `sessionsAffected` comes from the supplied rows: the same session appears
 * in several categories, so the union is a fact the run has to report and this
 * cannot derive it.
 */
export function categoryRowsFor(
  issues: UserTestIssue[],
  supplied: UserTestCategoryRow[],
): UserTestCategoryRow[] {
  const counted = new Map<
    string,
    { tone: UserTestCategoryRow['tone']; findings: number; blocking: number }
  >()
  for (const issue of issues) {
    const row = counted.get(issue.category) ?? { tone: issue.kind, findings: 0, blocking: 0 }
    row.findings += 1
    if (issue.severity === 'blocking') row.blocking += 1
    counted.set(issue.category, row)
  }
  const byLabel = new Map(supplied.map((c) => [c.label, c]))
  /* Supplied order first — it is the run's own ordering, and a report reads
     bugs before friction because that is how it is triaged. */
  const ordered = supplied.filter((c) => counted.has(c.label)).map((c) => c.label)
  for (const label of counted.keys()) if (!byLabel.has(label)) ordered.push(label)
  return ordered.map((label) => {
    const { tone, findings, blocking } = counted.get(label)!
    const from = byLabel.get(label)
    return {
      label,
      tone: from?.tone ?? tone,
      findings,
      sessionsAffected: from?.sessionsAffected ?? null,
      blocking,
    }
  })
}

export function FindingsByCategoryTable({ rows, className }: FindingsByCategoryTableProps) {
  const totalFindings = rows.reduce((n, c) => n + c.findings, 0)
  const totalBlocking = rows.reduce((n, c) => n + c.blocking, 0)

  return (
    <div
      className={['flex flex-col w-full rounded-xl overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
      style={{ border: '1px solid var(--border-subtle)' }}
    >
      <div
        className="category-row px-l py-s font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]"
        style={{
          backgroundColor: 'var(--bg-page-pale)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span>Category</span>
        <span>Findings</span>
        <span>Sessions affected</span>
        <span>Blocking</span>
      </div>

      {rows.map((row, i) => (
        <div
          key={row.label}
          className="category-row px-l py-m font-body text-m text-text-primary leading-[1.5]"
          style={{ borderTop: i === 0 ? undefined : '1px solid var(--border-subtle)' }}
        >
          <span className="flex items-center gap-xs min-w-0">
            <span
              className="w-[7px] h-[7px] rounded-round shrink-0"
              style={{ backgroundColor: row.tone === 'bug' ? 'var(--error)' : 'var(--warning)' }}
              aria-hidden
            />
            {row.label}
          </span>
          <span className="tabular-nums">{row.findings}</span>
          {row.sessionsAffected === null ? (
            <span className="text-text-tertiary">—</span>
          ) : (
            <span className="tabular-nums">{row.sessionsAffected}</span>
          )}
          <span className="tabular-nums">{row.blocking}</span>
        </div>
      ))}

      {/* Sessions affected has no total: the same session appears in several
          rows, so a column sum would claim more sessions than the batch has.
          An em dash is the honest cell. */}
      <div
        className="category-row px-l py-m font-body text-m font-semibold text-text-primary leading-[1.5]"
        style={{
          backgroundColor: 'var(--bg-page-pale)',
          borderTop: '1px solid var(--border-default)',
        }}
      >
        <span>All findings</span>
        <span className="tabular-nums">{totalFindings}</span>
        <span className="font-normal text-text-tertiary">—</span>
        <span className="tabular-nums">{totalBlocking}</span>
      </div>
    </div>
  )
}
