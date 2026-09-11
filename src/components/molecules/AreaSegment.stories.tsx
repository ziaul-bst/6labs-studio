import type { Meta, StoryObj } from '@storybook/react-vite'
import { AreaSegment } from './AreaSegment'
import { ENTITLEMENT_PRESETS } from '../../lib/studioAreas'

const meta = {
  title: 'Molecules/AreaSegment',
  component: AreaSegment,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 280, padding: '16px 0', background: 'var(--bg-elements)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AreaSegment>

export default meta
type Story = StoryObj<typeof meta>

/** Both areas entitled — the only case that renders a two-tab segment. */
export const BothEntitled: Story = {
  args: {
    areas: ENTITLEMENT_PRESETS.both,
    active: 'intelligence',
  },
}

/** Testing active. */
export const TestingActive: Story = {
  args: {
    areas: ENTITLEMENT_PRESETS.both,
    active: 'testing',
  },
}

/**
 * A purchasable area is marked, not locked out — dashed border plus ↗, and the
 * tab resolves to a pitch screen rather than an empty product.
 */
export const OnePurchasable: Story = {
  args: {
    areas: ENTITLEMENT_PRESETS['testing-locked'],
    active: 'intelligence',
  },
}

/** The purchasable tab selected. */
export const PurchasableSelected: Story = {
  args: {
    areas: ENTITLEMENT_PRESETS['testing-locked'],
    active: 'testing',
  },
}

/**
 * One entitled area renders **nothing** — the component is deliberately empty
 * here. A one-item segment is not a switch.
 */
export const SingleAreaRendersNothing: Story = {
  args: {
    areas: ENTITLEMENT_PRESETS['intelligence-only'],
    active: 'intelligence',
  },
}

/** Collapsed (60px) — no room for a segmented control, so stacked icon buttons. */
export const CollapsedIcons: Story = {
  args: {
    areas: ENTITLEMENT_PRESETS.both,
    active: 'testing',
    collapsed: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 60, padding: '16px 0', background: 'var(--bg-elements)' }}>
        <Story />
      </div>
    ),
  ],
}
