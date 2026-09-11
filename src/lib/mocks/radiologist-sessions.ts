import type { SessionData, PlaylistSession, UserProfile } from '../types/radiologist'
import { generateTranscript } from './transcript'

// Human player profile — used by live-capture and manual-upload sessions.
const SHARED_PROFILE: UserProfile = {
  username: 'ProGamerX',
  playerId: 'PGX-42910',
  spenderTag: 'Whale',
  stats: [
    [
      { label: 'Region', value: 'USA', icon: 'location' },
      { label: 'Total Sessions', value: '127 Sessions', icon: 'radar' },
    ],
    [
      { label: 'Days Active', value: '45 Days', icon: 'clock' },
      { label: 'Playtime', value: '120 Minutes', icon: 'gamepad' },
    ],
    [
      { label: 'Spender Type', value: 'Whale', icon: 'leagues' },
      { label: 'Total Spends', value: '$ 500', icon: 'dollar', locked: true },
    ],
    [
      { label: 'Other games Played', value: 'PUBG Mobile, COD Mobile', icon: 'gamepad', locked: true },
      { label: 'Playstyle', value: 'Aggressive', icon: 'gamepad' },
    ],
  ],
}

// AI Player agent profile — persona is set per session below.
function agentProfile(persona: string, runs: string): UserProfile {
  return {
    username: 'Radiologist Agent',
    isAgent: true,
    persona,
    stats: [
      [
        { label: 'Build', value: 'v2.3.1', icon: 'radar' },
        { label: 'Runs', value: runs, icon: 'clock' },
      ],
      [
        { label: 'Region', value: 'AI-Cloud', icon: 'location' },
        { label: 'Playstyle', value: persona, icon: 'gamepad' },
      ],
    ],
  }
}

const SHARED_EVENTS = [
  { id: 'e1', type: 'customization' as const, timestamp: '0:15', description: 'Player customized their loadout' },
  { id: 'e2', type: 'match-start' as const, timestamp: '0:15', description: 'Match Started' },
  { id: 'e3', type: 'loading-error' as const, timestamp: '0:15', description: 'Player stuck at loading screen' },
  { id: 'e4', type: 'kill' as const, timestamp: '0:30', description: 'Player eliminated opponent with headshot using AK47' },
  { id: 'e5', type: 'loot' as const, timestamp: '1:05', description: 'Player looted supply crate near warehouse' },
  { id: 'e6', type: 'winner' as const, timestamp: '3:45', description: 'Player got the Booyah' },
]

const BASE = {
  date: '10/11/25',
  duration: '4:05',
  description:
    'Competitive ranked match with strategic gameplay. Player focused on objective-based play with moderate combat. Strong team coordination observed throughout the session.',
  aiSummary:
    'High-intensity battle royale match ending in victory with 12 eliminations. Player showed aggressive playstyle with efficient looting. Shop was opened but no purchase made despite monetization prompts.',
  highlightedPhrases: ['aggressive playstyle with efficient looting'],
  events: SHARED_EVENTS,
  region: 'USA',
  platform: 'BlueStacks 5',
  gameMode: 'Battle Royale',
  stats: { eliminations: 10, deaths: 2, placement: 'Winner' },
}

// Per-session overrides driving the three video sources.
const SESSION_OVERRIDES: Partial<SessionData>[] = [
  // ── AI Player runs ──
  {
    source: 'ai-player',
    tags: ['Agent run', 'Smoke test'],
    aiTags: ['items looted', 'shop opened', 'payment tested'],
    sessionInstructions:
      'Play three Battle Royale matches as a cautious explorer. Loot every building before engaging. Open the in-game shop at least once and attempt one purchase to exercise the payment flow. Flag any loading hitches or UI stalls.',
    userProfile: agentProfile('Explorer', '38 Sessions'),
    aiSummary:
      'Agent completed a full match exploring the map edge-to-edge, opened the shop twice and completed a test purchase. One loading hitch logged at match start.',
    platform: 'AI-Cloud',
  },
  {
    source: 'ai-player',
    tags: ['Agent run', 'Onboarding'],
    aiTags: ['tutorial skip', 'menu hesitation', 'fast completion'],
    sessionInstructions:
      'Act as a first-time casual player. Follow the default onboarding without skipping. Pause on each menu long enough to read it, then complete one full match at a relaxed pace.',
    userProfile: agentProfile('Casual', '12 Sessions'),
    aiSummary:
      'Agent ran the onboarding as a casual first-timer, hesitating on the loadout menu before completing a full match at a relaxed pace.',
    platform: 'AI-Cloud',
    gameMode: 'Training',
  },
  // ── Manual uploads ──
  {
    source: 'manual-upload',
    tags: ['Manual', 'bug-repro'],
    aiTags: ['difficulty spike', 'repeated death'],
    aiSummary:
      'Manually uploaded clip reproducing the Tier 3 boss difficulty spike — repeated deaths in the second phase before the checkpoint.',
    gameMode: 'Boss Fight',
  },
  {
    source: 'manual-upload',
    tags: ['Manual', 'matchmaking'],
    aiTags: ['long queue', 'lobby idle'],
    aiSummary:
      'Manually uploaded matchmaking repro — long queue leaves the player idle in the lobby before a late backfill.',
    gameMode: 'Ranked Squad',
  },
  // ── Live capture (default) ──
  { source: 'live', tags: ['Ranked', 'Squad'] },
  { source: 'live', tags: ['Ranked', 'Solo'], gameMode: 'Clash Squad' },
]

function makeSession(index: number): SessionData {
  const o = SESSION_OVERRIDES[index] ?? {}
  const session: SessionData = {
    sessionId: `Session #${2847 - index}`,
    ...BASE,
    tags: ['Ranked', 'Squad'],
    aiTags: ['items looted', 'game crashed', 'clutch win'],
    userProfile: SHARED_PROFILE,
    ...o,
  }
  return {
    ...session,
    transcript: generateTranscript(session.sessionId, session.duration, session.events),
  }
}

export const MOCK_SESSIONS: SessionData[] = Array.from({ length: SESSION_OVERRIDES.length }, (_, i) => makeSession(i))

export const MOCK_PLAYLIST: PlaylistSession[] = [
  {
    dateLabel: 'Oct 11',
    durationLabel: '58 min',
    videos: MOCK_SESSIONS.slice(0, 4),
  },
  {
    dateLabel: 'Oct 11',
    durationLabel: '34 min',
    videos: MOCK_SESSIONS.slice(4, 6),
  },
  {
    dateLabel: 'Oct 12',
    durationLabel: '128 min',
    videos: MOCK_SESSIONS.slice(0, 3),
  },
]
