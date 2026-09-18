import type { Meta, StoryObj } from '@storybook/react-vite'
import { PitchArt, type PitchArtKey } from './PitchArt'

const ALL: PitchArtKey[] = [
  'upload',
  'aiplayer',
  'analysis',
  'report',
  'document',
  'verdicts',
  'findings',
  'clips',
  'compare',
  'ask',
  'search',
  'personas',
  'clock',
  'rerun',
]

const meta = {
  title: 'Molecules/PitchArt',
  component: PitchArt,
  tags: ['autodocs'],
  args: { art: 'report', accent: 'teal' },
  argTypes: {
    art: { control: 'select', options: ALL },
    accent: { control: 'select', options: ['brand', 'teal', 'purple', 'success', 'emerald'] },
  },
  decorators: [
    (Story) => (
      <div
        className="flex items-center justify-center rounded-2xl px-l py-m"
        style={{ width: 260, backgroundColor: 'var(--bg-page-pale)' }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PitchArt>

export default meta
type Story = StoryObj<typeof PitchArt>

export const Report: Story = { args: { art: 'report' } }
export const Upload: Story = { args: { art: 'upload' } }
export const AIPlayer: Story = { args: { art: 'aiplayer' } }

/** The whole set, in the accent of one test — every drawing carries exactly one accent element. */
export const All: Story = {
  decorators: [(Story) => <Story />],
  render: (args) => (
    <div className="grid gap-m" style={{ gridTemplateColumns: 'repeat(4, 200px)' }}>
      {ALL.map((art) => (
        <div key={art} className="flex flex-col gap-xs">
          <span
            className="flex items-center justify-center rounded-2xl px-l py-m"
            style={{ backgroundColor: 'var(--bg-page-pale)' }}
          >
            <PitchArt art={art} accent={args.accent} />
          </span>
          <span className="font-body text-xs text-text-tertiary text-center">{art}</span>
        </div>
      ))}
    </div>
  ),
}

/** The first stage of "How it works" is the only one that differs between a human test and its AI twin. */
export const SourceComparison: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div className="flex gap-l">
      {(
        [
          { art: 'upload' as const, accent: 'brand' as const, label: 'Human · you add the recordings' },
          { art: 'aiplayer' as const, accent: 'success' as const, label: 'AI · players produce them' },
        ]
      ).map((s) => (
        <div key={s.art} className="flex flex-col gap-xs" style={{ width: 240 }}>
          <span
            className="flex items-center justify-center rounded-2xl px-l py-m"
            style={{ backgroundColor: 'var(--bg-page-pale)' }}
          >
            <PitchArt art={s.art} accent={s.accent} />
          </span>
          <span className="font-body text-xs text-text-secondary text-center">{s.label}</span>
        </div>
      ))}
    </div>
  ),
}
