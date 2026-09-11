import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestRunSetupModal } from './UserTestRunSetupModal'

const meta = {
  title: 'Organisms/UserTestRunSetupModal',
  component: UserTestRunSetupModal,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: () => {},
  },
} satisfies Meta<typeof UserTestRunSetupModal>

export default meta
type Story = StoryObj<typeof meta>

/** Step 1 — the Build V2.2 batch is pre-selected by its tag. */
export const PickSessions: Story = {
  args: { defaultStep: 1 },
}

/** Step 1 with nothing pre-selected — tag rail at rest, Next disabled. */
export const NothingSelected: Story = {
  args: { defaultStep: 1, defaultTag: '__none__' },
}

/** Step 2 — game context is a real choice, and comparison depends on it. */
export const GameContextAndRun: Story = {
  args: { defaultStep: 2 },
}
