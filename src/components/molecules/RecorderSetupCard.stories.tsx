import type { Meta, StoryObj } from '@storybook/react-vite'
import { RecorderSetupCard } from './RecorderSetupCard'

const meta = {
  title: 'Molecules/RecorderSetupCard',
  component: RecorderSetupCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof RecorderSetupCard>

export default meta
type Story = StoryObj<typeof meta>

/** As the Gameplay Library shows it — with the hide control. */
export const Default: Story = {
  args: { onHide: () => {} },
}

/** Without `onHide` the card has no close control. */
export const NotHideable: Story = {}
