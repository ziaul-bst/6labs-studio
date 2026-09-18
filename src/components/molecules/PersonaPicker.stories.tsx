import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PersonaPicker } from './PersonaPicker'
import { PERSONAS } from '../../lib/mocks/testing'

const meta = {
  title: 'Molecules/PersonaPicker',
  component: PersonaPicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Who plays a run. Names are the scan target — one line each, the whole set comparable at a glance. The player model’s sentence about a persona is read one at a time, in a strip at the foot of the menu, so its length never costs the list a pixel.',
      },
    },
  },
} satisfies Meta<typeof PersonaPicker>

export default meta
type Story = StoryObj<typeof meta>

function Demo({ initial, personas }: { initial: string[]; personas: typeof PERSONAS }) {
  const [value, setValue] = useState(initial)
  return (
    <div style={{ width: 620, paddingBottom: 520 }}>
      <PersonaPicker personas={personas} value={value} onChange={setValue} />
    </div>
  )
}

/** The full set. Open it: fourteen names fit the eye, and the strip explains
 *  whichever one the cursor is on. */
export const Default: Story = {
  args: { personas: PERSONAS, value: [], onChange: () => {} },
  render: () => <Demo initial={['generic']} personas={PERSONAS} />,
}

/** Past two, the field counts instead of listing. Six persona names in a 40px
 *  field is a string nobody reads to the end — and the Agents row under it
 *  already names every one with its own count. */
export const SeveralSelected: Story = {
  args: { personas: PERSONAS, value: [], onChange: () => {} },
  render: () => (
    <Demo initial={['generic', 'new-player', 'whale', 'competitive', 'collector']} personas={PERSONAS} />
  ),
}

/** A short list gets no search field: a filter over six visible rows is a
 *  control that makes the list look longer than it is. */
export const ShortList: Story = {
  args: { personas: PERSONAS, value: [], onChange: () => {} },
  render: () => <Demo initial={[]} personas={PERSONAS.slice(0, 6)} />,
}

/** Nothing chosen yet — the field says so, and the strip still explains the
 *  first row rather than sitting empty until the cursor arrives. */
export const Empty: Story = {
  args: { personas: PERSONAS, value: [], onChange: () => {} },
  render: () => <Demo initial={[]} personas={PERSONAS} />,
}
