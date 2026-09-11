import { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SidebarProfileMenu } from './SidebarProfileMenu'
import { SidebarProfile } from './SidebarProfile'

const GAMES = [
  { name: 'MCOC', genre: 'Action' },
  { name: 'Maple Story', genre: 'Action' },
  { name: 'Superhotter', genre: 'Shooter' },
  { name: 'Pirates of the Sea', genre: 'RPG' },
]

/**
 * The menu portals itself above its anchor, so every story renders a real
 * sidebar footer to anchor to.
 */
function FooterHarness({ games, activeGame }: { games: typeof GAMES; activeGame: (typeof GAMES)[number] }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div style={{ height: 420, display: 'flex', alignItems: 'flex-end' }}>
      <div
        style={{
          width: 280,
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--bg-elements)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <div
          ref={ref}
          style={{ padding: 12, borderTop: '1px solid var(--border-subtle)' }}
        >
          <SidebarProfile name="Jonh Wick" initials="JW" gameName={activeGame.name} />
        </div>
      </div>
      <SidebarProfileMenu
        anchorRef={ref}
        games={games}
        activeGame={activeGame}
        language="EN"
        onClose={() => {}}
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/SidebarProfileMenu',
  component: SidebarProfileMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof SidebarProfileMenu>

export default meta
type Story = StoryObj<typeof meta>

/**
 * `args` are declared to satisfy the story type only — the menu anchors to a
 * live ref, so each story renders it through FooterHarness instead.
 */
const HARNESS_ARGS = {
  anchorRef: { current: null },
  games: GAMES,
  activeGame: GAMES[0],
  language: 'EN',
  onClose: () => {},
}

/** Multi-game account — click the game row to pop the list out to the right. */
export const MultipleGames: Story = {
  args: HARNESS_ARGS,
  render: () => <FooterHarness games={GAMES} activeGame={GAMES[0]} />,
}

/** Single-game account — nothing to switch between, so no chevron and no submenu. */
export const SingleGame: Story = {
  args: HARNESS_ARGS,
  render: () => <FooterHarness games={[GAMES[0]]} activeGame={GAMES[0]} />,
}
