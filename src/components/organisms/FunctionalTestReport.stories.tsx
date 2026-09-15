import type { Meta, StoryObj } from '@storybook/react-vite'
import { FunctionalTestReport } from './FunctionalTestReport'
import { VERIFIED_CASES, VERIFICATION_TOTALS } from '../../lib/mocks/verified-cases'

const meta = {
  title: 'Organisms/FunctionalTestReport',
  component: FunctionalTestReport,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    title: 'Build V2.2 — test-case verification',
    subtitle: '8 videos · regression-suite.xlsx · Build V2.2 · verified by 6labs agent',
    mode: 'human' as const,
    onBack: () => {},
  },
} satisfies Meta<typeof FunctionalTestReport>

export default meta
type Story = StoryObj<typeof meta>

/** The finished report — twelve cases on one page, with the coverage gap named. */
export const Default: Story = {}

/** Paged: five rows at a time, so the pager under the table has something to do. */
export const Paged: Story = {
  args: { pageSize: 5 },
}

/** The plain modal shape — one case, no list rail. Open any row to see it. */
export const WithoutModalNavigator: Story = {
  args: { modalNavigator: false },
}

/** Full coverage: every case in the file was reached, so no gap line is shown. */
export const FullCoverage: Story = {
  args: {
    totals: { ...VERIFICATION_TOTALS, run: VERIFICATION_TOTALS.total },
  },
}

/** Nothing failed — the report a green build produces. */
export const AllPassing: Story = {
  args: {
    cases: VERIFIED_CASES.map((c) => ({ ...c, outcome: 'pass' as const })),
    totals: {
      ...VERIFICATION_TOTALS,
      pass: VERIFICATION_TOTALS.run,
      fail: 0,
      blocked: 0,
      review: 0,
    },
  },
}

/** Still verifying — the progress card stands in for the table. */
export const InProgress: Story = {
  args: { inProgress: true },
}

/** The run stopped before it finished. */
export const Failed: Story = {
  args: { failure: 'The verification agent lost the video stream after 4 of 18 recordings.' },
}
