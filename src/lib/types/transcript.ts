/**
 * Types for video transcripts — AI-generated narration of gameplay.
 *
 * A transcript is a dense, timestamped play-by-play produced by the vision
 * model. There are no speakers and no silence gaps, so it reads as one
 * continuous wall; anchoring comes from time and from the detected events a
 * segment falls inside.
 *
 * Segments are addressable so an Oracle citation can point at a moment rather
 * than at a whole video.
 */

export interface TranscriptSegment {
  /** `${videoId}:${startSec}` — stable across renders, addressable by a citation */
  id: string
  startSec: number
  endSec: number
  text: string
  /** Detected event this segment falls inside, when any. Drives "Group by event". */
  eventId?: string
}

/** How much of a transcript a surface should show when it first mounts. */
export type TranscriptScope = 'cited' | 'full'

/**
 * Deep-link payload handed to a details page when the user arrives from an
 * Oracle citation. `scope: 'cited'` filters the transcript to the referenced
 * moments so a citation arrival never renders the full wall.
 */
export interface TranscriptDeepLink {
  videoId: string
  /** Segment to scroll to and flash-highlight */
  segmentId: string
  /** All segments referenced by the originating response, for `scope: 'cited'` */
  citedSegmentIds?: string[]
  scope: TranscriptScope
  /** Exact span to highlight within the cited segments */
  quote?: string
  /** Where the back arrow should return to */
  returnTo?: TranscriptReturnTarget
}

export interface TranscriptReturnTarget {
  label: string
  historyId?: string | null
  responseId?: string
}
