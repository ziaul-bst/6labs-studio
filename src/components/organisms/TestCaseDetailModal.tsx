/**
 * TestCaseDetailModal — the evidence behind one verdict.
 *
 * A verification result is a claim, and the reader is doing exactly one thing
 * with it: comparing what the case asked for against what the footage shows. So
 * the body is that comparison, side by side, under the clip it is drawn from —
 * specified on the left, observed on the right. The earlier three-column version
 * put the list, the clip and the observation in competition and left the
 * expected result stranded under the video where nobody read it.
 *
 * The left rail is why this is a modal and not a page: a QA lead works down the
 * failures, not across the report, so the list travels with the reader. Its
 * filter drives the set Previous/Next walks — and selecting a filter that
 * excludes the open case moves to the first case that matches, rather than
 * leaving a highlighted row that is no longer in the list.
 *
 * Code-first prototype — from the reference flow (user-test-agent-flow v128).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TestingMenuSelect } from '../molecules/TestingMenuSelect'
import { VideoControlsBar } from '../molecules/VideoControlsBar'
import { AIPlayerIcon } from '../icons/AIPlayerIcon'
import { CASE_OUTCOME_STYLE, CaseOutcomeTag } from '../atoms/CaseOutcomeTag'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { CloseIcon } from '../icons/CloseIcon'
import { SearchIcon } from '../icons/SearchIcon'
import { PlayIcon } from '../icons/PlayIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import type { CaseOutcome, VerifiedCase } from '../../lib/types/testing'

/**
 * The nth "M:SS" in a string, in seconds. Both a clip range ("07:55 – 10:20")
 * and a step's own timestamp are read with it, so the bar's scale and the step
 * offsets can never be parsed two different ways.
 */
function clipSeconds(text: string, index: number): number {
  const stamps = text.match(/\d+:\d+/g)
  const stamp = stamps?.[index]
  if (!stamp) return 0
  const [m, s] = stamp.split(':').map(Number)
  return m * 60 + s
}

/** Paired with the DS PlayIcon on the poster — there is no PauseIcon in the set. */
function PauseGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="5.5" y="4" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="11" y="4" width="3.5" height="12" rx="1" fill="currentColor" />
    </svg>
  )
}

export interface TestCaseDetailModalProps {
  /** The case being read, or null when the modal is closed. */
  testCase: VerifiedCase | null
  /** Every case on the page, before the rail's own filter. */
  cases: VerifiedCase[]
  onSelect: (id: string) => void
  onClose: () => void
  /**
   * The footage was played by an AI agent rather than recorded by a person.
   * Tags the clip, because everything else in this modal reads identically
   * either way — and whether a human or an agent produced the evidence changes
   * how much weight a single observation carries.
   */
  aiGenerated?: boolean
  /**
   * Show the list rail. Off is the plain modal — one case, walked with the
   * pager alone. Both shapes are in the reference; the rail is the default
   * because a suite is read failure by failure.
   */
  withNavigator?: boolean
  /**
   * 'stacked' puts the clip above a Specified | Observed comparison — the whole
   * case read top to bottom. 'split' pins the clip and the specification in a
   * left pane and gives Observed its own scrolling column, so a step clicked
   * twenty rows down still has the frame it happened on beside it.
   */
  layout?: CaseModalLayout
}

export type CaseModalLayout = 'stacked' | 'split'

type RailFilter = 'all' | CaseOutcome

/* Names come from CASE_OUTCOME_STYLE so the rail, the tags and the report's own
   filter cannot drift into three spellings of the same four outcomes. Failures
   lead — this rail is worked top-down by someone triaging them. */
const RAIL_FILTERS: { value: RailFilter; label: string }[] = [
  { value: 'all', label: 'All outcomes' },
  ...(['fail', 'review', 'blocked', 'pass'] as CaseOutcome[]).map((value) => ({
    value,
    label: CASE_OUTCOME_STYLE[value].label,
  })),
]

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export function TestCaseDetailModal({
  testCase,
  cases,
  onSelect,
  onClose,
  aiGenerated = false,
  withNavigator = true,
  layout: requestedLayout = 'stacked',
}: TestCaseDetailModalProps) {
  /* Which step the clip is parked on. Null is the start of the range — opening
     a case should show its beginning, not whatever step was read last. */
  const [activeStep, setActiveStep] = useState<number | null>(null)
  /* Playhead, in seconds from the start of the clip's own range. The steps are
     seek controls, so the position has to be a number the bar and the step list
     can both write to — a step click sets it, dragging the bar clears the step,
     and neither can claim the clip is somewhere the other disagrees with. */
  const [playhead, setPlayhead] = useState(0)
  const [playing, setPlaying] = useState(false)
  /* Split needs three columns beside a rail. Under 1100px it would give the
     steps a ~300px column, which is not a reading column — so the layout falls
     back rather than degrades, and the fallback is decided here rather than in
     CSS because the two layouts render different children. */
  const wideEnoughToSplit = useMediaQuery('(min-width: 1100px)')
  const [railFilter, setRailFilter] = useState<RailFilter>('all')
  const [railSearch, setRailSearch] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  const layout: CaseModalLayout =
    requestedLayout === 'split' && wideEnoughToSplit ? 'split' : 'stacked'

  const matches = useMemo(
    () =>
      cases.filter((c) => {
        if (railFilter !== 'all' && c.outcome !== railFilter) return false
        if (!railSearch) return true
        const q = railSearch.toLowerCase()
        return `${c.id} ${c.title} ${c.category}`.toLowerCase().includes(q)
      }),
    [cases, railFilter, railSearch],
  )

  /* The pager walks what the rail is showing, so "Next" and the list below it
     never disagree. Falls back to the whole page when the rail is hidden. */
  const walk = withNavigator ? matches : cases
  const index = testCase ? walk.findIndex((c) => c.id === testCase.id) : -1

  /* Narrowing the list is a request to read that subset — so it moves to the
     first case in it rather than stranding a selection outside the list. */
  useEffect(() => {
    if (!testCase || !withNavigator) return
    if (matches.length === 0) return
    if (matches.some((c) => c.id === testCase.id)) return
    onSelect(matches[0].id)
  }, [matches, testCase, withNavigator, onSelect])

  /* Escape closes, and the arrow keys walk the set — the same two the pager
     presses, so a reader working down the failures never goes back to the
     footer for the mouse. */
  useEffect(() => {
    if (!testCase) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.key === 'ArrowLeft' && index > 0) onSelect(walk[index - 1].id)
      if (e.key === 'ArrowRight' && index >= 0 && index < walk.length - 1) {
        onSelect(walk[index + 1].id)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [testCase, index, walk, onSelect, onClose])

  useEffect(() => {
    if (!testCase) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [testCase])

  useEffect(() => {
    if (testCase) panelRef.current?.focus()
  }, [testCase])

  /* A timestamp from the previous case is a frame that does not exist in this
     one, so walking to the next case rewinds. */
  useEffect(() => {
    setActiveStep(null)
    setPlayhead(0)
    setPlaying(false)
  }, [testCase?.id])

  /* Grouped by the case's own suite, because that is how a test file is
     written and how a reader scanning for "the store cases" looks for them. */
  const railGroups = useMemo(() => {
    const groups = new Map<string, VerifiedCase[]>()
    matches.forEach((c) => {
      const list = groups.get(c.category)
      if (list) list.push(c)
      else groups.set(c.category, [c])
    })
    return [...groups.entries()]
  }, [matches])

  if (!testCase) return null

  const step = activeStep === null ? null : testCase.steps[activeStep]

  /* The clip is evidence you play, not evidence you read — so its height is
     capped rather than proportional. At full width it took 453px of a 602px
     scroller and pushed the comparison off the screen entirely. */
  /* The clip runs from the first timestamp in its range to the second, so the
     bar's scale is the case file's own — no invented duration. */
  const clipStart = clipSeconds(testCase.clipRange, 0)
  const clipEnd = clipSeconds(testCase.clipRange, 1)
  const clipTotal = Math.max(1, clipEnd - clipStart)
  /* A step's timestamp is absolute in the recording; the bar counts from the
     start of this clip. */
  const stepOffset = (at: string) =>
    Math.max(0, Math.min(clipTotal, clipSeconds(at, 0) - clipStart))

  const clipFigure = (
    <figure className="case-figure flex flex-col gap-xs m-0">
      {aiGenerated && (
        /* Above the frame, at the head of the column the frame is in — this
           labels the footage, and the footage is what the whole column is. On
           the poster it would cover the thing being watched; in the modal
           header it read as a property of the case rather than of the
           recording, and the case is the same one a human could have run. */
        <span
          className="inline-flex items-center gap-xxs self-start px-xs py-xxxs rounded-xs font-display text-2xs font-semibold uppercase tracking-[0.1em]"
          style={{ backgroundColor: 'var(--bg-tint)', color: 'var(--text-brand)' }}
        >
          <AIPlayerIcon size={12} />
          Played by an AI player
        </span>
      )}
      <div
        className="case-clip relative w-full rounded-xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1F2C55 0%, #3A4F7A 100%)' }}
      >
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={`${playing ? 'Pause' : 'Play'} ${testCase.clip} from ${
            step ? step.at : testCase.clipRange
          }`}
          className="absolute inset-0 flex items-center justify-center text-white"
        >
          <span
            className="flex items-center justify-center w-12 h-12 rounded-round"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }}
          >
            {playing ? <PauseGlyph /> : <PlayIcon size={20} />}
          </span>
        </button>

        {/* Where the clip is parked. Only once a step has been chosen — an
            unprompted timestamp on the poster reads as the clip's start and
            makes the first click look like it did nothing. */}
        {step && (
          <span
            className="absolute left-0 bottom-0 m-xs flex items-center gap-xs px-xs py-xxxs rounded-xs font-code text-xs text-white"
            /* Brand, not a dark scrim: this pill is the only feedback a step
               click gives, and a near-black chip on a navy poster is not
               feedback. It is the same blue as the step's own rule, so the two
               ends of the link read as one thing. */
            style={{ backgroundColor: 'var(--brand)' }}
          >
            <span className="tabular-nums">{step.at}</span>
            <span className="opacity-70">step {(activeStep ?? 0) + 1}</span>
          </span>
        )}
      </div>
      {/* The clip is the evidence, and evidence gets scrubbed: a verdict that
          rests on "the gems were deducted before the refusal" is checked by
          going back four seconds, not by watching the whole range again. The
          same DS controls the session player uses, so a bar means the same
          thing in both places. */}
      <VideoControlsBar
        currentTime={playhead}
        totalDuration={clipTotal}
        isPlaying={playing}
        events={[]}
        onPlayPause={() => setPlaying((p) => !p)}
        /* Scrubbing is a claim about where the clip is, so it releases the step
           — leaving the pill on would have the poster say step 3 while the bar
           says somewhere else. */
        onSeek={(percent) => {
          setPlayhead((percent / 100) * clipTotal)
          setActiveStep(null)
        }}
      />
      {/* The range, and not the file name. "qa-0902.mp4" is a storage detail —
          it identifies a file in a bucket nobody in this modal can open, and it
          sat in the one caption slot the clip has, where the range (which is
          what the steps seek against) belongs. */}
      <figcaption className="flex flex-wrap items-center gap-s font-code text-xs text-text-tertiary leading-[1.5]">
        <span>{testCase.clipRange}</span>
      </figcaption>
    </figure>
  )

  /* "Specified", not "Expected": a precondition is a state the game had to be
     in, not something anyone expects to happen, and a heading that only covers
     half its own column is a heading the reader has to correct for. Specified /
     Observed names what each side is drawn from — the case file, the footage. */
  const specified = (
    /* Sticky only when it sits beside a column that outruns it. In split the
       whole left pane is the thing that stays put, so the rule would fight it. */
    <Column label="Specified" sticky={layout === 'stacked'}>
      <Field label="Precondition">{testCase.precondition}</Field>
      <Field label="Expected result">{testCase.expected}</Field>
    </Column>
  )

  const observed = (
    <Column label="Observed" trailing={<CaseOutcomeTag outcome={testCase.outcome} />}>
      <Field label="Result">{testCase.reason}</Field>
      <div className="flex flex-col gap-xs">
        <FieldLabel>Steps</FieldLabel>
        {/* Every step carries the second it starts on, so every step is a seek
            control rather than a printed timestamp. gap-xxs, not gap-s: the
            rows now have padding and a hover of their own, which does the
            separating the gap used to do.

            The steps are the route, not a second verdict. Each one used to
            carry its own observation underneath — and on a one-step failure
            that observation was the Result field above it, word for word, in
            smaller type. The list says what was done and when; Result says what
            happened, once. */}
        <ol className="flex flex-col gap-xxs">
          {testCase.steps.map((s, i) => {
            const on = activeStep === i
            return (
              <li key={`${s.action}-${i}`}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(on ? null : i)
                    setPlayhead(on ? 0 : stepOffset(s.at))
                  }}
                  aria-pressed={on}
                  className="case-step flex items-start gap-s w-full text-left rounded-m px-xs py-xs"
                  /* A 7% tint alone is not an answer to "which step is the clip
                     on" — the inset rule is what reads at a glance, and it is
                     the same left-rule language the Observed column uses. */
                  style={
                    on
                      ? {
                          backgroundColor: 'var(--bg-tint-light)',
                          boxShadow: 'inset 3px 0 0 var(--brand)',
                        }
                      : undefined
                  }
                >
                  <span
                    className="font-code text-xs leading-[1.6] shrink-0 w-5 text-right tabular-nums"
                    style={{ color: on ? 'var(--text-brand)' : 'var(--text-tertiary)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-xxs flex-1 min-w-0">
                    <span className="font-body text-s font-medium text-text-primary leading-[1.5]">
                      {s.action}
                    </span>
                  </span>
                  <span
                    className="font-code text-xs leading-[1.6] shrink-0 tabular-nums"
                    style={{ color: on ? 'var(--text-brand)' : 'var(--text-tertiary)' }}
                  >
                    {s.at}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </Column>
  )

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-l"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-modal-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div
        ref={panelRef}
        tabIndex={-1}
        /* Width and height both come from CSS: on a 14" laptop the panel was
           1120px inside a 1512px screen — 390px of unused gutter — while the
           comparison it exists to show sat below the fold. */
        className="case-modal relative flex flex-col w-full rounded-2xl shadow-big outline-none overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elements)' }}
      >
        {/* Header — the verdict sits opposite the title, so the case and its
            outcome are read in one movement. */}
        <div
          className="flex items-start gap-m px-l py-m shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex flex-col gap-xxxs flex-1 min-w-0">
            <span className="flex flex-wrap items-center gap-xs">
              <span className="font-code text-xs text-text-tertiary leading-[1.5]">{testCase.id}</span>
              <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                {testCase.category} · {testCase.path}
              </span>
            </span>
            <h2
              id="case-modal-title"
              className="font-display text-l font-semibold text-text-primary leading-[1.35]"
            >
              {testCase.title}
            </h2>
          </div>
          {/* Close only. The verdict sat here as well as on the Observed
              column's own header — the same tag twice on one screen, and the
              one that mattered was the one attached to the evidence. */}
          <div className="flex items-center gap-s shrink-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex items-center justify-center w-6 h-6 rounded-s text-text-secondary hover:text-text-primary"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        <div
          className={[
            'case-modal-body flex-1 min-h-0',
            withNavigator && 'case-modal-body-rail',
            layout === 'split' && 'case-modal-body-split',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {withNavigator && (
            <aside
              className="case-modal-rail flex flex-col min-h-0"
              style={{ borderRight: '1px solid var(--border-subtle)' }}
            >
              <div className="report-toolbar flex flex-col gap-xs px-m pt-m pb-s shrink-0">
                {/* lg, not md: the select below is a 40px field, and a 32px
                    input stacked on it read as two different controls. */}
                <Input
                  value={railSearch}
                  onChange={(e) => setRailSearch(e.target.value)}
                  placeholder="Search cases…"
                  aria-label="Search test cases"
                  size="lg"
                  leftIcon={<SearchIcon size={20} />}
                />
                {/* One select, not five pills: at rail width the pills wrapped
                    to two rows and stopped reading as one control. */}
                <TestingMenuSelect
                  value={railFilter}
                  onChange={(v) => setRailFilter(v as RailFilter)}
                  ariaLabel="Filter the list by outcome"
                  options={RAIL_FILTERS.map((f) => ({
                    value: f.value,
                    label: f.label,
                    meta:
                      f.value === 'all'
                        ? `${cases.length} cases`
                        : `${cases.filter((c) => c.outcome === f.value).length} cases`,
                  }))}
                />
              </div>

              <div className="flex flex-col gap-xs flex-1 min-h-0 overflow-y-auto px-m pb-m">
                {matches.length === 0 ? (
                  <p className="font-body text-xs text-text-tertiary leading-[1.6]">
                    Nothing matches that filter.
                  </p>
                ) : (
                  railGroups.map(([category, group]) => (
                    <div key={category} className="flex flex-col gap-xxxs">
                      <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5] pt-xs">
                        {category}
                      </span>
                      {group.map((c) => {
                        const on = c.id === testCase.id
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => onSelect(c.id)}
                            aria-current={on ? 'true' : undefined}
                            className="case-rail-item flex items-start gap-xs text-left rounded-m px-xs py-xs"
                            style={on ? { backgroundColor: 'var(--bg-tint-light)' } : undefined}
                          >
                            <span
                              className="w-[6px] h-[6px] rounded-round shrink-0 mt-[6px]"
                              style={{ backgroundColor: CASE_OUTCOME_STYLE[c.outcome].dot }}
                              aria-hidden
                            />
                            <span className="flex flex-col gap-xxxs min-w-0">
                              <span
                                className="font-body text-xs leading-[1.5]"
                                style={{ color: on ? 'var(--text-brand)' : 'var(--text-primary)' }}
                              >
                                {c.title}
                              </span>
                              <span className="font-code text-xs text-text-tertiary leading-[1.5]">
                                {c.id}
                              </span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>
            </aside>
          )}

          {/* The clip the verdict was read from. In split it is the left
              pane's sticky head, so a step clicked twenty rows down still has
              its frame beside it. */}
          {layout === 'split' ? (
            <>
              <div className="case-pane case-pane-source">
                {clipFigure}
                {specified}
              </div>
              <div className="case-pane">{observed}</div>
            </>
          ) : (
            <div className="case-pane">
              {clipFigure}
              {/* The comparison the reader came for, side by side. */}
              <div className="case-compare gap-m">
                {specified}
                {observed}
              </div>
            </div>
          )}
        </div>

        <div
          className="flex items-center gap-s px-l py-s shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="font-body text-xs text-text-tertiary leading-[1.5]">
            {index + 1} of {walk.length}
          </span>
          <span className="flex-1" />
          <Button
            variant="secondary"
            size="md"
            disabled={index <= 0}
            leftIcon={<ChevronIcon size={16} direction="left" />}
            onClick={() => index > 0 && onSelect(walk[index - 1].id)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="md"
            disabled={index < 0 || index >= walk.length - 1}
            rightIcon={<ChevronIcon size={16} />}
            onClick={() => index < walk.length - 1 && onSelect(walk[index + 1].id)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Column({
  label,
  trailing,
  sticky,
  children,
}: {
  label: string
  trailing?: React.ReactNode
  /** Holds the column in view while the taller one beside it scrolls past. */
  sticky?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className={['flex flex-col gap-m rounded-xl px-m py-m min-w-0', sticky && 'case-column-sticky']
        .filter(Boolean)
        .join(' ')}
      /* No outcome-coloured rule on the observed side any more. Beside a short
         column it read as emphasis; down a scrolling pane it became a metre of
         red saying what the Fail tag in this column's own header, the tag in
         the modal header, and every coloured step observation already say. The
         colour belongs where it carries a fact, not down an edge. */
      style={{
        backgroundColor: 'var(--bg-inset)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* The card's title, and the only uppercase level in it. Ruled off so
          the eye has somewhere to stop before the fields begin. */}
      <div
        className="flex items-center gap-s pb-xs"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-primary leading-[1.5]">
          {label}
        </span>
        <span className="flex-1" />
        {trailing}
      </div>
      {children}
    </section>
  )
}

/**
 * Sentence case, not a second row of uppercase tracking. The heading and the
 * field labels used to be the same treatment — same size, same weight, same
 * caps, separated only by a colour token — so "Specified / Precondition /
 * Expected result" read as three peers and the card had no top. One uppercase
 * level, then these, then the prose.
 */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display text-xs font-semibold text-text-tertiary leading-[1.5]">
      {children}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-xxxs">
      <FieldLabel>{label}</FieldLabel>
      <p className="font-body text-s text-text-primary leading-[1.65] m-0">{children}</p>
    </div>
  )
}
