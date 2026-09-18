/**
 * VideoPlayerThumbnail — Video thumbnail with controls bar.
 * Supports both controlled (parent owns time/playing) and uncontrolled modes.
 *
 * @figmaComponent  Video Player Thumbnail
 * @figmaNode       133:19738
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=133-19738
 */

import { useState, useCallback } from 'react'
import { VideoControlsBar } from './VideoControlsBar'
import { RecordingWell } from '../atoms/RecordingWell'
import { ClockIcon } from '../icons/ClockIcon'
import type { SessionEvent } from '../../lib/types/radiologist'

interface VideoPlayerThumbnailProps {
  thumbnailSrc?: string
  duration?: string
  events?: SessionEvent[]
  showControls?: boolean
  /** Controlled mode — parent owns these */
  currentTime?: number
  isPlaying?: boolean
  totalDuration?: number
  onPlayPause?: () => void
  onSeek?: (percent: number) => void
  onEventSeek?: (event: SessionEvent) => void
  className?: string
}

function parseDurationStr(dur: string): number {
  const parts = dur.split(':').map(Number)
  return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0]
}

export function VideoPlayerThumbnail({
  thumbnailSrc,
  duration = '0:30',
  events = [],
  showControls = true,
  currentTime: controlledTime,
  isPlaying: controlledPlaying,
  totalDuration: controlledTotal,
  onPlayPause: controlledPlayPause,
  onSeek: controlledSeek,
  onEventSeek,
  className,
}: VideoPlayerThumbnailProps) {
  // Uncontrolled fallback state
  const [internalPlaying, setInternalPlaying] = useState(false)
  const [internalTime, setInternalTime] = useState(0)

  const total = controlledTotal ?? parseDurationStr(duration)
  const currentTime = controlledTime ?? internalTime
  const isPlaying = controlledPlaying ?? internalPlaying

  const handlePlayPause = useCallback(() => {
    if (controlledPlayPause) {
      controlledPlayPause()
    } else {
      setInternalPlaying(p => !p)
    }
  }, [controlledPlayPause])

  const handleSeek = useCallback((percent: number) => {
    const newTime = (percent / 100) * total
    if (controlledSeek) {
      controlledSeek(percent)
    } else {
      setInternalTime(newTime)
    }
  }, [controlledSeek, total])

  const handleEventClick = useCallback((event: SessionEvent) => {
    onEventSeek?.(event)
  }, [onEventSeek])

  return (
    <div className={['flex flex-col gap-[5px]', className].filter(Boolean).join(' ')}>
      {/* Thumbnail — Figma: aspect-[392/220], bg=black, rounded-[8px] */}
      <div
        className="relative w-full overflow-hidden rounded-m cursor-pointer"
        style={{ aspectRatio: '392 / 220', backgroundColor: 'black' }}
        onClick={handlePlayPause}
      >
        {/* Contained rather than cropped: this is the full-size player, and a
            player that crops a portrait capture to its middle third is showing
            the wrong thing at the one size where it matters. The blurred copy
            behind fills the room the shape leaves. */}
        {thumbnailSrc ? (
          <RecordingWell src={thumbnailSrc} orientation="landscape" fill />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-base-910 to-base-950" />
        )}
        <div
          className="absolute top-0 left-0 right-0 h-[40px] pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)' }}
        />
        <div className="absolute bottom-3 right-3 flex gap-[5px] items-center">
          <ClockIcon size={16} className="text-text-on-brand" />
          <span className="font-display text-xs font-semibold text-text-on-brand leading-[1.5]">{duration}</span>
        </div>
      </div>

      {/* Controls bar */}
      {showControls && (
        <VideoControlsBar
          currentTime={currentTime}
          totalDuration={total}
          isPlaying={isPlaying}
          events={events}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onEventClick={handleEventClick}
        />
      )}
    </div>
  )
}
