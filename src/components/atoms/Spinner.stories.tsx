import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './Spinner'

const meta = {
  title: 'Atoms/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: [12, 16, 18, 24] },
    tone: { control: 'select', options: ['brand', 'neutral', 'current', 'on-dark'] },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Brand: Story = { args: { size: 16, tone: 'brand' } }
export const Neutral: Story = { args: { size: 16, tone: 'neutral' } }
export const Announced: Story = { args: { size: 18, tone: 'brand', label: 'Loading' } }

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      {([12, 16, 18, 24] as const).map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Spinner size={s} />
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{s}</span>
        </div>
      ))}
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <span
        className="inline-flex items-center gap-xs font-body text-s text-text-secondary"
      >
        <Spinner size={16} tone="neutral" /> Thinking…
      </span>
      <span
        className="inline-flex items-center gap-xs px-s py-xxs rounded-round font-body text-xs font-semibold"
        style={{ backgroundColor: 'var(--bg-tint)', color: 'var(--text-brand)' }}
      >
        <Spinner size={12} tone="current" /> Analysing 20 sessions
      </span>
      <span
        className="inline-flex items-center gap-xs px-s py-xs rounded-m font-body text-xs font-semibold"
        style={{ backgroundColor: '#1C2542', color: 'white' }}
      >
        <Spinner size={16} tone="on-dark" /> AI playing · live
      </span>
    </div>
  ),
}
