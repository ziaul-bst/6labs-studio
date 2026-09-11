/**
 * AreaLockedPitch — what a purchasable area resolves to.
 *
 * The rule this enforces: a locked area never opens an empty product, and never
 * shows a column of lock icons. Selecting its tab lands on one pitch screen
 * that names what the area does and what already carries over — so the
 * cross-sell is honest about the work the studio has already put in.
 */

import { AREA_PITCH, type StudioArea } from '../../lib/studioAreas'
import Button from '../ui/Button'

export interface AreaLockedPitchProps {
  area: StudioArea
  /** Concrete context the account already has, e.g. "42 gameplay videos". */
  carriesOver?: string
  onContact?: () => void
}

export function AreaLockedPitch({ area, carriesOver, onContact }: AreaLockedPitchProps) {
  const pitch = AREA_PITCH[area]

  return (
    <div className="flex h-full items-center justify-center px-xxl py-xxl">
      <div
        className="flex flex-col gap-m items-center max-w-[520px] rounded-2xl px-xxl py-xxl text-center"
        style={{
          backgroundColor: 'var(--bg-elements)',
          border: '1px dashed var(--border-tint)',
        }}
      >
        <h2 className="font-display text-l font-semibold text-text-primary leading-[1.35]">
          {pitch.title}
        </h2>
        <p className="font-body text-s font-normal text-text-secondary leading-[1.6]">
          {pitch.body}
        </p>
        {carriesOver && (
          <p className="font-body text-xs font-normal text-text-tertiary leading-[1.5]">
            {carriesOver}
          </p>
        )}
        <Button variant="primary" size="md" onClick={onContact}>
          Talk to us
        </Button>
      </div>
    </div>
  )
}
