/**
 * TestingHomeEmpty — zero state for a Testing screen with nothing to show yet.
 *
 * Testing has one hard prerequisite: without recorded sessions there is nothing
 * for any of its screens to run against. So the zero state is not a decorative
 * empty box — it is the actual first step, and it names the two ways to get
 * footage in (footage you already have, or footage you go and record).
 *
 * Copy is passed in, because the same shape serves Runs and each individual
 * test — only the headline and the sentence under it change.
 *
 * The readiness row below the rule reports both prerequisites at once, so the
 * user can see which one is still missing rather than discovering it inside an
 * agent. Other states (runs in progress, runs complete) come later.
 */

import { Fragment } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { TestRunIcon } from '../icons/TestRunIcon'
import { CheckIcon } from '../icons/CheckIcon'
import Button from '../ui/Button'

export interface TestingHomeEmptyProps {
  title?: string
  description?: string
  /** Badge glyph — should be the screen's own nav icon, not a generic one. */
  icon?: ReactNode
  /** Videos available in the Gameplay Library — 0 is what makes this the zero state. */
  libraryVideoCount?: number
  /** Whether the game context (documents, connectors) has been added. */
  gameContextAdded?: boolean
  onOpenLibrary?: () => void
  onGetRecorder?: () => void
  /**
   * Numbered rail shown between the copy and the CTA. Present when the screen
   * is a *first run* rather than a blocked one — with footage in the library
   * the question stops being "how do I get videos in" and becomes "what does a
   * run involve", which is what the rail answers.
   */
  steps?: { title: string; detail: ReactNode }[]
  /** Replaces the default two buttons when the screen's next action differs. */
  actions?: ReactNode
}

export function TestingHomeEmpty({
  title = 'Add recordings to run your first test',
  description = 'Upload footage you have, or record new sessions with the Recorder app.',
  icon = <TestRunIcon size={32} />,
  libraryVideoCount = 0,
  gameContextAdded = true,
  onOpenLibrary,
  onGetRecorder,
  steps,
  actions,
}: TestingHomeEmptyProps) {
  return (
    /* Centred in the content region — a zero state is the whole screen, not a
       block sitting at the top of an otherwise empty one. */
    <div className="flex flex-col items-center justify-center min-h-full px-xxl py-xxl w-full">
      <div
        className="step-rail-host flex flex-col items-center gap-l w-full max-w-[860px] rounded-4xl px-xxl2 py-xxl2"
        style={{
          backgroundColor: 'var(--bg-page-pale)',
          border: '1px dashed var(--border-tint)',
        }}
      >
        {/* Icon badge */}
        <div
          className="flex items-center justify-center shrink-0 w-[80px] h-[80px] rounded-round text-text-brand"
          style={{
            backgroundColor: 'var(--bg-elements)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {icon}
        </div>

        <div className="flex flex-col items-center gap-xs w-full">
          <h1 className="font-display text-xl font-semibold text-text-primary leading-[1.3] text-center">
            {title}
          </h1>
          <p className="font-body text-m font-normal text-text-secondary leading-[1.6] text-center max-w-[68ch]">
            {description}
          </p>
        </div>

        {steps && steps.length > 0 && (
          /* Equal columns with the arrows in tracks of their own — the steps are
             the same size of thing, so a rail whose widths follow the copy reads
             as three unrelated cards rather than one sequence. */
          <ol
            className="step-rail items-start w-full pt-xs list-none m-0 p-0"
            style={
              {
                '--rail-cols': steps.map((_, i) => (i === 0 ? '1fr' : '16px 1fr')).join(' '),
              } as CSSProperties
            }
          >
            {steps.map((step, i) => (
              <Fragment key={step.title}>
                {i > 0 && (
                  <span
                    className="step-rail-arrow items-center justify-center h-6 font-body text-s text-text-placeholder"
                    aria-hidden
                  >
                    →
                  </span>
                )}
                <li className="flex gap-xs items-start min-w-0">
                  <span
                    className="flex items-center justify-center shrink-0 w-6 h-6 rounded-round font-display text-xs font-semibold"
                    style={{ backgroundColor: 'var(--bg-tint)', color: 'var(--text-brand)' }}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-xxxs min-w-0">
                    <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">
                      {step.title}
                    </span>
                    <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                      {step.detail}
                    </span>
                  </span>
                </li>
              </Fragment>
            ))}
          </ol>
        )}

        <div className="flex flex-wrap gap-s items-center justify-center">
          {actions ?? (
            <>
              <Button variant="primary" size="lg" onClick={onOpenLibrary}>
                Open Gameplay Library
              </Button>
              <Button variant="secondary" size="lg" onClick={onGetRecorder}>
                Get the Recorder app
              </Button>
            </>
          )}
        </div>

        {/* Readiness row — what Testing still needs before any agent can run */}
        <div className="flex flex-col gap-m items-center w-full pt-l">
          <div className="h-px w-full max-w-[840px]" style={{ backgroundColor: 'var(--border-subtle)' }} />
          <div className="flex flex-wrap gap-xl items-center justify-center">
            <ReadinessItem
              done={libraryVideoCount > 0}
              doneLabel={`${libraryVideoCount} videos in Gameplay Library`}
              pendingLabel="No videos in Gameplay Library"
            />
            <ReadinessItem
              done={gameContextAdded}
              doneLabel="Game context added"
              pendingLabel="Game context not added"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ReadinessItem({
  done,
  doneLabel,
  pendingLabel,
}: {
  done: boolean
  doneLabel: string
  pendingLabel: string
}) {
  return (
    <div className="flex gap-xs items-center">
      {done ? (
        <span
          className="flex items-center justify-center shrink-0 w-4 h-4"
          style={{ color: 'var(--success)' }}
          aria-hidden
        >
          <CheckIcon size={16} />
        </span>
      ) : (
        /* Outstanding, not broken — a ring rather than an error mark. */
        <span
          className="shrink-0 w-3 h-3 rounded-round"
          style={{ border: '2px solid var(--warning)' }}
          aria-hidden
        />
      )}
      <span className="font-body text-s font-normal text-text-secondary leading-[1.5]">
        {done ? doneLabel : pendingLabel}
      </span>
    </div>
  )
}
