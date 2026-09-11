/**
 * AIFunctionalTestView — AI players run your test cases on your build.
 *
 * The human functional test verifies footage that already exists; this one
 * produces it. So the setup swaps the recordings zone for a build picker: drop
 * the cases, pick the build (an older build re-checks a failure you think a
 * new one introduced), optionally tell the agents where to start, and run.
 * The report is the same FunctionalReportView the human test uses — same
 * question, same table — with the progress card narrating agents instead of
 * videos.
 *
 * Code-first prototype — from the revamp artifact (screen s45).
 */

import { useEffect, useRef, useState } from 'react'
import { TestingPageHeader } from '../molecules/TestingPageHeader'
import { TestingTabs } from '../molecules/TestingTabs'
import { RunHistoryList } from '../molecules/RunHistoryList'
import { BuildPickerModal } from './BuildPickerModal'
import { useBuilds, verifiedVersionOf } from '../../lib/buildsDemoState'
import { CheckIcon } from '../icons/CheckIcon'
import {
  FieldLabel,
  InstructionsField,
  SetupCard,
  SetupFooter,
  SetupNote,
  SetupZone,
  ZoneFileList,
  ZoneFilledHeader,
  ZoneFooter,
} from '../molecules/TestingSetupPieces'
import { FunctionalReportView } from './FunctionalReportView'
import { runFailureText } from '../molecules/RunFailedNotice'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { AIPlayerIcon } from '../icons/AIPlayerIcon'
import { UploadIcon } from '../icons/UploadIcon'
import { AI_FUNCTIONAL_HISTORY, SAMPLE_TEST_CASE_FILES } from '../../lib/mocks/testing'
import { useHistoryDemoSeed } from '../../lib/historyDemoState'
import type { TestCaseFile, TestRunHistoryItem } from '../../lib/types/testing'

export type AIFunctionalScreen = 'home' | 'report'

export interface AIFunctionalTestViewProps {
  onScreenChange?: (screen: AIFunctionalScreen) => void
  initialTab?: 'new' | 'history'
  /**
   * Reports the active tab. The state machine dock shows the Run row or the
   * History row, never both — which one depends on the tab in view, and only
   * this component knows it.
   */
  onTabChange?: (tab: 'new' | 'history') => void
  className?: string
}

const SIMULATED_RUN_MS = 14000

export function AIFunctionalTestView({ onScreenChange, initialTab = 'new', onTabChange, className }: AIFunctionalTestViewProps) {
  const [tab, setTab] = useState<'new' | 'history'>(initialTab)
  useEffect(() => {
    onTabChange?.(tab)
  }, [tab, onTabChange])
  const [files, setFiles] = useState<TestCaseFile[]>([])
  const [build, setBuild] = useState<string | null>(null)
  const [buildPickerOpen, setBuildPickerOpen] = useState(false)
  const builds = useBuilds()
  const chosenBuild = builds.find((b) => b.status === 'ready' && verifiedVersionOf(b) === build) ?? null
  const [runName, setRunName] = useState('Season 9 — core loop')
  const [instructions, setInstructions] = useState('')
  const [runs, setRuns] = useState<TestRunHistoryItem[]>(AI_FUNCTIONAL_HISTORY)
  const [openRun, setOpenRun] = useState<TestRunHistoryItem | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  useEffect(() => {
    onScreenChange?.(openRun ? 'report' : 'home')
  }, [openRun, onScreenChange])
  /* Review dock: reseed the history and show it. */
  useHistoryDemoSeed(AI_FUNCTIONAL_HISTORY, ({ runs: seeded, highlightId: hl, initial }) => {
    setRuns(seeded)
    setHighlightId(hl)
    if (!initial) setTab('history')
  })

  const ready = files.length > 0 && build !== null

  const finishRun = (id: string) =>
    setRuns((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, state: 'done', result: { kind: 'counts', passed: 19, failed: 2, review: 3 } } : r,
      ),
    )

  const startRun = () => {
    if (!ready || !build) return
    const run: TestRunHistoryItem = {
      id: `aif-${Date.now()}`,
      name: runName.trim() || 'AI functional test',
      detail: `${files.length} file${files.length === 1 ? '' : 's'} · ${files[0].name} · started just now`,
      meta: build,
      state: 'progress',
      when: 'now',
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
        subtitle={`${run.detail.replace(' · started just now', '')} · build ${run.meta} · executed by AI Player, 3 agents`}
        mode="ai"
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

  return (
    <div className={['flex flex-col gap-l page-measure pt-[120px] pb-xxl3', className].filter(Boolean).join(' ')}>
      <TestingPageHeader
        title="AI functional test"
        description="AI players run your test cases on your build and report what passed, what failed and what they could not reach — with the video."
        icon={<AIPlayerIcon size={32} />}
        accent="success"
      />

      <TestingTabs
        ariaLabel="AI functional test sections"
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
            Each run records its own test cases, build and report, so results remain comparable across builds.
          </p>

          {/* The two inputs a run needs, side by side — the same shape the human
              functional test gives its recordings and cases. */}
          <div className="grid gap-m w-full" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <SetupZone
              filled={files.length > 0}
              icon={<UploadIcon size={20} />}
              title="Add your test cases"
              description="Upload a spreadsheet of test cases — one row per case."
              formats="CSV · XLSX"
              required
              accent="success"
              onClick={() => setFiles([SAMPLE_TEST_CASE_FILES[0]])}
            >
              <ZoneFileList
                files={files}
                onRemove={(f) => setFiles((prev) => prev.filter((x) => x.name !== f.name))}
                onAdd={() =>
                  setFiles((prev) => {
                    const next = SAMPLE_TEST_CASE_FILES.find((f) => !prev.some((p) => p.name === f.name))
                    return next ? [...prev, next] : prev
                  })
                }
              />
            </SetupZone>

            <SetupZone
              filled={build !== null}
              icon={<UploadIcon size={20} />}
              title="Choose a build"
              description="Upload an APK or IPA, or pick one you uploaded before. An earlier build shows whether a failure is new."
              formats="APK · IPA"
              required
              accent="success"
              onClick={() => setBuildPickerOpen(true)}
            >
              <ZoneFilledHeader icon={<CheckIcon size={16} />} title={build ?? ''} onRemove={() => setBuild(null)} />
              {chosenBuild && (
                <p className="font-body text-s text-text-secondary leading-[1.5] m-0 truncate">
                  {chosenBuild.fileName} · {chosenBuild.sizeLabel} · {chosenBuild.uploadedLabel}
                  {chosenBuild.newest ? ' · newest' : ''}
                </p>
              )}
              <ZoneFooter>
                <button type="button" onClick={() => setBuildPickerOpen(true)} className="font-semibold text-text-brand hover:underline">
                  Change build
                </button>
              </ZoneFooter>
            </SetupZone>
          </div>

          <BuildPickerModal
            isOpen={buildPickerOpen}
            value={build}
            onClose={() => setBuildPickerOpen(false)}
            onPick={setBuild}
          />

          <SetupCard
            title="Name this run"
            hint="Names make two builds comparable months later."
            /* The action closes the last card rather than floating under a
               page-wide rule, and its hint says what it is still waiting on. */
            footer={
              <SetupFooter
                hint={
                  ready
                    ? `${files.length} file${files.length === 1 ? '' : 's'} · ${build}`
                    : files.length === 0 && build === null
                      ? 'Add the test cases and choose a build to run.'
                      : files.length === 0
                        ? 'Add the test cases to run.'
                        : 'Choose a build to run.'
                }
              >
                <Button variant="primary" size="lg" disabled={!ready} onClick={startRun}>
                  Run test
                </Button>
              </SetupFooter>
            }
          >
            <label className="flex flex-col gap-xs">
              <FieldLabel optional>Run name</FieldLabel>
              <Input value={runName} onChange={(e) => setRunName(e.target.value)} aria-label="Run name" size="lg" />
            </label>
            <div className="flex flex-col gap-xs">
              <FieldLabel optional>Instructions</FieldLabel>
              <InstructionsField
                value={instructions}
                onChange={setInstructions}
                ariaLabel="Instructions for the AI players"
                placeholder="e.g. Start from a fresh install. Skip the tutorial for cases TC-10 onward. Use the test account bp_tester_03."
              />
            </div>
          </SetupCard>

          {/* What the run produces and that it is not something to wait on —
              same closing note the other three composers carry. */}
          <SetupNote>
            AI players execute every case against the build you picked and report pass, fail or blocked,
            each with the clip of the attempt. They play in the background — the report lands in Run
            history when the last case finishes.
          </SetupNote>
        </div>
      ) : (
        <RunHistoryList
          runs={runs}
          highlightId={highlightId}
          metaLabel="Build"
          emptyTitle="No runs yet"
          emptyLabel="Point the AI players at a build and a case file, run it, and the report lands here."
          emptyAction={{ label: 'New run', onClick: () => setTab('new') }}
          onOpen={(run) => {
            /* A file that was never executed has no report — take the user to run it. */
            if (run.state === 'never') {
              setTab('new')
              return
            }
            setOpenRun(run)
          }}
        />
      )}
    </div>
  )
}
