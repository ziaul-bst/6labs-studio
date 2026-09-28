/**
 * RecorderWorkflowDemo — "Example Recorder workflow" on the Gameplay Recorder
 * page: the Recorder's own window, stepping through what it does on a test
 * machine. Set up once, wait for the game, record while it runs, upload when
 * it exits, and the session is in the library.
 *
 * It is a drawing, not a control panel. The window body is inert — the fields
 * and buttons inside are the real Apparatus parts so it looks like the app, but
 * nothing in it can be focused or pressed. The only interactive thing is the
 * row of pips under it, a tablist that jumps straight to a state.
 *
 * Motion rules, because this is one of very few moving surfaces in the studio:
 *   - The active pip is longer and fills as its state plays — the progress
 *     lives in the control that names the state, not in a separate bar. The
 *     window advances on that fill's `animationend`, so the fill and the state
 *     it measures cannot drift apart, and pausing is one `animation-play-state`
 *     switch rather than timers with remaining-time bookkeeping.
 *   - Pointer over the window or the pips, keyboard focus on the pips, or the
 *     tab going to the background all pause it. Mouse focus does not — a pip
 *     clicked and left behind would otherwise hold the demo still forever.
 *   - prefers-reduced-motion never plays. It shows a still frame per state
 *     (the clock at 24:18, the upload at 68%) and the pips still switch.
 *
 * Code-first prototype — no Figma source yet. Content is the PM prototype's,
 * verbatim, including the generic "YourGame" / App ID 11001 — it is an example
 * window, not the reader's workspace.
 */
import { useEffect, useId, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Toggle from '../ui/Toggle'
import { SegmentedControl } from '../atoms/SegmentedControl'
import { ProgressBar } from '../atoms/ProgressBar'
import { UploadTag } from '../atoms/UploadTag'
import { LogoMark } from '../icons/LogoMark'
import { CheckIcon } from '../icons/CheckIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { PlayIcon } from '../icons/PlayIcon'
import { usePrefersReducedMotion } from '../../lib/hooks/useMediaQuery'

export type RecorderDemoState = 'setup' | 'waiting' | 'recording' | 'uploading' | 'uploaded'

export const RECORDER_DEMO_ORDER: RecorderDemoState[] = ['setup', 'waiting', 'recording', 'uploading', 'uploaded']

const LABEL: Record<RecorderDemoState, string> = {
  setup: 'Setup',
  waiting: 'Waiting',
  recording: 'Recording',
  uploading: 'Uploading',
  uploaded: 'Uploaded',
}

/** How long each state holds, in ms — setup reads longest, waiting shortest. */
const DWELL: Record<RecorderDemoState, number> = {
  setup: 4600,
  waiting: 3200,
  recording: 4800,
  uploading: 3800,
  uploaded: 4400,
}

/** Setup happens once; the loop after it runs waiting → uploaded and round again. */
const nextState = (s: RecorderDemoState): RecorderDemoState =>
  s === 'uploaded' ? 'waiting' : RECORDER_DEMO_ORDER[RECORDER_DEMO_ORDER.indexOf(s) + 1]

const CLOCK_START = 24 * 60 + 18
const STILL_UPLOAD_PCT = 68

const fmtClock = (total: number) => {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export interface RecorderWorkflowDemoProps {
  /** Which state the window opens on. */
  initialState?: RecorderDemoState
  /** Off pins the window on `initialState` as a still frame — for stories. */
  autoplay?: boolean
  className?: string
}

export function RecorderWorkflowDemo({ initialState = 'setup', autoplay = true, className }: RecorderWorkflowDemoProps) {
  const uid = useId()
  const tabId = (s: RecorderDemoState) => `${uid}-tab-${s}`
  const panelId = `${uid}-panel`

  const reduced = usePrefersReducedMotion()
  const playing = autoplay && !reduced

  const [state, setState] = useState<RecorderDemoState>(initialState)
  /* Bumped on every entry into a state, so re-entering the same one (a pip
     clicked twice) still restarts its pip's fill and its clock. */
  const [entry, setEntry] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [docHidden, setDocHidden] = useState(() => typeof document !== 'undefined' && document.hidden)
  const paused = !playing || hovering || keyboardFocus || docHidden

  const [clock, setClock] = useState(CLOCK_START)
  const [uploadPct, setUploadPct] = useState(0)

  useEffect(() => {
    const onVisibility = () => setDocHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (state !== 'recording' || paused) return
    const t = window.setInterval(() => setClock((c) => c + 1), 1000)
    return () => window.clearInterval(t)
  }, [state, paused])

  /* The bar fills by 86% of the dwell, so "100%" holds for a beat before the
     window moves on to Uploaded. */
  useEffect(() => {
    if (state !== 'uploading' || paused) return
    const step = (100 * 100) / (DWELL.uploading * 0.86)
    const t = window.setInterval(() => setUploadPct((p) => Math.min(100, p + step)), 100)
    return () => window.clearInterval(t)
  }, [state, paused])

  /* Every entry starts the clock and the upload from the top — reset here, in
     the same update as the switch, not in an effect after it: the pane is
     re-keyed, so an effect would mount the new progress bar at the last loop's
     100% and animate it backwards to zero. */
  const go = (s: RecorderDemoState) => {
    setState(s)
    setEntry((e) => e + 1)
    setClock(CLOCK_START)
    setUploadPct(0)
  }

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = RECORDER_DEMO_ORDER.indexOf(state)
    const last = RECORDER_DEMO_ORDER.length - 1
    const to =
      e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i === last ? 0 : i + 1)
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i === 0 ? last : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (to === null) return
    e.preventDefault()
    const s = RECORDER_DEMO_ORDER[to]
    go(s)
    document.getElementById(tabId(s))?.focus()
  }

  /* A still frame reads better at a telling moment than at zero. */
  const shownClock = playing ? clock : CLOCK_START
  const shownPct = Math.round(playing ? uploadPct : STILL_UPLOAD_PCT)

  return (
    <div
      className={['flex flex-col gap-m rounded-3xl p-l min-w-0', className].filter(Boolean).join(' ')}
      /* A brand-tint stage, strongest behind the window's top edge, so the
         window floats on colour instead of sitting on grey. */
      style={{
        /* Tints are translucent — the white base under them keeps the stage
           and its border crisp on whatever it sits on. */
        background:
          'linear-gradient(160deg, var(--bg-tint) 0%, var(--bg-tint-light) 45%, transparent 100%), var(--bg-elements)',
        /* Opaque, mixed from brand and white — a translucent tint border
           disappears into the tint at the top-left corner. */
        border: '1px solid color-mix(in srgb, var(--brand) 28%, var(--bg-elements))',
      }}
    >
      <div className="flex flex-col gap-xxxs">
        <h3 className="font-display text-s font-semibold text-text-primary leading-[1.4]">Example Recorder workflow</h3>
        <p className="font-body text-xs text-text-tertiary leading-[1.5]">
          After setup, recording and upload run automatically when you launch and exit the configured game.
        </p>
      </div>

      <div
        className="flex flex-col gap-s"
        /* A mouse pointer only. A tap fires emulated hover that no later event
           clears — scrolling away does not — so touch would pause it for good. */
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setHovering(true)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setHovering(false)
        }}
        onFocus={(e) => {
          if ((e.target as HTMLElement).matches?.(':focus-visible')) setKeyboardFocus(true)
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardFocus(false)
        }}
      >
        {/* ── The window ── */}
        <div
          className="flex flex-col rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-elements)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-big)',
          }}
        >
          <div
            className="flex items-center gap-xs px-s h-[36px] shrink-0"
            style={{ backgroundColor: 'var(--bg-inset)', borderBottom: '1px solid var(--border-subtle)' }}
            aria-hidden
          >
            <LogoMark size={16} />
            <span className="font-display text-xs font-semibold text-text-secondary leading-[1.5] truncate min-w-0">
              6labs Gameplay Recorder
            </span>
            <span className="ml-auto flex items-center gap-s shrink-0 text-text-tertiary">
              {/* STAND-IN: Apparatus has no minimise glyph yet — a CSS bar until
                  one is added there and exported. */}
              <span className="block w-[10px] h-[1.5px] rounded-round bg-current" />
              <CloseIcon size={12} />
            </span>
          </div>

          {/* Focusable, as a tabpanel with nothing focusable inside should be.
              The drawing is inert, which also takes it out of the accessibility
              tree, so the panel carries a sentence per state in its place —
              without aria-live, since it changes every few seconds. */}
          <div
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId(state)}
            tabIndex={0}
            className="recorder-panel flex flex-col min-h-[312px] px-l pt-l pb-m"
          >
            <p className="sr-only">{srSummary(state, fmtClock(shownClock), shownPct)}</p>
            <div key={`${state}-${entry}`} className="recorder-pane flex flex-col flex-1 min-w-0" {...{ inert: '' }}>
              {state === 'setup' && <SetupPane />}
              {state === 'waiting' && <WaitingPane />}
              {state === 'recording' && <RecordingPane clock={fmtClock(shownClock)} />}
              {state === 'uploading' && <UploadingPane pct={shownPct} />}
              {state === 'uploaded' && <UploadedPane />}
            </div>
          </div>
        </div>

        {/* ── Pips ── */}
        <div className="flex items-center gap-s flex-wrap">
          <div role="tablist" aria-label="Recorder states" className="flex items-center" onKeyDown={onTabKey}>
            {RECORDER_DEMO_ORDER.map((s) => {
              const selected = s === state
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  id={tabId(s)}
                  aria-selected={selected}
                  aria-controls={panelId}
                  aria-label={LABEL[s]}
                  tabIndex={selected ? 0 : -1}
                  className="recorder-pip"
                  onClick={() => go(s)}
                >
                  <span className="recorder-pip-dot">
                    {selected &&
                      (playing ? (
                        <i
                          key={`${state}-${entry}`}
                          className="recorder-dwell-fill"
                          data-paused={paused}
                          style={{ '--dwell': `${DWELL[state]}ms` } as CSSProperties}
                          onAnimationEnd={(e) => {
                            if (e.animationName === 'recorder-dwell') go(nextState(state))
                          }}
                        />
                      ) : (
                        /* Still frame (autoplay off, reduced motion): the pip
                           is simply full — nothing is counting down. */
                        <i className="recorder-dwell-fill" style={{ animation: 'none', transform: 'scaleX(1)' }} />
                      ))}
                  </span>
                </button>
              )
            })}
          </div>
          {/* No Playing / Paused readout: it described the demo, not the
              Recorder, and beside "Uploading" it read as one of the Recorder's
              states. The active pip's fill stopping is the pause signal. */}
          <span className="font-display text-2xs font-semibold uppercase tracking-[0.12em] text-text-secondary leading-[1.5]">
            {LABEL[state]}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Window panes ─────────────────────────────────────────────────────────────

/** What each pane shows, as one sentence for a screen reader. */
function srSummary(state: RecorderDemoState, clock: string, pct: number): string {
  switch (state) {
    case 'setup':
      return 'Setup. App ID 11001, confirmed as YourGame. Are you in mainland China: No. Keep local copies: on. Save & Start.'
    case 'waiting':
      return 'Ready. Waiting for YourGame. Recording starts automatically when YourGame launches. Last upload: 30 minutes ago.'
    case 'recording':
      return `Rec. Recording YourGame, ${clock}.`
    case 'uploading':
      return `Uploading session. 11:38 · Uploading in the background. ${pct}%. Local copy saved on this device.`
    case 'uploaded':
      return `Upload complete. 11:38 · Uploaded. ${UPLOADED_SESSIONS.map((s) => `${s.name}, ${s.duration}`).join('; ')}.`
  }
}

type ChipTone = 'neutral' | 'brand' | 'error'

const CHIP_TONE: Record<ChipTone, { bg: string; ink: string }> = {
  neutral: { bg: 'var(--bg-subtle)', ink: 'var(--text-secondary)' },
  brand: { bg: 'var(--bg-tint)', ink: 'var(--brand)' },
  error: { bg: 'var(--error-bg)', ink: 'var(--error)' },
}

/** Same shape as `UploadTag`, which draws the Uploading and Uploaded chips. */
function StateChip({ tone, live, children }: { tone: ChipTone; live?: boolean; children: ReactNode }) {
  const t = CHIP_TONE[tone]
  return (
    <span
      className="inline-flex items-center gap-xxs self-start px-xs py-xxxs rounded-xs font-display text-2xs font-semibold uppercase tracking-[0.15em] leading-[1.5] shrink-0"
      style={{ backgroundColor: t.bg, color: t.ink }}
    >
      {live ? (
        <i className="agent-live-dot" style={{ width: 6, height: 6 }} aria-hidden />
      ) : (
        <i className="inline-block w-[6px] h-[6px] rounded-round bg-current" aria-hidden />
      )}
      {children}
    </span>
  )
}

function PaneTitle({ children }: { children: ReactNode }) {
  return <h4 className="font-display text-m font-semibold text-text-primary leading-[1.4] mt-m">{children}</h4>
}

function PaneLine({ children }: { children: ReactNode }) {
  return <p className="font-body text-xs text-text-secondary leading-[1.5] mt-xxs">{children}</p>
}

function PaneMeta({ children }: { children: ReactNode }) {
  return <span className="font-body text-xs text-text-tertiary leading-[1.5]">{children}</span>
}

function PaneFooter({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-s mt-auto pt-l">{children}</div>
}

function MockLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-2xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]">
      {children}
    </span>
  )
}

function SessionFacts() {
  return (
    <dl className="flex flex-col gap-xs mt-m">
      {[
        ['User', null],
        ['Game', 'YourGame'],
      ].map(([k, v]) => (
        <div key={k} className="flex items-baseline gap-m">
          <dt className="w-[48px] shrink-0">
            <MockLabel>{k}</MockLabel>
          </dt>
          <dd className={['font-body text-xs leading-[1.5]', v ? 'text-text-primary' : 'text-text-tertiary'].join(' ')}>
            {v ?? '—'}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function SetupPane() {
  return (
    <>
      <StateChip tone="neutral">Setup</StateChip>
      <div className="flex flex-col gap-xs mt-m">
        <Input size="md" label="App ID" value="11001" readOnly />
        <span
          className="inline-flex items-center gap-xxs self-start font-display text-2xs font-semibold uppercase tracking-[0.12em] leading-[1.5]"
          style={{ color: 'var(--success)' }}
        >
          <CheckIcon size={12} />
          YourGame
        </span>
      </div>
      <div className="flex flex-col gap-xs mt-m">
        <MockLabel>Are you in mainland China?</MockLabel>
        <SegmentedControl
          size="sm"
          ariaLabel="Are you in mainland China?"
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          value="no"
          onChange={() => {}}
          className="self-start"
        />
      </div>
      <div className="flex items-center justify-between gap-s mt-m">
        <span className="font-body text-s text-text-primary leading-[1.5]">Keep local copies</span>
        <Toggle checked readOnly aria-label="Keep local copies" />
      </div>
      <PaneFooter>
        <span className="flex-1" />
        <Button variant="primary" size="md">
          Save &amp; Start
        </Button>
      </PaneFooter>
    </>
  )
}

function WaitingPane() {
  return (
    <>
      <StateChip tone="brand">Ready</StateChip>
      <PaneTitle>Waiting for YourGame</PaneTitle>
      <PaneLine>Recording starts automatically when YourGame launches.</PaneLine>
      <SessionFacts />
      <span className="block h-px w-full mt-m" style={{ backgroundColor: 'var(--border-subtle)' }} aria-hidden />
      <PaneFooter>
        <PaneMeta>Last upload: 30 minutes ago</PaneMeta>
        <span className="flex-1" />
        <Button variant="tertiary" size="md">
          Settings
        </Button>
      </PaneFooter>
    </>
  )
}

function RecordingPane({ clock }: { clock: string }) {
  return (
    <>
      <StateChip tone="error" live>
        Rec
      </StateChip>
      <PaneTitle>Recording YourGame</PaneTitle>
      <span className="font-code text-3xl text-text-primary tabular-nums leading-none mt-s">{clock}</span>
      <SessionFacts />
      <PaneFooter>
        <span className="flex-1" />
        <Button variant="tertiary" size="md">
          Pause
        </Button>
        <Button variant="danger" size="md">
          Stop recording
        </Button>
      </PaneFooter>
    </>
  )
}

function UploadingPane({ pct }: { pct: number }) {
  return (
    <>
      <UploadTag status="uploading" className="self-start" />
      <PaneTitle>Uploading session</PaneTitle>
      <PaneLine>11:38 · Uploading in the background</PaneLine>
      <div className="flex items-center gap-s mt-l">
        <div className="flex-1 min-w-0">
          <ProgressBar value={pct} label="Upload progress" />
        </div>
        <span className="w-[36px] text-right font-display text-xs font-semibold text-text-secondary tabular-nums leading-[1.5]">
          {pct}%
        </span>
      </div>
      <PaneFooter>
        <PaneMeta>Local copy saved on this device.</PaneMeta>
      </PaneFooter>
    </>
  )
}

const UPLOADED_SESSIONS = [
  { name: 'Boss relay — stage 3', duration: '11:38', fresh: true },
  { name: 'Tutorial — first run', duration: '04:12', fresh: false },
  { name: 'Shop & loadout', duration: '02:51', fresh: false },
]

function UploadedPane() {
  return (
    <>
      <UploadTag status="uploaded" className="self-start" />
      <PaneTitle>Upload complete</PaneTitle>
      <PaneLine>11:38 · Uploaded</PaneLine>
      <ul className="flex flex-col mt-m rounded-l overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        {UPLOADED_SESSIONS.map((s, i) => (
          <li
            key={s.name}
            className="recorder-row-in flex items-center gap-xs px-s py-xs min-w-0"
            style={
              {
                '--row-delay': `${i * 90}ms`,
                backgroundColor: s.fresh ? 'var(--bg-tint-light)' : 'var(--bg-elements)',
                borderTop: i > 0 ? '1px solid var(--border-subtle)' : undefined,
                boxShadow: s.fresh ? 'inset 2px 0 0 var(--success)' : undefined,
              } as CSSProperties
            }
          >
            <span
              className="flex items-center justify-center shrink-0 w-[18px] h-[18px] rounded-round"
              style={{ backgroundColor: 'var(--bg-tint)', color: 'var(--brand)' }}
              aria-hidden
            >
              <PlayIcon size={10} />
            </span>
            <span className="flex-1 min-w-0 truncate font-display text-xs font-semibold text-text-primary leading-[1.5]">
              {s.name}
            </span>
            <span className="shrink-0 font-code text-2xs text-text-tertiary tabular-nums leading-[1.5]">{s.duration}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
