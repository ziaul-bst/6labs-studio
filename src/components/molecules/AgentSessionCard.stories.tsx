import type { Meta, StoryObj } from '@storybook/react-vite'
import { AgentSessionCard } from './AgentSessionCard'
import { AI_BEHAVIOURAL_RUN_META, buildAgentSessions } from '../../lib/mocks/testing'

const meta = AI_BEHAVIOURAL_RUN_META['aib-frost']
const done = buildAgentSessions('aib-frost', meta)
const live = buildAgentSessions('demo-running', { ...meta, finished: 12 }, 6)

const storyMeta = {
  title: 'Molecules/Testing/AgentSessionCard',
  component: AgentSessionCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 260 }}><Story /></div>],
  args: { session: done[2] },
} satisfies Meta<typeof AgentSessionCard>

export default storyMeta
type Story = StoryObj<typeof storyMeta>

/** Finished session — play affordance, length, screens and flagged count. */
export const Finished: Story = {}

/** Finished with nothing flagged. */
export const Clean: Story = { args: { session: { ...done[4], steps: done[4].steps.map((s) => ({ ...s, flag: undefined })) } } }

/** Still playing — LIVE badge, screen counter, progress rule. */
export const Live: Story = { args: { session: live[15] } }
