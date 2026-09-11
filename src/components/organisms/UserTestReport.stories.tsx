import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestReport } from './UserTestReport'
import { USER_TEST_ISSUES } from '../../lib/mocks/user-test'

const meta = {
  title: 'Organisms/UserTestReport',
  component: UserTestReport,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    runName: 'Build V2.1 — onboarding (Aug 26)',
    issues: USER_TEST_ISSUES,
  },
} satisfies Meta<typeof UserTestReport>

export default meta
type Story = StoryObj<typeof meta>

/** Ranked findings, first one already open so the evidence shape is visible. */
export const Issues: Story = {
  args: { tab: 'issues' },
}

/** Per-session cut — who finished, who quit, and where. */
export const ByTester: Story = {
  args: { tab: 'testers' },
}

/** Per-step cut, with the caveat about step names drifting between runs. */
export const ByGameStep: Story = {
  args: { tab: 'steps' },
}

/** Batch 2 against batch 1 — new, still open, fixed, and one with no baseline. */
export const VsPreviousBatch: Story = {
  args: { tab: 'comparison' },
}
