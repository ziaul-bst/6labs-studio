/**
 * VideoCard — Grid card showing a game session recording.
 * Contains: thumbnail with duration overlay, session info, description, event tags.
 *
 * @figmaComponent  Video Card Grid
 * @figmaNode       2527:61276
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=2527-61276
 */

import { useState, useRef, useCallback } from 'react'
import { CalendarIcon } from '../icons/CalendarIcon'
import { ClockIcon } from '../icons/ClockIcon'
import { EventTag } from '../atoms/EventTag'
import { AiTag } from '../atoms/AiTag'
import { SourceBadge } from '../atoms/SourceBadge'
import type { VideoSource } from '../../lib/types/radiologist'

interface VideoCardProps {
  sessionId: string
  date: string
  duration: string
  description: string
  /** Origin of the video — shown as an overlay badge; 'live' is treated as default */
  source?: VideoSource
  /** User-added tags (entered at upload) — rendered as neutral pills */
  tags: string[]
  /** AI-extracted tags (from the LLM) — rendered with a sparkle/tinted pill */
  aiTags?: string[]
  thumbnailSrc?: string
  /** Video URL — on hover, plays muted preview. Falls back to static thumbnail if omitted. */
  videoSrc?: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function VideoCard({
  sessionId,
  date,
  duration,
  description,
  source = 'live',
  tags,
  aiTags = [],
  thumbnailSrc,
  videoSrc,
  selected = false,
  onClick,
  className,
}: VideoCardProps) {
  // AI tags lead (sparkle pills), then user upload tags (neutral pills).
  const aiShown = aiTags.slice(0, 2)
  const uploadShown = tags.slice(0, 2)
  const extraCount = aiTags.length - aiShown.length + (tags.length - uploadShown.length)
  const [hovering, setHovering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = useCallback(() => {
    setHovering(true)
    videoRef.current?.play().catch(() => {})
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHovering(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [])

  return (
    <div
      className={[
        'video-card flex flex-col overflow-hidden rounded-xl',
        'bg-white cursor-pointer group',
        selected ? 'video-card-selected' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail / Video preview */}
      <div className="relative w-full aspect-[355/200] bg-black rounded-t-[8px] overflow-hidden">
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            preload="none"
            poster={thumbnailSrc}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hovering ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={`Session ${sessionId} recording`}
            className={`absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-300 ${videoSrc && hovering ? 'opacity-0' : 'opacity-100'}`}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-base-910 to-base-950" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Source badge — top-left */}
        <SourceBadge source={source} variant="overlay" className="absolute left-[8px] top-[8px] z-[2]" />

        {/* Top gradient for time */}
        <div
          className="absolute top-0 left-0 right-0 h-[40px]"
          style={{ background: 'linear-gradient(-15deg, transparent 71%, rgba(0,0,0,0.8) 94%)' }}
        />

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-black/60 to-transparent" />

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 flex gap-[5px] items-center">
          <ClockIcon size={16} className="text-text-on-brand" />
          <span className="font-display text-xs font-semibold text-text-on-brand leading-[1.5]">
            {duration}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-s shrink-0 p-m w-full">
        <div className="flex flex-col gap-xs w-full">
          {/* Title row — title clamps to 2 lines, date stays pinned to the first line */}
          <div className="flex items-start justify-between gap-s w-full min-w-0">
            <span className="flex-1 min-w-0 font-display text-s font-semibold text-base-900 leading-[1.5] line-clamp-2">
              {sessionId}
            </span>
            <div className="flex gap-xs items-center shrink-0 pt-[2px]">
              <CalendarIcon size={16} className="text-base-600" />
              <span className="font-body text-xs text-base-600 leading-[1.5] whitespace-nowrap">
                {date}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="font-body text-xs text-base-600 leading-[1.5] overflow-hidden text-ellipsis line-clamp-2">
            {description}
          </p>

          {/* Tags — AI-extracted (sparkle) lead, then user upload tags (neutral) */}
          <div className="flex flex-wrap gap-xxs items-center">
            {aiShown.map((tag) => (
              <AiTag key={`ai-${tag}`} label={tag} />
            ))}
            {uploadShown.map((tag) => (
              <EventTag key={`up-${tag}`} label={tag} />
            ))}
            {extraCount > 0 && <EventTag label={`+${extraCount}`} />}
          </div>
        </div>
      </div>
    </div>
  )
}
