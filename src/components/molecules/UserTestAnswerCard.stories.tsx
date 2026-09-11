import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestAnswerCard } from './UserTestAnswerCard'
import { USER_TEST_ASK_ANSWERS, USER_TEST_ASK_FALLBACK } from '../../lib/mocks/user-test'

const meta = {
  title: 'Molecules/UserTestAnswerCard',
  component: UserTestAnswerCard,
  tags: ['autodocs'],
} satisfies Meta<typeof UserTestAnswerCard>

export default meta
type Story = StoryObj<typeof meta>

/** Counts per group, so the answer arrives as a table rather than a claim. */
export const WithTable: Story = {
  args: { answer: USER_TEST_ASK_ANSWERS['Which device saw the most bugs?'] },
}

/** Prose plus references — the run explaining its own confidence label. */
export const WithReasoning: Story = {
  args: { answer: USER_TEST_ASK_ANSWERS['Why is issue 4 medium confidence?'] },
}

/** Out of corpus: the limit is stated and the handoff offered, nothing guessed. */
export const OutOfScope: Story = {
  args: {
    answer: USER_TEST_ASK_ANSWERS['Is the Furnace tap issue visible in live player data?'],
  },
}

/** Nothing in the run answers it — said plainly, with no evidence chips to fake. */
export const NoAnswerAvailable: Story = {
  args: { answer: USER_TEST_ASK_FALLBACK },
}
