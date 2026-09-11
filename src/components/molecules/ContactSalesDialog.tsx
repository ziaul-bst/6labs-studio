/**
 * ContactSalesDialog — what "Contact sales" resolves to on a locked test.
 *
 * Tests are enabled per workspace by our team, so there is no in-product
 * purchase to run. The honest resolution is therefore an address, not a
 * "request sent" confirmation: the dialog names the support mailbox, says what
 * to ask for, and gives two ways to act on it — copy the address, or open a
 * pre-filled draft.
 *
 * Composed on PopupModal (the DS popup) rather than a bespoke panel.
 *
 * Code-first prototype — no Figma source yet.
 */

import { PopupModal } from './PopupModal'
import { CopyIcon } from '../icons/CopyIcon'
import { showToast } from '../atoms/Toast'

export const SUPPORT_EMAIL = 'support@6labs.ai'

export interface ContactSalesDialogProps {
  isOpen: boolean
  onClose: () => void
  /** Test the studio is asking to unlock — names the ask in copy and in the draft. */
  testLabel: string
  /** Mailbox the request goes to. Default: support@6labs.ai */
  supportEmail?: string
  /** Workspace the test would be enabled on — included in the draft so we can act on it. */
  workspaceName?: string
}

export function ContactSalesDialog({
  isOpen,
  onClose,
  testLabel,
  supportEmail = SUPPORT_EMAIL,
  workspaceName,
}: ContactSalesDialogProps) {
  const subject = `Unlock ${testLabel}`
  const bodyLines = [
    `Hi 6labs team,`,
    ``,
    `Please enable ${testLabel} on ${workspaceName ? `our workspace (${workspaceName})` : 'our workspace'}.`,
    ``,
    `Thanks,`,
  ]
  const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`

  /* Same two-step copy as the connector modals: the Clipboard API, then a
     hidden textarea for non-secure contexts where it is blocked. */
  const handleCopy = async () => {
    let ok = false
    try {
      await navigator.clipboard.writeText(supportEmail)
      ok = true
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = supportEmail
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
    showToast(ok ? 'Support email copied' : 'Copy failed — select the address to copy it')
  }

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Unlock ${testLabel}`}
      body={`Tests are added per workspace by our team. Send us a mail asking for ${testLabel} and we'll enable it on this workspace.`}
      size="lg"
      secondaryLabel="Close"
      primaryLabel="Open mail draft"
      onCancel={onClose}
      onConfirm={() => {
        window.location.href = mailto
        onClose()
      }}
    >
      <div
        className="flex items-center gap-s rounded-m px-m py-s w-full"
        style={{ backgroundColor: 'var(--bg-page-pale)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex flex-col gap-xxxs flex-1 min-w-0">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">
            Mail us at
          </span>
          <a
            href={mailto}
            className="font-body text-s font-semibold text-text-primary leading-[1.5] truncate hover:underline"
          >
            {supportEmail}
          </a>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${supportEmail}`}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-s text-text-secondary hover:text-text-primary transition-colors"
          style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-default)' }}
        >
          <CopyIcon size={16} />
        </button>
      </div>
    </PopupModal>
  )
}
