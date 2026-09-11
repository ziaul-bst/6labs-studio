import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestingOverview } from './TestingOverview'

const meta = {
  title: 'Organisms/Testing/TestingOverview',
  component: TestingOverview,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof TestingOverview>

export default meta
type Story = StoryObj<typeof meta>

/** Both groups, live tests clickable, roadmap tests greyed and marked SOON. */
export const Default: Story = {}
