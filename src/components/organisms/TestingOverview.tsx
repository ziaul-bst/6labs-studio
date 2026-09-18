/**
 * TestingOverview — the Testing area's front door.
 *
 * One hero line that states the whole idea (humans and AI, one player model),
 * then the two groups laid out as tiles: Human testing on top, AI testing
 * below, each tile carrying the test's icon, name and one-line purpose. Tests
 * that are not live yet keep their tile — full-contrast, marked SOON — so the shape
 * of the roadmap is visible without pretending anything is clickable.
 *
 * The tile inventory comes from TESTING_TESTS, the same table the sidebar and
 * each test's header read, so the three can never disagree about what exists.
 *
 * Code-first prototype — from the revamp artifact (nav V1, overview "A4").
 */

import type { ComponentType, CSSProperties } from 'react'
import { FunctionalTestIcon } from '../icons/FunctionalTestIcon'
import { AgencyTestIcon } from '../icons/AgencyTestIcon'
import { MembersIcon } from '../icons/MembersIcon'
import { BetaTestIcon } from '../icons/BetaTestIcon'
import { AIFunctionalIcon } from '../icons/AIFunctionalIcon'
import { AIBehaviouralIcon } from '../icons/AIBehaviouralIcon'
import { AIScaleIcon } from '../icons/AIScaleIcon'
import { TestCaseGenIcon } from '../icons/TestCaseGenIcon'
import { LocalizationIcon } from '../icons/LocalizationIcon'
import type { IconProps } from '../icons/types'
import { LockBadge } from '../atoms/LockBadge'
import {
  TESTING_ACCENT_VARS,
  TESTING_TESTS,
  type NavIconKey,
  type TestingTestId,
  type TestingTestMeta,
} from '../../lib/studioAreas'

export interface TestingOverviewProps {
  /** Opens a test's screen. Receives the nav id, which is also the test id. */
  onOpenTest?: (test: TestingTestId) => void
  /** Tests sold separately and not on this plan — tiles stay live, marked with a lock, and open the pitch. */
  lockedTests?: TestingTestId[]
  className?: string
}

export const TESTING_ICONS: Partial<Record<NavIconKey, ComponentType<IconProps>>> = {
  'functional-test': FunctionalTestIcon,
  'agency-test': AgencyTestIcon,
  'user-test': MembersIcon,
  'beta-test': BetaTestIcon,
  'ai-functional-test': AIFunctionalIcon,
  'ai-behavioural-test': AIBehaviouralIcon,
  'ai-scale-test': AIScaleIcon,
  'test-case-gen': TestCaseGenIcon,
  lqa: LocalizationIcon,
}

const GROUPS: { id: 'human' | 'ai'; title: string; sub: string; ink: string }[] = [
  { id: 'human', title: 'Human testing', sub: 'Your sessions, turned into findings.', ink: 'var(--brand)' },
  { id: 'ai', title: 'AI player testing', sub: 'Our AI players, your build. Findings on demand.', ink: 'var(--success)' },
]

export function TestingOverview({ onOpenTest, lockedTests = [], className }: TestingOverviewProps) {
  return (
    <div
      className={['flex flex-col items-center w-full pb-xxl3', className].filter(Boolean).join(' ')}
      /* The head matches the Intelligence New Query hero's 160px on a tall
         display, then falls away steeply as the viewport shortens so a 13" Mac
         still reaches the AI testing group without scrolling — this screen's
         job is to show that Testing has two halves. The offset in the middle
         term is what keeps tall displays generous while short ones give the
         space to content: ~44px at 700, ~88px at 900, the full 160 by 1230. */
      style={{ paddingTop: 'clamp(32px, calc(22vh - 110px), 160px)' }}
    >
      <div
        className="flex flex-col items-center text-center max-w-[720px]"
        style={{ gap: 'clamp(8px, 2.2vh, 16px)', marginBottom: 'clamp(20px, calc(6vh - 20px), 48px)' }}
      >
        <span
          className="inline-flex items-center gap-xs rounded-round px-m py-xs font-display text-xs font-semibold"
          style={{
            backgroundColor: 'var(--bg-elements)',
            border: '1px solid var(--border-tint)',
            color: 'var(--text-brand)',
            boxShadow: '0 4px 16px var(--bg-tint-light)',
          }}
        >
          <span aria-hidden>✦</span>
          Human testing trains the player model. The player model powers AI player testing.
        </span>
        <h1 className="font-display text-4xl font-extrabold text-text-primary leading-[1.1] tracking-[-0.02em]">
          Test your game with <em className="not-italic text-text-brand">humans</em> and{' '}
          <em className="not-italic text-text-brand">AI</em>.
        </h1>
        <p className="font-body text-m text-text-secondary leading-[1.55]">
          Two groups. One player model. Every test makes it better.
        </p>
      </div>

      <div className="flex flex-col page-measure" style={{ gap: 'clamp(24px, calc(5vh - 12px), 48px)' }}>
        {GROUPS.map((group) => {
          const tests = TESTING_TESTS.filter((t) => t.group === group.id)
          return (
            <section key={group.id} className="flex flex-col gap-l w-full" aria-labelledby={`overview-${group.id}`}>
              <div
                className="flex flex-col gap-xxxs pb-s"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <h2
                  id={`overview-${group.id}`}
                  className="font-display text-xl font-extrabold leading-[1.2] tracking-[-0.015em]"
                  style={{ color: group.ink }}
                >
                  {group.title}
                </h2>
                <span className="font-body text-s text-text-secondary leading-[1.5]">{group.sub}</span>
              </div>

              <div
                className="grid gap-m w-full"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
              >
                {tests.map((t) => (
                  <Tile key={t.id} test={t} locked={lockedTests.includes(t.id)} onOpen={onOpenTest} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Tile({ test, locked, onOpen }: { test: TestingTestMeta; locked?: boolean; onOpen?: (id: TestingTestId) => void }) {
  const Icon = TESTING_ICONS[test.icon]
  const vars = TESTING_ACCENT_VARS[test.accent]
  const soon = Boolean(test.soon)
  const Tag = soon ? 'div' : 'button'

  return (
    <Tag
      type={soon ? undefined : 'button'}
      onClick={soon ? undefined : () => onOpen?.(test.id)}
      data-soon={soon ? 'true' : 'false'}
      aria-disabled={soon || undefined}
      className={[
        'testing-tile relative flex flex-col items-start gap-xs rounded-3xl px-l pt-l pb-xxl min-h-[176px] text-left',
        soon ? 'cursor-default' : 'cursor-pointer',
      ].join(' ')}
      style={
        {
          backgroundColor: 'var(--bg-elements)',
          boxShadow: soon ? undefined : 'var(--shadow-sm)',
          '--tile-accent': vars.ink,
        } as CSSProperties
      }
    >
      <div className="flex items-center justify-between w-full">
        <span
          className="flex items-center justify-center w-[44px] h-[44px] rounded-xl"
          style={{
            backgroundColor: vars.bg,
            color: vars.ink,
          }}
          aria-hidden
        >
          {Icon && <Icon size={24} />}
        </span>
        {soon && (
          <span
            className="inline-flex items-center px-xs py-xxxs rounded-xs font-display text-2xs font-semibold uppercase tracking-[0.12em]"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            Soon
          </span>
        )}
        {/* Locked is not SOON: the tile keeps its colour and stays clickable — it
            opens the pitch — and says so with a lock rather than by fading. */}
        {locked && !soon && <LockBadge />}
      </div>
      <span
        className="font-display text-m font-semibold leading-[1.35] pt-xxs"
        style={{ color: 'var(--text-primary)' }}
      >
        {test.label}
      </span>
      <span
        className="font-body text-s leading-[1.5]"
        style={{ color: 'var(--text-secondary)' }}
      >
        {test.tagline}
      </span>
      {!soon && (
        <span
          className="absolute right-l bottom-m font-body text-s font-semibold"
          style={{ color: vars.ink }}
          aria-hidden
        >
          {locked ? 'Unlock ›' : 'Open ›'}
        </span>
      )}
    </Tag>
  )
}
