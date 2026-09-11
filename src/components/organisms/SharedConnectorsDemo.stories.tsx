import type { Meta, StoryObj } from '@storybook/react-vite'
import { SharedConnectorsDemo } from './SharedConnectorsDemo'

const meta = {
  title: 'Organisms/SharedConnectorsDemo',
  component: SharedConnectorsDemo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SharedConnectorsDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Full comparison — use the header to switch Option A/B and Alex/Priya. */
export const Compare: Story = {}

// Hub states
export const OptionA_TeammateHub: Story = { args: { initialOption: 'A', initialViewerIsOwner: false } }
export const OptionA_OwnerHub: Story = { args: { initialOption: 'A', initialViewerIsOwner: true } }
export const OptionB_TeammateHub: Story = { args: { initialOption: 'B', initialViewerIsOwner: false } }
export const OptionB_OwnerHub: Story = { args: { initialOption: 'B', initialViewerIsOwner: true } }

// Detail states
export const OptionA_ViewOnlyLock: Story = { args: { initialOption: 'A', initialViewerIsOwner: false, initialOpenId: 'bigquery' } }
export const OptionA_OwnerEditable: Story = { args: { initialOption: 'A', initialViewerIsOwner: true, initialOpenId: 'bigquery' } }
export const OptionB_SharedDetail: Story = { args: { initialOption: 'B', initialViewerIsOwner: false, initialOpenId: 'bigquery' } }
export const OptionB_OwnerDetail: Story = { args: { initialOption: 'B', initialViewerIsOwner: true, initialOpenId: 'snowflake' } }

// Connect flow (accepts any file)
export const ConnectFlow_UploadOpen: Story = { args: { initialOnboardingId: 'slack' } }
export const AvailableAlreadyConnected: Story = { args: { initialOption: 'B', initialConnectedExtra: ['slack'] } }
