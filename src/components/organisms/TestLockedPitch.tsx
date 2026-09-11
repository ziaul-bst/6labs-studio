/**
 * TestLockedPitch — what a locked test resolves to.
 *
 * Tests are sold separately, so a studio can have Functional test and User
 * test while External agency test is not on its plan. The rule mirrors the
 * area-level pitch: a locked test never opens an empty product, and never
 * hides. Its row stays in the sidebar and its tile stays on the Overview, both
 * marked with a lock, and selecting either lands here.
 *
 * The screen answers three questions in order: what is this and why can't I
 * use it (status banner), what would I get (outcomes), and how do I get it
 * (Contact sales — the only path, since tests are enabled per workspace by the
 * sales team). The sample report is a recognisable output, greyed and capped
 * with the lock, rather than marketing art.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { ComponentType } from 'react'
import { TestingPageHeader } from '../molecules/TestingPageHeader'
import Button from '../ui/Button'
import { LockIcon } from '../icons/LockIcon'
import { CheckIcon } from '../icons/CheckIcon'
import { TESTING_ICONS } from './TestingOverview'
import { TESTING_ACCENT_VARS, type TestingTestMeta } from '../../lib/studioAreas'
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

const PREVIEW_OUTCOMES = ['fail', 'pass', 'review', 'pass'] as const
const OUTCOME_CHIP = {
  pass: { label: 'Passed', bg: 'var(--success-bg)', ink: 'var(--success)' },
  fail: { label: 'Failed', bg: 'var(--error-bg)', ink: 'var(--error)' },
  review: { label: 'Needs review', bg: 'var(--warning-bg)', ink: '#8A6300' },
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
  const vars = TESTING_ACCENT_VARS[test.accent]
  const pitch = test.pitch

  return (
    <div className={['flex flex-col gap-l page-measure pt-[120px] pb-xxl3', className].filter(Boolean).join(' ')}>
      <TestingPageHeader title={test.label} description={pitch.headline} icon={Icon ? <Icon size={32} /> : null} accent={test.accent} />

      {/* 1 · Status — why this page and not the product */}
      <div
        className="flex items-center gap-s rounded-2xl px-l py-m"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-default)' }}
        role="status"
      >
        <span
          className="flex items-center justify-center shrink-0 w-[36px] h-[36px] rounded-l"
          style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          aria-hidden
        >
          <LockIcon size={20} />
        </span>
        <div className="flex flex-col gap-xxxs flex-1 min-w-0">
          <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">
            {test.label} is not included in your plan
          </span>
          <span className="font-body text-s text-text-secondary leading-[1.5]">
            {includedTests.length > 0
              ? `Your plan includes ${includedTests.join(', ')}. Tests are added per workspace by our sales team.`
              : 'Tests are added per workspace by our sales team.'}
          </span>
        </div>
        <Button variant="primary" size="lg" onClick={() => onContactSales?.(test)}>
          Contact sales
        </Button>
      </div>

      <div className="grid gap-l w-full items-stretch" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
        {/* 2 · What you get */}
        <div
          className="flex flex-col gap-l rounded-3xl px-xl py-xl"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex flex-col gap-xxs">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">What you get</span>
            <h2 className="font-display text-l font-semibold text-text-primary leading-[1.3]">{test.tagline}</h2>
          </div>
          <ul className="flex flex-col gap-m list-none m-0 p-0">
            {pitch.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-s">
                <span
                  className="flex items-center justify-center shrink-0 w-6 h-6 rounded-round mt-xxxs"
                  style={{ backgroundColor: vars.bg, color: vars.ink }}
                  aria-hidden
                >
                  <CheckIcon size={12} />
                </span>
                <span className="font-body text-s text-text-primary leading-[1.6]">{o}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-s pt-m mt-auto" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="font-body text-s text-text-secondary leading-[1.6]">{carriesOver}</p>
            <div className="flex items-center gap-s flex-wrap">
              <Button variant="primary" size="md" onClick={() => onContactSales?.(test)}>
                Contact sales
              </Button>
              <Button variant="secondary" size="md" onClick={() => onSeeSample?.(test)}>
                See a sample report
              </Button>
            </div>
          </div>
        </div>

        {/* 3 · A recognisable output, greyed and locked */}
        <div
          className="relative flex flex-col gap-s rounded-3xl px-xl py-xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-page-pale)', border: '1px dashed var(--border-default)' }}
          aria-hidden
        >
          <div className="flex items-center gap-xs">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">Sample report</span>
            <span className="font-body text-xs text-text-tertiary">· what a finished run looks like</span>
          </div>
          <div
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)', filter: 'saturate(0.35)', opacity: 0.9 }}
          >
            <div className="flex items-center gap-s px-m py-s" style={{ backgroundColor: 'var(--bg-page-pale)', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="font-display text-s font-semibold text-text-primary truncate">{pitch.previewRows[0]}</span>
              <span className="flex-1" />
              <span className="font-body text-xs text-text-tertiary whitespace-nowrap">Sep 5 · 8 videos</span>
            </div>
            {pitch.previewRows.slice(1).map((row, i) => {
              const chip = OUTCOME_CHIP[PREVIEW_OUTCOMES[i] ?? 'pass']
              return (
                <div key={row} className="flex items-center gap-s px-m py-s" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
                  <span
                    className="flex items-center justify-center shrink-0 w-6 h-6 rounded-m font-display text-xs font-semibold"
                    style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 min-w-0 font-body text-s text-text-primary truncate">{row}</span>
                  <span
                    className="inline-flex items-center px-xs py-xxxs rounded-s font-display text-2xs font-semibold whitespace-nowrap"
                    style={{ backgroundColor: chip.bg, color: chip.ink }}
                  >
                    {chip.label}
                  </span>
                </div>
              )
            })}
            <div className="flex items-center gap-s px-m py-s" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {[0, 1, 2].map((k) => (
                <span key={k} className="block h-[8px] rounded-xs" style={{ width: `${28 - k * 6}%`, backgroundColor: 'var(--bg-subtle)' }} />
              ))}
            </div>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-xl pt-xxl2 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(245,245,245,0) 0%, var(--bg-page-pale) 70%)' }}
          >
            <span
              className="inline-flex items-center gap-xs rounded-round px-m py-xs font-display text-s font-semibold"
              style={{ backgroundColor: 'var(--bg-elements)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
            >
              <LockIcon size={16} />
              Unlocked by sales for your workspace
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
