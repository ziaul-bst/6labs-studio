import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportFindingRow } from './ReportFindingRow'
import { USER_TEST_ISSUES } from '../../lib/mocks/user-test'

const blocking = USER_TEST_ISSUES.find((i) => i.severity === 'blocking')!
const disruptive = USER_TEST_ISSUES.find((i) => i.severity === 'disruptive')!
const cosmetic = USER_TEST_ISSUES.find((i) => i.severity === 'cosmetic')!

const meta = {
  title: 'Molecules/ReportFindingRow',
  component: ReportFindingRow,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { issue: blocking },
  decorators: [
    (Story) => (
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportFindingRow>

export default meta
type Story = StoryObj<typeof meta>

/** Blocking — the red rail down the edge is the axis the list is scanned on. */
export const Blocking: Story = {}

/** Disruptive — recoverable, but it cost taps, time or a wrong turn. */
export const Disruptive: Story = { args: { issue: disruptive } }

/** Cosmetic — visible, with no behavioural consequence in the batch. */
export const Cosmetic: Story = { args: { issue: cosmetic } }

/** Without a game context document the step reads as a raw screen name. */
export const WithoutGameStep: Story = {
  args: { issue: { ...blocking, stepLabel: undefined } },
}

/** No clips — the evidence row disappears rather than leaving an empty label. */
export const NoClips: Story = {
  args: { issue: { ...disruptive, clips: [] } },
}

/** A long title truncates against the session count instead of pushing it off. */
export const LongTitle: Story = {
  args: {
    issue: {
      ...blocking,
      title:
        'The tutorial hint overlay intercepts taps on every highlighted control from step 4 onward, on all three test devices',
    },
  },
}

/** Rows stack on dividers inside their group block — no gap between them. */
export const Stacked: Story = {
  render: () => (
    <>
      {USER_TEST_ISSUES.slice(0, 3).map((issue) => (
        <ReportFindingRow key={issue.id} issue={issue} />
      ))}
    </>
  ),
}
