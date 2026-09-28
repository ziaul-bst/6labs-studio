/**
 * Copy text to the clipboard, falling back to a hidden textarea where the
 * async Clipboard API is blocked (insecure origin, iframe without permission).
 * Resolves false when both fail, so the caller never claims "Copied" for a
 * copy that did not happen.
 *
 * Code-first prototype — no Figma source yet.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    /* Selecting the textarea moves focus into it, and removing it would drop
       focus to <body> — hand it back to whatever pressed Copy. Read-only so
       iOS does not raise the keyboard for a frame. */
    const prev = document.activeElement as HTMLElement | null
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.readOnly = true
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      prev?.focus({ preventScroll: true })
      return ok
    } catch {
      return false
    }
  }
}
