import type { Meta, StoryObj } from '@storybook/react-vite'
import { SessionDetailsPage } from './SessionDetailsPage'
import { MOCK_SESSIONS } from '../../lib/mocks/radiologist-sessions'

const SESSION = MOCK_SESSIONS[0]

const meta = {
  title: 'Organisms/SessionDetailsPage',
  component: SessionDetailsPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: 900, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionDetailsPage>

export default meta
type Story = StoryObj<typeof meta>

/** Browsed to directly — no query, so no excerpt anywhere on the page. */
export const WithoutOracle: Story = {
  args: {
    session: SESSION,
    onBack: () => {},
    fromOracle: false,
  },
}

/** Placement B — banner between the video and the events list. The recommendation. */
export const PlacementBanner: Story = {
  args: {
    session: SESSION,
    onBack: () => {},
    backLabel: 'Back to response',
    defaultPlacement: 'banner',
    hideSwitcher: true,
  },
}

/** Placement C — card in the right rail, the concept's V3.1/V3.2 position. */
export const PlacementRail: Story = {
  args: {
    session: SESSION,
    onBack: () => {},
    backLabel: 'Back to response',
    defaultPlacement: 'rail',
    hideSwitcher: true,
  },
}

/** The review build PMs get — switcher visible, all placements and shapes reachable. */
export const ReviewPrototype: Story = {
  args: {
    session: SESSION,
    onBack: () => {},
    backLabel: 'Back to response',
    defaultPlacement: 'banner',
  },
}

/** Events-only excerpt in the banner — no attributes, no prose. */
export const ShapeEvents: Story = {
  args: {
    session: SESSION,
    onBack: () => {},
    defaultPlacement: 'banner',
    defaultShape: 'events',
    hideSwitcher: true,
  },
}

/** Attributes-only excerpt — answers the query with no moment in the video. */
export const ShapeAttributes: Story = {
  args: {
    session: SESSION,
    onBack: () => {},
    defaultPlacement: 'banner',
    defaultShape: 'attributes',
    hideSwitcher: true,
  },
}
