/**
 * UserTestAnswerCard — one answer from the User Test agent about its own run.
 *
 * Two things make this different from a general chat answer, and both are
 * deliberate:
 *
 * 1. The scope line comes *first*. Before the answer, the card says what was
 *    read to produce it — ten recordings, seven findings, twenty-one clips.
 *    A reader can then judge the answer against its evidence base instead of
 *    discovering the base afterwards, or never.
 *
 * 2. Every answer ends in references back into the report. A User Test claim
 *    that cannot be traced to a frame is not a finding, and the same rule
 *    applies when the claim arrives as an answer rather than as a row.
 *
 * When the question needs data the run does not hold, the card does not guess.
 * It states the limit and offers the handoff — see `outOfScope`.
 *
 * Code-first prototype — no Figma source yet.
 */

import { AISparkleIcon } from '../icons/AISparkleIcon'
import { ChevronRightIcon } from '../icons/ChevronRightIcon'
import { PlayIcon } from '../icons/PlayIcon'
import Button from '../ui/Button'
import type { UserTestAskAnswer, UserTestEvidenceRef } from '../../lib/types/userTest'

export interface UserTestAnswerCardProps {
  answer: UserTestAskAnswer
  /** Follows a reference into the report. */
  onOpenEvidence?: (ref: UserTestEvidenceRef) => void
  /** Only reachable from an out-of-scope answer — the run has nothing to add. */
  onHandoffToOracle?: () => void
  className?: string
}

export function UserTestAnswerCard({
  answer,
  onOpenEvidence,
  onHandoffToOracle,
  className,
}: UserTestAnswerCardProps) {
  return (
    <div
      className={['flex gap-s items-start w-full', className].filter(Boolean).join(' ')}
    >
      <span
        className="flex items-center justify-center shrink-0 w-7 h-7 rounded-round text-white"
        style={{ background: 'linear-gradient(135deg, #7B4CFF 0%, #5A2FD0 100%)' }}
        aria-hidden
      >
        <AISparkleIcon size={16} />
      </span>

      <div className="flex flex-col gap-s flex-1 min-w-0">
        {/* What was read — before the answer, so the answer can be weighed. */}
        <span className="font-body text-xs text-text-tertiary leading-[1.5]">
          {answer.scope}
        </span>

        {answer.body.map((para) => (
          <p key={para.slice(0, 40)} className="font-body text-s text-text-secondary leading-[1.7]">
            {para}
          </p>
        ))}

        {answer.table && (
          <div
            className="w-full overflow-x-auto rounded-xl"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-page-pale)' }}>
                  {answer.table.head.map((h) => (
                    <th
                      key={h}
                      className="text-left font-display text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary leading-[1.5] px-m py-xs whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {answer.table.rows.map((row) => (
                  <tr key={row.join('|')} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    {row.map((cell, i) => (
                      <td
                        key={cell + i}
                        className={[
                          'px-m py-xs leading-[1.5] whitespace-nowrap',
                          i === 0
                            ? 'font-display text-s font-semibold text-text-primary'
                            : 'font-body text-s text-text-secondary',
                        ].join(' ')}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {answer.outOfScope && (
          <div
            className="flex flex-col gap-xs rounded-xl px-m py-s"
            style={{
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span className="font-body text-xs text-text-secondary leading-[1.6]">
              {answer.outOfScope.reason}
            </span>
            <Button
              variant="secondary"
              size="md"
              className="self-start"
              rightIcon={<ChevronRightIcon size={16} />}
              onClick={onHandoffToOracle}
            >
              {answer.outOfScope.handoffLabel}
            </Button>
          </div>
        )}

        {answer.evidence.length > 0 && (
          <div className="flex flex-wrap items-center gap-xs pt-xxs">
            <span className="font-body text-xs text-text-tertiary leading-[1.5]">
              From
            </span>
            {answer.evidence.map((ref) => (
              <button
                key={`${ref.kind}-${ref.label}`}
                type="button"
                onClick={() => onOpenEvidence?.(ref)}
                className="user-test-evidence inline-flex items-center gap-xxs rounded-round px-s py-xxs font-body text-xs leading-[1.5]"
                style={{
                  backgroundColor: 'var(--bg-elements)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                {ref.kind === 'clip' && <PlayIcon size={12} />}
                {ref.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
