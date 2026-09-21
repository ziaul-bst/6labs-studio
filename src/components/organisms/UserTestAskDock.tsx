/**
 * UserTestAskDock — the run's Q&A, docked bottom-right instead of buried under
 * the report.
 *
 * The conversation belongs *after* the findings — you can't ask about a result
 * you haven't read — but its availability has to be obvious the moment you
 * arrive. Those are two different requirements, and an inline block at the
 * bottom of a long page only satisfies the first: the previous version was
 * three scrolls down, so most readers never learned they could ask at all.
 *
 * Docking splits them. The launcher is visible from the first screenful, and
 * the thread opens over the page rather than displacing it — which matters
 * here, because the summary already spends its right side on the qualifier
 * rail, so a side panel would have had to evict something.
 *
 * It also stays open across screens. Reading finding 1's clips in the full
 * report while the answer that sent you there is still on screen is the whole
 * point; a thread that unmounted on navigation would lose exactly the context
 * the reader is using.
 *
 * Code-first prototype — no Figma source yet.
 */

import { UserTestAskPanel } from './UserTestAskPanel'
import { AISparkleIcon } from '../icons/AISparkleIcon'
import { CollapseIcon } from '../icons/CollapseIcon'
import Button from '../ui/Button'
import type { UserTestAskTurn, UserTestEvidenceRef } from '../../lib/types/userTest'

export interface UserTestAskDockProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  turns: UserTestAskTurn[]
  onTurnsChange: (turns: UserTestAskTurn[]) => void
  sessionCount?: number
  /** Named on the launcher so it is clear which run is being asked about. */
  runName?: string
  onOpenEvidence?: (ref: UserTestEvidenceRef) => void
  onHandoffToOracle?: (question: string) => void
}

export function UserTestAskDock({
  open,
  onOpenChange,
  turns,
  onTurnsChange,
  sessionCount = 10,
  runName,
  onOpenEvidence,
  onHandoffToOracle,
}: UserTestAskDockProps) {
  const answered = turns.filter((t) => t.answer).length

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="user-test-dock-launcher fixed bottom-xl right-xl z-40 inline-flex items-center gap-xs rounded-round pl-s pr-m py-xs shadow-big"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-default)' }}
      >
        <span
          className="flex items-center justify-center shrink-0 w-7 h-7 rounded-round text-white"
          style={{ background: 'linear-gradient(135deg, #7B4CFF 0%, #5A2FD0 100%)' }}
          aria-hidden
        >
          <AISparkleIcon size={16} />
        </span>
        <span className="font-display text-s font-semibold text-text-primary leading-[1.5]">
          Ask this run
        </span>
        {/* Only shown once there is something to come back to. */}
        {answered > 0 && (
          <span
            className="inline-flex items-center justify-center min-w-5 h-5 px-xxs rounded-round font-display text-2xs font-semibold"
            style={{ backgroundColor: 'var(--bg-tint)', color: 'var(--text-brand)' }}
          >
            {answered}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className="fixed bottom-xl right-xl z-40 flex flex-col w-[440px] max-w-[calc(100vw-48px)] rounded-2xl overflow-hidden shadow-big"
      style={{
        maxHeight: 'min(620px, calc(100vh - 120px))',
        backgroundColor: 'var(--bg-elements)',
        border: '1px solid var(--border-subtle)',
      }}
      role="complementary"
      aria-label="Ask User Test about this run"
    >
      <div
        className="flex items-start gap-xs px-m py-s shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span
          className="flex items-center justify-center shrink-0 w-7 h-7 rounded-round text-white"
          style={{ background: 'linear-gradient(135deg, #7B4CFF 0%, #5A2FD0 100%)' }}
          aria-hidden
        >
          <AISparkleIcon size={16} />
        </span>
        <div className="flex flex-col gap-xxxs flex-1 min-w-0">
          <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
            Ask User Test
          </span>
          <span className="font-body text-xs text-text-tertiary leading-[1.5] truncate">
            {runName ? `${runName} · ${sessionCount} sessions` : `${sessionCount} sessions`}
          </span>
        </div>
        <Button
          variant="transparent"
          size="md"
          iconOnly
          onClick={() => onOpenChange(false)}
          aria-label="Minimise"
        >
          <CollapseIcon size={16} />
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <UserTestAskPanel
          hideHeading
          sessionCount={sessionCount}
          turns={turns}
          onTurnsChange={onTurnsChange}
          onOpenEvidence={onOpenEvidence}
          onHandoffToOracle={onHandoffToOracle}
        />
      </div>
    </div>
  )
}
