/**
 * AITextSummary — AI-generated session summary with yellow-highlighted bold phrases.
 * Figma: AI sparkle icon (3-star) + "AI Summary" (16px Bricolage Semibold, base-700)
 * + body text (14px Inter, base-700) with highlighted phrases using yellow bg (#fff176) + bold Bricolage.
 * Layout: flex-col, gap-[12px], pl=16, pr=32, pt=20.
 *
 * @figmaComponent  AI Summary
 * @figmaNode       366:21517
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=366-21517
 */

import { AISummaryIcon } from '../icons/section'
import { renderHighlightedText } from '../../lib/text/highlight'

interface AITextSummaryProps {
  text: string
  highlightedPhrases?: string[]
  className?: string
}

export function AITextSummary({ text, highlightedPhrases = [], className }: AITextSummaryProps) {
  return (
    <div
      className={['flex flex-col gap-s', className].filter(Boolean).join(' ')}
      style={{ paddingLeft: '16px', paddingRight: '32px', paddingTop: '20px' }}
    >
      {/* Title: sparkle + "AI Summary" — Figma: gap-[8px], 16px Bricolage Semibold, base-700 */}
      <div className="flex items-center gap-xs">
        <AISummaryIcon size={16} className="shrink-0" />
        <span
          className="font-display font-semibold whitespace-nowrap"
          style={{ fontSize: '16px', color: '#353D57', lineHeight: '1.5' }}
        >
          AI Summary
        </span>
      </div>

      {/* Body text — Figma: 14px Inter Regular, base-700 (#353D57) */}
      <p className="font-body text-s" style={{ color: '#353D57' }}>
        {renderHighlightedText(text, highlightedPhrases)}
      </p>
    </div>
  )
}
