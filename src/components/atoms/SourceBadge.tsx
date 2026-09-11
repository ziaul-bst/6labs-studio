/**
 * SourceBadge — small pill marking where a session's video came from:
 * Live capture, Manual upload, or AI Player. Used on video cards (overlay
 * variant) and in the side panel / detail header (inline variant).
 *
 * AI Player reads as the agent (brand tint + bot glyph); Manual upload is a
 * neutral pill with an upload glyph; Live capture stays quiet (muted, record dot).
 *
 * Prototype icons — replace with Apparatus-sourced icons before any Figma handoff.
 *
 * Code-first prototype — no Figma source yet.
 */
import type { VideoSource } from '../../lib/types/radiologist'

interface SourceBadgeProps {
  source: VideoSource
  /** overlay = on a dark thumbnail (translucent, light text); inline = on a light surface */
  variant?: 'overlay' | 'inline'
  className?: string
}

const LABELS: Record<VideoSource, string> = {
  live: 'Live capture',
  'manual-upload': 'Manual upload',
  'ai-player': 'AI Player',
}

function SourceGlyph({ source }: { source: VideoSource }) {
  if (source === 'ai-player') {
    // Bot head
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
        <rect x="3" y="5.5" width="10" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 3.5V5.5M8 3.5a1 1 0 100-2 1 1 0 000 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="6" cy="9" r="0.9" fill="currentColor" />
        <circle cx="10" cy="9" r="0.9" fill="currentColor" />
        <path d="M1.5 8.5v2M14.5 8.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    )
  }
  if (source === 'manual-upload') {
    // Upload arrow into tray
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
        <path d="M8 10V2.5M8 2.5 5.5 5M8 2.5 10.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 10.5v1.5a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5v-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    )
  }
  // live — record dot
  return <span className="w-[7px] h-[7px] rounded-round shrink-0" style={{ backgroundColor: 'currentColor' }} aria-hidden />
}

export function SourceBadge({ source, variant = 'inline', className }: SourceBadgeProps) {
  const label = LABELS[source]

  // Palette per source × variant
  let style: React.CSSProperties
  if (variant === 'overlay') {
    // On a dark thumbnail: translucent chip, light text; keep the source hue in the glyph
    const glyphColor =
      source === 'ai-player' ? '#C4B5FF' : source === 'manual-upload' ? '#BFD8FF' : '#FF8B8B'
    style = {
      backgroundColor: 'rgba(0,0,0,0.55)',
      color: '#FFFFFF',
      backdropFilter: 'blur(4px)',
      ['--sb-glyph' as string]: glyphColor,
    }
  } else if (source === 'ai-player') {
    style = { backgroundColor: 'var(--bg-tint-light)', color: 'var(--brand)' }
  } else if (source === 'manual-upload') {
    style = { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }
  } else {
    style = { backgroundColor: 'transparent', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-xxs px-xs py-xxxs rounded-round whitespace-nowrap',
        'font-display text-2xs font-semibold leading-[1.4]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <span style={variant === 'overlay' ? { color: 'var(--sb-glyph)' } : undefined} className="inline-flex">
        <SourceGlyph source={source} />
      </span>
      {label}
    </span>
  )
}
