/**
 * AIAgentSessionView — one AI player's session: the video, and the analysis
 * of the screen you are looking at.
 *
 * The value of this screen is seeing a frame and its reading together, so the
 * two are the hero: the recording on the left, and beside it — at the same
 * height, in one panel — what the agent saw on *this* screen and what it did.
 * Scrub the video and the panel follows; step the panel and the video follows.
 *
 * Under the transport every screen sits as a frame in a filmstrip — the
 * timeline, read by eye — and the frame you are on is outlined. Nothing on
 * this screen judges a moment; the report does that.
 *
 * **Live sessions run the loop in front of you.** A finished session is
 * evidence and shows every field at once. A session still playing is a
 * performance: for each screen the agent captures the frame, reasons about it,
 * acts, and then watches what its action produced — and the panel fills in one
 * beat at a time, in that order, with the reasoning streaming in as it is
 * written. That is the difference between reading a log and watching an agent
 * work, and it is the whole point of the live view. Scrub away and you drop
 * back to evidence mode; "Jump to live" resumes the performance.
 *
 * Code-first prototype — from the PM artifact (screen s48), no Figma source yet.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { RunFacts } from '../molecules/RunFacts'
import Button from '../ui/Button'
import { PlayIcon } from '../icons/PlayIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import { CheckIcon } from '../icons/CheckIcon'
import { AIPlayerIcon } from '../icons/AIPlayerIcon'
import { PERSONA_TONE, formatSessionTime } from '../../lib/mocks/testing'
import type { AgentSession, AIBehaviouralRunMeta } from '../../lib/types/testing'

export interface AIAgentSessionViewProps {
  session: AgentSession
  runName: string
  meta: AIBehaviouralRunMeta
  /** The players' brief for this run, if one was given. */
  instructions?: string
  /** Screen to land on — a clip in the report arrives here. */
  initialStep?: number
  onBack: () => void
  className?: string
}

/* ── The agent's loop ─────────────────────────────────────────────────────────
   One screen takes four beats. The durations are the pacing of the whole live
   view, so the run that feeds it advances a screen on the same clock (see
   AGENT_LOOP_MS, used by AIBehaviouralTestView) — otherwise the walkthrough
   and the run's own progress drift apart and the counts stop agreeing. */

type LoopPhase = 'capture' | 'reason' | 'act' | 'verify' | 'settled' | 'waiting'

const PHASE_MS: Record<'capture' | 'reason' | 'act' | 'verify', number> = {
  capture: 1300,
  reason: 2300,
  act: 1000,
  verify: 1400,
}

/** How long one screen takes end to end — the run ticks at this rate too. */
export const AGENT_LOOP_MS =
  PHASE_MS.capture + PHASE_MS.reason + PHASE_MS.act + PHASE_MS.verify

/** Replay pace when the reader presses play on a finished session. */
const PLAY_MS = 1800

const PHASES: { key: LoopPhase; label: string }[] = [
  { key: 'capture', label: 'Observe' },
  { key: 'reason', label: 'Reason' },
  { key: 'act', label: 'Act' },
  { key: 'verify', label: 'Verify' },
]

const PHASE_ORDER: LoopPhase[] = ['capture', 'reason', 'act', 'verify', 'settled']

/**
 * Walks one screen through the loop while `enabled`, then asks to advance.
 * Restarts whenever the screen changes. When there is no next screen yet it
 * parks in `waiting` — the run has not produced the frame, and saying so is
 * better than looping the same screen as though something were happening.
 */
function useAgentLoop({
  enabled,
  screenKey,
  hasNext,
  onAdvance,
}: {
  enabled: boolean
  screenKey: string
  hasNext: boolean
  onAdvance: () => void
}): LoopPhase {
  const [phase, setPhase] = useState<LoopPhase>('capture')
  const advance = useRef(onAdvance)
  advance.current = onAdvance

  useEffect(() => {
    if (!enabled) return
    setPhase('capture')
    /* One cumulative schedule, read top to bottom in the order the agent works. */
    const schedule: [LoopPhase, number][] = [
      ['reason', PHASE_MS.capture],
      ['act', PHASE_MS.capture + PHASE_MS.reason],
      ['verify', PHASE_MS.capture + PHASE_MS.reason + PHASE_MS.act],
      ['settled', AGENT_LOOP_MS],
    ]
    const timers = schedule.map(([key, ms]) => window.setTimeout(() => setPhase(key), ms))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [enabled, screenKey])

  /* Settled and a next frame exists → move on. Settled with nothing next →
     hold, and pick the walk back up the moment the run produces one. */
  useEffect(() => {
    if (!enabled || (phase !== 'settled' && phase !== 'waiting')) return
    if (!hasNext) {
      setPhase('waiting')
      return
    }
    const t = window.setTimeout(() => advance.current(), 240)
    return () => window.clearTimeout(t)
  }, [enabled, phase, hasNext])

  return phase
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

type StreamState = 'pending' | 'streaming' | 'complete'

/**
 * Reveals text a word at a time — the cadence of something being written
 * rather than something being loaded. `pending` shows nothing at all, so a
 * block the agent has not reached yet is absent instead of empty.
 */
function useWordStream(text: string, state: StreamState, durationMs: number) {
  const words = useMemo(() => text.split(' '), [text])
  const reduced = usePrefersReducedMotion()
  const [shownWords, setShownWords] = useState(state === 'complete' ? words.length : 0)

  useEffect(() => {
    if (state === 'complete' || reduced) {
      setShownWords(words.length)
      return
    }
    if (state === 'pending') {
      setShownWords(0)
      return
    }
    setShownWords(0)
    const per = Math.max(28, durationMs / words.length)
    let i = 0
    const t = window.setInterval(() => {
      i += 1
      setShownWords(i)
      if (i >= words.length) window.clearInterval(t)
    }, per)
    return () => window.clearInterval(t)
  }, [state, words, durationMs, reduced])

  const n = Math.min(shownWords, words.length)
  return {
    text: words.slice(0, n).join(' '),
    /* A caret only while there is more to come. */
    typing: state === 'streaming' && n < words.length && !reduced,
    started: state !== 'pending',
  }
}

/** "Tap Upgrade Furnace" → "Tapping Upgrade Furnace" — the action, mid-flight. */
const DOING_VERB: Record<string, string> = {
  Tap: 'Tapping',
  Enter: 'Entering',
  Scroll: 'Scrolling',
  Open: 'Opening',
  Swipe: 'Swiping',
  Close: 'Closing',
  Select: 'Selecting',
  Type: 'Typing',
  Press: 'Pressing',
  Wait: 'Waiting',
}

function doingLabel(action: string): string {
  const [first, ...rest] = action.split(' ')
  const verb = DOING_VERB[first]
  if (verb) return [verb, ...rest].join(' ')
  return `Performing ${action.charAt(0).toLowerCase()}${action.slice(1)}`
}

/** "Observed 5000 ms · dialog appeared" → "5000 ms" for the in-flight label. */
function observeWindow(observed?: string): string {
  const m = observed?.match(/(\d+)\s*ms/)
  return m ? `${m[1]} ms` : 'the result'
}

export function AIAgentSessionView({
  session,
  runName,
  meta,
  instructions,
  initialStep,
  onBack,
  className,
}: AIAgentSessionViewProps) {
  const live = session.status === 'live'
  const reached = session.reached
  const total = session.steps.length
  const last = reached - 1
  const [idx, setIdx] = useState(() => Math.min(initialStep ?? (live ? last : 0), last))
  const [playing, setPlaying] = useState(initialStep === undefined)
  const [following, setFollowing] = useState(live && initialStep === undefined)
  const stripRef = useRef<HTMLDivElement>(null)
  const step = session.steps[idx]
  const tone = PERSONA_TONE[session.persona] ?? 'var(--text-secondary)'
  const durationSec = session.steps[total - 1].atSec + 20

  /* The performance runs only while the reader is on the live edge and has not
     paused. Scrubbing back, or pausing, drops to evidence: every field at once. */
  const loopOn = live && following && playing
  const phase = useAgentLoop({
    enabled: loopOn,
    screenKey: `${session.id}:${idx}`,
    hasNext: idx < last,
    onAdvance: () => setIdx((i) => Math.min(last, i + 1)),
  })

  /* `waiting` is `settled` that has run out of next screen — everything the
     agent produced for this one is final, so it reads the same. */
  const reachedPhase = phase === 'waiting' ? 'settled' : phase
  const at = (key: LoopPhase) => PHASE_ORDER.indexOf(reachedPhase) >= PHASE_ORDER.indexOf(key)
  const stateFor = (key: 'capture' | 'reason'): StreamState =>
    !loopOn ? 'complete' : reachedPhase === key ? 'streaming' : at(key) ? 'complete' : 'pending'

  const saw = useWordStream(step.saw, stateFor('capture'), PHASE_MS.capture)
  const reasoning = useWordStream(step.reasoning, stateFor('reason'), PHASE_MS.reason)
  /* The action is a commitment, not prose: it arrives whole, first in the
     present tense while the agent is doing it, then in the past once done. */
  const doing = loopOn && phase === 'act'
  const actionShown = !loopOn || at('act')
  const observedShown = !loopOn || at('settled')
  const verifying = loopOn && phase === 'verify'

  /* Following live: when a session is opened mid-run the newest screen is the
     one to land on. After that the loop owns the walk. */
  const landed = useRef(false)
  useEffect(() => {
    if (!live || !following || landed.current) return
    landed.current = true
    setIdx(last)
  }, [live, following, last])

  /* Replay for a finished session — or for a live one the reader has scrubbed
     into. Never both: while the loop runs it owns the advance. */
  useEffect(() => {
    if (!playing || loopOn || idx >= last) return
    const t = window.setTimeout(() => setIdx((i) => Math.min(last, i + 1)), PLAY_MS)
    return () => window.clearTimeout(t)
  }, [playing, loopOn, idx, last])

  const select = (i: number) => {
    if (i < 0 || i > last) return
    setIdx(i)
    setFollowing(false)
    setPlaying(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key === 'ArrowLeft') select(idx - 1)
      if (e.key === 'ArrowRight') select(idx + 1)
      if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, last])

  /* Keep the current frame in view in the filmstrip — scrolling only the
     strip, never the page. */
  useEffect(() => {
    const box = stripRef.current
    const el = box?.querySelector<HTMLElement>('[data-active="true"]')
    if (!box || !el) return
    const b = box.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    box.scrollTo({ left: box.scrollLeft + (r.left - b.left) - (b.width - r.width) / 2, behavior: 'smooth' })
  }, [idx])

  const timeLabel = `${formatSessionTime(step.atSec)} / ${live ? formatSessionTime(session.steps[last].atSec) : formatSessionTime(durationSec)}`

  return (
    <div className={['flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      <PageTopbar
        title={`${session.persona} · agent ${session.index + 1}`}
        /* Only the run — the test itself is already the selected row in the
           sidebar, so naming it here says nothing the screen does not. */
        trail={[{ label: runName }]}
        onBack={onBack}
        actions={
          <>
            {live ? (
              <StatusPill bg="var(--bg-tint)" ink="var(--text-brand)">
                <i className="agent-live-dot" aria-hidden />
                Live · screen {reached} of {total}
              </StatusPill>
            ) : (
              <StatusPill bg="var(--bg-subtle)" ink="var(--text-secondary)">Finished · {session.durationLabel}</StatusPill>
            )}
            {live && !following && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setFollowing(true)
                  setPlaying(true)
                  setIdx(last)
                }}
              >
                Jump to live
              </Button>
            )}
          </>
        }
      />

      <div className="flex-1 w-full">
        {/* Wider than the reading measure: the frame is the point of this
            screen, and the panel beside it needs room to breathe. */}
        <div className="flex flex-col gap-m w-full page-measure page-measure-wide mx-auto pt-l pb-xxl3">
          {/* ── The hero: recording and the reading of the current screen ── */}
          <section
            className="flex flex-col w-full rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
          >
            {/* Who is playing, and the two run facts, on one row: identity
                left, facts right. The brief sits under the frame, where it can
                run long without pushing the video down. */}
            <header
              className="flex items-center gap-xl w-full min-w-0 flex-wrap px-xl py-l"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-m shrink-0 min-w-0">
                {/* The tile does two jobs: its fill is the persona (the same
                    colour that persona carries everywhere), and its glyph says
                    the player is an agent, not a person. A human silhouette
                    here read as a tester. */}
                <span
                  className="flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-xl text-white"
                  style={{ backgroundColor: tone }}
                  aria-hidden
                >
                  <AIPlayerIcon size={24} />
                </span>
                <div className="flex flex-col gap-xxxs min-w-0">
                  <span className="flex items-center gap-s font-display text-m font-semibold text-text-primary leading-[1.35]">
                    {session.persona} · agent {session.index + 1} of {meta.agents}
                    {live && (
                      <span
                        className="inline-flex items-center gap-xxs px-xs py-xxxs rounded-round font-body text-xs font-semibold"
                        style={{ backgroundColor: 'var(--bg-tint)', color: 'var(--text-brand)' }}
                      >
                        <i className="agent-live-dot" aria-hidden />
                        AI playing now
                      </span>
                    )}
                  </span>
                  <span className="font-body text-s text-text-tertiary leading-[1.5]">{session.personaDetail}</span>
                </div>
              </div>
              <span className="flex-1" />
              <RunFacts
                className="w-auto shrink-0 gap-x-xxl"
                facts={[
                  { label: 'Build', value: meta.build },
                  { label: 'Session length', value: meta.lengthLabel },
                ]}
              />
            </header>

            <div className="agent-session-layout w-full">
              {/* The recording */}
              <div className="flex flex-col min-w-0">
                <div
                  className="agent-frame relative w-full overflow-hidden"
                  style={{ aspectRatio: '16 / 9', background: step.scene, transition: 'background 300ms ease' }}
                >
                  {/* The frame reacts to the beat it is in: a sweep while the
                      agent reads the screen, a tap ripple where it touches. */}
                  {loopOn && phase === 'capture' && <span className="agent-scan" aria-hidden />}
                  {loopOn && (phase === 'act' || phase === 'verify') && (
                    <span
                      className="agent-tap"
                      style={{ left: `${32 + ((idx * 17) % 40)}%`, top: `${38 + ((idx * 29) % 34)}%` }}
                      aria-hidden
                    />
                  )}

                  {live ? (
                    /* The one place a reader must not mistake a recording for a
                       replay: the frame itself says an AI is playing it now. */
                    <span
                      className="absolute left-m top-s inline-flex items-center gap-xs px-s py-xxs rounded-round font-display text-xs font-semibold uppercase tracking-[0.08em] text-white"
                      style={{ backgroundColor: 'rgba(15,27,51,0.72)' }}
                    >
                      <i className="agent-live-dot" style={{ color: 'var(--error)' }} aria-hidden />
                      AI playing · live
                    </span>
                  ) : (
                    <span className="absolute left-m top-s flex gap-xs" aria-hidden>
                      <i className="block w-[54px] h-[12px] rounded-xs" style={{ backgroundColor: 'rgba(255,220,130,0.5)' }} />
                      <i className="block w-[36px] h-[12px] rounded-xs" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
                      <i className="block w-[36px] h-[12px] rounded-xs" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
                    </span>
                  )}
                  <span
                    className="absolute right-m top-s px-xs py-xxxs rounded-s font-code text-xs text-white"
                    style={{ backgroundColor: 'rgba(15,27,51,0.72)' }}
                  >
                    {formatSessionTime(step.atSec)}
                  </span>

                  {/* The caption is the action, and it fills in when the agent
                      commits to one — so the reader is never shown the move
                      before the agent has made it. */}
                  <span
                    className="absolute left-0 right-0 bottom-0 flex items-center gap-xs px-l py-m font-display text-s font-semibold text-white leading-[1.5]"
                    style={{ background: 'linear-gradient(180deg, transparent, rgba(15,27,51,0.8))' }}
                  >
                    {actionShown ? (
                      doing ? (
                        <>
                          <span className="agent-spinner-on-dark shrink-0" aria-hidden />
                          {doingLabel(step.action)}…
                        </>
                      ) : (
                        step.action
                      )
                    ) : (
                      <span style={{ opacity: 0.75 }}>{step.screen}</span>
                    )}
                  </span>

                  <span className="agent-frame-nav absolute inset-0 flex items-center justify-between px-s pointer-events-none">
                    <FrameNav label="Previous screen" onClick={() => select(idx - 1)} disabled={idx === 0}>
                      <ChevronIcon size={20} direction="left" />
                    </FrameNav>
                    <FrameNav label="Next screen" onClick={() => select(idx + 1)} disabled={idx >= last}>
                      <ChevronIcon size={20} direction="right" />
                    </FrameNav>
                  </span>
                </div>

                {/* Transport, then the filmstrip: the same timeline twice — once
                    as a bar to scrub, once as frames to read. */}
                <div
                  className="flex items-center gap-s px-m h-[56px]"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    aria-label={playing ? (loopOn ? 'Pause the live walkthrough' : 'Pause') : 'Play'}
                    className="flex items-center justify-center shrink-0 w-[32px] h-[32px] rounded-round text-white"
                    style={{ backgroundColor: 'var(--brand)' }}
                  >
                    {playing ? <PauseGlyph /> : <PlayIcon size={14} />}
                  </button>
                  <span className="font-code text-xs text-text-secondary whitespace-nowrap min-w-[92px]">{timeLabel}</span>
                  <div
                    role="slider"
                    aria-label="Session position"
                    aria-valuemin={0}
                    aria-valuemax={total - 1}
                    aria-valuenow={idx}
                    tabIndex={0}
                    className="relative flex-1 h-[6px] rounded-round cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect()
                      const f = (e.clientX - r.left) / r.width
                      select(Math.min(last, Math.max(0, Math.floor(f * total))))
                    }}
                  >
                    <i
                      className="absolute left-0 top-0 h-full rounded-round"
                      style={{ width: `${((idx + 1) / total) * 100}%`, backgroundColor: 'var(--brand)', transition: 'width 300ms ease' }}
                    />
                  </div>
                  {/* One convention for the count, the same one the topbar
                      uses. While live the frames past `reached` are dimmed in
                      the strip, so "of 12" needs no caveat. */}
                  <span className="font-body text-xs text-text-tertiary whitespace-nowrap">
                    Screen {idx + 1} of {total}
                  </span>
                </div>

                <div ref={stripRef} className="agent-filmstrip flex gap-xs overflow-x-auto px-m pb-m" aria-label="Frames">
                  {session.steps.map((s, i) => {
                    const future = i >= reached
                    const active = i === idx
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={future}
                        data-active={active}
                        onClick={() => select(i)}
                        aria-label={`Screen ${i + 1}, ${s.screen}`}
                        title={s.screen}
                        className="relative shrink-0 w-[104px] h-[62px] rounded-m overflow-hidden"
                        style={{
                          background: s.scene,
                          opacity: future ? 0.3 : active ? 1 : 0.72,
                          outline: active ? '2px solid var(--brand)' : '2px solid transparent',
                          outlineOffset: -2,
                          cursor: future ? 'default' : 'pointer',
                        }}
                      >
                        <span
                          className="absolute left-xxs bottom-xxs px-xxs rounded-xs font-code text-2xs text-white"
                          style={{ backgroundColor: 'rgba(15,27,51,0.6)' }}
                        >
                          {formatSessionTime(s.atSec)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* The reading of this screen: which screen, then what the agent
                  saw, why it decided, and what it did. While live these arrive
                  one beat at a time — see the loop above. */}
              <aside
                className="agent-screen-panel flex flex-col min-w-0"
                aria-label="Analysis of the current screen"
                aria-live="polite"
              >
                <div className="flex flex-col gap-m px-l py-l flex-1">
                  <div className="flex flex-col gap-xs">
                    <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                      Screen {idx + 1} · {formatSessionTime(step.atSec)}
                    </span>
                    <h2 className="font-display text-l font-semibold text-text-primary leading-[1.25] tracking-[-0.01em] m-0">
                      {step.screen}
                    </h2>
                    {/* The loop, named: four beats, the live one lit. It is what
                        turns a filling panel into something legible. */}
                    {loopOn && <LoopStepper phase={phase} />}
                  </div>

                  {saw.started && (
                    <Reading label="Saw">
                      {saw.text}
                      {saw.typing && <Caret />}
                    </Reading>
                  )}

                  {reasoning.started && (
                    <div
                      className="flex flex-col gap-xxxs rounded-xl px-m py-s"
                      style={{ backgroundColor: 'var(--bg-page-pale)', borderLeft: '3px solid var(--border-default)' }}
                    >
                      <span className="flex items-center gap-xs font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                        Reasoning
                        {reasoning.typing && (
                          <span className="font-body text-2xs font-normal normal-case tracking-normal text-text-brand">
                            thinking…
                          </span>
                        )}
                      </span>
                      <span className="font-body text-s text-text-primary leading-[1.6]">
                        “{reasoning.text}
                        {reasoning.typing && <Caret />}
                        {!reasoning.typing && '”'}
                      </span>
                    </div>
                  )}

                  {actionShown && (
                    <div className="flex flex-col gap-xxs">
                      <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                        {doing ? 'Doing' : 'Did'}
                      </span>
                      <span
                        className="inline-flex items-start gap-xs font-display text-m font-semibold leading-[1.4]"
                        style={{ color: doing ? 'var(--text-brand)' : 'var(--text-primary)' }}
                      >
                        {doing ? (
                          <span className="testing-spinner-sm shrink-0 mt-[3px]" aria-hidden />
                        ) : (
                          <span className="text-text-tertiary shrink-0" aria-hidden>→</span>
                        )}
                        {doing ? `${doingLabel(step.action)}…` : step.action}
                      </span>

                      {/* The beat that makes it an agent and not a macro: it
                          waits, and then says what its action produced. */}
                      {verifying && (
                        <span className="inline-flex items-center gap-xxs font-body text-xs text-text-secondary leading-[1.5]">
                          <span className="testing-spinner-sm shrink-0" aria-hidden />
                          Observing {observeWindow(step.observed)} for the result…
                        </span>
                      )}
                      {observedShown && step.observed && (
                        <span
                          className="agent-observed inline-flex items-center gap-xxs font-body text-xs font-medium leading-[1.5]"
                          style={{ color: 'var(--success)' }}
                        >
                          <CheckIcon size={12} />
                          {step.observed}
                        </span>
                      )}
                    </div>
                  )}

                  {phase === 'waiting' && loopOn && (
                    /* Two different waits, and conflating them would mislead: the
                       run has not captured the next screen yet, or this agent has
                       no next screen to capture. */
                    <span className="inline-flex items-center gap-xs font-body text-xs text-text-tertiary leading-[1.5]">
                      {idx < total - 1 ? (
                        <>
                          <span className="testing-spinner-sm shrink-0" aria-hidden />
                          Agent is playing — the next screen lands here as it happens.
                        </>
                      ) : (
                        'Caught up: this is the last screen 6labs has captured for this agent.'
                      )}
                    </span>
                  )}
                </div>

                {/* Same 56px as the transport beside it, so the two rows read
                    as one bar across the card. Two buttons and nothing else:
                    a 380px column has room for exactly that, and "an AI is
                    playing" is already said three times above — topbar status,
                    header pill, and the badge on the frame. */}
                <div
                  className="flex items-center justify-between gap-xs px-l h-[56px]"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<ChevronIcon size={16} direction="left" />}
                    onClick={() => select(idx - 1)}
                    disabled={idx === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    rightIcon={<ChevronIcon size={16} direction="right" />}
                    onClick={() => select(idx + 1)}
                    disabled={idx >= last}
                  >
                    Next screen
                  </Button>
                </div>
              </aside>
            </div>

            {instructions && (
              /* The brief, quoted, at the foot of the card: it can run to a
                 paragraph without moving the frame. */
              <blockquote
                className="flex flex-col gap-xxs w-full min-w-0 m-0 px-xl py-m"
                style={{ backgroundColor: 'var(--bg-tint-light)', borderTop: '1px solid var(--border-subtle)' }}
              >
                <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                  Instructions to the players
                </span>
                <p className="font-body text-s text-text-secondary leading-[1.6] m-0 max-w-[110ch]">“{instructions}”</p>
              </blockquote>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

/* ── Bits ───────────────────────────────────────────────────────────────── */

/** Observe → Reason → Act → Verify, with the beat in flight lit. */
function LoopStepper({ phase }: { phase: LoopPhase }) {
  const current = PHASE_ORDER.indexOf(phase === 'waiting' ? 'settled' : phase)
  return (
    <div className="flex items-center gap-xxs pt-xxs" role="list" aria-label="Agent loop">
      {PHASES.map((p, i) => {
        const done = current > i
        const active = current === i
        return (
          <span
            key={p.key}
            role="listitem"
            aria-current={active || undefined}
            className={[
              'inline-flex items-center gap-xxxs px-xs py-xxxs rounded-round font-display text-2xs font-semibold whitespace-nowrap',
              active ? 'agent-phase-live' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              backgroundColor: active ? 'var(--bg-tint)' : done ? 'var(--success-bg)' : 'var(--bg-subtle)',
              color: active ? 'var(--text-brand)' : done ? 'var(--success)' : 'var(--text-placeholder)',
            }}
          >
            {done ? <CheckIcon size={12} /> : <i className="w-[5px] h-[5px] rounded-round" style={{ backgroundColor: 'currentColor' }} aria-hidden />}
            {p.label}
          </span>
        )
      })}
    </div>
  )
}

/** Blinking block at the end of text still being written. */
function Caret() {
  return <i className="agent-caret" aria-hidden />
}

function Reading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-xxxs">
      <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">{label}</span>
      <span className="font-body text-s text-text-secondary leading-[1.6]">{children}</span>
    </div>
  )
}

function FrameNav({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="pointer-events-auto flex items-center justify-center w-[36px] h-[36px] rounded-round text-white disabled:opacity-30"
      style={{ backgroundColor: 'rgba(15,27,51,0.55)' }}
    >
      {children}
    </button>
  )
}

function PauseGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <rect x="2" y="1.5" width="3.5" height="11" rx="1" />
      <rect x="8.5" y="1.5" width="3.5" height="11" rx="1" />
    </svg>
  )
}

function StatusPill({ bg, ink, children }: { bg: string; ink: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-xs px-s py-xxs rounded-round font-body text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: bg, color: ink }}
    >
      {children}
    </span>
  )
}
