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
import type { TestingAccent } from '../../lib/studioAreas'
import { useRunDemoSeed } from '../../lib/runDemoState'
import { TestingPageHeader } from '../molecules/TestingPageHeader'
import { TestingBodySkeleton, TestingPageSkeleton } from '../molecules/TestingSkeletons'
import { usePageLoading } from '../../lib/pageLoading'
import { TestingTabs } from '../molecules/TestingTabs'
import { RunHistoryList } from '../molecules/RunHistoryList'
import { SelectedVideosStrip } from '../molecules/SelectedVideosStrip'
import {
  CaseSheetNote,
  FieldLabel,
  SampleSheetLink,
  SetupCard,
  SetupFooter,
  SetupNote,
  SetupZone,
  ZoneFileList,
  ZoneFilledHeader,
  ZoneFooter,
} from '../molecules/TestingSetupPieces'
import { UserTestRunSetupModal } from './UserTestRunSetupModal'
import { FunctionalTestReport } from './FunctionalTestReport'
import { runFailureText } from '../molecules/RunFailedNotice'
import { showToast } from '../atoms/Toast'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { FunctionalTestIcon } from '../icons/FunctionalTestIcon'
import { AgencyTestIcon } from '../icons/AgencyTestIcon'
import { PlayIcon } from '../icons/PlayIcon'
import { UploadIcon } from '../icons/UploadIcon'
import { FUNCTIONAL_HISTORY, SAMPLE_TEST_CASE_FILES, SAMPLE_TEST_CASE_SHEET } from '../../lib/mocks/testing'
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
    accent: TestingAccent
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
      'Your test cases, verified against your gameplay sessions, each verdict backed by a clip.',
    /* Blue, with User test — the accent encodes which group a test is in, not
       what kind of test it is. In teal it was the only Human card wearing a
       colour from nowhere, and it sat directly above an AI functional card in
       green: two functional tests, two greens, one of them human. */
    accent: 'brand',
    recordingsHint: 'These are sessions on which you want to run a functional test.',
    casesHint: 'Upload a CSV or XLSX file with one test case per row.',
    defaultName: 'Build V2.2 — tutorial regression',
    cta: 'Verify test cases',
    outcome:
      'Test cases are marked Passed, Failed, Needs Review, or Not Verified with supporting evidence. Analysis runs in the background, with results available in Run History.',
  },
  agency: {
    title: 'External agency test',
    description:
      'Upload sessions from your QA agency. 6labs runs the same analysis across every session — objective, comparable results you can hold the agency to.',
    /* Blue, with the rest of Human testing — see the note on the functional
       variant above. */
    accent: 'brand',
    recordingsHint: 'Sessions uploaded by your QA agency. Select a batch by tag.',
    casesHint: 'The test cases the agency was asked to execute.',
    defaultName: 'Agency batch — September',
    cta: 'Verify & analyse',
    outcome:
      'Every session the agency delivered is checked against the same test cases, so the results are comparable batch to batch. Analysis runs in the background; the report lands in Run history when it is done.',
  },
}

/** How long a submitted run sits in the queue before anything starts on it. */
const SIMULATED_QUEUE_MS = 3500
const SIMULATED_RUN_MS = 14000

/** Most case files one run may carry. */
const MAX_CASE_FILES = 3
/** How long an attached sheet spends transferring before it is readable. */
const SIMULATED_UPLOAD_MS = 1800

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
  /* The home's own beat, restarted on a tab change — moving from New run to
     Run history is a fetch, and the list should arrive the way the composer
     did. The report has its own; see FunctionalTestReport. */
  const loadPhase = usePageLoading(tab)

  /* Run-flow presets. No thread step here, so 'thread' lands on the report —
     see lib/runDemoState. */
  useRunDemoSeed((state) => {
    if (state === 'composer') {
      setOpenRun(null)
      return
    }
    const base = FUNCTIONAL_HISTORY[0]
    if (state === 'queued') {
      /* Distinct id for the same reason as User Test — a seeded id resolves
         back to its finished copy in `runs`. */
      setOpenRun({ ...base, id: 'demo-queued', state: 'queued', result: undefined, when: runDateLabel() })
      return
    }
    setOpenRun(
      state === 'running'
        ? { ...base, id: 'demo-running', state: 'progress', result: undefined, when: runDateLabel() }
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
  /* A sheet still transferring is not a sheet the run can read. */
  const uploading = testCases.some((f) => f.status === 'uploading')
  const ready = selected.length > 0 && testCases.length > 0 && !uploading

  /* Attaching a file is a transfer, not an assignment. The row lands straight
     away so the reader can see the list grow, and flips to ready when the
     sheet is actually there. */
  const attachFile = (file: TestCaseFile) => {
    setTestCases((prev) =>
      prev.length >= MAX_CASE_FILES || prev.some((p) => p.name === file.name)
        ? prev
        : [...prev, { ...file, status: 'uploading' }],
    )
    timers.current.push(
      window.setTimeout(
        () =>
          setTestCases((prev) => prev.map((f) => (f.name === file.name ? { ...f, status: 'ready' } : f))),
        SIMULATED_UPLOAD_MS,
      ),
    )
  }

  const finishRun = (id: string) =>
    setRuns((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, state: 'done', result: { kind: 'counts', passed: 42, failed: 3, review: 2, blocked: 1 } } : r,
      ),
    )

  const startRun = () => {
    if (!ready) return
    const tags = [...new Set(selected.map((v) => v.tag))]
    const run: TestRunHistoryItem = {
      id: `ft-${Date.now()}`,
      name: runName.trim() || 'Functional verification',
      detail: `${selected.length} sessions · ${testCases[0].name}`,
      /* The sheets the run was verified against, kept on the row so the report
         can hand them back as a download. */
      caseFiles: testCases,
      /* Every tag the selection carried, not just the first. A batch picked
         from three tags used to file itself under one of them, so the history
         said less about the run than the picker did. */
      meta: tags.join(', ') || '—',
      tags: tags.length ? tags : ['—'],
      /* Submitted, not started. Nothing has been read yet and the page says so
         — which is the honest first frame of a run, and the one the reader is
         handed instead of a list row that already claims to be in progress. */
      state: 'queued',
      when: runDateLabel(),
      withUx: agency,
    }
    setRuns((prev) => [run, ...prev])
    setHighlightId(run.id)
    /* Every agent confirms a submit the same way (2026-09-23). The run now
       lands in a list rather than on its own page, so the toast is what says
       "that worked" at the moment of pressing — the row is the record, this is
       the receipt. */
    showToast(
      `Verification queued — ${selected.length} session${selected.length === 1 ? '' : 's'} against ${testCases.length} case file${testCases.length === 1 ? '' : 's'}. Running in the background.`,
    )
    /* Back to the History tab, where the submitted run is now the top row —
       queued, with its control greyed until there is a report behind it. The
       run's own page was the destination for a while; it said nothing the row
       does not, so a submit ended on a page with nothing on it. */
    setTab('history')
    timers.current.push(
      window.setTimeout(
        () => setRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, state: 'progress' } : r))),
        SIMULATED_QUEUE_MS,
      ),
    )
    timers.current.push(
      window.setTimeout(() => finishRun(run.id), SIMULATED_QUEUE_MS + SIMULATED_RUN_MS),
    )
  }

  /* Below the run branch, not above it. Above, pinning the dock's Loading
     switch while a report was open replaced that report with the composer's
     skeleton — the reviewer asked what this screen looks like loading and was
     shown a different screen. Each screen owns its own. */
  if (openRun) {
    const run = runs.find((r) => r.id === openRun.id) ?? openRun
    return (
      <FunctionalTestReport
        title={run.name}
        subtitle={`${run.detail} · ${run.meta} · verified by 6labs agent`}
        mode="human"
        withUx={run.withUx}
        caseFiles={run.caseFiles}
        queued={run.state === 'queued'}
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

  /* Arriving draws the whole screen; refreshing draws only the panel under the
     tabs. The header and the tab bar do not change when the tab does — and the
     tab the reader just pressed must not vanish under the cursor, nor take the
     active-tab marker with it. */
  const skeletonBody = tab === 'history' ? 'list' : 'composer'
  if (loadPhase === 'initial')
    return (
      <TestingPageSkeleton body={skeletonBody} label={`Loading ${copy.title}`} className={className} />
    )

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

      {/* No preamble under the tabs. The two zones say what they want in 16px
          bold inside themselves, and the note at the foot of the page said what
          the run produces — a paragraph between the tabs and the first control
          was the same thing a third time, above anything the reader could act
          on. */}
      {loadPhase === 'refresh' ? (
        <TestingBodySkeleton body={skeletonBody} />
      ) : tab === 'new' ? (
        <div className="flex flex-col gap-m w-full">
          <div className="grid gap-m w-full" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <SetupZone
              filled={selected.length > 0}
              icon={<PlayIcon size={20} />}
              title="Select gameplay sessions"
              filledTitle="Sessions"
              description={copy.recordingsHint}
              required
              accent={copy.accent}
              onClick={() => setPickerOpen(true)}
            >
              <ZoneFilledHeader
                icon={<PlayIcon size={16} />}
                title={`${selected.length} session${selected.length === 1 ? '' : 's'} selected`}
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
              title="Add test cases"
              filledTitle="Test cases"
              description={copy.casesHint}
              formats="CSV · XLSX"
              required
              accent={copy.accent}
              /* Empty only: once a sheet is attached the link moves into the
                 file list's own footer row, opposite "Add another file". */
              note={
                testCases.length === 0 ? (
                  <CaseSheetNote
                    required={SAMPLE_TEST_CASE_SHEET.required}
                    href={SAMPLE_TEST_CASE_SHEET.href}
                    label={SAMPLE_TEST_CASE_SHEET.label}
                  />
                ) : undefined
              }
              onClick={() => attachFile(SAMPLE_TEST_CASE_FILES[0])}
            >
              <ZoneFileList
                files={testCases}
                limit={MAX_CASE_FILES}
                limitReason={`${MAX_CASE_FILES} files is the most one run can verify against.`}
                trailing={<SampleSheetLink href={SAMPLE_TEST_CASE_SHEET.href} label={SAMPLE_TEST_CASE_SHEET.label} />}
                onRemove={(f) => setTestCases((prev) => prev.filter((x) => x.name !== f.name))}
                onAdd={() => {
                  const next = SAMPLE_TEST_CASE_FILES.find((f) => !testCases.some((p) => p.name === f.name))
                  if (next) attachFile(next)
                }}
              />
            </SetupZone>
          </div>

          {/* No heading. "Name this run" sat directly above a field labelled
              RUN NAME, and its hint explained the value of naming things. */}
          <SetupCard
            /* The action closes the last card rather than floating under a
               page-wide rule. Its hint only speaks when something is actually
               in the way: the two zones above already carry REQUIRED, and a
               line restating them under an obviously disabled button was the
               third place one screen asked for the same two things. */
            footer={
              <SetupFooter
                hint={uploading ? 'Waiting for the test cases to finish uploading.' : undefined}
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

          {/* What the run produces and that it is not something to sit and
              watch — the same closing note the other three composers carry, in
              the same slot. */}
          <SetupNote>{copy.outcome}</SetupNote>
        </div>
      ) : (
        <RunHistoryList
          runs={runs}
          highlightId={highlightId}
          metaLabel="Tags"
          emptyTitle="No runs yet"
          emptyLabel="Pick sessions and a test-case file, run it, and the report lands here."
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
