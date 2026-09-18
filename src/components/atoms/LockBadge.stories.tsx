import type { Meta, StoryObj } from '@storybook/react-vite'
import { LockBadge } from './LockBadge'

const meta = {
  title: 'Atoms/LockBadge',
  component: LockBadge,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof LockBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = { args: { size: 'sm' } }
export const Medium: Story = { args: { size: 'md' } }
export const CustomLabel: Story = { args: { size: 'sm', label: 'Not on your plan' } }

/** Where it sits in the product: the corner of a tile, beside a pitch's title. */
export const InContext: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div
        className="flex items-start justify-between rounded-3xl px-l py-l"
        style={{ width: 220, height: 120, backgroundColor: 'var(--bg-elements)', boxShadow: 'var(--shadow-sm)' }}
      >
        <span className="w-[44px] h-[44px] rounded-xl" style={{ backgroundColor: 'var(--testing-teal-bg)' }} />
        <LockBadge />
      </div>
      <div
        className="flex items-center gap-s rounded-3xl px-xl py-l"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      >
        <span className="font-display text-2xl font-extrabold text-text-primary leading-none">Functional test</span>
        <LockBadge label="Not on your plan" />
      </div>
    </div>
  ),
}
