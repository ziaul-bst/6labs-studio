/**
 * UserTestAskPanel — follow-up questions about a finished run, answered by the
 * User Test agent rather than by Oracle.
 *
 * The split is about corpus, not capability. User Test holds this run: ten
 * sessions, seven findings, every clip and the game context they were graded
 * against. It can therefore answer "where did testers quit" *and point at
 * the sessions*. Oracle holds live player data and cannot see any of this
 * batch. Routing run questions to Oracle would have meant answering from the
 * wrong evidence — or, worse, answering plausibly from none.
 *
 * So the panel keeps the boundary visible rather than hiding it: in-corpus
 * questions get an answer with references, and a question that needs live data
 * gets told so, with a handoff that carries the finding across. The one thing
 * it never does is guess across the line.
 *
 * The thread stays inline under the run summary. A question about a run is read
 * against the run, and moving it to a separate surface would separate the
 * answer from the numbers it is about.
 *
 * No rail of suggested questions under the answer. The home composer offers
 * prompts, which is where someone who does not yet know what to ask is
 * standing; a reader who has just been handed an answer is reading it, and a
 * row of other questions there competed with the answer above it and with the
 * composer below. It also advertised the Oracle handoff as a question to
 * spend, when the handoff already appears inside any answer that turns out to
 * need live data — see `outOfScope` in UserTestAnswerCard.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { UserTestAnswerCard } from '../molecules/UserTestAnswerCard'
import { SectionHeading } from '../molecules/SectionHeading'
import { UserPrompt } from '../atoms/UserPrompt'
import { Spinner } from '../atoms/Spinner'
import { SkeletonText } from '../atoms/Skeleton'
import Button from '../ui/Button'
import { SendIcon } from '../icons/SendIcon'
import { USER_TEST_ASK_ANSWERS, USER_TEST_ASK_FALLBACK } from '../../lib/mocks/user-test'
import type { UserTestAskTurn, UserTestEvidenceRef } from '../../lib/types/userTest'

export interface UserTestAskPanelProps {
  /** How many recordings the run read — named in the input's placeholder. */
  sessionCount?: number
  /** Seeds the thread, so Storybook can show an answered state. */
  initialTurns?: UserTestAskTurn[]
  /**
   * Controlled thread. The dock hands these down so the conversation survives
   * moving between the run summary and the report — a question asked about
   * finding 1 should still be on screen while its evidence is being read.
   */
  turns?: UserTestAskTurn[]
  onTurnsChange?: (turns: UserTestAskTurn[]) => void
  /** Drops the heading — the dock's own header already carries it. */
  hideHeading?: boolean
  /**
   * Drops the panel's own padding, for hosts that own the column's gutters.
   * A prop rather than a `px-0 py-0` className from the host: Tailwind resolves
   * conflicting utilities by their order in the stylesheet, not in the class
   * attribute, so the override silently lost and every answer sat 20px narrower
   * than the run message above it.
   */
  bare?: boolean
  /**
   * Drops the inline form. The thread screens pin an Oracle-style composer to
   * the bottom instead; the panel then only renders the turns.
   */
  hideComposer?: boolean
  /**
   * Puts each answer in its own message container, the way the report card and
   * an Oracle response sit in the thread. Off in the dock, where the panel's
   * own pale background is the container.
   */
  framed?: boolean
  /**
   * `document` renders each answer as its own sheet — 01 Summary, 02 Details —
   * the way the full report reads. Used where the answer *is* the page rather
   * than a reply in a thread; the card then carries its own frame.
   */
  answerLayout?: 'inline' | 'document'
  /**
   * Identity band across the top of every document answer — which agent read
   * what. Every sheet carries it, not just the first: an answer three questions
   * down the thread is still a document someone will scroll straight to.
   */
  answerHeader?: ReactNode
  onOpenEvidence?: (ref: UserTestEvidenceRef) => void
  onHandoffToOracle?: (question: string) => void
  className?: string
}

/** Long enough for the pending sheet to register, short enough not to be a wait. */
export const ANSWER_DELAY_MS = 1400

/** The canned answer for a question, or the honest fallback. Shared with hosts that own the composer. */
export function answerFor(question: string) {
  return USER_TEST_ASK_ANSWERS[question] ?? USER_TEST_ASK_FALLBACK
}

/**
 * Ask, then answer — the one implementation every caller uses.
 *
 * A question typed into the composer on the home screen and a follow-up typed
 * at the foot of a run page are the same act: the same agent reads the same
 * recordings and writes the same kind of sheet. They were not behaving that
 * way. The composer navigated straight to a page with the answer already on
 * it, while a follow-up posted the question and held the pending line for
 * ANSWER_DELAY_MS — so the wait looked like a property of *where* you asked
 * rather than of asking, and the first question of a session was the only one
 * in the product that appeared to be answered before it was sent.
 *
 * One function now, so the two cannot drift apart again. `apply` takes an
 * updater rather than a value because one host owns its turns as React state
 * and the other has them handed down controlled — see the call sites.
 *
 * Returns the turn's id, or null if there was nothing to ask.
 */
export function askQuestion(
  question: string,
  apply: (update: (prev: UserTestAskTurn[]) => UserTestAskTurn[]) => void,
): string | null {
  const trimmed = question.trim()
  if (!trimmed) return null
  const id = `ask-${Date.now()}`
  apply((prev) => [...prev, { id, question: trimmed, answer: null }])
  /* The deferred answer lands on whatever the thread looks like when the timer
     fires, not on the one the question was asked against — which is why this
     is an updater and not a captured array. */
  window.setTimeout(() => {
    apply((prev) => prev.map((t) => (t.id === id ? { ...t, answer: answerFor(trimmed) } : t)))
  }, ANSWER_DELAY_MS)
  return id
}

/**
 * An answer, arriving.
 *
 * The sheet arrives first, already signed with the same agent block and the
 * same Sources band the answer will carry, and its body holds the shape of
 * what is coming: the real "01 Summary" heading with the status where its meta
 * goes, then two paragraphs of skeleton text. Nothing moves when the answer
 * lands — it fills the shape that was already on screen.
 *
 * The status line cycles rather than sitting still. A single frozen phrase for
 * a second and a half reads as stuck, and the words are deliberately generic:
 * they say the question is being worked on, not that a particular result is
 * coming. That matters because not every answer is a summary — some are a
 * table, one is a refusal — so the skeleton stands for "an answer, about this
 * long", never for a promise about its shape.
 *
 * Inline hosts get the status line on its own: there is no sheet to fill, so
 * there is nothing to draw the shape of.
 */
const WAIT_WORDS = ['Working', 'Reading the sessions', 'Checking the clips', 'Writing it up']

/**
 * The cycling status, on its own. Exported because every wait for an answer in
 * User Test is this one — the question typed into the composer on the home
 * screen, a follow-up asked at the foot of the run page, and a follow-up asked
 * under the report band are the same act with the same corpus behind it.
 */
export function AgentWaitLine() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % WAIT_WORDS.length), 900)
    return () => window.clearInterval(t)
  }, [])
  return (
    <span
      className="inline-flex items-center gap-xs font-body text-s text-text-tertiary leading-[1.5]"
      role="status"
    >
      <Spinner size={16} tone="neutral" />
      {WAIT_WORDS[i]}…
    </span>
  )
}

function AnswerPending({ inSheet, header }: { inSheet?: boolean; header?: ReactNode }) {
  if (!inSheet) return <AgentWaitLine />
  return (
    <article
      className="skeleton-surface flex flex-col w-full rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
      aria-busy
    >
      {header}
      <section className="flex flex-col gap-m px-l py-l">
        <SectionHeading index="01" title="Summary" meta={<AgentWaitLine />} />
        <div className="flex flex-col gap-m max-w-[92ch]">
          <SkeletonText lines={3} lineHeight={14} gap={12} lastWidth="62%" />
          <SkeletonText lines={2} lineHeight={14} gap={12} lastWidth="40%" />
        </div>
      </section>
    </article>
  )
}

export function UserTestAskPanel({
  sessionCount = 10,
  initialTurns = [],
  turns: controlledTurns,
  onTurnsChange,
  hideHeading = false,
  bare = false,
  hideComposer = false,
  framed = false,
  answerLayout = 'inline',
  answerHeader,
  onOpenEvidence,
  onHandoffToOracle,
  className,
}: UserTestAskPanelProps) {
  const [ownTurns, setOwnTurns] = useState<UserTestAskTurn[]>(initialTurns)
  const turns = controlledTurns ?? ownTurns
  const setTurns = (next: (prev: UserTestAskTurn[]) => UserTestAskTurn[]) => {
    if (controlledTurns) onTurnsChange?.(next(controlledTurns))
    else setOwnTurns(next)
  }
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  /* Follow the newest turn. In a docked window the thread is taller than the
     window, so an answer that arrives below the fold reads as no answer. */
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    endRef.current?.scrollIntoView({ block: 'end', behavior: reduce ? 'auto' : 'smooth' })
  }, [turns.length, turns[turns.length - 1]?.answer])

  /* The deferred answer must land on whatever the thread looks like when the
     timer fires, not on the closure it was scheduled in. */
  const answerRef = useRef<(id: string, question: string) => void>(() => {})
  answerRef.current = (id, question) => {
    const answer = USER_TEST_ASK_ANSWERS[question] ?? USER_TEST_ASK_FALLBACK
    const next = turns.map((t) => (t.id === id ? { ...t, answer } : t))
    if (controlledTurns) onTurnsChange?.(next)
    else setOwnTurns(next)
  }

  const ask = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return
    const id = `${Date.now()}`
    setTurns((prev) => [...prev, { id, question: trimmed, answer: null }])
    setDraft('')
    window.setTimeout(() => {
      answerRef.current(id, trimmed)
    }, ANSWER_DELAY_MS)
  }

  return (
    <div
      className={['flex flex-col gap-s w-full', bare ? '' : 'px-l py-l', className]
        .filter(Boolean)
        .join(' ')}
      style={
        hideHeading
          ? undefined
          : {
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-page-pale)',
            }
      }
    >
      {!hideHeading && (
        <div className="flex flex-col gap-xxs">
          <h3 className="font-display text-s font-semibold text-text-primary leading-[1.5]">
            Ask User Test about this run
          </h3>
          <p className="font-body text-xs text-text-tertiary leading-[1.6] max-w-[80ch]">
            Answered from this run’s {sessionCount} sessions and its findings — every claim links
            back to the clip it came from. Questions that need live player data are handed to
            Oracle instead of guessed at.
          </p>
        </div>
      )}

      {/* One break, used twice. A question and its answer are one thing and stay
          close (gap-s); every boundary *between* exchanges — and the boundary
          between the run's own message and the first follow-up — gets the same
          64px, so the thread reads as a series of exchanges rather than one
          unbroken column. The answers are full document sheets now, and at 20px
          the bottom of one sat as near the next question as that question sat
          to its own answer.

          The top break is 44px because both hosts put this panel in a `gap-l`
          column, which already contributes the other 20 — the two together make
          the same 64 as the gap between turns. */}
      {turns.length > 0 && (
        <div className="flex flex-col gap-xxl3 w-full pt-[44px]">
          {turns.map((turn) => (
            <div key={turn.id} className="flex flex-col gap-s w-full">
              <UserPrompt text={turn.question} />
              {/* A document answer is its own sheet, so the frame would be a
                  second border around the first. */}
              <div
                className={framed && answerLayout === 'inline' ? 'w-full rounded-2xl px-l py-m' : 'w-full'}
                style={
                  framed && answerLayout === 'inline'
                    ? {
                        backgroundColor: 'var(--bg-elements)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)',
                      }
                    : undefined
                }
              >
                {turn.answer ? (
                  <UserTestAnswerCard
                    answer={turn.answer}
                    layout={answerLayout}
                    header={answerHeader}
                    onOpenEvidence={onOpenEvidence}
                    onHandoffToOracle={() => onHandoffToOracle?.(turn.question)}
                  />
                ) : (
                  <AnswerPending inSheet={answerLayout === 'document'} header={answerHeader} />
                )}
              </div>
            </div>
          ))}
          {/* The composer is sticky over the foot of the thread, so "scroll to
              the end" has to stop a composer's height short of it. */}
          <div ref={endRef} aria-hidden style={{ scrollMarginBottom: 'var(--composer-clearance)' }} />
        </div>
      )}

      {!hideComposer && (
      <form
        className="composer-field flex items-center gap-s rounded-xl px-m py-xs"
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-default)' }}
        onSubmit={(e) => {
          e.preventDefault()
          ask(draft)
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Explicit rather than leaning on implicit form submission — this
            // is a chat input, and Enter has to send in every host.
            if (e.key === 'Enter') {
              e.preventDefault()
              ask(draft)
            }
          }}
          placeholder={`Ask about these ${sessionCount} sessions…`}
          aria-label={`Ask User Test about these ${sessionCount} sessions`}
          className="composer-input flex-1 min-w-0 bg-transparent border-0 outline-none font-body text-s text-text-primary placeholder:text-text-placeholder leading-[1.5]"
        />
        <Button variant="primary" size="md" type="submit" rightIcon={<SendIcon size={16} />}>
          Ask
        </Button>
      </form>
      )}
    </div>
  )
}
