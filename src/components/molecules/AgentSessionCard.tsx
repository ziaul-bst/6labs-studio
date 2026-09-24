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
 * Failed (2026-09-24) is the third state: an AI player that failed inside a
 * run that did not. 6labs never knows WHY, so the card says only where — one
 * generic line naming the stage. Two stages, two cards:
 *   - Part-way: the last screen it reached under a scrim, a FAILED badge where
 *     Live sits, a red rule showing how far it got, "Stopped at 13m". It opens:
 *     every screen up to the stop is real.
 *   - Before starting: no recording exists, so the well is an empty device
 *     frame rather than a waiting one (waiting means "coming"; this is not),
 *     "Did not start", and the card does not open — there is nothing to watch.
 *
 * Code-first prototype — from the PM artifact (screen s47), no Figma source yet.
 */

import { PlayIcon } from '../icons/PlayIcon'
import { FailedGlyph } from './RunFailedNotice'
import { RecordingWell } from '../atoms/RecordingWell'
import { useRecordingDemoState } from '../../lib/recordingDemoState'
import type { AgentSession } from '../../lib/types/testing'

export interface AgentSessionCardProps {
  session: AgentSession
  onOpen?: (session: AgentSession) => void
  /** Inside a persona group the persona is already said by the group header. */
  hidePersona?: boolean
  className?: string
}

export function AgentSessionCard({ session, onOpen, hidePersona = false, className }: AgentSessionCardProps) {
  const demoOrientation = useRecordingDemoState()
  const live = session.status === 'live'
  const failed = session.status === 'failed'
  /* Failed before its first screen — no steps, no footage, nothing to open. */
  const neverStarted = failed && session.reached === 0
  const latest = session.steps[Math.max(0, session.reached - 1)]
  /* A live card shows where the agent is; a finished one shows a screen from
     the middle of its session, varied per agent so a grid of twenty reads as
     twenty recordings rather than one. */
  /* A failed card shows where it stopped — that is the frame the reason is about. */
  const current =
    live || failed ? latest : session.steps[Math.min(session.steps.length - 1, 2 + (session.index % 6))]
  const failedLine = neverStarted ? 'Failed before starting' : 'Failed part-way through'
  const title = hidePersona ? `Agent ${session.index + 1}` : `${session.persona} · agent ${session.index + 1}`
  const orientation = session.orientation ?? demoOrientation

  return (
    <button
      type="button"
      onClick={neverStarted ? undefined : () => onOpen?.(session)}
      aria-disabled={neverStarted || undefined}
      aria-label={`${title}, ${
        failed ? `${failedLine.toLowerCase()}, ${session.durationLabel}` : live ? `live, ${session.durationLabel}` : session.durationLabel
      }`}
      className={[
        'agent-session-card flex flex-col w-full text-left rounded-2xl overflow-hidden',
        neverStarted ? 'agent-session-card-inert' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      {/* The frame — the screen the agent is on, in the same well the session
          viewer uses, so a portrait capture is shaped the same way in the grid
          as it is on the page the grid opens into. A card gets a squarer box
          than the viewer does: at 280px wide there is no room to spend on
          ambience. Stand-in gradient until real stills ship; the HUD bars keep
          it reading as a game screen. */}
      <RecordingWell
        /* A never-started session has no frame. A flat screen colour rather
           than no scene at all — no scene is the well's WAITING state, which
           says a picture is on its way. */
        scene={neverStarted ? '#0d1424' : current.scene}
        orientation={orientation}
        compact
        className="w-full"
        /* One shape for every card, whatever the capture is. The tile used to
           take 4:3 for a portrait session and 16:10 for a landscape one, so a
           run with both produced a grid whose rows were different heights and
           whose cards did not line up — the letterboxing the well exists to do
           is precisely what removes the need for that. */
        style={{ aspectRatio: '4 / 3' }}
        pane={
          neverStarted ? undefined : (
          <span className="absolute left-xxs top-xxs flex gap-xxxs" aria-hidden>
            <i className="block w-[24px] h-[6px] rounded-xs" style={{ backgroundColor: 'rgba(255,220,130,0.5)' }} />
            <i className="block w-[16px] h-[6px] rounded-xs" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
            <i className="block w-[16px] h-[6px] rounded-xs" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
          </span>
          )
        }
      >
        {failed ? (
          <>
            {/* The scrim is what separates a stopped recording from a finished
                one at a glance — the frame is real, the session is not whole. */}
            <span className="absolute inset-0" style={{ backgroundColor: 'rgba(15,27,51,0.55)' }} aria-hidden />
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-[36px] h-[36px] rounded-round"
              style={{ backgroundColor: 'var(--error)', color: '#fff' }}
              aria-hidden
            >
              <FailedGlyph size={18} />
            </span>
            <span
              className="absolute right-s top-s inline-flex items-center gap-xxs px-xs py-xxxs rounded-round font-display text-2xs font-semibold uppercase tracking-[0.08em]"
              style={{ backgroundColor: 'var(--bg-elements)', color: 'var(--error)' }}
            >
              Failed
            </span>
          </>
        ) : live ? (
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

        {(live || (failed && !neverStarted)) && (
          /* How far it got. Brand while it is still going; red where it
             stopped, so the length of the rule is the length of the session
             that exists. */
          <span className="absolute left-0 right-0 bottom-0 h-[3px]" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} aria-hidden>
            <i
              className="block h-full transition-[width] duration-500 ease-out"
              style={{
                width: `${(failed ? session.stoppedFraction ?? 1 : session.reached / session.steps.length) * 100}%`,
                backgroundColor: failed ? 'var(--error)' : 'var(--brand)',
              }}
            />
          </span>
        )}
      </RecordingWell>

      {/* Who played it, and nothing else.
          The body used to carry a persona dot, and under the title either the
          in-game screen the agent was on ("Playing · Event › Reward") or the
          persona's description. Across a grid of twenty that is twenty lines of
          text nobody reads: the screen name is a position in a session you have
          not opened yet, and the description is the same sentence on every card
          of that persona — it belongs to the persona, not to this recording.
          The dot went with them: it encoded the persona a second time, beside a
          title that already names it. */}
      <span className="flex flex-col gap-xxxs px-m py-s min-w-0">
        <span className="font-display text-s font-semibold text-text-primary leading-[1.45] truncate">
          {title}
        </span>
        {/* The one exception to "who played it, and nothing else": a failed
            card names the stage it failed at. Not a cause — 6labs is not told
            one, and a guessed reason is worse than none. */}
        {failed && (
          <span className="font-body text-xs leading-[1.5]" style={{ color: 'var(--error)' }}>
            {failedLine}
          </span>
        )}
      </span>
    </button>
  )
}
