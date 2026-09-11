/**
 * Seeded Oracle history.
 *
 * The sidebar's History section used to render four mock labels with nothing
 * behind them — `oracleThreads` started empty, so OracleAgentView's thread-load
 * effect found no stored messages and clicking a history item silently did
 * nothing. These threads give each label a real conversation to open, so
 * History works on a fresh session instead of only after you run a query.
 *
 * Each answer matches its own question rather than all four sharing one canned
 * response, so a reviewer clicking through History sees four distinct screens.
 */

import type { ChatMessage } from '../../components/organisms/OracleChatView'
import type { HistoryItem } from '../../components/organisms/Sidebar'

export const DEFAULT_ORACLE_HISTORY: HistoryItem[] = [
  { id: 'h1', query: 'Show me players who got booyah' },
  { id: 'h2', query: 'Where are players getting stuck or confused in the tutorial?' },
  { id: 'h3', query: 'Show me players who played the most matches' },
  { id: 'h4', query: 'Show me players with the best squad win rate' },
]

interface SeedSpec {
  id: string
  question: string
  contentHtml: string
  sources: { id: string; duration: string; title: string }[]
  relatedPrompts: string[]
}

const SEEDS: SeedSpec[] = [
  {
    id: 'h1',
    question: 'Show me players who got booyah',
    contentHtml: `
      <p>412 booyah finishes across the last 7 days (top 3.1% of matches played).</p>
      <p><strong>What the winners share</strong></p>
      <ul>
        <li>78% landed outside the top three hot drops and rotated in on the second circle</li>
        <li>Median 4.2 revives given per squad — nearly double the non-winning average</li>
        <li>81% held a mid-range weapon plus one utility slot, not two rifles</li>
      </ul>
      <p><strong>Where they win it</strong></p>
      <ul>
        <li>Final circle held from high ground in 64% of finishes</li>
        <li>Average final-zone engagement lasts 38 seconds — winners open first in 7 of 10</li>
      </ul>
      <p><strong>Bottom line:</strong> booyah correlates far more with rotation discipline than with early kill count.</p>
    `,
    sources: [
      { id: 's1', duration: '4:38', title: 'Booyah — Squad 2291, Bermuda' },
      { id: 's2', duration: '5:02', title: 'Booyah — Squad 1140, Kalahari' },
      { id: 's3', duration: '3:57', title: 'Booyah — Squad 884, Purgatory' },
    ],
    relatedPrompts: [
      'Compare booyah squads against squads that placed top 5 but did not win',
      'Which weapon loadouts appear most often in booyah finishes?',
      'Do booyah players return the next day at a higher rate?',
    ],
  },
  {
    id: 'h2',
    question: 'Where are players getting stuck or confused in the tutorial?',
    contentHtml: `
      <p>5 friction points identified. Tutorial completion rate: 67%.</p>
      <p><strong>Biggest problem: grenade throwing</strong></p>
      <ul>
        <li>73% fail on the first attempt, averaging 3.2 tries</li>
        <li>23% abandon the tutorial here — the largest single drop-off</li>
        <li>Trajectory line is barely visible and the instruction shows for only 2 seconds</li>
      </ul>
      <p><strong>Inventory management</strong></p>
      <ul>
        <li>51% take 40+ seconds to equip a weapon, against an expected 10</li>
        <li>Tap versus drag is never explained and weapon slots read as decorative</li>
      </ul>
      <p><strong>Aiming</strong></p>
      <ul>
        <li>47% fire from the hip instead of using ADS, and can still progress</li>
      </ul>
      <p><strong>Bottom line:</strong> the grenade section alone causes 23% abandonment. Fix it first.</p>
    `,
    sources: [
      { id: 's1', duration: '4:05', title: 'Tutorial Run — Player 847' },
      { id: 's2', duration: '3:22', title: 'Tutorial Run — Player 1203' },
      { id: 's3', duration: '5:10', title: 'Tutorial Run — Player 562' },
    ],
    relatedPrompts: [
      'How many players who completed the tutorial still struggle in their first real match?',
      'Show me players who abandoned the tutorial but succeeded in real matches',
      'Find the 3 worst tutorial runs by time-to-complete',
    ],
  },
  {
    id: 'h3',
    question: 'Show me players who played the most matches',
    contentHtml: `
      <p>Top 100 players by match count average 47 matches per week — 6.7× the median.</p>
      <p><strong>Session shape</strong></p>
      <ul>
        <li>Median session length 71 minutes, clustered between 20:00 and 23:30 local</li>
        <li>3.4 sessions per day on weekends against 1.8 on weekdays</li>
        <li>92% play in a premade squad rather than solo queue</li>
      </ul>
      <p><strong>Fatigue signal</strong></p>
      <ul>
        <li>Win rate drops 11 points after the fifth consecutive match</li>
        <li>29% of these players quit mid-match at least once per session, almost always after two straight losses</li>
      </ul>
      <p><strong>Bottom line:</strong> your heaviest players are squad-driven and evening-bound. Loss streaks, not session length, end their nights.</p>
    `,
    sources: [
      { id: 's1', duration: '6:12', title: 'Session Marathon — Player 118' },
      { id: 's2', duration: '5:44', title: 'Session Marathon — Player 2043' },
      { id: 's3', duration: '4:29', title: 'Session Marathon — Player 977' },
    ],
    relatedPrompts: [
      'What ends a long session — a loss streak or a squadmate leaving?',
      'Do high-volume players spend more than average?',
      'Which game modes do the top 100 players avoid?',
    ],
  },
  {
    id: 'h4',
    question: 'Show me players with the best squad win rate',
    contentHtml: `
      <p>Top squads win 34% of matches against a 12% platform average.</p>
      <p><strong>What separates them</strong></p>
      <ul>
        <li>Voice comms active in 96% of their matches, versus 41% overall</li>
        <li>Squad members land within 120m of each other in 88% of drops</li>
        <li>Average 2.1 pings per engagement before the first shot</li>
      </ul>
      <p><strong>Roster stability</strong></p>
      <ul>
        <li>Squads with an unchanged roster over 20+ matches win 2.8× more than freshly formed ones</li>
        <li>Adding one random fill drops win rate by 9 points</li>
      </ul>
      <p><strong>Bottom line:</strong> coordination beats individual aim. Roster stability is the strongest single predictor.</p>
    `,
    sources: [
      { id: 's1', duration: '5:18', title: 'Squad Win Streak — Squad 402' },
      { id: 's2', duration: '4:51', title: 'Squad Win Streak — Squad 1567' },
      { id: 's3', duration: '5:33', title: 'Squad Win Streak — Squad 78' },
    ],
    relatedPrompts: [
      'How much does a random fill hurt win rate by squad tier?',
      'Do the top squads rotate earlier than average?',
      'Which pings precede a won engagement most often?',
    ],
  },
]

/**
 * Threads keyed by history id — the shape `OracleAgentView`'s `threadStore`
 * expects, so a click resolves straight to a rendered conversation.
 */
export const SEEDED_ORACLE_THREADS: Record<string, ChatMessage[]> = Object.fromEntries(
  SEEDS.map((seed) => [
    seed.id,
    [
      { id: `${seed.id}-user`, type: 'user', text: seed.question },
      {
        id: `${seed.id}-ai`,
        type: 'ai',
        isLoading: false,
        response: {
          id: `${seed.id}-resp`,
          sources: seed.sources,
          contentHtml: seed.contentHtml,
          creditsUsed: 20,
          relatedPrompts: seed.relatedPrompts,
        },
      },
    ] as ChatMessage[],
  ]),
)
