import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AIBehaviouralRunView, type AIBehaviouralRunTab } from './AIBehaviouralRunView'
import { AI_BEHAVIOURAL_HISTORY, AI_BEHAVIOURAL_RUN_META, buildAgentIssues, buildAgentSessions } from '../../lib/mocks/testing'

const run = AI_BEHAVIOURAL_HISTORY[0]
const meta = AI_BEHAVIOURAL_RUN_META[run.id]
const sessions = buildAgentSessions(run.id, meta)
const issues = buildAgentIssues(sessions, run.result?.kind === 'issues' ? run.result.count : 7)

const liveMeta = { ...meta, finished: 12, startedLabel: 'Sep 14' }
const liveSessions = buildAgentSessions('demo-running', liveMeta, 6)

function Host({ initialTab, live }: { initialTab: AIBehaviouralRunTab; live?: boolean }) {
  const [tab, setTab] = useState<AIBehaviouralRunTab>(initialTab)
  return (
    <AIBehaviouralRunView
      run={live ? { ...run, id: 'demo-running', state: 'progress', result: undefined, when: 'Sep 14' } : run}
      meta={live ? liveMeta : meta}
      sessions={live ? liveSessions : sessions}
      issues={live ? [] : issues}
      tab={tab}
      onTabChange={setTab}
      onBack={() => {}}
      onOpenSession={() => {}}
    />
  )
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
export const PlayingVideos: Story = { render: () => <Host initialTab="videos" live /> }

/** Run still playing, Report tab — progress and a way to the live sessions. */
export const PlayingReportPending: Story = { render: () => <Host initialTab="report" live /> }
