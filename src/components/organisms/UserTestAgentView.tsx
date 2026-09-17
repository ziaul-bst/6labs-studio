/**
 * UserTestAgentView — the whole User Test agent, from home to report.
 *
 * Four screens, one owner. Home is a composer with a history tab holding both
 * the reports it has produced and the questions it has answered; a run in
 * flight opens as a thread you watch; a finished run opens as its summary —
 * what it found and how big it was; and the full report is the summary's leaf.
 * They stay in one view because they are one task — a batch is set up,
 * watched, read, and then read in detail — and a run has no id worth putting
 * in the URL until it has run.
 *
 * With no footage in the library the home is replaced by the zero-state
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
import { runFailureText } from '../molecules/RunFailedNotice'
import { TestRunThread } from './TestRunThread'
import { UserTestReport } from './UserTestReport'
import { UserTestRunSummary } from './UserTestRunSummary'
import { MembersIcon } from '../icons/MembersIcon'
import { showToast } from '../atoms/Toast'
import { THREAD_SESSIONS, USER_TEST_HISTORY } from '../../lib/mocks/testing'
import { useHistoryDemoSeed } from '../../lib/historyDemoState'
import { PICKER_VIDEOS, USER_TEST_ISSUES, USER_TEST_REPORT_META } from '../../lib/mocks/user-test'
import type { TestRunHistoryItem } from '../../lib/types/testing'
import type { UserTestAskTurn } from '../../lib/types/userTest'

export type UserTestScreen = 'home' | 'thread' | 'summary' | 'report'

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

const SIMULATED_RUN_MS = 16000
const SAMPLE_RUN: TestRunHistoryItem = {
  id: 'sample',
  name: 'Sample report — Whiteout Survival onboarding',
  detail: '10 videos · Onboarding flow v3',
  meta: 'Build V2.1',
  state: 'done',
  result: { kind: 'issues', count: 7 },
  when: 'Aug 26',
}

/** Where the thread came from — decides its request line and status. */
interface OpenThread {
  run: TestRunHistoryItem
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
  const [thread, setThread] = useState<OpenThread | null>(() =>
    initialScreen === 'home'
      ? null
      : { run: USER_TEST_HISTORY[0], gameContext: 'Onboarding flow v3', videoCount: 10 },
  )
  /* Which leaf of an open run is showing. Only meaningful while `thread` is
     set; the screen falls back to the home the moment it is cleared. */
  const [stage, setStage] = useState<RunStage>(
    initialScreen === 'home' ? 'thread' : (initialScreen as RunStage),
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
      setThread(null)
      setStage('thread')
      return
    }
    /* A follow-up mid-flight. The turn is seeded with a null answer and nothing
       is scheduled to resolve it, so the pending sheet stays on screen — the
       real one is only up for ANSWER_DELAY_MS, which is not long enough to look
       at. Any other preset clears the thread so it opens on its own answer. */
    setAskTurns(
      state === 'asking'
        ? [{ id: 'demo-pending', question: 'Which device saw the most bugs?', answer: null }]
        : [],
    )
    setThread({
      run: { ...USER_TEST_HISTORY[0], state: 'done' },
      gameContext: 'Onboarding flow v3',
      videoCount: 10,
    })
    setStage(state === 'thread' ? 'thread' : state === 'report' ? 'report' : 'summary')
  })

  const screen: UserTestScreen = thread ? stage : 'home'
  useEffect(() => {
    onScreenChange?.(screen)
  }, [screen, onScreenChange])

  const hasFootage = libraryVideoCount > 0

  const finishRun = (id: string) =>
    setRuns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, state: 'done', result: { kind: 'issues', count: 7 } } : r)),
    )

  const generate = (videoIds: string[], gameContext: string | null, runName: string) => {
    const chosen = PICKER_VIDEOS.filter((v) => videoIds.includes(v.id))
    const tags = [...new Set(chosen.map((v) => v.tag))]
    const run: TestRunHistoryItem = {
      id: `ut-${Date.now()}`,
      /* The tag fills its own column, so an unnamed run falls back to the flow
         the footage was read against — the same shape as the seeded rows. */
      name: runName.trim() || gameContext || 'User test',
      detail: `${chosen.length} videos${gameContext ? '' : ' · no game context'}`,
      meta: tags.join(', ') || 'untagged',
      tags: tags.length ? tags : ['untagged'],
      state: 'progress',
      when: runDateLabel(),
    }
    setRuns((prev) => [run, ...prev])
    setHighlightId(run.id)
    timers.current.push(window.setTimeout(() => finishRun(run.id), SIMULATED_RUN_MS))
    showToast(`Analysis started — ${chosen.length} recording${chosen.length === 1 ? '' : 's'}. Reading in the background.`)
    setAskTurns([])
    /* The home stays put, on its History tab, with the new row highlighted and
       in progress. It used to open the run's thread and watch it fill — a
       sixteen-second screen whose whole content was a progress bar, which
       contradicted the toast that had just promised the work was happening in
       the background. The row carries the same progress and can be left. */
  }

  const openRun = (run: TestRunHistoryItem) => {
    setAskTurns([])
    /* A finished report opens on its summary — the run page. A run still in
       flight, and any question, has no summary to open: one is not done and
       the other was answered in the thread it was asked in. */
    setStage(run.state === 'done' && run.kind !== 'question' ? 'summary' : 'thread')
    setThread({
      run,
      /* A question row reopens as the question it was — the thread's request
         line and status both key off this, so a report never opens as an ask
         and an ask never opens as a report. */
      question: run.kind === 'question' ? run.name : undefined,
      gameContext: /no game context/.test(run.detail) ? null : 'Onboarding flow v3',
      videoCount: Number(run.detail.match(/^(\d+) videos/)?.[1] ?? 10),
    })
  }

  const closeThread = () => {
    setStage('thread')
    setThread(null)
  }

  return (
    <div
      className={[
        'relative w-full',
        screen === 'home' && !hasFootage ? 'h-full' : '',
        /* The thread pins its composer with `sticky bottom-0`, which only holds
           if the thread is at least as tall as the scroll viewport. The scroll
           container above has a definite height; this wrapper has to carry it
           down as a flex column so the thread can grow into it. The summary is
           a thread too — same composer, same requirement. */
        screen === 'thread' || screen === 'summary' ? 'flex flex-col h-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {screen === 'home' &&
        (hasFootage ? (
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
                detail: `${videoIds.length} videos${gameContext ? '' : ' · no game context'}`,
                /* The Tag column shows the footage's library tags, same as a report row. */
                meta: askedTags.join(', ') || 'untagged',
                tags: askedTags.length ? askedTags : ['untagged'],
                state: 'done',
                when: runDateLabel(),
              }
              setRuns((prev) => [asked, ...prev])
              setStage('thread')
              setThread({ run: asked, question, gameContext, videoCount: videoIds.length })
            }}
            onOpenSample={() => {
              setAskTurns([])
              setStage('summary')
              setThread({ run: SAMPLE_RUN, gameContext: 'Onboarding flow v3', videoCount: 10 })
            }}
          />
        ) : (
          <TestingHomeEmpty
            title="Add recordings to run a user test analysis"
            description="A user test analysis reads recorded sessions to find where players struggle. Upload footage you have, or record new sessions with the Recorder app."
            icon={<MembersIcon size={32} />}
            libraryVideoCount={libraryVideoCount}
            gameContextAdded={gameContextAdded}
            onOpenLibrary={onOpenLibrary}
            onGetRecorder={onGetRecorder}
          />
        ))}

      {screen === 'thread' && thread && (
        <TestRunThread
          className="flex-1"
          title={thread.run.name}
          request={{
            headline: `Analyse ${thread.videoCount} sessions`,
            detail: `tagged ${thread.run.meta} · ${thread.gameContext ? `context: ${thread.gameContext}` : 'no game context'} · no previous analysis`,
          }}
          sessions={THREAD_SESSIONS.slice(0, Math.min(thread.videoCount, 10))}
          totalSessions={thread.videoCount}
          /* Same footage the run page expands onto, so the Sources block shows
             one set of recordings across both screens. */
          sources={PICKER_VIDEOS.slice(0, thread.videoCount).map((v) => ({
            id: v.id,
            duration: v.duration,
            title: v.title,
          }))}
          gameContext={thread.gameContext}
          compared={thread.run.id === SAMPLE_RUN.id}
          sample={thread.run.id === SAMPLE_RUN.id}
          inProgress={(runs.find((r) => r.id === thread.run.id) ?? thread.run).state === 'progress'}
          failure={runFailureText(runs.find((r) => r.id === thread.run.id) ?? thread.run)}
          onDone={() => finishRun(thread.run.id)}
          onBack={closeThread}
          question={thread.question}
          askTurns={askTurns}
          onAskTurnsChange={setAskTurns}
          /* The thread's report card hands off to the run page, not straight
             to the evidence — the summary is what a finished run *is*. */
          onOpenReport={() => setStage('summary')}
          onOpenEvidence={() => setStage('report')}
          onOpenLibrary={onOpenLibrary}
          onHandoffToOracle={(q) => onAskOracle?.(q)}
        />
      )}

      {screen === 'summary' && (
        <UserTestRunSummary
          className="flex-1"
          runName={thread?.run.name ?? USER_TEST_HISTORY[0].name}
          issues={USER_TEST_ISSUES}
          sessionCount={thread?.videoCount ?? 10}
          /* The batch is 10; the analysis covered 9. Both screens say so, or
             the tile and every finding's denominator tell different stories. */
          analysedCount={USER_TEST_REPORT_META.analysedSessions}
          /* The footage the run read, so the Sources block expands onto the
             same recordings the batch was built from. */
          sources={PICKER_VIDEOS.slice(0, thread?.videoCount ?? 10).map((v) => ({
            id: v.id,
            duration: v.duration,
            title: v.title,
          }))}
          /* Same opening message the thread showed — the summary is that
             thread, re-opened after the run finished. */
          request={{
            headline: `Analyse ${thread?.videoCount ?? 10} sessions`,
            detail: `tagged ${thread?.run.meta ?? 'Build V2.1'} · ${
              thread?.gameContext ? `context: ${thread.gameContext}` : 'no game context'
            } · no previous analysis`,
          }}
          facts={{
            videos: thread ? `${thread.videoCount} videos · tag ${thread.run.meta}` : '10 videos',
            context: thread?.gameContext ?? null,
          }}
          askTurns={askTurns}
          onAskTurnsChange={setAskTurns}
          onBack={closeThread}
          onOpenReport={() => setStage('report')}
          onOpenLibrary={onOpenLibrary}
          onOpenEvidence={() => setStage('report')}
          onHandoffToOracle={(q) => onAskOracle?.(q)}
        />
      )}

      {screen === 'report' && (
        <UserTestReport
          runName={thread?.run.name ?? USER_TEST_HISTORY[0].name}
          issues={USER_TEST_ISSUES}
          onBackToRun={() => setStage('summary')}
        />
      )}
    </div>
  )
}
