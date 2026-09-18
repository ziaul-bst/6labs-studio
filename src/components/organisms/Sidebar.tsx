/**
 * Sidebar — Primary navigation panel for 6labs Studio.
 * Variants: Expanded (300px), Collapsed (60px icon-only).
 * 300 rather than 280 (2026-09-09): the Intelligence / Testing segment and the
 * longer Testing row labels need the room once translated.
 * Animates between states with CSS transition.
 *
 * The sidebar is **area-driven**: its nav, context and history sections are all
 * derived from the active area's config in `lib/studioAreas.ts`, so Intelligence
 * and Testing share one component and one data shape rather than being two
 * structural variants. The area switch itself renders only when the account is
 * entitled to more than one area — see AreaSegment.
 *
 * Interactions:
 *  - Header: collapse icon (expanded) / expand icon on hover (collapsed)
 *  - Area segment: switches area, sidebar contents follow
 *  - Game card: opens the game selector dropdown (`sidebar-top`), sits in the
 *    footer row beside the avatar (`footer-inline`), or lives inside the
 *    footer profile menu (`footer-menu`)
 *  - Footer profile: language overlay, or the profile menu — which carries the
 *    game section only when the game has no control of its own
 *
 * @figmaComponent  Sidebar
 * @figmaNode       2466:48531
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=2466-48531
 */

import { useState, useRef, useEffect, type ComponentType } from 'react'
import { RadiologistIcon } from '../icons/RadiologistIcon'
import { OracleIcon } from '../icons/OracleIcon'
import { ForecasterIcon } from '../icons/ForecasterIcon'
import { SpecializedAgentsIcon } from '../icons/SpecializedAgentsIcon'
import { UploadIcon } from '../icons/UploadIcon'
import { VideoLibraryIcon } from '../icons/VideoLibraryIcon'
import { ConnectorIcon } from '../icons/ConnectorIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'
import { CollapseIcon } from '../icons/CollapseIcon'
import { ExpandIcon } from '../icons/ExpandIcon'
import { LogoutIcon } from '../icons/LogoutIcon'
import Button from '../ui/Button'
import { GameSelector } from '../molecules/GameSelector'
import { GameSelectorDropdown } from '../molecules/GameSelectorDropdown'
import { SidebarNavItem } from '../molecules/SidebarNavItem'
import { SidebarTaskItem } from '../molecules/SidebarTaskItem'
import { SidebarProfile } from '../molecules/SidebarProfile'
import { SidebarProfileMenu } from '../molecules/SidebarProfileMenu'
import { SidebarFooterGame } from '../molecules/SidebarFooterGame'
import { LanguageSelector } from '../molecules/LanguageSelector'
import { AreaSegment } from '../molecules/AreaSegment'
import { MembersIcon } from '../icons/MembersIcon'
import { QueryIcon } from '../icons/QueryIcon'
import { GridIcon } from '../icons/GridIcon'
import { FunctionalTestIcon } from '../icons/FunctionalTestIcon'
import { AIFunctionalIcon } from '../icons/AIFunctionalIcon'
import { AgencyTestIcon } from '../icons/AgencyTestIcon'
import { BetaTestIcon } from '../icons/BetaTestIcon'
import { AIBehaviouralIcon } from '../icons/AIBehaviouralIcon'
import { AIScaleIcon } from '../icons/AIScaleIcon'
import { TestCaseGenIcon } from '../icons/TestCaseGenIcon'
import { LocalizationIcon } from '../icons/LocalizationIcon'
import type { IconProps } from '../icons/types'
import {
  AREA_NAV,
  type AreaEntitlement,
  type GamePlacement,
  type NavIconKey,
  type NavTone,
  type StudioArea,
} from '../../lib/studioAreas'

type ActiveNav =
  | 'home' | 'barista' | 'library' | 'radiologist' | 'oracle' | 'forecaster'
  | 'coach' | 'guardian' | 'specialized' | 'uploads' | 'connectors'
  | 'testing-home' | 'functional-test' | 'agency-test' | 'user-test' | 'beta-test'
  | 'ai-functional-test' | 'ai-behavioural-test' | 'ai-scale-test' | 'test-case-gen' | 'lqa'


/**
 * Nav icons, resolved from the area config's string keys so `studioAreas.ts`
 * stays free of JSX. Each area's landing row gets its own icon — `query` for
 * Intelligence, `overview` for Testing — so the two never read as the same
 * "Home" in the collapsed 60px column.
 */
/** Exported so a locked area's pitch can draw its rows with the same glyphs. */
export const NAV_ICONS: Record<NavIconKey, ComponentType<IconProps>> = {
  query: QueryIcon,
  overview: GridIcon,
  oracle: OracleIcon,
  radiologist: RadiologistIcon,
  forecaster: ForecasterIcon,
  specialized: SpecializedAgentsIcon,
  uploads: UploadIcon,
  connectors: ConnectorIcon,
  library: VideoLibraryIcon,
  'functional-test': FunctionalTestIcon,
  'agency-test': AgencyTestIcon,
  'user-test': MembersIcon,
  'beta-test': BetaTestIcon,
  'ai-functional-test': AIFunctionalIcon,
  'ai-behavioural-test': AIBehaviouralIcon,
  'ai-scale-test': AIScaleIcon,
  'test-case-gen': TestCaseGenIcon,
  lqa: LocalizationIcon,
}

const DEFAULT_HISTORY_ITEMS: HistoryItem[] = [
  { id: 'h1', query: 'Show me players who got booyah' },
  { id: 'h2', query: 'Where are players getting stuck or confused in the tutorial?' },
  { id: 'h3', query: 'Show me players who played the most matches' },
  { id: 'h4', query: 'Show me players with the best squad win rate' },
]

/** Expanded width. Exported so the page shell and stories stay in step. */
export const SIDEBAR_WIDTH = 300

export interface HistoryItem {
  id: string
  query: string
  state?: 'default' | 'loading' | 'complete'
}

/** SVG logotype for "6labs.ai" — exported from Figma node 5035:128050 */
function LogoType({ className }: { className?: string }) {
  return (
    <svg
      width="103"
      height="22"
      viewBox="0 0 104 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="6labs.ai"
      className={className}
    >
      <path d="M0.00024935 12.9306V11.7799C0.00024935 10.2836-0.00127148 9.0517 0.0815639 8.05212C0.166176 7.03125 0.347959 6.09326 0.80334 5.21442C1.48385 3.90116 2.55424 2.83077 3.8675 2.15026C4.74634 1.69488 5.68433 1.5131 6.7052 1.42848C7.70478 1.34565 8.93664 1.34717 10.433 1.34717H13.1169C13.3701 1.34717 13.4968 1.34717 13.5754 1.42584C13.6541 1.50451 13.6541 1.63113 13.6541 1.88437V4.39131C13.6541 4.64455 13.6541 4.77116 13.5754 4.84984C13.4968 4.92851 13.3701 4.92851 13.1169 4.92851H10.433C8.87667 4.92851 7.81853 4.92985 7.00117 4.99758C6.2052 5.06354 5.79867 5.18297 5.51521 5.32983C4.85853 5.6701 4.32318 6.20545 3.98291 6.86213C3.83604 7.14559 3.71662 7.55212 3.65066 8.34809C3.63498 8.53727 3.62332 8.73936 3.61394 8.95751H9.62509C10.0029 8.95751 10.3071 8.95595 10.5799 8.97981C13.3934 9.22596 15.624 11.4566 15.8701 14.2701C15.894 14.5428 15.8924 14.847 15.8924 15.2249C15.8924 15.6027 15.894 15.9069 15.8701 16.1796C15.624 18.9931 13.3934 21.2237 10.5799 21.4699C10.3071 21.4938 10.0029 21.4922 9.62509 21.4922H8.56188C6.97411 21.4922 5.78315 21.5118 4.76589 21.2032C2.6198 20.5522 0.940247 18.8726 0.289222 16.7265C-0.0193603 15.7093 0.00024935 14.5183 0.00024935 12.9306ZM3.58159 12.9306C3.58159 14.7789 3.60118 15.3062 3.71667 15.6869C4.0205 16.6884 4.80408 17.4719 5.8055 17.7758C6.18624 17.8913 6.71355 17.9109 8.56188 17.9109H9.62509C10.0784 17.9109 10.19 17.9093 10.2677 17.9025C11.3499 17.8079 12.2081 16.9496 12.3028 15.8675C12.3096 15.7898 12.3111 15.6782 12.3111 15.2249C12.3111 14.7715 12.3096 14.6599 12.3028 14.5822C12.2081 13.5001 11.3499 12.6418 10.2677 12.5472C10.19 12.5404 10.0784 12.5388 9.62509 12.5388H3.58159V12.9306Z" fill="#030D2D"/>
      <path d="M70.2839 16.6798C70.2839 15.9999 69.7327 15.4487 69.0528 15.4487H64.2403C61.7679 15.4487 59.7637 13.4444 59.7637 10.972C59.7637 8.49964 61.7679 6.49536 64.2403 6.49536H72.0298C72.1781 6.49536 72.2984 6.61562 72.2984 6.76396V9.8081C72.2984 9.95644 72.1781 10.0767 72.0298 10.0767H64.2403C63.7459 10.0767 63.345 10.4776 63.345 10.972C63.345 11.4665 63.7459 11.8674 64.2403 11.8674H69.0528C71.7106 11.8674 73.8652 14.022 73.8652 16.6798C73.8652 19.3376 71.7106 21.4922 69.0528 21.4922H60.2561C60.1078 21.4922 59.9875 21.372 59.9875 21.2236V18.1795C59.9875 18.0311 60.1078 17.9109 60.2561 17.9109H69.0528C69.7327 17.9109 70.2839 17.3597 70.2839 16.6798Z" fill="#030D2D"/>
      <path d="M54.3917 13.9936C54.3917 12.9721 54.3903 12.3126 54.3497 11.8104C54.3108 11.3288 54.2448 11.1496 54.2007 11.0619C54.0279 10.7189 53.7494 10.4403 53.4063 10.2676C53.3186 10.2235 53.1395 10.1575 52.6579 10.1185C52.1557 10.0779 51.4961 10.0765 50.4746 10.0765H47.7662C47.513 10.0765 47.3864 10.0765 47.3077 9.99788C47.229 9.91921 47.229 9.79259 47.229 9.53935V8.28588C47.229 7.44175 47.229 7.01969 47.4913 6.75745C47.7535 6.49521 48.1756 6.49521 49.0197 6.49521H50.4746C51.4376 6.49521 52.2664 6.49401 52.9464 6.54898C53.647 6.60564 54.3444 6.73052 55.0164 7.06878C56.0458 7.58695 56.8813 8.42244 57.3995 9.45183C57.7377 10.1238 57.8626 10.8212 57.9193 11.5218C57.9742 12.2018 57.973 13.0306 57.973 13.9936C57.973 14.9566 57.9742 15.7854 57.9193 16.4654C57.8626 17.166 57.7377 17.8634 57.3995 18.5354C56.8813 19.5648 56.0458 20.4003 55.0164 20.9185C54.3444 21.2568 53.647 21.3816 52.9464 21.4383C52.2664 21.4933 51.4376 21.4921 50.4746 21.4921H49.7358C48.6007 21.4921 47.6055 21.4945 46.7962 21.4068C45.9534 21.3155 45.1025 21.1097 44.3345 20.5517C43.9165 20.248 43.5488 19.8803 43.2451 19.4623C42.6871 18.6943 42.4813 17.8434 42.3899 17.0005C42.3023 16.1912 42.3047 15.196 42.3047 14.061V1.21274C42.3047 0.959499 42.3047 0.83288 42.3834 0.754208C42.462 0.675537 42.5887 0.675537 42.8419 0.675537H45.3488C45.6021 0.675537 45.7287 0.675537 45.8074 0.754208C45.886 0.83288 45.886 0.959499 45.886 1.21274V14.061C45.886 15.2758 45.8884 16.0433 45.9503 16.6149C46.0086 17.1529 46.1022 17.3015 46.1427 17.3573C46.2254 17.4712 46.3256 17.5713 46.4395 17.6541C46.4952 17.6946 46.6439 17.7882 47.1818 17.8465C47.7534 17.9084 48.521 17.9107 49.7358 17.9107H50.4746C51.4961 17.9107 52.1557 17.9094 52.6579 17.8688C53.1395 17.8298 53.3186 17.7638 53.4063 17.7197C53.7494 17.547 54.0279 17.2684 54.2007 16.9253C54.2448 16.8377 54.3108 16.6585 54.3497 16.1769C54.3903 15.6747 54.3917 15.0151 54.3917 13.9936Z" fill="#030D2D"/>
      <path d="M40.291 13.9111C40.291 12.9013 40.2925 12.0318 40.232 11.3195C40.1696 10.585 40.032 9.85547 39.6606 9.15815C39.1634 8.22459 38.4016 7.45852 37.4708 6.9561C36.7756 6.58086 36.047 6.43894 35.3129 6.37247C34.6011 6.30803 33.7318 6.30466 32.7222 6.29903L28.3035 6.27447C28.0503 6.27306 27.9237 6.27236 27.8446 6.35059C27.7655 6.42881 27.7648 6.55542 27.7634 6.80865L27.7493 9.3156C27.7479 9.56885 27.7472 9.69547 27.8254 9.77458C27.9036 9.8537 28.0302 9.8544 28.2835 9.85581L32.7021 9.88036C33.7732 9.88634 34.4646 9.89183 34.9898 9.93938C35.4928 9.98491 35.6781 10.0582 35.7697 10.1077C36.0799 10.2752 36.3337 10.5306 36.4994 10.8417C36.5484 10.9336 36.6206 11.1192 36.6633 11.6225C36.708 12.1482 36.7097 12.8398 36.7097 13.9111C36.7097 14.9922 36.7081 15.6906 36.6629 16.2211C36.6196 16.7296 36.5461 16.9166 36.4968 17.0085C36.3288 17.3215 36.0714 17.5775 35.7575 17.7438C35.6653 17.7927 35.4782 17.8653 34.9697 17.906C34.4391 17.9485 33.7409 17.9461 32.6601 17.9406L30.2189 17.9283C29.3521 17.9238 28.6517 17.2196 28.6517 16.3527C28.6517 15.4826 29.3571 14.7772 30.2272 14.7772H34.8295C35.0827 14.7772 35.2093 14.7772 35.288 14.6985C35.3667 14.6198 35.3667 14.4932 35.3667 14.24V12.9865C35.3667 12.1424 35.3667 11.7203 35.1044 11.4581C34.8422 11.1958 34.4201 11.1958 33.576 11.1958H30.2272C27.3792 11.1958 25.0703 13.5047 25.0703 16.3527C25.0704 19.1904 27.363 21.4946 30.2006 21.5092L32.6413 21.5219C33.6604 21.5271 34.5375 21.5335 35.2556 21.476C35.9959 21.4167 36.7314 21.2807 37.4345 20.9081C38.3764 20.4089 39.1487 19.641 39.6527 18.7017C40.029 18.0005 40.1685 17.2655 40.2316 16.5254C40.2927 15.8075 40.291 14.9304 40.291 13.9111Z" fill="#030D2D"/>
      <path d="M96.9199 13.9111C96.9199 12.9013 96.9214 12.0318 96.8609 11.3195C96.7985 10.585 96.6609 9.85547 96.2895 9.15815C95.7923 8.22459 95.0305 7.45852 94.0997 6.9561C93.4045 6.58086 92.6759 6.43894 91.9418 6.37247C91.23 6.30803 90.3607 6.30466 89.3511 6.29903L84.9325 6.27447C84.6792 6.27306 84.5526 6.27236 84.4735 6.35059C84.3944 6.42881 84.3937 6.55542 84.3923 6.80865L84.3782 9.3156C84.3768 9.56885 84.3761 9.69547 84.4543 9.77458C84.5325 9.8537 84.6592 9.8544 84.9124 9.85581L89.331 9.88036C90.4021 9.88634 91.0935 9.89183 91.6187 9.93938C92.1217 9.98491 92.307 10.0582 92.3987 10.1077C92.7088 10.2752 92.9626 10.5306 93.1283 10.8417C93.1773 10.9336 93.2495 11.1192 93.2922 11.6225C93.3369 12.1482 93.3386 12.8398 93.3386 13.9111C93.3386 14.9922 93.337 15.6906 93.2918 16.2211C93.2485 16.7296 93.175 16.9166 93.1257 17.0085C92.9577 17.3215 92.7003 17.5775 92.3864 17.7438C92.2942 17.7927 92.1071 17.8653 91.5986 17.906C91.068 17.9485 90.3698 17.9461 89.289 17.9406L86.8478 17.9283C85.981 17.9238 85.2806 17.2196 85.2806 16.3527C85.2806 15.4826 85.986 14.7772 86.8561 14.7772H91.4584C91.7116 14.7772 91.8382 14.7772 91.9169 14.6985C91.9956 14.6198 91.9956 14.4932 91.9956 14.24V12.9865C91.9956 12.1424 91.9956 11.7203 91.7333 11.4581C91.4711 11.1958 91.049 11.1958 90.2049 11.1958H86.8561C84.0081 11.1958 81.6992 13.5047 81.6992 16.3527C81.6993 19.1904 83.9919 21.4946 86.8295 21.5092L89.2702 21.5219C90.2893 21.5271 91.1664 21.5335 91.8845 21.476C92.6248 21.4167 93.3603 21.2807 94.0634 20.9081C95.0053 20.4089 95.7776 19.641 96.2816 18.7017C96.6579 18.0005 96.7974 17.2655 96.8605 16.5254C96.9216 15.8075 96.9199 14.9304 96.9199 13.9111Z" fill="#030D2D"/>
      <path d="M18.1309 16.5679V0.720504C18.1309 0.57216 18.2511 0.451904 18.3995 0.451904H21.4436C21.5919 0.451904 21.7122 0.572161 21.7122 0.720505V16.5679C21.7122 17.3096 22.3135 17.9109 23.0552 17.9109H24.1296C24.2779 17.9109 24.3982 18.0312 24.3982 18.1795V21.2237C24.3982 21.372 24.2779 21.4923 24.1296 21.4923H23.0552C20.3356 21.4923 18.1309 19.2876 18.1309 16.5679Z" fill="#030D2D"/>
      <path d="M102.696 6.27148C102.844 6.27148 102.964 6.39174 102.964 6.54008V21.2236C102.964 21.3719 102.844 21.4922 102.696 21.4922H99.6514C99.5031 21.4922 99.3828 21.3719 99.3828 21.2236V6.54009C99.3828 6.39174 99.5031 6.27148 99.6514 6.27148H102.696Z" fill="#030D2D"/>
      <path d="M75.5714 19.3888C75.5892 18.4443 75.5981 17.972 75.9835 17.5892C76.3689 17.2064 76.8489 17.2006 77.8087 17.189C77.8384 17.1887 77.8677 17.1885 77.8964 17.1885C77.9252 17.1885 77.9545 17.1887 77.9843 17.189C78.9441 17.2006 79.424 17.2064 79.8094 17.5892C80.1948 17.972 80.2037 18.4442 80.2215 19.3886C80.2222 19.428 80.2226 19.4665 80.2226 19.5041C80.2226 19.5546 80.2219 19.6067 80.2206 19.6601C80.1982 20.566 80.1869 21.0189 79.8104 21.3975C79.4339 21.776 78.982 21.7896 78.0782 21.8168C78.0157 21.8187 77.9549 21.8197 77.8965 21.8197C77.838 21.8197 77.7773 21.8187 77.7148 21.8168C76.8109 21.7896 76.3589 21.776 75.9824 21.3975C75.6059 21.0189 75.5947 20.5659 75.5723 19.6598C75.571 19.6065 75.5703 19.5545 75.5703 19.5041C75.5703 19.4666 75.5707 19.4281 75.5714 19.3888Z" fill="#030D2D"/>
      <path d="M99.1455 1.91267C99.161 1.09161 99.1687 0.681082 99.5037 0.348314C99.8387 0.015545 100.256 0.0105205 101.09 0.000471353C101.116 0.000160047 101.142-1.15178e-06 101.166-1.15178e-06C101.192-1.15178e-06 101.217 0.000160771 101.243 0.00047345C102.077 0.0105429 102.494 0.0155776 102.829 0.348327C103.164 0.681076 103.172 1.09154 103.188 1.91248C103.188 1.94671 103.189 1.98023 103.189 2.01288C103.189 2.05677 103.188 2.10207 103.187 2.14844C103.167 2.93593 103.158 3.32967 102.83 3.6587C102.503 3.98774 102.11 3.99957 101.325 4.02324C101.27 4.02488 101.217 4.02576 101.167 4.02576C101.116 4.02576 101.063 4.02488 101.009 4.02324C100.223 3.99959 99.83 3.98776 99.5027 3.6587C99.1755 3.32964 99.1657 2.93584 99.1463 2.14822C99.1451 2.10193 99.1445 2.0567 99.1445 2.01288C99.1445 1.98029 99.1449 1.94683 99.1455 1.91267Z" fill="#030D2D"/>
    </svg>
  )
}

/** SVG logo mark — 6labs hexagonal icon, exported from Figma node 4697:36847 */
function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="6labs logo mark">
        <path d="M27.4198 34.305C31.453 34.305 34.7225 31.0355 34.7225 27.0023C34.7225 22.9692 31.453 19.6997 27.4198 19.6997C23.3867 19.6997 20.1172 22.9692 20.1172 27.0023C20.1172 31.0355 23.3867 34.305 27.4198 34.305Z" fill="#030D2D"/>
        <path d="M16.2027 22.5763C16.2027 21.6096 16.6955 20.7139 17.5011 20.1926L36.0681 6.66308C36.1771 6.58252 36.1724 6.42139 36.0587 6.35031L30.4146 2.853C28.5807 1.71567 26.2586 1.71567 24.4247 2.853L7.59209 13.2786C5.91925 14.3164 4.90039 16.1456 4.90039 18.1123V20.3064C4.90039 20.4628 4.97621 20.6097 5.10416 20.695L15.9041 28.1682C16.0321 28.2535 16.2027 28.1682 16.2027 28.0118V22.5763Z" fill="#1770EF"/>
        <path d="M47.2471 40.7216C48.9199 39.6838 49.9388 37.8546 49.9388 35.888V18.1123C49.9388 16.1457 48.9199 14.3165 47.2471 13.2787L40.0203 8.80041C39.8544 8.69615 39.6459 8.70563 39.4895 8.8241L30.3813 15.5723C30.2723 15.6529 30.2818 15.814 30.3956 15.8851L37.2954 20.1595C38.1342 20.6761 38.6412 21.5907 38.6412 22.5764V31.4192C38.6412 32.4049 38.1342 33.3195 37.2954 33.836L30.5756 37.9968C30.4572 38.0678 30.4572 38.2337 30.5662 38.3143L40.0203 44.8587C40.1766 44.9677 40.3804 44.9724 40.5415 44.8729L47.2471 40.7169V40.7216Z" fill="#1770EF"/>
        <path d="M30.4146 51.1469C28.5807 52.2842 26.2586 52.2842 24.4247 51.1469L7.59209 40.7213C5.91925 39.6835 4.90039 37.8543 4.90039 35.8876V25.3246C4.90039 25.173 5.07573 25.0829 5.19894 25.1682L36.3951 47.133C36.5041 47.2136 36.4994 47.3795 36.3856 47.4506L30.4099 51.1516L30.4146 51.1469Z" fill="#1770EF"/>
      </svg>
    </div>
  )
}

interface Game {
  name: string
  genre: string
  imageUrl?: string
}

const AVAILABLE_GAMES: Game[] = [
  { name: 'MCOC', genre: 'Action' },
  { name: 'Maple Story', genre: 'Action' },
  { name: 'Superhotter', genre: 'Shooter' },
  { name: 'Pirates of the Sea', genre: 'RPG' },
]

interface SidebarProps {
  collapsed?: boolean
  activeNav?: ActiveNav
  onNavChange?: (nav: ActiveNav) => void
  onToggleCollapse?: () => void
  gameName?: string
  gameGenre?: string
  gameImageUrl?: string
  onGameChange?: (game: Game) => void
  language?: string
  onLanguageChange?: (lang: string) => void
  /** History items — supports active state and task indicators */
  historyItems?: HistoryItem[]
  /** Currently active history item ID */
  activeHistoryId?: string | null
  /** Called when a history item is clicked */
  onHistoryClick?: (id: string) => void
  /**
   * Areas the account can see. Fewer than two renders no area segment at all —
   * that is the whole single-area treatment.
   */
  areas?: AreaEntitlement[]
  /** Active area. The nav, context and history sections derive from it. */
  area?: StudioArea
  onAreaChange?: (area: StudioArea) => void
  /** Under PM review — see NavReviewSwitcher. */
  gamePlacement?: GamePlacement
  /** Nav ids sold separately and not on this plan — rows stay, marked with a lock. */
  lockedNavs?: string[]
  onLogout?: () => void
}

export function Sidebar({
  collapsed = false,
  activeNav = 'home',
  onNavChange,
  onToggleCollapse,
  gameName = 'Free Fire',
  gameGenre = 'Action',
  gameImageUrl,
  onGameChange,
  language = 'EN',
  onLanguageChange,
  historyItems,
  activeHistoryId,
  onHistoryClick,
  areas = [{ area: 'intelligence', entitlement: 'entitled' }, { area: 'testing', entitlement: 'entitled' }],
  area = 'intelligence',
  onAreaChange,
  gamePlacement = 'sidebar-top',
  lockedNavs = [],
  onLogout,
}: SidebarProps) {
  const displayHistory = historyItems ?? DEFAULT_HISTORY_ITEMS
  const hasActiveHistory = !!activeHistoryId
  /* Collapsed groups, by label. Every group starts open; the state is per group
     so folding AI testing never touches Human testing or Core Agents. */
  const [closedGroups, setClosedGroups] = useState<Set<string>>(new Set())
  const isGroupOpen = (label: string) => !closedGroups.has(label)
  const toggleGroup = (label: string) =>
    setClosedGroups((prev) => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  const [gameDropdownOpen, setGameDropdownOpen] = useState(false)
  const [langSelectorOpen, setLangSelectorOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [historyExpanded, setHistoryExpanded] = useState(true)
  const [headerHovered, setHeaderHovered] = useState(false)

  const gameCardRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const navConfig = AREA_NAV[area]
  const gameInSidebar = gamePlacement === 'sidebar-top'
  /* Game as its own control in the footer row, beside the avatar. */
  const gameBesideProfile = gamePlacement === 'footer-inline'
  /* Game hidden inside the profile menu, with the profile row as its indicator. */
  const gameInProfileMenu = gamePlacement === 'footer-menu'
  /* One entitled area means there is no switch at all, so no slot for one. */
  const showSegment = areas.length > 1
  /* Testing has no Oracle threads of its own yet — its history is run-shaped. */
  const historyConfig =
    navConfig.history?.kind === 'oracle-threads' ? navConfig.history : null

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (gameDropdownOpen && gameCardRef.current && !gameCardRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (!target.closest('[data-game-selector-dropdown]')) {
          setGameDropdownOpen(false)
        }
      }
      if (langSelectorOpen && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        // Also check if click is inside the portaled language selector
        const target = e.target as HTMLElement
        if (!target.closest('[data-lang-selector]')) {
          setLangSelectorOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [gameDropdownOpen, langSelectorOpen])

  const width = collapsed ? 60 : SIDEBAR_WIDTH

  return (
    <div
      className="flex flex-col h-full bg-bg-elements border-r border-border-subtle gap-s overflow-hidden shrink-0 transition-[width] duration-300 ease-in-out"
      style={{ width }}
    >

      {/* ── Header ── */}
      <div
        className={[
          'flex h-[56px] items-center shrink-0',
          collapsed ? 'p-s justify-center' : 'pl-s pr-l py-s justify-between',
        ].join(' ')}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
      >
        {collapsed ? (
          /* Collapsed: logo by default, expand icon on hover (swaps, not overlaps) */
          headerHovered ? (
            <button
              onClick={onToggleCollapse}
              className="sidebar-icon-hover flex items-center justify-center w-6 h-6 cursor-pointer"
              aria-label="Expand sidebar"
            >
              <ExpandIcon size={24} />
            </button>
          ) : (
            <a className="flex items-center justify-center shrink-0" href="/">
              <LogoMark size={40} />
            </a>
          )
        ) : (
          /* Expanded: full logo + collapse icon */
          <>
            <a className="flex gap-[6px] items-center shrink-0" href="/">
              <LogoMark size={40} />
              <LogoType />
            </a>
            <button
              onClick={onToggleCollapse}
              className="sidebar-icon-hover flex items-center justify-center w-6 h-6 cursor-pointer"
              aria-label="Collapse sidebar"
            >
              <CollapseIcon size={24} />
            </button>
          </>
        )}
      </div>

      {/* -- Sidebar Items -- */}
      <div className="flex flex-1 flex-col gap-s items-start min-h-0 w-full overflow-hidden">

        {/* Scope block: game, then area inside it.
            One region owns the whole hierarchy -- game -> area -> agent -- so the
            switch can never be mistaken for a filter on the list below it. */}
        {(gameInSidebar || showSegment) && (
          <div className="flex flex-col items-start shrink-0 w-full">

            {/* Game context -- a plain chip with one game, a selector at 2+ */}
            {gameInSidebar && (
              <div className="shrink-0 w-full relative" ref={gameCardRef}>
                {collapsed ? (
                  <div className="flex flex-col items-start w-full">
                    <button
                      className="flex gap-xs items-start p-xs shrink-0 w-full cursor-pointer relative"
                      style={{ backgroundColor: 'var(--bg-tint-light)' }}
                      onClick={() => AVAILABLE_GAMES.length > 1 && setGameDropdownOpen(!gameDropdownOpen)}
                      aria-label={gameName}
                    >
                      <div className="relative shrink-0 w-[24px] h-[24px]">
                        <div className="absolute inset-0 rounded-[4px] overflow-hidden">
                          <div className="absolute inset-0 bg-[#1f1637] rounded-[4px]" />
                          {gameImageUrl && (
                            <img src={gameImageUrl} alt={gameName} className="absolute inset-0 w-full h-full object-cover rounded-[4px]" />
                          )}
                        </div>
                      </div>
                      {AVAILABLE_GAMES.length > 1 && (
                        <DropdownArrowIcon size={16} className="absolute right-xs top-1/2 -translate-y-1/2 text-text-brand" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="px-s">
                    <GameSelector
                      name={gameName}
                      genre={gameGenre}
                      imageUrl={gameImageUrl}
                      /* Single-game accounts get a label, not a control. */
                      variant={AVAILABLE_GAMES.length > 1 ? 'default' : 'list'}
                      onClick={
                        AVAILABLE_GAMES.length > 1
                          ? () => setGameDropdownOpen(!gameDropdownOpen)
                          : undefined
                      }
                    />
                  </div>
                )}

                {gameDropdownOpen && (
                  <GameSelectorDropdown
                    games={AVAILABLE_GAMES}
                    collapsed={collapsed}
                    anchorRef={gameCardRef}
                    onSelect={(game) => {
                      onGameChange?.(game)
                      setGameDropdownOpen(false)
                    }}
                    onClose={() => setGameDropdownOpen(false)}
                  />
                )}
              </div>
            )}

            {/* Area switch -- renders nothing when the account has one area */}
            {showSegment && (
              <div className={gameInSidebar ? 'w-full mt-xs' : 'w-full'}>
                <AreaSegment
                  areas={areas}
                  active={area}
                  onChange={onAreaChange}
                  collapsed={collapsed}
                />
              </div>
            )}

            {/* Rule separating global scope from the area's own nav. mt-m (16px)
                matches the space below it -- the container's 12px gap plus the
                nav row's own 4px top padding -- so the divider sits centred. */}
            <div className="h-px w-full mt-m" style={{ backgroundColor: 'var(--border-subtle)' }} />
          </div>
        )}

        {/* Area navigation -- derived from AREA_NAV[area].
            Captioned groups render in the 1.1 style: a small-caps caption with a
            tone dot over a top rule, then the rows indented behind a 2px left
            rule. Collapsed, captions and rules go and the icons simply stack. */}
        <div className="flex flex-1 flex-col items-start min-h-0 overflow-y-auto overflow-x-hidden w-full pb-s">

          {navConfig.groups.map((group, gi) => {
            const isCollapsibleGroup = Boolean(group.collapsible) && !collapsed
            const groupOpen = !isCollapsibleGroup || isGroupOpen(group.label ?? '')
            const captioned = Boolean(group.label) && !collapsed

            return (
              <div
                key={group.label ?? 'group-' + gi}
                className={['flex flex-col items-start shrink-0 w-full', captioned ? 'mt-s' : ''].join(' ')}
              >
                {captioned && group.label && (
                  <GroupCaption
                    label={group.label}
                    tone={group.captionTone}
                    collapsible={isCollapsibleGroup}
                    open={isGroupOpen(group.label)}
                    onToggle={() => toggleGroup(group.label!)}
                  />
                )}

                {groupOpen && (
                  <div
                    className={[
                      'flex flex-col items-start',
                      captioned ? 'ml-[24px] mr-s pl-[12px] w-[calc(100%-36px)]' : 'w-full',
                    ].join(' ')}
                  >
                    {group.items.map((item, ri) => {
                      const Icon = NAV_ICONS[item.icon]
                      /* Oracle de-highlights while a history thread is the active screen. */
                      const isActive =
                        activeNav === item.nav && !(item.nav === 'oracle' && hasActiveHistory)
                      return (
                        <SidebarNavItem
                          key={item.nav}
                          label={item.label}
                          icon={<Icon size={20} />}
                          active={isActive}
                          badge={item.badge}
                          /* 1.1 style: a quiet filled tag, no outline. */
                          badgeVariant={item.badge ? 'default' : undefined}
                          disabled={item.disabled}
                          locked={lockedNavs.includes(item.nav)}
                          collapsed={collapsed}
                          nested={captioned}
                          branchLast={ri === group.items.length - 1}
                          onClick={() => onNavChange?.(item.nav as ActiveNav)}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* History -- area-scoped, so Oracle threads never show in Testing.
              Hidden entirely when there is nothing in it: a lone caption over an
              empty list reads as a loading failure, not as a new workspace. */}
          {historyConfig && !collapsed && displayHistory.length > 0 && (
            <div className="flex flex-col items-start shrink-0 w-full mt-s">
              <GroupCaption
                label={historyConfig.label}
                collapsible
                open={historyExpanded}
                onToggle={() => setHistoryExpanded(!historyExpanded)}
              />
              {historyExpanded && (
                <div
                  className="flex flex-col items-start ml-[24px] mr-s pl-[12px] w-[calc(100%-36px)]"
                >
                  {displayHistory.map((item, ri) => (
                    <SidebarTaskItem
                      key={item.id}
                      query={item.query}
                      active={item.id === activeHistoryId}
                      state={item.state}
                      nested
                      branchLast={ri === displayHistory.length - 1}
                      onClick={() => onHistoryClick?.(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Footer -- profile, plus the game control in the two footer placements */}
      <div
        className={[
          'flex flex-col items-start justify-center overflow-visible shrink-0 relative',
          'border-t border-border-subtle',
          collapsed
            ? 'gap-m py-m w-[60px]'
            : 'gap-m px-s py-m w-[300px]',
        ].join(' ')}
        ref={profileRef}
      >
        <div
          className={
            collapsed
              ? 'flex flex-col gap-xs items-center justify-center pb-s w-full'
              : 'flex gap-xs items-center w-full'
          }
        >
          {/* footer-inline: game is a real control here, so the avatar shrinks
              to an icon and the account options move behind it. */}
          {gameBesideProfile && (
            <SidebarFooterGame
              games={AVAILABLE_GAMES}
              activeGame={{ name: gameName, genre: gameGenre, imageUrl: gameImageUrl }}
              onSelectGame={(game) => onGameChange?.(game)}
              collapsed={collapsed}
            />
          )}

          <SidebarProfile
            name="Jonh Wick"
            initials="JW"
            language={language}
            /* Persistent scope indicator -- only when the game has no control. */
            gameName={gameInProfileMenu ? gameName : undefined}
            avatarOnly={gameBesideProfile && !collapsed}
            collapsed={collapsed}
            className={collapsed || gameBesideProfile ? undefined : 'flex-1 min-w-0'}
            onClick={() =>
              gameInSidebar
                ? setLangSelectorOpen(!langSelectorOpen)
                : setProfileMenuOpen(!profileMenuOpen)
            }
          />

          {/* Logout stays a direct action only while the profile row is just a
              language trigger. Both footer placements move it into the menu. */}
          {gameInSidebar && (
            <Button
              variant="tertiary"
              size="md"
              iconOnly
              aria-label="Logout"
              onClick={onLogout}
            >
              <LogoutIcon size={24} />
            </Button>
          )}
        </div>

        {/* Language selector overlay -- sidebar-top placement only. In the footer
            placements language is a submenu of the profile menu instead, so it
            can never be left hanging with its parent gone. */}
        {langSelectorOpen && (
          <LanguageSelector
            currentLanguage={language}
            onSelect={(lang) => {
              onLanguageChange?.(lang)
              setLangSelectorOpen(false)
            }}
            onClose={() => setLangSelectorOpen(false)}
            anchorRef={profileRef}
          />
        )}

        {/* Profile menu -- both footer placements. The game section appears only
            when the game has no control outside the menu. */}
        {profileMenuOpen && (
          <SidebarProfileMenu
            anchorRef={profileRef}
            games={AVAILABLE_GAMES}
            activeGame={{ name: gameName, genre: gameGenre, imageUrl: gameImageUrl }}
            showGame={gameInProfileMenu}
            onSelectGame={(game) => {
              onGameChange?.(game)
              setProfileMenuOpen(false)
            }}
            language={language}
            onSelectLanguage={(lang) => {
              onLanguageChange?.(lang)
              setProfileMenuOpen(false)
            }}
            onLogout={() => {
              setProfileMenuOpen(false)
              onLogout?.()
            }}
            onClose={() => setProfileMenuOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

/** Caption ink per group tone — the same inks the Testing Overview's group
 *  headings use, so "Human testing" reads blue and "AI player testing" green in both
 *  places. Intelligence's groups take their own tones from the same scale. */
const CAPTION_TONE_INK: Record<NavTone, string> = {
  brand: 'var(--brand)',
  purple: 'var(--purple)',
  success: 'var(--success)',
  neutral: 'var(--text-tertiary)',
}

/**
 * Group caption — small caps, sitting on the same left edge as the group's
 * rule below it. No dot and no horizontal rule: the caption carries its group's
 * tone as ink instead, which is what tells two captions apart at a glance, and
 * the indented body with its 2px left rule shows the grouping.
 * The chevron appears only when the group folds.
 */
function GroupCaption({
  label,
  tone = 'neutral',
  collapsible,
  open,
  onToggle,
}: {
  label: string
  tone?: NavTone
  collapsible?: boolean
  open?: boolean
  onToggle?: () => void
}) {
  const ink = CAPTION_TONE_INK[tone]
  const Tag = collapsible ? 'button' : 'div'
  return (
    <div className="w-full px-s">
      <Tag
        type={collapsible ? 'button' : undefined}
        onClick={collapsible ? onToggle : undefined}
        className={[
          'flex items-center gap-xs w-full pt-xs pb-xs pl-s pr-xs text-left',
          collapsible ? 'cursor-pointer' : '',
        ].join(' ')}
        aria-expanded={collapsible ? open : undefined}
      >
        <span
          className="flex-1 font-display text-xs font-semibold uppercase tracking-[0.08em] leading-[1.5] truncate"
          style={{ color: ink }}
        >
          {label}
        </span>
        {collapsible && (
          /* Chevron takes the caption's ink via currentColor, so the row reads
             as one coloured unit rather than a tinted label beside grey chrome. */
          <span className="flex items-center" style={{ color: ink }}>
            <ChevronIcon direction={open ? 'down' : 'right'} size={16} />
          </span>
        )}
      </Tag>
    </div>
  )
}
