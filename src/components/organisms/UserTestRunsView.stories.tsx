import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestRunsView } from './UserTestRunsView'
import { USER_TEST_RUNS } from '../../lib/mocks/user-test'

const meta = {
  title: 'Organisms/UserTestRunsView',
  component: UserTestRunsView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof UserTestRunsView>

export default meta
type Story = StoryObj<typeof meta>

/** One run still analysing (not openable) and three complete. */
export const MixedStates: Story = {
  args: { runs: USER_TEST_RUNS },
}

/** Every run finished — nothing in flight. */
export const AllComplete: Story = {
  args: { runs: USER_TEST_RUNS.filter((r) => r.status === 'complete') },
}

/** A single run mid-analysis, right after Start run. */
export const FirstRunAnalysing: Story = {
  args: { runs: USER_TEST_RUNS.filter((r) => r.status === 'running') },
}
