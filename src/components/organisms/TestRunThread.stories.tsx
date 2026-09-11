import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestRunThread } from './TestRunThread'
import { THREAD_SESSIONS } from '../../lib/mocks/testing'

const meta = {
  title: 'Organisms/Testing/TestRunThread',
  component: TestRunThread,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    title: 'Build V2.2 — onboarding',
    request: {
      headline: 'Analyse 10 sessions',
      detail: 'tagged Build V2.2 · context: Onboarding flow v3 · no previous analysis',
    },
    sessions: THREAD_SESSIONS,
    gameContext: 'Onboarding flow v3',
    onBack: () => {},
  },
} satisfies Meta<typeof TestRunThread>

export default meta
type Story = StoryObj<typeof meta>

/** Still reading — progress per session, interim notes as patterns appear. */
export const Analysing: Story = {
  args: { inProgress: true },
}

/** Finished — the report posted in the thread, follow-up questions below. */
export const Complete: Story = {
  args: { inProgress: false },
}

/** Started from a question on the home screen rather than a report request. */
export const QuestionFirst: Story = {
  args: {
    inProgress: false,
    title: 'Which testers quit before finishing onboarding?',
    question: 'Which testers quit before finishing onboarding, and what were they doing right before?',
    onOpenReport: () => {},
  },
}
