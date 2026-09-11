/**
 * SessionSidePanel — Right-side flyout panel showing session details.
 * Built from Figma design context of node 6453:1472353.
 *
 * Layout (from Figma deep tree walk):
 *   Panel (420px, VERTICAL, bg=elements, border-left=base-50, isolate)
 *     ├── Header (56px, px=16, py=20, border-bottom=base-50, z=4)
 *     │   ├── Title (session name, 14px Bricolage Semibold, base-700)
 *     │   └── Action (Button "View in detail" Translucent + Button close icon)
 *     ├── Gallery (px=16, pt=20, gap=16, clip, z=3)
 *     │   ├── Thumbnail Light (aspect 392:220, rounded-8, bg=black)
 *     │   ├── Video Controls Light (seekbar + controls)
 *     │   └── Divider line (border-subtle)
 *     ├── Scroll View (flex-1, overflow-y-auto, z=2)
 *     │   └── Content (VERTICAL)
 *     │       ├── AI Summary (pl=16, pr=32, pt=20)
 *     │       ├── Event Timeline (pl=16, pr=32, pt=20)
 *     │       ├── Session Info (pl=16, pr=32, pt=20)
 *     │       ├── Gameplay Statistics (pl=16, pr=32, pt=20)
 *     │       └── User Profile (pl=16, pr=32, pt=20)
 *     └── Notification Bar (32px, backdrop-blur, bg=subtle, z=1)
 *
 * @figmaComponent  Session Side Panel
 * @figmaNode       6453:1472353
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6453-1472353
 */

import { useCallback, useState } from 'react'
import Button from '../ui/Button'
import { CloseIcon } from '../icons/CloseIcon'
import { DetectedEventsIcon } from '../icons/section'
import { VideoPlayerThumbnail } from '../molecules/VideoPlayerThumbnail'
import { AITextSummary } from '../molecules/AITextSummary'
import { EventTimelineItem } from '../molecules/EventTimelineItem'
import { SessionInfoCard } from '../molecules/SessionInfoCard'
import { GameplayStatsCard } from '../molecules/GameplayStatsCard'
import { UserProfileCard } from '../molecules/UserProfileCard'
import { SessionInstructionsCard } from '../molecules/SessionInstructionsCard'
import { OracleExcerptCard } from '../molecules/OracleExcerptCard'
import { ExcerptCollapsible } from '../molecules/ExcerptCollapsible'
import { SourceBadge } from '../atoms/SourceBadge'
import { EventTag } from '../atoms/EventTag'
import { AiTag } from '../atoms/AiTag'
import { EVENT_ICON_MAP } from '../icons/events'
import type { SessionData, SessionEvent } from '../../lib/types/radiologist'
import type { OracleExcerpt } from '../../lib/types/excerpt'

interface SessionSidePanelProps {
  session: SessionData
  onClose: () => void
  onViewDetail: () => void
  /**
   * Set when the panel opened from an Oracle result. The excerpt then leads the
   * body — a query-specific answer outranks the generic AI summary. Absent when
   * the user simply browsed to this session.
   */
  excerpt?: OracleExcerpt
  className?: string
}

/** Default number of events shown before "Show All" is clicked */
const DEFAULT_VISIBLE_EVENTS = 2

/** Parse "M:SS" to seconds */
function parseTimestamp(ts: string): number {
  const parts = ts.split(':').map(Number)
  return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0]
}

function parseDuration(dur: string): number {
  const parts = dur.split(':').map(Number)
  return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0]
}

export function SessionSidePanel({
  session,
  onClose,
  onViewDetail,
  excerpt,
  className,
}: SessionSidePanelProps) {
  const [showAllEvents, setShowAllEvents] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [videoTime, setVideoTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const totalDuration = parseDuration(session.duration)
  const source = session.source ?? 'live'


  /** Look up game-specific event icon by type */
  const getEventIcon = useCallback((type: string) => {
    const IconComp = EVENT_ICON_MAP[type]
    if (IconComp) return <IconComp size={24} className="text-text-secondary" />
    const GenericComp = EVENT_ICON_MAP['generic']
    if (GenericComp) return <GenericComp size={24} className="text-text-secondary" />
    return null
  }, [])

  const handleEventSeek = useCallback((event: SessionEvent) => {
    setSelectedEventId(event.id)
    const seconds = parseTimestamp(event.timestamp)
    setVideoTime(seconds)
  }, [])

  return (
    <div
      className={[
        'flex flex-col w-[420px] h-full bg-bg-elements shrink-0 isolate',
        className,
      ].filter(Boolean).join(' ')}
      style={{ borderLeft: '1px solid var(--border-default)' }}
    >
      {/* ── Header (56px) — Figma: px=16, py=20, z=4 ── */}
      <div
        className="flex items-center justify-between h-[56px] shrink-0 z-[4]"
        style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="flex-1 min-w-0 flex items-center gap-xs">
          <span
            className="font-display font-semibold leading-[1.5] truncate min-w-0"
            style={{ fontSize: '14px', color: '#353D57' }}
          >
            {session.sessionId}
          </span>
        </div>
        <div className="flex items-center gap-s shrink-0 cursor-pointer">
          <Button variant="translucent" size="md" onClick={onViewDetail}>
            View in detail
          </Button>
          <Button variant="translucent" size="md" iconOnly onClick={onClose} aria-label="Close panel">
            <CloseIcon size={16} />
          </Button>
        </div>
      </div>

      {/* ── Gallery section — Figma: px=16, pt=20, gap=16, clip, z=3 ── */}
      <div
        className="shrink-0 overflow-hidden z-[3]"
        style={{ padding: '20px 16px 0' }}
      >
        <div className="relative">
          <VideoPlayerThumbnail
            thumbnailSrc={session.thumbnailSrc}
            duration={session.duration}
            events={session.events}
            showControls
            currentTime={videoTime}
            isPlaying={isPlaying}
            totalDuration={totalDuration}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onSeek={(pct) => setVideoTime((pct / 100) * totalDuration)}
            onEventSeek={handleEventSeek}
          />
          <SourceBadge source={source} variant="overlay" className="absolute left-[8px] top-[8px] z-[2]" />
        </div>
        {/* Divider line — Figma: w=388, h=0, border */}
        <div className="mt-m" style={{ borderBottom: '1px solid var(--border-default)' }} />
      </div>

      {/* ── Scrollable content — Figma: flex-1, overflow-y-auto, z=2 ── */}
      <div className="flex-1 min-h-0 overflow-y-auto flyout-scrollbar overflow-x-hidden z-[2]">
        {/* Oracle excerpt — pinned above the summary when the panel came from Oracle */}
        {excerpt && (
          <div style={{ paddingLeft: '16px', paddingRight: '32px', paddingTop: '20px' }}>
            <ExcerptCollapsible dense>
              <OracleExcerptCard
                excerpt={excerpt}
                onSeek={setVideoTime}
                dense
                headerMode="none"
              />
            </ExcerptCollapsible>
          </div>
        )}

        {/* AI Summary */}
        <AITextSummary
          text={session.aiSummary}
          highlightedPhrases={session.highlightedPhrases}
        />

        {/* Tags — AI-extracted (sparkle) lead, then user upload tags (neutral) */}
        {((session.aiTags?.length ?? 0) > 0 || session.tags.length > 0) && (
          <div className="flex flex-col gap-s" style={{ paddingLeft: '16px', paddingRight: '32px', paddingTop: '20px' }}>
            {session.aiTags && session.aiTags.length > 0 && (
              <div className="flex flex-wrap gap-xxs">
                {session.aiTags.map((t) => (
                  <AiTag key={`ai-${t}`} label={t} className="!rounded-[6px]" />
                ))}
              </div>
            )}
            {session.tags.length > 0 && (
              <div className="flex flex-wrap gap-xxs">
                {session.tags.map((t) => (
                  <EventTag key={`up-${t}`} label={t} className="!rounded-[6px]" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Session Instructions — AI Player sessions only.
            paddingBottom matches the top: the divider that follows sat flush
            against this card while every other section had 20px of air. */}
        {source === 'ai-player' && session.sessionInstructions && (
          <div
            style={{
              paddingLeft: '16px',
              paddingRight: '32px',
              paddingTop: '20px',
              paddingBottom: '20px',
            }}
          >
            <SessionInstructionsCard
              instructions={session.sessionInstructions}
              persona={session.userProfile.persona}
            />
          </div>
        )}

        {/* Divider between AI Summary and Detected Events — visible in Figma */}
        <div style={{ margin: '0 16px', borderBottom: '1px solid var(--border-default)' }} />

        {/* Detected Events — Figma: Event Timeline, pl=16, pr=32, pt=20, gap=12 */}
        <div
          className="flex flex-col gap-s"
          style={{ paddingLeft: '16px', paddingRight: '32px', paddingTop: '20px' }}
        >
          {/* Title: Radar icon + "Detected Events" */}
          <div className="flex items-center gap-xs">
            <DetectedEventsIcon size={16} className="shrink-0" />
            <span
              className="font-display font-semibold whitespace-nowrap"
              style={{ fontSize: '16px', color: '#353D57', lineHeight: '1.5' }}
            >
              Detected Events
            </span>
          </div>

          {/* Event list — default: show 2, expanded: show all */}
          <div className="flex flex-col gap-[11px]">
            {(showAllEvents ? session.events : session.events.slice(0, DEFAULT_VISIBLE_EVENTS)).map((event) => (
              <EventTimelineItem
                key={event.id}
                type={event.type}
                timestamp={event.timestamp}
                description={event.description}
                icon={getEventIcon(event.type)}
                showChevron
                selected={event.id === selectedEventId}
                onClick={() => handleEventSeek(event)}
              />
            ))}
          </div>

          {/* "Show All Events" button — Figma: Button Tertiary, w=full, h=32 */}
          {session.events.length > DEFAULT_VISIBLE_EVENTS && (
            <Button
              variant="tertiary"
              size="md"
              className="w-full"
              onClick={() => setShowAllEvents(!showAllEvents)}
            >
              {showAllEvents ? 'Show Less' : `Show All Events (${session.events.length})`}
            </Button>
          )}

          {/* Divider line — Figma: Line 2, visible */}
          <div style={{ borderBottom: '1px solid var(--border-default)' }} />
        </div>

        {/* Session Info */}
        <SessionInfoCard
          source={source}
          duration={session.duration}
          region={session.region}
          platform={session.platform}
          gameMode={session.gameMode}
        />

        {/* Gameplay Statistics */}
        <GameplayStatsCard stats={session.stats} />

        {/* Divider — Figma: Line 3, visible, between Gameplay Stats and User Profile */}
        <div style={{ margin: '0 16px', borderBottom: '1px solid var(--border-default)' }} />

        {/* User Profile — full stat card rows */}
        <div style={{ paddingLeft: '16px', paddingRight: '32px', paddingTop: '20px', paddingBottom: '20px' }}>
          <UserProfileCard profile={session.userProfile} />
        </div>
      </div>

      {/* ── Notification Bar (32px) — Figma: backdrop-blur-[12px], bg=subtle, z=1 ── */}
      <div
        className="flex items-center justify-center gap-xs h-[32px] px-s py-xs shrink-0 overflow-hidden z-[1]"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'var(--bg-subtle)',
        }}
      >
        {/* Info icon — from Figma export (filled style) */}
        <svg className="shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 6.698C7.655 6.698 7.375 6.978 7.375 7.323V11.348C7.375 11.693 7.655 11.973 8 11.973C8.345 11.973 8.625 11.693 8.625 11.348V7.323C8.625 6.978 8.345 6.698 8 6.698Z" fill="currentColor" />
          <path d="M8.844 5.089C8.844 5.555 8.466 5.932 8 5.932C7.534 5.932 7.156 5.555 7.156 5.089C7.156 4.623 7.534 4.245 8 4.245C8.466 4.245 8.844 4.623 8.844 5.089Z" fill="currentColor" />
          <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.578 0 0 3.578 0 8C0 12.422 3.578 16 8 16C12.422 16 16 12.422 16 8C16 3.578 12.422 0 8 0ZM8 14.75C4.269 14.75 1.25 11.731 1.25 8C1.25 4.269 4.269 1.25 8 1.25C11.731 1.25 14.75 4.269 14.75 8C14.75 11.731 11.731 14.75 8 14.75Z" fill="currentColor" />
        </svg>
        <span
          className="font-display font-semibold text-center whitespace-nowrap"
          style={{ fontSize: '12px', color: '#030D2D', lineHeight: '1.5' }}
        >
          All the data computed is based on last 30 Days.
        </span>
      </div>
    </div>
  )
}
