import type { Meta, StoryObj } from '@storybook/react-vite'
import { AreaLockedPitch } from './AreaLockedPitch'

const meta = {
  title: 'Organisms/AreaLockedPitch',
  component: AreaLockedPitch,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: 560, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AreaLockedPitch>

export default meta
type Story = StoryObj<typeof meta>

/** What the muted Testing tab resolves to — never an empty product. */
export const TestingLocked: Story = {
  args: {
    area: 'testing',
    carriesOver: 'Your game context and 42 gameplay videos carry straight over.',
  },
}

/** The mirror case, for a testing-only studio. */
export const IntelligenceLocked: Story = {
  args: {
    area: 'intelligence',
    carriesOver: 'Your game context and uploaded documents carry straight over.',
  },
}

/** Without a carry-over line — a brand-new account with nothing to carry. */
export const NoCarryOver: Story = {
  args: {
    area: 'testing',
  },
}
