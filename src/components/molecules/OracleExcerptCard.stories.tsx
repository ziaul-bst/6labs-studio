import type { Meta, StoryObj } from '@storybook/react-vite'
import { OracleExcerptCard } from './OracleExcerptCard'
import { MOCK_EXCERPTS } from '../../lib/mocks/excerpts'

const meta = {
  title: 'Molecules/OracleExcerptCard',
  component: OracleExcerptCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div
        style={{
          width: 520,
          padding: 20,
          background: 'var(--bg-elements, #fff)',
          borderRadius: 12,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OracleExcerptCard>

export default meta
type Story = StoryObj<typeof meta>

/** Attributes + Text — the shape from the reference screenshot. */
export const AttributesText: Story = {
  args: { excerpt: MOCK_EXCERPTS['attributes-text'], onSeek: () => {} },
}

/** Events — timestamp, category, description; each row seeks the player. */
export const Events: Story = {
  args: { excerpt: MOCK_EXCERPTS.events, onSeek: () => {} },
}

/** Text — prose only, plus the rationale rule. */
export const Text: Story = {
  args: { excerpt: MOCK_EXCERPTS.text, onSeek: () => {} },
}

/** Attributes — no timestamps at all, so the header shows no range. */
export const Attributes: Story = {
  args: { excerpt: MOCK_EXCERPTS.attributes, onSeek: () => {} },
}

/** Transcript points — timestamped narration lines. */
export const TranscriptPoints: Story = {
  args: { excerpt: MOCK_EXCERPTS['transcript-points'], onSeek: () => {} },
}

/** Transcript + Text — lines then the prose that synthesises them. */
export const TranscriptText: Story = {
  args: { excerpt: MOCK_EXCERPTS['transcript-text'], onSeek: () => {} },
}

/** Dense variant at panel width, as the side panel renders it — blocks only. */
export const DenseInPanel: Story = {
  args: {
    excerpt: MOCK_EXCERPTS['attributes-text'],
    onSeek: () => {},
    dense: true,
    headerMode: 'none',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 372, padding: 12, background: 'var(--bg-elements, #fff)' }}>
        <Story />
      </div>
    ),
  ],
}
