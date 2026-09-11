import type { Meta, StoryObj } from '@storybook/react-vite'
import { SharedConnectorDetail } from './SharedConnectorDetail'
import { CONNECTORS } from './ContextConnectorsView'
import {
  disconnectBigQuery,
  disconnectSnowflake,
  loadMockBigQueryConnection,
} from '../../lib/state/connectorsStore'

const bigquery = CONNECTORS.find((c) => c.id === 'bigquery')!
const snowflake = CONNECTORS.find((c) => c.id === 'snowflake')!

const meta = {
  title: 'Organisms/SharedConnectorDetail',
  component: SharedConnectorDetail,
  tags: ['autodocs'],
  args: { onAddConnection: () => {} },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 40 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SharedConnectorDetail>

export default meta
type Story = StoryObj<typeof meta>

/** Company connection only (view-only) — tabs show Alex’s connection + "Add connection". */
export const BigQuery_SharedOnly: Story = {
  args: { connectorId: 'bigquery', connector: bigquery },
  decorators: [
    (Story) => {
      disconnectBigQuery()
      return <Story />
    },
  ],
}

/** Two connections — Alex’s (view-only) + your own (editable). */
export const BigQuery_WithOwnConnection: Story = {
  args: { connectorId: 'bigquery', connector: bigquery },
  decorators: [
    (Story) => {
      loadMockBigQueryConnection()
      return <Story />
    },
  ],
}

/** Company Snowflake connection only (healthy, view-only). */
export const Snowflake_SharedOnly: Story = {
  args: { connectorId: 'snowflake', connector: snowflake },
  decorators: [
    (Story) => {
      disconnectSnowflake()
      return <Story />
    },
  ],
}
