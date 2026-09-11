/** Types for the Oracle agent flow */

import type { SessionData } from './radiologist'
import type {
  SourceItem,
  SourceDoc,
  SourceConnector,
} from '../../components/molecules/SourcesGrid'

/** Oracle view states matching the Figma flow frames */
export type OracleViewState = 'idle' | 'loading' | 'result' | 'video-results'

export interface OracleResponseData {
  id: string
  sources: SourceItem[]
  /** Uploaded docs cited by the response */
  docs?: SourceDoc[]
  /** Warehouse datasets cited by the response */
  connectors?: SourceConnector[]
  /** Total videos consulted, when `sources` is only a sample */
  totalVideos?: number
  /** HTML string for rich-text response content */
  contentHtml: string
  creditsUsed: number
  relatedPrompts: string[]
}

export interface OracleChatMessage {
  id: string
  type: 'user' | 'ai'
  text?: string
  response?: OracleResponseData
  isLoading?: boolean
}

export interface OracleState {
  viewState: OracleViewState
  messages: OracleChatMessage[]
  /** Session data for the sources/session side panels */
  sourceSessions: SessionData[]
  /** Currently selected session for detail panel */
  activeSession: SessionData | null
  /** Whether sources side panel is open */
  sourcesPanelOpen: boolean
  /** Whether session detail panel is open */
  sessionPanelOpen: boolean
}
