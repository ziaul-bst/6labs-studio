/** Types for the Radiologist agent flow */

import type { TranscriptSegment } from './transcript'

export interface SessionEvent {
  id: string
  type: 'kill' | 'winner' | 'loading-error' | 'customization' | 'match-start' | 'death' | 'loot'
  timestamp: string
  description: string
}

export interface GameplayStats {
  eliminations: number
  deaths: number
  placement: string
}

export interface UserProfileStat {
  icon?: string
  label: string
  value: string
  locked?: boolean
}

export interface UserProfile {
  avatarSrc?: string
  username: string
  playerId?: string
  spenderTag?: string
  /** When true the profile represents an AI Player agent, not a human. */
  isAgent?: boolean
  /** Agent persona used for the recording (e.g. "Casual", "Explorer"). AI Player only. */
  persona?: string
  stats?: UserProfileStat[][]
}

/**
 * Where a session's video came from:
 *  - live         — captured from a real player's live session (default)
 *  - manual-upload — a clip a game dev uploaded to the Library by hand
 *  - ai-player    — an agent that played the game and recorded the session
 */
export type VideoSource = 'live' | 'manual-upload' | 'ai-player'

export interface SessionData {
  sessionId: string
  date: string
  duration: string
  description: string
  /** Origin of this session's video (defaults to 'live' when absent) */
  source?: VideoSource
  /** Instruction prompt the agent was given for this recording. AI Player sessions only. */
  sessionInstructions?: string
  /** User-added tags (entered at upload) */
  tags: string[]
  /** AI-extracted tags (from the LLM) */
  aiTags?: string[]
  thumbnailSrc?: string
  aiSummary: string
  highlightedPhrases?: string[]
  events: SessionEvent[]
  /** AI narration of the session, timestamped. Absent while analysis is pending. */
  transcript?: TranscriptSegment[]
  region: string
  platform: string
  gameMode: string
  stats: GameplayStats
  userProfile: UserProfile
}

export interface PlaylistSession {
  dateLabel: string
  durationLabel: string
  videos: SessionData[]
}
