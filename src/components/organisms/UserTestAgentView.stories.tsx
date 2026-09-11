import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestAgentView } from './UserTestAgentView'

const meta = {
  title: 'Organisms/UserTestAgentView',
  component: UserTestAgentView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof UserTestAgentView>

export default meta
type Story = StoryObj<typeof meta>

/** The composer home — pick videos, generate a report or ask a question. */
export const Home: Story = {
  args: {
    libraryVideoCount: 42,
    initialScreen: 'home',
  },
}

/** No recordings — the home is replaced by the blocker with the two ways in. */
export const NoRecordings: Story = {
  args: {
    libraryVideoCount: 0,
    initialScreen: 'home',
  },
}

/** History tab — every analysis and question this agent has run. */
export const ReportHistory: Story = {
  args: {
    initialScreen: 'home',
    initialTab: 'history',
  },
}

/** A finished run read as a thread: request, report, follow-up questions. */
export const RunThread: Story = {
  args: {
    initialScreen: 'thread',
  },
}

/** The full report, landing on the ranked issue list. */
export const FullReport: Story = {
  args: {
    initialScreen: 'report',
    initialReportTab: 'issues',
  },
}

/** Arriving from "See what changed" — the report opens on the comparison cut. */
export const CompareWithPreviousRun: Story = {
  args: {
    initialScreen: 'report',
    initialReportTab: 'comparison',
  },
}
