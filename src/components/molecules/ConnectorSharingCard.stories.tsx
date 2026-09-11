import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ConnectorSharingCard } from './ConnectorSharingCard'

const meta = {
  title: 'Molecules/ConnectorSharingCard',
  component: ConnectorSharingCard,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 460, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConnectorSharingCard>

export default meta
type Story = StoryObj<typeof meta>

/** Default — edit access off, so only the owner can edit descriptions. */
export const EditOff: Story = {
  args: { orgWideEdit: false, onOrgWideEditChange: () => {} },
}

/** Edit access granted to the whole workspace. */
export const EditOn: Story = {
  args: { orgWideEdit: true, onOrgWideEditChange: () => {} },
}

/** Interactive — clicking the label or the switch toggles edit access. */
export const Interactive: Story = {
  args: { orgWideEdit: false, onOrgWideEditChange: () => {} },
  render: function InteractiveStory() {
    const [on, setOn] = useState(false)
    return <ConnectorSharingCard orgWideEdit={on} onOrgWideEditChange={setOn} />
  },
}
