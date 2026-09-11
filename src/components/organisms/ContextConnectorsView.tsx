/**
 * ContextConnectorsView — Connectors page showing integration cards.
 *
 * Sharing model (finalized "Option B"): connectors are company-scoped. When any
 * connection is active the page splits into "Active in your company" (owner
 * avatars + connection count per card) and "Available to add"; with nothing
 * connected it falls back to the original flat grid.
 *
 * @figmaComponent  Context / Connectors
 * @figmaPath       Context / Connector / Body / Container / Main Content / Section
 * @figmaNode       6419:74794
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6418-103550
 */

import type { ReactNode } from 'react'
import { AgentPageHeader } from '../molecules/AgentPageHeader'
import { ConnectorCard } from '../molecules/ConnectorCard'
import {
  useBigQueryConnection,
  useSnowflakeConnection,
} from '../../lib/state/connectorsStore'
import { ConnectorIcon } from '../icons/ConnectorIcon'
import { AppsFlyerIcon } from '../icons/connectors/AppsFlyerIcon'
import { JiraIcon } from '../icons/connectors/JiraIcon'
import { SlackIcon } from '../icons/connectors/SlackIcon'
import { DiscordIcon } from '../icons/connectors/DiscordIcon'
import { FacebookAdsIcon } from '../icons/connectors/FacebookAdsIcon'
import { BigQueryIcon } from '../icons/connectors/BigQueryIcon'
import { SnowflakeIcon } from '../icons/connectors/SnowflakeIcon'
import type { ConnectorDetail } from './ConnectorDetailView'

export const CONNECTORS: (ConnectorDetail & { description: string; row: number })[] = [
  {
    id: 'appsflyer',
    icon: <AppsFlyerIcon size={40} />,
    name: 'AppsFlyer',
    description:
      'Ingest attribution and campaign data to detect UA fraud, verify installs, and protect ad spend across all your campaigns.',
    row: 1,
    tags: [
      { label: 'MCP', variant: 'neutral' },
      { label: 'UA Observer', variant: 'brand' },
    ],
    iconTint: 'rgba(194, 5, 104, 0.07)',
    about:
      'AppsFlyer is the leading mobile attribution and marketing analytics platform. By connecting AppsFlyer to 6labs, the UA Observer agent gains direct access to your attribution data, campaign performance metrics, and install validation signals.',
    benefits: [
      'Detect ad fraud with video-level evidence from actual gameplay sessions',
      'Cross-reference attribution data with real player behavior patterns',
      'Protect ad spend by identifying low-quality traffic sources automatically',
      'Get automated fraud reports pushed to your preferred channels',
    ],
    steps: [
      '6labs connects to AppsFlyer via MCP (Model Context Protocol)',
      "No API keys needed — authenticate directly through AppsFlyer's MCP server",
      'Your apps are detected automatically after authentication',
      'Configure data pull frequency to match your reporting cadence',
    ],
  },
  {
    id: 'jira',
    icon: <JiraIcon size={40} />,
    name: 'Jira',
    description:
      'Automatically create and track issues from agent findings. Turn gameplay insights into actionable tickets in your team\'s workflow.',
    row: 1,
    tags: [
      { label: 'MCP', variant: 'neutral' },
      { label: 'All Agents', variant: 'brand' },
    ],
    iconTint: 'rgba(23, 112, 239, 0.07)',
    about:
      'Jira is the industry-standard issue tracking tool for software teams. By connecting Jira to 6labs, any agent can automatically create tickets when it detects issues, linking gameplay evidence directly to actionable work items.',
    benefits: [
      'Auto-create Jira tickets from agent findings with full context attached',
      'Link gameplay video evidence directly to issue descriptions',
      'Map agent severity levels to your Jira priority scheme',
      'Track resolution status back in the 6labs dashboard',
    ],
    steps: [
      'Authenticate with your Atlassian account via OAuth',
      'Select the Jira project and board for ticket creation',
      'Map agent finding types to issue types (Bug, Task, Story)',
      'Configure auto-creation rules or keep manual review enabled',
    ],
  },
  {
    id: 'slack',
    icon: <SlackIcon size={40} />,
    name: 'Slack',
    description:
      'Push real-time alerts, weekly digests, and video evidence directly to your team\'s Slack channels \u2014 insights find you where you work.',
    row: 2,
    tags: [
      { label: 'Webhook', variant: 'neutral' },
      { label: 'All Agents', variant: 'brand' },
    ],
    iconTint: 'rgba(123, 76, 255, 0.07)',
    about:
      'Slack is where your team already communicates. By connecting Slack to 6labs, agent findings, weekly digests, and video evidence are pushed directly to the channels your team monitors.',
    benefits: [
      'Get real-time alerts in Slack when agents detect critical issues',
      'Receive formatted weekly digest summaries with key metrics',
      'Share gameplay video clips directly in conversation threads',
      'Configure per-channel alert rules to reduce noise',
    ],
    steps: [
      'Install the 6labs Slack app from the Slack App Directory',
      'Authorize the app for your workspace',
      'Select which channels receive which agent alerts',
      'Set alert frequency and severity thresholds per channel',
    ],
  },
  {
    id: 'discord',
    icon: <DiscordIcon size={40} />,
    name: 'Discord',
    description:
      'Send formatted alerts and gameplay reports to your Discord server. Perfect for studios that coordinate through Discord channels.',
    row: 2,
    tags: [
      { label: 'Webhook', variant: 'neutral' },
      { label: 'All Agents', variant: 'brand' },
    ],
    iconTint: 'rgba(88, 101, 242, 0.07)',
    about:
      'Discord is the communication hub for many game studios. By connecting Discord to 6labs, formatted alerts and gameplay reports land directly in your server channels.',
    benefits: [
      'Push rich embeds with gameplay screenshots and metrics',
      'Organize alerts by channel — QA, live-ops, marketing',
      'Use bot commands to query agent status directly in Discord',
      'Share video evidence links that preview inline',
    ],
    steps: [
      'Create a webhook in your Discord server settings',
      'Paste the webhook URL into your 6labs connector config',
      'Map agent types to specific Discord channels',
      'Test the connection with a sample alert',
    ],
  },
  {
    id: 'bigquery',
    icon: <BigQueryIcon size={40} />,
    name: 'BigQuery',
    description:
      'Pull warehouse tables into Oracle so agents can answer questions against your live analytics — campaigns, monetization, retention, anything you ETL into BQ.',
    row: 1,
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
      'In GCP, generate a service-account key with BigQuery Data Viewer access',
      'Upload the JSON — we read the project ID from it automatically',
      'We authenticate, connect, and import your tables and column schemas',
      'Add table + column descriptions so Oracle’s answers stay grounded',
    ],
  },
  {
    id: 'snowflake',
    icon: <SnowflakeIcon size={40} />,
    name: 'Snowflake',
    description:
      'Connect your Snowflake warehouse with secure key-pair auth — no passwords exchanged. Oracle queries your live tables read-only, grounded in the data your team already trusts.',
    row: 2,
    tags: [
      { label: 'Data warehouse', variant: 'neutral' },
      { label: 'Key-pair auth', variant: 'brand' },
    ],
    iconTint: 'rgba(41, 181, 232, 0.07)',
    about:
      'Snowflake is a cloud data platform for analytics at scale. Connecting it lets 6labs agents query your live Snowflake tables alongside gameplay evidence — so Oracle can answer business questions grounded in the same data your analyst team trusts. 6labs authenticates with RSA key-pair auth: our private key never leaves 6labs, and you register only our public key against a read-only user.',
    benefits: [
      'Ask Oracle questions against your live Snowflake tables, no SQL required',
      'Password-free key-pair auth — you only register our public key',
      'Cross-reference gameplay findings with revenue and retention data',
      'Tables are read-only — 6labs never writes back to your warehouse',
    ],
    steps: [
      'Copy our public key and run the SQL to create a read-only role + user',
      'Register the key with ALTER USER … SET RSA_PUBLIC_KEY',
      'Share back your account identifier, username, warehouse, and database',
      'We verify connectivity and import your tables and column metadata',
    ],
  },
  {
    id: 'facebook-ads',
    icon: <FacebookAdsIcon size={40} />,
    name: 'Facebook Ads',
    description:
      'Pull campaign performance data and creative metrics to correlate ad spend with actual in-game player behavior and retention.',
    row: 2,
    tags: [
      { label: 'API', variant: 'neutral' },
      { label: 'UA Observer', variant: 'brand' },
    ],
    iconTint: 'rgba(23, 112, 239, 0.07)',
    about:
      'Facebook Ads is one of the largest user acquisition channels for mobile games. By connecting it to 6labs, the UA Observer agent correlates your ad spend and creative performance with actual in-game player behavior.',
    benefits: [
      'Correlate ad creative performance with in-game retention metrics',
      'Detect campaigns driving low-quality installs automatically',
      'Get creative-level ROI analysis based on actual gameplay data',
      'Receive automated alerts when campaign quality drops below thresholds',
    ],
    steps: [
      'Authenticate with your Facebook Business account',
      'Select the ad accounts to monitor',
      'Grant read access to campaign and creative data',
      'Set the data sync interval (hourly, daily, or real-time)',
    ],
  },
]

interface ContextConnectorsViewProps {
  className?: string
  onSelectConnector?: (id: string) => void
}

/** Company-shared warehouse connectors — always active (set up by a teammate). */
const SHARED_ACTIVE_IDS = ['bigquery', 'snowflake']

function OwnerAvatar({ ownerId, size = 18 }: { ownerId: 'alex' | 'you'; size?: number }) {
  const bg =
    ownerId === 'alex'
      ? 'linear-gradient(135deg, #7B4CFF, #1770EF)'
      : 'linear-gradient(135deg, #F0653F, #F2A03F)'
  return (
    <span
      className="inline-flex items-center justify-center font-display font-semibold shrink-0"
      style={{ width: size, height: size, borderRadius: 999, background: bg, color: '#fff', fontSize: size * 0.44, border: '2px solid var(--bg-card)' }}
    >
      {ownerId === 'alex' ? 'A' : 'Y'}
    </span>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-xs w-full" style={{ marginBottom: 14 }}>
      <span className="font-display text-2xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
        {children}
      </span>
      <span className="flex-1" style={{ height: 1, background: 'var(--border-subtle)' }} />
    </div>
  )
}

export function ContextConnectorsView({ className, onSelectConnector }: ContextConnectorsViewProps) {
  const ownBigQuery = useBigQueryConnection()
  const ownSnowflake = useSnowflakeConnection()

  // Owners per active connector: the teammate's shared connection, plus yours
  // once you add your own through onboarding.
  const ownersFor = (id: string): ('alex' | 'you')[] => {
    const own = id === 'bigquery' ? ownBigQuery : ownSnowflake
    return own.kind !== 'not-connected' ? ['alex', 'you'] : ['alex']
  }

  const active = CONNECTORS.filter((c) => SHARED_ACTIVE_IDS.includes(c.id))
  const available = CONNECTORS.filter((c) => !SHARED_ACTIVE_IDS.includes(c.id))

  return (
    <div
      className={['flex flex-col items-center page-measure', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <AgentPageHeader
        title="Connectors"
        description="Connect your tools so 6labs agents can push insights and pull data automatically."
        iconGradient="linear-gradient(135deg, #2FD2FF 0%, #BD61FF 100%)"
        icon={<ConnectorIcon size={40} />}
      />

      {active.length === 0 ? (
        /* Nothing connected — original flat grid */
        <div className="w-full mt-[60px] flex flex-col gap-l">
          <div className="grid grid-cols-3 gap-l">
            {CONNECTORS.filter((c) => c.row === 1).map((c) => (
              <ConnectorCard key={c.id} icon={c.icon} name={c.name} description={c.description} onConnect={() => onSelectConnector?.(c.id)} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-l">
            {CONNECTORS.filter((c) => c.row === 2).map((c) => (
              <ConnectorCard key={c.id} icon={c.icon} name={c.name} description={c.description} onConnect={() => onSelectConnector?.(c.id)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full mt-[60px] flex flex-col">
          {/* Active section leads the hierarchy — real heading + live count,
              vs. the muted catalog label on "Available to add". */}
          <div className="flex items-center gap-s w-full" style={{ marginBottom: 16 }}>
            <h2 className="font-display text-m font-semibold" style={{ color: 'var(--text-primary)' }}>
              Active in your company
            </h2>
            <span
              className="inline-flex items-center gap-xs px-s py-xxs rounded-[20px] font-display text-2xs font-semibold"
              style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
            >
              <span className="shrink-0" style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--success)' }} />
              {active.length} active
            </span>
          </div>
          <div className="grid grid-cols-2 gap-l" style={{ marginBottom: 34 }}>
            {active.map((c) => {
              const owners = ownersFor(c.id)
              return (
                <ConnectorCard
                  key={c.id}
                  icon={c.icon}
                  name={c.name}
                  description={c.description}
                  onConnect={() => onSelectConnector?.(c.id)}
                  footer={
                    <span className="flex items-center gap-xs font-body text-xs min-w-0" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex">
                        {owners.map((o, i) => (
                          <span key={o} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                            <OwnerAvatar ownerId={o} />
                          </span>
                        ))}
                      </span>
                      <span className="truncate">{owners.length === 1 ? '1 connection' : `${owners.length} connections`}</span>
                    </span>
                  }
                />
              )
            })}
          </div>

          <SectionLabel>Available to add</SectionLabel>
          <div className="grid grid-cols-3 gap-l">
            {available.map((c) => (
              <ConnectorCard key={c.id} icon={c.icon} name={c.name} description={c.description} onConnect={() => onSelectConnector?.(c.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
