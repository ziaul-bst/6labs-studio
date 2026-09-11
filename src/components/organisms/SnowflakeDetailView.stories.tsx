import type { Meta, StoryObj } from '@storybook/react-vite'
import { SnowflakeDetailView } from './SnowflakeDetailView'
import { CONNECTORS } from './ContextConnectorsView'
import {
  getMockSnowflakeConnection,
  type SnowflakeConnection,
} from '../../lib/state/connectorsStore'

const connector = CONNECTORS.find((c) => c.id === 'snowflake')!

const meta = {
  title: 'Organisms/SnowflakeDetailView',
  component: SnowflakeDetailView,
  parameters: { layout: 'padded' },
  args: { connector },
} satisfies Meta<typeof SnowflakeDetailView>
export default meta
type Story = StoryObj<typeof meta>

const baseDetails = {
  accountIdentifier: 'xy12345.us-east-1',
  username: 'SIXLABS_READONLY',
  warehouse: 'ANALYTICS_WH',
  database: 'GAME_TELEMETRY',
}

const connectedYellow = getMockSnowflakeConnection()

const connectedGreen: SnowflakeConnection = {
  ...connectedYellow,
  verdict: 'GREEN',
  verdictReason: 'All tables documented and ready.',
  tables: connectedYellow.tables.map((t) => ({
    ...t,
    verdict: 'GREEN',
    verdictReasons: [],
    description: t.description || 'Documented table.',
    columns: t.columns.map((c) => ({ ...c, description: c.description || 'Documented column.' })),
  })),
}

export const NotConnected: Story = {
  args: { connection: { kind: 'not-connected' } },
}

export const Syncing: Story = {
  args: {
    connection: {
      ...baseDetails,
      kind: 'connected',
      onboardedAt: Date.parse('2026-06-05T07:24:53Z'),
      syncing: true,
      verdict: 'YELLOW',
      verdictReason: 'Importing tables…',
      lastRefreshedAt: null,
      tables: [],
      orgWideAccess: true,
      selectedTableFqn: null,
    },
  },
}

export const ConnectedNeedsDescriptions: Story = {
  name: 'Connected · needs descriptions (YELLOW)',
  args: { connection: connectedYellow },
}

export const ConnectedReady: Story = {
  name: 'Connected · ready (GREEN)',
  args: { connection: connectedGreen },
}

export const DisconnectConfirm: Story = {
  name: 'Connected · disconnect confirmation',
  args: { connection: connectedYellow, defaultDisconnectConfirmOpen: true },
}

export const ErrorKeyNotRegistered: Story = {
  name: 'Error · key not registered',
  args: {
    connection: {
      ...baseDetails,
      kind: 'error',
      reason: 'key-not-registered',
      lastRefreshedAt: Date.parse('2026-06-04T07:24:53Z'),
    },
  },
}

export const ErrorWriteRejected: Story = {
  name: 'Error · write access rejected',
  args: {
    connection: {
      ...baseDetails,
      kind: 'error',
      reason: 'write-access-rejected',
      lastRefreshedAt: Date.parse('2026-06-04T07:24:53Z'),
    },
  },
}

export const ErrorAccountNotFound: Story = {
  name: 'Error · account not found',
  args: {
    connection: {
      ...baseDetails,
      kind: 'error',
      reason: 'account-not-found',
      lastRefreshedAt: null,
    },
  },
}

export const ErrorPermissionDenied: Story = {
  name: 'Error · permission denied',
  args: {
    connection: {
      ...baseDetails,
      kind: 'error',
      reason: 'permission-denied',
      lastRefreshedAt: Date.parse('2026-06-04T07:24:53Z'),
    },
  },
}

export const ErrorNetwork: Story = {
  name: 'Error · temporary network',
  args: {
    connection: {
      ...baseDetails,
      kind: 'error',
      reason: 'network',
      lastRefreshedAt: Date.parse('2026-06-05T06:24:53Z'),
    },
  },
}
