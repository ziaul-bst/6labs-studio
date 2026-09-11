/**
 * ConnectorErrorMessage — renders a connector onboarding failure message with
 * real visual hierarchy instead of one flat run-on block.
 *
 * The upstream error is a plain `string` (it travels through the onboarding
 * step-driver's `onError(step, message)` callback), so structure is expressed
 * in the copy and parsed here at render time:
 *
 *   "This project is already connected company-wide by Alex Chen.
 *    • New tables missing? Refresh the connection on the Connections page.
 *    • Want a new connection? Use a different service account."
 *
 *   → line 1 (no bullet)  = headline, semibold
 *   → "• " lines          = bulleted actions; the leading question is bolded
 *                           so the scenario reads first and the fix second
 *
 * Keeping the parse here means the drivers stay string-typed and no call site
 * has to thread ReactNode through the progress/summary state.
 */

const BULLET_PREFIX = /^[•\-*]\s*/

export function ConnectorErrorMessage({ text }: { text: string }) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const headlines = lines.filter((l) => !BULLET_PREFIX.test(l))
  const bullets = lines.filter((l) => BULLET_PREFIX.test(l)).map((l) => l.replace(BULLET_PREFIX, ''))

  return (
    <div className="flex flex-col gap-xs w-full min-w-0">
      {headlines.map((line, i) => (
        <span
          key={`h-${i}`}
          className="font-body text-s font-semibold leading-[1.5]"
          style={{ color: 'var(--text-primary)' }}
        >
          {line}
        </span>
      ))}

      {bullets.length > 0 && (
        <ul className="flex flex-col gap-xxs">
          {bullets.map((bullet, i) => {
            // Split "Scenario? Do this." into a bold lead-in + regular action.
            const q = bullet.indexOf('?')
            const lead = q === -1 ? null : bullet.slice(0, q + 1)
            const rest = q === -1 ? bullet : bullet.slice(q + 1).trim()
            return (
              <li key={`b-${i}`} className="flex gap-xs items-start">
                <span
                  aria-hidden
                  className="shrink-0"
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: 'var(--text-tertiary)',
                    marginTop: 8,
                  }}
                />
                <span
                  className="font-body text-s leading-[1.5] min-w-0"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {lead && (
                    <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {lead}{' '}
                    </strong>
                  )}
                  {rest}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
