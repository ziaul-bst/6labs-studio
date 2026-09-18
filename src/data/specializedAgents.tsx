/**
 * Specialized Agents registry — purpose-built agents surfaced on the
 * Specialized Agents hub (homepage tab + sidebar). Each entry drives both the
 * landing card and the launched chat flow (intro, suggested prompts, and a
 * canned demo reply). Prototype data only — no live model is wired.
 *
 * Order shown on the hub: Build Comparison → Churn → A/B Test.
 */
import type { ReactNode } from 'react'
import { BuildComparisonIcon } from '../components/icons/BuildComparisonIcon'
import { ABTestIcon } from '../components/icons/ABTestIcon'
import { ChurnIcon } from '../components/icons/ChurnIcon'
import { SdkMobileIcon } from '../components/icons/SdkMobileIcon'
import { SdkPcIcon } from '../components/icons/SdkPcIcon'
import type { PipelineStep } from '../components/molecules/AgentPipelineLoader'
import type { PlatformOption } from '../components/ui/InputFieldConsole'

export interface AgentReplyStat {
  label: string
  value: string
  variant?: 'default' | 'success' | 'error'
}

export interface SpecializedAgentReply {
  /** Lead insight paragraph */
  summary: string
  /** Headline metrics rendered as stat cards */
  stats?: AgentReplyStat[]
  /** Recommended actions / takeaways */
  bullets?: string[]
}

export interface SpecializedAgent {
  id: string
  name: string
  /** Short category label shown as a pill on the card */
  tag: string
  /** One-line value prop on the card */
  description: string
  /** Fuller framing shown on the agent's launch screen */
  intro: string
  /** Icon element (renders white inside the gradient tile) */
  icon: ReactNode
  /** CSS background for the agent's identity tile */
  iconGradient: string
  /** Input placeholder inside the chat console */
  placeholder: string
  /** Suggested starter prompts (idle state, 4 recommended) */
  suggestions: string[]
  /** Restricts the console source selector. Omit to allow all default sources.
   *  The first entry is the default selection. */
  sources?: PlatformOption[]
  /** Optional prerequisite note (e.g. "Requires SDK integration"). Surfaced as a
   *  chip on the card and an info banner on the agent's launch screen. */
  requirement?: string
  /** Steps shown in the pipeline loader while the response is generated */
  pipeline: PipelineStep[]
  /** Canned demo response shown for any prompt */
  reply: SpecializedAgentReply
}

export const SPECIALIZED_AGENTS: SpecializedAgent[] = [
  {
    id: 'build-comparison',
    name: 'Build Comparison Agent',
    tag: 'Evaluation',
    description: 'Compare builds — what changed between releases, and how players responded.',
    intro:
      'I compare what changed between releases. Point me at your last two builds, or ask about how players responded to the latest one.',
    icon: <BuildComparisonIcon size={40} />,
    iconGradient: 'linear-gradient(135deg, #1770EF 0%, #18B6C9 100%)',
    placeholder: 'Compare two builds, or ask about a release…',
    suggestions: [
      'Compare my two most recent builds — what changed in how players actually play?',
      'Did my latest update introduce any new friction, drop-off, or crashes?',
      'Based on player behavior, should I keep my newest release or roll it back?',
      'One of my key metrics shifted after my latest build — show me the player behavior behind it',
    ],
    pipeline: [
      { title: 'Locating builds', activeSub: 'Resolving the last two release versions…', doneSub: 'Builds identified.' },
      { title: 'Aligning cohorts', activeSub: 'Matching comparable player segments…', doneSub: 'Cohorts aligned.' },
      { title: 'Diffing behavior', activeSub: 'Comparing funnels, retention and crashes…', doneSub: 'Behavioral diff computed.' },
      { title: 'Summarizing changes', activeSub: 'Ranking the most significant deltas…', doneSub: 'Summary ready.' },
    ],
    reply: {
      summary:
        'Comparing your latest build (v2.4.0) against the previous one (v2.3.0): the update improved early-game funnel health with no new stability regressions. Tutorial completion saw the biggest behavioral gain.',
      stats: [
        { label: 'Tutorial completion', value: '78%', variant: 'success' },
        { label: 'vs. previous build', value: '+6pp', variant: 'success' },
        { label: 'D1 retention', value: '41.2%', variant: 'success' },
        { label: 'Crash-free sessions', value: '99.1%' },
      ],
      bullets: [
        'The reworked tutorial step 3 lifted completion by 6pp — the largest behavioral change in this build.',
        'No new crash signatures; crash-free sessions held at 99.1% (+0.4pp vs. the previous build).',
        'A fresh drop-off appeared at the level 18 gate — ~8% of players quit there. Flag it for the next build.',
      ],
    },
  },
  {
    id: 'churn',
    name: 'Churn Agent',
    tag: 'Retention',
    description:
      'Surface at-risk players, explain why they leave, and recommend the next save action.',
    intro:
      'I monitor retention signals and predict who’s about to churn. Ask me who’s at risk, why they’re leaving, or how to win them back.',
    icon: <ChurnIcon size={40} />,
    iconGradient: 'linear-gradient(135deg, #7B4CFF 0%, #E94B9C 100%)',
    placeholder: 'Ask about churn risk, drivers, or who to save…',
    suggestions: [
      'Which players are most likely to churn this week?',
      'What are the top churn drivers right now?',
      'Why did my D7 retention drop?',
      'Who should I target with a win-back offer?',
    ],
    pipeline: [
      { title: 'Scanning player cohorts', activeSub: 'Reading 7-day activity and session data…', doneSub: 'Cohorts scanned.' },
      {
        title: 'Scoring churn risk',
        activeSub: 'Running the retention model…',
        doneSub: 'Risk scores generated.',
        callout: {
          /* A real warning — players about to leave — not a neutral finding. */
          type: 'warning',
          lead: '3,820 players trending toward churn',
          rest: ' — dominant driver is the level 24 difficulty spike',
        },
      },
      { title: 'Identifying drivers', activeSub: 'Attributing churn to behavioral signals…', doneSub: 'Top drivers identified.' },
      { title: 'Preparing save actions', activeSub: 'Ranking win-back interventions…', doneSub: 'Recommended actions ready.' },
    ],
    reply: {
      summary:
        'There’s a high-risk cohort of 3,820 players trending toward churn this week. The dominant driver is a difficulty spike at level 24 — players who fail it 3+ times rarely return the next day.',
      stats: [
        { label: 'At-risk players (7d)', value: '3,820', variant: 'error' },
        { label: 'Predicted churn', value: '18.6%', variant: 'error' },
        { label: 'vs. last week', value: '-1.2pp', variant: 'success' },
        { label: 'Top driver', value: 'Lvl 24 spike' },
      ],
      bullets: [
        'Target the at-risk cohort with a reward-based win-back push within 24h — that window recovers ~22% historically.',
        'Soften the level 24 difficulty curve; it accounts for 41% of this week’s predicted churn.',
        'Players who hit the daily-streak break are 2.3× more likely to leave — a streak-saver offer is the highest-leverage fix.',
      ],
    },
  },
  {
    id: 'ab-test',
    name: 'A/B Test Agent',
    tag: 'Experimentation',
    description:
      'Design, launch, and read experiments — from hypothesis to a confident ship decision.',
    intro:
      'I help you run and interpret experiments. Describe a test you want to design, or ask me to read the results of one that’s already live.',
    icon: <ABTestIcon size={40} />,
    iconGradient: 'linear-gradient(135deg, #4F46E5 0%, #7B4CFF 100%)',
    // A/B testing requires instrumented events — only the SDK can be a source.
    // SDK - Mobile is listed first so it is the default selection.
    sources: [
      { value: 'sdk-mobile', label: 'SDK - Mobile', icon: <SdkMobileIcon size={20} /> },
      { value: 'sdk-pc', label: 'SDK - PC', icon: <SdkPcIcon size={20} /> },
    ],
    requirement: 'Requires SDK integration',
    placeholder: 'Describe the experiment to analyze…',
    suggestions: [
      'Is my new onboarding flow beating the control?',
      'How long until this test reaches significance?',
      'Which variant should I ship?',
      'Did the paywall test move D1 retention?',
    ],
    pipeline: [
      { title: 'Loading experiment data', activeSub: 'Pulling assignment and exposure logs…', doneSub: 'Experiment data loaded.' },
      { title: 'Computing variant metrics', activeSub: 'Aggregating conversion by variant…', doneSub: 'Per-variant metrics computed.' },
      { title: 'Running significance test', activeSub: 'Estimating lift and confidence intervals…', doneSub: 'Significance confirmed.' },
      { title: 'Forming recommendation', activeSub: 'Weighing risk and segment effects…', doneSub: 'Recommendation ready.' },
    ],
    reply: {
      summary:
        'Variant B (the streamlined onboarding) is outperforming the control. The lift is statistically significant and stable across the last 5 days, so this is a confident ship decision.',
      stats: [
        { label: 'Variant B conversion', value: '12.4%', variant: 'success' },
        { label: 'Lift vs. control', value: '+2.1pp', variant: 'success' },
        { label: 'Confidence', value: '97%' },
        { label: 'Sample', value: '48,210' },
      ],
      bullets: [
        'Ship Variant B — the 97% confidence clears your 95% bar with a healthy sample.',
        'Lift is strongest on new users (+3.4pp); returning users are flat — expected for an onboarding change.',
        'Watch for a novelty effect: re-check D7 retention one week post-rollout before calling it permanent.',
      ],
    },
  },
]

export function getSpecializedAgent(id: string | null): SpecializedAgent | undefined {
  if (!id) return undefined
  return SPECIALIZED_AGENTS.find((a) => a.id === id)
}
