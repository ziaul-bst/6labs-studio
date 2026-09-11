/**
 * FunctionalReportView — the result of a functional verification, human or AI.
 *
 * The same report serves both because the question is the same: for each test
 * case, did it happen, with the video as evidence. What differs is who produced
 * the footage — testers (or an agency), or AI players — and that lives in the
 * subtitle and the progress copy, not in the layout.
 *
 * Reading order: a one-line verdict banner (what needs attention, what is new
 * since the last build), filters, then the cases grouped by module with the
 * outcome on every row. Agency runs append the behavioural findings from the
 * same sessions, because the agency was paid for functional coverage and the
 * UX pass comes free. An ask bar at the bottom keeps the report queryable.
 *
 * Code-first prototype — from the revamp artifact (screen s44).
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { AnalysisProgressCard } from '../molecules/AnalysisProgressCard'
import { RunFailedNotice } from '../molecules/RunFailedNotice'
import { UserTestIssueCard } from '../molecules/UserTestIssueCard'
import { UserPrompt } from '../atoms/UserPrompt'
import { FilterPill } from '../atoms/FilterPill'
import Button from '../ui/Button'
import Input from '../ui/Input'
import InputFieldConsole from '../ui/InputFieldConsole'
import { SearchIcon } from '../icons/SearchIcon'
import { FUNCTIONAL_MODULES } from '../../lib/mocks/testing'
import { USER_TEST_ISSUES } from '../../lib/mocks/user-test'
import type { CaseOutcome, FunctionalCase, FunctionalModule } from '../../lib/types/testing'

export type FunctionalReportMode = 'human' | 'ai'

export interface FunctionalReportViewProps {
  title: string
  /** "8 videos · regression-suite.xlsx · verified by 6labs agent" */
  subtitle: string
  mode: FunctionalReportMode
  /** Append the behavioural findings from the same sessions (agency runs). */
  withUx?: boolean
  /** Start on the progress card and reveal the report when the ticks finish. */
  inProgress?: boolean
  /** The run stopped — show why instead of a report. */
  failure?: string
  /** Fires once when a run that started in progress completes. */
  onDone?: () => void
  onBack: () => void
  onRunAgain?: () => void
  modules?: FunctionalModule[]
  className?: string
}

type Filter = 'all' | 'attention' | 'fail' | 'review' | 'pass' | 'p0'

const OUTCOME_LABEL: Record<CaseOutcome, string> = {
  pass: 'Passed',
  fail: 'Failed',
  review: 'Needs review',
  blocked: 'Not verified',
}

type ChipStyle = { bg: string; ink?: string; inkClass?: string; border?: string }

const OUTCOME_STYLE: Record<CaseOutcome, ChipStyle> = {
  pass: { bg: 'var(--success-bg)', ink: 'var(--success)' },
  fail: { bg: 'var(--error-bg)', ink: 'var(--error)' },
  review: { bg: 'var(--warning-bg)', inkClass: 'issue-amber-ink' },
  /* Neutral outcomes sit on a white chip with a border — a grey fill on the
     grey page read as a hole rather than a tag. */
  blocked: { bg: 'var(--bg-elements)', ink: 'var(--text-secondary)', border: 'var(--border-default)' },
}

const PRIORITY_STYLE: Record<FunctionalCase['priority'], ChipStyle> = {
  p0: { bg: 'var(--error-bg)', ink: 'var(--error)' },
  p1: { bg: 'var(--warning-bg)', inkClass: 'issue-amber-ink' },
  p2: { bg: 'var(--bg-elements)', ink: 'var(--text-secondary)', border: 'var(--border-default)' },
}

const GRID = '64px minmax(0,1fr) 52px 88px 128px 20px'
const TICK_MS = 1300

export function FunctionalReportView({
  title,
  subtitle,
  mode,
  withUx = false,
  inProgress = false,
  failure,
  onDone,
  onBack,
  onRunAgain,
  modules = FUNCTIONAL_MODULES,
  className,
}: FunctionalReportViewProps) {
  const progressItems = useMemo(
    () =>
      mode === 'ai'
        ? ['Agent 1 · Onboarding', 'Agent 2 · Store', 'Agent 3 · Progression', 'Agent 1 · Alliance', 'Agent 2 · Settings', 'Verification pass']
        : ['Mapping cases to videos', 'Onboarding · 5 cases', 'Store · 6 cases', 'Progression · 4 cases', 'Alliance · 5 cases', 'Settings · 4 cases'],
    [mode],
  )
  const [step, setStep] = useState(inProgress ? 0 : progressItems.length)
  const running = step < progressItems.length
  const doneRef = useRef(false)

  useEffect(() => {
    if (!running) return
    const t = window.setTimeout(() => setStep((s) => s + 1), TICK_MS)
    return () => window.clearTimeout(t)
  }, [running, step])

  useEffect(() => {
    if (!running && inProgress && !doneRef.current) {
      doneRef.current = true
      onDone?.()
    }
  }, [running, inProgress, onDone])

  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [turns, setTurns] = useState<{ q: string; a: string }[]>([])
  const [draft, setDraft] = useState('')

  const allCases = modules.flatMap((m) => m.cases)
  const count = (f: (c: FunctionalCase) => boolean) => allCases.filter(f).length
  const filterOptions: { value: Filter; label: string; n: number }[] = [
    { value: 'all', label: 'All', n: allCases.length },
    { value: 'attention', label: 'Needs attention', n: count((c) => c.outcome !== 'pass') },
    { value: 'fail', label: 'Failed', n: count((c) => c.outcome === 'fail') },
    { value: 'review', label: 'Needs review', n: count((c) => c.outcome === 'review') },
    { value: 'pass', label: 'Passed', n: count((c) => c.outcome === 'pass') },
    { value: 'p0', label: 'P0', n: count((c) => c.priority === 'p0') },
  ]
  const matches = (c: FunctionalCase) => {
    if (search && !`${c.id} ${c.title}`.toLowerCase().includes(search.toLowerCase())) return false
    switch (filter) {
      case 'attention': return c.outcome !== 'pass'
      case 'fail': return c.outcome === 'fail'
      case 'review': return c.outcome === 'review'
      case 'pass': return c.outcome === 'pass'
      case 'p0': return c.priority === 'p0'
      default: return true
    }
  }
  const failed = count((c) => c.outcome === 'fail')
  const review = count((c) => c.outcome === 'review')
  const blocked = count((c) => c.outcome === 'blocked')
  const passed = count((c) => c.outcome === 'pass')

  const ask = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setTurns((prev) => [
      ...prev,
      {
        q: trimmed,
        a: 'TC-06 failed at the purchase confirmation: the Battle Pass sheet dismissed but the store never returned the purchased state, so the agent could not verify the entitlement. Clip 02:14 – 02:41 in session 3 shows the sheet closing with no confirmation toast.',
      },
    ])
    setDraft('')
  }

  return (
    <div className={['flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      <PageTopbar
        title={title}
        onBack={onBack}
        actions={
          <>
            <Button variant="secondary" size="md">Export</Button>
            <Button variant="primary" size="md" onClick={onRunAgain}>Run again</Button>
          </>
        }
      />

      {/* One centred 1100px column for body and composer alike; the 32px gutters
          live outside the cap so both edges line up at every width. */}
      <div className="w-full px-xxl">
      <div className="flex flex-col gap-m page-measure pt-l pb-[160px]">
        <p className="font-body text-s text-text-secondary leading-[1.5]">{subtitle}</p>

        {failure ? (
          <RunFailedNotice
            reason={failure}
            saved={mode === 'ai' ? 'The cases the players reached before the crash were kept — nothing else was recorded.' : 'The recordings are untouched in the Gameplay Library.'}
            onRunAgain={onRunAgain}
          />
        ) : running ? (
          <AnalysisProgressCard
            label={mode === 'ai' ? 'AI players executing…' : 'Verifying cases against videos…'}
            percent={3 + (step / progressItems.length) * 97}
            eta={`~${Math.max(1, progressItems.length - step)} min`}
            items={progressItems}
            currentIndex={step}
            onSkip={() => setStep(progressItems.length)}
          />
        ) : (
          <>
            {/* Verdict — what changed and what needs a human */}
            <div
              className="rounded-xl px-m py-s font-body text-s leading-[1.6] text-text-primary"
              style={{ backgroundColor: 'var(--error-bg)', border: '1px solid rgba(201,57,42,0.25)' }}
            >
              <strong className="font-semibold">
                {failed} failed, {review} need your call, {blocked} could not be verified.
              </strong>{' '}
              TC-06 passed on the previous build, so that failure is new. {passed} passed.
            </div>

            {/* Pills wrap inside their own track; the search is pinned to the right
                edge at pill height, so a narrow page never drops it underneath. */}
            <div className="flex items-start gap-m">
              <div className="flex flex-wrap items-center gap-xs flex-1 min-w-0" role="radiogroup" aria-label="Filter cases">
                {filterOptions.map((f) => (
                  <FilterPill
                    key={f.value}
                    label={f.label}
                    count={f.n}
                    selected={filter === f.value}
                    onClick={() => setFilter(f.value)}
                  />
                ))}
              </div>
              <div className="testing-search shrink-0 w-[300px]">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cases — id or title"
                  aria-label="Search cases"
                  size="lg"
                  leftIcon={<SearchIcon size={20} />}
                />
              </div>
            </div>

            <div
              className="flex flex-col w-full rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
            >
              {modules.map((m, mi) => {
                const cases = m.cases.filter(matches)
                if (cases.length === 0) return null
                const f = m.cases.filter((c) => c.outcome === 'fail').length
                const r = m.cases.filter((c) => c.outcome === 'review').length
                const b = m.cases.filter((c) => c.outcome === 'blocked').length
                const p = m.cases.filter((c) => c.outcome === 'pass').length
                return (
                  <div key={m.name} className="flex flex-col">
                    <div
                      className="flex items-center gap-xs px-l py-s"
                      style={{
                        backgroundColor: 'var(--bg-page-pale)',
                        borderTop: mi === 0 ? 'none' : '1px solid var(--border-subtle)',
                      }}
                    >
                      <span className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
                        {m.name}
                      </span>
                      <span className="font-body text-xs text-text-tertiary">{m.cases.length}</span>
                      <span className="flex-1" />
                      <Chip style={OUTCOME_STYLE.pass}>{p}</Chip>
                      {f > 0 && <Chip style={OUTCOME_STYLE.fail}>{f}</Chip>}
                      {r > 0 && <Chip style={OUTCOME_STYLE.review}>{r}</Chip>}
                      {b > 0 && <Chip style={OUTCOME_STYLE.blocked}>{b}</Chip>}
                    </div>
                    {cases.map((c) => (
                      <div
                        key={c.id}
                        className="run-history-row grid items-center gap-s px-l py-s cursor-pointer"
                        style={{ gridTemplateColumns: GRID, borderTop: '1px solid var(--border-subtle)' }}
                        role="button"
                        tabIndex={0}
                      >
                        <span className="font-code text-xs text-text-tertiary">{c.id}</span>
                        <span className="font-body text-s text-text-primary leading-[1.5] truncate">{c.title}</span>
                        <Chip style={PRIORITY_STYLE[c.priority]}>{c.priority.toUpperCase()}</Chip>
                        <span className="font-body text-xs text-text-tertiary">{c.severity ?? ''}</span>
                        <Chip style={OUTCOME_STYLE[c.outcome]} wide>{OUTCOME_LABEL[c.outcome]}</Chip>
                        <span className="text-text-tertiary text-right" aria-hidden>›</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            {withUx && (
              <div
                className="flex flex-col gap-s w-full rounded-2xl px-l py-l"
                style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
              >
                <h3 className="flex items-center gap-xs font-display text-m font-semibold text-text-primary leading-[1.4]">
                  <span
                    className="inline-flex items-center px-xs py-xxxs rounded-xs font-display text-2xs font-semibold uppercase tracking-[0.12em]"
                    style={{ backgroundColor: 'var(--warning-bg)' }}
                  >
                    <span className="issue-amber-ink">UX</span>
                  </span>
                  Behavioural findings from the same sessions
                </h3>
                <div className="flex flex-col gap-xxs">
                  {USER_TEST_ISSUES.filter((i) => i.kind === 'friction').slice(0, 2).map((issue) => (
                    <UserTestIssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              </div>
            )}

            {turns.length > 0 && (
              <div className="flex flex-col gap-m w-full pt-s">
                {turns.map((t, i) => (
                  <div key={i} className="flex flex-col gap-s">
                    <UserPrompt text={t.q} />
                    <div
                      className="rounded-2xl px-l py-m font-body text-s text-text-primary leading-[1.65] max-w-[78%]"
                      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
                    >
                      {t.a}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      </div>

      {/* Same pinned composer as an Oracle response — one way to ask, everywhere. */}
      {/* Nothing to ask about a run that produced nothing. */}
      {!running && !failure && (
        <div className="sticky bottom-0 w-full flex justify-center py-m oracle-input-overlay">
          <InputFieldConsole
            value={draft}
            onChange={setDraft}
            onSubmit={() => ask(draft)}
            placeholder="Ask about these test cases — why did TC-06 fail, which steps were skipped…"
            hideSources
            className="page-measure"
          />
        </div>
      )}
    </div>
  )
}

/** Magnifier for the search field — stroke-only, inherits the input's icon colour. */
function Chip({
  style,
  wide,
  children,
}: {
  style: ChipStyle
  wide?: boolean
  children: ReactNode
}) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-s font-display text-2xs font-semibold whitespace-nowrap',
        wide ? 'px-xs py-xxs text-xs' : 'px-xs py-xxxs',
        style.inkClass,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: style.bg, color: style.ink, border: style.border ? `1px solid ${style.border}` : undefined }}
    >
      {children}
    </span>
  )
}
