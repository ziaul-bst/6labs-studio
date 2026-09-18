/**
 * AreaLockedPitch — what a purchasable area resolves to.
 *
 * The rule this enforces: a locked area never opens an empty product, and never
 * shows a column of lock icons. Selecting its tab lands on one pitch screen
 * that names what the area does and what already carries over — so the
 * cross-sell is honest about the work the studio has already put in.
 *
 * Same four bands as a locked test's pitch, one scope up: hero, what's inside,
 * how to unlock. It has no PM-written outcomes list, so the "what you get"
 * band is the area's own rows rather than marketing copy invented for it.
 *
 * Reachable in Storybook; the app pins both areas as entitled.
 */

import type { CSSProperties } from 'react'
import { PitchClose, PitchHero, PitchSection } from '../molecules/LockedPitchPieces'
import { SUPPORT_EMAIL } from '../molecules/ContactSalesDialog'
import Button from '../ui/Button'
import { IntelligenceIcon } from '../icons/IntelligenceIcon'
import { TestRunIcon } from '../icons/TestRunIcon'
import { NAV_ICONS } from './Sidebar'
import { AREA_LABEL, AREA_NAV, AREA_PITCH, TESTING_TESTS, type NavIconKey, type StudioArea } from '../../lib/studioAreas'

export interface AreaLockedPitchProps {
  area: StudioArea
  /** Concrete context the account already has, e.g. "42 gameplay videos". */
  carriesOver?: string
  onContact?: () => void
}

interface AreaRow {
  key: string
  label: string
  detail?: string
  icon: NavIconKey
}

/** The rows the area's sidebar would show — its contents, not marketing. */
function rowsFor(area: StudioArea): AreaRow[] {
  if (area === 'testing') {
    return TESTING_TESTS.filter((t) => !t.soon).map((t) => ({ key: t.id, label: t.label, detail: t.tagline, icon: t.icon }))
  }
  return AREA_NAV.intelligence.groups
    .flatMap((g) => g.items)
    .filter((i) => !i.disabled && i.nav !== 'home')
    .map((i) => ({ key: i.nav, label: i.label, icon: i.icon }))
}

export function AreaLockedPitch({ area, carriesOver, onContact }: AreaLockedPitchProps) {
  const pitch = AREA_PITCH[area]
  const label = AREA_LABEL[area]
  const AreaIcon = area === 'testing' ? TestRunIcon : IntelligenceIcon
  const accent = area === 'testing' ? 'purple' : 'brand'
  const rows = rowsFor(area)

  return (
    <div className="flex flex-col gap-xxl2 page-measure pt-[120px] pb-[120px]">
      <PitchHero
        icon={<AreaIcon size={32} />}
        watermark={<AreaIcon size={128} />}
        accent={accent}
        title={label}
        description={pitch.body}
      />

      <PitchSection
        label={area === 'testing' ? 'The tests it includes' : 'The agents and context it includes'}
        style={{ '--pitch-delay': '90ms' } as CSSProperties}
      >
        <div className="grid gap-m" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {rows.map((row) => {
            const Icon = NAV_ICONS[row.icon]
            return (
              <div
                key={row.key}
                className="flex items-center gap-s rounded-3xl px-l py-m"
                style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
              >
                <span
                  className="flex items-center justify-center shrink-0 w-9 h-9 rounded-m text-text-secondary"
                  style={{ backgroundColor: 'var(--bg-page-pale)' }}
                  aria-hidden
                >
                  {Icon && <Icon size={20} />}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="font-display text-s font-semibold text-text-primary leading-[1.4] truncate">{row.label}</span>
                  {row.detail && (
                    <span className="font-body text-xs text-text-secondary leading-[1.5] truncate">{row.detail}</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </PitchSection>

      <PitchSection label="How to unlock it" style={{ '--pitch-delay': '180ms' } as CSSProperties}>
        <PitchClose
          action={
            <Button variant="primary" size="lg" onClick={onContact}>
              Contact sales
            </Button>
          }
          planLine="Areas are added per workspace by our team."
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
              body: `${label} is enabled on this workspace — no new account, nothing to install.`,
            },
            {
              title: 'Start where you are',
              body: carriesOver ?? 'Your game context carries straight over — nothing to set up again.',
            },
          ]}
        />
      </PitchSection>
    </div>
  )
}
