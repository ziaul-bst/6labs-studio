import type { Meta, StoryObj } from '@storybook/react-vite'
import { RunHistoryList } from './RunHistoryList'
import { AI_BEHAVIOURAL_HISTORY, AI_FUNCTIONAL_HISTORY, FUNCTIONAL_HISTORY, USER_TEST_HISTORY } from '../../lib/mocks/testing'

const meta = {
  title: 'Molecules/Testing/RunHistoryList',
  component: RunHistoryList,
  tags: ['autodocs'],
} satisfies Meta<typeof RunHistoryList>

export default meta
type Story = StoryObj<typeof meta>

/** User Test: reports and a question mixed, so the kind filter appears and the
 *  name header follows it. Footage is grouped by library tag. */
export const IssueCounts: Story = {
  args: { runs: USER_TEST_HISTORY, metaLabel: 'Tag' },
}

/** Passed / failed / needs-review counts — functional runs. */
export const OutcomeCounts: Story = {
  args: { runs: FUNCTIONAL_HISTORY, metaLabel: 'Tag' },
}

/** AI behavioural: the grouping column is the personas that played. */
export const Personas: Story = {
  args: { runs: AI_BEHAVIOURAL_HISTORY, metaLabel: 'Personas' },
}

/** Nothing has run: the illustrated empty state with its way out. */
export const Empty: Story = {
  args: {
    runs: [],
    metaLabel: 'Tag',
    emptyTitle: 'Nothing has run yet',
    emptyLabel: 'Run a report on your footage or ask it a question — both land here.',
    emptyAction: { label: 'New run', onClick: () => {} },
  },
}

/** One run in progress, one never executed, one with a clean result. */
export const MixedStates: Story = {
  args: {
    runs: [
      { id: 'p', name: 'Season 10 — store', detail: '1 file · regression-suite.xlsx · started just now', meta: 'v2.3.1', state: 'progress', when: 'now' },
      { id: 'clean', name: 'Daily smoke', detail: '4 sessions · 10 min', meta: 'v2.3.1', state: 'done', result: { kind: 'issues', count: 0 }, when: 'Sep 1' },
      ...AI_FUNCTIONAL_HISTORY,
    ],
    highlightId: 'p',
    metaLabel: 'Build',
  },
}
