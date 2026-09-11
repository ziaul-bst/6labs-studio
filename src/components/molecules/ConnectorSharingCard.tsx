/**
 * ConnectorSharingCard — the "Shared connection management" block shown in the
 * BigQuery / Snowflake onboarding modals.
 *
 * Structured so a reviewer can answer three questions in order:
 *   1. What is this section?      → title
 *   2. What does sharing mean?    → description (always-true baseline: everyone
 *                                   can query, read-only)
 *   3. What can I change?         → one action-phrased toggle row
 *
 * The toggle label is deliberately an action ("Allow members… to edit…"), not
 * a statement of fact. An earlier version read "Everyone in this workspace can
 * edit table and column descriptions." next to an OFF switch, which looked as
 * though it were already true; the switch position now carries the state on
 * its own.
 */

interface ConnectorSharingCardProps {
  /** Whether teammates may edit descriptions (not just query). */
  orgWideEdit: boolean
  onOrgWideEditChange: (next: boolean) => void
}

export function ConnectorSharingCard({
  orgWideEdit,
  onOrgWideEditChange,
}: ConnectorSharingCardProps) {
  return (
    <div
      className="flex flex-col gap-s w-full shrink-0 px-m py-m rounded-m"
      style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-subtle)' }}
    >
      {/* 1 + 2 — what this is, and what sharing always means */}
      <div className="flex flex-col gap-xxs">
        <span
          className="font-body text-s font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Shared connection management
        </span>
        <span
          className="font-body text-xs leading-[1.5]"
          style={{ color: 'var(--text-secondary)' }}
        >
          This connection is shared with everyone in your workspace. They can query
          these tables in Oracle — read-only, 6labs never writes back to your
          warehouse.
        </span>
      </div>

      {/* 3 — the one thing the owner controls, plus the current state */}
      <div
        className="flex items-center justify-between gap-m"
        style={{
          borderTop: '1px solid var(--border-default)',
          paddingTop: 'var(--space-s, 8px)',
        }}
      >
        <label
          htmlFor="connector-orgwide-edit"
          className="font-body text-s font-medium min-w-0 cursor-pointer"
          style={{ color: 'var(--text-primary)' }}
        >
          Allow members in your company to edit descriptions
        </label>
        <button
          id="connector-orgwide-edit"
          type="button"
          role="switch"
          aria-checked={orgWideEdit}
          aria-label="Allow members in your company to edit descriptions"
          onClick={() => onOrgWideEditChange(!orgWideEdit)}
          className="shrink-0"
          style={{
            width: 40,
            height: 22,
            borderRadius: 999,
            border: '1px solid var(--border-default)',
            background: orgWideEdit ? 'var(--brand)' : 'var(--bg-card)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 120ms ease',
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 2,
              left: orgWideEdit ? 20 : 2,
              width: 16,
              height: 16,
              borderRadius: 999,
              background: orgWideEdit ? '#fff' : 'var(--text-tertiary)',
              transition: 'left 120ms ease, background 120ms ease',
            }}
          />
        </button>
      </div>
    </div>
  )
}
