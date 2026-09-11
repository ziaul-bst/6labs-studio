/**
 * SnowflakeOnboardingModal — Key-pair onboarding flow for the Snowflake connector.
 *
 * Snowflake uses RSA key-pair auth (no credential upload). The flow is an
 * outbound handshake (see Snowflake_KeyPair_Setup_Guide):
 *  1. 6labs generates the key pair internally — the private key never leaves us.
 *  2. We hand the admin one copyable setup script that creates a read-only
 *     role/user and registers our public key (ALTER USER … SET RSA_PUBLIC_KEY).
 *     The key is embedded directly in the SQL, so there's no separate key to
 *     copy — one block to run, top to bottom.
 *  3. The admin returns four non-sensitive connection details — Account
 *     Identifier, Username, Warehouse, Database — which we collect on step 2.
 *  4. We verify connectivity (4-stage loader) and import tables.
 *
 * The idle state is a 2-step wizard:
 *  • Step 1 "Set up access in Snowflake" — copy + run the setup SQL.
 *  • Step 2 "Connection details" — the four inputs + Verify.
 *
 * progress / success / failed reuse the same step-loader pattern as BigQuery.
 *
 * Code-first prototype — no Figma source yet.
 */

import { Fragment, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { CloseIcon } from '../icons/CloseIcon'
import { CopyIcon } from '../icons/CopyIcon'
import { CheckIcon } from '../icons/CheckIcon'
import { ConnectionStatusPill } from '../atoms/ConnectionStatusPill'
import { ConnectorErrorMessage } from '../molecules/ConnectorErrorMessage'
import { ConnectorSharingCard } from '../molecules/ConnectorSharingCard'
import { showToast } from '../atoms/Toast'
import { SnowflakeIcon } from '../icons/connectors/SnowflakeIcon'
import type {
  BigQueryVerdict,
  SnowflakeConnectionDetails,
} from '../../lib/state/connectorsStore'

export type SnowflakeOnboardingState = 'idle' | 'progress' | 'success' | 'failed'

// 4-stage loader. auth → account reachability → read access → table import.
export type SnowflakeStep = 'connecting' | 'testing' | 'access' | 'importing'
export const STEP_ORDER: SnowflakeStep[] = ['connecting', 'testing', 'access', 'importing']

const STEP_META: Record<
  SnowflakeStep,
  { title: string; activeSub: string; doneSub: string }
> = {
  connecting: {
    title: 'Authenticating',
    activeSub: 'Signing the request with our private key…',
    doneSub: 'Key-pair signature accepted.',
  },
  testing: {
    title: 'Reaching your account',
    activeSub: 'Resolving the account identifier and warehouse…',
    doneSub: 'Account reachable.',
  },
  access: {
    title: 'Verifying read access',
    activeSub: 'Checking SELECT on the database and schema…',
    doneSub: 'Read access verified.',
  },
  importing: {
    title: 'Importing tables',
    activeSub: 'Pulling table and column metadata…',
    doneSub: 'Tables imported.',
  },
}

const STEP_ERROR_COPY: Record<
  SnowflakeStep,
  { headline: string; helper: string; helpLinkHref?: string; helpLinkLabel?: string }
> = {
  connecting: {
    headline: 'Key-pair authentication failed',
    helper:
      'Snowflake rejected our key-pair signature. The public key may not be registered on this user. Run DESC USER and confirm RSA_PUBLIC_KEY is populated, then verify again.',
    helpLinkHref:
      'https://docs.snowflake.com/en/user-guide/key-pair-auth',
    helpLinkLabel: 'How key-pair auth works',
  },
  testing: {
    headline: 'Couldn’t reach your account',
    helper:
      'We couldn’t resolve the account identifier. Check the format (e.g. xy12345.us-east-1) and that the warehouse name is correct.',
    helpLinkHref:
      'https://docs.snowflake.com/en/user-guide/admin-account-identifier',
    helpLinkLabel: 'Find your account identifier',
  },
  access: {
    headline: 'Permission denied',
    helper:
      'Authentication worked, but the role doesn’t have SELECT on this database and schema. Grant SELECT to the read-only role and verify again.',
    helpLinkHref:
      'https://docs.snowflake.com/en/user-guide/security-access-control-overview',
    helpLinkLabel: 'How to grant read-only access',
  },
  importing: {
    headline: 'Couldn’t import tables',
    helper:
      'The connection works, but listing tables failed. This is usually transient — retry, and if it keeps failing confirm the role can see at least one table in the schema.',
  },
}

export interface ProgressDetail {
  step: number
  completedThrough?: number
  errorAtStep?: number
  errorMessage?: string
  problemTableCount?: number
  totalTableCount?: number
}

export interface SuccessSummary {
  database: string
  tableCount: number
  verdict: BigQueryVerdict
  verdictReason: string
  /** Tables that still need descriptions — drives the done-card second line. */
  needsDescriptions?: number
}

// A mock 6labs-generated public key. The real value comes from the backend's
// key-generation job; the private half never leaves 6labs.
const MOCK_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvJ2Yx8K3pQ\n' +
  'r7mN1fW0aZcL9sT4hV6bD2eR8uK0pXqA3nG5tY7wM1cF8jH2dN4sQ\n' +
  '6vB9kL0mP3rT5xZ8aE2yU7iO1pD4fG6hJ9kL3nM5qR8tW0xY2zA4c\n' +
  'B6dF8gH0jK2lN4pQ6rS8tU0vW2xY4zA6bC8dE0fG2hI4jK6lM8nO0\n' +
  'pQ2rS4tU6vW8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ8rS0tU2vW4xY\n' +
  '6zA8bC0dE2fG4hI6jK8lM0nO2pQ4rS6tU8vW0xY2zA4bC6dE8fG0h\n' +
  'IDAQAB'

export interface SnowflakeOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  /** Storybook-controllable state. Defaults to "idle". */
  state?: SnowflakeOnboardingState
  /** Which wizard step to open on (idle only). Defaults to 1. */
  initialStep?: 1 | 2
  /** The 6labs-generated public key to display. Defaults to a mock. */
  publicKey?: string
  /** Pre-filled connection details (useful for non-idle / reconnect stories). */
  details?: Partial<SnowflakeConnectionDetails>
  /** Reason string surfaced in the `failed` state. */
  errorReason?: string
  /** Drives the 4-stage loader. Required when `state` ∈ {progress, failed}. */
  progress?: ProgressDetail
  /** Summary content shown when `state="success"`. */
  summary?: SuccessSummary
  /** Called with the entered connection details when "Verify connection" is clicked. */
  onConnect?: (payload: SnowflakeConnectionDetails & { orgWideAccess: boolean; orgWideEdit: boolean }) => void
  /** Called when the user clicks "Done" after a successful connection. */
  onDone?: () => void
  /** Called when the user clicks "Try again" from the failed state. */
  onRetry?: () => void
}

export function SnowflakeOnboardingModal({
  isOpen,
  onClose,
  state = 'idle',
  initialStep = 1,
  publicKey = MOCK_PUBLIC_KEY,
  details,
  errorReason,
  progress,
  summary,
  onConnect,
  onDone,
  onRetry,
}: SnowflakeOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(initialStep)
  const [accountIdentifier, setAccountIdentifier] = useState(details?.accountIdentifier ?? '')
  const [username, setUsername] = useState(details?.username ?? 'SIXLABS_READONLY')
  const [warehouse, setWarehouse] = useState(details?.warehouse ?? '')
  const [database, setDatabase] = useState(details?.database ?? '')
  // Permission choice — on by default: teammates can edit descriptions.
  // Off restricts them to view-only access to this connection.
  const [orgWideEdit, setOrgWideEdit] = useState(true)

  useEffect(() => {
    if (details?.accountIdentifier !== undefined) setAccountIdentifier(details.accountIdentifier)
    if (details?.username !== undefined) setUsername(details.username)
    if (details?.warehouse !== undefined) setWarehouse(details.warehouse)
    if (details?.database !== undefined) setDatabase(details.database)
  }, [details?.accountIdentifier, details?.username, details?.warehouse, details?.database])

  useEffect(() => {
    setStep(initialStep)
  }, [initialStep])

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const acctValid = /^[a-z0-9][a-z0-9._-]+$/i.test(accountIdentifier.trim())
  // Database is no longer asked in the form — it's discovered from the grants
  // during verification (prototype: defaults downstream).
  const canVerify =
    accountIdentifier.trim().length > 0 &&
    acctValid &&
    username.trim().length > 0 &&
    warehouse.trim().length > 0

  const handleVerify = () => {
    if (!canVerify) return
    onConnect?.({
      accountIdentifier: accountIdentifier.trim(),
      username: username.trim(),
      warehouse: warehouse.trim(),
      database: database.trim(),
      orgWideAccess: true,
      orgWideEdit,
    })
  }

  const sqlRoleUser = `-- 1. Create a dedicated read-only role for 6labs.
CREATE ROLE SIXLABS_READONLY_ROLE;

-- 2. Let the role use the warehouse 6labs runs queries on.
GRANT USAGE ON WAREHOUSE ${warehouse || '<warehouse>'} TO ROLE SIXLABS_READONLY_ROLE;

-- 3. Grant read access on each database 6labs should see.
--    Run these three lines once PER DATABASE — repeat the block,
--    swapping <database> each time, for every database you connect.
GRANT USAGE ON DATABASE ${database || '<database>'} TO ROLE SIXLABS_READONLY_ROLE;
GRANT USAGE ON SCHEMA ${database || '<database>'}.<schema> TO ROLE SIXLABS_READONLY_ROLE;
GRANT SELECT ON ALL TABLES IN SCHEMA ${database || '<database>'}.<schema> TO ROLE SIXLABS_READONLY_ROLE;

-- 4. Create the user 6labs will connect as.
CREATE USER ${username || 'SIXLABS_READONLY'}
  DEFAULT_ROLE = SIXLABS_READONLY_ROLE
  DEFAULT_WAREHOUSE = ${warehouse || '<warehouse>'};
GRANT ROLE SIXLABS_READONLY_ROLE TO USER ${username || 'SIXLABS_READONLY'};`

  const sqlRegisterKey = `-- 5. Register 6labs' public key on the user (no password is exchanged).
ALTER USER ${username || 'SIXLABS_READONLY'}
  SET RSA_PUBLIC_KEY = '${publicKey.replace(/\n/g, '')}';`

  const sqlVerify = `-- 6. Confirm the key registered — RSA_PUBLIC_KEY should be populated.
DESC USER ${username || 'SIXLABS_READONLY'};`

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-m"
      role="dialog"
      aria-modal="true"
      aria-labelledby="snowflake-onboarding-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div className="relative flex flex-col gap-m bg-bg-elements rounded-m shadow-normal p-l w-[560px] max-h-[78vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-s w-full shrink-0">
          <div
            className="shrink-0 size-[40px] rounded-m overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-tint-light)' }}
          >
            <SnowflakeIcon size={40} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-xxs">
            <h2
              id="snowflake-onboarding-title"
              className="font-display text-m font-bold leading-[1.4]"
              style={{ color: 'var(--text-primary)' }}
            >
              Connect Snowflake
            </h2>
            <p
              className="font-body text-s leading-[1.5]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Key-pair authentication
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

        {/* Step progress (idle only) — a real numbered stepper so it reads as
            steps, with the "Step X of 2" label kept beside it. Separated from
            the body description by a divider. */}
        {state === 'idle' && (
          <div
            className="flex flex-col gap-s shrink-0 pb-m"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <StepIndicator step={step} total={2} />
            <h3
              className="font-display text-s font-semibold leading-[1.4]"
              style={{ color: 'var(--text-primary)' }}
            >
              {step === 1 ? 'Set up access in Snowflake' : 'Connection details'}
            </h3>
          </div>
        )}

        {/* Body — varies by state */}
        {state === 'success' ? (
          <SuccessBody summary={summary} database={summary?.database ?? database} onDone={onDone ?? onClose} />
        ) : state === 'progress' || state === 'failed' ? (
          <ProgressBody
            state={state}
            progress={progress ?? { step: 0 }}
            accountIdentifier={details?.accountIdentifier ?? accountIdentifier}
            errorMessageOverride={errorReason}
            onRetry={onRetry}
            onCancel={onClose}
          />
        ) : step === 1 ? (
          <Step1Setup
            sqlRoleUser={sqlRoleUser}
            sqlRegisterKey={sqlRegisterKey}
            sqlVerify={sqlVerify}
            onCancel={onClose}
            onNext={() => setStep(2)}
          />
        ) : (
          <Step2Details
            accountIdentifier={accountIdentifier}
            username={username}
            warehouse={warehouse}
            acctValid={accountIdentifier.trim().length === 0 || acctValid}
            canVerify={canVerify}
            onChange={{
              accountIdentifier: setAccountIdentifier,
              username: setUsername,
              warehouse: setWarehouse,
            }}
            orgWideEdit={orgWideEdit}
            onOrgWideEditChange={setOrgWideEdit}
            onBack={() => setStep(1)}
            onVerify={handleVerify}
          />
        )}
      </div>
    </div>,
    document.body,
  )
}

// ─── Step 1 — Set up access in Snowflake ─────────────────────────────────────

function Step1Setup({
  sqlRoleUser,
  sqlRegisterKey,
  sqlVerify,
  onCancel,
  onNext,
}: {
  sqlRoleUser: string
  sqlRegisterKey: string
  sqlVerify: string
  onCancel: () => void
  onNext: () => void
}) {
  // One script, top to bottom. Each section is already numbered + commented, so
  // we just stitch them with blank lines — no extra headers, no separate key
  // block (the public key is embedded in step 5 of the SQL itself).
  const setupSql = `${sqlRoleUser}

${sqlRegisterKey}

${sqlVerify}`

  return (
    <div className="flex flex-col gap-m w-full">
      {/* Intro — matches the production connectors dialog copy. */}
      <p className="font-body text-s leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>
        This sets up a dedicated, read-only user so 6labs can query the databases you
        choose, and no password is shared.{' '}
        <strong style={{ color: 'var(--text-primary)' }}>
          Run the SQL below as an account admin.
        </strong>{' '}
        <a
          href="https://docs.snowflake.com/en/user-guide/key-pair-auth"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline"
          style={{ color: 'var(--brand)' }}
        >
          How it works
        </a>
      </p>

      {/* One copyable block — key embedded, <placeholders> highlighted amber. */}
      <CodeBlock label="Setup SQL" code={setupSql} highlight maxHeight={320} />

      <p className="font-body text-xs leading-[1.5]" style={{ color: 'var(--text-tertiary)' }}>
        Replace the{' '}
        <mark
          className="rounded-xs px-xxs font-medium"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--warning) 22%, transparent)',
            color: 'var(--text-primary)',
          }}
        >
          highlighted
        </mark>{' '}
        values before running the script. More than one database? Re-run step 3 for each.
      </p>

      {/* SELECT-only security card */}
      <div
        className="flex items-start gap-s p-m rounded-m"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <span
          className="shrink-0 mt-[1px] inline-flex items-center justify-center w-[20px] h-[20px] rounded-full"
          style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
        >
          <CheckIcon size={12} />
        </span>
        <p className="font-body text-s leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Grant ‘SELECT-only’ access.</strong>{' '}
          6labs works in read-only mode and doesn’t require write access.
        </p>
      </div>

      <div className="flex gap-m w-full shrink-0">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={onNext}>
          Next: Connection details
        </Button>
      </div>
    </div>
  )
}

// ─── Step 2 — Connection details ─────────────────────────────────────────────

function Step2Details({
  accountIdentifier,
  username,
  warehouse,
  acctValid,
  canVerify,
  onChange,
  orgWideEdit,
  onOrgWideEditChange,
  onBack,
  onVerify,
}: {
  accountIdentifier: string
  username: string
  warehouse: string
  acctValid: boolean
  canVerify: boolean
  onChange: {
    accountIdentifier: (v: string) => void
    username: (v: string) => void
    warehouse: (v: string) => void
  }
  orgWideEdit: boolean
  onOrgWideEditChange: (v: boolean) => void
  onBack: () => void
  onVerify: () => void
}) {
  return (
    <div className="flex flex-col gap-m w-full">
      <p className="font-body text-s leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>
        Enter the details for the user you just created.
      </p>

      <Input
        label="Account identifier"
        placeholder="xy12345.us-east-1"
        value={accountIdentifier}
        onChange={(e) => onChange.accountIdentifier(e.target.value)}
        error={!acctValid}
        message={!acctValid ? 'Use your account locator and region, e.g. xy12345.us-east-1' : undefined}
      />
      {acctValid && (
        <a
          href="https://docs.snowflake.com/en/user-guide/admin-account-identifier"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-xs font-medium underline self-start -mt-xs"
          style={{ color: 'var(--brand)' }}
        >
          See how to find your account identifier
        </a>
      )}
      <Input
        label="Username"
        placeholder="SIXLABS_READONLY"
        value={username}
        onChange={(e) => onChange.username(e.target.value)}
      />
      <Input
        label="Warehouse"
        placeholder="ANALYTICS_WH"
        value={warehouse}
        onChange={(e) => onChange.warehouse(e.target.value)}
      />

      {/* Compact pre-connect notice — same style as the BigQuery modal's. */}
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
          Add <code>COMMENT</code>s to your tables and columns so Oracle can ground its
          answers.
        </span>
      </div>

      {/* Shared connection management — what sharing means (always-true
          baseline) plus the one thing the owner controls. */}
      <ConnectorSharingCard orgWideEdit={orgWideEdit} onOrgWideEditChange={onOrgWideEditChange} />

      <div className="flex gap-m w-full shrink-0">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={onVerify} disabled={!canVerify}>
          Verify connection
        </Button>
      </div>
    </div>
  )
}

// ─── Copyable code block ─────────────────────────────────────────────────────

// Highlights `<placeholder>` tokens (amber) so users see at a glance which
// values to replace before running the script. Copy still yields plain text —
// the highlighting is render-only.
const SQL_PLACEHOLDER = /(<[^>]+>)/g
function renderSqlWithHighlights(sql: string) {
  return sql.split(SQL_PLACEHOLDER).map((part, i) =>
    /^<[^>]+>$/.test(part) ? (
      <mark
        key={i}
        className="rounded-xs px-xxs font-medium"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--warning) 22%, transparent)',
          color: 'var(--text-primary)',
        }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function CodeBlock({
  label,
  sublabel,
  code,
  mono = false,
  highlight = false,
  maxHeight = 120,
}: {
  label: string
  sublabel?: string
  code: string
  mono?: boolean
  /** Render `<placeholder>` tokens with an amber highlight. */
  highlight?: boolean
  maxHeight?: number
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    let ok = false
    try {
      await navigator.clipboard.writeText(code)
      ok = true
    } catch {
      // Fallback for non-secure contexts / blocked clipboard API.
      try {
        const ta = document.createElement('textarea')
        ta.value = code
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        ok = document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {
        ok = false
      }
    }
    if (!ok) return
    setCopied(true)
    showToast(`${label} copied`)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="flex flex-col gap-xxs">
      <div className="flex items-center justify-between gap-m">
        <label className="font-body text-s font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-xxs font-body text-xs font-medium"
          style={{ color: copied ? 'var(--success)' : 'var(--brand)' }}
        >
          {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {sublabel && (
        <span className="font-body text-xs leading-[1.5]" style={{ color: 'var(--text-tertiary)' }}>
          {sublabel}
        </span>
      )}
      <pre
        className={`w-full min-w-0 overflow-y-auto overflow-x-auto p-m rounded-m font-mono text-xs leading-[1.6] ${
          mono ? 'whitespace-pre-wrap break-all' : 'whitespace-pre-wrap break-words'
        }`}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
          maxHeight,
        }}
      >
        {highlight ? renderSqlWithHighlights(code) : code}
      </pre>
    </div>
  )
}

// ─── Step indicator ──────────────────────────────────────────────────────────
// Numbered nodes connected by a line so it reads as steps (not a progress bar),
// with the "Step X of N" label kept right beside it.

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-xs shrink-0">
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1
        const state: 'done' | 'active' | 'upcoming' =
          n < step ? 'done' : n === step ? 'active' : 'upcoming'
        return (
          <Fragment key={n}>
            <StepNode n={n} state={state} />
            {i < total - 1 && (
              <span
                className="h-[2px] w-[20px] rounded-full"
                style={{ backgroundColor: n < step ? 'var(--brand)' : 'var(--border-default)' }}
                aria-hidden
              />
            )}
          </Fragment>
        )
      })}
      <span
        className="ml-xs font-display text-2xs font-semibold uppercase tracking-[0.12em]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Step {step} of {total}
      </span>
    </div>
  )
}

function StepNode({ n, state }: { n: number; state: 'done' | 'active' | 'upcoming' }) {
  const filled = state === 'active' || state === 'done'
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-display text-2xs font-bold shrink-0"
      style={{
        width: 20,
        height: 20,
        backgroundColor: filled ? 'var(--brand)' : 'var(--bg-tint-light)',
        color: filled ? 'var(--text-on-brand)' : 'var(--text-tertiary)',
        border: state === 'upcoming' ? '1px solid var(--border-default)' : 'none',
      }}
      aria-current={state === 'active' ? 'step' : undefined}
    >
      {state === 'done' ? <CheckGlyph /> : n}
    </span>
  )
}

// ─── Progress / success bodies (mirror BigQuery's loader) ────────────────────

function ProgressBody({
  state,
  progress,
  accountIdentifier,
  errorMessageOverride,
  onRetry,
  onCancel,
}: {
  state: 'progress' | 'failed'
  progress: ProgressDetail
  accountIdentifier: string
  errorMessageOverride?: string
  onRetry?: () => void
  onCancel: () => void
}) {
  const errorStep = state === 'failed' ? (progress.errorAtStep ?? progress.step) : undefined
  const errorMeta = errorStep != null ? STEP_ERROR_COPY[STEP_ORDER[errorStep]] : undefined
  const customErrorMessage = progress.errorMessage ?? errorMessageOverride

  return (
    <div className="flex flex-col gap-m w-full">
      <p className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Account · <code style={{ color: 'var(--text-secondary)' }}>{accountIdentifier || '—'}</code>
      </p>

      <ol className="flex flex-col">
        {STEP_ORDER.map((step, i) => {
          const status: StepRowStatus =
            errorStep === i
              ? 'error'
              : i < progress.step
                ? 'done'
                : i === progress.step
                  ? state === 'failed'
                    ? 'pending'
                    : 'active'
                  : 'pending'
          return <StepRow key={step} step={step} status={status} isLast={i === STEP_ORDER.length - 1} />
        })}
      </ol>

      {state !== 'failed' && progress.problemTableCount != null && (
        <div
          className="flex items-center gap-s p-m rounded-m"
          style={{
            backgroundColor: progress.problemTableCount > 0 ? 'var(--warning-bg)' : 'var(--bg-tint-light)',
            border: `1px solid ${progress.problemTableCount > 0 ? 'var(--warning)' : 'var(--border-tint)'}`,
          }}
        >
          <span
            className="font-body text-s leading-[1.5]"
            style={{ color: progress.problemTableCount > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}
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

      {state === 'failed' && errorMeta && (
        <div
          className="flex flex-col items-start gap-xs p-m rounded-m"
          style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)' }}
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
          {/* The step's doc link only applies to the generic step failure. When a
              specific cause replaces the copy (duplicate account, write access),
              the link is off-topic — suppress it. */}
          {!customErrorMessage && errorMeta.helpLinkHref && errorMeta.helpLinkLabel && (
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
  step: SnowflakeStep
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
            <span className="rounded-full" style={{ width: 6, height: 6, backgroundColor: palette.markerFg }} />
          )}
        </span>
        {!isLast && (
          <span
            style={{
              width: 2,
              flexGrow: 1,
              minHeight: 16,
              backgroundColor: status === 'done' ? 'var(--success)' : 'var(--border-subtle)',
              marginTop: 4,
              marginBottom: 4,
            }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-xxs pb-m">
        <span className="font-body text-s font-medium" style={{ color: palette.titleFg }}>
          {meta.title}
        </span>
        <span className="font-body text-xs leading-[1.5]" style={{ color: 'var(--text-tertiary)' }}>
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
  database,
  onDone,
}: {
  summary?: SuccessSummary
  database: string
  onDone: () => void
}) {
  const verdict = summary?.verdict ?? 'YELLOW'
  const verdictVariant: 'ready' | 'partial' = verdict === 'GREEN' ? 'ready' : 'partial'
  const tableCount = summary?.tableCount ?? 0

  return (
    <div className="flex flex-col gap-m w-full">
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
          backgroundColor: verdict === 'GREEN' ? 'var(--success-bg)' : 'var(--warning-bg)',
          border: `1px solid ${verdict === 'GREEN' ? 'var(--success)' : 'var(--warning)'}`,
        }}
      >
        <ConnectionStatusPill variant={verdictVariant} />
        <span className="font-body text-s flex flex-col gap-xxxs leading-[1.5]" style={{ color: 'var(--text-primary)' }}>
          <span>
            {tableCount === 0 ? (
              <>No tables were imported from <strong>{database || 'your database'}</strong>.</>
            ) : (
              <>
                Imported <strong>{tableCount}</strong> table{tableCount === 1 ? '' : 's'} from{' '}
                <strong>{database || 'your database'}</strong>.
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
        <Button variant="primary" size="lg" className="flex-1" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  )
}
