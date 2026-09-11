/**
 * RunFailedNotice — a run that stopped before it produced anything.
 *
 * Failure is stated the way a finding is: what stopped it, in one line, and
 * what survived (the sessions or recordings that were saved before it stopped),
 * so the reader knows whether there is anything worth opening. The only actions
 * are the two that make sense — run it again, or look at what was saved.
 *
 * Shared by all four tests so a failed run reads the same wherever it appears.
 *
 * Code-first prototype — no Figma source yet.
 */

import Button from '../ui/Button'
import type { TestRunHistoryItem } from '../../lib/types/testing'

export interface RunFailedNoticeProps {
  /** Why it stopped — one line. */
  reason: string
  /** What was kept — "14 of 20 sessions were saved before the run stopped." */
  saved?: string
  onRunAgain?: () => void
  /** Way into whatever survived — "Watch saved sessions". */
  secondary?: { label: string; onClick: () => void }
  className?: string
}

/** The one line a failed run shows; undefined for any run that did not fail. */
export function runFailureText(run: TestRunHistoryItem): string | undefined {
  if (run.state !== 'failed') return undefined
  return run.failure ?? 'The run stopped before it finished.'
}

export function RunFailedNotice({ reason, saved, onRunAgain, secondary, className }: RunFailedNoticeProps) {
  return (
    <div
      className={['flex items-start gap-m w-full rounded-2xl px-xl py-xl', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      role="alert"
    >
      <span
        className="flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-xl"
        style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}
        aria-hidden
      >
        <FailedGlyph />
      </span>
      <div className="flex flex-col gap-s min-w-0 flex-1">
        <div className="flex flex-col gap-xxs">
          <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">This run failed</span>
          <p className="font-body text-s text-text-secondary leading-[1.65] m-0 max-w-[80ch]">{reason}</p>
          {saved && <p className="font-body text-s text-text-tertiary leading-[1.6] m-0">{saved}</p>}
        </div>
        {(onRunAgain || secondary) && (
          <div className="flex items-center gap-xs pt-xxs">
            {onRunAgain && (
              <Button variant="primary" size="md" onClick={onRunAgain}>
                Run again
              </Button>
            )}
            {secondary && (
              <Button variant="secondary" size="md" onClick={secondary.onClick}>
                {secondary.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Exclamation in a ring — the failed glyph shared with the history tile. */
export function FailedGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5" />
      <path d="M12 16.2h.01" />
    </svg>
  )
}
