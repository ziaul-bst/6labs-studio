import type { Meta, StoryObj } from '@storybook/react-vite'
import { AIFunctionalTestView } from './AIFunctionalTestView'

const meta = {
  title: 'Organisms/Testing/AIFunctionalTestView',
  component: AIFunctionalTestView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof AIFunctionalTestView>

export default meta
type Story = StoryObj<typeof meta>

/** Set up a run — drop the cases, pick a build, run. */
export const NewTest: Story = {}

/** Run history — one executed run, one file never run. */
export const ReportHistory: Story = {
  args: { initialTab: 'history' },
}
