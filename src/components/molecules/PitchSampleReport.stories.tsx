import type { Meta, StoryObj } from '@storybook/react-vite'
import { SampleCaseReport, SampleFindingReport } from './PitchSampleReport'

const meta = {
  title: 'Molecules/PitchSampleReport',
  component: SampleCaseReport,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="page-measure py-xxl2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SampleCaseReport>

export default meta
type Story = StoryObj<typeof SampleCaseReport>

/** Functional test — coverage first, then each case marked. */
export const Cases: Story = {
  args: {
    title: 'Release candidate 4.2 · 96 cases',
    meta: 'Sep 5 · your recordings',
    headline: '62 of 96 cases verified',
    coverage: { pass: 41, fail: 12, review: 9, notRun: 34 },
    rows: [
      { label: 'Furnace upgrade from tutorial hint', outcome: 'fail', clips: 4 },
      { label: 'Purchase restore after reinstall', outcome: 'pass', clips: 2 },
      { label: 'Complete the tutorial on a fresh install', outcome: 'review', clips: 3 },
    ],
  },
}

/** AI functional — the same document, a full sheet, and a run time. */
export const CasesFromAI: Story = {
  args: {
    title: 'Season 9 — core loop · 24 cases',
    meta: 'Sep 5 · AI player sessions',
    headline: '24 of 24 cases verified, in 28 minutes',
    coverage: { pass: 19, fail: 2, review: 3, notRun: 0 },
    rows: [
      { label: 'Battle Pass premium purchase', outcome: 'fail', clips: 4 },
      { label: 'Chapter 2 unlock after Chapter 1 stars', outcome: 'pass', clips: 2 },
      { label: 'Daily quest reset at 00:00 UTC', outcome: 'review', clips: 3 },
    ],
  },
}

/** User test — what the run was made of, then findings ranked by reach. */
export const Findings: Story = {
  render: () => (
    <SampleFindingReport
      title="Onboarding flow v3 · 10 sessions"
      meta="Sep 5 · your recordings"
      tiles={[
        { value: '10', label: 'sessions analysed' },
        { value: '2h 14m', label: 'footage reviewed' },
        { value: '3', label: 'bugs', dot: 'var(--error)' },
        { value: '4', label: 'friction points', dot: 'var(--warning)' },
      ]}
      rows={[
        { label: '“Upgrade Furnace” button unresponsive after tutorial hint', severity: 'blocking', reach: '6 / 10 sessions', clips: 4 },
        { label: 'Repeated taps on locked Hero Recruit', severity: 'disruptive', reach: '4 / 10 sessions', clips: 2 },
        { label: 'Daily reward dialog overlaps chapter-complete popup', severity: 'cosmetic', reach: '2 / 10 sessions', clips: 3 },
      ]}
    />
  ),
}

/** AI behavioural — the same document, counted in agents and personas. */
export const FindingsFromAI: Story = {
  render: () => (
    <SampleFindingReport
      title="Frost Festival — new player & whale · 20 sessions"
      meta="Sep 5 · AI player sessions"
      tiles={[
        { value: '2', label: 'personas' },
        { value: '20', label: 'sessions played' },
        { value: '10h', label: 'footage reviewed' },
        { value: '3', label: 'bugs', dot: 'var(--error)' },
        { value: '4', label: 'friction points', dot: 'var(--warning)' },
      ]}
      rows={[
        { label: 'Whales skip the battle pass upgrade path', severity: 'blocking', reach: '16 / 20 agents', clips: 4 },
        { label: 'New players stall at Research screen', severity: 'disruptive', reach: '10 / 20 agents', clips: 2 },
        { label: 'Event shop not discovered by day 3', severity: 'cosmetic', reach: '4 / 20 agents', clips: 3 },
      ]}
    />
  ),
}
