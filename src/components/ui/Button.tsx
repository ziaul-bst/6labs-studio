/**
 * Button — Apparatus-spec interactive button. Supports all 10 Type variants,
 * 4 sizes, pill/icon-only shapes, and left/right icon slots.
 *
 * @figmaComponent  Button
 * @figmaPath       ↳ 💠 Buttons / Buttons / Button
 * @figmaNode       12943:1310
 * @figmaFile       Nt21OzTRlJKgvSLMoSxTyT
 * @figmaUrl        https://www.figma.com/design/Nt21OzTRlJKgvSLMoSxTyT/Apparatus?node-id=12943-1310
 */
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'

// ─── Types matching Apparatus Button component props ───────────────────────
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'outline-complementary'
  | 'danger'
  | 'blueish'
  | 'translucent'
  | 'transparent'
  | 'link'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

// Matches Apparatus "Style" property on Button Attributes
export type ButtonShape = 'rounded' | 'pill'
export type ButtonIconStyle = 'square' | 'round'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Apparatus Type property — controls color/fill treatment */
  variant?: ButtonVariant
  /** Apparatus Size property (sm=24px, md=32px, lg=44px, xl=56px height) */
  size?: ButtonSize
  /** Apparatus Style: pill overrides corner radius to 9999px */
  pill?: boolean
  /** Icon-only button — hides label, renders as square or round icon button */
  iconOnly?: boolean
  /** When iconOnly: round applies pill radius */
  iconRound?: boolean
  /** Left icon slot (Apparatus L Icon) */
  leftIcon?: ReactNode
  /** Right icon slot (Apparatus R Icon) */
  rightIcon?: ReactNode
  children?: ReactNode
}

/**
 * The class string for a Button's look. Exported so `LinkButton` — an anchor
 * that has to navigate or download — wears exactly the same variant and size
 * rules rather than a second copy of them.
 */
export function buttonClassName({
  variant = 'primary',
  size = 'md',
  pill = false,
  iconOnly = false,
  iconRound = false,
  className = '',
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  pill?: boolean
  iconOnly?: boolean
  iconRound?: boolean
  className?: string
}): string {
  return [
    'btn',
    `btn-${variant}`,
    iconOnly
      ? [`btn-icon`, `btn-icon-${size}`, iconRound ? 'btn-icon-round' : ''].filter(Boolean).join(' ')
      : [`btn-${size}`, pill ? 'btn-pill' : ''].filter(Boolean).join(' '),
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    pill = false,
    iconOnly = false,
    iconRound = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    ...props
  },
  ref
) {
  const classes = buttonClassName({ variant, size, pill, iconOnly, iconRound, className })

  return (
    <button ref={ref} className={classes} {...props}>
      {!iconOnly && leftIcon != null && (
        <span className="btn-icon-slot" aria-hidden="true">{leftIcon}</span>
      )}
      {!iconOnly && children}
      {!iconOnly && rightIcon != null && (
        <span className="btn-icon-slot" aria-hidden="true">{rightIcon}</span>
      )}
      {iconOnly && children}
    </button>
  )
})

export default Button
