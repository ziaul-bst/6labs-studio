/**
 * FunctionalTestView — Functional test and External agency test.
 *
 * One view, two variants, because the mechanism is identical: recordings of
 * tests someone already ran, plus the test cases they were meant to cover, and
 * 6labs verifies each case against the footage. Nothing is re-run. What
 * differs is who ran them — your team, or an agency you are paying — which
 * changes the copy, the accent, and whether a behavioural pass is added on
 * top (an agency batch gets the UX findings for free, so you can hold the
 * agency to more than "did it pass").
 *
 * Two tabs: set up a new verification, or read the reports it has produced.
 * The setup is two zones (recordings, test cases — both required), a name,
 * and one button. A started run joins the history as "in progress" and opens
 * on its live progress; it flips to done on its own.
 *
 * Code-first prototype — from the revamp artifact (screens s41 / s44).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { runDateLabel } from '../../lib/runDate'
import { useRunDemoSeed } from '../../lib/runDemoState'
import { TestingPageHeader } from '../molecules/TestingPageHeader'
import { TestingTabs } from '../molecules/TestingTabs'
import { RunHistoryList } from '../molecules/RunHistoryList'
import { SelectedVideosStrip } from '../molecules/SelectedVideosStrip'
import {
  FieldLabel,
  SetupCard,
  SetupFooter,
  SetupNote,
  SetupZone,
  ZoneFileList,
  ZoneFilledHeader,
  ZoneFooter,
} from '../molecules/TestingSetupPieces'
import { UserTestRunSetupModal } from './UserTestRunSetupModal'
import { FunctionalReportView } from './FunctionalReportView'
import { runFailureText } from '../molecules/RunFailedNotice'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { FunctionalTestIcon } from '../icons/FunctionalTestIcon'
import { AgencyTestIcon } from '../icons/AgencyTestIcon'
import { PlayIcon } from '../icons/PlayIcon'
import { UploadIcon } from '../icons/UploadIcon'
import { FUNCTIONAL_HISTORY, SAMPLE_TEST_CASE_FILES } from '../../lib/mocks/testing'
import { useHistoryDemoSeed } from '../../lib/historyDemoState'
import { PICKER_VIDEOS } from '../../lib/mocks/user-test'
import type { TestCaseFile, TestRunHistoryItem } from '../../lib/types/testing'

export type FunctionalVariant = 'functional' | 'agency'
export type FunctionalScreen = 'home' | 'report'

export interface FunctionalTestViewProps {
  variant?: FunctionalVariant
  /** Reports which screen is showing, for the page gradient. */
  onScreenChange?: (screen: FunctionalScreen) => void
  /** Storybook / review: open on the history tab. */
  initialTab?: 'new' | 'history'
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
  /** Way out of the picker's empty-library state — navigates to the Library. */
  onOpenLibrary?: () => void
  className?: string
}

const COPY: Record<
  FunctionalVariant,
  {
    title: string
    description: string
    accent: 'teal' | 'purple'
    recordingsHint: string
    casesHint: string
    defaultName: string
    cta: string
    /**
     * Closing note under the composer — what the run produces, and that it is
     * not something to sit and watch. Same slot the AI behavioural and User
     * Test composers use.
     */
    outcome: string
  }
> = {
  functional: {
    title: 'Functional test',
    description:
      'Upload the tests you already ran. 6labs checks what happened in each video — did every action complete — and makes them searchable.',
    accent: 'teal',
    recordingsHint: 'Recordings of tests your team has already run. Select a batch by tag.',
    casesHint: 'The test cases these recordings were intended to cover — as a spreadsheet of cases.',
    defaultName: 'Build V2.2 — tutorial regression',
    cta: 'Verify test cases',
    outcome:
      'Every recording is checked against your test cases — pass, fail, or never attempted — with the clip for each result. Analysis runs in the background; the report lands in Run history when it is done.',
  },
  agency: {
    title: 'External agency test',
    description:
      'Upload sessions from your QA agency. 6labs runs the same analysis across every session — objective, comparable results you can hold the agency to.',
    accent: 'purple',
    recordingsHint: 'Sessions uploaded by your QA agency. Select a batch by tag.',
    casesHint: 'The test cases the agency was asked to execute.',
    defaultName: 'Agency batch — September',
    cta: 'Verify & analyse',
    outcome:
      'Every session the agency delivered is checked against the same test cases, so the results are comparable batch to batch. Analysis runs in the background; the report lands in Run history when it is done.',
  },
}

const SIMULATED_RUN_MS = 14000

export function FunctionalTestView({
  variant = 'functional',
  onScreenChange,
  initialTab = 'new',
  onTabChange,
  onPickerOpenChange,
  onOpenLibrary,
  className,
}: FunctionalTestViewProps) {
  const copy = COPY[variant]
  const agency = variant === 'agency'
  const [tab, setTab] = useState<'new' | 'history'>(initialTab)
  useEffect(() => {
    onTabChange?.(tab)
  }, [tab, onTabChange])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [testCases, setTestCases] = useState<TestCaseFile[]>([])
  const [runName, setRunName] = useState(copy.defaultName)
  const [pickerOpen, setPickerOpen] = useState(false)
  useEffect(() => {
    onPickerOpenChange?.(pickerOpen)
  }, [pickerOpen, onPickerOpenChange])
  const [runs, setRuns] = useState<TestRunHistoryItem[]>(FUNCTIONAL_HISTORY)
  const [openRun, setOpenRun] = useState<TestRunHistoryItem | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)

  /* Run-flow presets. No thread step here, so 'thread' lands on the report —
     see lib/runDemoState. */
  useRunDemoSeed((state) => {
    if (state === 'composer') {
      setOpenRun(null)
      return
    }
    const base = FUNCTIONAL_HISTORY[0]
    setOpenRun(
      state === 'running'
        ? /* Distinct id for the same reason as User Test — a seeded id resolves
             back to its finished copy. */
          { ...base, id: 'demo-running', state: 'progress', result: undefined, when: runDateLabel() }
        : { ...base, state: 'done' },
    )
  })
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  useEffect(() => {
    onScreenChange?.(openRun ? 'report' : 'home')
  }, [openRun, onScreenChange])
  /* Review dock: reseed the history and show it. */
  useHistoryDemoSeed(FUNCTIONAL_HISTORY, ({ runs: seeded, highlightId: hl, initial }) => {
    setRuns(seeded)
    setHighlightId(hl)
    if (!initial) setTab('history')
  })

  const selected = useMemo(() => PICKER_VIDEOS.filter((v) => selectedIds.includes(v.id)), [selectedIds])
  const ready = selected.length > 0 && testCases.length > 0

  const finishRun = (id: string) =>
    setRuns((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, state: 'done', result: { kind: 'counts', passed: 42, failed: 3, review: 2 } } : r,
      ),
    )

  const startRun = () => {
    if (!ready) return
    const tags = [...new Set(selected.map((v) => v.tag))]
    const run: TestRunHistoryItem = {
      id: `ft-${Date.now()}`,
      name: runName.trim() || 'Functional verification',
      detail: `${selected.length} videos · ${testCases[0].name}`,
      meta: tags[0] ?? '—',
      state: 'progress',
      when: runDateLabel(),
      withUx: agency,
    }
    setRuns((prev) => [run, ...prev])
    setHighlightId(run.id)
    setTab('history')
    timers.current.push(window.setTimeout(() => finishRun(run.id), SIMULATED_RUN_MS))
  }

  if (openRun) {
    const run = runs.find((r) => r.id === openRun.id) ?? openRun
    return (
      <FunctionalReportView
        title={run.name}
        subtitle={`${run.detail} · ${run.meta} · verified by 6labs agent`}
        mode="human"
        withUx={run.withUx}
        inProgress={run.state === 'progress'}
        failure={runFailureText(run)}
        onDone={() => finishRun(run.id)}
        onBack={() => setOpenRun(null)}
        onRunAgain={() => {
          setOpenRun(null)
          setTab('new')
        }}
        className={className}
      />
    )
  }

  const Icon = agency ? AgencyTestIcon : FunctionalTestIcon

  return (
    <div className={['flex flex-col gap-l page-measure pt-[120px] pb-xxl3', className].filter(Boolean).join(' ')}>
      <TestingPageHeader
        title={copy.title}
        description={copy.description}
        icon={<Icon size={32} />}
        accent={copy.accent}
      />

      <TestingTabs
        ariaLabel={`${copy.title} sections`}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'new', label: 'New run' },
          { value: 'history', label: 'Run history', count: runs.length },
        ]}
      />

      {tab === 'new' ? (
        <div className="flex flex-col gap-m w-full">
          <p className="font-body text-s text-text-secondary leading-[1.6] max-w-[92ch]">
            Select the recordings and the test cases they were intended to cover. 6labs verifies each
            case against the footage and reports it as passed, failed, or not verifiable. No tests are re-run.
          </p>

          <div className="grid gap-m w-full" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <SetupZone
              filled={selected.length > 0}
              icon={<PlayIcon size={20} />}
              title="Select the recordings"
              description={copy.recordingsHint}
              required
              accent={copy.accent}
              onClick={() => setPickerOpen(true)}
            >
              <ZoneFilledHeader
                icon={<PlayIcon size={16} />}
                title={`${selected.length} video${selected.length === 1 ? '' : 's'} selected`}
                onRemove={() => setSelectedIds([])}
              />
              <SelectedVideosStrip videos={selected} maxThumbs={4} showCount={false} />
              <ZoneFooter>
                <button type="button" onClick={() => setPickerOpen(true)} className="font-semibold text-text-brand hover:underline">
                  Change selection
                </button>
              </ZoneFooter>
            </SetupZone>

            <SetupZone
              filled={testCases.length > 0}
              icon={<UploadIcon size={20} />}
              title="Add the test cases"
              description={copy.casesHint}
              formats="CSV · XLSX"
              required
              accent={copy.accent}
              onClick={() => setTestCases([SAMPLE_TEST_CASE_FILES[0]])}
            >
              <ZoneFileList
                files={testCases}
                onRemove={(f) => setTestCases((prev) => prev.filter((x) => x.name !== f.name))}
                onAdd={() =>
                  setTestCases((prev) => {
                    const next = SAMPLE_TEST_CASE_FILES.find((f) => !prev.some((p) => p.name === f.name))
                    return next ? [...prev, next] : prev
                  })
                }
              />
            </SetupZone>
          </div>

          <SetupCard
            title="Name this run"
            hint="A descriptive name makes the run easy to find and compare against later builds."
            /* The action closes the last card rather than floating under a
               page-wide rule, and its hint says what it is still waiting on. */
            footer={
              <SetupFooter
                hint={
                  ready
                    ? `${selected.length} video${selected.length === 1 ? '' : 's'} · ${testCases.length} file${testCases.length === 1 ? '' : 's'}`
                    : selected.length === 0 && testCases.length === 0
                      ? 'Select the recordings and add the test cases to run.'
                      : selected.length === 0
                        ? 'Select the recordings to run.'
                        : 'Add the test cases to run.'
                }
              >
                <Button variant="primary" size="lg" disabled={!ready} onClick={startRun}>
                  {copy.cta}
                </Button>
              </SetupFooter>
            }
          >
            <label className="flex flex-col gap-xs">
              <FieldLabel optional>Run name</FieldLabel>
              <Input value={runName} onChange={(e) => setRunName(e.target.value)} aria-label="Run name" size="lg" />
            </label>
          </SetupCard>

          <SetupNote>{copy.outcome}</SetupNote>
        </div>
      ) : (
        <RunHistoryList
          runs={runs}
          highlightId={highlightId}
          metaLabel="Tag"
          emptyTitle="No runs yet"
          emptyLabel="Pick footage and a test-case file, run it, and the report lands here."
          emptyAction={{ label: 'New run', onClick: () => setTab('new') }}
          onOpen={(run) => setOpenRun(run)}
        />
      )}

      <UserTestRunSetupModal
        isOpen={pickerOpen}
        pickOnly
        initialSelected={selectedIds}
        onOpenLibrary={onOpenLibrary}
        onClose={() => setPickerOpen(false)}
        onPick={(ids) => {
          setSelectedIds(ids)
          setPickerOpen(false)
        }}
      />
    </div>
  )
}
