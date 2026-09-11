/**
 * RadiologistResultsView — Results page after a Radiologist query.
 * Layout: flex-row with main content area (input + header + grid) + slide-in flyout panel.
 *
 * @figmaComponent  Radiologist Results
 * @figmaNode       6453:1472123
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6453-1472123
 */

import { useEffect, useState } from 'react'
import InputFieldConsole from '../ui/InputFieldConsole'
import { ResultsHeader } from '../molecules/ResultsHeader'
import { VideosContainer } from './VideosContainer'
import { SessionSidePanel } from './SessionSidePanel'
import { MOCK_SESSIONS } from '../../lib/mocks/radiologist-sessions'
import { MOCK_EXCERPTS } from '../../lib/mocks/excerpts'
import type { SessionData } from '../../lib/types/radiologist'

interface RadiologistResultsViewProps {
  query: string
  onQueryChange: (query: string) => void
  onQuerySubmit: () => void
  selectedSession: SessionData | null
  flyoutOpen: boolean
  sidebarCollapsed?: boolean
  onCardClick: (session: SessionData) => void
  onFlyoutClose: () => void
  onViewDetail: () => void
  className?: string
}

export function RadiologistResultsView({
  query,
  onQueryChange,
  onQuerySubmit,
  selectedSession,
  flyoutOpen,
  sidebarCollapsed = false,
  onCardClick,
  onFlyoutClose,
  onViewDetail,
  className,
}: RadiologistResultsViewProps) {
  // Delayed mount for slide-in animation
  // Seeded open when the view mounts with the panel already requested — a deep
  // link into `#/radiologist/panel` shouldn't play a slide-in, and relying on the
  // effect's two-frame animation left the panel parked off-screen on arrival.
  const [panelMounted, setPanelMounted] = useState(() => flyoutOpen && !!selectedSession)
  const [panelVisible, setPanelVisible] = useState(() => flyoutOpen && !!selectedSession)
  // Count of sessions visible after the container's Source & Tag filters apply.
  const [visibleCount, setVisibleCount] = useState(MOCK_SESSIONS.length)

  useEffect(() => {
    if (flyoutOpen && selectedSession) {
      setPanelMounted(true)
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPanelVisible(true))
      })
    } else {
      setPanelVisible(false)
      const timer = setTimeout(() => setPanelMounted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [flyoutOpen, selectedSession])

  return (
    <div
      className={[
        'flex w-full h-full overflow-hidden',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* ── Main content area ── */}
      <div className="flex-1 min-w-0 overflow-y-auto transition-all duration-300 ease-in-out">
        <div className="px-l pt-l pb-xxl3">
          {/* Mini input console */}
          <InputFieldConsole
            type="mini"
            value={query}
            onChange={onQueryChange}
            onSubmit={onQuerySubmit}
            placeholder="Search for actions, objects and events in your game..."
          />

          {/* Results header — mt-xl for proper spacing from Figma (20px gap) */}
          <ResultsHeader
            count={visibleCount}
            className="mt-xl"
          />

          {/* Video grid */}
          <div className="mt-m">
            <VideosContainer
              columns={flyoutOpen && !sidebarCollapsed ? 2 : 3}
              onVisibleCountChange={setVisibleCount}
              onCardClick={(session) => {
                const fullSession = MOCK_SESSIONS.find(
                  (s) => s.sessionId === session.sessionId
                )
                if (fullSession) onCardClick(fullSession)
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Flyout side panel — always mounted during transition for animation ── */}
      {panelMounted && selectedSession && (
        <div
          className={[
            'session-panel shrink-0',
            panelVisible ? 'session-panel-active' : '',
          ].join(' ')}
        >
          <SessionSidePanel
            session={selectedSession}
            onClose={onFlyoutClose}
            onViewDetail={onViewDetail}
            /* Results are query-driven too — this video came back for the search
               above, so the excerpt is as meaningful here as in Oracle. The
               query shown is the one actually searched, not the Oracle mock. */
            excerpt={
              query.trim()
                ? { ...MOCK_EXCERPTS['attributes-text'], query: query.trim() }
                : undefined
            }
          />
        </div>
      )}
    </div>
  )
}
