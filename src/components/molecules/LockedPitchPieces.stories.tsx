import type { Meta, StoryObj } from '@storybook/react-vite'
import { PitchClose, PitchHero, PitchOutcomes, PitchSection } from './LockedPitchPieces'
import { PitchScene } from './PitchScene'
import { FunctionalTestIcon } from '../icons/FunctionalTestIcon'
import Button from '../ui/Button'
import { TESTING_TESTS } from '../../lib/studioAreas'

const test = TESTING_TESTS.find((t) => t.id === 'functional-test')!

const meta = {
  title: 'Molecules/LockedPitchPieces',
  component: PitchHero,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="page-measure py-xxl2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PitchHero>

export default meta
/* Typed off the component, not the meta: the composition stories below render
   their own markup and carry no args. */
type Story = StoryObj<typeof PitchHero>

/** The page's focal point — identity, one sentence, and the test's own scene beside it. */
export const Hero: Story = {
  args: {
    icon: <FunctionalTestIcon size={32} />,
    visual: <PitchScene test="functional-test" accent="var(--testing-teal)" />,
    accent: 'teal',
    title: test.label,
    description: test.pitch.headline,
  },
}

/** A test with nothing to picture falls back to its own glyph as a watermark. */
export const HeroWatermarkOnly: Story = {
  args: {
    icon: <FunctionalTestIcon size={32} />,
    watermark: <FunctionalTestIcon size={128} />,
    accent: 'purple',
    title: test.label,
    description: test.pitch.headline,
  },
}

/** Three outcomes as equal tiles — what you would have, not a feature list. */
export const Outcomes: Story = {
  render: () => (
    <PitchSection label="What you get">
      <PitchOutcomes outcomes={test.pitch.outcomes} accent="teal" />
    </PitchSection>
  ),
}

/** The band the page ends on: the path, then the button that starts it. */
export const Close: Story = {
  render: () => (
    <PitchSection label="How to unlock it">
      <PitchClose
        steps={[
          { title: 'Tell us you want it', body: 'Press Contact sales, or mail support@6labs.ai.' },
          { title: 'We switch it on here', body: 'Functional test is enabled on this workspace — no new account, nothing to install.' },
          { title: 'Start where you are', body: 'Your 14 Gameplay Library recordings and game context carry over — nothing to set up again.' },
        ]}
        action={
          <Button variant="primary" size="lg">
            Contact sales
          </Button>
        }
        planLine="Your plan already includes User test and AI behavioural test. Tests are added per workspace by our team."
      />
    </PitchSection>
  ),
}

/** A labelled band with a right-hand mark. */
export const Section: Story = {
  render: () => (
    <PitchSection
      label="What a finished run looks like"
      trailing={<span className="font-body text-xs text-text-tertiary">Sample data</span>}
    >
      <div
        className="rounded-3xl h-[160px]"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      />
    </PitchSection>
  ),
}
