/**
 * FilterDialog — Full-screen modal filter panel with category sidebar,
 * scrollable content area, and action footer.
 *
 * Layout (from Figma Console inspection):
 *   Dialog (772×750, VERTICAL, r=16, clip=true)
 *     ├── Header Container (772×56, px=20)
 *     ├── Main Container (772×610, HORIZONTAL, spacing=16)
 *     │   ├── Sidebar (240×610, VERTICAL, spacing=8, p=20/16/12/20)
 *     │   │   └── Filter items × 6 (204×37, r=8, p=8)
 *     │   └── Filter scroll Area (516×610, VERTICAL, p=20/20/20/0, clip=true)
 *     │       └── Surface panel (r=12, p=8, gap=12, bg=#F1F1F1)
 *     │           └── White cards × N (r=8, p=8, gap=12)
 *     ├── Highlight (4×34, absolute, x=0, y=74, r=0/11/12/0)
 *     └── Footer Container (772×84, p=20)
 *
 * All 6 filter categories implemented:
 *   - Match Context: Game Mode, Map, Match Duration, Placement, Match Played, Shop During Gameplay
 *   - Combat Performance: Elimination Count, Death Count, Damage Dealt, Headshot Rate
 *   - Monetization Patterns: Shop Visits, In-App Purchases, Cart Abandonment
 *   - Player Behaviour: Play Style, Looting Efficiency, Weapon Preference, Same Spot Deaths
 *   - Team Dynamics: Team Coordination, Revives Given, Team Communication
 *   - Frustation Markers: Rage Quit Indicators, Quit During Match, Idle Time
 *
 * @figmaComponent  Filters
 * @figmaNode       6425:140219
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6425-140219
 */
import { useState, useCallback, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Checkbox } from '../ui'
import { Button } from '../ui'
import Toggle from '../ui/Toggle'
import { FilterTag } from '../atoms/FilterTag'
import { AiTag } from '../atoms/AiTag'
import { RangeSlider } from '../atoms/RangeSlider'
import type { VideoSource } from '../../lib/types/radiologist'

// ─── Figma-exported filter category icons ───────────────────────────────────
// Exported via figma.exportAsync({ format: 'SVG_STRING' }) from the Apparatus
// Filter Icons component set. Stroke colors replaced with currentColor.

function MatchContextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M14.6666 1.33337V14.6667M11.9999 10.4V11.6C11.9999 11.8829 11.8875 12.1542 11.6875 12.3543C11.4875 12.5543 11.2161 12.6667 10.9333 12.6667H7.73325C7.45035 12.6667 7.17904 12.5543 6.979 12.3543C6.77897 12.1542 6.66658 11.8829 6.66658 11.6V10.4C6.66658 10.1171 6.77897 9.84583 6.979 9.64579C7.17904 9.44575 7.45035 9.33337 7.73325 9.33337H10.9333C11.2161 9.33337 11.4875 9.44575 11.6875 9.64579C11.8875 9.84583 11.9999 10.1171 11.9999 10.4ZM11.9999 4.40004V5.60004C11.9999 5.88294 11.8875 6.15425 11.6875 6.35429C11.4875 6.55433 11.2161 6.66671 10.9333 6.66671H2.39992C2.11702 6.66671 1.84571 6.55433 1.64567 6.35429C1.44563 6.15425 1.33325 5.88294 1.33325 5.60004V4.40004C1.33325 4.11714 1.44563 3.84583 1.64567 3.64579C1.84571 3.44575 2.11702 3.33337 2.39992 3.33337H10.9333C11.2161 3.33337 11.4875 3.44575 11.6875 3.64579C11.8875 3.84583 11.9999 4.11714 11.9999 4.40004Z" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CombatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5.21216 6.10046C6.21057 6.10046 7.13805 6.61176 7.66626 7.45496L7.66724 7.45691L8.66431 9.03894C8.75169 9.17745 8.70995 9.36409 8.57056 9.45203C8.43015 9.54058 8.24527 9.4978 8.15845 9.35925V9.35828L7.63599 8.5282L6.71216 7.06238V13.6005C6.71193 13.7666 6.57857 13.9003 6.41235 13.9003C6.24619 13.9002 6.11278 13.7666 6.11255 13.6005V10.7001H4.31274V13.3925L4.30981 13.3954V13.6024C4.30981 13.7688 4.17635 13.9022 4.01001 13.9022C3.84365 13.9022 3.71021 13.7688 3.71021 13.6024V7.06433L2.78638 8.53113L2.26392 9.36121C2.17585 9.50003 1.99009 9.54206 1.85181 9.45496C1.71285 9.36729 1.66907 9.18192 1.75806 9.03992L2.7561 7.45593C3.28692 6.612 4.21404 6.10057 5.21216 6.10046ZM5.21216 2.10046C5.81852 2.10046 6.31274 2.59372 6.31274 3.20007C6.31272 3.80641 5.8185 4.29968 5.21216 4.29968C4.60596 4.29951 4.11257 3.80631 4.11255 3.20007C4.11255 2.59382 4.60594 2.10063 5.21216 2.10046ZM11.7122 2.10046H11.9124V5.19519L12.1643 5.33875C12.2528 5.38958 12.3127 5.48664 12.3127 5.59753V9.02234L12.97 8.80457L13.3694 8.67175L13.7122 8.55847V6.89734H13.9124V8.83777L12.6545 9.25867L12.3127 9.37195V10.9003H13.9124V11.1005H12.2727L12.427 11.7216L12.9719 13.9003H11.7122V11.1005H10.8127C10.6464 11.1005 10.5129 10.966 10.5129 10.7997V7.20007C10.5129 7.03372 10.6464 6.90027 10.8127 6.90027H11.3127V5.60046C11.3127 5.48947 11.3725 5.39248 11.4612 5.34167L11.7122 5.19714V2.10046Z" stroke="currentColor"/>
    </svg>
  )
}

function MonetizationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3.86333 9.53741L2.682 8.35407L1.5 9.53741M12.1367 6.48474L13.318 7.66874L14.5 6.48474" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3179 7.66871C13.3179 6.25538 12.7579 4.90138 11.7606 3.90204C11.267 3.40755 10.6809 3.01523 10.0356 2.74755C9.39026 2.47986 8.69851 2.34207 7.99989 2.34204C7.32127 2.3415 6.64894 2.47212 6.01988 2.72671C5.31766 3.00826 4.68356 3.43636 4.15991 3.98243C3.63626 4.52849 3.23511 5.17997 2.98322 5.89338M2.68188 8.35338C2.68291 9.58975 3.11345 10.7874 3.89988 11.7414C4.68546 12.6943 5.77843 13.3437 6.99092 13.5782C8.20342 13.8126 9.45972 13.6174 10.5439 13.026C11.628 12.4335 12.4728 11.4829 12.9339 10.3367" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.38672 9.31867C6.42142 9.71444 6.6097 10.0809 6.91124 10.3396C7.21278 10.5982 7.60361 10.7286 8.00005 10.7027C9.30139 10.7027 9.61339 9.954 9.61339 9.31867C9.61339 8.68333 9.07539 8.01 8.00005 8.01C6.92472 8.01 6.38672 7.58467 6.38672 6.718C6.40165 6.41768 6.50769 6.12904 6.69074 5.89049C6.87379 5.65194 7.12516 5.47481 7.41139 5.38267C7.60139 5.32133 7.80139 5.29933 8.00005 5.318C8.397 5.30075 8.78547 5.43626 9.08556 5.69667C9.38565 5.95708 9.57454 6.32258 9.61339 6.718M8.00005 11.5093V10.8087M8.00005 4.50867V5.31533" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PlayerBehaviourIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4.66667 5.33133H4.11733C3.11933 5.33133 2.62 5.33133 2.31067 5.03799C2 4.74666 2 4.27533 2 3.33333C2 2.39133 2 1.91999 2.31 1.62799C2.62 1.33533 3.11933 1.33533 4.11733 1.33533H11.882C12.8807 1.33533 13.38 1.33533 13.69 1.62799C14 1.92066 14 2.39066 14 3.33266C14 4.27466 14 4.74599 13.69 5.03866C13.38 5.33133 12.8807 5.33133 11.882 5.33133H11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.02 14.6606C11.9867 13.5186 12.08 13.3673 12.1674 13.114C12.2554 12.8593 12.7987 11.9573 13.016 11.302C13.7174 9.18329 13.1807 8.82529 12.34 8.18196C11.3774 7.44396 9.74669 7.06862 8.73003 7.14996V4.42329C8.73003 3.84796 8.17936 3.34729 7.56203 3.34729C6.94469 3.34729 6.39803 3.84796 6.39803 4.42329V9.59129L5.08403 8.47262C4.72936 8.11462 4.16203 8.14729 3.75069 8.41862C3.62278 8.50322 3.52024 8.62096 3.45403 8.75929C3.26736 9.15196 3.32069 9.59596 3.61536 9.95929L4.36203 10.9226M4.36203 10.9226C4.54069 11.1386 4.72136 11.3906 4.94803 11.6773M4.36203 10.9226L4.94803 11.6773M6.35203 14.6646V14.034C6.40069 13.2586 5.69669 12.6366 4.94803 11.6773" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function TeamDynamicsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M14 7.33336V5.33336C14 4.97974 13.8595 4.6406 13.6095 4.39055C13.3594 4.1405 13.0203 4.00002 12.6667 4.00002H8.66667M8.66667 4.00002L10.6667 6.00002M8.66667 4.00002L10.6667 2.00003M2 8.67536V10.6754C2 11.029 2.14048 11.3681 2.39052 11.6182C2.64057 11.8682 2.97971 12.0087 3.33333 12.0087H7.33333M7.33333 12.0087L5.33333 10.0087M7.33333 12.0087L5.33333 14.0087M14 14.3327C14 13.9791 13.8595 13.6399 13.6095 13.3899C13.3594 13.1398 13.0203 12.9994 12.6667 12.9994H11.3333C10.9797 12.9994 10.6406 13.1398 10.3905 13.3899C10.1405 13.6399 10 13.9791 10 14.3327M6 6.33269C6 5.97907 5.85952 5.63993 5.60948 5.38988C5.35943 5.13983 5.02029 4.99936 4.66667 4.99936H3.33333C2.97971 4.99936 2.64057 5.13983 2.39052 5.38988C2.14048 5.63993 2 5.97907 2 6.33269M10.6667 11.0014C10.6667 11.1765 10.7012 11.3499 10.7683 11.5117C10.8354 11.6735 10.9337 11.8205 11.0575 11.9443C11.1814 12.0681 11.3284 12.1663 11.4903 12.2333C11.6521 12.3003 11.8255 12.3347 12.0007 12.3347C12.1758 12.3346 12.3492 12.3001 12.511 12.233C12.6728 12.166 12.8198 12.0677 12.9436 11.9438C13.0674 11.82 13.1656 11.6729 13.2326 11.5111C13.2996 11.3493 13.334 11.1758 13.334 11.0007C13.3339 10.647 13.1933 10.3078 12.9431 10.0577C12.693 9.8077 12.3537 9.66727 12 9.66736C11.6463 9.66745 11.3071 9.80804 11.0571 10.0582C10.807 10.3084 10.6666 10.6476 10.6667 11.0014ZM2.66667 3.00136C2.66671 3.1765 2.70125 3.34991 2.76831 3.5117C2.83538 3.6735 2.93365 3.82049 3.05752 3.94431C3.1814 4.06812 3.32844 4.16632 3.49027 4.2333C3.65209 4.30028 3.82553 4.33474 4.00067 4.33469C4.17581 4.33465 4.34922 4.30011 4.51101 4.23304C4.6728 4.16598 4.8198 4.06771 4.94361 3.94383C5.06743 3.81996 5.16563 3.67291 5.23261 3.51109C5.29959 3.34926 5.33404 3.17583 5.334 3.00069C5.33391 2.64698 5.19332 2.30779 4.94314 2.05774C4.69297 1.8077 4.35371 1.66727 4 1.66736C3.64629 1.66745 3.3071 1.80804 3.05705 2.05822C2.807 2.30839 2.66658 2.64765 2.66667 3.00136Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function FrustationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6.75 12C6.75 12 7.25 11.5 8 11.5C8.75 11.5 9.25 12 9.25 12M14.5 8C14.5 11.59 11.59 14.5 8 14.5C4.41 14.5 1.5 11.59 1.5 8C1.5 4.41 4.41 1.5 8 1.5C11.59 1.5 14.5 4.41 14.5 8ZM11.5 9C11.5 9.13261 11.4473 9.25979 11.3536 9.35355C11.2598 9.44732 11.1326 9.5 11 9.5C10.8674 9.5 10.7402 9.44732 10.6464 9.35355C10.5527 9.25979 10.5 9.13261 10.5 9C10.5 8.86739 10.5527 8.74021 10.6464 8.64645C10.7402 8.55268 10.8674 8.5 11 8.5C11.1326 8.5 11.2598 8.55268 11.3536 8.64645C11.4473 8.74021 11.5 8.86739 11.5 9ZM5.5 9C5.5 9.13261 5.44732 9.25979 5.35355 9.35355C5.25979 9.44732 5.13261 9.5 5 9.5C4.86739 9.5 4.74021 9.44732 4.64645 9.35355C4.55268 9.25979 4.5 9.13261 4.5 9C4.5 8.86739 4.55268 8.74021 4.64645 8.64645C4.74021 8.55268 4.86739 8.5 5 8.5C5.13261 8.5 5.25979 8.55268 5.35355 8.64645C5.44732 8.74021 5.5 8.86739 5.5 9Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SourceTagsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4.5A1.5 1.5 0 013.5 3h4l1.5 1.5H13A1.5 1.5 0 0114.5 6v5.5A1.5 1.5 0 0113 13H3.5A1.5 1.5 0 012 11.5v-7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6" cy="8.5" r="1" fill="currentColor"/>
    </svg>
  )
}

// Human-readable labels for the video source facet
const SOURCE_LABELS: Record<VideoSource, string> = {
  live: 'Live capture',
  'manual-upload': 'Manual upload',
  'ai-player': 'AI Player',
}

// ─── Types ──────────────────────────────────────────────────────────────────

type FilterCategory =
  | 'source-tags'
  | 'match-context'
  | 'combat-performance'
  | 'monetization-patterns'
  | 'player-behaviour'
  | 'team-dynamics'
  | 'frustation-markers'

const CATEGORIES: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'source-tags', label: 'Source & Tags', icon: <SourceTagsIcon /> },
  { id: 'match-context', label: 'Match Context', icon: <MatchContextIcon /> },
  { id: 'combat-performance', label: 'Combat Performance', icon: <CombatIcon /> },
  { id: 'monetization-patterns', label: 'Monetization Patterns', icon: <MonetizationIcon /> },
  { id: 'player-behaviour', label: 'Player Behaviour', icon: <PlayerBehaviourIcon /> },
  { id: 'team-dynamics', label: 'Team Dynamics', icon: <TeamDynamicsIcon /> },
  { id: 'frustation-markers', label: 'Frustation Markers', icon: <FrustationIcon /> },
]

// ─── Filter option data per category ────────────────────────────────────────

// Match Context
const GAME_MODES = ['Training', 'Social Island', 'Battle Royale', 'Clash Squad', 'Lone Wolf', 'Custom', 'Craftland', 'Other']
const GAME_MODES_SPAN2 = ['Ranked Battle Royale', 'Ranked Clash Squad']
const MAPS = ['Bermuda', 'Alpine', 'Purgatory', 'Nexterra', 'Kalahari', 'Solara', 'Bermuda 2.0', 'Iron Cage']
const PLACEMENTS = ['Winner', 'Top 3', 'Top 10', 'Top 25', 'Bottom 50%', 'Loser']
const MATCH_PLAYED = ['Only 1', 'More than 1']

// Combat Performance
const DAMAGE_DEALT = ['0-500', '500-1000', '1000-2000', '2000+', '3000+']
const HEADSHOT_RATE = ['0-25%', '25-50%', '50-75%', '75-100%']

// Monetization Patterns
const PURCHASE_TYPES = ['Skins', 'Weapons', 'Characters', 'Battle Pass', 'Bundles']

// Player Behaviour
const PLAY_STYLES = ['Aggressive', 'Defensive', 'Balanced', 'Camper', 'Rusher', 'Sniper']
const LOOTING_EFFICIENCY = ['Low', 'Medium', 'High']
const WEAPONS = ['AR', 'SMG', 'Shotgun', 'Sniper', 'Pistol', 'LMG', 'Melee', 'Launcher', 'Crossbow', 'Grenade']

// Team Dynamics
const TEAM_COORDINATION = ['Low', 'Medium', 'High']
const COMMUNICATION = ['Voice Chat', 'Quick Chat', 'Silent']

// Frustation Markers
const QUIT_REASONS = ['Died Early', 'Team Wipe', 'Lag', 'AFK Kick', 'Rage Quit']

// ─── Filter State ───────────────────────────────────────────────────────────

export interface FilterState {
  // Source & Tags (wired to the session data)
  sources: string[]
  sessionTags: string[]
  sessionAiTags: string[]
  // Match Context
  gameModes: string[]
  maps: string[]
  durationMin: number
  durationMax: number
  placements: string[]
  matchPlayed: string[]
  shopDuringGameplay: boolean
  // Combat Performance
  killsMin: number
  killsMax: number
  deathsMin: number
  deathsMax: number
  damageDealt: string[]
  headshotRate: string[]
  // Monetization Patterns
  shopVisitsMin: number
  shopVisitsMax: number
  purchaseTypes: string[]
  inAppPurchase: boolean
  // Player Behaviour
  playStyles: string[]
  lootingEfficiency: string[]
  weapons: string[]
  samespotDeathsMin: number
  samespotDeathsMax: number
  // Team Dynamics
  teamCoordination: string[]
  communication: string[]
  revivesMin: number
  revivesMax: number
  // Frustation Markers
  quitReasons: string[]
  rageQuitMin: number
  rageQuitMax: number
  idleTimeMin: number
  idleTimeMax: number
}

const DEFAULT_FILTERS: FilterState = {
  sources: [], sessionTags: [], sessionAiTags: [],
  gameModes: [], maps: [], durationMin: 1, durationMax: 60, placements: [], matchPlayed: [], shopDuringGameplay: false,
  killsMin: 0, killsMax: 30, deathsMin: 0, deathsMax: 20, damageDealt: [], headshotRate: [],
  shopVisitsMin: 0, shopVisitsMax: 10, purchaseTypes: [], inAppPurchase: false,
  playStyles: [], lootingEfficiency: [], weapons: [], samespotDeathsMin: 0, samespotDeathsMax: 10,
  teamCoordination: [], communication: [], revivesMin: 0, revivesMax: 10,
  quitReasons: [], rageQuitMin: 0, rageQuitMax: 100, idleTimeMin: 0, idleTimeMax: 30,
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
  onApply?: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
  /** Source facets present in the data (Source & Tags category) */
  allSources?: VideoSource[]
  /** Upload tags present in the data (Source & Tags category) */
  allTags?: string[]
  /** AI-extracted tags present in the data (Source & Tags category) */
  allAiTags?: string[]
}

// ─── Highlight bar position (from Figma Console: y=74, stride=45) ───────────
const HIGHLIGHT_BASE_Y = 77
const ITEM_STRIDE = 45  /* 37px item height + 8px gap */

export function FilterDialog({ isOpen, onClose, onApply, initialFilters, allSources = [], allTags = [], allAiTags = [] }: FilterDialogProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('source-tags')
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  }))

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isOpen])

  const selectedCount = useMemo(() => {
    let count = 0
    count += filters.sources.length + filters.sessionTags.length + filters.sessionAiTags.length
    count += filters.gameModes.length + filters.maps.length + filters.placements.length + filters.matchPlayed.length
    count += filters.damageDealt.length + filters.headshotRate.length
    count += filters.purchaseTypes.length
    count += filters.playStyles.length + filters.lootingEfficiency.length + filters.weapons.length
    count += filters.teamCoordination.length + filters.communication.length
    count += filters.quitReasons.length
    if (filters.shopDuringGameplay) count++
    if (filters.inAppPurchase) count++
    if (filters.durationMin !== 1 || filters.durationMax !== 60) count++
    if (filters.killsMin !== 0 || filters.killsMax !== 30) count++
    if (filters.deathsMin !== 0 || filters.deathsMax !== 20) count++
    if (filters.shopVisitsMin !== 0 || filters.shopVisitsMax !== 10) count++
    if (filters.samespotDeathsMin !== 0 || filters.samespotDeathsMax !== 10) count++
    if (filters.revivesMin !== 0 || filters.revivesMax !== 10) count++
    if (filters.rageQuitMin !== 0 || filters.rageQuitMax !== 100) count++
    if (filters.idleTimeMin !== 0 || filters.idleTimeMax !== 30) count++
    return count
  }, [filters])

  const toggleArrayItem = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const arr = prev[key] as string[]
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      return { ...prev, [key]: next }
    })
  }, [])

  const handleClearAll = useCallback(() => { setFilters({ ...DEFAULT_FILTERS }) }, [])

  const handleApply = useCallback(() => {
    onApply?.(filters)
    onClose()
  }, [filters, onApply, onClose])

  if (!isOpen) return null

  const activeIndex = CATEGORIES.findIndex(c => c.id === activeCategory)
  const highlightTop = HIGHLIGHT_BASE_Y + activeIndex * ITEM_STRIDE

  return createPortal(
    <div className="filter-dialog-overlay" onClick={onClose}>
      <div className="filter-dialog" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Filters">
        {/* Highlight bar */}
        <div className="filter-sidebar-indicator" style={{ top: `${highlightTop}px` }} />

        {/* Header */}
        <div className="filter-dialog-header">
          <span className="filter-dialog-title">Filters</span>
          <button type="button" className="filter-dialog-close" onClick={onClose} aria-label="Close filters">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 1l9 9M10 1l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="filter-dialog-body">
          <div className="filter-dialog-row">
            <div className="filter-sidebar">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} type="button" className="filter-sidebar-item" data-active={String(activeCategory === cat.id)} onClick={() => setActiveCategory(cat.id)}>
                  <span className="filter-sidebar-item-icon">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="filter-content">
              <CategoryContent
                category={activeCategory}
                filters={filters}
                setFilters={setFilters}
                toggleArrayItem={toggleArrayItem}
                allSources={allSources}
                allTags={allTags}
                allAiTags={allAiTags}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-dialog-footer">
          <div className="filter-footer-left">
            <Button variant="tertiary" size="lg" onClick={handleClearAll}>Clear all</Button>
            {selectedCount > 0 && <span className="filter-selected-count">{selectedCount} Selected</span>}
          </div>
          <div className="filter-footer-right">
            <Button variant="tertiary" size="lg" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="lg" onClick={handleApply}>Apply</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Category Content Router ────────────────────────────────────────────────

interface CategoryProps {
  category: FilterCategory
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  toggleArrayItem: (key: keyof FilterState, value: string) => void
  allSources: VideoSource[]
  allTags: string[]
  allAiTags: string[]
}

function CategoryContent({ category, filters, setFilters, toggleArrayItem, allSources, allTags, allAiTags }: CategoryProps) {
  switch (category) {
    case 'source-tags': return <SourceTagsContent filters={filters} toggleArrayItem={toggleArrayItem} allSources={allSources} allTags={allTags} allAiTags={allAiTags} />
    case 'match-context': return <MatchContextContent filters={filters} setFilters={setFilters} toggleArrayItem={toggleArrayItem} />
    case 'combat-performance': return <CombatPerformanceContent filters={filters} setFilters={setFilters} toggleArrayItem={toggleArrayItem} />
    case 'monetization-patterns': return <MonetizationContent filters={filters} setFilters={setFilters} toggleArrayItem={toggleArrayItem} />
    case 'player-behaviour': return <PlayerBehaviourContent filters={filters} setFilters={setFilters} toggleArrayItem={toggleArrayItem} />
    case 'team-dynamics': return <TeamDynamicsContent filters={filters} setFilters={setFilters} toggleArrayItem={toggleArrayItem} />
    case 'frustation-markers': return <FrustationMarkersContent filters={filters} setFilters={setFilters} toggleArrayItem={toggleArrayItem} />
  }
}

// ─── Shared content props ───────────────────────────────────────────────────

type ContentProps = Omit<CategoryProps, 'category' | 'allSources' | 'allTags' | 'allAiTags'>

// ─── Source & Tags ──────────────────────────────────────────────────────────

interface SourceTagsProps {
  filters: FilterState
  toggleArrayItem: (key: keyof FilterState, value: string) => void
  allSources: VideoSource[]
  allTags: string[]
  allAiTags: string[]
}

function SourceTagsContent({ filters, toggleArrayItem, allSources, allTags, allAiTags }: SourceTagsProps) {
  return (
    <div className="filter-surface-panel">
      <div className="filter-card">
        <span className="filter-section-header">Video Source</span>
        <div className="filter-tags-wrap">
          {allSources.map((s) => (
            <FilterTag
              key={s}
              label={SOURCE_LABELS[s]}
              selected={filters.sources.includes(s)}
              onClick={() => toggleArrayItem('sources', s)}
            />
          ))}
        </div>
      </div>

      <div className="filter-card">
        <span className="filter-section-header">Tags</span>
        {allTags.length > 0 ? (
          <div className="filter-tags-wrap">
            {allTags.map((t) => (
              <FilterTag
                key={t}
                label={t}
                selected={filters.sessionTags.includes(t)}
                onClick={() => toggleArrayItem('sessionTags', t)}
              />
            ))}
          </div>
        ) : (
          <span className="font-body text-xs" style={{ color: 'var(--text-placeholder)' }}>No tags yet</span>
        )}
      </div>

      <div className="filter-card">
        <span className="filter-section-header">AI Tags</span>
        {allAiTags.length > 0 ? (
          <div className="filter-tags-wrap">
            {allAiTags.map((t) => {
              const active = filters.sessionAiTags.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleArrayItem('sessionAiTags', t)}
                  aria-pressed={active}
                  className="rounded-round"
                  style={active ? { outline: '2px solid var(--brand)', outlineOffset: '1px' } : undefined}
                >
                  <AiTag label={t} />
                </button>
              )
            })}
          </div>
        ) : (
          <span className="font-body text-xs" style={{ color: 'var(--text-placeholder)' }}>No AI tags yet</span>
        )}
      </div>
    </div>
  )
}

// ─── Match Context ──────────────────────────────────────────────────────────

function MatchContextContent({ filters, setFilters, toggleArrayItem }: ContentProps) {
  return (
    <div className="filter-surface-panel">
      <div className="filter-card">
        <span className="filter-section-header">Game Mode</span>
        <div className="filter-checkbox-grid">
          {GAME_MODES.map(mode => (
            <Checkbox key={mode} label={mode} className="filter-checkbox" checked={filters.gameModes.includes(mode)} onChange={() => toggleArrayItem('gameModes', mode)} />
          ))}
          {GAME_MODES_SPAN2.map(mode => (
            <div key={mode} className="filter-checkbox-grid-span2">
              <Checkbox label={mode} className="filter-checkbox" checked={filters.gameModes.includes(mode)} onChange={() => toggleArrayItem('gameModes', mode)} />
            </div>
          ))}
        </div>
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Map</span>
        <div className="filter-checkbox-grid">
          {MAPS.map(map => (
            <Checkbox key={map} label={map} className="filter-checkbox" checked={filters.maps.includes(map)} onChange={() => toggleArrayItem('maps', map)} />
          ))}
        </div>
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Match Duration</span>
        <RangeSlider min={1} max={60} valueLow={filters.durationMin} valueHigh={filters.durationMax} unit="min" onChange={(low, high) => setFilters(prev => ({ ...prev, durationMin: low, durationMax: high }))} />
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Placement</span>
        <div className="filter-tags-wrap">
          {PLACEMENTS.map(p => <FilterTag key={p} label={p} selected={filters.placements.includes(p)} onClick={() => toggleArrayItem('placements', p)} />)}
        </div>
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Match Played</span>
        <div className="filter-tags-wrap">
          {MATCH_PLAYED.map(m => <FilterTag key={m} label={m} selected={filters.matchPlayed.includes(m)} onClick={() => toggleArrayItem('matchPlayed', m)} />)}
        </div>
      </div>
      <div className="filter-card-toggle">
        <div className="filter-toggle-row">
          <span className="filter-section-header">Shop During Gameplay</span>
          <Toggle checked={filters.shopDuringGameplay} onChange={e => setFilters(prev => ({ ...prev, shopDuringGameplay: e.target.checked }))} />
        </div>
      </div>
    </div>
  )
}

// ─── Combat Performance ─────────────────────────────────────────────────────

function CombatPerformanceContent({ filters, setFilters, toggleArrayItem }: ContentProps) {
  return (
    <div className="filter-surface-panel">
      <div className="filter-card">
        <span className="filter-section-header">Elimination Count</span>
        <RangeSlider min={0} max={30} valueLow={filters.killsMin} valueHigh={filters.killsMax} onChange={(low, high) => setFilters(prev => ({ ...prev, killsMin: low, killsMax: high }))} />
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Death Count</span>
        <RangeSlider min={0} max={20} valueLow={filters.deathsMin} valueHigh={filters.deathsMax} onChange={(low, high) => setFilters(prev => ({ ...prev, deathsMin: low, deathsMax: high }))} />
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Damage Dealt</span>
        <div className="filter-tags-wrap">
          {DAMAGE_DEALT.map(d => <FilterTag key={d} label={d} selected={filters.damageDealt.includes(d)} onClick={() => toggleArrayItem('damageDealt', d)} />)}
        </div>
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Headshot Rate</span>
        <div className="filter-tags-wrap">
          {HEADSHOT_RATE.map(h => <FilterTag key={h} label={h} selected={filters.headshotRate.includes(h)} onClick={() => toggleArrayItem('headshotRate', h)} />)}
        </div>
      </div>
    </div>
  )
}

// ─── Monetization Patterns ──────────────────────────────────────────────────

function MonetizationContent({ filters, setFilters, toggleArrayItem }: ContentProps) {
  return (
    <div className="filter-surface-panel">
      <div className="filter-card">
        <span className="filter-section-header">Shop Visits</span>
        <RangeSlider min={0} max={10} valueLow={filters.shopVisitsMin} valueHigh={filters.shopVisitsMax} onChange={(low, high) => setFilters(prev => ({ ...prev, shopVisitsMin: low, shopVisitsMax: high }))} />
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Purchase Type</span>
        <div className="filter-tags-wrap">
          {PURCHASE_TYPES.map(p => <FilterTag key={p} label={p} selected={filters.purchaseTypes.includes(p)} onClick={() => toggleArrayItem('purchaseTypes', p)} />)}
        </div>
      </div>
      <div className="filter-card-toggle">
        <div className="filter-toggle-row">
          <span className="filter-section-header">In-App Purchase</span>
          <Toggle checked={filters.inAppPurchase} onChange={e => setFilters(prev => ({ ...prev, inAppPurchase: e.target.checked }))} />
        </div>
      </div>
    </div>
  )
}

// ─── Player Behaviour ───────────────────────────────────────────────────────

function PlayerBehaviourContent({ filters, setFilters, toggleArrayItem }: ContentProps) {
  return (
    <div className="filter-surface-panel">
      <div className="filter-card">
        <span className="filter-section-header">Play Style</span>
        <div className="filter-tags-wrap">
          {PLAY_STYLES.map(s => <FilterTag key={s} label={s} selected={filters.playStyles.includes(s)} onClick={() => toggleArrayItem('playStyles', s)} />)}
        </div>
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Looting Efficiency</span>
        <div className="filter-tags-wrap">
          {LOOTING_EFFICIENCY.map(l => <FilterTag key={l} label={l} selected={filters.lootingEfficiency.includes(l)} onClick={() => toggleArrayItem('lootingEfficiency', l)} />)}
        </div>
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Weapon Preference</span>
        <div className="filter-checkbox-grid">
          {WEAPONS.map(w => (
            <Checkbox key={w} label={w} className="filter-checkbox" checked={filters.weapons.includes(w)} onChange={() => toggleArrayItem('weapons', w)} />
          ))}
        </div>
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Same Spot Deaths</span>
        <RangeSlider min={0} max={10} valueLow={filters.samespotDeathsMin} valueHigh={filters.samespotDeathsMax} onChange={(low, high) => setFilters(prev => ({ ...prev, samespotDeathsMin: low, samespotDeathsMax: high }))} />
      </div>
    </div>
  )
}

// ─── Team Dynamics ──────────────────────────────────────────────────────────

function TeamDynamicsContent({ filters, setFilters, toggleArrayItem }: ContentProps) {
  return (
    <div className="filter-surface-panel">
      <div className="filter-card">
        <span className="filter-section-header">Team Coordination</span>
        <div className="filter-tags-wrap">
          {TEAM_COORDINATION.map(t => <FilterTag key={t} label={t} selected={filters.teamCoordination.includes(t)} onClick={() => toggleArrayItem('teamCoordination', t)} />)}
        </div>
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Communication</span>
        <div className="filter-tags-wrap">
          {COMMUNICATION.map(c => <FilterTag key={c} label={c} selected={filters.communication.includes(c)} onClick={() => toggleArrayItem('communication', c)} />)}
        </div>
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Revives Given</span>
        <RangeSlider min={0} max={10} valueLow={filters.revivesMin} valueHigh={filters.revivesMax} onChange={(low, high) => setFilters(prev => ({ ...prev, revivesMin: low, revivesMax: high }))} />
      </div>
    </div>
  )
}

// ─── Frustation Markers ─────────────────────────────────────────────────────

function FrustationMarkersContent({ filters, setFilters, toggleArrayItem }: ContentProps) {
  return (
    <div className="filter-surface-panel">
      <div className="filter-card">
        <span className="filter-section-header">Quit Reason</span>
        <div className="filter-tags-wrap">
          {QUIT_REASONS.map(q => <FilterTag key={q} label={q} selected={filters.quitReasons.includes(q)} onClick={() => toggleArrayItem('quitReasons', q)} />)}
        </div>
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Rage Quit Rate</span>
        <RangeSlider min={0} max={100} valueLow={filters.rageQuitMin} valueHigh={filters.rageQuitMax} unit="%" onChange={(low, high) => setFilters(prev => ({ ...prev, rageQuitMin: low, rageQuitMax: high }))} />
      </div>
      <div className="filter-card">
        <span className="filter-section-header">Idle Time</span>
        <RangeSlider min={0} max={30} valueLow={filters.idleTimeMin} valueHigh={filters.idleTimeMax} unit="min" onChange={(low, high) => setFilters(prev => ({ ...prev, idleTimeMin: low, idleTimeMax: high }))} />
      </div>
    </div>
  )
}
