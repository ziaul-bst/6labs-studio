/**
 * UserTestRunsView — the User Test agent home once at least one run exists.
 *
 * A run is a batch, not a query, so the home screen is a list of batches rather
 * than a prompt. Each row answers the three questions a PM has on arrival: what
 * was tested, how much footage went in, and whether the answer is ready yet.
 * A run still analysing shows progress and cannot be opened — a half-read batch
 * would report a false ranking, since the ordering is by testers affected.
 *
 * Code-first prototype — no Figma source yet.
 */

import { AgentPageHeader } from '../molecules/AgentPageHeader'
import { ProgressBar } from '../atoms/ProgressBar'
import Button from '../ui/Button'
import { MembersIcon } from '../icons/MembersIcon'
import { InfoFilledIcon } from '../icons/InfoFilledIcon'
import type { UserTestRun } from '../../lib/types/userTest'

export const USER_TEST_GRADIENT = 'linear-gradient(135deg, #7B4CFF 0%, #5A2FD0 100%)'

export interface UserTestRunsViewProps {
  runs: UserTestRun[]
  onNewRun?: () => void
  onOpenRun?: (runId: string) => void
  /**
   * Run to mark as just-created. Landing on a list of near-identical rows with
   * no idea which one you made is the failure this prevents.
   */
  highlightRunId?: string | null
  className?: string
}

const GRID = '2.2fr 0.9fr 1fr 1.3fr 92px'

export function UserTestRunsView({
  runs,
  onNewRun,
  onOpenRun,
  highlightRunId,
  className,
}: UserTestRunsViewProps) {
  return (
    <div
      className={['flex flex-col gap-xl page-measure pt-xxl pb-xxl3', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-xl w-full">
        <AgentPageHeader
          title="User Test"
          description="Find where players struggle in your recorded sessions."
          iconGradient={USER_TEST_GRADIENT}
          icon={<MembersIcon size={40} />}
          className="flex-1 min-w-0"
        />
        <Button variant="primary" size="lg" onClick={onNewRun}>
          New run
        </Button>
      </div>

      {/* Why a run can look emptier than the library does */}
      <div
        className="flex items-start gap-xs w-full rounded-xl px-m py-s"
        style={{ backgroundColor: 'var(--bg-tint-light)', border: '1px solid var(--border-tint)' }}
      >
        <span className="shrink-0 mt-[1px] text-text-brand" aria-hidden>
          <InfoFilledIcon size={16} />
        </span>
        <p className="font-body text-s font-normal text-text-secondary leading-[1.6]">
          Runs read only <strong className="text-text-brand font-semibold">Ready</strong> videos.
          Tag your tester recordings on upload so you can select a batch in one click.
        </p>
      </div>

      <div
        className="flex flex-col w-full rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className="grid items-center gap-m px-l py-s"
          style={{
            gridTemplateColumns: GRID,
            backgroundColor: 'var(--bg-page-pale)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {['Run', 'Videos', 'Scope', 'Status', ''].map((h, i) => (
            <span
              key={h || `col-${i}`}
              className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary leading-[1.5]"
            >
              {h}
            </span>
          ))}
        </div>

        {runs.map((run, i) => (
          <RunRow
            key={run.id}
            run={run}
            first={i === 0}
            highlight={run.id === highlightRunId}
            onOpen={() => onOpenRun?.(run.id)}
          />
        ))}
      </div>
    </div>
  )
}

function RunRow({
  run,
  first,
  highlight,
  onOpen,
}: {
  run: UserTestRun
  first: boolean
  highlight?: boolean
  onOpen: () => void
}) {
  const running = run.status === 'running'
  const progress = running ? Math.round(((run.analysed ?? 0) / run.videoCount) * 100) : 100

  return (
    /* The row opens the run — a target the width of the table, not a 60px
       button at the end of it. Rows still analysing are inert, because a
       half-read batch would report a ranking that is going to change. */
    <div
      role={running ? undefined : 'button'}
      tabIndex={running ? undefined : 0}
      onClick={running ? undefined : onOpen}
      onKeyDown={
        running
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen()
              }
            }
      }
      className={[
        'grid items-center gap-m px-l py-m',
        running ? '' : 'user-test-run-row cursor-pointer',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        gridTemplateColumns: GRID,
        borderTop: first ? 'none' : '1px solid var(--border-subtle)',
        backgroundColor: highlight ? 'var(--bg-tint-light)' : undefined,
      }}
    >
      <div className="flex flex-col gap-xxxs min-w-0">
        <span className="flex items-center gap-xs font-display text-s font-semibold text-text-primary leading-[1.45]">
          {run.name}
        </span>
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">{run.subtitle}</span>
      </div>

      <div className="flex flex-col gap-xxxs">
        <span className="font-body text-s text-text-primary leading-[1.5]">
          {run.videoCount} videos
        </span>
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">
          {run.footageLabel}
        </span>
      </div>

      <span className="font-body text-s text-text-secondary leading-[1.5]">{run.scope}</span>

      {running ? (
        <div className="flex flex-col gap-xxs min-w-0">
          <ProgressBar value={progress} />
          <span className="font-body text-xs text-text-secondary leading-[1.5]">
            {run.analysed} of {run.videoCount} analysed
          </span>
        </div>
      ) : (
        <span className="inline-flex items-center gap-xxs font-body text-s font-medium leading-[1.5]" style={{ color: 'var(--success)' }}>
          <span className="w-[6px] h-[6px] rounded-round shrink-0" style={{ backgroundColor: 'var(--success)' }} aria-hidden />
          Complete · {run.issueCount} issues
        </span>
      )}

      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="md"
          disabled={running}
          onClick={(e) => {
            e.stopPropagation()
            onOpen()
          }}
          title={running ? 'Available once every video in the batch has been analysed' : undefined}
        >
          Open
        </Button>
      </div>
    </div>
  )
}
