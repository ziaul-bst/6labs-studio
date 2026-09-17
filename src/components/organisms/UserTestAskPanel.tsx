/**
 * UserTestAskPanel — follow-up questions about a finished run, answered by the
 * User Test agent rather than by Oracle.
 *
 * The split is about corpus, not capability. User Test holds this run: ten
 * recordings, seven findings, every clip and the game context they were graded
 * against. It can therefore answer "which device saw the most bugs" *and point
 * at the sessions*. Oracle holds live player data and cannot see any of this
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
 * Code-first prototype — no Figma source yet.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { UserTestAnswerCard } from '../molecules/UserTestAnswerCard'
import { UserPrompt } from '../atoms/UserPrompt'
import Button from '../ui/Button'
import { SendIcon } from '../icons/SendIcon'
import {
  USER_TEST_ASK_ANSWERS,
  USER_TEST_ASK_FALLBACK,
  USER_TEST_ASK_SUGGESTIONS,
} from '../../lib/mocks/user-test'
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
   * the bottom instead; the panel then only renders turns and suggestions, and
   * suggestion chips call `onAsk` so the host owns the question.
   */
  hideComposer?: boolean
  /**
   * Puts each answer in its own message container, the way the report card and
   * an Oracle response sit in the thread. Off in the dock, where the panel's
   * own pale background is the container.
   */
  framed?: boolean
  /**
   * Drops the suggested-question chips. The run summary hides them: it ends on
   * the report CTA, and a rail of questions under that band competed with the
   * one thing the message is asking you to do.
   */
  hideSuggestions?: boolean
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
  onAsk?: (question: string) => void
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
 * A spinner and one word while the answer is written.
 *
 * It replaced a cycling status list ("Reading this run's findings…", "Matching
 * clips to the question…"). Those lines described real work, but they turned a
 * sub-second wait into a performance the reader was made to sit through, and
 * the last line was always still on screen when the answer arrived — so it read
 * as a claim about what had been done rather than as a wait. One steady label
 * says the same thing and gets out of the way.
 *
 * On a document answer it waits *inside* the sheet, under the same agent block
 * the answer will carry. Bare on the page ground it was a grey line the width of
 * one word between two full-width cards, which is why it read as nothing
 * happening; the sheet arriving first, already signed, is the thing that says
 * an answer is coming and where it will be.
 */
function AnswerPending({ inSheet, header }: { inSheet?: boolean; header?: ReactNode }) {
  const label = (
    <span
      className="inline-flex items-center gap-xs font-body text-s text-text-tertiary leading-[1.5]"
      role="status"
    >
      <span className="testing-spinner-sm shrink-0" aria-hidden />
      Thinking…
    </span>
  )
  if (!inSheet) return label
  return (
    <article
      className="flex flex-col w-full rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      {header}
      <div className="px-l py-l">{label}</div>
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
  hideSuggestions = false,
  answerLayout = 'inline',
  answerHeader,
  onAsk,
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
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
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

  /* Suggestions that have already been asked drop off the rail — a chip that
     repeats an answer already on screen is a dead end. */
  const askedQuestions = new Set(turns.map((t) => t.question))
  const suggestions = USER_TEST_ASK_SUGGESTIONS.filter((s) => !askedQuestions.has(s))

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
            Answered from this run’s {sessionCount} recordings and its findings — every claim links
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
          <div ref={endRef} aria-hidden />
        </div>
      )}

      {!hideSuggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-xs pt-xxs">
          {suggestions.map((s) => {
            /* Marked as a handoff up front, so nobody spends a question
               discovering the boundary the hard way. */
            const handoff = Boolean(USER_TEST_ASK_ANSWERS[s]?.outOfScope)
            return (
              <button
                key={s}
                type="button"
                onClick={() => (hideComposer && onAsk ? onAsk(s) : ask(s))}
                className="user-test-ask-chip inline-flex items-center gap-xxs rounded-round px-s py-xxs font-body text-xs leading-[1.5]"
                style={{
                  backgroundColor: 'var(--bg-elements)',
                  border: `1px ${handoff ? 'dashed' : 'solid'} ${
                    handoff ? 'var(--border-tint)' : 'var(--border-default)'
                  }`,
                  color: handoff ? 'var(--text-brand)' : 'var(--text-secondary)',
                }}
              >
                {s}
                {handoff && <span aria-hidden>↗</span>}
              </button>
            )
          })}
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
