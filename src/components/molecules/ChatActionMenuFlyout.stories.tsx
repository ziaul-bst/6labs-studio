import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatActionMenuFlyout, type ConnectorOption } from './ChatActionMenuFlyout'
import { BigQueryIcon } from '../icons/connectors/BigQueryIcon'
import { SnowflakeIcon } from '../icons/connectors/SnowflakeIcon'

const BASE_CONNECTORS: ConnectorOption[] = [
  {
    id: 'bigquery',
    label: 'BigQuery',
    secondary: 'sixlabs-qa',
    icon: <BigQueryIcon size={18} />,
    enabled: true,
    scopeKind: 'project',
    scopes: [
      { id: 'labs-demo-1', label: 'labs-demo-1' },
      { id: 'ultron-497407', label: 'ultron-497407' },
      { id: 'sixlabs-qa', label: 'sixlabs-qa' },
      { id: 'sixlabs-prod', label: 'sixlabs-prod' },
    ],
    selectedScopeId: 'ultron-497407',
  },
]

// Both warehouses onboarded — BigQuery (projects) + Snowflake (databases).
const TWO_CONNECTORS: ConnectorOption[] = [
  ...BASE_CONNECTORS,
  {
    id: 'snowflake',
    label: 'Snowflake',
    secondary: 'PRIYA_RO @ab11111.eu-west-2',
    icon: <SnowflakeIcon size={18} />,
    enabled: false,
    // Sharing model: connections are picked by account (username @account).
    scopeKind: 'account',
    scopes: [
      { id: 'SIXLABS_READONLY@xy12345.us-east-1', label: 'SIXLABS_READONLY @xy12345.us-east-1' },
      { id: 'PRIYA_RO@ab11111.eu-west-2', label: 'PRIYA_RO @ab11111.eu-west-2' },
    ],
    selectedScopeId: 'PRIYA_RO@ab11111.eu-west-2',
  },
]

function Demo({
  defaultOpen,
  initialConnectors = BASE_CONNECTORS,
}: {
  defaultOpen?: 'root' | 'connectors' | (string & {})
  initialConnectors?: ConnectorOption[]
}) {
  const [connectors, setConnectors] = useState<ConnectorOption[]>(initialConnectors)

  const handleConnectorsChange = (enabledIds: string[]) => {
    setConnectors((prev) =>
      prev.map((c) => ({ ...c, enabled: enabledIds.includes(c.id) })),
    )
  }

  const handleSelectScope = (connectorId: string, scopeId: string) => {
    setConnectors((prev) =>
      prev.map((c) => (c.id === connectorId ? { ...c, selectedScopeId: scopeId } : c)),
    )
  }

  return (
    <div style={{ padding: 80, display: 'flex', justifyContent: 'flex-start' }}>
      <ChatActionMenuFlyout
        connectors={connectors}
        onConnectorsChange={handleConnectorsChange}
        onSelectScope={handleSelectScope}
        onAttachFile={(f) => console.log('attach', f.name)}
        defaultOpen={defaultOpen}
      />
    </div>
  )
}

const noop = () => {}
const STORY_ARGS = {
  connectors: BASE_CONNECTORS,
  onConnectorsChange: noop,
}

const meta = {
  title: 'Molecules/ChatActionMenuFlyout',
  component: ChatActionMenuFlyout,
  parameters: { layout: 'fullscreen' },
  args: STORY_ARGS,
} satisfies Meta<typeof ChatActionMenuFlyout>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: STORY_ARGS,
  render: () => <Demo defaultOpen="root" />,
}

export const ConnectorsSubmenu: Story = {
  name: 'Connectors submenu (none enabled)',
  args: STORY_ARGS,
  render: () => <Demo defaultOpen="connectors" />,
}

export const TwoConnectors: Story = {
  name: 'Connectors submenu (BigQuery + Snowflake)',
  args: STORY_ARGS,
  render: () => <Demo defaultOpen="connectors" initialConnectors={TWO_CONNECTORS} />,
}

export const NoConnectors: Story = {
  name: 'Connectors submenu (empty state)',
  args: STORY_ARGS,
  render: () => <Demo defaultOpen="connectors" initialConnectors={[]} />,
}

export const BigQueryScopePanel: Story = {
  name: 'Connector scope panel (toggle + select a project)',
  args: STORY_ARGS,
  render: () => <Demo defaultOpen="conn:bigquery" initialConnectors={BASE_CONNECTORS} />,
}

export const SnowflakeScopePanel: Story = {
  name: 'Connector scope panel (Snowflake · select a database)',
  args: STORY_ARGS,
  render: () => <Demo defaultOpen="conn:snowflake" initialConnectors={TWO_CONNECTORS} />,
}
