import type { Meta, StoryObj } from '@storybook/react-vite'
import { CitationPreview } from './CitationPreview'
import { generateTranscript } from '../../lib/mocks/transcript'
import type { SessionEvent } from '../../lib/types/radiologist'

const EVENTS: SessionEvent[] = [
  { id: 'e1', type: 'kill', timestamp: '0:14', description: 'Squad wipe — 3 eliminations' },
]

const SEGMENTS = generateTranscript('Session #2847', '4:05', EVENTS)

const ANCHOR = { top: 80, left: 40, bottom: 96, right: 60 }

const meta = {
  title: 'Molecules/CitationPreview',
  component: CitationPreview,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: 420, position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CitationPreview>

export default meta
type Story = StoryObj<typeof meta>

/** Video citation — clip cued to the moment plus the narration that makes it evidence. */
export const VideoCitation: Story = {
  args: {
    active: {
      citation: {
        n: 28,
        kind: 'video',
        videoId: 'Session #2847',
        segmentIds: [SEGMENTS[2].id, SEGMENTS[3].id],
        quote: SEGMENTS[2].text.split(' ').slice(0, 4).join(' '),
        label: 'Intense Clash Defeats',
      },
      anchor: ANCHOR,
    },
    resolveSegments: (_videoId, ids) => SEGMENTS.filter((s) => ids.includes(s.id)),
    onOpen: () => {},
    onPointerEnter: () => {},
    onPointerLeave: () => {},
  },
}

/** A citation whose transcript never landed — the excerpt degrades gracefully. */
export const VideoCitationNoTranscript: Story = {
  args: {
    active: {
      citation: {
        n: 7,
        kind: 'video',
        videoId: 'Session #missing',
        segmentIds: ['Session #missing:0'],
        label: 'Training Mode Run',
      },
      anchor: ANCHOR,
    },
    resolveSegments: () => [],
    onOpen: () => {},
    onPointerEnter: () => {},
    onPointerLeave: () => {},
  },
}

/** Table citation — the referenced rows, with the cited cell highlighted. */
export const TableCitation: Story = {
  args: {
    active: {
      citation: {
        n: 1,
        kind: 'table',
        tableFqn: 'PLATSH.PLATSH.TUTORIAL_FUNNEL',
        warehouse: 'Snowflake',
        columns: ['step', 'reached', 'drop_off'],
        rows: [
          { step: 'grenade_throw', reached: '4,182', drop_off: '23.0%' },
          { step: 'inventory', reached: '3,220', drop_off: '9.4%' },
        ],
        highlightCell: { column: 'drop_off', value: '23.0%' },
        totalRows: 12,
      },
      anchor: ANCHOR,
    },
    resolveSegments: () => [],
    onOpen: () => {},
    onPointerEnter: () => {},
    onPointerLeave: () => {},
  },
}
