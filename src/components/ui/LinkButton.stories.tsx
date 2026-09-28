import type { Meta, StoryObj } from '@storybook/react-vite'
import LinkButton from './LinkButton'
import { DownloadIcon } from '../icons/DownloadIcon'

const meta = {
  title: 'UI/LinkButton',
  component: LinkButton,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    href: 'https://docs.6labs.ai/recorder',
    target: '_blank',
    rel: 'noopener noreferrer',
    children: 'Recorder documentation',
  },
} satisfies Meta<typeof LinkButton>

export default meta
type Story = StoryObj<typeof meta>

/** A download — primary, with the Apparatus download glyph. */
export const PrimaryDownload: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    leftIcon: <DownloadIcon size={16} />,
    children: 'Download for Windows',
  },
}

export const Secondary: Story = {
  args: { variant: 'secondary', size: 'lg' },
}

/** The quiet sibling of a primary — no padding, brand text, underline on hover. */
export const Link: Story = {
  args: { variant: 'link', size: 'lg' },
}
