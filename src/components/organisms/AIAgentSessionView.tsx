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
 * A live session is the same screen with fewer rows: screens the agent has
 * not reached yet are not listed, and the cursor rides the newest screen
 * until the reader takes it.
 *
 * Code-first prototype — from the PM artifact (screen s48), no Figma source yet.
 */

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { RunFacts } from '../molecules/RunFacts'
import Button from '../ui/Button'
import { PlayIcon } from '../icons/PlayIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import { CheckIcon } from '../icons/CheckIcon'
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

const PLAY_MS = 1800

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

  /* Following live: the cursor rides the newest screen as the run reaches it. */
  useEffect(() => {
    if (live && following) setIdx(last)
  }, [live, following, last])

  /* Playback — walks the reached screens; a finished session stops at the end,
     a live one parks on the newest screen and waits for the next. */
  useEffect(() => {
    if (!playing || idx >= last) return
    const t = window.setTimeout(() => setIdx((i) => Math.min(last, i + 1)), PLAY_MS)
    return () => window.clearTimeout(t)
  }, [playing, idx, last])

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
        backLabel={runName}
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
                <span
                  className="flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-xl text-white"
                  style={{ backgroundColor: tone }}
                  aria-hidden
                >
                  <PersonaGlyph />
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
                  <span
                    className="absolute left-0 right-0 bottom-0 px-l py-m font-display text-s font-semibold text-white leading-[1.5]"
                    style={{ background: 'linear-gradient(180deg, transparent, rgba(15,27,51,0.8))' }}
                  >
                    {step.action}
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
                    aria-label={playing ? 'Pause' : 'Play'}
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
                  <span className="font-body text-xs text-text-tertiary whitespace-nowrap">
                    Screen {idx + 1} of {live ? `${reached} · ${total} planned` : total}
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

              {/* The reading of this screen, in the order the agent lived it:
                  what it saw (plain), why it decided (its own voice, set apart
                  on a pale ground), what it did (bold — the one line the eye
                  lands on) and what that produced (green, small). Three
                  weights, so a reader can scan straight to any one of them. */}
              <aside
                className="agent-screen-panel flex flex-col min-w-0"
                aria-label="Analysis of the current screen"
                aria-live="polite"
              >
                <div className="flex flex-col gap-m px-l py-l flex-1">
                  <div className="flex flex-col gap-xxs">
                    <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                      Screen {idx + 1} · {formatSessionTime(step.atSec)}
                    </span>
                    <h2 className="font-display text-l font-semibold text-text-primary leading-[1.25] tracking-[-0.01em] m-0">
                      {step.screen}
                    </h2>
                  </div>

                  <Reading label="Saw">{step.saw}</Reading>

                  <div
                    className="flex flex-col gap-xxxs rounded-xl px-m py-s"
                    style={{ backgroundColor: 'var(--bg-page-pale)', borderLeft: '3px solid var(--border-default)' }}
                  >
                    <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                      Reasoning
                    </span>
                    <span className="font-body text-s text-text-primary leading-[1.6]">“{step.reasoning}”</span>
                  </div>

                  <div className="flex flex-col gap-xxs">
                    <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                      Did
                    </span>
                    <span className="inline-flex items-start gap-xs font-display text-m font-semibold text-text-primary leading-[1.4]">
                      <span className="text-text-tertiary shrink-0" aria-hidden>→</span>
                      {step.action}
                    </span>
                    {step.observed && (
                      <span className="inline-flex items-center gap-xxs font-body text-xs font-medium leading-[1.5]" style={{ color: 'var(--success)' }}>
                        <CheckIcon size={12} />
                        {step.observed}
                      </span>
                    )}
                  </div>

                </div>

                {/* Same 56px as the transport beside it, so the two rows read
                    as one bar across the card. */}
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
                  {live && (
                    <span className="inline-flex items-center gap-xxs font-body text-xs text-text-tertiary whitespace-nowrap">
                      <span className="testing-spinner-sm shrink-0" aria-hidden />
                      Playing screen {reached + 1}…
                    </span>
                  )}
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

function PersonaGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
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
