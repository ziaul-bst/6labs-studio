import type { Meta, StoryObj } from '@storybook/react-vite'
import { RunHistoryEmptyState } from './RunHistoryEmptyState'

const meta = {
  title: 'Molecules/Testing/RunHistoryEmptyState',
  component: RunHistoryEmptyState,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div
        className="w-[720px] rounded-2xl"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RunHistoryEmptyState>

export default meta
type Story = StoryObj<typeof meta>

/** User Test — reports and questions both land here. */
export const UserTest: Story = {
  args: {
    title: 'Nothing has run yet',
    message: 'Run a report on your footage or ask it a question — both land here.',
    action: { label: 'New run', onClick: () => {} },
  },
}

/** A test that only writes reports, without a way out wired. */
export const ReportsOnly: Story = {
  args: {
    title: 'No runs yet',
    message: 'Choose personas and a build, run it, and the session report lands here.',
  },
}
