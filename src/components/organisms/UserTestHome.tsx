/**
 * UserTestHome — the User Test agent's home: a composer, not a form.
 *
 * Two things a PM does here, and the mode switch at the top of the card is the
 * choice between them: generate a full report on a batch of sessions, or just
 * ask the batch a question. Both start from the same selection — recordings
 * picked from the Gameplay Library by tag — so the videos sit in the card and
 * the mode changes what happens beneath them, never the selection itself.
 *
 * Game context is offered as a chip on the composer bar rather than a step:
 * it is optional, and its absence has a stated consequence (findings per
 * video, not grouped by step) rather than a warning.
 *
 * The second tab is the history — every analysis this agent has run,
 * newest first, in-progress rows included.
 *
 * Code-first prototype — from the revamp artifact (screen s0, nav V1).
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { TestingPageHeader } from '../molecules/TestingPageHeader'
import { TestingBodySkeleton, TestingPageSkeleton } from '../molecules/TestingSkeletons'
import { usePageLoading } from '../../lib/pageLoading'
import { Skeleton } from '../atoms/Skeleton'
import { TestingTabs } from '../molecules/TestingTabs'
import { RunHistoryList } from '../molecules/RunHistoryList'
import { SelectedVideosStrip } from '../molecules/SelectedVideosStrip'
import { TestingMenuSelect } from '../molecules/TestingMenuSelect'
import { FieldLabel, SetupNote } from '../molecules/TestingSetupPieces'
import { UserTestRunSetupModal } from './UserTestRunSetupModal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { MembersIcon } from '../icons/MembersIcon'
import { PlusIcon } from '../icons/PlusIcon'
import { SendIcon } from '../icons/SendIcon'
import { BulbIcon } from '../icons/BulbIcon'
import { USER_TEST_HOME_PROMPTS } from '../../lib/mocks/testing'
import { GAME_CONTEXT_DOCS, PICKER_VIDEOS } from '../../lib/mocks/user-test'
import type { TestRunHistoryItem } from '../../lib/types/testing'

export type UserTestHomeMode = 'report' | 'ask'

export interface UserTestHomeProps {
  history: TestRunHistoryItem[]
  highlightId?: string | null
  onOpenRun?: (run: TestRunHistoryItem) => void
  /** Generate a report on the selected videos, with the chosen context (or none). */
  onGenerate?: (videoIds: string[], gameContext: string | null, runName: string) => void
  /** Ask the selected videos a question. */
  onAsk?: (question: string, videoIds: string[], gameContext: string | null) => void
  /** Way out of the picker's empty-library state — navigates to the Library. */
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
  onOpenSample?: () => void
  initialTab?: 'new' | 'history'
  initialMode?: UserTestHomeMode
  className?: string
}

const NO_CONTEXT = '__none'

/** How long an uploaded context document spends transferring before it is readable. */
const SIMULATED_UPLOAD_MS = 2200

export function UserTestHome({
  history,
  highlightId,
  onOpenRun,
  onGenerate,
  onAsk,
  onOpenLibrary,
  onTabChange,
  onPickerOpenChange,
  onOpenSample,
  initialTab = 'new',
  initialMode = 'report',
  className,
}: UserTestHomeProps) {
  const [tab, setTab] = useState<'new' | 'history'>(initialTab)
  useEffect(() => {
    onTabChange?.(tab)
  }, [tab, onTabChange])
  const [mode, setMode] = useState<UserTestHomeMode>(initialMode)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  useEffect(() => {
    onPickerOpenChange?.(pickerOpen)
  }, [pickerOpen, onPickerOpenChange])
  const [docId, setDocId] = useState<string | null>(null)
  /**
   * Documents added in this session, and which of them are still arriving.
   * "Upload new" used to select an existing fixture the instant it was
   * pressed, so a file the reader had not chosen appeared on the chip as
   * though it had already been read. An upload is a transfer: the row lands
   * disabled with a spinner, the chip stays empty until it is there, and only
   * then does it become the chosen context.
   */
  const [uploads, setUploads] = useState<{ id: string; name: string; fileType: string; uploading: boolean }[]>([])
  const [runName, setRunName] = useState('')
  const [question, setQuestion] = useState('')
  /* Restarted on a tab change — New run and Run history read different
     things. The run page and the report have their own. */
  const loadPhase = usePageLoading(tab)

  const selected = useMemo(() => PICKER_VIDEOS.filter((v) => selectedIds.includes(v.id)), [selectedIds])
  const hasVideos = selected.length > 0
  const doc =
    GAME_CONTEXT_DOCS.find((d) => d.id === docId) ?? uploads.find((u) => u.id === docId && !u.uploading)
  const gameContext = doc ? doc.name.replace(/\.(pdf|docx)$/i, '') : null

  /* Both, not either. The button used to enable on a selection alone and send
     a canned prompt when the box was empty — so pressing it opened a thread
     for a question nobody typed. Asking needs something to ask and something
     to ask it of. */
  const hasQuestion = question.trim().length > 0
  const canAsk = hasVideos && hasQuestion

  const ask = () => {
    if (!canAsk) return
    onAsk?.(question.trim(), selectedIds, gameContext)
  }

  const uploadDoc = () => {
    const id = `upload-${Date.now()}`
    const name = 'Game design notes.pdf'
    setUploads((prev) => [...prev, { id, name, fileType: 'pdf', uploading: true }])
    window.setTimeout(() => {
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, uploading: false } : u)))
      /* Chosen only once it is actually there — selecting a file mid-transfer
         would put a context on the run that the run cannot read. */
      setDocId(id)
    }, SIMULATED_UPLOAD_MS)
  }

  /* The page as it will be, before it is. Drawn in the composer shape because
     that is the tab a reader lands on. */
  /* Arriving draws the whole screen; refreshing draws only the panel under the
     tabs. The header and the tab bar do not change when the tab does — and the
     tab the reader just pressed must not vanish under the cursor, nor take the
     active-tab marker with it. */
  const skeletonBody = tab === 'history' ? 'list' : 'card'
  if (loadPhase === 'initial')
    return (
      <TestingPageSkeleton body={skeletonBody} label="Loading User Test Agent" className={className} />
    )

  return (
    <div className={['flex flex-col gap-l page-measure pt-[120px] pb-xxl3', className].filter(Boolean).join(' ')}>
      <TestingPageHeader
        title="User Test Agent"
        description="Find where players struggle in your gameplay sessions. Generate a report or ask questions."
        icon={<MembersIcon size={32} />}
        accent="brand"
      />

      <TestingTabs
        ariaLabel="User Test Agent sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'new', label: 'New run' },
          /* "History", not "Run history" like the other tests: this tab holds
             questions as well as reports. */
          { value: 'history', label: 'Run history', count: history.length },
        ]}
      />

      {loadPhase === 'refresh' ? (
        <TestingBodySkeleton body={skeletonBody} />
      ) : tab === 'new' ? (
        <div className="flex flex-col gap-m w-full">
          <div
            className="flex flex-col w-full rounded-4xl px-xl pt-l pb-m"
            style={{
              backgroundColor: 'var(--bg-elements)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 10px 40px var(--bg-tint-light)',
            }}
          >
            {/* Mode — the one decision the card turns on */}
            <div className="flex items-center gap-m pb-m mb-m" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div
                role="radiogroup"
                aria-label="What to do with the selected videos"
                className="inline-flex items-center gap-xxs rounded-xl p-xxs"
                /* The page grey, matching SegmentedControl's track: on a white
                   card --bg-subtle read as a filled component of its own. */
                style={{ backgroundColor: 'var(--bg-page)' }}
              >
                <ModeButton on={mode === 'report'} onClick={() => setMode('report')} icon={<ReportGlyph />}>
                  Generate report
                </ModeButton>
                <ModeButton on={mode === 'ask'} onClick={() => setMode('ask')} icon={<ChatGlyph />}>
                  Ask questions
                </ModeButton>
              </div>
            </div>

            {/* Selection */}
            <div className="flex flex-col justify-center gap-m min-h-[132px]">
              {hasVideos ? (
                /* Filling the slot must not remove the slot. The empty state is
                   a framed box; without the same frame here the strip floated
                   loose in the card and read as a broken layout rather than a
                   filled one. Solid border, not dashed — dashed means "drop
                   something here", and something has been dropped. */
                <div
                  className="flex items-center rounded-3xl px-l py-m"
                  style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page-pale)' }}
                >
                  <SelectedVideosStrip
                    videos={selected}
                    onChange={() => setPickerOpen(true)}
                    onClear={() => setSelectedIds([])}
                  />
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-xs rounded-3xl py-l"
                  style={{ border: '1px dashed var(--border-default)' }}
                >
                  <Button variant="primary" size="lg" leftIcon={<PlusIcon size={16} />} onClick={() => setPickerOpen(true)}>
                    Add videos
                  </Button>
                  <span className="font-body text-s text-text-tertiary leading-[1.5]">
                    Select sessions from your Gameplay Library by tag or source.
                  </span>
                </div>
              )}

              {/* The box stands whether or not videos are picked. A suggested
                  prompt pressed first has somewhere to land, and a reader who
                  knows what they want to ask can type it before choosing what
                  to ask it of. */}
              {mode === 'ask' && (
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      ask()
                    }
                  }}
                  placeholder={hasVideos ? 'Ask anything about these sessions…' : 'Ask anything about these sessions…'}
                  aria-label="Ask anything about these sessions"
                  rows={2}
                  autoFocus
                  className="composer-input w-full resize-none bg-transparent border-0 outline-none font-body text-l text-text-primary placeholder:text-text-placeholder leading-[1.5] py-xs"
                />
              )}

              {/* A report is filed and read later, so it needs a name to be
                  found by — the same field every other test carries. It is part
                  of the run's shape, not a consequence of the selection, so it
                  stands whether or not videos are picked yet. A question is
                  answered in place and never filed, so it has none. */}
              {mode === 'report' && (
                <label className="flex flex-col gap-xs">
                  <FieldLabel optional>Run name</FieldLabel>
                  <Input
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    placeholder={gameContext ?? 'User test'}
                    aria-label="Run name"
                    size="lg"
                  />
                </label>
              )}
            </div>

            {/* Bar — context on the left, the action on the right */}
            <div className="flex items-center gap-s pt-m mt-m" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <TestingMenuSelect
                variant="chip"
                openUp
                ariaLabel="Game context"
                placeholder="Add game context"
                value={docId}
                onChange={(v) => setDocId(v === NO_CONTEXT ? null : v)}
                options={[
                  ...GAME_CONTEXT_DOCS.map((d) => ({
                    value: d.id,
                    label: d.name,
                    meta: d.meta,
                    badge: d.fileType.toUpperCase(),
                  })),
                  ...uploads.map((u) => ({
                    value: u.id,
                    label: u.name,
                    meta: u.uploading ? 'Uploading…' : 'Added just now',
                    badge: u.fileType.toUpperCase(),
                    pending: u.uploading,
                  })),
                  { value: NO_CONTEXT, label: 'None', meta: 'Findings per video, not grouped by step.', badge: '—' },
                ]}
                trailing={{ label: 'Upload new', meta: 'PDF, DOCX, or image', onSelect: uploadDoc }}
              />
              <span className="flex-1" />
              {mode === 'report' ? (
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!hasVideos}
                  /* The host decides where this lands — it opens the new run's
                     own page, which is where the queue, the analysis and then
                     the report each report themselves. Flipping this
                     composer's own tab to the history on the way out is a
                     leftover from when the list was the destination, and it
                     runs on a component that unmounts in the same commit. */
                  onClick={() => onGenerate?.(selectedIds, gameContext, runName)}
                >
                  Generate report
                </Button>
              ) : (
                <>
                  {/* No readiness hint beside the send button (removed
                      2026-09-23 on the PM brief). The two things it named are
                      the two empty controls directly above it. */}
                  <Button
                    variant="primary"
                    size="lg"
                    iconOnly
                    iconRound
                    disabled={!canAsk}
                    aria-label="Ask"
                    onClick={ask}
                  >
                    <SendIcon size={20} />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* What the run produces and that it is not something to sit and
              watch — the same closing note the other three composers carry, in
              the same slot. */}
          <SetupNote>
            {mode === 'report'
              ? 'Reports identify UX issues, friction points, frustration markers and drop-off by game step, each with supporting clips. Analysis runs in the background — the report lands in Run history when it is done.'
              : 'Answers are drawn from the selected sessions only, with clips as evidence.'}
          </SetupNote>

          {mode === 'ask' && (
            <div className="flex flex-col gap-s pt-l">
              <span className="font-display text-s font-semibold text-text-secondary text-center">
                Try our suggested prompts
              </span>
              <div className="grid gap-m" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                {USER_TEST_HOME_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    /* Pre-fill and stop. Opening the picker on top of the
                       click threw the reader into a modal they did not ask
                       for, and cancelling it lost the prompt as well. The
                       question is now in the box, the hint beside the send
                       button says videos are still needed, and they choose
                       when to go and get them. */
                    onClick={() => setQuestion(p)}
                    className="suggestion-card-hover flex items-start gap-s text-left rounded-2xl px-l py-m font-body text-m text-text-primary leading-[1.5]"
                    style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
                  >
                    <span className="shrink-0 mt-xxxs text-text-tertiary" aria-hidden>
                      <BulbIcon size={16} />
                    </span>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'report' && (
            <div
              className="flex items-center gap-l rounded-3xl px-xl py-l mt-l"
              style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
            >
              <SamplePreview />
              <div className="flex flex-col gap-xxxs flex-1 min-w-0">
                <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">
                  Sample Report
                </span>
                <span className="font-body text-s text-text-secondary leading-[1.5]">
                  Completed sample report on 10 gameplay sessions: findings grouped by categories with
                  clips &amp; recommendations.
                </span>
              </div>
              <Button variant="secondary" size="lg" onClick={onOpenSample}>
                View Report
              </Button>
            </div>
          )}
        </div>
      ) : (
        <RunHistoryList
          runs={history}
          highlightId={highlightId}
          onOpen={onOpenRun}
          metaLabel="Tags"
          emptyTitle="Nothing has run yet"
          emptyLabel="Run a report on your sessions or ask them a question — both land here."
          emptyAction={{ label: 'New run', onClick: () => setTab('new') }}
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

function ModeButton({
  on,
  onClick,
  icon,
  children,
}: {
  on: boolean
  onClick: () => void
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className="composer-mode inline-flex items-center gap-xs rounded-m px-l py-s font-display text-m font-semibold whitespace-nowrap"
      /* State, not a CTA: the selected mode is raised in white on a grey track,
         so the Generate button stays the only filled control on the card. */
      style={{
        backgroundColor: on ? 'var(--bg-elements)' : 'transparent',
        color: on ? 'var(--text-brand)' : 'var(--text-secondary)',
        boxShadow: on ? 'var(--shadow-sm)' : undefined,
      }}
    >
      <span aria-hidden>{icon}</span>
      {children}
    </button>
  )
}

function ReportGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6M10 17h6" />
    </svg>
  )
}

function ChatGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16v11H8l-4 4z" />
      <path d="M9 9h6M9 12h4" />
    </svg>
  )
}

/** Tiny skeleton of a report, so the sample card shows its shape without a screenshot. */
function SamplePreview() {
  /* Frozen — a preview is a shape, not a wait, so the shine stays off. */
  const bar = (w: string, tone?: string) => (
    <Skeleton
      variant="bar"
      width={w}
      height={6}
      radius="rounded-xs"
      shimmer={false}
      style={tone ? { backgroundColor: tone } : undefined}
    />
  )
  return (
    <div
      className="flex flex-col gap-xs shrink-0 w-[150px] h-[96px] rounded-l p-s"
      style={{ backgroundColor: 'var(--bg-page-pale)', border: '1px solid var(--border-subtle)' }}
      aria-hidden
    >
      <div className="flex items-center justify-between">{bar('40%', 'var(--bg-tint)')}{bar('20%')}</div>
      <div className="grid grid-cols-4 gap-xxs">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="block h-[14px] rounded-xs" style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }} />
        ))}
      </div>
      <div className="flex items-center gap-xs">{bar('12%', 'var(--error)')}{bar('60%')}</div>
      <div className="flex items-center gap-xs">{bar('12%', 'var(--warning)')}{bar('50%')}</div>
    </div>
  )
}
