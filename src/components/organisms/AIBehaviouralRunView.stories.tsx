import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AIBehaviouralRunView, type AIBehaviouralRunTab } from './AIBehaviouralRunView'
import { AI_BEHAVIOURAL_HISTORY, AI_BEHAVIOURAL_RUN_META, AI_BEHAVIOURAL_STEPS, buildAgentIssues, buildAgentSessions } from '../../lib/mocks/testing'

const run = AI_BEHAVIOURAL_HISTORY[0]
const meta = AI_BEHAVIOURAL_RUN_META[run.id]
const sessions = buildAgentSessions(run.id, meta)
const issues = buildAgentIssues(sessions, run.result?.kind === 'issues' ? run.result.count : 7)

const liveMeta = { ...meta, finished: 12, startedLabel: 'Sep 14' }
const liveSessions = buildAgentSessions('demo-running', liveMeta, 6)
const playedMeta = { ...meta, finished: meta.agents, startedLabel: 'Sep 14' }
const playedSessions = buildAgentSessions('demo-analysing', playedMeta, AI_BEHAVIOURAL_STEPS.length)

type Mode = 'done' | 'live' | 'analysing' | 'none'

function Host({ initialTab, mode = 'done' }: { initialTab: AIBehaviouralRunTab; mode?: Mode }) {
  const [tab, setTab] = useState<AIBehaviouralRunTab>(initialTab)
  const props =
    mode === 'live'
      ? { run: { ...run, id: 'demo-running', state: 'progress' as const, result: undefined, when: 'Sep 14' }, meta: liveMeta, sessions: liveSessions, issues: [] }
      : mode === 'analysing'
        ? { run: { ...run, id: 'demo-analysing', state: 'analysing' as const, result: undefined, when: 'Sep 14' }, meta: playedMeta, sessions: playedSessions, issues: [] }
        : mode === 'none'
          ? { run: { ...run, id: 'demo-empty', state: 'progress' as const, result: undefined, when: 'Sep 14' }, meta: liveMeta, sessions: [], issues: [] }
          : { run, meta, sessions, issues }
  return <AIBehaviouralRunView {...props} tab={tab} onTabChange={setTab} onBack={() => {}} onOpenSession={() => {}} />
}

const storyMeta = {
  title: 'Organisms/Testing/AIBehaviouralRunView',
  component: AIBehaviouralRunView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { run, meta, sessions, issues, tab: 'report', onTabChange: () => {}, onBack: () => {}, onOpenSession: () => {} },
} satisfies Meta<typeof AIBehaviouralRunView>

export default storyMeta
type Story = StoryObj<typeof storyMeta>

/** Finished run, Report tab — what it was built from, what happened, the ranked findings. */
export const Report: Story = { render: () => <Host initialTab="report" /> }

/** Finished run, Videos tab — every session as a card, filtered by persona. */
export const Videos: Story = { render: () => <Host initialTab="videos" /> }

/** Run still playing — the report is not pretended; the sessions are live. */
export const PlayingVideos: Story = { render: () => <Host initialTab="videos" mode="live" /> }

/** Run still playing, Report tab — the report sheet arriving: real masthead facts, a counted bar, skeleton tiles and findings. */
export const PlayingReportPending: Story = { render: () => <Host initialTab="report" mode="live" /> }

/** Every agent has stopped, report being written — indeterminate bar and the three analysis beats. */
export const AnalysingReportPending: Story = { render: () => <Host initialTab="report" mode="analysing" /> }

/** Nothing recorded yet — the same sheet, dormant: no spinner, no bar, shine frozen. */
export const NoSessionsReport: Story = { render: () => <Host initialTab="report" mode="none" /> }
