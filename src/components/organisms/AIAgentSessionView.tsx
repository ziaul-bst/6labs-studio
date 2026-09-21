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
 * Live and finished sessions read identically. An earlier version ran the
 * agent's loop in front of the reader — Observe, Reason, Act, Verify, with the
 * reasoning typing itself in — which was a good picture of an agent working and
 * a bad picture of this product: there is no live data stream behind it. The
 * screens arrive already analysed, so the panel shows what was analysed. A live
 * session is simply one with fewer screens in it so far.
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
import { AIBehaviouralIcon } from '../icons/AIBehaviouralIcon'
import { IssueKindTag } from '../atoms/IssueKindTag'
import { RecordingWell } from '../atoms/RecordingWell'
import { applySessionTextState, useSessionTextDemoState } from '../../lib/sessionTextDemoState'
import { SessionViewerSkeleton } from '../molecules/TestingSkeletons'
import { usePageLoading } from '../../lib/pageLoading'
import { PERSONA_TONE, formatSessionTime } from '../../lib/mocks/testing'
import { useRecordingDemoState } from '../../lib/recordingDemoState'
import type { AgentSession, AIBehaviouralRunMeta } from '../../lib/types/testing'
import type { IssueKind } from '../../lib/types/userTest'

/**
 * One of the run's findings, as it appears on the session that produced it —
 * the run's own issue, plus the screen in *this* session it was flagged on.
 */
export interface SessionFinding {
  id: string
  title: string
  kind: IssueKind
  /** Screen index in this session's own steps. */
  stepIndex: number
}

export interface AIAgentSessionViewProps {
  session: AgentSession
  runName: string
  meta: AIBehaviouralRunMeta
  /** The players' brief for this run, if one was given. */
  instructions?: string
  /** Screen to land on — a clip in the report arrives here. */
  initialStep?: number
  /**
   * What the run concluded from this session, for the video report under the
   * brief. Empty is a real answer — a session that flagged nothing.
   */
  findings?: SessionFinding[]
  onBack: () => void
  className?: string
}

/** Replay pace when the reader steps through a session. */
const PLAY_MS = 1800

/**
 * How long one screen takes the run to produce. The behavioural run advances on
 * this clock (see AIBehaviouralTestView), so the session a reader opens has as
 * many screens as the run's own progress claims.
 */
export const AGENT_LOOP_MS = 6000

export function AIAgentSessionView({
  session: sessionProp,
  runName,
  meta,
  instructions,
  initialStep,
  findings = [],
  onBack,
  className,
}: AIAgentSessionViewProps) {
  /* Review chrome: the dock can rewrite every screen's account in its long
     form, so the reading column can be looked at under the load it actually
     has to carry. Identity at 'standard'. */
  const textState = useSessionTextDemoState()
  const session = useMemo(
    () => ({ ...sessionProp, steps: applySessionTextState(sessionProp.steps, textState) }),
    [sessionProp, textState],
  )
  const live = session.status === 'live'
  const reached = session.reached
  const total = session.steps.length
  const last = reached - 1
  const demoOrientation = useRecordingDemoState()
  const [idx, setIdx] = useState(() => Math.min(initialStep ?? (live ? last : 0), last))
  const [playing, setPlaying] = useState(initialStep === undefined)
  const stripRef = useRef<HTMLDivElement>(null)
  const step = session.steps[idx]
  const tone = PERSONA_TONE[session.persona] ?? 'var(--text-secondary)'
  const durationSec = session.steps[total - 1].atSec + 20
  /* Portrait unless the session says otherwise — every 6labs recording is a
     phone capture. It sets the split as well as the well: see the layout rule
     in globals.css. The fixtures leave it unset so a reviewer can put the
     whole screen into either shape from the dock. */
  const orientation = session.orientation ?? demoOrientation
  /* This screen's own beat, keyed on the session — stepping into a different
     agent is a different fetch. It sits with the other hooks, above every
     early return, so a session that resolves does not change the hook count. */
  const loadPhase = usePageLoading(session.id)

  /* Opened mid-run, a live session lands on the newest screen 6labs has
     captured — the rest of the walk is the reader's. */
  const landed = useRef(false)
  useEffect(() => {
    if (!live || initialStep !== undefined || landed.current) return
    landed.current = true
    setIdx(last)
  }, [live, initialStep, last])

  /* Replay — the same walk for a live session and a finished one. */
  useEffect(() => {
    if (!playing || idx >= last) return
    const t = window.setTimeout(() => setIdx((i) => Math.min(last, i + 1)), PLAY_MS)
    return () => window.clearTimeout(t)
  }, [playing, idx, last])

  const select = (i: number) => {
    if (i < 0 || i > last) return
    setIdx(i)
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

  /* Built once and handed to both the skeleton and the viewer. The bar is the
     way back to the run and it is known the instant a session card is clicked,
     so it is never drawn as grey bars — see TestingSkeletons. */
  const topbar = (
    <PageTopbar
      title={`${session.persona} · agent ${session.index + 1}`}
      /* Only the run — the test itself is already the selected row in the
         sidebar, so naming it here says nothing the screen does not. */
      trail={[{ label: runName }]}
      onBack={onBack}
      /* A badge only while the state is still moving. "Finished" on a session
         whose transport reads "Screen 14 of 14" and whose facts carry its full
         length was a pill restating the page — and a badge that is present on
         every screen stops being read at all, which is the one thing the live
         one cannot afford. */
      actions={
        live ? (
          <StatusPill bg="var(--bg-tint)" ink="var(--text-brand)">
            <i className="agent-live-dot" aria-hidden />
            Live
          </StatusPill>
        ) : undefined
      }
    />
  )

  if (loadPhase)
    return (
      <SessionViewerSkeleton
        topbar={topbar}
        label={`Loading ${session.persona} · agent ${session.index + 1}`}
        className={className}
      />
    )

  return (
    <div className={['flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      {topbar}

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
                    colour that persona carries everywhere), and its glyph is
                    the test's own — the same AI behavioural mark the sidebar
                    and the run header use, so a session is visibly part of that
                    test rather than of a generic "AI player" family. */}
                <span
                  className="flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-xl text-white"
                  style={{ backgroundColor: tone }}
                  aria-hidden
                >
                  <AIBehaviouralIcon size={24} />
                </span>
                <div className="flex flex-col gap-xxxs min-w-0">
                  {/* No "AI playing now" tag. The status pill in the bar says
                      Live, the video carries its own LIVE badge, and a third
                      copy beside the name was the one that had to compete with
                      the name itself. */}
                  <span className="font-display text-m font-semibold text-text-primary leading-[1.35]">
                    {session.persona} · agent {session.index + 1} of {meta.agents}
                  </span>
                  <span className="font-body text-s text-text-tertiary leading-[1.5]">{session.personaDetail}</span>
                </div>
              </div>
              <span className="flex-1" />
              {/* A session still playing has not got a length yet — printing
                  the run's planned 30 min against a video eight minutes in
                  states a finished fact about an unfinished session. While it
                  plays this counts up with it and says so. */}
              <RunFacts
                /* Not shrink-0: it has to be able to compress before the fold
                   inside it can engage. */
                className="w-auto min-w-0 gap-x-xxl"
                facts={[
                  { label: 'Build', value: meta.build },
                  live
                    ? { label: 'Playing for', value: session.durationLabel }
                    : { label: 'Session length', value: session.durationLabel },
                ]}
              />
            </header>

            <div className="agent-session-layout w-full" data-media={orientation}>
              {/* The recording */}
              <div className="flex flex-col min-w-0">
                <RecordingWell
                  className="agent-frame"
                  scene={step.scene}
                  orientation={orientation}
                  /* Said as a fact about 6labs, not about the agent: the agent
                     is not stuck, the capture is behind. */
                  pendingLabel="Waiting for the frame. 6labs has the agent on this screen, not the picture of it yet."
                  /* The HUD stand-in belongs to the game, so it is clipped to
                     the footage — on a portrait clip it would otherwise float
                     out over the ambience and read as 6labs' own chrome. */
                  pane={
                    !live && (
                      <span className="absolute left-s top-s flex gap-xs" aria-hidden>
                        <i className="block w-[38px] h-[10px] rounded-xs" style={{ backgroundColor: 'rgba(255,220,130,0.5)' }} />
                        <i className="block w-[24px] h-[10px] rounded-xs" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
                        <i className="block w-[24px] h-[10px] rounded-xs" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
                      </span>
                    )
                  }
                >
                  {live && (
                    /* The one place a reader must not mistake a recording for a
                       replay: the frame itself says an AI is playing it now. */
                    <span
                      className="absolute left-m top-s inline-flex items-center gap-xs px-s py-xxs rounded-round font-display text-xs font-semibold uppercase tracking-[0.08em] text-white"
                      style={{ backgroundColor: 'rgba(15,27,51,0.72)' }}
                    >
                      <i className="agent-live-dot" style={{ color: 'var(--error)' }} aria-hidden />
                      AI playing · live
                    </span>
                  )}
                  <span
                    className="absolute right-m top-s px-xs py-xxxs rounded-s font-code text-xs text-white"
                    style={{ backgroundColor: 'rgba(15,27,51,0.72)' }}
                  >
                    {formatSessionTime(step.atSec)}
                  </span>

                  {/* The caption is what the agent did on this screen. Two
                      lines and no more: an action can arrive as a sentence
                      ("Blocked by the account creation screen — please handle
                      the login to continue"), and a caption that grows eats
                      the frame it is captioning. The whole of it is in the
                      panel's Did row, where it has room. */}
                  <span
                    title={step.action}
                    className="absolute left-0 right-0 bottom-0 flex items-center gap-xs px-l pt-xxl pb-m font-display text-s font-semibold text-white leading-[1.5]"
                    style={{ background: 'linear-gradient(180deg, transparent, rgba(15,27,51,0.85))' }}
                  >
                    <span className="line-clamp-2 wrap-anywhere">{step.action}</span>
                  </span>

                  <span className="agent-frame-nav absolute inset-0 flex items-center justify-between px-s pointer-events-none">
                    <FrameNav label="Previous screen" onClick={() => select(idx - 1)} disabled={idx === 0}>
                      <ChevronIcon size={20} direction="left" />
                    </FrameNav>
                    <FrameNav label="Next screen" onClick={() => select(idx + 1)} disabled={idx >= last}>
                      <ChevronIcon size={20} direction="right" />
                    </FrameNav>
                  </span>
                </RecordingWell>

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
                        /* The strip keeps ONE thumbnail shape whatever the
                           footage is — it is read as a row of positions in a
                           timeline, and a row of differently-shaped tiles does
                           not read as a row. The shape inside it is the well's
                           problem, and the well already solves it. */
                        className="relative shrink-0 w-[104px] h-[62px] rounded-m overflow-hidden"
                        style={{
                          opacity: future ? 0.3 : active ? 1 : 0.72,
                          outline: active ? '2px solid var(--brand)' : '2px solid transparent',
                          outlineOffset: -2,
                          cursor: future ? 'default' : 'pointer',
                        }}
                      >
                        <RecordingWell scene={s.scene} orientation={orientation} compact fill />
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
              <aside className="agent-screen-panel flex flex-col min-w-0" aria-label="Analysis of the current screen">
                {/* The live region is this one line, not the whole panel. With
                    aria-live on the panel, one press of the right-arrow queued
                    the screen name, the observation, the full reasoning, the
                    action, the observed line AND the payload label for
                    announcement — a reader stepping through six screens was
                    buried. What changes and is worth saying is WHICH screen you
                    are on; the reading itself is there to be read. */}
                <span className="sr-only" aria-live="polite">
                  Screen {idx + 1} of {total}. {step.screen}.
                </span>
                {/* The reading scrolls inside the panel rather than growing it.
                    A screen where the agent loaded a skill file, or reasoned
                    for two thousand characters about a login wall, is not rare
                    — and a panel that grows to fit one takes the frame it is
                    explaining off the top of the window, which is the one
                    thing this screen exists to keep side by side. */}
                <div
                  className="agent-screen-scroll flyout-scrollbar flex flex-col gap-m px-l py-l flex-1 min-h-0"
                  tabIndex={0}
                >
                  <div className="flex flex-col gap-xs">
                    <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                      Screen {idx + 1} · {formatSessionTime(step.atSec)}
                    </span>
                    {/* A screen name comes from the game's own vocabulary and
                        can arrive as a path with no spaces in it. */}
                    <h2 className="font-display text-l font-semibold text-text-primary leading-[1.25] tracking-[-0.01em] m-0 wrap-anywhere">
                      {step.screen}
                    </h2>
                  </div>

                  {/* Keyed on the screen so stepping through a session always
                      lands on the folded default — an opened block is a
                      decision about THIS screen, not a mode. */}
                  <Reading key={`saw-${idx}`} label="Saw">
                    {step.saw}
                  </Reading>

                  <div
                    className="flex flex-col gap-xxxs rounded-xl px-m py-s min-w-0"
                    style={{ backgroundColor: 'var(--bg-page-pale)', borderLeft: '3px solid var(--border-default)' }}
                  >
                    <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                      Reasoning
                    </span>
                    {/* Four lines, and the number is a budget rather than a
                        taste: Saw, Reasoning and Did have to fit the panel
                        together, unopened, or the fold is pointless — a reader
                        who has to scroll past the reasoning to find out what
                        the agent actually DID has been given the long version
                        whether they wanted it or not. Three for Saw and three
                        here leaves Did — the whole block, action and observed
                        line included — above the fold on a laptop, and each
                        opens on its own with one click.

                        Folding is per screen — step to the next one and it is
                        folded again, because the default is skim. */}
                    <ExpandableText key={`reasoning-${idx}`} lines={3} moreLabel="Show the full reasoning">
                      <span className="font-body text-s text-text-primary leading-[1.6] wrap-anywhere">
                        “{step.reasoning}”
                      </span>
                    </ExpandableText>
                  </div>

                  <div className="flex flex-col gap-xxs min-w-0">
                    <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                      Did
                    </span>
                    <span className="flex items-start gap-xs font-display text-m font-semibold text-text-primary leading-[1.4] min-w-0">
                      <span className="text-text-tertiary shrink-0" aria-hidden>→</span>
                      <span className="min-w-0 wrap-anywhere">{step.action}</span>
                    </span>
                    {step.observed && (
                      <span
                        className="flex items-start gap-xxs font-body text-xs font-medium leading-[1.5] min-w-0"
                        style={{ color: 'var(--success)' }}
                      >
                        <span className="shrink-0 mt-[2px]">
                          <CheckIcon size={12} />
                        </span>
                        <span className="min-w-0 wrap-anywhere">{step.observed}</span>
                      </span>
                    )}

                    {/* What the action carried, when it carried anything — the
                        skill file a player loaded, a prompt, a response. It is
                        evidence rather than reading: thousands of monospaced
                        characters that answer "what exactly did it load", a
                        question nobody asks until they doubt the line above.
                        So it is shut, it says how much is inside, and opened it
                        gets a box of its own to scroll in rather than pushing
                        the rest of the screen's reading out of the panel. */}
                    {step.payload && (
                      <details key={`payload-${idx}`} className="agent-payload">
                        <summary className="agent-payload-summary">
                          <ChevronIcon size={12} direction="right" />
                          <span className="min-w-0 wrap-anywhere">{step.payload.label}</span>
                          <span className="agent-payload-size">
                            {formatChars(step.payload.body.length)}
                          </span>
                        </summary>
                        <pre className="agent-payload-body flyout-scrollbar">{step.payload.body}</pre>
                      </details>
                    )}
                  </div>

                  {/* A live session simply has fewer screens so far — said once,
                      at the end of what has been captured, rather than as a
                      running commentary. */}
                  {live && idx === last && (
                    <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                      This is the last screen 6labs has captured for this agent.
                    </span>
                  )}
                </div>

                {/* Same 56px as the transport beside it, so the two rows read
                    as one bar across the card. Two buttons and nothing else:
                    a 380px column has room for exactly that, and "an AI is
                    playing" is already said three times above — topbar status,
                    header pill, and the badge on the frame. */}
                <div
                  className="agent-screen-actions flex items-center justify-between gap-xs px-l h-[56px]"
                  style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elements)' }}
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
                {/* `pre-line` because the brief is written in a textarea: an
                    author who numbered three instructions gets three lines
                    back, not one run-on paragraph. */}
                <p className="font-body text-s text-text-secondary leading-[1.6] m-0 max-w-[92ch] whitespace-pre-line wrap-anywhere">
                  “{instructions}”
                </p>
              </blockquote>
            )}

            {/* ── Video report ──
                What this one session produced, under the brief it was given —
                the brief says what was asked of the agent, and this says what
                came back. It belongs on the session and not only in the run
                report: a reader who opened one recording to check a finding
                should not have to go back up a level to see what else that same
                recording turned up.

                Only once the session is finished. A run still playing has
                nothing to report about a session that has not ended, and a
                half-written report is worse than a stated wait. */}
            {!live && (
              <section
                className="flex flex-col gap-s w-full min-w-0 px-xl py-l"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
                aria-label="Video report"
              >
                <div className="flex flex-wrap items-baseline gap-s">
                  <h3 className="font-display text-m font-semibold text-text-primary leading-[1.4] m-0">
                    Video report
                  </h3>
                  <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                    {total} screens analysed · {session.durationLabel}
                    {findings.length > 0
                      ? ` · ${findings.length} finding${findings.length === 1 ? '' : 's'} from this session`
                      : ''}
                  </span>
                </div>

                {findings.length === 0 ? (
                  /* A clean session is a result, not an absence — it is the
                     outcome this run most wants to be able to report. */
                  <p className="font-body text-s text-text-secondary leading-[1.7] m-0 max-w-[92ch]">
                    Nothing was flagged in this session. The agent played all {total} screens without
                    hitting anything the run reported.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-xxs w-full m-0 p-0" style={{ listStyle: 'none' }}>
                    {findings.map((f) => (
                      <li key={f.id}>
                        {/* Each row jumps to the screen it was flagged on — the
                            frame is already on this page, so the finding should
                            not need the run report to be checked. */}
                        <button
                          type="button"
                          onClick={() => select(f.stepIndex)}
                          className="session-finding-row flex items-start gap-s w-full text-left rounded-m px-s py-xs"
                        >
                          <span
                            className="shrink-0 w-[3px] self-stretch rounded-round"
                            style={{ backgroundColor: f.kind === 'bug' ? 'var(--error)' : 'var(--warning)' }}
                            aria-hidden
                          />
                          <span className="flex flex-col gap-xxxs min-w-0 flex-1">
                            {/* A finding title can carry a selector or a path;
                                min-w-0 lets this column shrink below its
                                min-content width, so it needs the break rule
                                to go with it or it runs under the tag. */}
                            <span className="font-body text-s font-medium text-text-primary leading-[1.5] wrap-anywhere">
                              {f.title}
                            </span>
                            <span className="font-body text-xs text-text-tertiary leading-[1.5] wrap-anywhere">
                              Screen {f.stepIndex + 1} · {session.steps[f.stepIndex]?.screen ?? '—'}
                            </span>
                          </span>
                          <IssueKindTag kind={f.kind} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

/* ── Bits ───────────────────────────────────────────────────────────────── */

function Reading({ label, lines = 3, children }: { label: string; lines?: number; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-xxxs min-w-0">
      <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">{label}</span>
      {/* An observation quotes the screen, and a screen can be a wall of rules
          text — folded, opened with one click. See the fold budget on the
          Reasoning block for why it is three lines and not six. */}
      <ExpandableText lines={lines} moreLabel="Show everything the agent saw">
        <span className="font-body text-s text-text-secondary leading-[1.6] wrap-anywhere">{children}</span>
      </ExpandableText>
    </div>
  )
}

/**
 * Prose that folds at N lines and opens on request — with the control shown
 * only when there is something folded.
 *
 * It measures rather than counts characters: the same sentence folds at a
 * different point in a 380px column and a 700px one, and the panel is both
 * depending on which way the recording is shaped. Measuring also means the
 * control is honest — a "Show more" that opens two extra words is a worse
 * offer than no control at all.
 */
function ExpandableText({
  children,
  lines,
  moreLabel,
}: {
  children: ReactNode
  lines: number
  moreLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [clipped, setClipped] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const measure = () => setClipped(el.scrollHeight - el.clientHeight > 2)
    measure()
    /* The column changes width with the recording's shape and with the
       window, so the answer is re-measured rather than decided once. */
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children, open])

  return (
    <div className="flex flex-col items-start gap-xxxs min-w-0">
      {/* Clamped by LINE rather than by height: the fold then lands on a line
          boundary whatever type size the text inside is set in, and it never
          cuts a line in half. */}
      <div
        ref={bodyRef}
        className="w-full min-w-0"
        style={
          open
            ? undefined
            : {
                display: '-webkit-box',
                WebkitLineClamp: lines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
        }
      >
        {children}
      </div>
      {(clipped || open) && (
        <button type="button" className="agent-more-link" onClick={() => setOpen((v) => !v)}>
          {open ? 'Show less' : moreLabel}
        </button>
      )}
    </div>
  )
}

/** "4,182 characters" reads as a size; "4182" reads as an id. */
function formatChars(n: number): string {
  return `${n.toLocaleString('en-GB')} characters`
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
