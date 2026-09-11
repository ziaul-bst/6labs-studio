import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestAskPanel } from './UserTestAskPanel'
import { USER_TEST_ASK_ANSWERS } from '../../lib/mocks/user-test'

const meta = {
  title: 'Organisms/UserTestAskPanel',
  component: UserTestAskPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof UserTestAskPanel>

export default meta
type Story = StoryObj<typeof meta>

/** At rest — four openers, the dashed one flagged as a handoff before it's spent. */
export const Suggestions: Story = {
  args: {},
}

/** An answer this run can give, with the per-device counts behind it. */
export const AnsweredWithTable: Story = {
  args: {
    initialTurns: [
      {
        id: '1',
        question: 'Which device saw the most bugs?',
        answer: USER_TEST_ASK_ANSWERS['Which device saw the most bugs?'],
      },
    ],
  },
}

/** Reasoning about the agent's own confidence — the run explaining itself. */
export const AnsweredWithReasoning: Story = {
  args: {
    initialTurns: [
      {
        id: '1',
        question: 'Why is issue 4 medium confidence?',
        answer: USER_TEST_ASK_ANSWERS['Why is issue 4 medium confidence?'],
      },
    ],
  },
}

/** The boundary: a question this corpus can't answer, declined and handed over. */
export const OutOfScopeHandoff: Story = {
  args: {
    initialTurns: [
      {
        id: '1',
        question: 'Is the Furnace tap issue visible in live player data?',
        answer: USER_TEST_ASK_ANSWERS['Is the Furnace tap issue visible in live player data?'],
      },
    ],
  },
}

/** Waiting on an answer. */
export const Thinking: Story = {
  args: {
    initialTurns: [{ id: '1', question: 'Show me every clip where a tester quit', answer: null }],
  },
}
