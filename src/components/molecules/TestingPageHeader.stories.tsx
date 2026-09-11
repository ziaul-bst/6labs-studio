import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestingPageHeader } from './TestingPageHeader'
import { FunctionalTestIcon } from '../icons/FunctionalTestIcon'
import { AgencyTestIcon } from '../icons/AgencyTestIcon'
import { AIBehaviouralIcon } from '../icons/AIBehaviouralIcon'

const meta = {
  title: 'Molecules/Testing/TestingPageHeader',
  component: TestingPageHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof TestingPageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Functional: Story = {
  args: {
    title: 'Functional test',
    description: 'Upload the tests you already ran. 6labs checks what happened in each video — did every action complete — and makes them searchable.',
    icon: <FunctionalTestIcon size={32} />,
    accent: 'teal',
  },
}

export const Agency: Story = {
  args: {
    title: 'External agency test',
    description: 'Upload sessions from your QA agency. 6labs runs the same analysis across every session.',
    icon: <AgencyTestIcon size={32} />,
    accent: 'purple',
  },
}

export const AiBehavioural: Story = {
  args: {
    title: 'AI behavioural test',
    description: 'AI players play your build like real personas and 6labs analyses what they did.',
    icon: <AIBehaviouralIcon size={32} />,
    accent: 'success',
  },
}
