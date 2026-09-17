import type { Meta, StoryObj } from '@storybook/react-vite'
import { FunctionalTestReport } from './FunctionalTestReport'
import { VERIFIED_CASES, VERIFICATION_TOTALS } from '../../lib/mocks/verified-cases'
import { TEXT_HEAVY_CASES, TEXT_HEAVY_TOTALS } from '../../lib/mocks/verified-cases-heavy'

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

/**
 * Full coverage: every case in the file was reached, so the Coverage meter
 * reads 100% and the gap line becomes a clean bill. The extra cases go to pass
 * — the four outcomes have to sum to `run`, or the Result bar shows the
 * shortfall as an unexplained gap, which is exactly what it is for.
 */
export const FullCoverage: Story = {
  args: {
    totals: {
      ...VERIFICATION_TOTALS,
      run: VERIFICATION_TOTALS.total,
      pass:
        VERIFICATION_TOTALS.pass +
        (VERIFICATION_TOTALS.total - VERIFICATION_TOTALS.run),
    },
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

/**
 * Text-heavy: a payments and account suite where a case is a paragraph of
 * setup, a multi-clause expected result and eight to eleven steps. This is the
 * state the row clamp and the Expected/Observed cards are judged on — open
 * TC-9104 or TC-9117 for the deepest ones.
 */
export const TextHeavy: Story = {
  args: {
    title: 'Build V3.0 — payments and account regression',
    subtitle: '6 videos · payments-account-regression.xlsx · Build V3.0 · verified by 6labs agent',
    cases: TEXT_HEAVY_CASES,
    totals: TEXT_HEAVY_TOTALS,
  },
}

/** The same deep cases read one at a time, with no list rail beside them. */
export const TextHeavyWithoutModalNavigator: Story = {
  args: {
    ...TextHeavy.args,
    modalNavigator: false,
  },
}

/**
 * Split case modal: clip and specification pinned in a left pane, Observed
 * scrolling on the right. Every step is a seek control — open TC-9104 and click
 * step 9 to park the clip on 13:52 with the frame still on screen. Needs
 * ~1100px; narrower, the modal falls back to the stacked shape on its own.
 */
export const SplitCaseModal: Story = {
  args: {
    ...TextHeavy.args,
    modalLayout: 'split' as const,
  },
}
