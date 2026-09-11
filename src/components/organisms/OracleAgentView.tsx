/**
 * OracleAgentView — Multi-state Oracle agent page.
 * States: idle (input + suggestions) → loading → result (chat + panels).
 *
 * Figma frames:
 *   - Oracle Page (idle): 6470:1522882
 *   - Oracle Result - Agent Page (result): 6470:1506015
 *   - Oracle Result - Loading (loading): 6470:1506095
 *   - Oracle Result - Agent Page - Sources Side Panel: 6470:1506197
 *
 * @figmaComponent  Oracle Page
 * @figmaPath       Other agents / Oracle Page
 * @figmaNode       6418:100887
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6418-100887
 *
 * Source: 6labs/studio → src/components/organisms/OracleAgentView.tsx
 * Synced: 2026-04-13
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { AgentPageHeader } from '../molecules/AgentPageHeader'
import { SuggestionCard } from '../molecules/SuggestionCard'
import { OracleIcon } from '../icons/OracleIcon'
import InputFieldConsole from '../ui/InputFieldConsole'
import { OracleChatView, type ChatMessage } from './OracleChatView'
import { SourcesSidePanel } from './SourcesSidePanel'
import { SessionSidePanel } from './SessionSidePanel'
import { ShareFeedbackDialog } from '../molecules/ShareFeedbackDialog'
import { FeedbackSubmittedDialog } from '../molecules/FeedbackSubmittedDialog'
import { PageTopbar } from '../molecules/PageTopbar'
import { ExportMenu } from '../molecules/ExportMenu'
import type { OracleViewState } from '../../lib/types/oracle'
import type { SessionData } from '../../lib/types/radiologist'
import type { SourceItem } from '../molecules/SourcesGrid'
import type { Citation } from '../../lib/types/citation'
import { MOCK_SESSIONS } from '../../lib/mocks/radiologist-sessions'
import { MOCK_EXCERPTS } from '../../lib/mocks/excerpts'
import { ORACLE_RESPONSE_MS } from '../../lib/mocks/oracle-pipeline'

const ORACLE_GRADIENT =
  'radial-gradient(circle at 60% 55%, #05C290 0%, #0E99BF 50%, #1770EF 100%)'

/**
 * Evidence behind the `[N]` chips in the mock response below.
 *
 * Video citations point at real MOCK_SESSIONS transcript segments so hovering a
 * chip shows the actual narration and clicking it deep-links to that moment.
 * Segment ids follow `${sessionId}:${startSec}` at 7-second steps.
 */
const MOCK_CITATIONS: Citation[] = [
  {
    n: 1,
    kind: 'video',
    videoId: 'Session #2847',
    segmentIds: ['Session #2847:14', 'Session #2847:21'],
    label: 'Tutorial Run — Player 847',
  },
  {
    n: 2,
    kind: 'video',
    videoId: 'Session #2846',
    segmentIds: ['Session #2846:56'],
    label: 'Tutorial Run — Player 1203',
  },
  {
    n: 3,
    kind: 'video',
    videoId: 'Session #2845',
    segmentIds: ['Session #2845:105', 'Session #2845:112'],
    label: 'Tutorial Run — Player 562',
  },
  {
    n: 4,
    kind: 'video',
    videoId: 'Session #2844',
    segmentIds: ['Session #2844:35'],
    label: 'Ranked Match — Player 847',
  },
  {
    n: 5,
    kind: 'video',
    videoId: 'Session #2843',
    segmentIds: ['Session #2843:70'],
    label: 'Clash Squad — Player 991',
  },
  {
    n: 6,
    kind: 'table',
    tableFqn: 'PLATSH.PLATSH.TUTORIAL_FUNNEL',
    warehouse: 'Snowflake',
    columns: ['step', 'reached', 'drop_off'],
    rows: [
      { step: 'grenade_throw', reached: '4,182', drop_off: '23.0%' },
      { step: 'inventory', reached: '3,220', drop_off: '9.4%' },
    ],
    highlightCell: { column: 'drop_off', value: '23.0%' },
    totalRows: 12,
  },
]

/** Resolves a video citation's segment ids to their narration text. */
function resolveSegments(videoId: string, segmentIds: string[]) {
  const session = MOCK_SESSIONS.find((sess) => sess.sessionId === videoId)
  if (!session?.transcript) return []
  const wanted = new Set(segmentIds)
  return session.transcript.filter((seg) => wanted.has(seg.id))
}

const SUGGESTIONS = [
  'Show the top five most intense close-range fights.',
  "Summarize the player's rotations: drop spot, key moves, final zone path.",
  'List all loot and upgrade moments and gloo wall usage.',
  'Where did the player lose the most HP, and what caused it?',
]


interface OracleAgentViewProps {
  className?: string
  /**
   * Deep-links to the evidence behind an Oracle citation. Video citations land
   * on the session details page, Transcript tab, scoped to the cited moments.
   */
  onOpenCitation?: (citation: Citation) => void
  /** Called when a new query is submitted — adds to sidebar history */
  onQuerySubmit?: (id: string, query: string) => void
  /** Called when AI response completes — marks history item as complete */
  onQueryComplete?: (id: string) => void
  /** When set, loads this thread's conversation */
  activeThreadId?: string | null
  /**
   * Thread store lifted to the parent. Supplied so conversations survive this
   * view unmounting — navigating to a citation's evidence swaps `activeNav`,
   * which would otherwise destroy the thread the user is coming back to.
   * Falls back to internal state when omitted.
   */
  threadStore?: Record<string, ChatMessage[]>
  onThreadStoreChange?: (next: Record<string, ChatMessage[]>) => void
  /**
   * Drive the Oracle query from outside the view (e.g. Barista sending a
   * suggested question). Whenever this value changes to a non-empty string
   * different from the last one we processed, Oracle will auto-submit it.
   */
  externalQuery?: string | null
  /** Fires once Oracle's response simulation finishes for an external query. */
  onExternalQueryComplete?: (query: string) => void
  /**
   * Leaves the open thread and returns to the query launcher. Without it the
   * chat-details header has a back chevron that goes nowhere.
   */
  onExitThread?: () => void
  /**
   * Leaves for the Gameplay Library — offered under an answer's sources, for
   * the footage behind it that the 3-up row could not show.
   */
  onOpenLibrary?: () => void
}

export function OracleAgentView({
  className,
  onOpenCitation,
  onQuerySubmit,
  onQueryComplete,
  activeThreadId,
  threadStore,
  onThreadStoreChange,
  externalQuery,
  onExternalQueryComplete,
  onExitThread,
  onOpenLibrary,
}: OracleAgentViewProps) {
  const [viewState, setViewState] = useState<OracleViewState>('idle')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  /** All threads stored by ID — parent-owned when threadStore is supplied */
  const [internalThreads, setInternalThreads] = useState<Record<string, ChatMessage[]>>({})
  const threads = threadStore ?? internalThreads
  const setThreads = useCallback(
    (updater: (prev: Record<string, ChatMessage[]>) => Record<string, ChatMessage[]>) => {
      if (threadStore && onThreadStoreChange) onThreadStoreChange(updater(threadStore))
      else setInternalThreads(updater)
    },
    [threadStore, onThreadStoreChange],
  )
  /** ID of the current thread's history entry — null means next submit creates a new one */
  const [threadHistoryId, setThreadHistoryId] = useState<string | null>(null)

  // Save current thread to store when messages change
  useEffect(() => {
    if (threadHistoryId && messages.length > 0) {
      setThreads((prev) => ({ ...prev, [threadHistoryId]: messages }))
    }
  }, [messages, threadHistoryId])

  // Load thread when activeThreadId changes from parent —
  // skip if we're already on that thread (avoids overwriting in-flight responses)
  useEffect(() => {
    if (!activeThreadId || activeThreadId === threadHistoryId) return
    const stored = threads[activeThreadId]
    if (stored) {
      setMessages(stored)
      setThreadHistoryId(activeThreadId)
      setViewState('result')
    }
  }, [activeThreadId, threads])
  const [sourcesPanelOpen, setSourcesPanelOpen] = useState(false)
  const [sessionPanelOpen, setSessionPanelOpen] = useState(false)
  const [activeSession, setActiveSession] = useState<SessionData | null>(null)
  /**
   * Videos backing the current response. Was an empty array that nothing ever
   * populated, which left the Sources panel blank and made the session panel —
   * and with it the excerpt — unreachable from Oracle.
   */
  const sourceSessions: SessionData[] = MOCK_SESSIONS.slice(0, 3)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackSubmittedOpen, setFeedbackSubmittedOpen] = useState(false)

  const submitInternal = useCallback((text: string, externalSource?: string) => {
    if (!text.trim()) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: text,
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      isLoading: true,
      response: {
        id: `resp-${Date.now()}`,
        sources: [],
        contentHtml: '',
        creditsUsed: 0,
        relatedPrompts: [],
      },
    }

    const isFirstMessage = threadHistoryId === null
    const historyId = isFirstMessage ? userMsg.id : threadHistoryId

    setMessages((prev) => [...prev, userMsg, aiMsg])
    setViewState('loading')
    setQuery('')

    // Only create a new history entry for the first message in a thread
    if (isFirstMessage) {
      setThreadHistoryId(historyId)
      onQuerySubmit?.(historyId, text)
    }

    // Simulate AI response (replace with real API call)
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id
            ? {
                ...m,
                isLoading: false,
                response: {
                  id: aiMsg.response!.id,
                  sources: [
                    { id: 's1', duration: '4:05', title: 'Tutorial Run — Player 847' },
                    { id: 's2', duration: '3:22', title: 'Tutorial Run — Player 1203' },
                    { id: 's3', duration: '5:10', title: 'Tutorial Run — Player 562' },
                  ],
                  docs: [
                    { id: 'd1', label: 'FreeFire_GDD_v3' },
                    { id: 'd2', label: 'Monetization_playbook' },
                  ],
                  connectors: [
                    { id: 'c1', label: 'labs_demo 1', kind: 'snowflake' },
                    { id: 'c2', label: 'labs_demo 1', kind: 'bigquery' },
                  ],
                  totalVideos: 58,
                  contentHtml: `
                    <p>5 Major Friction Points Identified (Tutorial completion rate: 67%)</p>
                    <p><strong>Biggest Problem: Grenade Throwing</strong></p>
                    <ul>
                      <li>73% fail on first attempt, average 3.2 tries to complete <button class="oracle-cite" data-cite="1">1</button><button class="oracle-cite" data-cite="3">3</button></li>
                      <li>23% abandon tutorial here (largest drop-off point) <button class="oracle-cite" data-cite="6">6</button></li>
                      <li>Issue: Trajectory line barely visible, unclear success zone, instruction appears for only 2 seconds <button class="oracle-cite" data-cite="1">1</button></li>
                    </ul>
                    <p><strong>Inventory Management</strong></p>
                    <ul>
                      <li>51% take 40+ seconds to equip weapon (should be ~10 sec) <button class="oracle-cite" data-cite="3">3</button><button class="oracle-cite" data-cite="4">4</button><button class="oracle-cite" data-cite="5">5</button></li>
                      <li>Issue: Players don't understand tap vs drag, weapon slots unclear <button class="oracle-cite" data-cite="3">3</button></li>
                    </ul>
                    <p><strong>Aiming</strong></p>
                    <ul>
                      <li>47% fire from hip instead of using ADS <button class="oracle-cite" data-cite="2">2</button></li>
                      <li>Issue: Button highlighted but players focused elsewhere, can progress without using it <button class="oracle-cite" data-cite="2">2</button><button class="oracle-cite" data-cite="4">4</button></li>
                    </ul>
                    <p><strong>Vehicle Controls</strong></p>
                    <ul>
                      <li>34% crash immediately, 29% drive wrong direction</li>
                      <li>Issue: Control scheme changes but no notification, button positions conflict with muscle memory</li>
                    </ul>
                    <p><strong>Healing Items</strong></p>
                    <ul>
                      <li>28% open wrong menu, 15% use wrong item</li>
                      <li>Issue: Multiple heal UIs confusing, animation interruption not explained</li>
                    </ul>
                    <p><strong>Bottom Line:</strong> Grenade section causes 23% abandonment. Fix this first — clearer visuals, longer instructions, better feedback.</p>
                  `,
                  creditsUsed: 20,
                  citations: MOCK_CITATIONS,
                  relatedPrompts: [
                    'How many players who completed tutorials still struggle with these mechanics in their first real match?',
                    'Show me players who abandoned tutorials but succeeded in real matches — how did they learn?',
                    'Find me top 3 videos where users failed to complete tutorials terribly',
                  ],
                },
              }
            : m,
        ),
      )
      setViewState('result')
      onQueryComplete?.(historyId)
      if (externalSource) onExternalQueryComplete?.(externalSource)
    }, ORACLE_RESPONSE_MS)
  }, [threadHistoryId, onQuerySubmit, onQueryComplete, onExternalQueryComplete])

  const handleSubmit = useCallback(() => {
    submitInternal(query)
  }, [query, submitInternal])

  // Watch for externally-driven queries (e.g. Barista). Only submit each
  // new value once.
  const submittedExternalRef = useRef<string | null>(null)
  useEffect(() => {
    if (externalQuery && externalQuery !== submittedExternalRef.current) {
      submittedExternalRef.current = externalQuery
      submitInternal(externalQuery, externalQuery)
    }
  }, [externalQuery, submitInternal])

  const handleSuggestionClick = useCallback((text: string) => {
    setQuery(text)
  }, [])

  const handleExpandSources = useCallback((_responseId: string) => {
    setSourcesPanelOpen(true)
    setSessionPanelOpen(false)
  }, [])

  const handleSourceClick = useCallback((session: SessionData) => {
    setActiveSession(session)
    setSourcesPanelOpen(false)
    setSessionPanelOpen(true)
  }, [])

  /* A thumbnail in the answer's sources row opens that video directly. Sources
     and `sourceSessions` are parallel lists, so position is the join; anything
     past the end falls back to the panel rather than opening the wrong clip. */
  const handleSourceThumbClick = useCallback(
    (_source: SourceItem, index: number) => {
      const session = sourceSessions[index]
      if (!session) {
        setSourcesPanelOpen(true)
        setSessionPanelOpen(false)
        return
      }
      handleSourceClick(session)
    },
    [sourceSessions, handleSourceClick],
  )

  const handleDislike = useCallback((_responseId: string) => {
    setFeedbackDialogOpen(true)
  }, [])

  const handleFeedbackSubmit = useCallback((_data: { tags: string[]; message: string }) => {
    setFeedbackDialogOpen(false)
    setFeedbackSubmittedOpen(true)
  }, [])

  const handleClosePanels = useCallback(() => {
    setSourcesPanelOpen(false)
    setSessionPanelOpen(false)
    setActiveSession(null)
  }, [])

  // ─── Idle state: header + input + suggestions ───
  if (viewState === 'idle') {
    return (
      <div
        className={[
          'flex flex-col items-center pt-[120px] pb-[64px] w-full',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex flex-col gap-xxxl items-start page-measure">
        <AgentPageHeader
          title="Oracle"
          description="Ask complex questions about player behavior across sessions and cohorts"
          iconGradient={ORACLE_GRADIENT}
          icon={<OracleIcon size={40} />}
        />

        <InputFieldConsole
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          placeholder="Type in a prompt or select a suggested prompt. e.g., Summarize the video and provide timecode"
        />

        <div className="flex flex-col gap-s items-start w-full">
          <p className="font-display text-xs font-semibold text-base-500 text-center w-full leading-[1.5]">
            Try our suggested prompts
          </p>
          <div className="grid grid-cols-2 grid-rows-[72px_72px] gap-s w-full">
            {SUGGESTIONS.map((text) => (
              <SuggestionCard
                key={text}
                text={text}
                onClick={handleSuggestionClick}
              />
            ))}
          </div>
        </div>
        </div>
      </div>
    )
  }

  /** The question that opened the thread — the thread's name, effectively. */
  const threadTitle =
    messages.find((m) => m.type === 'user')?.text ?? 'Oracle'

  // ─── Loading / Result state: [topbar + content] | side panel ───
  // Side panel spans full height; topbar is inside the content column only.
  return (
    <div className={['flex h-full w-full', className].filter(Boolean).join(' ')}>
      {/* Left: header + chat */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        {/* Chat-details header — identity and thread-level actions. Sits above
            the view tabs: this row says which thread you are in, the tabs say
            which view of it you are looking at. */}
        <PageTopbar
          title={threadTitle}
          onBack={() => onExitThread?.()}
          actions={<ExportMenu />}
        />

        {/* Tab content */}
        <div className="flex-1 min-h-0">
          <OracleChatView
            messages={messages}
            inputValue={query}
            onInputChange={setQuery}
            onSubmit={handleSubmit}
            onExpandSources={handleExpandSources}
            onSourceClick={handleSourceThumbClick}
            onOpenLibrary={onOpenLibrary}
            onSuggestionClick={handleSuggestionClick}
            onDislike={handleDislike}
            resolveSegments={resolveSegments}
            onOpenCitation={onOpenCitation}
            className="h-full"
          />
        </div>
      </div>

      {/* Right: side panels — full height, beside topbar+content column */}
      {sourcesPanelOpen && (
        <SourcesSidePanel
          sources={sourceSessions}
          onClose={handleClosePanels}
          onSourceClick={handleSourceClick}
        />
      )}
      {sessionPanelOpen && activeSession && (
        <SessionSidePanel
          session={activeSession}
          onClose={handleClosePanels}
          onViewDetail={() => {}}
          /* Opened from an Oracle source, so the excerpt leads the panel body. */
          excerpt={MOCK_EXCERPTS['attributes-text']}
        />
      )}

      {/* Feedback dialogs (portals — outside layout flow) */}
      <ShareFeedbackDialog
        isOpen={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
      <FeedbackSubmittedDialog
        isOpen={feedbackSubmittedOpen}
        onClose={() => setFeedbackSubmittedOpen(false)}
      />
    </div>
  )
}
