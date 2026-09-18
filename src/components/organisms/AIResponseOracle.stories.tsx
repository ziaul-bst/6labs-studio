import type { Meta, StoryObj } from '@storybook/react-vite'
import { AIResponseOracle } from './AIResponseOracle'

const meta = {
  title: 'Organisms/AIResponseOracle',
  component: AIResponseOracle,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 760, padding: 20 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AIResponseOracle>

export default meta
type Story = StoryObj<typeof meta>

const mockResponse = {
  id: 'resp-1',
  sources: [
    { id: 's1', duration: '4:05', title: 'Tutorial Session 1' },
    { id: 's2', duration: '3:22', title: 'Tutorial Session 2' },
    { id: 's3', duration: '5:10', title: 'Tutorial Session 3' },
  ],
  contentHtml: `
    <p>5 Major Friction Points Identified (Tutorial completion rate: 67%)</p>
    <p><strong>Biggest Problem: Grenade Throwing</strong></p>
    <ul>
      <li>73% fail on first attempt, average 3.2 tries to complete</li>
      <li>23% abandon tutorial here (largest drop-off point)</li>
      <li>Issue: Trajectory line barely visible, unclear success zone</li>
    </ul>
    <p><strong>Inventory Management</strong></p>
    <ul>
      <li>51% take 40+ seconds to equip weapon (should be ~10 sec)</li>
      <li>Issue: Players don't understand tap vs drag, weapon slots unclear</li>
    </ul>
    <p><strong>Bottom Line:</strong> Grenade section causes 23% abandonment. Fix this first.</p>
  `,
  creditsUsed: 20,
  relatedPrompts: [
    'How many players who completed tutorials still struggle with these mechanics?',
    'Show me players who abandoned tutorials but succeeded in real matches.',
    'Find me top 3 videos where users failed to complete tutorials.',
  ],
}

export const Default: Story = {
  args: {
    response: mockResponse,
    onExpandSources: () => console.log('expand sources'),
    onSuggestionClick: (t) => console.log('suggestion', t),
    onDislike: () => console.log('dislike'),
  },
}

export const Loading: Story = {
  args: {
    response: { ...mockResponse, contentHtml: '' },
    isLoading: true,
    onExpandSources: () => {},
    onSuggestionClick: () => {},
    onDislike: () => {},
  },
}

/** A follow-up in an open thread — the short, thread-aware pipeline. */
export const FollowUpLoading: Story = {
  args: {
    response: { ...mockResponse, contentHtml: '' },
    isLoading: true,
    followUp: true,
    onExpandSources: () => {},
    onSuggestionClick: () => {},
    onDislike: () => {},
  },
}

export const NoSources: Story = {
  args: {
    response: { ...mockResponse, sources: [] },
    onExpandSources: () => {},
    onSuggestionClick: () => {},
    onDislike: () => {},
  },
}

export const NoRelated: Story = {
  args: {
    response: { ...mockResponse, relatedPrompts: [] },
    onExpandSources: () => {},
    onSuggestionClick: () => {},
    onDislike: () => {},
  },
}
