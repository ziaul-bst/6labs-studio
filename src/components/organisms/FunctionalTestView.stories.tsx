import type { Meta, StoryObj } from '@storybook/react-vite'
import { FunctionalTestView } from './FunctionalTestView'

const meta = {
  title: 'Organisms/Testing/FunctionalTestView',
  component: FunctionalTestView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof FunctionalTestView>

export default meta
type Story = StoryObj<typeof meta>

/** Your own team's recordings — verification only, teal accent. */
export const Functional: Story = {
  args: { variant: 'functional' },
}

/** An agency batch — verification plus the behavioural pass, purple accent. */
export const ExternalAgency: Story = {
  args: { variant: 'agency' },
}

/** Run history — counts of passed / failed / needs review per run. */
export const ReportHistory: Story = {
  args: { variant: 'functional', initialTab: 'history' },
}
