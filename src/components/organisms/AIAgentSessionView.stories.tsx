import type { Meta, StoryObj } from '@storybook/react-vite'
import { AIAgentSessionView } from './AIAgentSessionView'
import { AI_BEHAVIOURAL_HISTORY, AI_BEHAVIOURAL_RUN_META, buildAgentSessions } from '../../lib/mocks/testing'

const run = AI_BEHAVIOURAL_HISTORY[0]
const meta = AI_BEHAVIOURAL_RUN_META[run.id]
const sessions = buildAgentSessions(run.id, meta)
const liveSessions = buildAgentSessions('demo-running', { ...meta, finished: 12 }, 6)

const storyMeta = {
  title: 'Organisms/Testing/AIAgentSessionView',
  component: AIAgentSessionView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    session: sessions[2],
    runName: run.name,
    meta,
    instructions: 'Focus on the Frost Festival event. Try the battle pass upgrade path if it appears.',
    onBack: () => {},
  },
} satisfies Meta<typeof AIAgentSessionView>

export default storyMeta
type Story = StoryObj<typeof storyMeta>

/** A finished session — frame, transport, filmstrip, and the reading of the current screen. */
export const Finished: Story = {}

/** Arrived from a clip in the report — lands on that screen, paused. */
export const FromReportClip: Story = { args: { initialStep: 3 } }

/** A session still playing — frames the agent has not reached are dimmed; following live. */
export const Live: Story = { args: { session: liveSessions[14] } }
