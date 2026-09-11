import type { Meta, StoryObj } from '@storybook/react-vite'
import { AgentPipelineLoader, type PipelineStep } from './AgentPipelineLoader'

const meta = {
  title: 'Molecules/AgentPipelineLoader',
  component: AgentPipelineLoader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: 760,
          overflow: 'hidden',
          borderRadius: 20,
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-elements)',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AgentPipelineLoader>

export default meta
type Story = StoryObj<typeof meta>

/** Mirrors the step copy in the Figma component set. */
const ORACLE_STEPS: PipelineStep[] = [
  {
    title: 'Understanding your question',
    activeSub: 'Parsing intent and scope…',
    doneSub: 'Spending comparison across 3 markets for Minnow spenders',
    duration: '1.2s',
  },
  {
    title: 'Recalling context',
    activeSub: 'Checking this thread for prior context…',
    doneSub: 'No prior context found in this thread',
    duration: '0.8s',
  },
  {
    title: 'Building reasoning plan',
    activeSub: 'Mapping reasoning paths…',
    doneSub: '4 reasoning paths identified across spending, engagement, and segmentation',
    duration: '3.4s',
  },
  {
    title: 'Consulting Radiologist',
    activeSub: 'Scanning 90 sessions across Germany, France, and India',
    doneSub: 'Scanning 90 sessions across Germany, France, and India',
    duration: '8.2s',
    callout: {
      lead: '90 sessions found across 3 markets',
      rest: ' — Germany, France, India',
    },
  },
  {
    title: 'Evaluating relevance',
    activeSub: '62 sessions selected — 28 filtered out',
    doneSub: '62 sessions selected — 28 filtered out',
    duration: '5.6s',
    callout: {
      lead: '62 sessions',
      rest: ' selected with clear spending tier data',
    },
  },
  {
    title: 'Generating insights',
    activeSub: 'Building comparative analysis across 3 markets',
    doneSub: 'Building comparative analysis across 3 markets',
    duration: '22.0s',
  },
  {
    title: 'Validating response',
    activeSub: 'Confirming accuracy against source data',
    doneSub: 'Confirming accuracy against source data',
    duration: '0.3s',
  },
]

const SUMMARY_STEPS: PipelineStep[] = [
  {
    title: 'Reading conversation',
    activeSub: 'Reviewing 3 turns and 65 sources referenced',
    doneSub: 'Reviewing 3 turns and 65 sources referenced',
    duration: '1.5s',
  },
  {
    title: 'Synthesizing findings',
    activeSub: 'Identifying key patterns across tutorial friction analysis',
    doneSub: 'Identifying key patterns across tutorial friction analysis',
    duration: '6.0s',
  },
  {
    title: 'Generating summary',
    activeSub: 'Structuring insights with supporting data points',
    doneSub: 'Structuring insights with supporting data points',
    duration: '1.6s',
  },
]

/** Figma "State=Pending" — query accepted, first step not started. */
export const Pending: Story = {
  args: { steps: ORACLE_STEPS, currentStep: 0, state: 'pending' },
}

/** Figma "State=Mid Progress" — four done (one with a finding), fifth running. */
export const MidProgress: Story = {
  args: { steps: ORACLE_STEPS, currentStep: 4, state: 'running' },
}

/** Figma "State=Complete" — every step done, rail at 100%. */
export const Complete: Story = {
  args: { steps: ORACLE_STEPS, currentStep: ORACLE_STEPS.length, state: 'complete' },
}

/** Figma "State=Complete — Summary" — the shorter 3-step summarization pipeline. */
export const CompleteSummary: Story = {
  args: { steps: SUMMARY_STEPS, currentStep: SUMMARY_STEPS.length, state: 'complete' },
}

/** Figma "State=Generic Error" — error row replaces the stepper, rail hidden. */
export const GenericError: Story = {
  args: {
    steps: ORACLE_STEPS,
    currentStep: 2,
    state: 'error',
    error: {
      title: 'Oracle ran into a problem',
      description: 'Something went wrong. Please try again',
      onRetry: () => console.log('retry'),
    },
  },
}

/** First step running — the earliest frame of the reveal. */
export const FirstStepRunning: Story = {
  args: { steps: ORACLE_STEPS, currentStep: 0, state: 'running' },
}

/** No pinned durations — the loader times each step live instead. */
export const LiveTiming: Story = {
  args: {
    steps: ORACLE_STEPS.map(({ duration: _duration, ...rest }) => rest),
    currentStep: 3,
    state: 'running',
  },
}

/** All four Figma Note `Type` tints — note that `normal` is success-green. */
export const CalloutTints: Story = {
  args: {
    steps: (['normal', 'error', 'warning', 'notice'] as const).map((type) => ({
      title: `Note type: ${type}`,
      activeSub: 'Finding surfaced by this step',
      doneSub: 'Finding surfaced by this step',
      duration: '1.0s',
      callout: { type, lead: `${type} lead-in`, rest: ' — regular-weight remainder' },
    })),
    currentStep: 4,
    state: 'complete',
  },
}

/** With the agent-identity header slot, as used in SpecializedAgentChatView. */
export const WithHeader: Story = {
  args: {
    steps: SUMMARY_STEPS,
    currentStep: 1,
    state: 'running',
    header: (
      <div className="flex items-center gap-xs">
        <div
          className="shrink-0 size-[24px] rounded-s"
          style={{ background: 'linear-gradient(135deg, #1770EF 0%, #18B6C9 100%)' }}
        />
        <span className="font-display text-s font-semibold text-text-primary">
          Churn Agent is working…
        </span>
      </div>
    ),
  },
}
