/**
 * TestLockedPitch — what a locked test resolves to.
 *
 * Tests are sold separately, so a studio can have Functional test and User
 * test while External agency test is not on its plan. The rule mirrors the
 * area-level pitch: a locked test never opens an empty product, and never
 * hides. Its row stays in the sidebar and its tile stays on the Overview, both
 * marked with a lock, and selecting either lands here.
 *
 * Four bands, one idea each, in the order a reader actually asks them:
 *
 *   Hero            what this is, and what it is made of
 *   How it works    three stages — and the one that differs between human and AI
 *   What you get    the outcomes, each on its own flat drawing
 *   Preview         one row offering a finished report to look at
 *   How to unlock   the three steps, and the one button that starts them
 *
 * There is no inline sample run. One was drawn here and pulled: a made-up
 * report only reads as the product for a test that produces one shape of
 * document, and the roadmap has tests (localisation, large-scale) whose output
 * that shape would misrepresent. The Preview row is the honest version of the
 * same offer, and it sits where someone actually wants it — straight after the
 * outcomes, not in the hero before the argument and not in the closing band
 * competing with the sale.
 *
 * The ask is at the FOOT, not in the hero: a reader met the button before the
 * argument and then had nothing to press once they had finished reading. The
 * page now ends on proof, then action.
 *
 * What it replaced: a grey "not included in your plan" strip, a bullet card
 * carrying a second primary, and a desaturated miniature behind a dashed
 * panel, a gradient fade and a button-shaped pill that wasn't a button.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ComponentType, CSSProperties } from 'react'
import {
  PitchClose,
  PitchFlow,
  PitchHero,
  PitchJumpLink,
  PitchOffer,
  PitchOutcomes,
  PitchSection,
  type PitchFlowStep,
} from '../molecules/LockedPitchPieces'
import { PitchScene } from '../molecules/PitchScene'
import type { PitchArtKey } from '../molecules/PitchArt'
import { SUPPORT_EMAIL } from '../molecules/ContactSalesDialog'
import Button from '../ui/Button'
import { TESTING_ICONS } from './TestingOverview'
import { TESTING_ACCENT_VARS, type TestingAccent, type TestingTestId, type TestingTestMeta } from '../../lib/studioAreas'
import type { IconProps } from '../icons/types'

export interface TestLockedPitchProps {
  test: TestingTestMeta
  /** Tests the studio does have — names the plan it is on rather than only what it lacks. */
  includedTests?: string[]
  /** Concrete context the studio already has — makes the upsell honest about setup cost. */
  carriesOver?: string
  onContactSales?: (test: TestingTestMeta) => void
  onSeeSample?: (test: TestingTestMeta) => void
  className?: string
}

/**
 * Which drawing sits on each outcome tile. Art is presentation, not copy, so
 * it lives here rather than in the pitch data — the sentences stay the PM's.
 *
 * No page may use the same drawing twice: the flow's last stage is `report`
 * and the preview row is `document`, so an outcome about results uses
 * `verdicts` (cases, each with its clip) or `findings` (ranked by what they
 * cost) instead. Three identical grey report drawings down one page read as a
 * template, not as three different things.
 */
const OUTCOME_ART: Partial<Record<TestingTestId, PitchArtKey[]>> = {
  'user-test': ['clips', 'ask'],
  'functional-test': ['verdicts', 'search'],
  'ai-behavioural-test': ['findings', 'personas', 'ask'],
  'ai-functional-test': ['clock', 'rerun', 'clips'],
}

/**
 * How the test works, in three stages — and the reason this band exists.
 *
 * A human test and its AI counterpart end in the same report, so their pitch
 * pages were reading as the same product. Only the FIRST stage differs, and it
 * differs completely: on a human test the studio supplies the footage, on an
 * AI test 6labs' own players produce it from a persona and a brief. Stages two
 * and three are deliberately identical, because they are.
 */
function flowFor(test: TestingTestMeta): PitchFlowStep[] {
  const ai = test.group === 'ai'
  const verifies = test.id === 'functional-test' || test.id === 'ai-functional-test'

  const source: PitchFlowStep = ai
    ? {
        art: 'aiplayer',
        title: verifies ? 'AI players execute your cases' : 'AI players play your build',
        body: verifies
          ? 'No footage needed. You pick the build and the test cases; 6labs players run them on a real device and record themselves.'
          : 'No footage needed. You pick the personas and write the brief; 6labs players play the build and record themselves.',
      }
    : {
        art: 'upload',
        title: verifies ? 'You add the recordings and your cases' : 'You add the recordings',
        body: verifies
          ? "Your own testers' sessions, uploaded to the Gameplay Library, plus the case sheet they were run against."
          : "Your own testers' sessions, uploaded to the Gameplay Library or pushed from the recorder app.",
      }

  return [
    source,
    {
      art: 'analysis',
      title: verifies ? '6labs verifies every case' : '6labs reads every session',
      body: 'Screen by screen, against the game context you have already given it — the same analysis whoever produced the footage.',
    },
    {
      art: 'report',
      title: 'You get the report',
      body: verifies
        ? 'Every case marked pass, failed or need review, each with the clip behind its result.'
        : 'Findings ranked by how many sessions hit them, each with the clips behind them.',
    },
  ]
}

/**
 * What a sample of this test's report is a report *of*. Sample copy, so it
 * lives here beside the art map rather than in the pitch data.
 */
const SAMPLE_OFFER: Partial<Record<TestingTestId, string>> = {
  'user-test':
    'A completed report on 10 onboarding sessions: every finding grouped by what you would fix together, each with its evidence clips and a recommendation.',
  'functional-test':
    'A completed report on a 96-case sheet: every case marked pass, failed or need review, each with the clip behind its result.',
  'ai-behavioural-test':
    'A completed report on 20 AI player sessions: every finding ranked by how many agents hit it, each with its evidence clips and a recommendation.',
  'ai-functional-test':
    'A completed report on a 24-case regression run: every case marked pass, failed or need review, each with the recording the agent produced.',
}

/** Where the hero's jump link lands. */
const UNLOCK_ID = 'pitch-unlock'

/** "User test and AI behavioural test" · "A, B and C". */
function listOf(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export function TestLockedPitch({
  test,
  includedTests = [],
  carriesOver = 'Your Gameplay Library and game context carry over — nothing to set up again.',
  onContactSales,
  onSeeSample,
  className,
}: TestLockedPitchProps) {
  const Icon = TESTING_ICONS[test.icon] as ComponentType<IconProps> | undefined
  const pitch = test.pitch
  /* Drawings are keyed to the GROUP, not the test: human testing reads blue
     and AI player testing green, the same split the sidebar captions use.
     Functional test's own teal is kept for its identity tile alone, so the
     page does not end up with two greens meaning two different things. */
  const artAccent: TestingAccent = test.group === 'ai' ? test.accent : 'brand'

  return (
    <div className={['flex flex-col gap-xxl2 page-measure pt-[120px] pb-[120px]', className].filter(Boolean).join(' ')}>
      <PitchHero
        icon={Icon ? <Icon size={32} /> : null}
        visual={<PitchScene test={test.id} accent={TESTING_ACCENT_VARS[artAccent].ink} />}
        accent={artAccent}
        iconAccent={test.accent}
        eyebrow={
          test.group === 'ai'
            ? 'AI player testing · 6labs plays your build'
            : 'Human testing · your own recordings'
        }
        title={test.label}
        description={pitch.headline}
        secondaryAction={<PitchJumpLink targetId={UNLOCK_ID}>How to unlock it</PitchJumpLink>}
      />

      <PitchSection label="How it works" style={{ '--pitch-delay': '90ms' } as CSSProperties}>
        <PitchFlow steps={flowFor(test)} accent={artAccent} />
      </PitchSection>

      <PitchSection label="What you get" style={{ '--pitch-delay': '180ms' } as CSSProperties}>
        <PitchOutcomes outcomes={pitch.outcomes} art={OUTCOME_ART[test.id]} accent={artAccent} />
      </PitchSection>

      <PitchOffer
        art="document"
        accent={artAccent}
        title="Preview a finished report"
        body={SAMPLE_OFFER[test.id] ?? 'A completed report from a finished run, with the footage behind every result.'}
        action={
          <Button variant="secondary" size="lg" onClick={() => onSeeSample?.(test)}>
            See a sample report
          </Button>
        }
        style={{ '--pitch-delay': '270ms' } as CSSProperties}
      />

      <PitchSection id={UNLOCK_ID} label="How to unlock it" style={{ '--pitch-delay': '360ms' } as CSSProperties}>
        <PitchClose
          steps={[
            {
              title: 'Tell us you want it',
              body: (
                <>
                  Press Contact sales, or mail{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-text-brand font-semibold hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </>
              ),
            },
            {
              title: 'We switch it on here',
              body: `${test.label} is enabled on this workspace — no new account, nothing to install.`,
            },
            /* "Start where you are", not "run it the same day": how fast we
               switch a test on is not ours to promise on a page. What is true
               is that nothing has to be set up again. */
            { title: 'Start where you are', body: carriesOver },
          ]}
          action={
            <Button variant="primary" size="lg" onClick={() => onContactSales?.(test)}>
              Contact sales
            </Button>
          }
          planLine={
            includedTests.length > 0
              ? `Your plan already includes ${listOf(includedTests)}. Tests are added per workspace by our team.`
              : 'Tests are added per workspace by our team.'
          }
        />
      </PitchSection>
    </div>
  )
}
