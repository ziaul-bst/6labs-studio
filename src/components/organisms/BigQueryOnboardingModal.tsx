/**
 * BigQueryOnboardingModal — Single-step onboarding flow for the BigQuery connector.
 *
 * Per the 2026-05-18 review:
 *  1. One step (no multi-page wizard).
 *  2. Two inputs: GCP Project ID + service-account JSON file. Project ID
 *     auto-prefills from the JSON's `project_id` field when present.
 *  3. Tri-state outcome — instant green / yellow / red feedback. YELLOW means
 *     the connection works but documentation is incomplete; the detail view
 *     then guides the user to fill in table + column descriptions.
 *  4. A "Share with the whole organisation" checkbox controls whether the
 *     service-account connection is org-wide or limited to the current user.
 *
 * Code-first prototype — no Figma source yet.
 */

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { createPortal } from 'react-dom'
import Button from '../ui/Button'
// Input intentionally removed — project_id is extracted from the SA JSON
// rather than typed by the user.
import { CloseIcon } from '../icons/CloseIcon'
import { FileDocIcon } from '../icons/FileDocIcon'
import { TrashIcon } from '../icons/TrashIcon'
import { ConnectionStatusPill } from '../atoms/ConnectionStatusPill'
import { ConnectorErrorMessage } from '../molecules/ConnectorErrorMessage'
import { ConnectorSharingCard } from '../molecules/ConnectorSharingCard'
import { BigQueryIcon } from '../icons/connectors/BigQueryIcon'
import type { BigQueryVerdict } from '../../lib/state/connectorsStore'

export type BigQueryOnboardingState =
  | 'idle'
  // Legacy alias retained for any external callers — treated as 'progress'
  // pointing at the first step.
  | 'connecting'
  | 'progress'
  | 'success'
  | 'failed'

// 4-stage loader. The order is fixed: auth → BQ reachability → access OK →
// table import. Each step has a static label + a per-state subline.
export type BigQueryStep = 'connecting' | 'testing' | 'connected' | 'importing'
export const STEP_ORDER: BigQueryStep[] = ['connecting', 'testing', 'connected', 'importing']

const STEP_META: Record<
  BigQueryStep,
  { title: string; activeSub: string; doneSub: string }
> = {
  connecting: {
    title: 'Connecting to BigQuery',
    activeSub: 'Authenticating with your service account…',
    doneSub: 'Service account authenticated.',
  },
  testing: {
    title: 'Testing connection',
    activeSub: 'Checking BigQuery API reachability and project access…',
    doneSub: 'Project reachable. BigQuery API responded.',
  },
  connected: {
    title: 'Connected',
    activeSub: 'Verifying read permissions on your dataset…',
    doneSub: 'Read access verified on your dataset.',
  },
  importing: {
    title: 'Importing tables',
    activeSub: 'Pulling table schemas and column metadata…',
    doneSub: 'Tables imported.',
  },
}

const STEP_ERROR_COPY: Record<
  BigQueryStep,
  { headline: string; helper: string; helpLinkHref?: string; helpLinkLabel?: string }
> = {
  connecting: {
    headline: 'Authentication failed',
    helper:
      'The service-account JSON couldn\'t authenticate. The key may have been rotated or revoked — generate a new one and try again.',
    helpLinkHref: 'https://cloud.google.com/iam/docs/keys-create-delete',
    helpLinkLabel: 'How to rotate service-account keys',
  },
  testing: {
    headline: 'Couldn\'t reach BigQuery',
    helper:
      'BigQuery API didn\'t respond, or the GCP project couldn\'t be found. Check the Project ID, and make sure the BigQuery API is enabled.',
    helpLinkHref: 'https://cloud.google.com/bigquery/docs/enable-transfer-service',
    helpLinkLabel: 'How to enable the BigQuery API',
  },
  connected: {
    headline: 'Permission denied',
    helper:
      'Authentication worked, but the service account doesn\'t have BigQuery Data Viewer access on this project. Grant the role in GCP IAM and try again.',
    helpLinkHref: 'https://cloud.google.com/iam/docs/granting-changing-revoking-access',
    helpLinkLabel: 'How to grant IAM roles',
  },
  importing: {
    headline: 'Couldn\'t import tables',
    helper:
      'The connection worked, but listing tables failed. This is usually transient — retry, and if it keeps failing make sure the service account has access to at least one dataset.',
  },
}

export interface ProgressDetail {
  /** Index in STEP_ORDER currently in progress (0–3) or completed up through that index. */
  step: number
  /** True when the step at `step` finished successfully and the next is starting. */
  completedThrough?: number
  /** Set when the step at `step` failed. */
  errorAtStep?: number
  /** Free-form override for the error helper. */
  errorMessage?: string
  /** Once the API/import completes, how many imported tables have problems
   *  (non-GREEN verdict). Surfaced at the bottom of the loader. */
  problemTableCount?: number
  /** Total tables imported — paired with problemTableCount for the summary. */
  totalTableCount?: number
}

export interface SuccessSummary {
  projectId: string
  tableCount: number
  verdict: BigQueryVerdict
  /** Headline reason string from the backend, e.g. "1 table(s) YELLOW…". */
  verdictReason: string
  /** Tables that still need descriptions — drives the done-card second line. */
  needsDescriptions?: number
}

const MAX_JSON_BYTES = 5 * 1024 * 1024

export interface BigQueryOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  /** Storybook-controllable state. Defaults to "idle". */
  state?: BigQueryOnboardingState
  /** Pre-filled Project ID (useful for the connected story). */
  projectId?: string
  /** Pre-filled file name (useful for non-idle stories). */
  fileName?: string
  /** Reason string surfaced in the `failed` state. */
  errorReason?: string
  /** Storybook-only: seed the inline upload error (e.g. "JSON needs fixing"). */
  initialError?: string
  /** Drives the 4-stage loader. Required when `state` ∈ {progress, failed}. */
  progress?: ProgressDetail
  /** Summary content shown when `state="success"`. */
  summary?: SuccessSummary
  /** Called with the user-entered Project ID + selected file when "Connect" is clicked. */
  onConnect?: (payload: {
    projectId: string
    file: File
    orgWideAccess: boolean
    /** Owner's choice: can teammates edit this connection (not just query it)? */
    orgWideEdit: boolean
  }) => void
  /** Called when the user clicks "Done" after a successful connection. */
  onDone?: () => void
  /** Called when the user clicks "Try again" from the failed state. */
  onRetry?: () => void
  /** Prototype: accept any file and skip service-account-key validation so the
   *  flow can always complete. Defaults to false — production is unaffected. */
  lenient?: boolean
}

export function BigQueryOnboardingModal({
  isOpen,
  onClose,
  state: rawState = 'idle',
  projectId: projectIdProp,
  fileName: fileNameProp,
  errorReason,
  initialError,
  progress,
  summary,
  onConnect,
  onDone,
  onRetry,
  lenient = false,
}: BigQueryOnboardingModalProps) {
  // Map the legacy `connecting` alias onto the new `progress` state so all
  // existing call sites keep working without code changes.
  const state: BigQueryOnboardingState = rawState === 'connecting' ? 'progress' : rawState
  // projectId is now derived from the uploaded JSON — never user-typed. The
  // `projectIdProp` is only used to prefill the read-only chip in
  // Storybook/legacy callers; the real value comes from `file`.
  const [projectId, setProjectId] = useState(projectIdProp ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(initialError ?? null)
  const [extracting, setExtracting] = useState(false)
  // Permission choice — on by default: teammates can edit descriptions.
  // Off restricts them to view-only access to this connection.
  const [orgWideEdit, setOrgWideEdit] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keep state in sync if parent overrides projectId (Storybook reset).
  useEffect(() => {
    if (projectIdProp !== undefined) setProjectId(projectIdProp)
  }, [projectIdProp])

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const displayFileName = file?.name ?? fileNameProp ?? null
  const fileSizeLabel = file ? formatBytes(file.size) : null
  const canSubmit =
    state === 'idle' && projectId.trim().length > 0 && !!file && !localError && !extracting

  const handleFile = (next: File | undefined) => {
    if (!next) return
    if (!lenient && !next.name.toLowerCase().endsWith('.json')) {
      setLocalError('Only .json service-account files are supported.')
      setFile(null)
      setProjectId('')
      return
    }
    if (next.size > MAX_JSON_BYTES) {
      setLocalError('File too large — service-account JSON should be under 5 MB.')
      setFile(null)
      setProjectId('')
      return
    }

    // Validate the JSON looks like a service-account key. A malformed file or
    // one that isn't an SA key surfaces a distinct "needs to be fixed" state
    // so the user knows to re-export it — rather than silently proceeding.
    setExtracting(true)
    setLocalError(null)
    const NEEDS_FIX =
      'The selected JSON needs to be fixed — it isn’t a valid service-account key (no project_id found). Re-export the key from GCP and try again.'
    next.text().then((raw) => {
      let parsed: Record<string, unknown> | null = null
      try {
        parsed = JSON.parse(raw) as Record<string, unknown>
      } catch {
        parsed = null
      }
      const looksLikeSaKey =
        parsed != null &&
        (typeof parsed.project_id === 'string' ||
          typeof parsed.private_key === 'string' ||
          typeof parsed.client_email === 'string')
      const derivedProjectId =
        looksLikeSaKey && typeof parsed!.project_id === 'string' && parsed!.project_id.trim()
          ? parsed!.project_id.trim()
          : ''
      if (!lenient && !derivedProjectId) {
        setExtracting(false)
        setFile(null)
        setLocalError(NEEDS_FIX)
        return
      }
      setFile(next)
      setProjectId(derivedProjectId || next.name.replace(/\.[^.]+$/, '') || 'demo-project')
      setExtracting(false)
    }).catch(() => {
      setExtracting(false)
      if (lenient) {
        setFile(next)
        setProjectId(next.name.replace(/\.[^.]+$/, '') || 'demo-project')
        return
      }
      setFile(null)
      setLocalError('Couldn’t read this file. Re-export the service-account JSON and try again.')
    })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleConnect = () => {
    if (!canSubmit || !file) return
    // Org-wide access is mandatory now — every workspace member can query.
    // Whether they can also EDIT is the owner's choice (orgWideEdit).
    onConnect?.({ projectId: projectId.trim(), file, orgWideAccess: true, orgWideEdit })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-m"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bigquery-onboarding-title"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="relative flex flex-col gap-l bg-bg-elements rounded-m shadow-normal p-l w-[520px] max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start gap-s w-full shrink-0">
          <div
            className="shrink-0 size-[40px] rounded-m overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-tint-light)' }}
          >
            <BigQueryIcon size={40} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-xxs">
            <h2
              id="bigquery-onboarding-title"
              className="font-display text-m font-bold leading-[1.4]"
              style={{ color: 'var(--text-primary)' }}
            >
              Connect BigQuery
            </h2>
            <p
              className="font-body text-s leading-[1.5]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Upload a GCP service-account JSON.
            </p>
          </div>
          <button
            className="shrink-0 flex items-center justify-center w-4 h-4"
            style={{ color: 'var(--text-secondary)' }}
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Body — varies by state */}
        {state === 'success' ? (
          <SuccessBody
            summary={summary}
            projectId={summary?.projectId ?? projectIdProp ?? projectId}
            onDone={onDone ?? onClose}
          />
        ) : state === 'progress' || state === 'failed' ? (
          <ProgressBody
            state={state}
            progress={progress ?? { step: 0 }}
            projectId={projectIdProp ?? projectId}
            errorMessageOverride={errorReason}
            onRetry={() => {
              // A failed connect usually traces back to the uploaded key —
              // clear it so "Try again" starts from a fresh dropzone instead
              // of keeping the rejected file attached.
              setFile(null)
              setProjectId('')
              setLocalError(null)
              onRetry?.()
            }}
            onCancel={onClose}
          />
        ) : (
          <div className="flex flex-col gap-m w-full">
            <div className="flex flex-col gap-xxs">
              <label
                className="font-body text-s font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Service-account JSON
              </label>
              {displayFileName ? (
                <div
                  className="flex items-center gap-s p-s rounded-m"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    className="shrink-0 inline-flex items-center justify-center w-[28px] h-[28px] rounded-s"
                    style={{ backgroundColor: 'var(--bg-tint-light)', color: 'var(--brand)' }}
                  >
                    <FileDocIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span
                      className="font-body text-s font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {displayFileName}
                    </span>
                    {fileSizeLabel && (
                      <span
                        className="font-body text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {fileSizeLabel}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="shrink-0 inline-flex items-center justify-center w-[28px] h-[28px] rounded-s"
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={() => {
                      setFile(null)
                      setLocalError(null)
                    }}
                    aria-label="Remove file"
                    disabled={state === 'connecting'}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  className="flex flex-col items-center justify-center gap-xxs px-m py-l rounded-m cursor-pointer transition-colors duration-150"
                  style={{
                    backgroundColor: dragOver
                      ? 'var(--bg-tint-light)'
                      : 'var(--bg-card)',
                    border: `1px dashed ${
                      dragOver ? 'var(--brand)' : 'var(--border-tint)'
                    }`,
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                  <span
                    className="font-body text-s font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Drop your <code>.json</code> here or click to upload
                  </span>
                  <span
                    className="font-display text-2xs font-semibold uppercase tracking-[0.12em]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    MAX 5 MB
                  </span>
                </div>
              )}
              {extracting && (
                <span
                  className="font-body text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Reading project ID from key…
                </span>
              )}
              {localError && (
                <span
                  className="font-body text-xs"
                  style={{ color: 'var(--error)' }}
                >
                  {localError}
                </span>
              )}
            </div>

            {/* Project ID confirmation — extracted from the SA JSON. Read-only
                so the user can verify before connecting; the JSON itself is
                always the source of truth. (Snowflake's fields stay editable —
                its details are user-typed, not derived from a credential file.) */}
            {projectId && !localError && (
              <div
                className="flex items-center gap-s p-s rounded-m"
                style={{
                  backgroundColor: 'var(--bg-tint-light)',
                  border: '1px solid var(--border-tint)',
                }}
              >
                <span
                  className="font-display text-2xs font-semibold uppercase tracking-[0.12em] shrink-0"
                  style={{ color: 'var(--brand)' }}
                >
                  Project
                </span>
                <code
                  className="flex-1 min-w-0 font-body text-s font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                  title={projectId}
                >
                  {projectId}
                </code>
                <span
                  className="font-body text-xs shrink-0"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  from JSON
                </span>
              </div>
            )}

            <a
              href="https://cloud.google.com/iam/docs/service-accounts-create"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs font-medium underline self-start"
              style={{ color: 'var(--brand)' }}
            >
              How to create a service account
            </a>

            {/* Compact pre-connect notices — one line each. */}
            <div
              className="flex items-start gap-xs px-s py-xs rounded-m"
              style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning)' }}
            >
              <span
                aria-hidden
                className="shrink-0 mt-[1px] inline-flex items-center justify-center w-[16px] h-[16px] rounded-full font-display text-2xs font-bold"
                style={{ backgroundColor: 'var(--warning)', color: 'var(--text-on-brand)' }}
              >
                !
              </span>
              <span className="font-body text-xs leading-[1.5]" style={{ color: 'var(--text-primary)' }}>
                Tables and columns without descriptions in BigQuery mark the connection
                <strong> needs descriptions</strong> — Oracle answers are weaker until they’re filled in.
              </span>
            </div>

            {state === 'failed' && (
              <div
                className="flex flex-col gap-xxs p-s rounded-m"
                style={{
                  backgroundColor: 'var(--error-bg)',
                  border: '1px solid var(--error)',
                }}
              >
                <span
                  className="font-display text-xs font-semibold"
                  style={{ color: 'var(--error)' }}
                >
                  Could not connect to BigQuery
                </span>
                <span
                  className="font-body text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {errorReason ??
                    'Check that the service account has BigQuery Data Viewer access on the project.'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Shared connection management — what sharing means (always-true
            baseline) plus the one thing the owner controls. */}
        {state === 'idle' && (
          <ConnectorSharingCard orgWideEdit={orgWideEdit} onOrgWideEditChange={setOrgWideEdit} />
        )}

        {/* Actions — only when the form is editable. progress/success/failed
            states manage their own buttons inside the body. */}
        {state === 'idle' && (
          <div className="flex gap-m w-full shrink-0">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleConnect}
              disabled={!canSubmit}
            >
              Connect
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

function ProgressBody({
  state,
  progress,
  projectId,
  errorMessageOverride,
  onRetry,
  onCancel,
}: {
  state: 'progress' | 'failed'
  progress: ProgressDetail
  projectId: string
  errorMessageOverride?: string
  onRetry?: () => void
  onCancel: () => void
}) {
  const errorStep = state === 'failed' ? (progress.errorAtStep ?? progress.step) : undefined
  const errorMeta = errorStep != null ? STEP_ERROR_COPY[STEP_ORDER[errorStep]] : undefined

  return (
    <div className="flex flex-col gap-m w-full">
      {/* Header line: which project we're talking to */}
      <p
        className="font-body text-xs"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Project · <code style={{ color: 'var(--text-secondary)' }}>{projectId || '—'}</code>
      </p>

      {/* Step list */}
      <ol className="flex flex-col">
        {STEP_ORDER.map((step, i) => {
          const status: StepRowStatus =
            errorStep === i
              ? 'error'
              : i < progress.step
                ? 'done'
                : i === progress.step
                  ? state === 'failed'
                    ? 'pending' // shouldn't hit because errorStep covers it
                    : 'active'
                  : 'pending'
          return <StepRow key={step} step={step} status={status} isLast={i === STEP_ORDER.length - 1} />
        })}
      </ol>

      {/* Review summary — surfaced once the import/API completes, before the
          success screen, so the user sees how many tables need attention. */}
      {state !== 'failed' && progress.problemTableCount != null && (
        <div
          className="flex items-center gap-s p-m rounded-m"
          style={{
            backgroundColor:
              progress.problemTableCount > 0 ? 'var(--warning-bg)' : 'var(--bg-tint-light)',
            border: `1px solid ${
              progress.problemTableCount > 0 ? 'var(--warning)' : 'var(--border-tint)'
            }`,
          }}
        >
          <span
            className="font-body text-s leading-[1.5]"
            style={{
              color:
                progress.problemTableCount > 0 ? 'var(--warning)' : 'var(--text-secondary)',
            }}
          >
            {progress.problemTableCount > 0 ? (
              <>
                <strong>{progress.problemTableCount}</strong> of{' '}
                <strong>{progress.totalTableCount}</strong>{' '}
                table{progress.totalTableCount === 1 ? '' : 's'} need attention — add
                missing descriptions to mark them ready.
              </>
            ) : (
              <>
                All <strong>{progress.totalTableCount}</strong> tables look good.
              </>
            )}
          </span>
        </div>
      )}

      {/* Error helper + actions */}
      {state === 'failed' && errorMeta && (
        <div
          className="flex flex-col items-start gap-xs p-m rounded-m"
          style={{
            backgroundColor: 'var(--error-bg)',
            border: '1px solid var(--error)',
          }}
        >
          {/* Status pill — mirrors the production connectors dialog. */}
          <span
            className="inline-flex items-center gap-xxs px-xs py-xxxs rounded-full font-display text-2xs font-semibold uppercase tracking-[0.12em] shrink-0"
            style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}
          >
            <span
              aria-hidden
              style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: 'var(--error)' }}
            />
            Connection failed
          </span>
          <ConnectorErrorMessage
            text={progress.errorMessage ?? errorMessageOverride ?? errorMeta.helper}
          />
          {errorMeta.helpLinkHref && errorMeta.helpLinkLabel && (
            <a
              href={errorMeta.helpLinkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs font-medium underline self-start"
              style={{ color: 'var(--brand)' }}
            >
              {errorMeta.helpLinkLabel}
            </a>
          )}
        </div>
      )}

      {state === 'failed' && (
        <div className="flex gap-m w-full">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
            Close
          </Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={onRetry ?? onCancel}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}

type StepRowStatus = 'pending' | 'active' | 'done' | 'error'

function StepRow({
  step,
  status,
  isLast,
}: {
  step: BigQueryStep
  status: StepRowStatus
  isLast: boolean
}) {
  const meta = STEP_META[step]
  const palette = STEP_PALETTE[status]
  const subline =
    status === 'done'
      ? meta.doneSub
      : status === 'active'
        ? meta.activeSub
        : status === 'error'
          ? 'Failed — see details below.'
          : 'Waiting…'

  return (
    <li className="flex gap-m items-stretch" aria-current={status === 'active' ? 'step' : undefined}>
      {/* Marker + spine */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 24 }}>
        <span
          className="inline-flex items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            backgroundColor: palette.markerBg,
            border: `1px solid ${palette.markerBorder}`,
            color: palette.markerFg,
          }}
          aria-hidden
        >
          {status === 'done' ? (
            <CheckGlyph />
          ) : status === 'error' ? (
            <span className="font-display text-xs font-bold">!</span>
          ) : status === 'active' ? (
            <Spinner />
          ) : (
            <span
              className="rounded-full"
              style={{ width: 6, height: 6, backgroundColor: palette.markerFg }}
            />
          )}
        </span>
        {!isLast && (
          <span
            style={{
              width: 2,
              flexGrow: 1,
              minHeight: 16,
              backgroundColor:
                status === 'done' ? 'var(--success)' : 'var(--border-subtle)',
              marginTop: 4,
              marginBottom: 4,
            }}
          />
        )}
      </div>

      {/* Copy */}
      <div className="flex-1 min-w-0 flex flex-col gap-xxs pb-m">
        <span
          className="font-body text-s font-medium"
          style={{ color: palette.titleFg }}
        >
          {meta.title}
        </span>
        <span
          className="font-body text-xs leading-[1.5]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {subline}
        </span>
      </div>
    </li>
  )
}

const STEP_PALETTE: Record<
  StepRowStatus,
  { markerBg: string; markerBorder: string; markerFg: string; titleFg: string }
> = {
  pending: {
    markerBg: 'var(--bg-card)',
    markerBorder: 'var(--border-default)',
    markerFg: 'var(--text-tertiary)',
    titleFg: 'var(--text-secondary)',
  },
  active: {
    markerBg: 'var(--bg-tint-light)',
    markerBorder: 'var(--brand)',
    markerFg: 'var(--brand)',
    titleFg: 'var(--text-primary)',
  },
  done: {
    markerBg: 'var(--success-bg)',
    markerBorder: 'var(--success)',
    markerFg: 'var(--success)',
    titleFg: 'var(--text-primary)',
  },
  error: {
    markerBg: 'var(--error-bg)',
    markerBorder: 'var(--error)',
    markerFg: 'var(--error)',
    titleFg: 'var(--error)',
  },
}

function CheckGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 6.2L5 8.7L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <span
      className="animate-spin"
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
      }}
    />
  )
}

function SuccessBody({
  summary,
  projectId,
  onDone,
}: {
  summary?: SuccessSummary
  projectId: string
  onDone: () => void
}) {
  const verdict = summary?.verdict ?? 'YELLOW'
  const verdictVariant: 'ready' | 'partial' = verdict === 'GREEN' ? 'ready' : 'partial'
  const tableCount = summary?.tableCount ?? 0

  return (
    <div className="flex flex-col gap-m w-full">
      {/* All 4 steps done — show compact summary */}
      <ol className="flex flex-col">
        {STEP_ORDER.map((step, i) => (
          <StepRow key={step} step={step} status="done" isLast={i === STEP_ORDER.length - 1} />
        ))}
      </ol>

      {/* Done summary card — status pill on top, copy below (mirrors the
          production connectors dialog). */}
      <div
        className="flex flex-col items-start gap-xs p-m rounded-m"
        style={{
          backgroundColor:
            verdict === 'GREEN' ? 'var(--success-bg)' : 'var(--warning-bg)',
          border: `1px solid ${verdict === 'GREEN' ? 'var(--success)' : 'var(--warning)'}`,
        }}
      >
        <ConnectionStatusPill variant={verdictVariant} />
        <span
          className="font-body text-s flex flex-col gap-xxxs leading-[1.5]"
          style={{ color: 'var(--text-primary)' }}
        >
          <span>
            {tableCount === 0 ? (
              <>No tables were imported from <strong>{projectId || 'your project'}</strong>.</>
            ) : (
              <>
                Imported <strong>{tableCount}</strong> table{tableCount === 1 ? '' : 's'} from{' '}
                <strong>{projectId || 'your project'}</strong>.
              </>
            )}
          </span>
          {verdict === 'YELLOW' && (summary?.needsDescriptions ?? 0) > 0 && (
            <span>
              {summary!.needsDescriptions} table{summary!.needsDescriptions === 1 ? ' still needs' : 's still need'}{' '}
              descriptions for sharper answers.
            </span>
          )}
        </span>
      </div>

      <div className="flex gap-m w-full">
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={onDone}
        >
          Done
        </Button>
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
