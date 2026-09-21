import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatTile } from './StatTile'

const meta = {
  title: 'Molecules/StatTile',
  component: StatTile,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { value: '10', label: 'sessions' },
} satisfies Meta<typeof StatTile>

export default meta
type Story = StoryObj<typeof meta>

/** On a card or page in the element colour — the run summary's Summary block. */
export const OnSheet: Story = {
  args: { surface: 'sheet' },
}

/** On a filled header strip — the full report's masthead. */
export const OnBand: Story = {
  args: { surface: 'band' },
  decorators: [
    (Story) => (
      <div className="p-l rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <Story />
      </div>
    ),
  ],
}

/** A status dot leads the value when the number carries a severity. */
export const WithDot: Story = {
  args: { value: '3', label: 'bugs', dot: 'var(--error)' },
}

/** Values are not always numbers — footage is a duration, reach is a fraction. */
export const NonNumericValue: Story = {
  args: { value: '2h 14m', label: 'session reviewed' },
}

/** The number is not known yet — same geometry, the value drawn as a skeleton bar. */
export const Loading: Story = {
  args: { value: '', label: 'session reviewed', loading: true, surface: 'band' },
  decorators: [
    (Story) => (
      <div className="p-l rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <Story />
      </div>
    ),
  ],
}

/** A loading tile keeps its status dot, so the row's colour code is in place before the count. */
export const LoadingWithDot: Story = {
  args: { value: '', label: 'bugs', dot: 'var(--error)', loading: true, surface: 'band' },
  decorators: [
    (Story) => (
      <div className="p-l rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <Story />
      </div>
    ),
  ],
}

/** The four tiles as the summary blocks use them. */
export const Row: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-s">
      <StatTile value="9 / 10" label="sessions analysed" />
      <StatTile value="2h 14m" label="session reviewed" />
      <StatTile value="3" label="bugs" dot="var(--error)" />
      <StatTile value="4" label="friction points" dot="var(--warning)" />
    </div>
  ),
}
