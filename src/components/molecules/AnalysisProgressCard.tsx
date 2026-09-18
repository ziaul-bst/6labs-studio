/**
 * AnalysisProgressCard — a run in flight.
 *
 * One line of status (what is happening, how far, how long left), then the
 * items being worked through as a grid of dots: done ✓, busy spinning, waiting
 * hollow. The grid is the honest view of a batch job — it shows *which* session
 * the agent is on, not just a percentage — and it is what makes a 25-minute
 * wait tolerable. A "Skip wait" link is prototype-only and says so.
 *
 * Code-first prototype — no Figma source yet.
 */

import { ProgressBar } from '../atoms/ProgressBar'
import { Spinner } from '../atoms/Spinner'
import { CheckIcon } from '../icons/CheckIcon'

export interface AnalysisProgressCardProps {
  /** "3 of 10 analysed", "Starting…", "AI players executing…" */
  label: string
  /** 0–100 */
  percent: number
  /** "~25 min", "done" */
  eta: string
  items: string[]
  /** Index of the item in progress; everything before it is done. */
  currentIndex: number
  /** Interim note posted mid-run. */
  soFar?: { title: string; body: string } | null
  onSkip?: () => void
  /** Bare — no card chrome — for embedding inside a chat bubble. */
  bare?: boolean
  className?: string
}

export function AnalysisProgressCard({
  label,
  percent,
  eta,
  items,
  currentIndex,
  soFar,
  onSkip,
  bare = false,
  className,
}: AnalysisProgressCardProps) {
  return (
    <div
      className={['flex flex-col gap-s w-full', bare ? '' : 'rounded-2xl px-l py-m', className]
        .filter(Boolean)
        .join(' ')}
      style={bare ? undefined : { backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center gap-s w-full">
        <span className="font-display text-s font-semibold text-text-primary leading-[1.5] whitespace-nowrap">
          {label}
        </span>
        <ProgressBar value={percent} className="flex-1" />
        <span className="font-body text-xs text-text-tertiary leading-[1.5] whitespace-nowrap">{eta}</span>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="font-body text-xs font-semibold text-text-brand hover:underline whitespace-nowrap"
          >
            Skip wait (demo)
          </button>
        )}
      </div>

      <ul className="grid gap-x-m gap-y-xs list-none m-0 p-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {items.map((item, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'busy' : 'waiting'
          return (
            <li key={item} className="flex items-center gap-xs min-w-0">
              {state === 'done' ? (
                <span
                  className="flex items-center justify-center shrink-0 w-[14px] h-[14px] rounded-round text-white"
                  style={{ backgroundColor: 'var(--success)' }}
                  aria-hidden
                >
                  <CheckIcon size={12} />
                </span>
              ) : state === 'busy' ? (
                <span className="flex items-center justify-center shrink-0 w-[14px] h-[14px]" aria-hidden>
                  <Spinner size={12} tone="brand" />
                </span>
              ) : (
                <span
                  className="shrink-0 w-[14px] h-[14px] rounded-round"
                  style={{ border: '1.5px solid var(--border-default)' }}
                  aria-hidden
                />
              )}
              <span
                className="font-body text-xs leading-[1.5] truncate"
                style={{
                  color:
                    state === 'done'
                      ? 'var(--text-primary)'
                      : state === 'busy'
                        ? 'var(--text-secondary)'
                        : 'var(--text-tertiary)',
                }}
              >
                {item}
              </span>
            </li>
          )
        })}
      </ul>

      {soFar && (
        <div
          className="flex flex-col gap-xxxs pt-s font-body text-s leading-[1.6] text-text-secondary"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="font-display font-semibold text-text-primary">{soFar.title}</span>
          <span>{soFar.body}</span>
        </div>
      )}
    </div>
  )
}
