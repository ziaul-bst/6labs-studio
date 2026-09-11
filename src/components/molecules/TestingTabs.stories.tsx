import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestingTabs } from './TestingTabs'

const meta = {
  title: 'Molecules/Testing/TestingTabs',
  component: TestingTabs,
  tags: ['autodocs'],
} satisfies Meta<typeof TestingTabs>

export default meta
type Story = StoryObj<typeof meta>

function Demo() {
  const [value, setValue] = useState<'new' | 'history'>('new')
  return (
    <TestingTabs
      ariaLabel="Sections"
      value={value}
      onChange={setValue}
      options={[
        { value: 'new', label: 'New run' },
        { value: 'history', label: 'Run history', count: 2 },
      ]}
    />
  )
}

export const Default: Story = {
  args: { ariaLabel: 'Sections', value: 'new', onChange: () => {}, options: [] },
  render: () => <Demo />,
}
