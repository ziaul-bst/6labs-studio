import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlanLockedBanner } from './PlanLockedBanner'

const meta = {
  title: 'Molecules/PlanLockedBanner',
  component: PlanLockedBanner,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    testLabel: { control: 'text' },
    guideHref: { control: 'text' },
  },
  args: {
    testLabel: 'Functional test',
    onContactSales: () => {},
  },
} satisfies Meta<typeof PlanLockedBanner>

export default meta
type Story = StoryObj<typeof meta>

/** Default — the top bar of a test the plan does not include. */
export const Default: Story = {}

/** The longest live test name — checks the sentence still sits on one line at desktop widths. */
export const LongestTestName: Story = {
  args: { testLabel: 'AI behavioural test' },
}

/** A narrow content region — the sentence wraps and the two actions stay on the row. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 820 }}>
        <Story />
      </div>
    ),
  ],
}
