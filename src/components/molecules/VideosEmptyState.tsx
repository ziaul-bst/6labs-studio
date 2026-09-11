/**
 * VideosEmptyState — Fallback state when no sessions match the current filter.
 * Shows an illustration and a message prompting the user to adjust their search.
 *
 * @figmaComponent  Videos Container (Type=Fallback)
 * @figmaNode       2737:30105
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=2737-30105
 */
import type { ReactNode } from 'react'

interface VideosEmptyStateProps {
  /** Headline above the message — what happened, in one line. */
  title?: string
  message?: string
  /** The way out of the state: a button that relaxes whatever caused it. */
  action?: ReactNode
  className?: string
}

export function VideosEmptyState({
  title,
  message = 'Look like Radiologist was not able to find the sessions you were looking for. Try using a different prompt to see results.',
  action,
  className,
}: VideosEmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col gap-[10px] items-center justify-center w-full min-h-[439px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-col gap-xxl items-center justify-center p-xxxl rounded-2xl w-full max-w-[620px]">
        {/* Illustration */}
        <div className="relative w-[447px] h-[245px] shrink-0">
          <svg
            width="447"
            height="245"
            viewBox="0 0 447 245"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Laptop base */}
            <rect x="137" y="98" width="175" height="105" rx="6" fill="#E6E7EA" stroke="#1C2542" strokeWidth="1.7" />
            <rect x="145" y="105" width="157" height="91" rx="3" fill="white" />

            {/* Grid cells on screen */}
            <rect x="148" y="108" width="36" height="22" rx="2" fill="#E6E7EA" />
            <rect x="188" y="108" width="36" height="22" rx="2" fill="#E6E7EA" />
            <rect x="228" y="108" width="36" height="22" rx="2" fill="#E6E7EA" />
            <rect x="148" y="134" width="36" height="22" rx="2" fill="#E6E7EA" />
            <rect x="188" y="134" width="36" height="22" rx="2" fill="#E6E7EA" />
            <rect x="228" y="134" width="36" height="22" rx="2" fill="#E6E7EA" />
            <rect x="148" y="160" width="36" height="22" rx="2" fill="#E6E7EA" />
            <rect x="188" y="160" width="36" height="22" rx="2" fill="#E6E7EA" />
            <rect x="228" y="160" width="36" height="22" rx="2" fill="#E6E7EA" />

            {/* Sidebar dots on screen */}
            <rect x="270" y="108" width="26" height="8" rx="2" fill="#E6E7EA" />
            <rect x="270" y="120" width="26" height="8" rx="2" fill="#E6E7EA" />
            <circle cx="274" cy="136" r="4" fill="#B3B6C0" />
            <circle cx="284" cy="136" r="4" fill="#E6E7EA" />
            <circle cx="274" cy="148" r="4" fill="#E6E7EA" />
            <circle cx="284" cy="148" r="4" fill="#B3B6C0" />

            {/* Laptop stand */}
            <path d="M136 196h175c0 6-8 11-18 11H154c-10 0-18-5-18-11z" fill="#1C2542" />

            {/* Play button card (top) */}
            <rect x="175" y="42" width="97" height="71" rx="8" fill="white" stroke="#E6E7EA" strokeWidth="1" />
            <path d="M215 68l16 10-16 10V68z" fill="#1770EF" />

            {/* Magnifying glass */}
            <circle cx="280" cy="120" r="32" stroke="#1C2542" strokeWidth="3" fill="none" />
            <line x1="303" y1="143" x2="325" y2="165" stroke="#1C2542" strokeWidth="4" strokeLinecap="round" />
            <text x="272" y="128" fontSize="28" fontWeight="bold" fill="#1C2542" textAnchor="middle">?</text>

            {/* Small play buttons scattered */}
            <g transform="translate(59, 144)">
              <rect width="35" height="26" rx="4" fill="white" stroke="#E6E7EA" />
              <path d="M14 9l8 4-8 4V9z" fill="#1770EF" />
            </g>
            <g transform="translate(360, 72)">
              <rect width="35" height="26" rx="4" fill="white" stroke="#E6E7EA" />
              <path d="M14 9l8 4-8 4V9z" fill="#1770EF" />
            </g>

            {/* Decorative stars */}
            <path d="M138 20l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#1770EF" />
            <path d="M280 8l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#1770EF" />
            <path d="M128 175l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#1770EF" />

            {/* Decorative circles */}
            <circle cx="175" cy="147" r="5" stroke="#9A9EAB" strokeWidth="1.5" fill="none" />
            <circle cx="330" cy="115" r="5" stroke="#9A9EAB" strokeWidth="1.5" fill="none" />
            <circle cx="160" cy="65" r="5" stroke="#9A9EAB" strokeWidth="1.5" fill="none" />

            {/* Checkbox icons */}
            <rect x="82" y="72" width="24" height="24" rx="6" fill="white" stroke="#1770EF" strokeWidth="1.5" />
            <path d="M89 84l4 4 8-8" stroke="#1770EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="348" y="161" width="24" height="24" rx="6" fill="white" stroke="#B3B6C0" strokeWidth="1.5" />
            <line x1="354" y1="167" x2="366" y2="179" stroke="#B3B6C0" strokeWidth="2" strokeLinecap="round" />
            <line x1="366" y1="167" x2="354" y2="179" stroke="#B3B6C0" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-xs items-center justify-center w-full">
          {title && (
            <p
              className="font-display text-m font-semibold leading-[1.4] text-center w-full"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </p>
          )}
          <p className="font-body text-s text-base-600 leading-[1.5] text-center w-full">
            {message}
          </p>
          {action && <div className="flex items-center gap-s justify-center pt-s">{action}</div>}
        </div>
      </div>
    </div>
  )
}
