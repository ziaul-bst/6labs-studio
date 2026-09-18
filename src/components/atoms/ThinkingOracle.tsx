/**
 * ThinkingOracle — Thinking state for Oracle AI responses.
 * Single line with circular spinner + text that swaps in place
 * with a fade transition, cycling through status messages.
 *
 * @figmaComponent  Thinking - Oracle
 * @figmaNode       6470:1506106
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6470-1506106
 */

import { useState, useEffect } from 'react'
import { Spinner } from './Spinner'

const THINKING_STEPS = [
  'Analyzing Prompt...',
  'Consulting our radiologist...',
  'Analyzing for Patterns and Behaviours...',
  'Thinking more...',
]

interface ThinkingOracleProps {
  /**
   * What the agent says it is doing. Overridable because the lines name real
   * work — another agent reading its own recordings is not "consulting our
   * radiologist", and borrowed copy would misdescribe it.
   */
  steps?: string[]
  className?: string
}

export function ThinkingOracle({ steps = THINKING_STEPS, className }: ThinkingOracleProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (stepIndex >= steps.length - 1) return
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        setStepIndex((prev) => prev + 1)
        setVisible(true)
      }, 250)
    }, 2200)
    return () => clearTimeout(timer)
  }, [stepIndex, steps.length])

  return (
    <div
      className={['flex items-center gap-xs', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Spinner size={16} tone="neutral" />
      <span
        className="font-body text-s font-normal leading-[1.5] oracle-shimmer-text"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 250ms ease' }}
      >
        {steps[stepIndex]}
      </span>
    </div>
  )
}
