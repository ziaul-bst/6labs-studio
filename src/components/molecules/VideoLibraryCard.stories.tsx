import type { Meta, StoryObj } from '@storybook/react-vite'
import { VideoLibraryCard } from './VideoLibraryCard'
import { batchTag, stageTag, testTypeTag, userTag } from '../../lib/libraryTags'

const meta = {
  title: 'Molecules/VideoLibraryCard',
  component: VideoLibraryCard,
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'select', options: ['grid', 'list'] },
    status: { control: 'select', options: ['uploading', 'processing', 'ready', 'failed'] },
    source: {
      control: 'select',
      options: ['recorder', 'cli', 'upload', 'ai-player'],
    },
    progress: { control: { type: 'range', min: 0, max: 100 } },
    selected: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VideoLibraryCard>

export default meta
type Story = StoryObj<typeof meta>

const base = {
  title: 'Bermuda BR — onboarding flow walkthrough.mp4',
  dateLabel: 'Jun 10, 2026',
  source: 'recorder' as const,
  progress: 100,
}

export const Ready: Story = {
  args: {
    ...base,
    status: 'ready',
    durationLabel: '4:12',
    tags: [batchTag('Build V2.2'), userTag('tutorial'), userTag('onboarding')],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
}

export const Uploading: Story = {
  args: {
    ...base,
    title: 'Ranked match — squad wipe at zone 4.mp4',
    status: 'uploading',
    progress: 48,
  },
  decorators: Ready.decorators,
}

/** Mid-transfer with tags already applied — tagging happens at upload. */
export const UploadingTagged: Story = {
  name: 'Uploading / tagged',
  args: {
    ...base,
    title: 'Lobby matchmaking repro — long queue.webm',
    source: 'cli',
    status: 'uploading',
    progress: 62,
    tags: [batchTag('New event'), stageTag('cbt'), userTag('matchmaking')],
  },
  decorators: Ready.decorators,
}

export const Failed: Story = {
  args: {
    ...base,
    title: 'Crash repro — checkout screen.mp4',
    status: 'failed',
    tags: [batchTag('Build V2.2'), userTag('crash-repro'), userTag('payments')],
    errorMessage: 'Upload failed — the transfer was interrupted. Retry to upload again.',
  },
  decorators: Ready.decorators,
}

export const Selected: Story = {
  args: {
    ...Ready.args,
    selected: true,
  },
  decorators: Ready.decorators,
}

/** Every ingest path side by side — the badge is the whole point of the row. */
export const SourceBadges: Story = {
  name: 'Source badges',
  args: { ...Ready.args },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
      {(['recorder', 'upload', 'cli', 'ai-player'] as const).map((s) => (
        <VideoLibraryCard key={s} {...args} source={s} title={`${s} — sample clip.mp4`} />
      ))}
    </div>
  ),
}

/** System tags (outlined, facet-prefixed) against user tags (filled, bare). */
export const TagOrigins: Story = {
  name: 'Tag origins',
  args: {
    ...Ready.args,
    source: 'ai-player',
    title: 'aib-frost-02 — whale · agent 1.mp4',
    tags: [
      batchTag('Frost Festival'),
      stageTag('cbt'),
      testTypeTag('ai'),
      userTag('whale'),
      userTag('event-shop'),
      userTag('monetisation'),
    ],
  },
  decorators: Ready.decorators,
}

/** No user tags at all — a clip straight off the CLI, nobody has touched it. */
export const SystemTagsOnly: Story = {
  name: 'Tag origins / system only',
  args: {
    ...Ready.args,
    source: 'cli',
    title: 'clip-0042.mp4',
    tags: [batchTag('Build V2.1'), stageTag('obt')],
  },
  decorators: Ready.decorators,
}

export const ListReady: Story = {
  name: 'List / Ready',
  args: {
    ...Ready.args,
    layout: 'list',
  },
}

export const ListFailed: Story = {
  name: 'List / Failed',
  args: {
    ...Failed.args,
    layout: 'list',
  },
}

export const ListUploading: Story = {
  name: 'List / Uploading',
  args: {
    ...Uploading.args,
    layout: 'list',
  },
}
