import type { Meta, StoryObj } from '@storybook/react-vite'
import { VideoLibraryView, type LibraryVideo } from './VideoLibraryView'
import { batchTag, stageTag, testTypeTag, userTag } from '../../lib/libraryTags'

const meta = {
  title: 'Organisms/VideoLibraryView',
  component: VideoLibraryView,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof VideoLibraryView>

export default meta
type Story = StoryObj<typeof meta>

const NOW = Date.now()

const fixture = (overrides: Partial<LibraryVideo> & { id: string; title: string }): LibraryVideo => ({
  sizeBytes: 120 * 1024 * 1024,
  status: 'ready',
  progress: 100,
  tags: [],
  source: 'upload',
  addedAt: NOW - 1000 * 60 * 60 * 5,
  ...overrides,
})

/** Default demo seed — two Ready, one Analyzing, one Failed */
export const Default: Story = {
  args: {},
}

export const Empty: Story = {
  args: {
    initialVideos: [],
  },
}

/* Only three states left: uploading, ready, failed. */
export const MixedLifecycle: Story = {
  args: {
    initialVideos: [
      fixture({
        id: 'v1',
        title: 'Bermuda BR — onboarding flow walkthrough.mp4',
        durationLabel: '4:12',
        tags: [batchTag('Build V2.2'), userTag('tutorial'), userTag('onboarding')],
        source: 'recorder',
      }),
      fixture({
        id: 'v2',
        title: 'Ranked match — squad wipe at zone 4.mp4',
        status: 'uploading',
        progress: 36,
        tags: [batchTag('Build V2.2')],
      }),
      fixture({
        id: 'v3',
        title: 'Lobby matchmaking repro — long queue.webm',
        status: 'uploading',
        progress: 12,
        tags: [batchTag('New event'), stageTag('cbt'), userTag('matchmaking')],
        source: 'cli',
      }),
      fixture({
        id: 'v4',
        title: 'Crash repro — checkout screen.mp4',
        status: 'failed',
        tags: [batchTag('Build V2.2'), userTag('crash-repro'), userTag('payments')],
        source: 'recorder',
        error: 'Upload failed — the transfer was interrupted. Retry to upload again.',
      }),
    ],
  },
}

export const AllReady: Story = {
  args: {
    initialVideos: [
      fixture({ id: 'r1', title: 'Boss fight — Tier 3 difficulty spike.mov', durationLabel: '12:03', tags: [batchTag('Build V2.2'), userTag('boss-fight'), userTag('balance')] }),
      fixture({ id: 'r2', title: 'Speedrun — chapter 2 skip route.mp4', durationLabel: '7:48', tags: [batchTag('Build V2.2'), userTag('speedrun')], source: 'cli' }),
      fixture({ id: 'r3', title: 'New player FTUE — full session.webm', durationLabel: '18:22', tags: [batchTag('Build V2.1'), userTag('tutorial')], source: 'recorder' }),
    ],
  },
}

/**
 * The grouped rail under load — four batches, two off-default stages and a test
 * type on one side, a sprawling team vocabulary on the other. This is the state
 * that made a single flat rail unreadable, and the one both "+N more" menus
 * have to survive.
 */
export const GroupedTagRail: Story = {
  name: 'Grouped tag rail',
  args: {
    initialVideos: [
      fixture({ id: 'g1', title: 'ut-0912 — first session.mp4', durationLabel: '12:04', source: 'recorder', tags: [batchTag('Build V2.2'), userTag('onboarding'), userTag('tutorial-skip')] }),
      fixture({ id: 'g2', title: 'ut-0911 — first session.mp4', durationLabel: '9:41', source: 'recorder', tags: [batchTag('Build V2.2'), userTag('onboarding')] }),
      fixture({ id: 'g3', title: 'ft-0301 — regression run.mp4', durationLabel: '18:30', source: 'recorder', tags: [batchTag('Build V2.2'), testTypeTag('functional'), userTag('regression')] }),
      fixture({ id: 'g4', title: 'ut-0908 — event shop.mp4', durationLabel: '15:22', source: 'cli', tags: [batchTag('New event'), stageTag('cbt'), userTag('frost-festival'), userTag('monetisation')] }),
      fixture({ id: 'g5', title: 'ut-0895 — event pass.mp4', durationLabel: '6:10', source: 'cli', tags: [batchTag('New event'), stageTag('cbt'), userTag('frost-festival')] }),
      fixture({ id: 'g6', title: 'aib-frost-01 — agent 1.mp4', durationLabel: '30:00', source: 'ai-player', tags: [batchTag('Frost Festival'), testTypeTag('ai'), userTag('whale')] }),
      fixture({ id: 'g7', title: 'aib-frost-02 — agent 2.mp4', durationLabel: '30:00', source: 'ai-player', tags: [batchTag('Frost Festival'), testTypeTag('ai'), userTag('new-player')] }),
      fixture({ id: 'g8', title: 'ut-0870 — day-3 session.mp4', durationLabel: '6:40', source: 'upload', tags: [batchTag('Build V2.1'), stageTag('obt'), userTag('retention'), userTag('day-3')] }),
      fixture({ id: 'g9', title: 'ut-0891 — returning player.mp4', durationLabel: '18:30', source: 'recorder', tags: [batchTag('Build V2.1'), userTag('retention')] }),
      fixture({ id: 'g10', title: 'ut-0887 — first session.mp4', durationLabel: '10:05', source: 'upload', tags: [batchTag('Tutorial'), userTag('onboarding'), userTag('hand-picked')] }),
    ],
  },
}

/**
 * A tagged test batch — the case the bulk-tag and tag-rail work exists for.
 * Select all, then "Add tag" to stamp the whole batch at once.
 */
export const TaggedBatch: Story = {
  args: {
    initialVideos: Array.from({ length: 8 }, (_, i) =>
      fixture({
        id: `t${i + 1}`,
        title: `T0${i + 1} · ${['Pixel 7', 'iPhone 13', 'Galaxy S23'][i % 3]}`,
        durationLabel: ['14:20', '11:40', '16:05', '12:48', '13:31', '3:57', '15:12', '9:20'][i],
        tags:
          i % 3 === 0
            ? [batchTag('ut-batch-3'), userTag('onboarding')]
            : [batchTag('ut-batch-3'), userTag('recorder-app'), userTag('onboarding')],
        source: i % 3 === 0 ? 'cli' : 'recorder',
        addedAt: NOW - 1000 * 60 * 60 * (i + 1),
      })
    ),
  },
}
