import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserTestAskDock } from './UserTestAskDock'
import { USER_TEST_ASK_ANSWERS } from '../../lib/mocks/user-test'
import type { UserTestAskTurn } from '../../lib/types/userTest'

const meta = {
  title: 'Organisms/UserTestAskDock',
  component: UserTestAskDock,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof UserTestAskDock>

export default meta
type Story = StoryObj<typeof meta>

function Harness({ initial, startOpen }: { initial: UserTestAskTurn[]; startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen)
  const [turns, setTurns] = useState(initial)
  return (
    <div style={{ minHeight: 520 }}>
      <UserTestAskDock
        open={open}
        onOpenChange={setOpen}
        turns={turns}
        onTurnsChange={setTurns}
        runName="Build V2.1 — onboarding (Aug 26)"
      />
    </div>
  )
}

/** Minimised — the launcher is what makes the Q&A findable without scrolling. */
export const Launcher: Story = {
  args: { open: false, onOpenChange: () => {}, turns: [], onTurnsChange: () => {} },
  render: () => <Harness initial={[]} startOpen={false} />,
}

/** Minimised with answers behind it — the count is a reason to come back. */
export const LauncherWithAnswers: Story = {
  args: { open: false, onOpenChange: () => {}, turns: [], onTurnsChange: () => {} },
  render: () => (
    <Harness
      startOpen={false}
      initial={[
        {
          id: '1',
          question: 'Which device saw the most bugs?',
          answer: USER_TEST_ASK_ANSWERS['Which device saw the most bugs?'],
        },
      ]}
    />
  ),
}

/** Open and empty — suggestions carry the first question. */
export const OpenEmpty: Story = {
  args: { open: true, onOpenChange: () => {}, turns: [], onTurnsChange: () => {} },
  render: () => <Harness initial={[]} startOpen />,
}

/** Open with an answer, including the table an in-corpus question can produce. */
export const OpenWithAnswer: Story = {
  args: { open: true, onOpenChange: () => {}, turns: [], onTurnsChange: () => {} },
  render: () => (
    <Harness
      startOpen
      initial={[
        {
          id: '1',
          question: 'Which device saw the most bugs?',
          answer: USER_TEST_ASK_ANSWERS['Which device saw the most bugs?'],
        },
      ]}
    />
  ),
}

/** The boundary case, in the narrower dock column. */
export const OpenWithHandoff: Story = {
  args: { open: true, onOpenChange: () => {}, turns: [], onTurnsChange: () => {} },
  render: () => (
    <Harness
      startOpen
      initial={[
        {
          id: '1',
          question: 'Is the Furnace tap issue visible in live player data?',
          answer: USER_TEST_ASK_ANSWERS['Is the Furnace tap issue visible in live player data?'],
        },
      ]}
    />
  ),
}
