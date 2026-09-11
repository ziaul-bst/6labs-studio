import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SegmentedControl } from './SegmentedControl'

const meta = {
  title: 'Atoms/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

/** A binary run option — a state, so it never takes the primary fill. */
export const YesNo: Story = {
  args: { ariaLabel: 'Compare with a previous run', value: 'no', options: [], onChange: () => {} },
  render: function Render() {
    const [value, setValue] = useState<'no' | 'yes'>('no')
    return (
      <SegmentedControl<'no' | 'yes'>
        ariaLabel="Compare with a previous run"
        value={value}
        onChange={setValue}
        options={[
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
        ]}
      />
    )
  },
}

/** A filter with counts, so the size of each slice is visible before clicking. */
export const FilterWithCounts: Story = {
  args: { ariaLabel: 'Filter findings', value: 'all', options: [], onChange: () => {} },
  render: function Render() {
    const [value, setValue] = useState('all')
    return (
      <SegmentedControl
        ariaLabel="Filter findings"
        size="sm"
        value={value}
        onChange={setValue}
        options={[
          { value: 'all', label: 'All', count: 7 },
          { value: 'bug', label: 'Bugs', count: 3 },
          { value: 'friction', label: 'Friction', count: 4 },
          { value: 'new', label: 'New', count: 2 },
        ]}
      />
    )
  },
}

/** Disabled — the choice depends on something not yet made upstream. */
export const Disabled: Story = {
  args: {
    ariaLabel: 'Compare with a previous run',
    value: 'no',
    disabled: true,
    onChange: () => {},
    options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes' },
    ],
  },
}

/** `contrast` — on a pale filter bar the page-grey track disappears, so the
 *  track steps one shade darker and takes a rule. Shown on the bar it is for. */
export const OnPaleFilterBar: Story = {
  args: { ariaLabel: 'Filter by capture source', value: 'all', options: [], onChange: () => {} },
  render: function Render() {
    const [value, setValue] = useState('all')
    return (
      <div className="flex flex-col gap-l w-[560px]">
        {(['default', 'contrast'] as const).map((tone) => (
          <div
            key={tone}
            className="flex items-center gap-s px-m py-s"
            style={{
              backgroundColor: 'var(--bg-page-pale)',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <span className="font-body text-s shrink-0" style={{ color: 'var(--text-tertiary)' }}>
              {tone}
            </span>
            <SegmentedControl
              ariaLabel={`Filter by capture source (${tone})`}
              size="sm"
              tone={tone}
              value={value}
              onChange={setValue}
              options={[
                { value: 'all', label: 'All' },
                { value: 'recorder', label: 'Recorder app' },
                { value: 'direct', label: 'Direct upload' },
                { value: 'cli', label: 'CLI' },
              ]}
            />
          </div>
        ))}
      </div>
    )
  },
}
