import type { Meta, StoryObj } from '@storybook/react-vite'
import { ContactSalesDialog } from './ContactSalesDialog'

const meta = {
  title: 'Molecules/ContactSalesDialog',
  component: ContactSalesDialog,
  tags: ['autodocs'],
  parameters: {
    docs: { story: { inline: false, iframeHeight: 360 } },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    testLabel: { control: 'text' },
    supportEmail: { control: 'text' },
    workspaceName: { control: 'text' },
  },
  args: {
    isOpen: true,
    onClose: () => {},
    testLabel: 'AI functional test',
  },
} satisfies Meta<typeof ContactSalesDialog>

export default meta
type Story = StoryObj<typeof meta>

/** Default — the locked-test ask that "Contact sales" resolves to. */
export const Default: Story = {}

/** With the workspace named, so the draft says which workspace to enable. */
export const WithWorkspace: Story = {
  args: { workspaceName: 'BlueStacks Studio' },
}

/** A longer test name — checks the title and body wrap cleanly at lg width. */
export const LongTestName: Story = {
  args: { testLabel: 'External agency test (managed)' },
}
