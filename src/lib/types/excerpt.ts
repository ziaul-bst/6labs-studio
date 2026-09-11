/**
 * Oracle Excerpts — the evidence explaining why a video was referenced to
 * answer a user's query.
 *
 * An excerpt is **query-relative**. A video has detected events and a
 * transcript permanently; it only has an excerpt in the context of a specific
 * question. That is why the surfaces treat it as something that leads when a
 * query is present and disappears entirely when one isn't.
 *
 * The six shapes in the concept (Attributes, Events, Text, Transcript points,
 * Attributes + Text, Transcript + Text) are not six layouts — they are
 * combinations of these blocks, composed by one card.
 */

export interface ExcerptAttributeRow {
  label: string
  value: string
}

export interface ExcerptEventItem {
  timestamp: string
  /** Uppercase category shown above the description, e.g. "MENU NAVIGATION" */
  category: string
  description: string
}

export interface ExcerptTranscriptPoint {
  timestamp: string
  text: string
}

export type ExcerptBlock =
  /** Key/value facts about the session — game mode, session length, account level */
  | { kind: 'attributes'; rows: ExcerptAttributeRow[] }
  /** Detected events, each with a category label */
  | { kind: 'events'; items: ExcerptEventItem[] }
  /** Timestamped narration lines */
  | { kind: 'transcript'; points: ExcerptTranscriptPoint[] }
  /** Prose describing what the clip shows */
  | { kind: 'text'; body: string }

export interface OracleExcerpt {
  id: string
  videoId: string
  /** The question this excerpt answers. Shown in the header — an excerpt with
   *  no visible query is an answer to nothing. */
  query: string
  /** Range the excerpt covers, for seek-bar markers and the header label */
  startSec?: number
  endSec?: number
  blocks: ExcerptBlock[]
}

/**
 * The concept's six reference-data-point shapes. Used only by the prototype
 * switcher so reviewers can see each rendering; production excerpts just carry
 * whichever blocks apply.
 */
export type ExcerptShape =
  | 'attributes-text'
  | 'events'
  | 'text'
  | 'attributes'
  | 'transcript-points'
  | 'transcript-text'

export const EXCERPT_SHAPE_LABELS: Record<ExcerptShape, string> = {
  'attributes-text': 'Attributes + Text',
  events: 'Events',
  text: 'Text',
  attributes: 'Attributes',
  'transcript-points': 'Transcript points',
  'transcript-text': 'Transcript + Text',
}

/** Where the excerpt sits on the details page. Prototype-only switcher. */
export type ExcerptPlacement = 'banner' | 'rail'

export const EXCERPT_PLACEMENT_LABELS: Record<ExcerptPlacement, string> = {
  banner: 'B · Banner under video',
  rail: 'C · Right rail',
}

/** Shown in the prototype toolbar so reviewers see the trade-off, not just the layout. */
export const EXCERPT_PLACEMENT_RATIONALE: Record<ExcerptPlacement, string> = {
  banner:
    'Leads the column when arriving from Oracle, absent otherwise. Full width for mixed cards, and the video stays directly above it.',
  rail: 'Sits beside the video with the other session facts. Keeps the events list at the top of the column — but 380px is tight once attributes and prose stack. Reads as a rail only above ~1400px.',
}
