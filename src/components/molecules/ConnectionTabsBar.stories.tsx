import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ConnectionTabsBar, type ConnectionTab } from './ConnectionTabsBar'

function Avatar({ letter, color }: { letter: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center font-display font-semibold shrink-0"
      style={{ width: 18, height: 18, borderRadius: 999, background: color, color: '#fff', fontSize: 8, border: '2px solid var(--bg-card)' }}
    >
      {letter}
    </span>
  )
}

const OWNER_COLORS: Record<string, string> = {
  alex: 'linear-gradient(135deg,#7B4CFF,#1770EF)',
  you: 'linear-gradient(135deg,#F0653F,#F2A03F)',
}
const renderAvatar = (ownerId: string) => (
  <Avatar letter={ownerId === 'alex' ? 'A' : ownerId === 'you' ? 'Y' : ownerId[0].toUpperCase()} color={OWNER_COLORS[ownerId] ?? 'linear-gradient(135deg,#68CA0C,#0F8A55)'} />
)

// Today's real production ceiling: shared (pinned) + your own (pinned) — never overflows.
const TWO_CONNECTIONS: ConnectionTab[] = [
  { id: 'shared', ownerId: 'alex', label: 'bq-oracle-limited-access', pinned: true },
  { id: 'own', ownerId: 'you', label: 'my-own-project', pinned: true },
]

// Forward-looking: many distinct teammates each with their own connection —
// unreachable in the real app today, but the overflow behavior it drives is
// what this bar exists for.
const MANY_CONNECTIONS: ConnectionTab[] = [
  { id: 'shared', ownerId: 'alex', label: 'bq-oracle-limited-access', pinned: true },
  { id: 'own', ownerId: 'you', label: 'my-own-project', pinned: true },
  { id: 'c3', ownerId: 'priya', label: 'priya-sandbox' },
  { id: 'c4', ownerId: 'sam', label: 'sam-analytics-ro' },
  { id: 'c5', ownerId: 'jo', label: 'jo-dev-project' },
  { id: 'c6', ownerId: 'lee', label: 'lee-staging-ro' },
  { id: 'c7', ownerId: 'kim', label: 'kim-qa-svc' },
  { id: 'c8', ownerId: 'ravi', label: 'ravi-growth-ro' },
  { id: 'c9', ownerId: 'noor', label: 'noor-finance-svc' },
  { id: 'c10', ownerId: 'wei', label: 'wei-experiments' },
  { id: 'c11', ownerId: 'dee', label: 'dee-legacy-ro' },
]

const meta = {
  title: 'Molecules/ConnectionTabsBar',
  component: ConnectionTabsBar,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConnectionTabsBar>

export default meta
type Story = StoryObj<typeof meta>

/** Today's real ceiling — 2 pinned tabs, no overflow, "Add connection" trailing. */
export const ProductionToday: Story = {
  args: { connections: TWO_CONNECTIONS, selectedId: 'shared', onSelect: () => {}, renderAvatar },
}

/** 11 connections: 2 pinned + 3 shown inline + "＋6 more" dropdown. */
export const ManyConnectionsOverflow: Story = {
  args: { connections: MANY_CONNECTIONS, selectedId: 'shared', onSelect: () => {}, renderAvatar },
}

/** Selecting an overflowed connection promotes it into the visible row —
 *  no need to reopen the menu to see which one is active. */
export const Interactive: Story = {
  args: { connections: MANY_CONNECTIONS, selectedId: 'shared', onSelect: () => {}, renderAvatar },
  render: function InteractiveStory() {
    const [selected, setSelected] = useState('shared')
    return (
      <ConnectionTabsBar
        connections={MANY_CONNECTIONS}
        selectedId={selected}
        onSelect={setSelected}
        renderAvatar={renderAvatar}
        onAddConnection={() => {}}
      />
    )
  },
}

/** A teammate deep in the overflow list is already selected on mount — still
 *  renders as a real tab, not buried in the dropdown. */
export const ActiveTabFromOverflow: Story = {
  args: { connections: MANY_CONNECTIONS, selectedId: 'c11', onSelect: () => {}, renderAvatar },
}
