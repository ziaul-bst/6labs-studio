/**
 * LinkButton — a Button that is really a link. Same Apparatus variants, sizes
 * and icon slots as `Button`, rendered as an `<a>`, for the actions whose job
 * is to go somewhere: a file download, external docs.
 *
 * A `<button>` with an `onClick` that sets `window.location` would look the
 * same and lose everything a link gives for free — the URL in the status bar,
 * open-in-new-tab, copy link address, and the browser's own download handling.
 *
 * External targets should pass `target="_blank" rel="noopener noreferrer"`:
 * the studio is a hash-routed SPA, and a same-tab navigation throws away the
 * screen the reader was on.
 *
 * Styling comes from `buttonClassName`, so hover/focus follow `.btn` exactly.
 * Code-first prototype — no Figma source beyond the Apparatus Button it wraps.
 */
import { type AnchorHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { buttonClassName, type ButtonSize, type ButtonVariant } from './Button'

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
  pill?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { variant = 'primary', size = 'md', pill = false, leftIcon, rightIcon, children, className = '', ...props },
  ref,
) {
  return (
    <a ref={ref} className={buttonClassName({ variant, size, pill, className })} {...props}>
      {leftIcon != null && (
        <span className="btn-icon-slot" aria-hidden="true">{leftIcon}</span>
      )}
      {children}
      {rightIcon != null && (
        <span className="btn-icon-slot" aria-hidden="true">{rightIcon}</span>
      )}
    </a>
  )
})

export default LinkButton
