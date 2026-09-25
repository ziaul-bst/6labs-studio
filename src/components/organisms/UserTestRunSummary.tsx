/**
 * UserTestRunSummary — what a finished run says, read as a conversation.
 *
 * A run is something you asked for, so it is answered the way a request is
 * answered: your request at the top, the agent's reply under it, and a
 * composer waiting at the bottom. The summary itself is that reply — one
 * message, posted by User Test, holding how big the run was, what it found,
 * and the way down to the evidence.
 *
 * The document framing this replaced put "Ask about this run" at the end as a
 * third section, which read as a feature of the page rather than as the next
 * thing you would do. In a thread the question is simply the next message, and
 * the answer lands next to the numbers it is about.
 *
 * Everything that qualifies a finding rather than states it — clips, per-tester
 * tables, the comparison — lives in the full report, one click down.
 *
 * It is also the only screen an opened run has. The thread view this used to
 * share the job with — a run rendered as a chat transcript you scrolled — is
 * gone: it answered "what happened in this run" with a conversation nobody had
 * had, and a run in flight, a finished run and an answered question each
 * landed on a different one of the two screens for reasons no reader could
 * predict. Everything a run can be is a state of this page now: queued while
 * it waits, analysing while it reads, the summary when it lands, and a single
 * answer sheet when the "run" was a question.
 *
 * Code-first prototype — from the reference flow (user-test-agent-flow v128).
 */

import { useMemo, useRef, useState, type ReactNode } from 'react'
import { UserTestIssueCard } from '../molecules/UserTestIssueCard'
import { PageTopbar } from '../molecules/PageTopbar'
import { SectionHeading } from '../molecules/SectionHeading'
import { SourcesGrid, type SourceItem } from '../molecules/SourcesGrid'
import { ReportCtaBand } from '../molecules/ReportCtaBand'
import { StatTile } from '../molecules/StatTile'
import { FindingsByCategoryTable, categoryRowsFor } from '../molecules/FindingsByCategoryTable'
import { CheckIcon } from '../icons/CheckIcon'
import { ClipLightbox } from '../molecules/ClipLightbox'
import { Spinner } from '../atoms/Spinner'
import { RunPageSkeleton } from '../molecules/TestingSkeletons'
import { usePageLoading } from '../../lib/pageLoading'
import { UserTestAskPanel, askQuestion } from './UserTestAskPanel'
import Button from '../ui/Button'
import InputFieldConsole from '../ui/InputFieldConsole'
import { DownloadIcon } from '../icons/DownloadIcon'
import { MembersIcon } from '../icons/MembersIcon'
import { PICKER_VIDEOS, USER_TEST_CATEGORY_ROWS } from '../../lib/mocks/user-test'
import type {
  UserTestAskTurn,
  UserTestCategoryRow,
  UserTestEvidenceRef,
  UserTestIssue,
} from '../../lib/types/userTest'

/**
 * What the run read, in the message header. Devices and run duration used to
 * sit here as a third line; they are not what the findings have to be read
 * against — the footage and the game context are — and a header that lists
 * everything known about a run is a header nobody reads.
 */
export interface RunSummaryFacts {
  /** "10 sessions · tag Build V2.1" */
  videos: string
  /** The library tag(s) the batch was picked by — "Build V2.1". */
  tag: string
  /** Game understanding document, or null when the run had none. */
  context: string | null
}

export interface UserTestRunSummaryProps {
  runName: string
  issues: UserTestIssue[]
  /**
   * The run has not produced its summary yet. 'queued' is submitted and not
   * started; 'analysing' is reading the sessions. Either way the page is the
   * same page — same bar, same request message, same composer — with the
   * agent's reply not yet written, so nothing moves when it arrives.
   */
  pending?: 'queued' | 'analysing'
  /**
   * This page is an answered question rather than a run. The agent's reply is
   * then the answer sheet alone: no stat tiles, no findings, no report CTA,
   * because a question produced none of them.
   */
  question?: string
  /** How many of the ranked findings to show before the "see all" row. */
  previewCount?: number
  facts?: RunSummaryFacts
  /** The opening message — what was asked for, and of what. */
  request?: { headline: string; detail: string }
  agentName?: string
  agentIcon?: ReactNode
  /** Sessions in the batch, and how much footage that was — the two size tiles. */
  sessionCount?: number
  /**
   * Sessions the analysis actually covered, when it is fewer than the batch.
   * Every finding's reach counts against this, so when it differs the tile
   * prints both — "10 sessions" over a list of sevenths and ninths is the first
   * thing a reader catches and the last thing a run summary can afford.
   */
  analysedCount?: number
  footageLabel?: string
  /** The recordings behind the run, for the Sources block. */
  sources?: SourceItem[]
  /**
   * Category rows for the Summary table. Only `sessionsAffected` is taken from
   * these — the counts are derived from `issues`, so a filtered set cannot
   * print the whole run's totals.
   */
  categories?: UserTestCategoryRow[]
  /**
   * The one paragraph the tiles exist to size. Written per run; the default is
   * the sample batch's.
   */
  headline?: ReactNode
  /** Follow-up thread, owned by the host so it survives the trip to the report. */
  askTurns?: UserTestAskTurn[]
  onAskTurnsChange?: (turns: UserTestAskTurn[]) => void
  onBack?: () => void
  onOpenReport?: () => void
  onOpenLibrary?: () => void
  onOpenEvidence?: (ref: UserTestEvidenceRef) => void
  onHandoffToOracle?: (question: string) => void
  className?: string
}

const DEFAULT_FACTS: RunSummaryFacts = {
  videos: '10 sessions · tag Build V2.1',
  tag: 'Build V2.1',
  context: 'Onboarding flow v3',
}

/* The sample batch's footage, so the block stands alone in Storybook. */
const DEFAULT_SOURCES: SourceItem[] = PICKER_VIDEOS.slice(0, 10).map((v) => ({
  id: v.id,
  duration: v.duration,
  title: v.title,
}))

const DEFAULT_HEADLINE =
  'The Furnace-upgrade tap failure blocked 7 of 9 sessions — the single most impactful finding this run. It accounts for roughly 38% of the time lost across the batch.'

export function UserTestRunSummary({
  runName,
  issues,
  pending,
  question,
  previewCount = 4,
  facts = DEFAULT_FACTS,
  request,
  agentName = 'User Test Agent',
  agentIcon = <MembersIcon size={20} />,
  sessionCount = 10,
  analysedCount,
  footageLabel = '2h 14m',
  sources = DEFAULT_SOURCES,
  categories = USER_TEST_CATEGORY_ROWS,
  headline,
  askTurns,
  onAskTurnsChange,
  onBack,
  onOpenReport,
  onOpenLibrary,
  onOpenEvidence,
  onHandoffToOracle,
  className,
}: UserTestRunSummaryProps) {
  /* This screen's own beat, keyed on the run. `pending` opts out: a queued or
     analysing run is a wait with the agent behind it and says so in words —
     a skeleton there would claim the page is still arriving. */
  const loadPhase = usePageLoading(runName)
  /* Nothing found. A clean run is the result a test most wants to be able to
     report, so it gets its own middle rather than an empty findings list and a
     band offering "All 0 findings, their clips and a recommendation". */
  const clean = issues.length === 0
  const lede = headline ?? DEFAULT_HEADLINE
  const bugs = issues.filter((i) => i.kind === 'bug').length
  const friction = issues.filter((i) => i.kind === 'friction').length
  const categoryRows = useMemo(() => categoryRowsFor(issues, categories), [issues, categories])
  /* Uncontrolled fallback, so the component stands alone in Storybook. */
  const [localTurns, setLocalTurns] = useState<UserTestAskTurn[]>([])
  const turns = askTurns ?? localTurns
  const setTurns = onAskTurnsChange ?? setLocalTurns
  /* The deferred answer has to land on the thread as it is when the timer
     fires, not on the one the question was asked against. */
  const turnsRef = useRef(turns)
  turnsRef.current = turns
  const [draft, setDraft] = useState('')
  /* The clip a reader opened from a finding's popover, played in place. */
  const [openClip, setOpenClip] = useState<{ issue: UserTestIssue; index: number } | null>(null)
  const activeClip = openClip ? openClip.issue.clips[openClip.index] ?? null : null

  /* The turns arrive controlled from the host, so `setTurns` takes a value
     rather than an updater — the ref is what lets the shared helper work in
     updater form here too. */
  const ask = (question: string) => {
    if (askQuestion(question, (update) => setTurns(update(turnsRef.current)))) setDraft('')
  }

  /* Who answered, of what — the block that opens every sheet on this page:
     the run's own reply, the wait before it, and each follow-up. Built once so
     they cannot name different agents or expand onto different footage. */
  const agentBlock = (
    <>
      <div className="flex items-center gap-s px-l pt-l pb-m">
        <span
          className="flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, #4D8FF5 0%, #1770EF 100%)' }}
          aria-hidden
        >
          {agentIcon}
        </span>
        <span className="flex flex-col gap-xxxs min-w-0">
          <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">{agentName}</span>
          <span className="font-body text-s text-text-secondary leading-[1.5]">
            Read {sessionCount} sessions
          </span>
        </span>
      </div>
      <div
        className="flex flex-col px-l py-s"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-inset)',
        }}
      >
        <SourcesGrid
          sources={sources}
          totalVideos={sessionCount}
          onExpandSources={() => onOpenLibrary?.()}
          onSourceClick={() => onOpenLibrary?.()}
        />
      </div>
    </>
  )

  /* What was asked for, and of what. The second line keeps the tag and the
     context; what it no longer claims is "· no previous analysis" — a fact
     about a build-over-build comparison that was never offered. */
  const opening = request ?? {
    headline: question ?? `Create report by analyzing ${sessionCount} sessions`,
    /* The tag and the context, not the session count — the headline directly
       above already says how many. */
    detail: `tagged ${facts.tag}${facts.context ? ` · context: ${facts.context}` : ' · no game context'}`,
  }

  /* A question still being answered is already showing its own wait — the
     pending line under the prompt. Stacking a page skeleton in front of it
     makes one question look like two loads, and the skeleton would be drawing
     a run report's shape (tiles, findings, the report CTA) on a page that is
     only ever going to hold an answer sheet. */
  const answering = turns.some((t) => t.answer === null)
  const skeleton = Boolean(loadPhase) && !pending && !answering

  /* The run names itself once, in the bar, with the test as its parent. Built
     once and handed to both the skeleton and the page: the bar is the way back
     out and it is known the instant a history row is clicked, so it is never
     drawn as grey bars — see TestingSkeletons.

     One action, and it is Export: the page you are looking at *is* the
     finished run, so a "Complete" pill only repeats it, and sharing a run
     means sending the report — which is what Export produces. */
  const topbar = (
    <PageTopbar
      title={runName}
      trail={[{ label: 'User Test Agent' }]}
      onBack={() => onBack?.()}
      actions={
        /* Nothing to export until there is something to export. */
        <Button
          variant="secondary"
          size="md"
          leftIcon={<DownloadIcon size={16} />}
          disabled={Boolean(pending) || skeleton}
        >
          Export
        </Button>
      }
    />
  )

  if (skeleton)
    return <RunPageSkeleton topbar={topbar} label={`Loading ${runName || 'run'}`} className={className} />

  return (
    <div className={['flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      {topbar}

      {/* Grows to fill the screen so the composer below sits at the viewport
          bottom even when the thread is short. */}
      <div className="flex-1 w-full">
        <div className="flex flex-col gap-l page-measure pt-l pb-m">
          {/* The request — right-aligned, brand fill, the way a sent message
              reads. Suppressed on a question page: the question is already the
              first turn's own prompt bubble a few pixels below, and printing
              it twice made the page look like the question had been asked
              twice. */}
          {!question && (
          <div className="flex justify-end w-full">
            <div
              className="flex flex-col gap-xxxs max-w-[78%] rounded-2xl px-l py-m text-white"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <span className="font-display text-s font-semibold leading-[1.45]">
                {opening.headline}
              </span>
              {opening.detail && (
                <span className="font-body text-xs leading-[1.5]" style={{ opacity: 0.85 }}>
                  {opening.detail}
                </span>
              )}
            </div>
          </div>
          )}

          {/* The wait, where there is one. The same message container the
              reply will arrive in, signed by the same agent, so the sheet does
              not appear from nowhere when it lands — but no tiles and no
              headings, because a skeleton of a summary is a promise about a
              shape the answer may not take. */}
          {pending && (
            <div className="flex flex-col gap-xs w-full">
              <Panel>
                {agentBlock}
                <div className="flex flex-col gap-xs px-l py-xl" role="status">
                  {pending === 'queued' ? (
                    <>
                      <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">
                        Queued
                      </span>
                      <span className="font-body text-s text-text-secondary leading-[1.7] max-w-[72ch]">
                        The run is in line. 6labs starts reading the sessions as soon as a slot frees up —
                        nothing here needs to stay open, and this page becomes the report when it is done.
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-xs font-display text-m font-semibold text-text-primary leading-[1.4]">
                        <Spinner size={16} tone="brand" />
                        Reading the sessions
                      </span>
                      <span className="font-body text-s text-text-secondary leading-[1.7] max-w-[72ch]">
                        Every finding has to trace back to a frame, so the agent watches the whole batch
                        before it ranks anything. The report lands on this page.
                      </span>
                    </>
                  )}
                </div>
              </Panel>
            </div>
          )}

          {/* The answer — one message, posted by the agent. No name label above
              the card: the card's own header says who answered, and the same
              name twice, eight pixels apart, is not attribution. */}
          {!pending && !question && (
          <div className="flex flex-col gap-xs w-full">
            <Panel>
              {/* Who answered, of what, and what the numbers have to be read
                  against — the old fact line, folded into the message header. */}
              <div className="flex items-center gap-s px-l pt-l pb-m">
                <span
                  className="flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg, #4D8FF5 0%, #1770EF 100%)' }}
                  aria-hidden
                >
                  {agentIcon}
                </span>
                <span className="flex flex-col gap-xxxs min-w-0">
                  <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">
                    {agentName}
                  </span>
                  {/* What the agent read. The context used to trail it — and
                      it is already on the request message directly above, so
                      the reply was answering with the same clause it had just
                      been given. */}
                  <span className="font-body text-s text-text-secondary leading-[1.5]">
                    Analysed {sessionCount} tester sessions
                  </span>
                </span>
              </div>

              {/* What it read — the same Sources block an Oracle answer carries,
                  so footage behind a claim opens the same way wherever the claim
                  is. Collapsed it is one row; expanded it is the thumbnails and
                  the way into the Library.

                  --bg-inset, not white and not the page grey: a band inside a
                  card needs to be a step off the card, and page-pale is a step
                  off the *page*, which is why it landed heavier than the card it
                  sits in. */}
              <div
                className="flex flex-col px-l py-s"
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-inset)',
                }}
              >
                {/* No "see all in Library" row: the thumbnails are the sources
                    of this run, and a link out to the whole library is a
                    different question than the one the block answers. */}
                <SourcesGrid
                  sources={sources}
                  totalVideos={sessionCount}
                  onExpandSources={() => onOpenLibrary?.()}
                  onSourceClick={() => onOpenLibrary?.()}
                />
              </div>

              <Section number="01" title="Summary">
                {/* On a clean run the verdict leads and the numbers support it —
                    a reader should meet "No issues found" before "0 bugs", not
                    after it. */}
                {clean && <NoIssuesVerdict sessions={analysedCount ?? sessionCount} />}
                <div className="stat-tiles gap-s">
                  {analysedCount !== undefined && analysedCount !== sessionCount ? (
                    <StatTile
                      value={`${analysedCount} / ${sessionCount}`}
                      label="sessions analysed"
                    />
                  ) : (
                    <StatTile value={String(sessionCount)} label="sessions" />
                  )}
                  <StatTile value={footageLabel} label="session reviewed" />
                  <StatTile value={String(bugs)} label="bugs" dot="var(--error)" />
                  <StatTile value={String(friction)} label="friction points" dot="var(--warning)" />
                </div>
                {/* Same ink and measure as the full report's narrative. These
                    are one document at two depths, and the summary was setting
                    its prose at 14px secondary while the report set the same
                    sentence at 16px primary — which reads as two products. */}
                {/* No narrative on a clean run: the verdict above IS the
                    result, said once — not a paragraph that the section below
                    then repeated in a green box. */}
                {!clean && (
                  <p className="font-body text-m font-normal text-text-primary leading-[1.75] pt-m max-w-[86ch]">
                    {lede}
                  </p>
                )}

                {/* Where the run's damage is concentrated, before any single
                    finding is read. The same table the full report opens with —
                    most readers stop on this page, and the shape of the run is
                    not something they should have to open the report to get.
                    One component, so the two screens cannot count it
                    differently. */}
                {categoryRows.length > 0 && (
                  <div className="flex flex-col gap-s pt-l">
                    <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]">
                      Findings by category
                    </span>
                    <FindingsByCategoryTable rows={categoryRows} />
                  </div>
                )}
              </Section>

              {/* Ranking needs no caption: the count on the right of every row
                  is the thing the list is sorted by, and it says so itself. */}
              <Section number="02" title={clean ? 'What was checked' : 'Top findings'} divided>
                {clean ? (
                  <CheckedCategories categories={categories} />
                ) : (
                <div className="flex flex-col gap-xxs">
                  {issues.slice(0, previewCount).map((issue) => (
                    <UserTestIssueCard
                      key={issue.id}
                      issue={issue}
                      /* The clip plays here. It used to leave for the full
                         report, which answered "which sessions?" by throwing
                         away the list the question was asked from — the reader
                         wanted to watch ten seconds, not change page. */
                      onOpenClip={(clip) =>
                        setOpenClip({ issue, index: issue.clips.indexOf(clip) })
                      }
                    />
                  ))}
                </div>
                )}
              </Section>

              {/* The way down to the evidence — the one thing this message asks
                  you to do, so it takes the message's whole width, the brand
                  tint and a primary button, rather than sitting inset and pale
                  like a footnote. */}
              {/* Not on a clean run: there is no evidence to go down to, and
                  the report would print the same result this page just did. */}
              {!clean && <ReportCtaBand findingCount={issues.length} onOpenReport={onOpenReport} />}
            </Panel>
          </div>
          )}

          {/* The answer, and anything asked after it — same sheet either way.
              On a question page the first turn *is* the page's reason for
              existing; on a run page these are follow-ups under the report. */}
          <UserTestAskPanel
            hideHeading
            bare
            hideComposer
            /* The same sheet an opened question gets — agent block, 01 Summary,
               02 Details. A follow-up is the same kind of answer drawn from the
               same recordings, so it had no business rendering as a chat bubble
               with an avatar while the identical question asked from the home
               screen rendered as a document. */
            answerLayout="document"
            answerHeader={agentBlock}
            sessionCount={sessionCount}
            turns={turns}
            onTurnsChange={setTurns}
            onOpenEvidence={onOpenEvidence}
            onHandoffToOracle={onHandoffToOracle}
          />
        </div>
      </div>

      <div className="sticky bottom-0 w-full flex justify-center py-m oracle-input-overlay">
        <InputFieldConsole
          value={draft}
          onChange={setDraft}
          onSubmit={() => ask(draft)}
          placeholder={`Ask ${agentName} about these ${sessionCount} sessions…`}
          hideSources
          className="page-measure"
        />
      </div>

      {openClip && activeClip && (
        <ClipLightbox
          tester={activeClip.tester}
          timeRange={activeClip.timeRange}
          note={activeClip.note}
          caption={openClip.issue.title}
          position={`clip ${openClip.index + 1} of ${openClip.issue.clips.length}`}
          onPrev={openClip.index > 0 ? () => setOpenClip((c) => (c ? { ...c, index: c.index - 1 } : c)) : undefined}
          onNext={
            openClip.index < openClip.issue.clips.length - 1
              ? () => setOpenClip((c) => (c ? { ...c, index: c.index + 1 } : c))
              : undefined
          }
          onClose={() => setOpenClip(null)}
        />
      )}
    </div>
  )
}

/* ── Building blocks ─────────────────────────────────────────────────────── */

function Panel({ children }: { children: ReactNode }) {
  return (
    <div
      className="summary-panel-host flex flex-col w-full rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      {children}
    </div>
  )
}

function Section({
  number,
  title,
  divided,
  children,
}: {
  number: string
  title: string
  divided?: boolean
  children: ReactNode
}) {
  return (
    <section
      className="flex flex-col gap-m px-l py-l"
      style={divided ? { borderTop: '1px solid var(--border-subtle)' } : undefined}
    >
      <SectionHeading index={number} title={title} />
      {children}
    </section>
  )
}

/**
 * The verdict of a run that found nothing — the whole of the Summary's prose
 * on a clean run. A result, in the success pair, with the scope it covers:
 * "no issues" is a claim about these sessions, not about the build.
 */
function NoIssuesVerdict({ sessions }: { sessions: number }) {
  return (
    <div
      className="flex items-center gap-m w-full rounded-2xl px-l py-m mb-s"
      style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--border-subtle)' }}
      role="status"
    >
      <span
        className="flex items-center justify-center shrink-0 w-[44px] h-[44px] rounded-round text-white"
        style={{ backgroundColor: 'var(--success)', boxShadow: '0 0 0 6px rgba(22, 163, 74, 0.14)' }}
        aria-hidden
      >
        <CheckIcon size={24} />
      </span>
      <div className="flex flex-col gap-xxxs min-w-0">
        <span className="font-display text-l font-semibold text-text-primary leading-[1.3]">No issues found</span>
        <span className="font-body text-s text-text-secondary leading-[1.55]">
          Nothing in {sessions === 1 ? 'this session' : `these ${sessions} sessions`} needs fixing.
        </span>
      </div>
    </div>
  )
}

/**
 * What a clean run looked for. Findings on a clean run are the empty set, and
 * an empty set has nothing to show — so the section shows its coverage
 * instead: every category the report sorts findings into, each cleared. It is
 * the evidence behind the verdict above rather than a second copy of it.
 */
function CheckedCategories({ categories }: { categories: UserTestCategoryRow[] }) {
  return (
    <div className="flex flex-col gap-s">
      <div className="flex flex-col w-full rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        {categories.map((c, i) => (
          <div
            key={c.label}
            className="flex items-center gap-s px-l py-s"
            style={{ borderTop: i === 0 ? undefined : '1px solid var(--border-subtle)' }}
          >
            <span
              className="w-[7px] h-[7px] rounded-round shrink-0"
              style={{ backgroundColor: c.tone === 'bug' ? 'var(--error)' : 'var(--warning)' }}
              aria-hidden
            />
            <span className="font-body text-s text-text-primary leading-[1.5] flex-1 min-w-0 truncate">{c.label}</span>
            <span
              className="inline-flex items-center gap-xxs font-body text-s font-medium leading-[1.5] shrink-0"
              style={{ color: 'var(--success)' }}
            >
              <CheckIcon size={16} />
              None found
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
