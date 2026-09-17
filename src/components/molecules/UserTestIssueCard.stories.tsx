import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestIssueCard } from './UserTestIssueCard'
import { USER_TEST_ISSUES } from '../../lib/mocks/user-test'

const meta = {
  title: 'Molecules/UserTestIssueCard',
  component: UserTestIssueCard,
  tags: ['autodocs'],
} satisfies Meta<typeof UserTestIssueCard>

export default meta
type Story = StoryObj<typeof meta>

/** A verified bug that is new since the previous batch — the worst case. */
export const VerifiedBug: Story = {
  args: { issue: USER_TEST_ISSUES[0] },
}

/** Friction carried over from the last batch, read off repeated taps. */
export const HighConfidenceFriction: Story = {
  args: { issue: USER_TEST_ISSUES[1] },
}

/** A bug that only reproduces on some screens — the scope is the report's to state. */
export const DeviceScopedBug: Story = {
  args: { issue: USER_TEST_ISSUES[2] },
}

/** Medium confidence — a hypothesis, not a finding to act on directly. */
export const MediumConfidenceFriction: Story = {
  args: { issue: USER_TEST_ISSUES[3] },
}
