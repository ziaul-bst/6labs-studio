import type { Meta, StoryObj } from '@storybook/react-vite'
import { IssueKindTag } from './IssueKindTag'

const meta = {
  title: 'Atoms/IssueKindTag',
  component: IssueKindTag,
  tags: ['autodocs'],
} satisfies Meta<typeof IssueKindTag>

export default meta
type Story = StoryObj<typeof meta>

/** Observable in the clip — fileable without watching the footage. */
export const Bug: Story = {
  args: { kind: 'bug' },
}

/** Inferred from behaviour — always read next to a confidence. */
export const Friction: Story = {
  args: { kind: 'friction' },
}

/** With the confidence folded in, as the summary screen shows it. */
export const BugVerified: Story = {
  args: { kind: 'bug', qualifier: 'verified' },
}

export const FrictionMediumConfidence: Story = {
  args: { kind: 'friction', qualifier: 'medium confidence' },
}
