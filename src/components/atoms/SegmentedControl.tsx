/**
 * SegmentedControl — one choice from a short, fixed set, shown in full.
 *
 * The alternative it replaces is a row of filled buttons, and that alternative
 * is wrong twice over: a primary-filled segment reads as *the recommended
 * action* rather than *the current state*, and it competes with whatever the
 * real primary action on the screen is. So the track stays neutral and the
 * selected segment is raised rather than coloured — state, not emphasis.
 *
 * Use it for two to five options. Above five, the set stops being scannable at
 * a glance and a dropdown is the honest component.
 *
 * Code-first prototype — no Figma source yet.
 */

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
  /** Count shown after the label — for filters where the size matters. */
  count?: number
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Announced to screen readers — the question the segments answer. */
  ariaLabel: string
  /** `lg` is a 40px track — the height of an Input lg and a FilterPill, for toolbar rows. */
  size?: 'sm' | 'md' | 'lg'
  /**
   * `default` sits on white — the page grey is enough of a track there.
   * `contrast` is for a pale filter bar, where the page grey disappears into
   * the ground and the control stops looking like a control: the track steps
   * one shade darker and takes a rule.
   */
  tone?: 'default' | 'contrast'
  disabled?: boolean
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  tone = 'default',
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  /* The size prop drives type as well as padding — a control that is roomier
     but lettered the same reads as padding gone wrong. Both steps sit at or
     above body copy: at 12px the labels fell below the text they filter, which
     made the control read as chrome rather than as a control. */
  const pad = size === 'sm' ? 'px-s py-xxs' : size === 'lg' ? 'px-m h-[34px]' : 'px-m py-xs'
  const type = size === 'md' ? 'text-m' : 'text-s'

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={['inline-flex items-center gap-xxxs rounded-xl p-xxxs', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        /* The page grey, not --bg-subtle: on a white card the darker track read
           as a filled component of its own and pulled focus off the rows. */
        backgroundColor: tone === 'contrast' ? 'var(--bg-subtle)' : 'var(--bg-page)',
        border: tone === 'contrast' ? '1px solid var(--border-subtle)' : undefined,
        opacity: disabled ? 0.5 : undefined,
        pointerEvents: disabled ? 'none' : undefined,
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={[
              'segmented-option inline-flex items-center gap-xxs rounded-l whitespace-nowrap',
              'font-display font-semibold leading-[1.5]',
              type,
              pad,
            ].join(' ')}
            style={{
              backgroundColor: selected ? 'var(--bg-elements)' : 'transparent',
              color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: selected ? 'var(--shadow-sm)' : undefined,
            }}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className="font-body font-normal"
                style={{ color: selected ? 'var(--text-tertiary)' : 'var(--text-placeholder)' }}
              >
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
