/**
 * AIAgentSessionView — one AI player's session: the video, and the analysis
 * of the screen you are looking at.
 *
 * The value of this screen is seeing a frame and its reading together, so the
 * two are the hero: the recording on the left, and beside it — at the same
 * height, in one panel — what the agent saw on *this* screen, what it did, and
 * whether the moment was flagged and which finding it became. Scrub the video
 * and the panel follows; step the panel and the video follows.
 *
 * Everything else is secondary and sits below: a compact table of every
 * screen in order (time, screen, action, flag) for scanning the whole session
 * and jumping to a moment. Nothing there repeats the panel — the panel is
 * where a screen is read in full.
 *
 * A live session is the same screen with fewer rows: screens the agent has
 * not reached yet are not listed, and the cursor rides the newest screen
 * until the reader takes it.
 *
 * Code-first prototype — from the PM artifact (screen s48), no Figma source yet.
 */

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { RunFacts } from '../molecules/RunFacts'
import { IssueKindTag } from '../atoms/IssueKindTag'
import Button from '../ui/Button'
import { PlayIcon } from '../icons/PlayIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import { PERSONA_TONE, flaggedCount, formatSessionTime } from '../../lib/mocks/testing'
import type { AgentSession, AIBehaviouralRunMeta } from '../../lib/types/testing'

export interface AIAgentSessionViewProps {
  session: AgentSession
  runName: string
  meta: AIBehaviouralRunMeta
  /** The players' brief for this run, if one was given. */
  instructions?: string
  /** Rank and title per issue id, so a flag can name the finding it became. */
  findings: Record<string, { rank: number; title: string }>
  /** Screen to land on — a clip in the report arrives here. */
  initialStep?: number
  onBack: () => void
  /** Opens the run's report at a finding. */
  onOpenFinding?: (issueId: string) => void
  className?: string
}

const PLAY_MS = 1800

/* Fixed widths for every column but the screen name — see RunHistoryList. */
const ROW_GRID = '56px 52px minmax(0, 1.1fr) minmax(0, 1.4fr) 92px 20px'

export function AIAgentSessionView({
  session,
  runName,
  meta,
  instructions,
  findings,
  initialStep,
  onBack,
  onOpenFinding,
  className,
}: AIAgentSessionViewProps) {
  const live = session.status === 'live'
  const reached = session.reached
  const total = session.steps.length
  const last = reached - 1
  const [idx, setIdx] = useState(() => Math.min(initialStep ?? (live ? last : 0), last))
  const [playing, setPlaying] = useState(initialStep === undefined)
  const [following, setFollowing] = useState(live && initialStep === undefined)
  const step = session.steps[idx]
  const tone = PERSONA_TONE[session.persona] ?? 'var(--text-secondary)'
  const flagged = flaggedCount(session)
  const durationSec = session.steps[total - 1].atSec + 20
  const finding = step.flag ? findings[step.flag.issueId] : undefined

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
        <div className="flex flex-col gap-m w-full page-measure mx-auto pt-l pb-xxl3">
          {/* ── The hero: recording and the reading of the current screen ── */}
          <section
            className="flex flex-col w-full rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
          >
            {/* Who is playing, under what brief. Identity and the two run facts
                share a row with room between them; the brief gets a line of
                its own, at reading weight, and wraps rather than truncates —
                it is the one thing the reader needs to judge every action. */}
            <header
              className="flex flex-col gap-m w-full min-w-0 px-xl py-l"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-xl w-full min-w-0 flex-wrap">
                <div className="flex items-center gap-m shrink-0 min-w-0">
                  <span
                    className="flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-xl text-white"
                    style={{ backgroundColor: tone }}
                    aria-hidden
                  >
                    <PersonaGlyph />
                  </span>
                  <div className="flex flex-col gap-xxxs min-w-0">
                    <span className="font-display text-m font-semibold text-text-primary leading-[1.35]">
                      {session.persona} · agent {session.index + 1} of {meta.agents}
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
              </div>
              {instructions && (
                /* The brief, quoted: it is the players' own words for the run,
                   so it reads as a citation rather than another fact row. */
                <blockquote
                  className="flex flex-col gap-xxs w-full min-w-0 m-0 px-m py-s rounded-xl"
                  style={{ backgroundColor: 'var(--bg-tint-light)', borderLeft: '3px solid var(--border-tint)' }}
                >
                  <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5]">
                    Instructions to the players
                  </span>
                  <p className="font-body text-s text-text-secondary leading-[1.6] m-0 max-w-[90ch]">“{instructions}”</p>
                </blockquote>
              )}
            </header>

            <div className="agent-session-layout w-full">
              {/* The recording */}
              <div className="flex flex-col min-w-0">
                <div
                  className="agent-frame relative w-full overflow-hidden"
                  style={{ aspectRatio: '16 / 9', background: step.scene, transition: 'background 300ms ease' }}
                >
                  <span className="absolute left-m top-s flex gap-xs" aria-hidden>
                    <i className="block w-[54px] h-[12px] rounded-xs" style={{ backgroundColor: 'rgba(255,220,130,0.5)' }} />
                    <i className="block w-[36px] h-[12px] rounded-xs" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
                    <i className="block w-[36px] h-[12px] rounded-xs" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }} />
                  </span>
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

                {/* Transport — the scrub carries the flagged moments, so the
                    shape of the session is readable before pressing play. */}
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
                    {session.steps.slice(0, reached).map((s, i) =>
                      s.flag ? (
                        <b
                          key={i}
                          className="absolute top-[-3px] w-[12px] h-[12px] rounded-round -translate-x-1/2"
                          style={{
                            left: `${((i + 0.5) / total) * 100}%`,
                            backgroundColor: s.flag.kind === 'bug' ? 'var(--error)' : 'var(--warning)',
                            border: '2px solid var(--bg-elements)',
                          }}
                          aria-hidden
                        />
                      ) : null,
                    )}
                  </div>
                  <span className="font-body text-xs text-text-tertiary whitespace-nowrap">
                    Screen {idx + 1} of {live ? `${reached} · ${total} planned` : total}
                  </span>
                </div>
              </div>

              {/* The reading of this screen. Hierarchy: which screen, then what
                  the agent saw and did, then — only when it matters — the flag
                  and the finding it fed. */}
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
                    <span className="flex items-center gap-s flex-wrap">
                      <h2 className="font-display text-l font-semibold text-text-primary leading-[1.25] tracking-[-0.01em] m-0">
                        {step.screen}
                      </h2>
                      {step.flag && <IssueKindTag kind={step.flag.kind} />}
                    </span>
                  </div>

                  <Reading label="What the agent saw">{step.reasoning}</Reading>
                  <Reading label="What it did">
                    <span className="font-display font-semibold text-text-primary">{step.action}</span>
                  </Reading>

                  {step.flag ? (
                    <div
                      className="flex flex-col gap-xs rounded-xl px-m py-s"
                      style={{
                        backgroundColor: step.flag.kind === 'bug' ? 'var(--error-bg)' : 'var(--warning-bg)',
                      }}
                    >
                      <span
                        className={['font-body text-s leading-[1.55]', step.flag.kind === 'bug' ? '' : 'issue-amber-ink'].join(' ')}
                        style={step.flag.kind === 'bug' ? { color: 'var(--error)' } : undefined}
                      >
                        {step.flag.note}
                      </span>
                      {finding ? (
                        <button
                          type="button"
                          onClick={() => onOpenFinding?.(step.flag!.issueId)}
                          className="inline-flex items-center gap-xxs self-start max-w-full font-body text-s font-semibold text-text-brand leading-[1.5] hover:underline min-w-0"
                        >
                          <span className="truncate">Finding #{finding.rank} · {finding.title}</span>
                          <ChevronIcon size={12} className="shrink-0" />
                        </button>
                      ) : (
                        <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                          Becomes a finding once every session has finished.
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="font-body text-xs text-text-tertiary leading-[1.5]">Nothing flagged on this screen.</span>
                  )}
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
          </section>

          {/* ── Every screen, in order ── */}
          <section
            className="flex flex-col w-full rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
            aria-label="All screens in this session"
          >
            <div className="flex items-baseline gap-xs px-l pt-l pb-m">
              <h2 className="font-display text-s font-semibold text-text-primary leading-[1.5] m-0">Screen by screen</h2>
              <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                {reached}{live ? ` of ${total}` : ''} screens ·{' '}
                <span className={flagged ? 'issue-amber-ink font-medium' : ''}>{flagged} flagged</span>
              </span>
            </div>
            <div
              className="grid items-center gap-m px-l pb-xs"
              style={{ gridTemplateColumns: ROW_GRID, borderBottom: '1px solid var(--border-subtle)' }}
              role="row"
            >
              <span aria-hidden />
              <ColHead>Time</ColHead>
              <ColHead>Screen</ColHead>
              <ColHead>What it did</ColHead>
              <ColHead>Flag</ColHead>
              <span aria-hidden />
            </div>
            <div className="flex flex-col w-full">
              {session.steps.slice(0, reached).map((s, i) => {
                const active = i === idx
                return (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    data-active={active}
                    onClick={() => select(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') select(i)
                    }}
                    className="agent-step-row grid items-center gap-m px-l py-xs cursor-pointer"
                    style={{
                      gridTemplateColumns: ROW_GRID,
                      borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                      boxShadow: active ? 'inset 3px 0 0 var(--brand)' : undefined,
                    }}
                  >
                    <span className="block w-[56px] h-[34px] rounded-s" style={{ background: s.scene }} aria-hidden />
                    <span className="font-code text-xs text-text-tertiary leading-[1.5]">{formatSessionTime(s.atSec)}</span>
                    <span className="font-display text-s font-semibold text-text-primary leading-[1.45] truncate">{s.screen}</span>
                    <span className="font-body text-s text-text-secondary leading-[1.5] truncate">{s.action}</span>
                    <span className="flex items-center min-w-0">
                      {s.flag ? <IssueKindTag kind={s.flag.kind} /> : <span className="font-body text-s text-text-tertiary">—</span>}
                    </span>
                    <ChevronIcon size={16} className="text-text-tertiary" />
                  </div>
                )
              })}
              {live && (
                <div className="flex items-center gap-s px-l py-m" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span className="testing-spinner-sm shrink-0" aria-hidden />
                  <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                    Playing screen {reached + 1} of {total}…
                  </span>
                </div>
              )}
            </div>
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

function ColHead({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-2xs font-medium uppercase tracking-[1px] text-text-tertiary leading-[1.5] truncate" role="columnheader">
      {children}
    </span>
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
