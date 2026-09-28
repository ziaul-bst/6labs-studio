import type { Meta, StoryObj } from '@storybook/react-vite'
import { RecorderWorkflowDemo } from './RecorderWorkflowDemo'

const meta = {
  title: 'Molecules/RecorderWorkflowDemo',
  component: RecorderWorkflowDemo,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecorderWorkflowDemo>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Playing, as on the Recorder page. Hover the window or the pips to pause it;
 * keyboard focus on the pips pauses it too. Under prefers-reduced-motion it
 * never plays and shows the still frame for each state.
 */
export const Playing: Story = {}

/** Still frames — autoplay off, one per state. */
export const Setup: Story = { args: { initialState: 'setup', autoplay: false } }
export const Waiting: Story = { args: { initialState: 'waiting', autoplay: false } }
export const Recording: Story = { args: { initialState: 'recording', autoplay: false } }
/** The still frame holds the upload at 68% — a moment that reads as "in progress". */
export const Uploading: Story = { args: { initialState: 'uploading', autoplay: false } }
export const Uploaded: Story = { args: { initialState: 'uploaded', autoplay: false } }
