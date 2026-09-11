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

/** A human test the studio hasn't bought — purple accent, agency outcomes. */
export const ExternalAgency: Story = {
  args: { test: byId('agency-test') },
}

/** An AI test not on the plan — same shape, green accent. */
export const AIFunctional: Story = {
  args: { test: byId('ai-functional-test') },
}
