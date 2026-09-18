import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestLockedPitch } from './TestLockedPitch'
import { TESTING_TESTS } from '../../lib/studioAreas'

const byId = (id: string) => TESTING_TESTS.find((t) => t.id === id)!

const meta = {
  title: 'Organisms/Testing/TestLockedPitch',
  component: TestLockedPitch,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof TestLockedPitch>

export default meta
type Story = StoryObj<typeof meta>

/** The locked preset the app ships: Functional test off the plan, two tests on it. */
export const Functional: Story = {
  args: {
    test: byId('functional-test'),
    includedTests: ['User test', 'AI behavioural test'],
    carriesOver: 'Your 14 Gameplay Library recordings and game context carry over — nothing to set up again.',
  },
}

/** A human test the studio hasn't bought — purple accent, agency outcomes. */
export const ExternalAgency: Story = {
  args: { test: byId('agency-test') },
}

/** An AI test not on the plan — same shape, green accent. */
export const AIFunctional: Story = {
  args: { test: byId('ai-functional-test') },
}
