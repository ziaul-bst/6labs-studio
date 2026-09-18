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
 *   Hero            what this is — and, in the scene, what the test is made of
 *   How it works    three stages — and the one that differs between human and AI
 *   What you get    three outcomes, each on its own flat drawing
 *   Finished run    the real output, full width, every row carrying its clips
 *   How to unlock   the three steps, and the button that starts them
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
import { PitchClose, PitchFlow, PitchHero, PitchOutcomes, PitchSection, type PitchFlowStep } from '../molecules/LockedPitchPieces'
import { PitchScene } from '../molecules/PitchScene'
import type { PitchArtKey } from '../molecules/PitchArt'
import { SUPPORT_EMAIL } from '../molecules/ContactSalesDialog'
import { SampleCaseReport, SampleFindingReport } from '../molecules/PitchSampleReport'
import Button from '../ui/Button'
import { TESTING_ICONS } from './TestingOverview'
import { TESTING_ACCENT_VARS, type TestingTestId, type TestingTestMeta } from '../../lib/studioAreas'
import type { IconProps } from '../icons/types'
import type { CaseOutcome } from '../../lib/types/testing'
import type { IssueSeverity } from '../../lib/types/userTest'

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
 */
const OUTCOME_ART: Partial<Record<TestingTestId, PitchArtKey[]>> = {
  'user-test': ['clips', 'compare', 'ask'],
  'functional-test': ['report', 'compare', 'search'],
  'ai-behavioural-test': ['report', 'personas', 'ask'],
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
 * The sample each test shows, in the shape of the report it writes.
 *
 * A functional test verifies CASES and leads with coverage; a user or
 * behavioural test ranks FINDINGS and leads with what the run was made of.
 * Two different documents, so two different samples — printing one table for
 * both was the pitch showing the wrong product's report.
 *
 * Sample numbers, consistent with the fixtures the real screens use, and the
 * band that holds this is labelled "Sample data".
 */
const CASE_OUTCOMES: CaseOutcome[] = ['fail', 'pass', 'review']
const FINDING_SEVERITIES: IssueSeverity[] = ['blocking', 'disruptive', 'cosmetic']
const SAMPLE_CLIPS = [4, 2, 3]

/** Coverage and the headline over it — the first question a case report answers. */
const SAMPLE_COVERAGE: Partial<Record<TestingTestId, { headline: string; coverage: { pass: number; fail: number; review: number; notRun: number } }>> = {
  'functional-test': {
    headline: '62 of 96 cases verified',
    coverage: { pass: 41, fail: 12, review: 9, notRun: 34 },
  },
  'ai-functional-test': {
    headline: '24 of 24 cases verified, in 28 minutes',
    coverage: { pass: 19, fail: 2, review: 3, notRun: 0 },
  },
}

/** What the run was made of — the masthead numbers a findings report leads with. */
const SAMPLE_TILES: Partial<Record<TestingTestId, Array<{ value: string; label: string; dot?: string }>>> = {
  'user-test': [
    { value: '10', label: 'sessions analysed' },
    { value: '2h 14m', label: 'footage reviewed' },
    { value: '3', label: 'bugs', dot: 'var(--error)' },
    { value: '4', label: 'friction points', dot: 'var(--warning)' },
  ],
  'ai-behavioural-test': [
    { value: '2', label: 'personas' },
    { value: '20', label: 'sessions played' },
    { value: '10h', label: 'footage reviewed' },
    { value: '3', label: 'bugs', dot: 'var(--error)' },
    { value: '4', label: 'friction points', dot: 'var(--warning)' },
  ],
}

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
  /* A functional test decides cases; the other two rank findings. */
  const verifiesCases = test.id === 'functional-test' || test.id === 'ai-functional-test'
  const sampleRows = pitch.previewTitle ? pitch.previewRows : pitch.previewRows.slice(1)
  const sampleTitle = pitch.previewTitle ?? pitch.previewRows[0]
  const sampleMeta = `Sep 5 · ${test.group === 'ai' ? 'AI player sessions' : 'your recordings'}`

  return (
    <div className={['flex flex-col gap-xxl2 page-measure pt-[120px] pb-xxl3', className].filter(Boolean).join(' ')}>
      <PitchHero
        icon={Icon ? <Icon size={32} /> : null}
        visual={<PitchScene test={test.id} accent={TESTING_ACCENT_VARS[test.accent].ink} />}
        accent={test.accent}
        eyebrow={
          test.group === 'ai'
            ? 'AI player testing · 6labs plays your build'
            : 'Human testing · your own recordings'
        }
        title={test.label}
        description={pitch.headline}
      />

      <PitchSection label="How it works" style={{ '--pitch-delay': '90ms' } as CSSProperties}>
        <PitchFlow steps={flowFor(test)} accent={test.accent} />
      </PitchSection>

      <PitchSection label="What you get" style={{ '--pitch-delay': '180ms' } as CSSProperties}>
        <PitchOutcomes outcomes={pitch.outcomes} art={OUTCOME_ART[test.id]} accent={test.accent} />
      </PitchSection>

      <PitchSection
        label="What a finished run looks like"
        trailing={
          <span className="font-body text-xs text-text-tertiary leading-[1.5] whitespace-nowrap">Sample data</span>
        }
        style={{ '--pitch-delay': '270ms' } as CSSProperties}
      >
        {/* Full width and fully legible: this is the thing being sold, so it is
            shown at the size the real one is read at, in the shape the real one
            has. Nothing sits on top of it. */}
        {verifiesCases ? (
          <SampleCaseReport
            title={sampleTitle}
            meta={sampleMeta}
            headline={SAMPLE_COVERAGE[test.id]?.headline ?? ''}
            coverage={SAMPLE_COVERAGE[test.id]?.coverage ?? { pass: 19, fail: 2, review: 3, notRun: 0 }}
            rows={sampleRows.map((label, i) => ({
              label,
              outcome: CASE_OUTCOMES[i] ?? 'pass',
              clips: SAMPLE_CLIPS[i] ?? 3,
            }))}
          />
        ) : (
          <SampleFindingReport
            title={sampleTitle}
            meta={sampleMeta}
            tiles={SAMPLE_TILES[test.id] ?? []}
            rows={sampleRows.map((label, i) => ({
              label,
              severity: FINDING_SEVERITIES[i] ?? 'cosmetic',
              reach: test.group === 'ai' ? `${16 - i * 6} / 20 agents` : `${6 - i * 2} / 10 sessions`,
              clips: SAMPLE_CLIPS[i] ?? 3,
            }))}
          />
        )}
      </PitchSection>

      <PitchSection label="How to unlock it" style={{ '--pitch-delay': '360ms' } as CSSProperties}>
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
          secondaryAction={
            <Button variant="secondary" size="lg" onClick={() => onSeeSample?.(test)}>
              See a sample report
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
