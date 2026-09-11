import type { Meta, StoryObj } from '@storybook/react-vite'
import { BigQueryDetailView } from './BigQueryDetailView'
import { BigQueryIcon } from '../icons/connectors/BigQueryIcon'
import type { ConnectorDetail } from './ConnectorDetailView'
import { getMockBigQueryConnection } from '../../lib/state/connectorsStore'

const CONNECTOR: ConnectorDetail = {
  id: 'bigquery',
  icon: <BigQueryIcon size={48} />,
  name: 'BigQuery',
  tags: [
    { label: 'Data warehouse', variant: 'neutral' },
    { label: 'GCP', variant: 'brand' },
  ],
  iconTint: 'rgba(66, 133, 244, 0.07)',
  about:
    'BigQuery is Google Cloud’s serverless data warehouse. Connecting it lets 6labs agents query your live analytics tables alongside gameplay evidence — so Oracle can answer business questions grounded in the same data your analyst team trusts.',
  benefits: [
    'Ask Oracle questions against your live BQ tables, no SQL required',
    'Cross-reference gameplay findings with revenue and retention data',
    'Reuse the warehouse models your analyst team already maintains',
    'Tables are read-only — 6labs never writes back to your warehouse',
  ],
  steps: [
    'Upload your service-account JSON',
    'We validate access and import your table list',
    'Toggle BigQuery on per chat from the composer + menu',
  ],
}

const NOW = Date.now()
const TWO_HOURS_AGO = NOW - 2 * 60 * 60 * 1000
const TWO_DAYS_AGO = NOW - 2 * 24 * 60 * 60 * 1000

const meta = {
  title: 'Organisms/BigQueryDetailView',
  component: BigQueryDetailView,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 32,
          minHeight: '100vh',
          backgroundColor: 'var(--bg-page)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    connector: CONNECTOR,
    connection: { kind: 'not-connected' },
  },
} satisfies Meta<typeof BigQueryDetailView>

export default meta
type Story = StoryObj<typeof meta>

// ─── Not connected ───────────────────────────────────────────────────────────

export const NotConnected: Story = {
  name: 'Not connected (default)',
  args: {
    connection: { kind: 'not-connected' },
  },
}

// ─── Connected ───────────────────────────────────────────────────────────────

export const ConnectedSyncing: Story = {
  name: 'Connected · syncing (just onboarded)',
  args: {
    connection: {
      kind: 'connected',
      projectId: 'sixlabs-qa',
      saEmail: 'bq-oracle-limited-access@sixlabs-qa.iam.gserviceaccount.com',
      onboardedAt: NOW,
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

export const ConnectedYellow: Story = {
  name: 'Connected · partial (needs descriptions)',
  args: {
    connection: { ...getMockBigQueryConnection(), lastRefreshedAt: TWO_HOURS_AGO },
  },
}

export const ConnectedGreen: Story = {
  name: 'Connected · ready (fully documented)',
  args: {
    connection: (() => {
      const c = getMockBigQueryConnection()
      const tables = c.tables.map((t) => ({
        ...t,
        description: 'App click stream for MapleStory: Idle RPG (April 2026 slice).',
        columns: t.columns.map((col) => ({
          ...col,
          description: col.description || `Auto-described placeholder for ${col.name}.`,
        })),
        verdict: 'GREEN' as const,
        verdictReasons: [],
      }))
      return {
        ...c,
        tables,
        verdict: 'GREEN' as const,
        verdictReason: 'All tables documented and ready.',
        lastRefreshedAt: TWO_HOURS_AGO,
      }
    })(),
  },
}

export const ConnectedNoTables: Story = {
  name: 'Connected · ready (0 tables matched)',
  args: {
    connection: {
      kind: 'connected',
      projectId: 'sixlabs-qa',
      saEmail: 'bq-oracle-limited-access@sixlabs-qa.iam.gserviceaccount.com',
      onboardedAt: TWO_HOURS_AGO,
      syncing: false,
      verdict: 'YELLOW',
      verdictReason: 'No tables were imported.',
      lastRefreshedAt: TWO_HOURS_AGO,
      tables: [],
      orgWideAccess: true,
      selectedTableFqn: null,
    },
  },
}

export const DisconnectConfirmation: Story = {
  name: 'Connected · disconnect confirmation popup',
  args: {
    connection: { ...getMockBigQueryConnection(), lastRefreshedAt: TWO_HOURS_AGO },
    defaultDisconnectConfirmOpen: true,
  },
}

// ─── Error variants ──────────────────────────────────────────────────────────

export const ErrorPermissionRevoked: Story = {
  name: 'Error · permission revoked',
  args: {
    connection: {
      kind: 'error',
      projectId: 'sixlabs-qa',
      reason: 'permission-revoked',
      lastRefreshedAt: TWO_DAYS_AGO,
    },
  },
}

export const ErrorCredentialsExpired: Story = {
  name: 'Error · credentials revoked',
  args: {
    connection: {
      kind: 'error',
      projectId: 'sixlabs-qa',
      reason: 'credentials-expired',
      lastRefreshedAt: TWO_DAYS_AGO,
    },
  },
}

export const ErrorProjectNotFound: Story = {
  name: 'Error · project not found',
  args: {
    connection: {
      kind: 'error',
      projectId: 'sixlabs-renamed',
      reason: 'project-not-found',
      lastRefreshedAt: TWO_DAYS_AGO,
    },
  },
}

export const ErrorNetwork: Story = {
  name: 'Error · transient network',
  args: {
    connection: {
      kind: 'error',
      projectId: 'sixlabs-qa',
      reason: 'network',
      lastRefreshedAt: TWO_HOURS_AGO,
    },
  },
}

export const ErrorUnknown: Story = {
  name: 'Error · uncategorised',
  args: {
    connection: {
      kind: 'error',
      projectId: 'sixlabs-qa',
      reason: 'unknown',
      lastRefreshedAt: TWO_DAYS_AGO,
    },
  },
}
