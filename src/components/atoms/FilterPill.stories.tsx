import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterPill } from './FilterPill'
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'

const meta = {
  title: 'Atoms/FilterPill',
  component: FilterPill,
  tags: ['autodocs'],
} satisfies Meta<typeof FilterPill>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Needs attention', count: 5 },
}

export const Selected: Story = {
  args: { label: 'All', count: 24, selected: true },
}

export const NoCount: Story = {
  args: { label: 'Passed' },
}

/** The overflow trigger on a tag rail — a disclosure, not a filter position. */
export const MenuTrigger: Story = {
  args: {
    label: '+7 more',
    menu: true,
    trailing: <DropdownArrowIcon size={16} />,
  },
}

/** Tag rail — multi-select pills with their batch sizes, as in the Gameplay
 *  Library and the session picker. */
function TagRail() {
  const [active, setActive] = useState<Set<string>>(new Set(['Build V2.1', 'Build V2.2']))
  const toggle = (t: string) =>
    setActive((prev) => {
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })
  return (
    <div className="flex flex-wrap items-center gap-xs">
      <span
        className="font-display text-xs font-semibold uppercase tracking-[0.08em]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Select by tag
      </span>
      {TAGS.map((t) => (
        <FilterPill
          key={t.label}
          label={t.label}
          count={t.count}
          selected={active.has(t.label)}
          onClick={() => toggle(t.label)}
          multi
        />
      ))}
      <FilterPill label="+7 more" menu trailing={<DropdownArrowIcon size={16} />} />
    </div>
  )
}

export const TagRailRow: Story = {
  args: { label: 'Build V2.1', count: 3 },
  render: () => <TagRail />,
}

const TAGS = [
  { label: 'Build V2.1', count: 3 },
  { label: 'Build V2.2', count: 3 },
  { label: 'New event', count: 2 },
  { label: 'Tutorial', count: 2 },
  { label: 'Alliance', count: 1 },
]

const OPTIONS = [
  { value: 'all', label: 'All', count: 24 },
  { value: 'attention', label: 'Needs attention', count: 5 },
  { value: 'fail', label: 'Failed', count: 2 },
  { value: 'review', label: 'Needs review', count: 2 },
  { value: 'pass', label: 'Passed', count: 19 },
  { value: 'p0', label: 'P0', count: 3 },
]

function Row() {
  const [value, setValue] = useState('all')
  return (
    <div className="flex flex-wrap gap-xs" role="radiogroup" aria-label="Filter cases">
      {OPTIONS.map((o) => (
        <FilterPill key={o.value} label={o.label} count={o.count} selected={value === o.value} onClick={() => setValue(o.value)} />
      ))}
    </div>
  )
}

/** The filter row as used on the functional report. */
export const FilterRow: Story = {
  args: { label: 'All', count: 24 },
  render: () => <Row />,
}
