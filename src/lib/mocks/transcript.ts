/**
 * Deterministic transcript generation for mock sessions.
 *
 * Narration segments are derived from a session's existing events plus its
 * duration, seeded from the session id — so a given session yields the same
 * transcript on every reload, the way a real analysis result would.
 *
 * Uses a seeded RNG so the output is stable per session id.
 */
import type { SessionEvent } from '../types/radiologist'
import type { TranscriptSegment } from '../types/transcript'

/** Roughly one narration line every 7 seconds of footage. */
const SECONDS_PER_SEGMENT = 7

/** Narration phrasing per event type — what the vision model "saw". */
const EVENT_NARRATION: Record<string, string[]> = {
  'match-start': [
    'Match loads in and the player drops toward the coastal dock',
    'Lobby closes and the player deploys over the ridge line',
  ],
  loot: [
    'Player breaks open a supply crate and swaps to a scoped rifle',
    'Player collects armour plates and medical kits from the warehouse shelf',
  ],
  kill: [
    'Player lands a headshot on an opponent crossing the open ground',
    'Player knocks an enemy through a window and finishes the downed target',
  ],
  customization: [
    'Player opens the loadout menu and cycles through weapon attachments',
    'Player edits the control layout, dragging the fire button lower',
  ],
  death: [
    'Player is eliminated by a third party while reviving a teammate',
    'Player goes down in the final circle with no cover remaining',
  ],
  'loading-error': [
    'Screen holds on the loading spinner while assets stream in',
    'Textures pop in late and the frame stalls for several seconds',
  ],
  winner: [
    'Last squad falls and the Booyah banner fills the screen',
    'Match ends in first place and the results screen totals the eliminations',
  ],
  generic: [
    'Player rotates toward the next objective marker on the minimap',
    'Player holds position behind cover, scanning the treeline',
  ],
}

/** Filler narration for stretches between detected events. */
const FILLER_NARRATION = [
  'Player sprints along the road, checking the compass for the safe zone',
  'Player crouches behind a low wall and reloads',
  'Camera pans across the valley as the player waits for the circle to close',
  'Player vaults a fence and continues toward the compound',
  'Player checks inventory, dropping excess ammunition',
  'Player drives a recovered vehicle along the ridge road',
  'Player pings a rooftop position for the squad',
  'Player heals to full while sheltering inside a doorway',
]

function seedFrom(id: string): () => number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff
    return h / 0x7fffffff
  }
}

/** Parse "M:SS" (or "SS") to seconds. */
export function parseClock(value: string): number {
  const parts = value.split(':').map((n) => parseInt(n, 10) || 0)
  return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0]
}

/** Format seconds as "M:SS". */
export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Build a transcript for a session. Segments covering an event's timestamp are
 * narrated from that event and carry its `eventId`; the rest get filler.
 */
export function generateTranscript(
  videoId: string,
  duration: string,
  events: SessionEvent[],
): TranscriptSegment[] {
  const total = parseClock(duration)
  if (total <= 0) return []

  const rng = seedFrom(videoId)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]

  const count = Math.max(1, Math.ceil(total / SECONDS_PER_SEGMENT))
  const segments: TranscriptSegment[] = []

  for (let i = 0; i < count; i++) {
    const startSec = Math.round((total * i) / count)
    const endSec = Math.round((total * (i + 1)) / count)

    // An event belongs to this segment when its timestamp falls in [start, end).
    const event = events.find((e) => {
      const at = parseClock(e.timestamp)
      return at >= startSec && at < endSec
    })

    const text = event
      ? pick(EVENT_NARRATION[event.type] ?? EVENT_NARRATION.generic)
      : pick(FILLER_NARRATION)

    segments.push({
      id: `${videoId}:${startSec}`,
      startSec,
      endSec,
      text,
      eventId: event?.id,
    })
  }

  return segments
}
