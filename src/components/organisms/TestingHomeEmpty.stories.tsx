import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestingHomeEmpty } from './TestingHomeEmpty'

const meta = {
  title: 'Organisms/TestingHomeEmpty',
  component: TestingHomeEmpty,
  tags: ['autodocs'],
} satisfies Meta<typeof TestingHomeEmpty>

export default meta
type Story = StoryObj<typeof meta>

/** The Runs zero state — no recordings, so nothing in Testing has anything to run on. */
export const RunsNoRecordings: Story = {
  args: {
    libraryVideoCount: 0,
    gameContextAdded: true,
  },
}

/** Same shape, User Test's copy — the screen User Test now lands on. */
export const UserTestNoRecordings: Story = {
  args: {
    title: 'Add recordings to run a user test',
    description:
      'A user test reads recorded sessions to find where players struggle. Upload footage you have, or record new sessions with the Recorder app.',
    libraryVideoCount: 0,
    gameContextAdded: true,
  },
}

/** Neither prerequisite met — both readiness items outstanding. */
export const NothingSetUp: Story = {
  args: {
    libraryVideoCount: 0,
    gameContextAdded: false,
  },
}

/**
 * Recordings exist but game context doesn't. Tests can run; they'll just be
 * less sharp — the readiness row says so instead of hiding it.
 */
export const RecordingsWithoutContext: Story = {
  args: {
    libraryVideoCount: 42,
    gameContextAdded: false,
  },
}
