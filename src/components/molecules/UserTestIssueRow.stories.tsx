import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestIssueRow } from './UserTestIssueRow'
import { USER_TEST_ISSUES } from '../../lib/mocks/user-test'

const meta = {
  title: 'Molecules/UserTestIssueRow',
  component: UserTestIssueRow,
  tags: ['autodocs'],
} satisfies Meta<typeof UserTestIssueRow>

export default meta
type Story = StoryObj<typeof meta>

/** Open, with all seven evidence clips listed under the explanation. */
export const ExpandedWithClips: Story = {
  args: { issue: USER_TEST_ISSUES[0], defaultOpen: true },
}

/** Collapsed — the header alone is enough to triage. */
export const Collapsed: Story = {
  args: { issue: USER_TEST_ISSUES[0], defaultOpen: false },
}

/** A friction finding with no clips: the reasoning is the whole evidence. */
export const InferredWithoutClips: Story = {
  args: { issue: USER_TEST_ISSUES[3], defaultOpen: true },
}
