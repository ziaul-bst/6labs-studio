import type { Meta, StoryObj } from '@storybook/react-vite'
import { FunctionalReportView } from './FunctionalReportView'

const meta = {
  title: 'Organisms/Testing/FunctionalReportView',
  component: FunctionalReportView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    title: 'Build V2.2 — tutorial regression',
    subtitle: '8 videos · regression-suite.xlsx · Build V2.2 · verified by 6labs agent',
    onBack: () => {},
  },
} satisfies Meta<typeof FunctionalReportView>

export default meta
type Story = StoryObj<typeof meta>

/** Finished human verification — verdict, filters, cases by module. */
export const Human: Story = {
  args: { mode: 'human' },
}

/** Agency run — the same report plus behavioural findings from the sessions. */
export const AgencyWithUx: Story = {
  args: { mode: 'human', withUx: true, title: 'Agency batch — Digital Hearts' },
}

/** AI players executing — the progress card narrates agents, not videos. */
export const AiInProgress: Story = {
  args: {
    mode: 'ai',
    inProgress: true,
    title: 'Season 9 — core loop',
    subtitle: '24 cases · build v2.3.1 · executed by AI Player, 3 agents',
  },
}
