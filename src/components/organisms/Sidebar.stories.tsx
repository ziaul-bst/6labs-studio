import type { Meta, StoryObj } from '@storybook/react-vite'
import { Sidebar } from './Sidebar'
import { ENTITLEMENT_PRESETS } from '../../lib/studioAreas'

const meta = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: 700, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

/** Expanded sidebar (300px) with default nav state. */
export const Expanded: Story = {
  args: {
    collapsed: false,
    activeNav: 'home',
  },
}

/** Collapsed sidebar (60px icon-only). */
export const Collapsed: Story = {
  args: {
    collapsed: true,
    activeNav: 'radiologist',
  },
}

// ── Areas ─────────────────────────────────────────────────────────────────────

/** Both areas entitled — the segment renders, Intelligence active. */
export const IntelligenceArea: Story = {
  args: {
    areas: ENTITLEMENT_PRESETS.both,
    area: 'intelligence',
    activeNav: 'oracle',
  },
}

/** Both areas entitled — nav, context and history all follow the active area. */
export const TestingArea: Story = {
  args: {
    areas: ENTITLEMENT_PRESETS.both,
    area: 'testing',
    activeNav: 'user-test',
  },
}

/**
 * The common case: one entitled area. No segment renders at all — there is no
 * mode for this studio, just the product.
 */
export const SingleAreaNoSwitch: Story = {
  args: {
    areas: ENTITLEMENT_PRESETS['intelligence-only'],
    area: 'intelligence',
    activeNav: 'home',
  },
}

/** One entitled area, other side purchasable — muted tab, opens a pitch. */
export const AreaPurchasable: Story = {
  args: {
    areas: ENTITLEMENT_PRESETS['testing-locked'],
    area: 'intelligence',
    activeNav: 'home',
  },
}

/** Collapsed with two areas — the segment degrades to stacked icon buttons. */
export const CollapsedWithAreas: Story = {
  args: {
    collapsed: true,
    areas: ENTITLEMENT_PRESETS.both,
    area: 'testing',
    activeNav: 'user-test',
  },
}

// ── Game placement (under PM review) ─────────────────────────────────────────

/** Game chip above the area switch — scope visible without opening anything. */
export const GameInSidebar: Story = {
  args: {
    gamePlacement: 'sidebar-top',
    areas: ENTITLEMENT_PRESETS.both,
    area: 'intelligence',
    activeNav: 'home',
  },
}

/**
 * Game demoted to the footer but still a real control, beside the avatar. The
 * avatar shrinks to an icon and the account options move behind it.
 */
export const GameBesideProfile: Story = {
  args: {
    gamePlacement: 'footer-inline',
    areas: ENTITLEMENT_PRESETS.both,
    area: 'intelligence',
    activeNav: 'home',
  },
}

/**
 * Game switcher hidden inside the profile menu; the profile row carries the
 * game name as the persistent scope indicator.
 */
export const GameInProfileMenu: Story = {
  args: {
    gamePlacement: 'footer-menu',
    areas: ENTITLEMENT_PRESETS.both,
    area: 'intelligence',
    activeNav: 'home',
  },
}
