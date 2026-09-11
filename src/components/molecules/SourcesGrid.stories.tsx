import type { Meta, StoryObj } from '@storybook/react-vite'
import { SourcesGrid } from './SourcesGrid'

const meta = {
  title: 'Molecules/SourcesGrid',
  component: SourcesGrid,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720, padding: 20, backgroundColor: 'var(--bg-card)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SourcesGrid>

export default meta
type Story = StoryObj<typeof meta>

const mockSources = [
  { id: 's1', duration: '4:05', title: 'Tutorial Session 1' },
  { id: 's2', duration: '3:22', title: 'Tutorial Session 2' },
  { id: 's3', duration: '5:10', title: 'Tutorial Session 3' },
]

const mockDocs = [
  { id: 'd1', label: 'FreeFire_GDD_v3' },
  { id: 'd2', label: 'Monetization_playbook' },
]

const mockConnectors = [
  { id: 'c1', label: 'labs_demo 1', kind: 'snowflake' as const },
  { id: 'c2', label: 'labs_demo 1', kind: 'bigquery' as const },
]

/** Figma "Property 1=Default" — summary row only. */
export const Collapsed: Story = {
  args: {
    sources: mockSources,
    docs: mockDocs,
    connectors: mockConnectors,
    totalVideos: 58,
    onExpandSources: () => console.log('expand sources'),
  },
}

/** Figma "Property 1=Variant2" — docs, connectors and the 3-up video row. */
export const Expanded: Story = {
  args: {
    ...Collapsed.args!,
    defaultExpanded: true,
  },
}

/** Videos only — the docs and connectors rows are omitted entirely. */
export const VideosOnly: Story = {
  args: {
    sources: mockSources,
    defaultExpanded: true,
    onExpandSources: () => {},
  },
}

/** Docs only — no warehouse or video sources cited. */
export const DocsOnly: Story = {
  args: {
    sources: [],
    docs: mockDocs,
    defaultExpanded: true,
    onExpandSources: () => {},
  },
}

/** Singular count labels ("1 doc · 1 connector · 1 video"). */
export const SingleOfEach: Story = {
  args: {
    sources: [mockSources[0]],
    docs: [mockDocs[0]],
    connectors: [mockConnectors[0]],
    defaultExpanded: true,
    onExpandSources: () => {},
  },
}

/** Thumbnail row caps at 3 while the summary reports the real total. */
export const ManySources: Story = {
  args: {
    sources: Array.from({ length: 200 }, (_, i) => ({
      id: `s${i}`,
      duration: '4:05',
      title: `Session ${i + 1}`,
    })),
    defaultExpanded: true,
    onExpandSources: () => {},
  },
}
