/**
 * AgentPipelineLoader — Oracle pipeline stepper shown while a query is running.
 *
 * Steps reveal progressively as they start: nothing below the active step is
 * drawn. A 3px progress rail sits flush along the top edge. Each row is a
 * status rail (indicator + connector) beside a body (title · elapsed time,
 * description, optional callout note).
 *
 * States mirror the Figma variants: `pending` (query accepted, nothing started),
 * `running`, `complete`, and `error` (with a Try again action).
 *
 * @figmaComponent  Pipeline Stepper / Oracle
 * @figmaNode       6827:5
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6827-5
 *
 * @figmaComponent  Pipeline / Step Item
 * @figmaNode       6723:1168096
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6723-1168096
 */

import { type ReactNode, useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import { RefreshIcon } from '../icons/RefreshIcon'

/** Callout note surfaced under a step once it produces a finding. */
export interface PipelineCallout {
  /** Semibold lead-in phrase */
  lead: string
  /** Regular-weight remainder, appended after the lead */
  rest?: string
  /** Figma Note `Type` variant. `normal` is the success-green tint. */
  type?: 'normal' | 'error' | 'warning' | 'notice'
}

export interface PipelineStep {
  title: string
  /** Sub-line shown while this step is running */
  activeSub: string
  /** Sub-line shown once this step has completed */
  doneSub: string
  /** Optional pinned duration label (e.g. '1.2s'). Timed live when omitted. */
  duration?: string
  /** Optional finding callout, shown once the step is active or done */
  callout?: PipelineCallout
}

export type PipelineState = 'pending' | 'running' | 'complete' | 'error'
type StepStatus = 'pending' | 'active' | 'done' | 'error'

interface AgentPipelineLoaderProps {
  steps: PipelineStep[]
  /** Index of the active step; lower indices are done, higher are unrevealed. */
  currentStep: number
  /**
   * Overrides the state derived from `currentStep`. Pass `pending` before the
   * first step starts, or `error` to replace the stepper with the error row.
   */
  state?: PipelineState
  /** Error row copy — only read when `state` is `error`. */
  error?: { title?: string; description?: string; onRetry?: () => void }
  /** Rendered between the progress rail and the step list (e.g. agent identity). */
  header?: ReactNode
  className?: string
}

/**
 * Matches the four `Type` variants of the Figma "Note" component set
 * (7421:11508). Note that Figma's `Normal` is the success-green tint, not a
 * neutral grey — each variant is a status tint at 10% with a solid 4px accent.
 */
const CALLOUT_TINT: Record<NonNullable<PipelineCallout['type']>, { bg: string; accent: string }> = {
  normal: { bg: 'var(--success-bg)', accent: 'var(--success)' },
  error: { bg: 'var(--error-bg)', accent: 'var(--error)' },
  warning: { bg: 'var(--warning-bg)', accent: 'var(--warning)' },
  notice: { bg: 'var(--notice-bg)', accent: 'var(--notice)' },
}

export function AgentPipelineLoader({
  steps,
  currentStep,
  state,
  error,
  header,
  className,
}: AgentPipelineLoaderProps) {
  const resolved: PipelineState = state ?? (currentStep >= steps.length ? 'complete' : 'running')

  const isError = resolved === 'error'
  const activeIndex = Math.min(Math.max(currentStep, 0), Math.max(steps.length - 1, 0))
  const elapsed = useStepTimings(activeIndex, resolved)

  // Progressive reveal — nothing below the active step is drawn.
  const revealed =
    resolved === 'pending'
      ? steps.slice(0, 1)
      : resolved === 'complete'
        ? steps
        : steps.slice(0, activeIndex + 1)

  const doneCount =
    resolved === 'complete' ? steps.length : resolved === 'pending' ? 0 : activeIndex
  const progress = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0

  return (
    <div className={['flex flex-col w-full', className].filter(Boolean).join(' ')}>
      {!isError && <ProgressRail value={progress} />}

      {header != null && <div className="w-full px-l pt-l">{header}</div>}

      {isError ? (
        <div className="flex flex-col w-full p-l">
          <StepRow
            step={{
              title: error?.title ?? 'Oracle ran into a problem',
              activeSub: '',
              doneSub: error?.description ?? 'Something went wrong. Please try again',
            }}
            status="error"
            isLast
            timing={null}
          />
          {error?.onRetry && (
            <div className="flex flex-col items-start pl-[32px] mt-[10px]">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<RefreshIcon />}
                onClick={error.onRetry}
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      ) : (
        <ol className="flex flex-col w-full p-l">
          {revealed.map((step, i) => {
            const status: StepStatus =
              resolved === 'pending'
                ? 'pending'
                : resolved === 'complete'
                  ? 'done'
                  : i < activeIndex
                    ? 'done'
                    : 'active'
            return (
              <StepRow
                key={step.title}
                step={step}
                status={status}
                isLast={i === revealed.length - 1}
                timing={status === 'pending' ? null : (step.duration ?? elapsed[i] ?? null)}
              />
            )
          })}
        </ol>
      )}
    </div>
  )
}

/** 3px rail flush along the top edge — track + brand fill. */
function ProgressRail({ value }: { value: number }) {
  return (
    <div
      className="w-full h-[3px] shrink-0 overflow-hidden"
      style={{ backgroundColor: 'var(--border-subtle)' }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Scaled rather than width-animated — keeps the fill on the compositor
          and off the layout path, which a `width` transition here is not. */}
      <div
        className="h-full w-full origin-left transition-transform duration-500 ease-out"
        style={{ transform: `scaleX(${value / 100})`, backgroundColor: 'var(--brand)' }}
      />
    </div>
  )
}

function StepRow({
  step,
  status,
  isLast,
  timing,
}: {
  step: PipelineStep
  status: StepStatus
  isLast: boolean
  timing: string | null
}) {
  const titleColor =
    status === 'pending'
      ? 'var(--text-tertiary)'
      : status === 'error'
        ? 'var(--error)'
        : 'var(--text-primary)'

  const description =
    status === 'pending' ? null : status === 'active' ? step.activeSub : step.doneSub

  const callout = status === 'pending' ? undefined : step.callout

  return (
    <li
      className="flex gap-s items-stretch w-full"
      aria-current={status === 'active' ? 'step' : undefined}
    >
      {/* Status rail — 20px column, indicator + connector */}
      <div className="flex flex-col items-center shrink-0 pt-xxxs gap-xxxs" style={{ width: 20 }}>
        <StatusIndicator status={status} />
        {!isLast && (
          <span
            className="shrink-0"
            style={{
              width: 2,
              flexGrow: 1,
              minHeight: 12,
              backgroundColor: 'var(--border-default)',
            }}
          />
        )}
      </div>

      {/* Body */}
      <div className={['flex-1 min-w-0 flex flex-col gap-xxs', isLast ? '' : 'pb-l'].join(' ')}>
        <div className="flex gap-xs items-baseline">
          <span
            className="font-body text-s font-semibold leading-[1.5]"
            style={{ color: titleColor }}
          >
            {step.title}
          </span>
          {timing && (
            <span
              className="font-body text-2xs font-normal shrink-0"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {timing}
            </span>
          )}
        </div>

        {description && (
          <span
            className="font-body text-xs font-normal leading-[1.5]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {description}
          </span>
        )}

        {callout && <CalloutNote callout={callout} />}
      </div>
    </li>
  )
}

/** Tinted note with a 4px left accent bar (Figma renders this as an inner shadow). */
function CalloutNote({ callout }: { callout: PipelineCallout }) {
  const tint = CALLOUT_TINT[callout.type ?? 'warning']
  return (
    <div
      className="flex flex-col gap-xxs w-full rounded-xs mt-xxs"
      style={{
        backgroundColor: tint.bg,
        padding: '12px 12px 12px 16px',
        boxShadow: `inset 4px 0 0 0 ${tint.accent}`,
      }}
    >
      <p className="font-body text-s leading-[1.5]" style={{ color: 'var(--text-primary)' }}>
        <span className="font-semibold">{callout.lead}</span>
        {callout.rest && <span className="font-normal">{callout.rest}</span>}
      </p>
    </div>
  )
}

function StatusIndicator({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <span
        className="inline-flex items-center justify-center rounded-round shrink-0"
        style={{ width: 16, height: 16, backgroundColor: 'var(--success)' }}
        aria-hidden
      >
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path
            d="M1 3L3 5L7 1"
            stroke="var(--text-on-brand)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }

  if (status === 'error') {
    return (
      <span
        className="inline-flex items-center justify-center rounded-round shrink-0"
        style={{ width: 16, height: 16, backgroundColor: 'var(--error)' }}
        aria-hidden
      >
        <svg width="2" height="9" viewBox="0 0 2 9" fill="none">
          <path d="M1 0.5V5.5" stroke="var(--text-on-brand)" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M1 8V8.01" stroke="var(--text-on-brand)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (status === 'active') {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{ width: 16, height: 16 }}
        aria-hidden
      >
        <svg width="16" height="16" viewBox="0 0 16 16" className="pipeline-spinner">
          <circle cx="8" cy="8" r="7" fill="none" stroke="var(--border-default)" strokeWidth="1" />
          <circle
            className="pipeline-spinner-arc"
            cx="8"
            cy="8"
            r="7"
            fill="none"
            stroke="var(--text-primary)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </span>
    )
  }

  return (
    <span
      className="rounded-round shrink-0"
      style={{
        width: 16,
        height: 16,
        backgroundColor: 'var(--bg-page-pale)',
        border: '1.5px solid var(--border-default)',
      }}
      aria-hidden
    />
  )
}

/**
 * Times each step live so rows carry a real duration label. The active step
 * ticks; finished steps freeze at the value they reached.
 */
function useStepTimings(activeIndex: number, state: PipelineState) {
  const [, tick] = useState(0)
  const startedAt = useRef<Record<number, number>>({})
  const frozen = useRef<Record<number, string>>({})

  const running = state === 'running'

  if (running && startedAt.current[activeIndex] == null) {
    startedAt.current[activeIndex] = Date.now()
  }

  // Freeze every step the pipeline has moved past.
  for (const key of Object.keys(startedAt.current)) {
    const i = Number(key)
    const passed = state === 'complete' || i < activeIndex
    if (passed && frozen.current[i] == null) {
      frozen.current[i] = fmt(Date.now() - startedAt.current[i])
    }
  }

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => tick((n) => n + 1), 100)
    return () => clearInterval(id)
  }, [running])

  const out: Record<number, string> = { ...frozen.current }
  if (running && startedAt.current[activeIndex] != null && out[activeIndex] == null) {
    out[activeIndex] = fmt(Date.now() - startedAt.current[activeIndex])
  }
  return out
}

function fmt(ms: number) {
  return `${Math.max(ms / 1000, 0.1).toFixed(1)}s`
}
