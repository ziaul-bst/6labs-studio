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

/** A phone capture — what every 6labs recording actually is. The frame narrows
 *  to the footage and the reading beside it takes the width that is left. */
export const PortraitRecording: Story = {
  args: { session: { ...sessions[2], orientation: 'portrait' }, initialStep: 1 },
}

/** A tablet build, or an emulator run rotated. The frame takes the width and
 *  the reading holds its 380px column. */
export const LandscapeRecording: Story = {
  args: { session: { ...sessions[2], orientation: 'landscape' }, initialStep: 1 },
}

/** The screen that loaded a skill file: a one-line action carrying four
 *  thousand monospaced characters. Shut, labelled with its size, and opened it
 *  scrolls in a box of its own rather than pushing the reading out of the panel. */
export const ScreenWithAPayload: Story = {
  args: { session: { ...sessions[2], orientation: 'portrait' }, initialStep: 1 },
}

/** The account wall: the reasoning a model writes when it has hit something it
 *  is not allowed to do. Folded at eight lines, with the whole of it one click
 *  away — and folded again on the next screen, because the default is skim. */
export const ScreenWithLongReasoning: Story = {
  args: { session: { ...sessions[2], orientation: 'portrait' }, initialStep: 3 },
}

/** Live, on the newest screen: 6labs has the agent here, not the picture of it
 *  yet. The well says what it is waiting for rather than showing an empty box
 *  or, worse, the previous screen's frame. */
export const WaitingForTheFrame: Story = {
  args: { session: { ...liveSessions[14], orientation: 'portrait' } },
}
