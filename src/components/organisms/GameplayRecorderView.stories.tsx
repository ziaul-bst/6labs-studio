import type { Meta, StoryObj } from '@storybook/react-vite'
import { GameplayRecorderView } from './GameplayRecorderView'

const meta = {
  title: 'Organisms/Testing/GameplayRecorderView',
  component: GameplayRecorderView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    onBack: () => {},
    onOpenLibrary: () => {},
    onOpenTesting: () => {},
  },
} satisfies Meta<typeof GameplayRecorderView>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The page as the app shows it: the workspace's own App ID (Free Fire,
 * 48217306 — the same pair the Upload modal's CLI command prints), the example
 * window playing, and the Windows download in the platform list.
 */
export const Default: Story = {}

/** Another workspace — the connect card follows the game, the rest of the page does not change. */
export const OtherGame: Story = {
  args: { game: { name: 'Whiteout Survival', genre: 'Strategy', appId: '11001' } },
}
