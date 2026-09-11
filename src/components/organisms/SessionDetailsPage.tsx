/**
 * SessionDetailsPage — Full session detail view with video player, events, and playlist sidebar.
 *
 * @figmaComponent  Details Page
 * @figmaNode       6453:1472220
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6453-1472220
 */

import { useCallback, useMemo, useState } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { OracleExcerptCard } from '../molecules/OracleExcerptCard'
import { ExcerptPrototypeSwitcher } from '../molecules/ExcerptPrototypeSwitcher'
import { ExcerptCollapsible } from '../molecules/ExcerptCollapsible'
import { VideoPlayerThumbnail } from '../molecules/VideoPlayerThumbnail'
import { AITextSummary } from '../molecules/AITextSummary'
import { EventTimelineItem } from '../molecules/EventTimelineItem'
import { SessionInfoCard } from '../molecules/SessionInfoCard'
import { GameplayStatsCard } from '../molecules/GameplayStatsCard'
import { UserProfileCard } from '../molecules/UserProfileCard'
import { SessionInstructionsCard } from '../molecules/SessionInstructionsCard'
import { SourceBadge } from '../atoms/SourceBadge'
import { EventTag } from '../atoms/EventTag'
import { AiTag } from '../atoms/AiTag'
import { UserPlaylistSidebar } from './UserPlaylistSidebar'
import { MOCK_PLAYLIST } from '../../lib/mocks/radiologist-sessions'
import { parseClock } from '../../lib/mocks/transcript'
import { MOCK_EXCERPTS } from '../../lib/mocks/excerpts'
import type { SessionData } from '../../lib/types/radiologist'
import type { ExcerptPlacement, ExcerptShape } from '../../lib/types/excerpt'

interface SessionDetailsPageProps {
  session: SessionData
  onBack: () => void
  /** Label for the back arrow when reached from somewhere other than results. */
  backLabel?: string
  /**
   * True when the page was reached from an Oracle result, which is what makes an
   * excerpt meaningful. When false the excerpt surfaces are absent entirely.
   */
  fromOracle?: boolean
  /** Seeds the placement under review. Prototype switcher owns it thereafter. */
  defaultPlacement?: ExcerptPlacement
  /** Seeds the reference-data-point shape under review. */
  defaultShape?: ExcerptShape
  /** Hide the floating review toolbar (e.g. in Storybook). */
  hideSwitcher?: boolean
  /**
   * Fires whenever the reviewer changes placement or shape, so a host can mirror
   * the selection into the URL — that is what makes a specific variant shareable.
   */
  onReviewStateChange?: (placement: ExcerptPlacement, shape: ExcerptShape) => void
  className?: string
}

export function SessionDetailsPage({
  session,
  onBack,
  backLabel,
  fromOracle = true,
  defaultPlacement = 'banner',
  defaultShape = 'attributes-text',
  hideSwitcher = false,
  onReviewStateChange,
  className,
}: SessionDetailsPageProps) {
  const source = session.source ?? 'live'

  const [placement, setPlacement] = useState<ExcerptPlacement>(defaultPlacement)
  const [shape, setShape] = useState<ExcerptShape>(defaultShape)
  const [videoTime, setVideoTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const totalDuration = useMemo(() => parseClock(session.duration), [session.duration])
  const handleSeek = useCallback((seconds: number) => setVideoTime(seconds), [])

  const excerpt = MOCK_EXCERPTS[shape]
  const showExcerpt = fromOracle

  return (
    <div
      className={['flex flex-col w-full h-full', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* ── Top bar ── */}
      <PageTopbar
        title={session.sessionId}
        onBack={onBack}
        backLabel={backLabel}
        actions={<SourceBadge source={source} />}
      />

      {/* ── Content: left details + right playlist ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: session details (scrollable) */}
        <div className="flex-1 min-w-0 overflow-y-auto flyout-scrollbar">
          {/*
            Wraps rather than letting the left column collapse. The right rail is
            a fixed 380px, so on a narrow viewport it would otherwise consume the
            whole row and squeeze the video and excerpt to zero width.
          */}
          <div className="flex flex-wrap gap-xxl px-l pt-l pb-xxl3">
            {/* Left column: sticky video + events (and the excerpt under placement A) */}
            <div className="flex-1 basis-[420px] min-w-0 flex flex-col gap-l">
              {/* Video player — sticky so click-to-seek stays reachable while either list scrolls */}
              <div
                className="sticky top-0 z-20 pb-s"
                style={{ backgroundColor: 'var(--bg-page)' }}
              >
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
                  onEventSeek={(event) => setVideoTime(parseClock(event.timestamp))}
                />
              </div>

              {/* Placement B — banner between the video and the tab bar */}
              {showExcerpt && placement === 'banner' && (
                <ExcerptCollapsible>
                  <OracleExcerptCard excerpt={excerpt} onSeek={handleSeek} headerMode="none" />
                </ExcerptCollapsible>
              )}

              <div style={{ borderBottom: '1px solid var(--border-default)' }}>
                <h3
                  className="font-display text-s font-semibold whitespace-nowrap pb-xs"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Detected Events ({session.events.length})
                </h3>
              </div>

              <div className="flex flex-col">
                {session.events.map((event) => (
                  <EventTimelineItem
                    key={event.id}
                    type={event.type}
                    timestamp={event.timestamp}
                    description={event.description}
                    showChevron
                    onClick={() => setVideoTime(parseClock(event.timestamp))}
                  />
                ))}
              </div>
            </div>

            {/* Right column: AI summary, info, stats, profile */}
            <div className="basis-[380px] grow max-w-full min-w-0 flex flex-col gap-xl">
              {/* Placement C — card in the rail, the concept's V3.1/V3.2 position.
                  Same container as the banner so the two options differ only in
                  where they sit, not in how they look. */}
              {showExcerpt && placement === 'rail' && (
                <ExcerptCollapsible dense>
                  <OracleExcerptCard
                    excerpt={excerpt}
                    onSeek={handleSeek}
                    dense
                    headerMode="none"
                  />
                </ExcerptCollapsible>
              )}

              <AITextSummary
                text={session.aiSummary}
                highlightedPhrases={session.highlightedPhrases}
              />

              {/* Tags — AI-extracted (sparkle) lead, then user upload tags */}
              {((session.aiTags?.length ?? 0) > 0 || session.tags.length > 0) && (
                <div className="flex flex-col gap-s">
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

              {source === 'ai-player' && session.sessionInstructions && (
                <SessionInstructionsCard
                  instructions={session.sessionInstructions}
                  persona={session.userProfile.persona}
                />
              )}

              <SessionInfoCard
                source={source}
                duration={session.duration}
                region={session.region}
                platform={session.platform}
                gameMode={session.gameMode}
              />

              <GameplayStatsCard stats={session.stats} />

              <UserProfileCard profile={session.userProfile} />
            </div>
          </div>
        </div>

        {/* Right: User's Playlist sidebar */}
        <UserPlaylistSidebar
          sessions={MOCK_PLAYLIST}
          activeSessionId={session.sessionId}
          onSessionClick={() => {}}
        />
      </div>

      {/* Review toolbar — prototype scaffolding, remove once a placement is chosen */}
      {showExcerpt && !hideSwitcher && (
        <ExcerptPrototypeSwitcher
          placement={placement}
          onPlacementChange={(p) => {
            setPlacement(p)
            onReviewStateChange?.(p, shape)
          }}
          shape={shape}
          onShapeChange={(sh) => {
            setShape(sh)
            onReviewStateChange?.(placement, sh)
          }}
        />
      )}
    </div>
  )
}
