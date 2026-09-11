/**
 * RunHistoryEmptyState — what a test's History tab shows before anything has
 * run: an illustration, one line of what will land here, and the way to make
 * that happen.
 *
 * The illustration is in the family of VideosEmptyState (the Figma fallback
 * illustration): the same ink outlines, brand-blue accents and grey card
 * fills, at a size that fits inside a list card rather than a whole page. It
 * shows a report page arriving from a footage clip, with a question bubble
 * behind it, so both kinds of history row are foreshadowed. Colours are the
 * Apparatus tokens, so it holds up in dark mode.
 *
 * Code-first prototype — the illustration should be added to the Apparatus
 * library and re-exported from there once a Figma source exists.
 */
import Button from '../ui/Button'

export interface RunHistoryEmptyAction {
  label: string
  onClick: () => void
}

export interface RunHistoryEmptyStateProps {
  /** One short line — what has not happened yet. */
  title?: string
  /** What will land here once it does. */
  message?: string
  /** The single way out of the state — usually "New run". */
  action?: RunHistoryEmptyAction
  className?: string
}

export function RunHistoryEmptyState({
  title = 'Nothing has run yet',
  message = 'Reports land here as soon as a run finishes.',
  action,
  className,
}: RunHistoryEmptyStateProps) {
  return (
    <div
      className={['flex flex-col items-center justify-center gap-l w-full px-xl pt-xxl pb-xxl', className]
        .filter(Boolean)
        .join(' ')}
    >
      <EmptyHistoryIllustration />
      <div className="flex flex-col items-center gap-xs max-w-[400px] text-center">
        <p className="font-display text-m font-semibold leading-[1.4] text-text-primary">{title}</p>
        <p className="font-body text-s text-text-secondary leading-[1.6]">{message}</p>
      </div>
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * 240 × 150. A footage clip (left) feeds a report page (centre) with a
 * question bubble tucked behind it; the dotted path between them is the run.
 */
function EmptyHistoryIllustration() {
  const ink = 'var(--text-primary)'
  const brand = 'var(--brand)'
  const grey = 'var(--bg-subtle)'
  const paper = 'var(--bg-elements)'
  const soft = 'var(--text-tertiary)'
  return (
    <svg width="240" height="150" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Ground shadow */}
      <ellipse cx="128" cy="140" rx="72" ry="5" fill={grey} />

      {/* Question bubble, behind the report */}
      <g transform="translate(140 26)">
        <path
          d="M8 0h44a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H22l-10 9v-9H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8z"
          fill={paper}
          stroke={ink}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M24 15a6 6 0 1 1 8.2 5.6c-1.6.7-2.2 1.7-2.2 3.2v.6" stroke={soft} strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="30" cy="29.5" r="1.3" fill={soft} />
      </g>

      {/* Report page */}
      <g transform="translate(92 34)">
        <path d="M0 6a6 6 0 0 1 6-6h40l20 20v72a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6z" fill={paper} stroke={ink} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M46 0v14a6 6 0 0 0 6 6h14" fill={grey} stroke={ink} strokeWidth="1.7" strokeLinejoin="round" />
        {/* Title line and body lines */}
        <rect x="12" y="30" width="30" height="5" rx="2.5" fill={ink} />
        <rect x="12" y="43" width="42" height="4" rx="2" fill={grey} />
        <rect x="12" y="53" width="36" height="4" rx="2" fill={grey} />
        <rect x="12" y="63" width="42" height="4" rx="2" fill={grey} />
        {/* Result pill */}
        <rect x="12" y="76" width="26" height="10" rx="5" fill={brand} fillOpacity="0.14" />
        <rect x="17" y="80" width="16" height="2" rx="1" fill={brand} />
      </g>

      {/* Footage clip, left */}
      <g transform="translate(22 66)">
        <rect x="0.85" y="0.85" width="46" height="34" rx="6" fill={paper} stroke={ink} strokeWidth="1.7" />
        <rect x="6" y="6" width="36" height="24" rx="3" fill={grey} />
        <path d="M20 12l10 6-10 6z" fill={brand} />
      </g>

      {/* The run: a dotted path from the clip into the page */}
      <path d="M72 83c8 0 12 3 20 3" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeDasharray="1.5 4" />

      {/* Accents */}
      <path d="M48 26l2.4 5 5 2.4-5 2.4-2.4 5-2.4-5-5-2.4 5-2.4z" fill={brand} />
      <path d="M212 96l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6z" fill={brand} />
      <circle cx="196" cy="128" r="4" stroke={soft} strokeWidth="1.5" />
      <circle cx="36" cy="120" r="3" stroke={soft} strokeWidth="1.5" />
    </svg>
  )
}
