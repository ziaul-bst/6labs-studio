import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestRunSummary } from './UserTestRunSummary'
import { USER_TEST_ISSUES } from '../../lib/mocks/user-test'

const meta = {
  title: 'Organisms/UserTestRunSummary',
  component: UserTestRunSummary,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    runName: 'Build V2.1 — onboarding (Aug 26)',
    issues: USER_TEST_ISSUES,
  },
} satisfies Meta<typeof UserTestRunSummary>

export default meta
type Story = StoryObj<typeof meta>

/** The default summary — four findings previewed, three more behind the link. */
export const Default: Story = {}

/** Every finding on the summary, for a run small enough not to need the report. */
export const AllIssuesPreviewed: Story = {
  args: { previewCount: USER_TEST_ISSUES.length },
}

/** Bugs only — a run scoped to a bug report rather than bugs plus UX. */
export const BugScopeOnly: Story = {
  args: { issues: USER_TEST_ISSUES.filter((i) => i.kind === 'bug') },
}

/** No game-context document: findings are per video, and the facts line says so. */
export const WithoutGameContext: Story = {
  args: {
    facts: {
      videos: '10 videos · tag Build V2.1',
      context: null,
      devices: 'Pixel 7 · iPhone 13 · Galaxy S23',
      when: 'Aug 26 · 31 min',
    },
  },
}
