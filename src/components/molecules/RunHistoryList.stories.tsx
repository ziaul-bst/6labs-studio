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
  args: { runs: USER_TEST_HISTORY, metaLabel: 'Tags' },
}

/** Passed / failed / needs-review counts — functional runs. */
export const OutcomeCounts: Story = {
  args: { runs: FUNCTIONAL_HISTORY, metaLabel: 'Tags' },
}

/** AI behavioural: the grouping column is the personas that played. */
export const Personas: Story = {
  args: { runs: AI_BEHAVIOURAL_HISTORY, metaLabel: 'Personas' },
}

/** Nothing has run: the illustrated empty state with its way out. */
export const Empty: Story = {
  args: {
    runs: [],
    metaLabel: 'Tags',
    emptyTitle: 'Nothing has run yet',
    emptyLabel: 'Run a report on your footage or ask it a question — both land here.',
    emptyAction: { label: 'New run', onClick: () => {} },
  },
}

/** One run in progress, one never executed, one with a clean result. */
export const MixedStates: Story = {
  args: {
    runs: [
      { id: 'p', name: 'Season 10 — store', detail: '1 file · regression-suite.xlsx', meta: 'v2.3.1', state: 'progress', when: 'Sep 14' },
      { id: 'clean', name: 'Daily smoke', detail: '4 sessions · 10 min', meta: 'v2.3.1', state: 'done', result: { kind: 'issues', count: 0 }, when: 'Sep 1' },
      ...AI_FUNCTIONAL_HISTORY,
    ],
    highlightId: 'p',
    metaLabel: 'Build',
  },
}

/** A batch can be picked from several tags at once, so the Tag column is a rail
 *  rather than a string: whole pills for what fits, a "+N" for the rest, and the
 *  full list on the cell's title. The row stays one line at every count. */
export const MultipleTags: Story = {
  args: {
    metaLabel: 'Tags',
    runs: [
      { id: 'one', name: 'Onboarding flow v3', detail: '10 videos', meta: 'Build V2.2', tags: ['Build V2.2'], state: 'done', result: { kind: 'issues', count: 7 }, when: 'Sep 7' },
      { id: 'two', name: 'Alliance join — pilot', detail: '5 videos', meta: 'Alliance, New event', tags: ['Alliance', 'New event'], state: 'done', result: { kind: 'issues', count: 3 }, when: 'Sep 6' },
      { id: 'three', name: 'Tutorial sweep', detail: '12 videos', meta: 'Build V2.2, Tutorial, Last 24h', tags: ['Build V2.2', 'Tutorial', 'Last 24h'], state: 'done', result: { kind: 'issues', count: 5 }, when: 'Sep 5' },
      { id: 'many', name: 'Everything since the build cut', detail: '31 videos', meta: 'Build V2.2, Build V2.1, Tutorial, Alliance, New event, Last 24h', tags: ['Build V2.2', 'Build V2.1', 'Tutorial', 'Alliance', 'New event', 'Last 24h'], state: 'done', result: { kind: 'issues', count: 12 }, when: 'Sep 2' },
      { id: 'none', name: 'Untagged upload batch', detail: '3 videos', meta: 'untagged', tags: ['untagged'], state: 'done', result: { kind: 'issues', count: 0 }, when: 'Sep 1' },
    ],
  },
}
