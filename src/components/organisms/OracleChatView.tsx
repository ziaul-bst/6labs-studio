/**
 * OracleChatView — Chat container for Oracle results.
 * Layout: scrollable messages area + fixed input console at bottom.
 * Messages scroll behind the input console (input stays pinned).
 *
 * Anatomy (from Figma):
 *   Chat Container (1160 × 744, VERTICAL)
 *     ├── Scroll View (flex-1, overflow-y-auto)
 *     │   ├── UserPrompt(s)
 *     │   └── AIResponseOracle(s)
 *     └── Prompt Container (shrink-0, px-[200], py-[16])
 *         └── InputFieldConsole (760px wide, centered)
 *
 * @figmaComponent  Chat Container
 * @figmaNode       6470:1506015
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6470-1506015
 */

import { useRef, useEffect } from 'react'
import { UserPrompt } from '../atoms/UserPrompt'
import { AIResponseOracle, type OracleResponseData } from './AIResponseOracle'
import InputFieldConsole from '../ui/InputFieldConsole'
import type { SourceItem } from '../molecules/SourcesGrid'
import type { Citation } from '../../lib/types/citation'
import type { TranscriptSegment } from '../../lib/types/transcript'

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  /** User message text */
  text?: string
  /** AI response data */
  response?: OracleResponseData
  /** Whether this AI response is still loading */
  isLoading?: boolean
}

interface OracleChatViewProps {
  messages: ChatMessage[]
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  onExpandSources: (responseId: string) => void
  /** Opens one cited video from the sources row. */
  onSourceClick?: (source: SourceItem, index: number) => void
  /** Adds the "See all in Gameplay Library" row under the sources. */
  onOpenLibrary?: () => void
  onSuggestionClick: (text: string) => void
  onDislike: (responseId: string) => void
  /** Resolves a video citation's segments so previews can show narration */
  resolveSegments?: (videoId: string, segmentIds: string[]) => TranscriptSegment[]
  /** Deep-links to the evidence behind a citation */
  onOpenCitation?: (citation: Citation) => void
  className?: string
}

export function OracleChatView({
  messages,
  inputValue,
  onInputChange,
  onSubmit,
  onExpandSources,
  onSourceClick,
  onOpenLibrary,
  onSuggestionClick,
  onDislike,
  resolveSegments,
  onOpenCitation,
  className,
}: OracleChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      className={['relative h-full w-full', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Scroll View — messages area, padded at bottom so content can scroll behind input */}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden flyout-scrollbar page-scroll"
      >
        <div className="flex flex-col gap-l items-center pt-xxl pb-[200px] page-measure">
          {messages.map((msg) => {
            if (msg.type === 'user' && msg.text) {
              return (
                <UserPrompt key={msg.id} text={msg.text} />
              )
            }
            if (msg.type === 'ai' && msg.response) {
              return (
                <AIResponseOracle
                  key={msg.id}
                  response={msg.response}
                  isLoading={msg.isLoading}
                  onExpandSources={() => onExpandSources(msg.response!.id)}
                  onSourceClick={onSourceClick}
                  onOpenLibrary={onOpenLibrary}
                  onSuggestionClick={onSuggestionClick}
                  onDislike={() => onDislike(msg.response!.id)}
                  resolveSegments={resolveSegments}
                  onOpenCitation={onOpenCitation}
                />
              )
            }
            return null
          })}
        </div>
      </div>

      {/* Prompt Container — pinned to bottom, content scrolls behind it */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-m w-full oracle-input-overlay">
        <InputFieldConsole
          value={inputValue}
          onChange={onInputChange}
          onSubmit={onSubmit}
          placeholder="Ask a follow-up question..."
          className="page-measure"
        />
      </div>
    </div>
  )
}
