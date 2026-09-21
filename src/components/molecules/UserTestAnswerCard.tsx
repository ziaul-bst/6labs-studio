/**
 * UserTestAnswerCard — one answer from the User Test agent about its own run.
 *
 * Every answer ends in references back into the report. A User Test claim that
 * cannot be traced to a frame is not a finding, and the same rule applies when
 * the claim arrives as an answer rather than as a row.
 *
 * On a document answer those references are the *only* provenance shown. The
 * sheet used to open with a scope line — "Read 10 recordings · 7 findings · 21
 * clips · onboarding flow v3" — which was wrong as often as it was right: it
 * was written per canned answer, so a six-video run printed a line claiming
 * ten, and it was the one line on the sheet a reader had no way to check.
 * Worse, an answer carrying that line and no playable clip looked backed by
 * evidence nobody could open. The clips are the provenance, so the clips are
 * what the sheet shows: tester and time range, each one playable.
 *
 * When the question needs data the run does not hold, the card does not guess.
 * It states the limit and offers the handoff — see `outOfScope`.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ReactNode } from 'react'
import { SectionHeading } from './SectionHeading'
import { AISparkleIcon } from '../icons/AISparkleIcon'
import { ChevronRightIcon } from '../icons/ChevronRightIcon'
import { PlayIcon } from '../icons/PlayIcon'
import Button from '../ui/Button'
import type { UserTestAskAnswer, UserTestEvidenceRef } from '../../lib/types/userTest'

export interface UserTestAnswerCardProps {
  answer: UserTestAskAnswer
  /**
   * `inline` is the chat reply — an avatar, the scope, the prose.
   * `document` is the answer as its own page: the same sheet the full report
   * uses, in two numbered sections. An answer opened from history is read the
   * way a report is read, not scrolled back to like a message.
   */
  layout?: 'inline' | 'document'
  /**
   * Who answered and what they read, as a band across the top of the sheet —
   * the same identity block the run report card carries. Document layout only:
   * a chat reply has the avatar beside it instead.
   *
   * An answer sheet without it was an unsigned document. The run report says
   * "User Test · analysed 10 sessions · Sources" before its first number, and
   * an answer drawn from the same recordings has to say the same thing, or the
   * reader cannot tell which agent read what to produce it.
   */
  header?: ReactNode
  /** Follows a reference into the report. */
  onOpenEvidence?: (ref: UserTestEvidenceRef) => void
  /** Only reachable from an out-of-scope answer — the run has nothing to add. */
  onHandoffToOracle?: () => void
  className?: string
}

export function UserTestAnswerCard({
  answer,
  layout = 'inline',
  header,
  onOpenEvidence,
  onHandoffToOracle,
  className,
}: UserTestAnswerCardProps) {
  const table = answer.table && (
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
  )

  const outOfScope = answer.outOfScope && (
    <div
      className="flex flex-col gap-xs rounded-xl px-m py-s"
      style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--border-subtle)' }}
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
  )

  const evidence = answer.evidence.length > 0 && (
    <div className="flex flex-wrap items-center gap-xs pt-xxs">
      <span className="font-body text-xs text-text-tertiary leading-[1.5]">From</span>
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
  )

  /* ── The answer as a page ──
     Same sheet, same numbered parts, same heading as the report: 01 says what
     the answer is, 02 carries what it rests on. The scope rides on the first
     heading rather than above it, the way the report's own part meta does. */
  if (layout === 'document') {
    const hasDetail = Boolean(answer.table) || Boolean(answer.detail)
    /* The clips the answer rests on, under the summary it backs. They are the
       sheet's provenance now that the scope line is gone: a claim about what
       ten sessions did is worth exactly as much as the ten seconds you can
       press to check it. Only the playable ones — a finding or a step
       reference is a pointer into the report, which the Details table below
       already names in full. */
    const citations = answer.evidence.filter((ref) => ref.kind === 'clip')
    return (
      <article
        className={['flex flex-col w-full rounded-2xl overflow-hidden', className]
          .filter(Boolean)
          .join(' ')}
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      >
        {header}

        <section className="flex flex-col gap-m px-l py-l">
          <SectionHeading index="01" title="Summary" />
          <div className="flex flex-col gap-s">
            {answer.body.map((para) => (
              <p
                key={para.slice(0, 40)}
                className="font-body text-s text-text-secondary leading-[1.7] max-w-[92ch]"
              >
                {para}
              </p>
            ))}
            {outOfScope}
            {citations.length > 0 && (
              <div className="flex flex-wrap items-center gap-xs pt-xs">
                <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]">
                  Clips
                </span>
                {citations.map((ref) => (
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
                    <PlayIcon size={12} />
                    {ref.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {hasDetail && (
          <section
            className="flex flex-col gap-m px-l py-l"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <SectionHeading index="02" title="Details" />
            <div className="flex flex-col gap-s">
              {table}
              {/* An answer with no table still gets its second part — saying
                  there is nothing behind it is itself the detail, and a lone
                  numbered 01 reads as a document that failed to finish. */}
              {!answer.table && answer.detail && (
                <p className="font-body text-s text-text-secondary leading-[1.7] max-w-[92ch] m-0">
                  {answer.detail}
                </p>
              )}
            </div>
          </section>
        )}
      </article>
    )
  }

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
        {/* No scope line here either — same reason as the document sheet. The
            evidence chips at the foot are what a reader checks the answer
            against, and they are the ones that open. */}
        {answer.body.map((para) => (
          <p key={para.slice(0, 40)} className="font-body text-s text-text-secondary leading-[1.7]">
            {para}
          </p>
        ))}

        {table}
        {outOfScope}
        {evidence}
      </div>
    </div>
  )
}
