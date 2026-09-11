import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnalysisProgressCard } from './AnalysisProgressCard'
import { THREAD_SESSIONS, THREAD_SO_FAR } from '../../lib/mocks/testing'

const meta = {
  title: 'Molecules/Testing/AnalysisProgressCard',
  component: AnalysisProgressCard,
  tags: ['autodocs'],
  args: { items: THREAD_SESSIONS },
} satisfies Meta<typeof AnalysisProgressCard>

export default meta
type Story = StoryObj<typeof meta>

export const Starting: Story = {
  args: { label: 'Starting…', percent: 2, eta: '~25 min', currentIndex: 0 },
}

export const MidRun: Story = {
  args: { label: '4 of 10 analysed', percent: 41, eta: '~15 min', currentIndex: 4, soFar: THREAD_SO_FAR[4], onSkip: () => {} },
}

export const Done: Story = {
  args: { label: '10 of 10 analysed', percent: 100, eta: 'done', currentIndex: 10 },
}
