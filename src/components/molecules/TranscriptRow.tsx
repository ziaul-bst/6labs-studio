/**
 * TranscriptRow — one narration line in a transcript.
 *
 * Anatomy: 48px tabular-figure timestamp gutter + narration text. Clicking the
 * row seeks the video to `startSec`. The row containing the playhead carries
 * `aria-current="true"`; a row arrived at from an Oracle citation flashes once.
 *
 * Code-first prototype — no Figma source yet.
 */
import { renderHighlightedText } from '../../lib/text/highlight'
import { formatClock } from '../../lib/mocks/transcript'

interface TranscriptRowProps {
  startSec: number
  text: string
  /** Phrases to highlight — search matches or a cited span */
  highlightedPhrases?: string[]
  /** True when the playhead sits inside this segment */
  isCurrent?: boolean
  /** True for one render after arriving here from a citation */
  isFlashing?: boolean
  onClick?: () => void
  className?: string
}

export function TranscriptRow({
  startSec,
  text,
  highlightedPhrases,
  isCurrent,
  isFlashing,
  onClick,
  className,
}: TranscriptRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={isCurrent ? 'true' : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={[
        'transcript-row flex gap-s items-baseline py-xs px-xs',
        isFlashing ? 'transcript-row-flash' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className="font-code text-xs shrink-0 w-[40px] tabular-nums"
        style={{ color: isCurrent ? 'var(--brand)' : 'var(--text-tertiary)' }}
      >
        {formatClock(startSec)}
      </span>
      <p
        className="font-body text-s min-w-0 flex-1"
        style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
      >
        {renderHighlightedText(text, highlightedPhrases)}
      </p>
    </div>
  )
}
