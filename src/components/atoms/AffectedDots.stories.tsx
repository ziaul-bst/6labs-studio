import type { Meta, StoryObj } from '@storybook/react-vite'
import { AffectedDots } from './AffectedDots'

const meta = {
  title: 'Atoms/AffectedDots',
  component: AffectedDots,
  tags: ['autodocs'],
} satisfies Meta<typeof AffectedDots>

export default meta
type Story = StoryObj<typeof meta>

/** Most of the batch hit it — the reason this issue ranks first. */
export const Majority: Story = {
  args: { affected: 7, total: 10 },
}

/** Friction, so the fill takes the friction colour rather than the bug one. */
export const FrictionHalf: Story = {
  args: { affected: 5, total: 10, color: 'var(--warning)' },
}

/** A small batch — the denominator is the point of showing dots at all. */
export const SmallBatch: Story = {
  args: { affected: 4, total: 6 },
}
