import type { Meta, StoryObj } from '@storybook/react-vite'
import { IssueCountPill } from './IssueCountPill'

const meta = {
  title: 'Atoms/Testing/IssueCountPill',
  component: IssueCountPill,
  tags: ['autodocs'],
} satisfies Meta<typeof IssueCountPill>

export default meta
type Story = StoryObj<typeof meta>

/** Amber: the run found something. */
export const Issues: Story = { args: { count: 7 } }

/** Singular copy. */
export const One: Story = { args: { count: 1 } }

/** Green only at zero. */
export const Clean: Story = { args: { count: 0 } }
