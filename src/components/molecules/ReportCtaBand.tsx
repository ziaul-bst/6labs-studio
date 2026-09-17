/**
 * ReportCtaBand — the way down from a finished run to its full report.
 *
 * One band, used by both screens that end on this offer: the run page, and the
 * report card posted in the run thread. They had written it twice and it had
 * drifted — the run page said "View full report · All 7 findings, their clips
 * and a recommendation" on a brand-tinted band, and the thread said "3 more
 * findings, every clip, by tester and by game step" on a pale one with a second
 * button beside it. Same run, same destination, two different offers, and the
 * thread's copy counted only the findings it had not already listed, so the
 * number changed depending on which screen you read it from.
 *
 * It takes the message's whole width, the brand tint and a primary button,
 * rather than sitting inset and pale like a footnote: on a finished run this is
 * the one thing the message is asking you to do.
 *
 * Code-first prototype — no Figma source yet.
 */

import Button from '../ui/Button'
import { ChevronRightIcon } from '../icons/ChevronRightIcon'

export interface ReportCtaBandProps {
  /** Findings in the report — the count the description leads with. */
  findingCount: number
  onOpenReport?: () => void
}

export function ReportCtaBand({ findingCount, onOpenReport }: ReportCtaBandProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-m px-l py-m"
      style={{
        borderTop: '1px solid var(--border-tint)',
        background: 'linear-gradient(90deg, var(--bg-tint) 0%, var(--bg-tint-light) 100%)',
      }}
    >
      <span
        className="flex items-center justify-center shrink-0 w-10 h-10 rounded-m text-white"
        style={{
          background: 'linear-gradient(135deg, #4D8FF5 0%, #1770EF 100%)',
          boxShadow: 'var(--shadow-sm)',
        }}
        aria-hidden
      >
        <ReportGlyph />
      </span>
      <span className="flex flex-col gap-xxxs flex-1 min-w-[220px]">
        <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">
          View full report
        </span>
        {/* The whole count, not "3 more". A reader who has just scrolled four
            findings knows there were four; what they need is the size of the
            thing they are about to open. */}
        <span className="font-body text-s text-text-secondary leading-[1.5]">
          All {findingCount} findings, their clips and a recommendation — grouped by what you would
          fix together.
        </span>
      </span>
      <Button
        variant="primary"
        size="md"
        onClick={onOpenReport}
        rightIcon={<ChevronRightIcon size={16} />}
      >
        Open the full report
      </Button>
    </div>
  )
}

function ReportGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6M10 17h6" />
    </svg>
  )
}
