import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentType } from 'react'
import type { IconProps } from './types'

// ── Top-level icons ──
import { AISparkleIcon } from './AISparkleIcon'
import { AndroidIcon } from './AndroidIcon'
import { AppleIcon } from './AppleIcon'
import { BaristaIcon } from './BaristaIcon'
import { BlueStacksIcon } from './BlueStacksIcon'
import { BulbIcon } from './BulbIcon'
import { CalendarIcon } from './CalendarIcon'
import { CheckIcon } from './CheckIcon'
import { ChevronIcon } from './ChevronIcon'
import { ChevronRightIcon } from './ChevronRightIcon'
import { ClockIcon } from './ClockIcon'
import { ClockStatIcon } from './ClockStatIcon'
import { CloseIcon } from './CloseIcon'
import { CoachIcon } from './CoachIcon'
import { CollapseIcon } from './CollapseIcon'
import { ConnectorIcon } from './ConnectorIcon'
import { DirectionsArrowIcon } from './DirectionsArrowIcon'
import { DropdownArrowIcon } from './DropdownArrowIcon'
import { EditIcon } from './EditIcon'
import { ExpandIcon } from './ExpandIcon'
import { FileDocIcon } from './FileDocIcon'
import { FileImageIcon } from './FileImageIcon'
import { FilterIcon } from './FilterIcon'
// FlagIcon excluded — requires a `code` prop, not a standard IconProps component
import { ForecasterIcon } from './ForecasterIcon'
import { FullScreenIcon } from './FullScreenIcon'
import { GameplayWidgetIcon } from './GameplayWidgetIcon'
import { GridIcon } from './GridIcon'
import { GuardianIcon } from './GuardianIcon'
import { HomeIcon } from './HomeIcon'
import { InfoFilledIcon } from './InfoFilledIcon'
import { ListIcon } from './ListIcon'
import { LocationIcon } from './LocationIcon'
import { LogoutIcon } from './LogoutIcon'
import { OracleIcon } from './OracleIcon'
import { PlayIcon } from './PlayIcon'
import { PlusIcon } from './PlusIcon'
import { RadarIcon } from './RadarIcon'
import { RadiologistIcon } from './RadiologistIcon'
import { RecordIcon } from './RecordIcon'
import { SendIcon } from './SendIcon'
import { SessionInfoIcon } from './SessionInfoIcon'
import { SettingsIcon } from './SettingsIcon'
import { ShareIcon } from './ShareIcon'
import { SparkleIcon } from './SparkleIcon'
import { TrashIcon } from './TrashIcon'
import { UploadIcon } from './UploadIcon'
import { UserProfileStatIcon } from './UserProfileStatIcon'
import { VideoPlayIcon } from './VideoPlayIcon'
import { VolumeIcon } from './VolumeIcon'
import { WindowsIcon } from './WindowsIcon'

// ── Connector icons ──
import { AppsFlyerIcon } from './connectors/AppsFlyerIcon'
import { DiscordIcon } from './connectors/DiscordIcon'
import { FacebookAdsIcon } from './connectors/FacebookAdsIcon'
import { JiraIcon } from './connectors/JiraIcon'
import { SlackIcon } from './connectors/SlackIcon'

// ── Event icons ──
import { EventAchivementIcon } from './events/EventAchivementIcon'
import { EventAirDropIcon } from './events/EventAirDropIcon'
import { EventCheckIcon } from './events/EventCheckIcon'
import { EventCombatIcon } from './events/EventCombatIcon'
import { EventCustomizationIcon } from './events/EventCustomizationIcon'
import { EventDeathIcon } from './events/EventDeathIcon'
import { EventErrorIcon } from './events/EventErrorIcon'
import { EventFrustrationIcon } from './events/EventFrustrationIcon'
import { EventGenericIcon } from './events/EventGenericIcon'
import { EventKillIcon } from './events/EventKillIcon'
import { EventMatchEndedIcon } from './events/EventMatchEndedIcon'
import { EventMatchStartedIcon } from './events/EventMatchStartedIcon'
import { EventPurchasedIcon } from './events/EventPurchasedIcon'
import { EventQuitIcon } from './events/EventQuitIcon'
import { EventShopAbandonedIcon } from './events/EventShopAbandonedIcon'
import { EventShopAddIcon } from './events/EventShopAddIcon'
import { EventShopOpenIcon } from './events/EventShopOpenIcon'
import { EventShopPauseIcon } from './events/EventShopPauseIcon'
import { EventShopRemoveIcon } from './events/EventShopRemoveIcon'
import { EventtapIcon } from './events/EventtapIcon'
import { EventVehicalIcon } from './events/EventVehicalIcon'

// ── Helpers ──

interface IconEntry {
  name: string
  component: ComponentType<IconProps>
}

const CELL_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: 12,
  borderRadius: 8,
  border: '1px solid var(--border-default, #e5e5e5)',
  background: 'var(--bg-elements, #fff)',
  minWidth: 100,
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontFamily: 'var(--font-body, sans-serif)',
  color: 'var(--text-secondary, #666)',
  textAlign: 'center',
  wordBreak: 'break-all',
  lineHeight: 1.3,
}

const GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: 12,
}

const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 40,
}

const HEADING_STYLE: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  fontFamily: 'var(--font-display, sans-serif)',
  color: 'var(--text-primary, #030D2D)',
  marginBottom: 16,
}

function IconGrid({ icons, size = 24 }: { icons: IconEntry[]; size?: IconProps['size'] }) {
  return (
    <div style={GRID_STYLE}>
      {icons.map(({ name, component: Icon }) => (
        <div key={name} style={CELL_STYLE}>
          <Icon size={size} />
          <span style={LABEL_STYLE}>{name}</span>
        </div>
      ))}
    </div>
  )
}

// ── Icon lists ──

const TOP_LEVEL_ICONS: IconEntry[] = [
  { name: 'AISparkleIcon', component: AISparkleIcon },
  { name: 'AndroidIcon', component: AndroidIcon },
  { name: 'AppleIcon', component: AppleIcon },
  { name: 'BaristaIcon', component: BaristaIcon },
  { name: 'BlueStacksIcon', component: BlueStacksIcon },
  { name: 'BulbIcon', component: BulbIcon },
  { name: 'CalendarIcon', component: CalendarIcon },
  { name: 'CheckIcon', component: CheckIcon },
  { name: 'ChevronIcon', component: ChevronIcon },
  { name: 'ChevronRightIcon', component: ChevronRightIcon },
  { name: 'ClockIcon', component: ClockIcon },
  { name: 'ClockStatIcon', component: ClockStatIcon },
  { name: 'CloseIcon', component: CloseIcon },
  { name: 'CoachIcon', component: CoachIcon },
  { name: 'CollapseIcon', component: CollapseIcon },
  { name: 'ConnectorIcon', component: ConnectorIcon },
  { name: 'DirectionsArrowIcon', component: DirectionsArrowIcon },
  { name: 'DropdownArrowIcon', component: DropdownArrowIcon },
  { name: 'EditIcon', component: EditIcon },
  { name: 'ExpandIcon', component: ExpandIcon },
  { name: 'FileDocIcon', component: FileDocIcon },
  { name: 'FileImageIcon', component: FileImageIcon },
  { name: 'FilterIcon', component: FilterIcon },
  { name: 'ForecasterIcon', component: ForecasterIcon },
  { name: 'FullScreenIcon', component: FullScreenIcon },
  { name: 'GameplayWidgetIcon', component: GameplayWidgetIcon },
  { name: 'GridIcon', component: GridIcon },
  { name: 'GuardianIcon', component: GuardianIcon },
  { name: 'HomeIcon', component: HomeIcon },
  { name: 'InfoFilledIcon', component: InfoFilledIcon },
  { name: 'ListIcon', component: ListIcon },
  { name: 'LocationIcon', component: LocationIcon },
  { name: 'LogoutIcon', component: LogoutIcon },
  { name: 'OracleIcon', component: OracleIcon },
  { name: 'PlayIcon', component: PlayIcon },
  { name: 'PlusIcon', component: PlusIcon },
  { name: 'RadarIcon', component: RadarIcon },
  { name: 'RadiologistIcon', component: RadiologistIcon },
  { name: 'RecordIcon', component: RecordIcon },
  { name: 'SendIcon', component: SendIcon },
  { name: 'SessionInfoIcon', component: SessionInfoIcon },
  { name: 'SettingsIcon', component: SettingsIcon },
  { name: 'ShareIcon', component: ShareIcon },
  { name: 'SparkleIcon', component: SparkleIcon },
  { name: 'TrashIcon', component: TrashIcon },
  { name: 'UploadIcon', component: UploadIcon },
  { name: 'UserProfileStatIcon', component: UserProfileStatIcon },
  { name: 'VideoPlayIcon', component: VideoPlayIcon },
  { name: 'VolumeIcon', component: VolumeIcon },
  { name: 'WindowsIcon', component: WindowsIcon },
]

const CONNECTOR_ICONS: IconEntry[] = [
  { name: 'AppsFlyerIcon', component: AppsFlyerIcon },
  { name: 'DiscordIcon', component: DiscordIcon },
  { name: 'FacebookAdsIcon', component: FacebookAdsIcon },
  { name: 'JiraIcon', component: JiraIcon },
  { name: 'SlackIcon', component: SlackIcon },
]

const EVENT_ICONS: IconEntry[] = [
  { name: 'EventAchivementIcon', component: EventAchivementIcon },
  { name: 'EventAirDropIcon', component: EventAirDropIcon },
  { name: 'EventCheckIcon', component: EventCheckIcon },
  { name: 'EventCombatIcon', component: EventCombatIcon },
  { name: 'EventCustomizationIcon', component: EventCustomizationIcon },
  { name: 'EventDeathIcon', component: EventDeathIcon },
  { name: 'EventErrorIcon', component: EventErrorIcon },
  { name: 'EventFrustrationIcon', component: EventFrustrationIcon },
  { name: 'EventGenericIcon', component: EventGenericIcon },
  { name: 'EventKillIcon', component: EventKillIcon },
  { name: 'EventMatchEndedIcon', component: EventMatchEndedIcon },
  { name: 'EventMatchStartedIcon', component: EventMatchStartedIcon },
  { name: 'EventPurchasedIcon', component: EventPurchasedIcon },
  { name: 'EventQuitIcon', component: EventQuitIcon },
  { name: 'EventShopAbandonedIcon', component: EventShopAbandonedIcon },
  { name: 'EventShopAddIcon', component: EventShopAddIcon },
  { name: 'EventShopOpenIcon', component: EventShopOpenIcon },
  { name: 'EventShopPauseIcon', component: EventShopPauseIcon },
  { name: 'EventShopRemoveIcon', component: EventShopRemoveIcon },
  { name: 'EventtapIcon', component: EventtapIcon },
  { name: 'EventVehicalIcon', component: EventVehicalIcon },
]

// ── Story meta ──

const meta = {
  title: 'Foundations/Icon Gallery',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** All icons from the project, organized by category. */
export const AllIcons: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <div style={SECTION_STYLE}>
        <h2 style={HEADING_STYLE}>General Icons ({TOP_LEVEL_ICONS.length})</h2>
        <IconGrid icons={TOP_LEVEL_ICONS} />
      </div>
      <div style={SECTION_STYLE}>
        <h2 style={HEADING_STYLE}>Connector Icons ({CONNECTOR_ICONS.length})</h2>
        <IconGrid icons={CONNECTOR_ICONS} />
      </div>
      <div style={SECTION_STYLE}>
        <h2 style={HEADING_STYLE}>Event Icons ({EVENT_ICONS.length})</h2>
        <IconGrid icons={EVENT_ICONS} />
      </div>
    </div>
  ),
}

/** Connector brand icons shown at larger size. */
export const Connectors: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={HEADING_STYLE}>Connector Icons</h2>
      <IconGrid icons={CONNECTOR_ICONS} size={40} />
    </div>
  ),
}

/** Game event icons used in session timelines. */
export const Events: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={HEADING_STYLE}>Event Icons</h2>
      <IconGrid icons={EVENT_ICONS} />
    </div>
  ),
}
