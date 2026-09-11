import type { Meta, StoryObj } from '@storybook/react-vite'
import { AIBehaviouralTestView } from './AIBehaviouralTestView'

const meta = {
  title: 'Organisms/Testing/AIBehaviouralTestView',
  component: AIBehaviouralTestView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof AIBehaviouralTestView>

export default meta
type Story = StoryObj<typeof meta>

/** Session composer — build, agents, personas, length, instructions. */
export const NewSession: Story = {}

/** Run history — behavioural sessions already run. */
export const ReportHistory: Story = {
  args: { initialTab: 'history' },
}
