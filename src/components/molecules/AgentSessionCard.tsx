/**
 * AgentSessionCard — one AI player's session in a behavioural run's Videos tab.
 *
 * The thumbnail is a frame from the session — the screen the agent is on
 * while it plays, a mid-session screen once it has finished — and the body
 * says how far it got. The card judges nothing; the report does that.
 *
 * Live and finished sessions share one card. Live adds a pulsing LIVE badge and
 * a thin progress rule under the thumbnail; finished shows a play affordance.
 * Everything else — the title, the duration — is identical in both, so a grid
 * that is half done reads as one set rather than two.
 *
 * Code-first prototype — from the PM artifact (screen s47), no Figma source yet.
 */

import { PlayIcon } from '../icons/PlayIcon'
import type { AgentSession } from '../../lib/types/testing'

export interface AgentSessionCardProps {
  session: AgentSession
  onOpen?: (session: AgentSession) => void
  /** Inside a persona group the persona is already said by the group header. */
  hidePersona?: boolean
  className?: string
}

export function AgentSessionCard({ session, onOpen, hidePersona = false, className }: AgentSessionCardProps) {
  const live = session.status === 'live'
  const latest = session.steps[Math.max(0, session.reached - 1)]
  /* A live card shows where the agent is; a finished one shows a screen from
     the middle of its session, varied per agent so a grid of twenty reads as
     twenty recordings rather than one. */
  const current = live ? latest : session.steps[Math.min(session.steps.length - 1, 2 + (session.index % 6))]
  const title = hidePersona ? `Agent ${session.index + 1}` : `${session.persona} · agent ${session.index + 1}`

  return (
    <button
      type="button"
      onClick={() => onOpen?.(session)}
      aria-label={`${title}, ${live ? `live, ${session.durationLabel}` : session.durationLabel}`}
      className={[
        'agent-session-card flex flex-col w-full text-left rounded-2xl overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      {/* The frame — the screen the agent is on. Stand-in gradient until real
          stills ship; the HUD bars keep it reading as a game screen. */}
      <span className="relative block w-full overflow-hidden" style={{ aspectRatio: '16 / 10', background: current.scene }}>
        <span className="absolute left-s top-s flex gap-xxs" aria-hidden>
          <i className="block w-[40px] h-[8px] rounded-xs" style={{ backgroundColor: 'rgba(255,220,130,0.5)' }} />
          <i className="block w-[26px] h-[8px] rounded-xs" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
          <i className="block w-[26px] h-[8px] rounded-xs" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
        </span>

        {live ? (
          <span
            className="absolute right-s top-s inline-flex items-center gap-xxs px-xs py-xxxs rounded-round font-display text-2xs font-semibold uppercase tracking-[0.08em]"
            style={{ backgroundColor: 'var(--bg-elements)', color: 'var(--error)' }}
          >
            <i className="agent-live-dot" aria-hidden />
            Live
          </span>
        ) : (
          <span
            className="agent-session-play absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-[36px] h-[36px] rounded-round"
            style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: 'var(--text-primary)' }}
            aria-hidden
          >
            <PlayIcon size={16} />
          </span>
        )}

        {/* How long, in both states — "8m so far" while it plays, the finished
            length once it stops. It used to count screens on a live card
            ("Screen 10 / 12"), which is the agent's progress through a script
            the reader cannot see; a duration is the same fact in a unit that
            needs no explaining, and it means the badge does not change meaning
            when the session ends. */}
        <span
          className="absolute right-s bottom-s px-xs py-xxxs rounded-s font-code text-2xs text-white whitespace-nowrap"
          style={{ backgroundColor: 'rgba(15,27,51,0.72)' }}
        >
          {session.durationLabel}
        </span>

        {live && (
          <span className="absolute left-0 right-0 bottom-0 h-[3px]" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} aria-hidden>
            <i
              className="block h-full transition-[width] duration-500 ease-out"
              style={{ width: `${(session.reached / session.steps.length) * 100}%`, backgroundColor: 'var(--brand)' }}
            />
          </span>
        )}
      </span>

      {/* Who played it, and nothing else.
          The body used to carry a persona dot, and under the title either the
          in-game screen the agent was on ("Playing · Event › Reward") or the
          persona's description. Across a grid of twenty that is twenty lines of
          text nobody reads: the screen name is a position in a session you have
          not opened yet, and the description is the same sentence on every card
          of that persona — it belongs to the persona, not to this recording.
          The dot went with them: it encoded the persona a second time, beside a
          title that already names it. */}
      <span className="flex flex-col px-m py-s min-w-0">
        <span className="font-display text-s font-semibold text-text-primary leading-[1.45] truncate">
          {title}
        </span>
      </span>
    </button>
  )
}
