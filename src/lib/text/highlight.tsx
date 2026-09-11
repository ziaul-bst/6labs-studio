/**
 * Shared phrase highlighting — one treatment for every place the product marks
 * text as "this is the bit that matters".
 *
 * Three consumers:
 *   - AI summary phrases (AITextSummary)
 *   - Transcript search matches (TranscriptRow)
 *   - Cited spans arrived at from an Oracle citation (TranscriptRow)
 *
 * Extracted from AITextSummary, which previously owned it privately and
 * hardcoded the highlight colour.
 */
import type { ReactNode } from 'react'

function escapeForRegex(phrase: string): string {
  return phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Split `text` on `phrases` and wrap each match in a highlight span.
 * Matching is case-insensitive; phrases need not appear in order.
 */
export function renderHighlightedText(text: string, phrases: string[] = []): ReactNode {
  const usable = phrases.filter((p) => p.trim().length > 0)
  if (!usable.length) return <span className="leading-[1.5]">{text}</span>

  const pattern = usable.map(escapeForRegex).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) => {
    const isHighlighted = usable.some((p) => p.toLowerCase() === part.toLowerCase())
    return isHighlighted ? (
      <span
        key={i}
        className="font-display font-semibold leading-[1.5]"
        style={{ backgroundColor: 'var(--highlight-match)' }}
      >
        {part}
      </span>
    ) : (
      <span key={i} className="leading-[1.5]">
        {part}
      </span>
    )
  })
}

/** True when any of `phrases` occurs in `text`. Used to count search matches. */
export function containsPhrase(text: string, phrases: string[] = []): boolean {
  const usable = phrases.filter((p) => p.trim().length > 0)
  if (!usable.length) return false
  const lower = text.toLowerCase()
  return usable.some((p) => lower.includes(p.toLowerCase()))
}
