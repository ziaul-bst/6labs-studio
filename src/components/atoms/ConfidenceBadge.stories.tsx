import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConfidenceBadge } from './ConfidenceBadge'

const meta = {
  title: 'Atoms/ConfidenceBadge',
  component: ConfidenceBadge,
  tags: ['autodocs'],
} satisfies Meta<typeof ConfidenceBadge>

export default meta
type Story = StoryObj<typeof meta>

/** Only bugs reach this — it licenses filing without watching the clip. */
export const Verified: Story = {
  args: { confidence: 'verified' },
}

export const High: Story = {
  args: { confidence: 'high' },
}

/** Deliberately quiet — a hypothesis to check, not a finding to act on. */
export const Medium: Story = {
  args: { confidence: 'medium' },
}
