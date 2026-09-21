/**
 * TestingSetupPieces — the building blocks every "set up a run" screen shares.
 *
 *  - SetupZone   a dashed drop / pick target that turns into a filled card once
 *                it has something (recordings, a test-case file). Both states
 *                are the same box, so the layout never jumps when it fills.
 *  - SetupCard   a white card holding the naming and options fields, with an
 *                optional ruled footer for the primary action.
 *  - FieldLabel  small-caps label with an optional "optional" tag.
 *  - SetupNote   the closing note under a composer: what the run produces and
 *                that it happens in the background. Deliberately quiet — a
 *                tinted "callout" here competes with the primary action a few
 *                pixels above it, and this is orientation, not a warning.
 *  - SetupFooter the ruled row inside the last card holding the primary action
 *                and, on the left, what still has to happen before it enables.
 *                It lives inside the card, never loose on the page: a rule
 *                spanning the page ground with a button under it read as a
 *                stray element, not as the form's submit.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { CSSProperties, ReactNode } from 'react'
import { TESTING_ACCENT_VARS, type TestingAccent } from '../../lib/studioAreas'
import { Spinner } from '../atoms/Spinner'
import { FileDocIcon } from '../icons/FileDocIcon'
import { InfoFilledIcon } from '../icons/InfoFilledIcon'
import type { TestCaseFile } from '../../lib/types/testing'

// ── SetupZone ─────────────────────────────────────────────────────────────────

export interface SetupZoneProps {
  /** Filled: the zone holds something and renders `children` in place of the prompt. */
  filled: boolean
  icon: ReactNode
  title: string
  description: string
  /** Mono format hint under the description — "CSV · XLSX". */
  formats?: string
  required?: boolean
  /**
   * What the zone holds, as a caption over its filled state — "Build", "Test
   * cases", "Recordings".
   *
   * The empty zone says what it is in 16px bold in the middle of the box; the
   * filled one replaced all of that with its contents, so two filled zones side
   * by side were "v2.3.1" next to "1 file · 48 cases" with nothing naming
   * either. A noun, not the prompt: "Add your test cases" over a card that
   * already has them reads as a step still outstanding.
   */
  filledTitle?: string
  accent?: TestingAccent
  onClick?: () => void
  /**
   * A note at the foot of the zone, inside it — what the uploaded file has to
   * contain, and a link to an example of it.
   *
   * Inside, because it is a rule about this upload; under the zone it read as
   * a footnote to the page. At the foot rather than the head, because the zone
   * has to say what it is before it says what the file needs — above the icon
   * it was the first thing read in a box whose own title had not been reached.
   *
   * Passing one changes the empty zone from a single button into a container
   * holding a button and the note — a link nested inside a button is neither
   * valid nor clickable. See SetupZone.
   */
  note?: ReactNode
  children?: ReactNode
  className?: string
}

export function SetupZone({
  filled,
  icon,
  title,
  description,
  formats,
  required,
  filledTitle,
  accent = 'brand',
  onClick,
  note,
  children,
  className,
}: SetupZoneProps) {
  const vars = TESTING_ACCENT_VARS[accent]
  if (filled) {
    return (
      <div
        className={['flex flex-col gap-s rounded-3xl px-l py-l min-h-[200px]', className].filter(Boolean).join(' ')}
        style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
      >
        {filledTitle && (
          /* Tertiary, not the secondary FieldLabel ink: this names the card it
             sits on rather than labelling a control, and at full strength it
             competed with the file name directly under it. */
          <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]">
            {filledTitle}
          </span>
        )}
        {children}
        {note}
      </div>
    )
  }
  /* With a note the zone is a container holding a button and the note, rather
     than being the button itself — a link inside a button is neither valid nor
     clickable, and the note has to sit inside the dashed box to read as a rule
     about this upload rather than as a footnote to the page. Everything above
     the note is still one target, so the zone loses nothing a reader used. */
  const prompt = (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex flex-col items-center justify-center gap-xs flex-1 px-l text-center',
        note ? 'pt-xl pb-m' : 'py-xl',
        note ? undefined : 'testing-zone rounded-3xl min-h-[200px]',
      ]
        .filter(Boolean)
        .join(' ')}
      data-filled={note ? undefined : 'false'}
      style={
        note
          ? undefined
          : ({
              border: '2px dashed var(--border-default)',
              backgroundColor: 'var(--bg-elements)',
              '--zone-accent': vars.ink,
            } as CSSProperties)
      }
    >
      <span
        className="flex items-center justify-center w-[44px] h-[44px] rounded-xl mb-xxs"
        style={{ backgroundColor: vars.bg, color: vars.ink }}
        aria-hidden
      >
        {icon}
      </span>
      <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">{title}</span>
      <span className="font-body text-s text-text-secondary leading-[1.55] max-w-[36ch]">{description}</span>
      {formats && (
        <span className="font-code text-xs tracking-[0.12em] text-text-tertiary pt-xxs">{formats}</span>
      )}
      {required && (
        <span className="font-display text-2xs font-semibold tracking-[0.1em] text-text-tertiary pt-xxs">REQUIRED</span>
      )}
    </button>
  )
  if (!note) return className ? <div className={className}>{prompt}</div> : prompt
  return (
    <div
      data-filled="false"
      className={['testing-zone flex flex-col rounded-3xl min-h-[200px]', className].filter(Boolean).join(' ')}
      style={
        {
          border: '2px dashed var(--border-default)',
          backgroundColor: 'var(--bg-elements)',
          '--zone-accent': vars.ink,
        } as CSSProperties
      }
    >
      {prompt}
      <div className="px-m pb-m">{note}</div>
    </div>
  )
}

/** The way back to the example sheet — on its own, once a file is attached. */
export function SampleSheetLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-body text-s font-semibold text-text-brand hover:underline whitespace-nowrap"
    >
      {label}
    </a>
  )
}

/**
 * What a case sheet has to contain, and a sheet in that shape to copy — the
 * banner an empty zone carries at its foot.
 *
 * The three columns are not a preference: 6labs verifies a case by comparing an
 * expected result against footage taken from the state a precondition names, so
 * a sheet without them produces a run that can only report Not verified. That
 * is a thing to say before the upload, not in the report — and the example is
 * what makes it actionable, because "include steps" and "include steps in a
 * shape we can parse" are different instructions (2026-09-16 dev call).
 *
 * Once a file is attached the rule is behind the reader, and reprinting it over
 * a file that already satisfies it reads as a warning about that file. What
 * survives is SampleSheetLink, in the zone's own footer row.
 */
export function CaseSheetNote({
  required,
  href,
  label,
}: {
  required: string[]
  href: string
  label: string
}) {
  return (
    /* The same banner SetupNote is — icon, pale fill, subtle rule — so a
       tinted box inside a composer means the same thing wherever it appears.
       It sits on the zone's own white, which is what makes it read as a panel
       inside the box rather than as more of the box's copy. */
    <div
      className="flex items-start gap-s w-full px-s py-xs rounded-l"
      style={{ backgroundColor: 'var(--bg-page-pale)', border: '1px solid var(--border-subtle)' }}
    >
      <span className="shrink-0 mt-[2px] text-text-tertiary" aria-hidden>
        <InfoFilledIcon size={16} />
      </span>
      <p className="font-body text-xs text-text-tertiary leading-[1.6] min-w-0 m-0 text-left">
        Each case needs{' '}
        <span className="font-medium text-text-secondary">{required.join(', ')}</span> — without
        them 6labs can only mark the case not verified.{' '}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-text-brand hover:underline whitespace-nowrap"
        >
          {label}
        </a>
      </p>
    </div>
  )
}

/** Header row inside a filled zone: check tile, name, remove. */
export function ZoneFilledHeader({
  icon,
  title,
  onRemove,
}: {
  icon: ReactNode
  title: string
  onRemove?: () => void
}) {
  return (
    <div className="flex items-center gap-s w-full">
      <span
        className="flex items-center justify-center shrink-0 w-[40px] h-[40px] rounded-l"
        style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0 font-display text-m font-semibold text-text-primary leading-[1.4] truncate">
        {title}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="shrink-0 w-6 h-6 rounded-round text-text-tertiary testing-ink-hover font-display text-l leading-none"
        >
          ×
        </button>
      )}
    </div>
  )
}

/** Ruled footer line inside a filled zone, for its secondary links. */
export function ZoneFooter({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-center gap-m mt-auto pt-s font-body text-s text-text-secondary"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      {children}
    </div>
  )
}

// ── ZoneFileList ──────────────────────────────────────────────────────────────

/**
 * The attached test-case files inside a filled zone. One compact row per file
 * (tile · name · remove), a count of files above, and past three files the list
 * scrolls inside a fixed height so the zone never grows taller than its
 * neighbour. "Add another file" stays pinned below the list, with `trailing`
 * opposite it — one ruled row at the foot of the zone rather than two stacked
 * links, which read as a short list of actions where they are two unrelated
 * ones.
 *
 * No case totals, on the summary line or on the row. 6labs does not know how
 * many cases a sheet holds until it has parsed it, so "48 cases" beside a file
 * the second it was attached was a number invented at upload time — and it
 * survived into the report, where it set the denominator every coverage
 * figure is read against. The count belongs to the run that read the file.
 *
 * A file still arriving gets an `uploading` row: the same row, greyed, with a
 * spinner where the document tile goes and no remove control, because there is
 * nothing finished to remove yet.
 */
export function ZoneFileList({
  files,
  onRemove,
  onAdd,
  addLabel = 'Add another file',
  limit,
  limitReason,
  trailing,
}: {
  files: TestCaseFile[]
  onRemove: (file: TestCaseFile) => void
  onAdd?: () => void
  addLabel?: string
  /** Most files one run may carry. At the cap the add link is replaced by its reason. */
  limit?: number
  /**
   * Why the cap exists. A control that simply stops working is read as a bug,
   * and a reader has no way to guess that the limit is per run rather than
   * per account.
   */
  limitReason?: string
  /** Right-hand end of the footer row — a link about the files, not about this list. */
  trailing?: ReactNode
}) {
  const atLimit = limit !== undefined && files.length >= limit
  return (
    <div className="flex flex-col gap-xs w-full min-h-0 flex-1">
      <div className="flex items-baseline gap-xs">
        <span className="font-display text-m font-semibold text-text-primary leading-[1.4]">
          {files.length} file{files.length === 1 ? '' : 's'}
        </span>
        {limit !== undefined && (
          <span className="font-body text-s text-text-tertiary leading-[1.5]">of {limit}</span>
        )}
      </div>
      <ul
        className="flex flex-col list-none m-0 p-0 rounded-xl overflow-y-auto"
        style={{ border: '1px solid var(--border-subtle)', maxHeight: 3 * 48 + 2 }}
      >
        {files.map((f, i) => {
          const uploading = f.status === 'uploading'
          return (
            <li
              key={f.name}
              className="flex items-center gap-s h-[48px] px-s shrink-0"
              style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}
            >
              {/* A document, not a tick. The tick said "attached", which the
                  row's own presence already says — and the build zone's header
                  carries a tick, so the two uploads wore one glyph. A file
                  still arriving is not attached yet, so it wears the wait. */}
              <span
                className="flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-m"
                style={
                  uploading
                    ? { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }
                    : { backgroundColor: 'var(--success-bg)', color: 'var(--success)' }
                }
                aria-hidden
              >
                {uploading ? <Spinner size={16} tone="current" /> : <FileDocIcon size={16} />}
              </span>
              <span className="flex flex-1 items-baseline gap-xs min-w-0">
                {/* The name gives way last — both halves were equally
                    shrinkable, so a long meta ate the file name the row exists
                    to say. It still caps at 60%. */}
                <span
                  className="font-display text-s font-semibold leading-[1.45] shrink-0 max-w-[60%] truncate"
                  style={{ color: uploading ? 'var(--text-secondary)' : 'var(--text-primary)' }}
                >
                  {f.name}
                </span>
                <span className="font-body text-xs text-text-tertiary leading-[1.5] min-w-0 truncate">
                  {uploading ? 'Uploading…' : f.meta}
                </span>
              </span>
              {/* Nothing to remove until it has arrived: a remove control on a
                  row still transferring offers to undo a thing that has not
                  happened yet. */}
              {!uploading && (
                <button
                  type="button"
                  onClick={() => onRemove(f)}
                  aria-label={`Remove ${f.name}`}
                  className="shrink-0 w-6 h-6 rounded-round text-text-tertiary testing-ink-hover font-display text-m leading-none"
                >
                  ×
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {(onAdd || trailing) && (
        <ZoneFooter>
          {onAdd &&
            (atLimit ? (
              /* The reason takes the link's place rather than sitting under a
                 greyed one: at the cap there is nothing to press, and a dead
                 control plus an explanation is two things where one will do. */
              <span className="font-body text-xs text-text-tertiary leading-[1.5]">
                {limitReason ?? `Up to ${limit} files per run.`}
              </span>
            ) : (
              <button type="button" onClick={onAdd} className="font-semibold text-text-brand hover:underline">
                + {addLabel}
              </button>
            ))}
          <span className="flex-1" />
          {trailing}
        </ZoneFooter>
      )}
    </div>
  )
}

// ── SetupCard / FieldLabel / SetupFooter ──────────────────────────────────────

export function SetupCard({
  title,
  hint,
  children,
  footer,
  className,
}: {
  /**
   * Optional. The naming card on the functional composers carries no heading
   * any more: "Name this run" sat directly above a field already labelled RUN
   * NAME, and its hint explained why naming things is useful — two lines of
   * chrome for one optional text input.
   */
  title?: string
  hint?: string
  children: ReactNode
  /** A SetupFooter — the card that carries the primary action is the last one on the screen. */
  footer?: ReactNode
  className?: string
}) {
  return (
    <div
      className={['flex flex-col gap-m rounded-3xl px-xl py-l w-full', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
    >
      {(title || hint) && (
        <div className="flex flex-col gap-xxxs">
          {title && (
            <h3 className="font-display text-m font-semibold text-text-primary leading-[1.4]">{title}</h3>
          )}
          {hint && <p className="font-body text-s text-text-secondary leading-[1.55]">{hint}</p>}
        </div>
      )}
      {children}
      {footer}
    </div>
  )
}

export function FieldLabel({ children, optional }: { children: ReactNode; optional?: boolean }) {
  return (
    <span className="flex items-center gap-xs font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary leading-[1.5]">
      {children}
      {optional && (
        <span className="font-body text-xs font-medium normal-case tracking-normal text-text-tertiary">optional</span>
      )}
    </span>
  )
}

export function SetupFooter({
  hint,
  children,
}: {
  /**
   * What the action is waiting on, or what it will run — "Add the test cases
   * to run", "8 videos · 1 file". Sits left of the button so a disabled
   * button is never a mystery.
   */
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div
      className="flex items-center justify-between gap-m w-full pt-m mt-xs"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      <span className="font-body text-s text-text-tertiary leading-[1.5] min-w-0 truncate">{hint}</span>
      <span className="flex items-center gap-s shrink-0">{children}</span>
    </div>
  )
}

/**
 * Closing note under a run composer. Subtle by design: the page ground shows
 * through instead of a tint, the border is the faintest one available, and the
 * icon sits at tertiary weight. It reads as an aside, which is what it is.
 */
export function SetupNote({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-start gap-s w-full px-m py-s rounded-xl"
      style={{
        backgroundColor: 'var(--bg-page-pale)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <span className="shrink-0 mt-[2px] text-text-tertiary" aria-hidden>
        <InfoFilledIcon size={16} />
      </span>
      <p className="font-body text-s text-text-tertiary leading-[1.6] min-w-0">{children}</p>
    </div>
  )
}

/** Multi-line free text with a placeholder — instructions to the agent. */
export function InstructionsField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  ariaLabel: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      rows={2}
      className="w-full resize-y rounded-l px-m py-s font-body text-s text-text-primary placeholder:text-text-placeholder leading-[1.55] outline-none testing-focus-ring"
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-default)', minHeight: 48 }}
    />
  )
}
