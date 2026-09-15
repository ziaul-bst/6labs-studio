import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestCaseDetailModal } from './TestCaseDetailModal'
import { VERIFIED_CASES } from '../../lib/mocks/verified-cases'

const meta = {
  title: 'Organisms/TestCaseDetailModal',
  component: TestCaseDetailModal,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    cases: VERIFIED_CASES,
    testCase: VERIFIED_CASES[0],
    onSelect: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof TestCaseDetailModal>

export default meta
type Story = StoryObj<typeof meta>

/** A failure, with the list rail — the shape a QA lead works a queue in. */
export const Default: Story = {
  render: (args) => {
    const [id, setId] = useState(VERIFIED_CASES[0].id)
    return (
      <TestCaseDetailModal
        {...args}
        testCase={VERIFIED_CASES.find((c) => c.id === id) ?? null}
        onSelect={setId}
      />
    )
  },
}

/** No rail — the case on its own, walked with the pager alone. */
export const WithoutNavigator: Story = {
  args: { withNavigator: false },
}

/** A pass: no observed-result highlight, because nothing diverged. */
export const Passing: Story = {
  args: { testCase: VERIFIED_CASES.find((c) => c.outcome === 'pass') ?? null },
}

/** Needs review — the run saw the case run but could not call it. */
export const NeedsReview: Story = {
  args: { testCase: VERIFIED_CASES.find((c) => c.outcome === 'review') ?? null },
}

/** Blocked: the footage never reached the state the case needs. */
export const Blocked: Story = {
  args: { testCase: VERIFIED_CASES.find((c) => c.outcome === 'blocked') ?? null },
}
