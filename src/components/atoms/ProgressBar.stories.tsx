import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProgressBar } from './ProgressBar'

const meta = {
  title: 'Atoms/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    variant: { control: 'select', options: ['bar', 'rail'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = { args: { value: 0 } }
export const Quarter: Story = { args: { value: 25 } }
export const Half: Story = { args: { value: 50 } }
export const Complete: Story = { args: { value: 100 } }

/** Work with no count — the report being written, an answer being composed. */
export const Indeterminate: Story = { args: { indeterminate: true, label: 'Writing the report' } }

/** The 3px line flush along the top of a pipeline card. */
export const Rail: Story = {
  args: { value: 43, variant: 'rail' },
  decorators: [
    (Story) => (
      <div
        className="rounded-3xl overflow-hidden"
        style={{ maxWidth: 400, backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)', height: 80 }}
      >
        <Story />
      </div>
    ),
  ],
}

export const AllSteps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
      {[0, 25, 50, 75, 100].map((v) => (
        <div key={v}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{v}%</span>
          <ProgressBar value={v} />
        </div>
      ))}
      <div>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>indeterminate</span>
        <ProgressBar indeterminate />
      </div>
    </div>
  ),
}
