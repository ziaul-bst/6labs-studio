/**
 * SessionInfoCard — Session metadata cards in a row.
 * Figma: flex row, gap-[12px], each card: bg-page, border-base-50, rounded-[12px], p-12.
 * Icon (16px asset) + label (12px Inter) top, value (14px Bricolage Semibold) below.
 *
 * @figmaComponent  Session Info
 * @figmaNode       366:21606
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=366-21606
 */

import { InfoItem } from '../atoms/InfoItem'
import { ClockIcon } from '../icons/ClockIcon'
import { SessionInfoIcon as SessionInfoSectionIcon } from '../icons/section'
import type { VideoSource } from '../../lib/types/radiologist'

const SOURCE_LABELS: Record<VideoSource, string> = {
  live: 'Live capture',
  'manual-upload': 'Manual upload',
  'ai-player': 'AI Player',
}

function SourceInfoIcon({ source }: { source: VideoSource }) {
  if (source === 'ai-player') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="5.5" width="10" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 3.5V5.5M8 3.5a1 1 0 100-2 1 1 0 000 2Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <circle cx="6" cy="9" r="0.9" fill="currentColor" />
        <circle cx="10" cy="9" r="0.9" fill="currentColor" />
        <path d="M1.5 8.5v2M14.5 8.5v2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }
  if (source === 'manual-upload') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 10V2.5M8 2.5 5.5 5M8 2.5 10.5 5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 10.5v1.5a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5v-1.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="8" cy="8" r="2.4" fill="currentColor" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" />
      <ellipse cx="8" cy="8" rx="3" ry="6" stroke="currentColor" strokeWidth="1.25" />
      <path d="M2 8h12" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5.5 14h5M8 11v3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function GamepadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5 5v3M3.5 6.5h3M10.25 5.75h.01M11.75 7.25h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M2 6.5C2 5.12 3.12 4 4.5 4h7c1.38 0 2.5 1.12 2.5 2.5 0 2.5-1.5 6-3 6-1 0-1.5-1-3-1s-2 1-3 1c-1.5 0-3-3.5-3-6z" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

interface SessionInfoCardProps {
  duration: string
  region: string
  platform: string
  gameMode: string
  /** Origin of the video — rendered as a Source field when provided */
  source?: VideoSource
  className?: string
}

export function SessionInfoCard({ duration, region, platform, gameMode, source, className }: SessionInfoCardProps) {
  return (
    <div
      className={['flex flex-col gap-s', className].filter(Boolean).join(' ')}
      style={{ paddingLeft: 'var(--space-m)', paddingRight: 'var(--space-xxl)', paddingTop: 'var(--space-l)' }}
    >
      {/* Section title — Figma: Stats icon (brand blue bar chart) + 16px Bricolage Semibold, base-700 */}
      <div className="flex items-center gap-xs">
        <SessionInfoSectionIcon size={16} className="shrink-0" />
        <h3
          className="font-display font-semibold leading-[1.5] whitespace-nowrap"
          style={{ fontSize: '16px', color: '#353D57' }}
        >
          Session Info
        </h3>
      </div>

      {/* Stats row — flex, gap-12 */}
      {source && (
        <div className="flex gap-s">
          <InfoItem icon={<SourceInfoIcon source={source} />} label="Source" value={SOURCE_LABELS[source]} />
        </div>
      )}
      <div className="flex gap-s">
        <InfoItem icon={<ClockIcon size={16} />} label="Duration" value={duration} />
        <InfoItem icon={<GlobeIcon />} label="Region" value={region} />
      </div>
      <div className="flex gap-s">
        <InfoItem icon={<MonitorIcon />} label="Platform" value={platform} />
        <InfoItem icon={<GamepadIcon />} label="Game Mode" value={gameMode} />
      </div>
    </div>
  )
}
