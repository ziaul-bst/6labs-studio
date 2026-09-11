/**
 * StatCard — Single gameplay statistic card with colored border and tinted bg.
 * Figma: rounded-[12px], colored border (success/error), tinted bg, icon + value + label centered.
 *
 * @figmaComponent  Stat Card
 * @figmaNode       6453:1472353
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6453-1472353
 */

interface StatCardProps {
  label: string
  value: string | number
  variant?: 'default' | 'success' | 'error'
  icon?: React.ReactNode
  className?: string
}

const VARIANT_STYLES = {
  default: {
    border: 'var(--border-subtle)',
    bg: 'var(--bg-page)',
    valueColor: 'var(--text-primary)',
  },
  success: {
    border: 'var(--success)',
    bg: 'rgba(22,163,74,0.07)',
    valueColor: 'var(--success)',
  },
  error: {
    border: 'var(--error)',
    bg: 'rgba(201,57,42,0.07)',
    valueColor: 'var(--error)',
  },
}

export function StatCard({ label, value, variant = 'default', icon, className }: StatCardProps) {
  const style = VARIANT_STYLES[variant]

  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-xxs p-s rounded-xl flex-1 min-w-0',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        border: `1px solid ${style.border}`,
        backgroundColor: style.bg,
      }}
    >
      {/* Icon */}
      {icon && <div style={{ color: style.valueColor }}>{icon}</div>}

      {/* Value — 20px Bricolage Medium.
          lineHeight 1.2, not 1.5: a 20px numeral in a 30px line box left ~5px of
          dead leading on each side, which pushed the tile's visible weight
          upward and made the space under the label read as a gap. */}
      <span
        className="font-display text-l font-medium whitespace-nowrap"
        style={{ color: style.valueColor, lineHeight: '1.2' }}
      >
        {value}
      </span>

      {/* Label — 10px Inter, tracking 0.2px. leading-none so the box hugs the
          text instead of adding another 5px below the baseline. */}
      <span
        className="font-body text-2xs text-text-tertiary text-center whitespace-nowrap"
        style={{ letterSpacing: '0.2px', lineHeight: 1 }}
      >
        {label}
      </span>
    </div>
  )
}
