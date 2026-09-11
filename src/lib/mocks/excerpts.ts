/**
 * Excerpt fixtures — one per reference-data-point shape.
 *
 * Content is lifted from the concept prototype so reviewers compare layout
 * rather than copy.
 *
 * A "why this matters" rationale block was trialled on every shape and cut after
 * PM review, so the blocks here are the evidence only.
 */
import type { OracleExcerpt, ExcerptShape } from '../types/excerpt'

const QUERY = 'How do players engage with guild features?'

export const MOCK_EXCERPTS: Record<ExcerptShape, OracleExcerpt> = {
  'attributes-text': {
    id: 'ex-attributes-text',
    videoId: 'Session #2847',
    query: QUERY,
    startSec: 413,
    endSec: 440,
    blocks: [
      {
        kind: 'attributes',
        rows: [
          { label: 'Game mode', value: 'Guild & Progression' },
          { label: 'Session length', value: '899 seconds' },
          { label: 'Account level', value: '92' },
          { label: 'Ad to gameplay', value: 'Mainly Gameplay' },
        ],
      },
      {
        kind: 'text',
        body:
          'This clip shows a player working through a full guild loop in a single session. They open the Guild menu from the right-hand panel, review the guild page, then move into Help Requests and clear the queue one member at a time.',
      },
    ],
  },

  events: {
    id: 'ex-events',
    videoId: 'Session #2847',
    query: QUERY,
    startSec: 413,
    endSec: 424,
    blocks: [
      {
        kind: 'events',
        items: [
          {
            timestamp: '06:53',
            category: 'MENU NAVIGATION',
            description: 'Player opens the Guild menu from the right-hand panel.',
          },
          {
            timestamp: '06:58',
            category: 'GUILD INTERACTION',
            description: 'Help Requests opened, showing the pending member queue.',
          },
          {
            timestamp: '06:59',
            category: 'GUILD INTERACTION',
            description: 'Help granted to LightsOut; the button flashes pressed.',
          },
          {
            timestamp: '07:04',
            category: 'REWARD CLAIMING',
            description: 'Help Received Today counter increments toward the 0/10 daily cap.',
          },
        ],
      },
    ],
  },

  text: {
    id: 'ex-text',
    videoId: 'Session #2847',
    query: QUERY,
    startSec: 424,
    endSec: 440,
    blocks: [
      {
        kind: 'text',
        body:
          'A second visit to guild content later in the session. The player performs a free upgrade on the Guild Warehouse, then spends currency on a paid upgrade, before returning to the main progression loop.',
      },
    ],
  },

  attributes: {
    id: 'ex-attributes',
    videoId: 'Session #2847',
    query: QUERY,
    blocks: [
      {
        kind: 'attributes',
        rows: [
          { label: 'Guild', value: 'Evolution · Lv. 6' },
          { label: 'Members', value: '28 / 30' },
          { label: 'Conquest ranking', value: '2' },
          { label: 'Contribution rank', value: '3rd — SeungHn' },
        ],
      },
    ],
  },

  'transcript-points': {
    id: 'ex-transcript-points',
    videoId: 'Session #2847',
    query: QUERY,
    startSec: 322,
    endSec: 353,
    blocks: [
      {
        kind: 'transcript',
        points: [
          { timestamp: '05:22', text: 'Friends list opened from the social menu.' },
          { timestamp: '05:33', text: 'Friend points sent to all listed friends at once.' },
          { timestamp: '05:45', text: 'Confirmation dialog accepted.' },
          { timestamp: '05:51', text: 'Add Friend tab opened, showing pending requests.' },
          { timestamp: '05:53', text: 'All pending friend requests accepted together.' },
        ],
      },
    ],
  },

  'transcript-text': {
    id: 'ex-transcript-text',
    videoId: 'Session #2847',
    query: QUERY,
    startSec: 822,
    endSec: 871,
    blocks: [
      {
        kind: 'transcript',
        points: [
          { timestamp: '13:42', text: 'Mission list opened from the main HUD.' },
          { timestamp: '13:58', text: 'Daily mission rewards claimed one at a time.' },
          { timestamp: '14:31', text: 'Pass rewards claimed from the season track.' },
        ],
      },
      {
        kind: 'text',
        body:
          'The closing stretch of the session is a claim loop: the player works down the mission list, then the season pass, collecting everything available before leaving.',
      },
    ],
  },
}

export const EXCERPT_SHAPE_ORDER: ExcerptShape[] = [
  'attributes-text',
  'events',
  'text',
  'attributes',
  'transcript-points',
  'transcript-text',
]
