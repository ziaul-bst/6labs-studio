/**
 * AIResponseOracle — Full AI response block for Oracle chat.
 * Anatomy:
 *   Response Container (white bg, rounded-3xl, border-subtle)
 *     ├── Response section (p-l, border-bottom)
 *     │   ├── SourcesGrid (collapsible, opens side panel)
 *     │   ├── Description (rich text / markdown content)
 *     │   └── ActionFeedbackBar (copy, credits, like/dislike)
 *     └── Related Container (p-l)
 *         └── 3× SuggestionCard
 *
 * @figmaComponent  AI response - Oracle
 * @figmaNode       6470:1506026
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6470-1506026
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SourcesGrid,
  type SourceItem,
  type SourceDoc,
  type SourceConnector,
} from '../molecules/SourcesGrid'
import { ActionFeedbackBar } from '../molecules/ActionFeedbackBar'
import { SuggestionCard } from '../molecules/SuggestionCard'
import { CitationPreview } from '../molecules/CitationPreview'
import { AgentPipelineLoader } from '../molecules/AgentPipelineLoader'
import { ORACLE_PIPELINE_STEPS, ORACLE_RESPONSE_MS } from '../../lib/mocks/oracle-pipeline'
import { useCitations } from '../../lib/hooks/useCitations'
import type { Citation } from '../../lib/types/citation'
import type { TranscriptSegment } from '../../lib/types/transcript'

type FeedbackValue = 'like' | 'dislike' | null

export interface OracleResponseData {
  id: string
  sources: SourceItem[]
  /** Uploaded docs cited by the response — shown as pills when Sources is expanded */
  docs?: SourceDoc[]
  /** Warehouse datasets cited by the response */
  connectors?: SourceConnector[]
  /** Total videos consulted, when the thumbnail row is only a sample */
  totalVideos?: number
  /** HTML string for rich-text response content */
  contentHtml: string
  creditsUsed: number
  relatedPrompts: string[]
  /**
   * Evidence behind the `[N]` chips in `contentHtml`. Chips are authored in the
   * HTML as `<button class="oracle-cite" data-cite="N">N</button>` and hydrated
   * by useCitations.
   */
  citations?: Citation[]
}

interface AIResponseOracleProps {
  response: OracleResponseData
  /** Whether the response is still loading (shows shimmer) */
  isLoading?: boolean
  onExpandSources: () => void
  /** Opens one cited video. Index is its position in `response.sources`. */
  onSourceClick?: (source: SourceItem, index: number) => void
  /** Adds the "See all in Gameplay Library" row under the sources. */
  onOpenLibrary?: () => void
  onSuggestionClick: (text: string) => void
  onDislike: () => void
  /** Resolves a video citation's segments so the preview can show narration */
  resolveSegments?: (videoId: string, segmentIds: string[]) => TranscriptSegment[]
  /** Clicking a chip or the preview's open action — deep-links to the evidence */
  onOpenCitation?: (citation: Citation) => void
  className?: string
}

export function AIResponseOracle({
  response,
  isLoading,
  onExpandSources,
  onSourceClick,
  onOpenLibrary,
  onSuggestionClick,
  onDislike,
  resolveSegments,
  onOpenCitation,
  className,
}: AIResponseOracleProps) {
  const [feedbackValue, setFeedbackValue] = useState<FeedbackValue>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  /* Pipeline position while the answer resolves. Declared before the loading
     early-return below — a hook added after it would unmount on the very
     transition it exists for. */
  const [pipelineStep, setPipelineStep] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setPipelineStep(0)
      return
    }
    /* Paced against the answer's own delay rather than a fixed tick, so the
       last step is still running when the response arrives instead of the
       pipeline sitting complete for a second or two. */
    const per = ORACLE_RESPONSE_MS / (ORACLE_PIPELINE_STEPS.length + 1)
    const id = setInterval(() => {
      setPipelineStep((s) => Math.min(s + 1, ORACLE_PIPELINE_STEPS.length - 1))
    }, per)
    return () => clearInterval(id)
  }, [isLoading])

  const handleOpenCitation = useCallback(
    (citation: Citation) => onOpenCitation?.(citation),
    [onOpenCitation],
  )

  const { active, close, setOverCard } = useCitations(
    contentRef,
    response.citations ?? [],
    handleOpenCitation,
  )

  const handleFeedbackChange = (value: FeedbackValue) => {
    setFeedbackValue(value)
    if (value === 'dislike') {
      onDislike()
    }
  }

  const handleCopy = () => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = response.contentHtml
    // Citation chips are prose furniture, not content — otherwise copied text
    // reads "…23 deaths in 11 minutes28, and another…".
    tempDiv.querySelectorAll('[data-cite]').forEach((chip) => chip.remove())
    const text = tempDiv.textContent || tempDiv.innerText || ''
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    /* The pipeline stepper, not the one-line "Thinking…" state: a nine-second
       wait with a single spinner reads as a hang, and the steps are the honest
       account of what Oracle is doing — which agent it consulted, how many
       sessions it kept. Same card as the answer that replaces it, so the block
       does not change shape underneath the reader. */
    return (
      <div className={['flex flex-col items-start pb-l w-full', className].filter(Boolean).join(' ')}>
        <div
          className="flex flex-col items-start overflow-hidden rounded-3xl w-full bg-bg-elements"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <AgentPipelineLoader steps={ORACLE_PIPELINE_STEPS} currentStep={pipelineStep} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={['flex flex-col gap-[10px] items-start pb-l w-full', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="flex flex-col items-start overflow-hidden rounded-3xl w-full bg-bg-elements"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        {/* Response section — sources + description + actions */}
        <div
          className="flex flex-col gap-m items-start p-l w-full"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          {/* Sources grid */}
          {(response.sources.length > 0 ||
            (response.docs?.length ?? 0) > 0 ||
            (response.connectors?.length ?? 0) > 0) && (
            <SourcesGrid
              sources={response.sources}
              docs={response.docs}
              connectors={response.connectors}
              totalVideos={response.totalVideos}
              onExpandSources={onExpandSources}
              onSourceClick={onSourceClick}
              onOpenLibrary={onOpenLibrary}
            />
          )}

          {/* Response text content — `[N]` chips inside are hydrated by useCitations */}
          <div
            ref={contentRef}
            className="font-body text-s font-normal leading-[1.5] text-text-secondary w-full oracle-response-content"
            dangerouslySetInnerHTML={{ __html: response.contentHtml }}
          />

          {active && (
            <CitationPreview
              active={active}
              resolveSegments={resolveSegments ?? (() => [])}
              onOpen={() => {
                close()
                handleOpenCitation(active.citation)
              }}
              onPointerEnter={() => setOverCard(true)}
              onPointerLeave={() => setOverCard(false)}
            />
          )}

          {/* Action bar */}
          <ActionFeedbackBar
            creditsText={`${response.creditsUsed} Credits Used`}
            feedbackValue={feedbackValue}
            onFeedbackChange={handleFeedbackChange}
            onCopy={handleCopy}
          />
        </div>

        {/* Related prompts section */}
        {response.relatedPrompts.length > 0 && (
          <div className="flex flex-col items-start overflow-hidden p-l w-full">
            <div className="flex flex-col gap-s items-start w-full">
              <span className="font-display text-m font-semibold leading-[1.5] text-text-primary">
                Related
              </span>
              {response.relatedPrompts.map((prompt) => (
                <SuggestionCard
                  key={prompt}
                  text={prompt}
                  onClick={onSuggestionClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
