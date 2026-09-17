/**
 * ReportFindingRow — one finding in the full report.
 *
 * A row inside its group block, not a card of its own. Seven cards floating
 * under four headings made grouping a question about whitespace; on dividers
 * inside a bordered block it is not a question at all.
 *
 * It lives here rather than inside the report organism because the inventory
 * should have one owner per concept. `UserTestIssueRow` used to claim this job
 * in its own doc comment while the report rendered something else entirely —
 * that molecule is the collapsible triage row the AI behavioural view uses, and
 * this is the document row. Two shapes, two names, no overlap.
 *
 * Reading order, top to bottom: what went wrong and how much of the batch it
 * hit (one line, because those are the two facts a reader weighs against each
 * other), then what it cost and where, then why the agent believes it, then the
 * clips, then the one instruction. A finding without a recommendation is an
 * observation, and the report does not ship those.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ReactNode } from 'react'
import { FindingSeverityTag, FindingStepTag, SEVERITY_STYLE } from '../atoms/FindingSeverityTag'
import type { UserTestClip, UserTestIssue } from '../../lib/types/userTest'

export interface ReportFindingRowProps {
  issue: UserTestIssue
  /** The clip currently previewing, when it belongs to this finding. */
  activeClip?: UserTestClip | null
  /** Hovering or focusing an evidence chip — a peek, replaced by the next one. */
  onPeekClip?: (clip: UserTestClip) => void
  onLeaveClip?: () => void
  /** Clicking one — pins it until the reader closes it. */
  onPinClip?: (clip: UserTestClip) => void
  /**
   * One more fact about who hit this finding, under the tags. An AI run fills
   * it with the persona split — which agents hit it, and how many of each —
   * because "6 of 20" means something different when all six are whales.
   */
  meta?: ReactNode
  /** What `affected / total` counts — "sessions" for people, "agents" for an AI run. */
  countNoun?: string
  /**
   * The colour a clip's source carries elsewhere in the run, used to tint its
   * evidence chip. An AI run passes the persona's tone, which ties each numbered
   * chip to the persona rows above it — so "which of these sixteen clips are the
   * whales" is answered by looking rather than by opening them one at a time.
   * Omitted for human runs, where a clip's device is not a grouping the reader
   * is tracking.
   */
  clipTone?: (clip: UserTestClip) => string | undefined
  className?: string
}

export function ReportFindingRow({
  issue,
  activeClip,
  onPeekClip,
  onLeaveClip,
  onPinClip,
  meta,
  countNoun = 'sessions',
  clipTone,
  className,
}: ReportFindingRowProps) {
  const tone = SEVERITY_STYLE[issue.severity]
  /* "1 / 1 agents" is wrong in the one case a run has a single agent or a single
     session, and that case is real — a smoke run is one player. The noun is
     given in the plural and shortened here, rather than asking every caller to
     pluralise a word it does not own. */
  const noun = issue.totalTesters === 1 ? countNoun.replace(/s$/, '') : countNoun
  return (
    <article
      className={['finding-row flex flex-col gap-s w-full px-xl py-l', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: 'var(--bg-elements)',
        /* Severity still marks the left edge — it is the axis the list is
           scanned on and a 60px tag cannot carry that at arm's length — but it
           marks the row rather than painting it. The colour is handed to CSS,
           which draws a fixed stub on the title's line; see .finding-row::before
           for why it is no longer a rule down the full height. */
        ['--finding-rail' as string]: tone.dot,
      }}
    >
      {/* Title and reach share the top line: they are the two things a reader
          weighs against each other — what went wrong, and how much of the batch
          it happened to — so they belong at the same level, not one above the
          other. The count sits right and reads at the title's size, which is
          what keeps it a headline fact rather than another tag. Everything that
          merely qualifies the finding — severity, the step — drops to the row
          beneath. */}
      <div className="flex flex-wrap items-baseline gap-s">
        <h4 className="flex-1 min-w-0 font-display text-m font-semibold text-text-primary leading-[1.45]">
          {issue.title}
        </h4>
        <span className="font-body text-m text-text-secondary leading-[1.45] whitespace-nowrap">
          <strong className="font-display font-semibold text-text-primary tabular-nums">
            {issue.affected} / {issue.totalTesters}
          </strong>{' '}
          {noun}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-xs">
        <FindingSeverityTag severity={issue.severity} />
        <FindingStepTag>{issue.stepLabel ?? issue.step}</FindingStepTag>
      </div>

      {meta}

      <p className="font-body text-m text-text-primary leading-[1.75] max-w-[86ch]">
        {issue.detail}
      </p>

      {issue.clips.length > 0 && (
        <div className="flex flex-wrap items-center gap-xs">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]">
            Evidence
          </span>
          {issue.clips.map((clip, i) => {
            const on = activeClip === clip
            const tone = clipTone?.(clip)
            return (
              <button
                key={`${clip.tester}-${i}`}
                type="button"
                onMouseEnter={() => onPeekClip?.(clip)}
                onMouseLeave={() => onLeaveClip?.()}
                onFocus={() => onPeekClip?.(clip)}
                onBlur={() => onLeaveClip?.()}
                onClick={() => onPinClip?.(clip)}
                aria-label={`Clip ${i + 1} — ${clip.tester}${tone ? `, ${clip.device}` : ''} at ${clip.timeRange}. ${clip.note}`}
                /* 28px of chip, 44px of target: the hit area is grown by a
                   transparent inset in CSS rather than by padding, so a row of
                   seven clips stays a row of seven small squares on a document
                   and still takes a thumb. */
                className="evidence-chip relative flex items-center justify-center w-7 h-7 rounded-s font-body text-s leading-none"
                /* Tinted from the persona's own colour rather than from a
                   second palette, so the chip and the rate row above it are
                   recognisably the same thing. The fill is kept faint — a grid
                   of sixteen solid swatches would out-shout the finding it is
                   evidence for — and the ink keeps the full colour so the tie
                   survives at 28px. The open clip still wins with the brand
                   treatment: which one you are watching outranks whose it is. */
                style={
                  on
                    ? {
                        border: '1px solid var(--border-tint)',
                        backgroundColor: 'var(--bg-tint-light)',
                        color: 'var(--text-brand)',
                      }
                    : tone
                      ? {
                          border: `1px solid color-mix(in srgb, ${tone} 35%, transparent)`,
                          backgroundColor: `color-mix(in srgb, ${tone} 12%, transparent)`,
                          color: tone,
                        }
                      : {
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                        }
                }
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      )}

      {/* A filled block, not a rule: the recommendation is the one line in the
          finding that is an instruction rather than an observation, and a tint
          says so before the label is read. No border — the fill is the edge,
          and a border here made it read as a card inside the card. */}
      <div
        className="flex flex-col gap-xxs rounded-xl px-l py-m mt-xs max-w-[86ch]"
        style={{ backgroundColor: 'var(--bg-tint-light)' }}
      >
        <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-brand leading-[1.5]">
          Recommendation
        </span>
        <span className="font-body text-m text-text-primary leading-[1.7]">
          {issue.recommendation}
        </span>
      </div>
    </article>
  )
}
