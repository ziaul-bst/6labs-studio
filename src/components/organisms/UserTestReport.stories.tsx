import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestReport } from './UserTestReport'
import { USER_TEST_ISSUES, USER_TEST_REPORT_META } from '../../lib/mocks/user-test'

const meta = {
  title: 'Organisms/UserTestReport',
  component: UserTestReport,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    runName: 'Build V2.2 — onboarding',
    issues: USER_TEST_ISSUES,
  },
} satisfies Meta<typeof UserTestReport>

export default meta
type Story = StoryObj<typeof meta>

/** The whole document: masthead, summary, category table, seven findings. */
export const Default: Story = {}

/** A clean build — one cosmetic finding, no blockers, no category table rows to alarm anyone. */
export const CosmeticOnly: Story = {
  args: {
    issues: USER_TEST_ISSUES.filter((i) => i.severity === 'cosmetic'),
    categories: [
      { label: 'Bug — visual', tone: 'bug', findings: 1, sessionsAffected: 4, blocking: 0 },
      { label: 'Friction — usability', tone: 'friction', findings: 1, sessionsAffected: 6, blocking: 0 },
    ],
    meta: {
      ...USER_TEST_REPORT_META,
      narrative:
        'No session was blocked. Two cosmetic findings remain, both on screens every tester passes through, and neither changed what anyone did next.',
    },
  },
}

/** Blockers only — the cut a release manager reads before shipping. */
export const BlockingOnly: Story = {
  args: {
    issues: USER_TEST_ISSUES.filter((i) => i.severity === 'blocking'),
    categories: [{ label: 'Bug — technical', tone: 'bug', findings: 2, sessionsAffected: 9, blocking: 2 }],
  },
}

/**
 * Nothing found — the outcome the run most wants to be able to report. The
 * category table disappears rather than printing column headings over nothing,
 * and the Findings part says what happened instead of counting to zero.
 */
export const NoFindings: Story = {
  args: {
    issues: [],
    meta: {
      ...USER_TEST_REPORT_META,
      title: 'Build 2.3 — onboarding round',
      narrative:
        'Every session reached the end of the tutorial and on into Chapter 1. No blocking defect, no repeated-action pattern above the noise floor, and nothing cosmetic worth a ticket.',
    },
  },
}

/**
 * A run that reported its findings but not the per-category session union —
 * the column prints an em dash rather than a number nobody computed.
 */
export const WithoutSessionUnion: Story = {
  args: { categories: [] },
}

/** A run with no game-context document: findings still group, steps read as raw screens. */
export const WithoutGameSteps: Story = {
  args: {
    issues: USER_TEST_ISSUES.map((i) => ({ ...i, stepLabel: undefined })),
  },
}
