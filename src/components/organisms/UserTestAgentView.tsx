/**
 * UserTestAgentView — the whole User Test agent, from home to report.
 *
 * Three screens, one owner. Home is a composer with a history tab holding both
 * the reports it has produced and the questions it has answered; every run and
 * every question opens on the same run page, whatever state it is in; and the
 * full report is that page's leaf. They stay in one view because they are one
 * task — a batch is set up, watched, read, and then read in detail — and a run
 * has no id worth putting in the URL until it has run.
 *
 * The thread screen is gone. A run used to open as a chat transcript while it
 * was in flight and as a summary once it finished, so the same row went to two
 * different layouts depending on a state the reader could not see before
 * clicking; a question went to the thread always. One page now, with the wait
 * as one of its states — which is also why submitting a run lands on it rather
 * than on the history list.
 *
 * With no sessions in the library the home is replaced by the zero-state
 * blocker: nothing here can run without recordings, so the first step is
 * getting some in, not learning the composer.
 *
 * Code-first prototype — revamp 2026-09-09 (artifact nav V1 · 1.1).
 */

import { useEffect, useRef, useState } from 'react'
import { runDateLabel } from '../../lib/runDate'
import { TestingHomeEmpty } from './TestingHomeEmpty'
import { UserTestHome } from './UserTestHome'
import { useRunDemoSeed } from '../../lib/runDemoState'
import { UserTestReport } from './UserTestReport'
import { UserTestRunSummary } from './UserTestRunSummary'
import { MembersIcon } from '../icons/MembersIcon'
import { showToast } from '../atoms/Toast'
import { answerFor, askQuestion } from './UserTestAskPanel'
import { USER_TEST_HISTORY } from '../../lib/mocks/testing'
import { useHistoryDemoSeed } from '../../lib/historyDemoState'
import { PICKER_VIDEOS, USER_TEST_ISSUES, USER_TEST_REPORT_META } from '../../lib/mocks/user-test'
import type { TestRunHistoryItem } from '../../lib/types/testing'
import type { UserTestAskTurn } from '../../lib/types/userTest'

export type UserTestScreen = 'home' | 'summary' | 'report'

/** The screens an open run can be on — every one but the home. */
type RunStage = Exclude<UserTestScreen, 'home'>

export interface UserTestAgentViewProps {
  /** Videos in the Gameplay Library — 0 turns the home into a blocker. */
  libraryVideoCount?: number
  gameContextAdded?: boolean
  /** Screen to land on. Storybook and review links use this. */
  initialScreen?: UserTestScreen
  /** Home tab to open on — Storybook shows the history directly. */
  initialTab?: 'new' | 'history'
  /**
   * Reports which screen is showing. The page gradient is pinned to the content
   * region rather than to this view, so the shell has to know whether we are on
   * the home (gradient) or inside a run (plain ground).
   */
  onScreenChange?: (screen: UserTestScreen) => void
  onOpenLibrary?: () => void
  /**
   * Reports the active tab. The state machine dock shows the Run row or the
   * History row, never both — which one depends on the tab in view, and only
   * this component knows it.
   */
  onTabChange?: (tab: 'new' | 'history') => void
  /**
   * Reports whether the session-picker popup is open. The Library fixture only
   * changes what that popup offers, so the dock's Library row rides on this.
   */
  onPickerOpenChange?: (open: boolean) => void
  onGetRecorder?: () => void
  /**
   * Leaves for Oracle with the question in hand. Only ever reached from an
   * answer User Test declined to give — see UserTestAskPanel.
   */
  onAskOracle?: (question: string) => void
  className?: string
}

/** How long a submitted run sits in the queue before the agent picks it up. */
const SIMULATED_QUEUE_MS = 3500
const SIMULATED_RUN_MS = 16000

/* The first *report* in the fixture list, for the presets that hold a run
   open. Row zero is a question, and seeding a queued run from it put a
   question's own sentence in the bar of a page reporting on ten sessions. */
const SEED_REPORT = USER_TEST_HISTORY.find((r) => (r.kind ?? 'report') === 'report') ?? USER_TEST_HISTORY[0]
const SAMPLE_RUN: TestRunHistoryItem = {
  id: 'sample',
  name: 'Sample report — Whiteout Survival onboarding',
  detail: '10 sessions · Onboarding flow v3',
  meta: 'Build V2.1',
  state: 'done',
  result: { kind: 'issues', count: 7 },
  when: 'Aug 26',
}

/** The run being read, and what it was run over. */
interface OpenRun {
  run: TestRunHistoryItem
  /** Set when the row is a question rather than a report. */
  question?: string
  gameContext: string | null
  videoCount: number
}

export function UserTestAgentView({
  libraryVideoCount = 42,
  gameContextAdded = true,
  initialScreen = 'home',
  initialTab = 'new',
  onScreenChange,
  onTabChange,
  onPickerOpenChange,
  onOpenLibrary,
  onGetRecorder,
  onAskOracle,
  className,
}: UserTestAgentViewProps) {
  const [runs, setRuns] = useState<TestRunHistoryItem[]>(USER_TEST_HISTORY)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  /* Review dock: a history preset reseeds the list and, when chosen on this
     screen, remounts the home on its History tab so the change is in view. */
  const [homeSeed, setHomeSeed] = useState(0)
  useHistoryDemoSeed(USER_TEST_HISTORY, ({ runs: seeded, highlightId: hl, initial }) => {
    setRuns(seeded)
    setHighlightId(hl)
    if (!initial) setHomeSeed((n) => n + 1)
  })
  const [open, setOpen] = useState<OpenRun | null>(() =>
    initialScreen === 'home'
      ? null
      : { run: SEED_REPORT, gameContext: 'Onboarding flow v3', videoCount: 10 },
  )
  /* Which leaf of an open run is showing. Only meaningful while `open` is set;
     the screen falls back to the home the moment it is cleared. */
  const [stage, setStage] = useState<RunStage>(
    initialScreen === 'home' ? 'summary' : (initialScreen as RunStage),
  )
  /* The follow-up thread lives here, not in the thread view, so it survives
     the trip to the full report and back. */
  const [askTurns, setAskTurns] = useState<UserTestAskTurn[]>([])
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  /* Run-flow presets — see lib/runDemoState. There is no 'running' here any
     more: a new run lands on the History tab as a row in progress, so the only
     thing a preset could hold open is a screen nothing routes to. */
  useRunDemoSeed((state) => {
    if (state === 'composer') {
      setOpen(null)
      setStage('summary')
      return
    }
    /* A follow-up mid-flight. The turn is seeded with a null answer and nothing
       is scheduled to resolve it, so the pending line stays on screen — the
       real one is only up for ANSWER_DELAY_MS, which is not long enough to
       look at. Every other preset clears the thread. */
    setAskTurns(
      state === 'asking'
        ? [{ id: 'demo-pending', question: 'Show me every clip where a tester quit', answer: null }]
        : state === 'question'
          ? [
              {
                id: 'demo-question',
                question: 'Which testers quit before finishing onboarding, and what were they doing right before?',
                answer: answerFor('Show me every clip where a tester quit'),
              },
            ]
          : [],
    )
    if (state === 'queued') {
      setOpen({
        run: { ...SEED_REPORT, id: 'demo-queued', state: 'queued', result: undefined, when: runDateLabel() },
        gameContext: 'Onboarding flow v3',
        videoCount: 10,
      })
      setStage('summary')
      return
    }
    setOpen({
      run: { ...SEED_REPORT, state: 'done' },
      question:
        state === 'question'
          ? 'Which testers quit before finishing onboarding, and what were they doing right before?'
          : undefined,
      gameContext: 'Onboarding flow v3',
      videoCount: 10,
    })
    setStage(state === 'report' ? 'report' : 'summary')
  })

  const screen: UserTestScreen = open ? stage : 'home'
  /* Resolved against the list, so a run that was queued when it was opened
     moves through analysing to its report without anyone reopening it. */
  const liveRun = (open && runs.find((r) => r.id === open.run.id)) || open?.run || SEED_REPORT
  useEffect(() => {
    onScreenChange?.(screen)
  }, [screen, onScreenChange])

  const hasSessions = libraryVideoCount > 0

  const finishRun = (id: string) =>
    setRuns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, state: 'done', result: { kind: 'issues', count: 7 } } : r)),
    )

  const advanceRun = (id: string, state: TestRunHistoryItem['state']) =>
    setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, state } : r)))

  const generate = (videoIds: string[], gameContext: string | null, runName: string) => {
    const chosen = PICKER_VIDEOS.filter((v) => videoIds.includes(v.id))
    const tags = [...new Set(chosen.map((v) => v.tag))]
    const run: TestRunHistoryItem = {
      id: `ut-${Date.now()}`,
      /* The tag fills its own column, so an unnamed run falls back to the flow
         the footage was read against — the same shape as the seeded rows. */
      name: runName.trim() || gameContext || 'User test',
      detail: `${chosen.length} sessions${gameContext ? '' : ' · no game context'}`,
      meta: tags.join(', ') || 'untagged',
      tags: tags.length ? tags : ['untagged'],
      /* Submitted, not started — see TestRunState. */
      state: 'queued',
      when: runDateLabel(),
    }
    setRuns((prev) => [run, ...prev])
    setHighlightId(run.id)
    timers.current.push(window.setTimeout(() => advanceRun(run.id, 'analysing'), SIMULATED_QUEUE_MS))
    timers.current.push(
      window.setTimeout(() => finishRun(run.id), SIMULATED_QUEUE_MS + SIMULATED_RUN_MS),
    )
    showToast(`Analysis queued — ${chosen.length} session${chosen.length === 1 ? '' : 's'}. Reading in the background.`)
    setAskTurns([])
    /* Straight to the run's own page, which opens on the queue and fills in
       where it stands. The home used to stay put on its History tab, which
       answered "did that work?" with a row in a list the reader then had to
       find — and this page says the same thing the toast does, in the place
       the report will appear. */
    setStage('summary')
    setOpen({ run, gameContext, videoCount: videoIds.length })
  }

  const openRun = (run: TestRunHistoryItem) => {
    const isQuestion = run.kind === 'question'
    /* A question reopens with its own answer already on the page — it was
       answered once and the page is the record of that, not a prompt to ask
       it again. */
    setAskTurns(isQuestion ? [{ id: run.id, question: run.name, answer: answerFor(run.name) }] : [])
    /* One destination, whatever state the row is in. The run page is the run:
       queued, reading, finished or answered, it is the same page with a
       different middle. */
    setStage('summary')
    setOpen({
      run,
      question: isQuestion ? run.name : undefined,
      gameContext: /no game context/.test(run.detail) ? null : 'Onboarding flow v3',
      videoCount: Number(run.detail.match(/^(\d+) (?:sessions|videos)/)?.[1] ?? 10),
    })
  }

  const closeRun = () => {
    setStage('summary')
    setOpen(null)
  }

  return (
    <div
      className={[
        'relative w-full',
        screen === 'home' && !hasSessions ? 'h-full' : '',
        /* The run page pins its composer with `sticky bottom-0`, which only
           holds if the page is at least as tall as the scroll viewport. The
           scroll container above has a definite height; this wrapper has to
           carry it down as a flex column so the page can grow into it. */
        screen === 'summary' ? 'flex flex-col h-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {screen === 'home' &&
        (hasSessions ? (
          <UserTestHome
            key={homeSeed}
            history={runs}
            highlightId={highlightId}
            initialTab={homeSeed > 0 ? 'history' : initialTab}
            onTabChange={onTabChange}
            onPickerOpenChange={onPickerOpenChange}
            onOpenLibrary={onOpenLibrary}
            onOpenRun={openRun}
            onGenerate={generate}
            onAsk={(question, videoIds, gameContext) => {
              setAskTurns([])
              const askedTags = [
                ...new Set(PICKER_VIDEOS.filter((v) => videoIds.includes(v.id)).map((v) => v.tag)),
              ]
              /* A question is history too — it lands in the same list as the
                 reports, which is why that tab is "History" and not "Report
                 history". */
              const asked: TestRunHistoryItem = {
                id: `q-${Date.now()}`,
                kind: 'question',
                name: question,
                detail: `${videoIds.length} sessions${gameContext ? '' : ' · no game context'}`,
                /* The Tag column shows the footage's library tags, same as a report row. */
                meta: askedTags.join(', ') || 'untagged',
                tags: askedTags.length ? askedTags : ['untagged'],
                state: 'done',
                when: runDateLabel(),
              }
              setRuns((prev) => [asked, ...prev])
              /* Posted pending and answered on the same clock a follow-up runs
                 on — see askQuestion. The page used to open with the answer
                 already written, which made the very first question of a
                 session the only one in the product that appeared to be
                 answered before it was sent. */
              setAskTurns([])
              askQuestion(question, setAskTurns)
              setStage('summary')
              setOpen({ run: asked, question, gameContext, videoCount: videoIds.length })
            }}
            onOpenSample={() => {
              setAskTurns([])
              setStage('summary')
              setOpen({ run: SAMPLE_RUN, gameContext: 'Onboarding flow v3', videoCount: 10 })
            }}
          />
        ) : (
          <TestingHomeEmpty
            title="Add sessions to run a user test analysis"
            description="A user test analysis reads recorded sessions to find where players struggle. Upload sessions you have, or record new ones with the Recorder app."
            icon={<MembersIcon size={32} />}
            libraryVideoCount={libraryVideoCount}
            gameContextAdded={gameContextAdded}
            onOpenLibrary={onOpenLibrary}
            onGetRecorder={onGetRecorder}
          />
        ))}

      {screen === 'summary' && open && (
        <UserTestRunSummary
          className="flex-1"
          runName={open.run.name}
          issues={USER_TEST_ISSUES}
          /* One page, four middles. The row's own state decides which: queued
             and analysing are waits, a question is a single answer sheet, and
             a finished report is the summary. */
          pending={
            liveRun.state === 'queued'
              ? 'queued'
              : liveRun.state === 'progress' || liveRun.state === 'analysing'
                ? 'analysing'
                : undefined
          }
          question={open.question}
          sessionCount={open.videoCount}
          /* The batch is 10; the analysis covered 9. Both screens say so, or
             the tile and every finding's denominator tell different stories. */
          analysedCount={USER_TEST_REPORT_META.analysedSessions}
          /* The sessions the run read, so the Sources block expands onto the
             same recordings the batch was built from. */
          sources={PICKER_VIDEOS.slice(0, open.videoCount).map((v) => ({
            id: v.id,
            duration: v.duration,
            title: v.title,
          }))}
          facts={{
            videos: `${open.videoCount} sessions · tag ${open.run.meta}`,
            tag: open.run.meta,
            context: open.gameContext,
          }}
          askTurns={askTurns}
          onAskTurnsChange={setAskTurns}
          onBack={closeRun}
          onOpenReport={() => setStage('report')}
          onOpenLibrary={onOpenLibrary}
          onOpenEvidence={() => setStage('report')}
          onHandoffToOracle={(q) => onAskOracle?.(q)}
        />
      )}

      {screen === 'report' && (
        <UserTestReport
          runName={open?.run.name ?? SEED_REPORT.name}
          issues={USER_TEST_ISSUES}
          onBackToRun={() => setStage('summary')}
        />
      )}
    </div>
  )
}
