/**
 * TestCaseDetailModal — the evidence behind one verdict.
 *
 * A verification result is a claim, and the reader is doing exactly one thing
 * with it: comparing what the case asked for against what the footage shows. So
 * the body is that comparison, side by side, under the clip it is drawn from —
 * expected on the left, observed on the right. The earlier three-column version
 * put the list, the clip and the observation in competition and left the
 * expected result stranded under the video where nobody read it.
 *
 * The left rail is why this is a modal and not a page: a QA lead works down the
 * failures, not across the report, so the list travels with the reader. Its
 * filter drives the set Previous/Next walks — and selecting a filter that
 * excludes the open case moves to the first case that matches, rather than
 * leaving a highlighted row that is no longer in the list.
 *
 * Code-first prototype — from the reference flow (user-test-agent-flow v128).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TestingMenuSelect } from '../molecules/TestingMenuSelect'
import { CASE_OUTCOME_STYLE, CaseOutcomeTag } from '../atoms/CaseOutcomeTag'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { CloseIcon } from '../icons/CloseIcon'
import { SearchIcon } from '../icons/SearchIcon'
import { PlayIcon } from '../icons/PlayIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import type { CaseOutcome, VerifiedCase } from '../../lib/types/testing'

export interface TestCaseDetailModalProps {
  /** The case being read, or null when the modal is closed. */
  testCase: VerifiedCase | null
  /** Every case on the page, before the rail's own filter. */
  cases: VerifiedCase[]
  onSelect: (id: string) => void
  onClose: () => void
  /**
   * Show the list rail. Off is the plain modal — one case, walked with the
   * pager alone. Both shapes are in the reference; the rail is the default
   * because a suite is read failure by failure.
   */
  withNavigator?: boolean
}

type RailFilter = 'all' | CaseOutcome

const RAIL_FILTERS: { value: RailFilter; label: string }[] = [
  { value: 'all', label: 'All outcomes' },
  { value: 'fail', label: 'Failed' },
  { value: 'review', label: 'Needs review' },
  { value: 'blocked', label: 'Not verified' },
  { value: 'pass', label: 'Passed' },
]

export function TestCaseDetailModal({
  testCase,
  cases,
  onSelect,
  onClose,
  withNavigator = true,
}: TestCaseDetailModalProps) {
  const [railFilter, setRailFilter] = useState<RailFilter>('all')
  const [railSearch, setRailSearch] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  const matches = useMemo(
    () =>
      cases.filter((c) => {
        if (railFilter !== 'all' && c.outcome !== railFilter) return false
        if (!railSearch) return true
        const q = railSearch.toLowerCase()
        return `${c.id} ${c.title} ${c.category}`.toLowerCase().includes(q)
      }),
    [cases, railFilter, railSearch],
  )

  /* The pager walks what the rail is showing, so "Next" and the list below it
     never disagree. Falls back to the whole page when the rail is hidden. */
  const walk = withNavigator ? matches : cases
  const index = testCase ? walk.findIndex((c) => c.id === testCase.id) : -1

  /* Narrowing the list is a request to read that subset — so it moves to the
     first case in it rather than stranding a selection outside the list. */
  useEffect(() => {
    if (!testCase || !withNavigator) return
    if (matches.length === 0) return
    if (matches.some((c) => c.id === testCase.id)) return
    onSelect(matches[0].id)
  }, [matches, testCase, withNavigator, onSelect])

  /* Escape closes, and the arrow keys walk the set — the same two the pager
     presses, so a reader working down the failures never goes back to the
     footer for the mouse. */
  useEffect(() => {
    if (!testCase) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.key === 'ArrowLeft' && index > 0) onSelect(walk[index - 1].id)
      if (e.key === 'ArrowRight' && index >= 0 && index < walk.length - 1) {
        onSelect(walk[index + 1].id)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [testCase, index, walk, onSelect, onClose])

  useEffect(() => {
    if (!testCase) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [testCase])

  useEffect(() => {
    if (testCase) panelRef.current?.focus()
  }, [testCase])

  /* Grouped by the case's own suite, because that is how a test file is
     written and how a reader scanning for "the store cases" looks for them. */
  const railGroups = useMemo(() => {
    const groups = new Map<string, VerifiedCase[]>()
    matches.forEach((c) => {
      const list = groups.get(c.category)
      if (list) list.push(c)
      else groups.set(c.category, [c])
    })
    return [...groups.entries()]
  }, [matches])

  if (!testCase) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-l"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-modal-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="case-modal relative flex flex-col w-full max-w-[1120px] max-h-[88vh] rounded-2xl shadow-big outline-none overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elements)' }}
      >
        {/* Header — the verdict sits opposite the title, so the case and its
            outcome are read in one movement. */}
        <div
          className="flex items-start gap-m px-l py-m shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex flex-col gap-xxxs flex-1 min-w-0">
            <span className="flex items-center gap-xs">
              <span className="font-code text-xs text-text-tertiary leading-[1.5]">{testCase.id}</span>
              <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                {testCase.category} · {testCase.path}
              </span>
            </span>
            <h2
              id="case-modal-title"
              className="font-display text-l font-semibold text-text-primary leading-[1.35]"
            >
              {testCase.title}
            </h2>
          </div>
          <div className="flex items-center gap-s shrink-0">
            <CaseOutcomeTag outcome={testCase.outcome} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex items-center justify-center w-6 h-6 rounded-s text-text-secondary hover:text-text-primary"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        <div className="case-modal-body flex-1 min-h-0">
          {withNavigator && (
            <aside
              className="case-modal-rail flex flex-col min-h-0"
              style={{ borderRight: '1px solid var(--border-subtle)' }}
            >
              <div className="report-toolbar flex flex-col gap-xs px-m pt-m pb-s shrink-0">
                {/* lg, not md: the select below is a 40px field, and a 32px
                    input stacked on it read as two different controls. */}
                <Input
                  value={railSearch}
                  onChange={(e) => setRailSearch(e.target.value)}
                  placeholder="Search cases…"
                  aria-label="Search test cases"
                  size="lg"
                  leftIcon={<SearchIcon size={20} />}
                />
                {/* One select, not five pills: at rail width the pills wrapped
                    to two rows and stopped reading as one control. */}
                <TestingMenuSelect
                  value={railFilter}
                  onChange={(v) => setRailFilter(v as RailFilter)}
                  ariaLabel="Filter the list by outcome"
                  options={RAIL_FILTERS.map((f) => ({
                    value: f.value,
                    label: f.label,
                    meta:
                      f.value === 'all'
                        ? `${cases.length} cases`
                        : `${cases.filter((c) => c.outcome === f.value).length} cases`,
                  }))}
                />
              </div>

              <div className="flex flex-col gap-xs flex-1 min-h-0 overflow-y-auto px-m pb-m">
                {matches.length === 0 ? (
                  <p className="font-body text-xs text-text-tertiary leading-[1.6]">
                    Nothing matches that filter.
                  </p>
                ) : (
                  railGroups.map(([category, group]) => (
                    <div key={category} className="flex flex-col gap-xxxs">
                      <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5] pt-xs">
                        {category}
                      </span>
                      {group.map((c) => {
                        const on = c.id === testCase.id
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => onSelect(c.id)}
                            aria-current={on ? 'true' : undefined}
                            className="case-rail-item flex items-start gap-xs text-left rounded-m px-xs py-xs"
                            style={on ? { backgroundColor: 'var(--bg-tint-light)' } : undefined}
                          >
                            <span
                              className="w-[6px] h-[6px] rounded-round shrink-0 mt-[6px]"
                              style={{ backgroundColor: CASE_OUTCOME_STYLE[c.outcome].dot }}
                              aria-hidden
                            />
                            <span className="flex flex-col gap-xxxs min-w-0">
                              <span
                                className="font-body text-xs leading-[1.5]"
                                style={{ color: on ? 'var(--text-brand)' : 'var(--text-primary)' }}
                              >
                                {c.title}
                              </span>
                              <span className="font-code text-xs text-text-tertiary leading-[1.5]">
                                {c.id}
                              </span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>
            </aside>
          )}

          <div className="flex flex-col gap-m min-h-0 overflow-y-auto px-l py-m">
            {/* The clip the verdict was read from. */}
            <figure className="flex flex-col gap-xs m-0">
              <div
                className="case-clip relative w-full rounded-xl overflow-hidden"
                style={{ aspectRatio: '16 / 9', background: 'linear-gradient(135deg, #1F2C55 0%, #3A4F7A 100%)' }}
              >
                <button
                  type="button"
                  aria-label={`Play ${testCase.clip} from ${testCase.clipRange}`}
                  className="absolute inset-0 flex items-center justify-center text-white"
                >
                  <span
                    className="flex items-center justify-center w-12 h-12 rounded-round"
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }}
                  >
                    <PlayIcon size={20} />
                  </span>
                </button>
              </div>
              <figcaption className="flex flex-wrap items-baseline gap-s font-code text-xs text-text-tertiary leading-[1.5]">
                <span>{testCase.clip}</span>
                <span>{testCase.clipRange}</span>
              </figcaption>
            </figure>

            {/* The comparison the reader came for, side by side. */}
            <div className="case-compare gap-m">
              <Column label="Expected">
                <Field label="Precondition">{testCase.precondition}</Field>
                <Field label="Result">{testCase.expected}</Field>
              </Column>

              <Column
                label="Observed"
                accent={CASE_OUTCOME_STYLE[testCase.outcome].dot}
                trailing={<CaseOutcomeTag outcome={testCase.outcome} />}
              >
                <Field label="Result">{testCase.reason}</Field>
                <div className="flex flex-col gap-xs">
                  <FieldLabel>Steps</FieldLabel>
                  <ol className="flex flex-col gap-xxs">
                    {testCase.steps.map((step, i) => (
                      <li key={`${step.action}-${i}`} className="flex items-start gap-s">
                        <span className="font-code text-xs text-text-tertiary leading-[1.6] shrink-0 w-4">
                          {i + 1}
                        </span>
                        <span className="flex flex-col gap-xxxs flex-1 min-w-0">
                          <span className="font-body text-s text-text-primary leading-[1.5]">
                            {step.action}
                          </span>
                          {step.observed && (
                            <span
                              className="font-body text-xs leading-[1.5]"
                              style={{ color: CASE_OUTCOME_STYLE[testCase.outcome].dot }}
                            >
                              {step.observed}
                            </span>
                          )}
                        </span>
                        <span className="font-code text-xs text-text-tertiary leading-[1.6] shrink-0">
                          {step.at}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Column>
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-s px-l py-s shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="font-body text-xs text-text-tertiary leading-[1.5]">
            {index + 1} of {walk.length}
          </span>
          <span className="flex-1" />
          <Button
            variant="secondary"
            size="md"
            disabled={index <= 0}
            leftIcon={<ChevronIcon size={16} direction="left" />}
            onClick={() => index > 0 && onSelect(walk[index - 1].id)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="md"
            disabled={index < 0 || index >= walk.length - 1}
            rightIcon={<ChevronIcon size={16} />}
            onClick={() => index < walk.length - 1 && onSelect(walk[index + 1].id)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Column({
  label,
  accent,
  trailing,
  children,
}: {
  label: string
  /** Rules the column in the outcome colour — only the observed side takes one. */
  accent?: string
  trailing?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      className="flex flex-col gap-m rounded-xl px-m py-m min-w-0"
      /* Four longhands, no `border` shorthand: React expands a shorthand into
         longhands and skips whichever side a longhand key also claims, so
         `border` + `borderLeft` in one object left the Expected column with
         border-left-width: 0. */
      style={{
        backgroundColor: 'var(--bg-inset)',
        borderTop: '1px solid var(--border-subtle)',
        borderRight: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        borderLeft: accent ? `3px solid ${accent}` : '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center gap-s">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary leading-[1.5]">
          {label}
        </span>
        <span className="flex-1" />
        {trailing}
      </div>
      {children}
    </section>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]">
      {children}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-xxs">
      <FieldLabel>{label}</FieldLabel>
      <span className="font-body text-s text-text-primary leading-[1.6]">{children}</span>
    </div>
  )
}
