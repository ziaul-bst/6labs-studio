/**
 * SessionInstructionsCard — shows the instruction prompt an AI Player agent was
 * given for a recording / testing session. Rendered only for AI Player sessions,
 * in both the session side panel and the detail page.
 *
 * Section title (bot glyph + "Session Instructions") over a quoted prompt block
 * with a brand accent rail so it reads as a verbatim instruction, not prose.
 *
 * Code-first prototype — no Figma source yet.
 */

interface SessionInstructionsCardProps {
  instructions: string
  /** Persona the agent ran as, surfaced as a caption when present. */
  persona?: string
  className?: string
}

export function SessionInstructionsCard({ instructions, persona, className }: SessionInstructionsCardProps) {
  return (
    <div className={['flex flex-col gap-s', className].filter(Boolean).join(' ')}>
      {/* Section title — matches other section headers (16px display semibold) */}
      <div className="flex items-center gap-xs">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" style={{ color: 'var(--brand)' }}>
          <rect x="3" y="5.5" width="10" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 3.5V5.5M8 3.5a1 1 0 100-2 1 1 0 000 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="6" cy="9" r="0.9" fill="currentColor" />
          <circle cx="10" cy="9" r="0.9" fill="currentColor" />
          <path d="M1.5 8.5v2M14.5 8.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span className="font-display font-semibold whitespace-nowrap" style={{ fontSize: '16px', color: '#353D57', lineHeight: '1.5' }}>
          Session Instructions
        </span>
      </div>

      {/* Prompt block — brand accent rail + quiet fill.
          gap-xs, not gap-xxs: at 4px the label crowded the text while the 16px
          padding left far more room below it, so the block read top-heavy. */}
      <div
        className="flex flex-col gap-xs p-m rounded-xl"
        style={{
          backgroundColor: 'var(--bg-page)',
          border: '1px solid var(--bg-subtle)',
          borderLeft: '3px solid var(--brand)',
        }}
      >
        <span className="font-display text-2xs font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--text-tertiary)' }}>
          {persona ? `Given to AI Player · ${persona}` : 'Given to AI Player'}
        </span>
        <p className="font-body text-s leading-[1.6] whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
          {instructions}
        </p>
      </div>
    </div>
  )
}
