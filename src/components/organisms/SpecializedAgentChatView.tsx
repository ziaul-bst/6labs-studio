/**
 * SpecializedAgentChatView — Chat flow launched from a Specialized Agent card.
 * Idle state: agent identity header + suggested prompts + console.
 * Active state: scrollable conversation (user prompts + a pipeline loader that
 * resolves into an Oracle-style response container) with the console pinned to
 * the bottom. A PageTopbar provides the standard back navigation.
 *
 * Prototype: responses are canned from the agent's registry entry (no live model).
 */
import { useEffect, useRef, useState } from 'react'
import InputFieldConsole from '../ui/InputFieldConsole'
import { AgentPageHeader } from '../molecules/AgentPageHeader'
import { SuggestionCard } from '../molecules/SuggestionCard'
import { StatCard } from '../atoms/StatCard'
import { PageTopbar } from '../molecules/PageTopbar'
import { UserPrompt } from '../atoms/UserPrompt'
import { AgentPipelineLoader } from '../molecules/AgentPipelineLoader'
import type { PipelineStep } from '../molecules/AgentPipelineLoader'
import { CheckIcon } from '../icons/CheckIcon'
import { InfoFilledIcon } from '../icons/InfoFilledIcon'
import type { SpecializedAgent, SpecializedAgentReply } from '../../data/specializedAgents'

interface ChatMsg {
  id: string
  role: 'user' | 'agent'
  text?: string
  reply?: SpecializedAgentReply
  /** Pipeline captured at send time */
  pipeline?: PipelineStep[]
  loading?: boolean
}

interface SpecializedAgentChatViewProps {
  agent: SpecializedAgent
  onBack: () => void
  className?: string
}

const STEP_MS = 640
const REVEAL_DELAY_MS = 480

export function SpecializedAgentChatView({ agent, onBack, className }: SpecializedAgentChatViewProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [pipelineStep, setPipelineStep] = useState(0)
  const idCounter = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervals = useRef<ReturnType<typeof setInterval>[]>([])

  const nextId = () => `m${idCounter.current++}`

  // Reset the conversation whenever the agent changes.
  useEffect(() => {
    setMessages([])
    setInput('')
    setPipelineStep(0)
  }, [agent.id])

  // Clear any pending fake-pipeline timers on unmount.
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      intervals.current.forEach(clearInterval)
    },
    [],
  )

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, pipelineStep])

  const send = (text: string) => {
    const prompt = text.trim()
    if (!prompt) return
    const loadingId = nextId()
    const msgPipeline = agent.pipeline
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text: prompt },
      { id: loadingId, role: 'agent', loading: true, pipeline: msgPipeline },
    ])
    setInput('')
    setPipelineStep(0)

    const total = msgPipeline.length
    let i = 0
    const interval = setInterval(() => {
      i += 1
      setPipelineStep(i)
      if (i >= total) {
        clearInterval(interval)
        const t = setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === loadingId ? { ...m, loading: false, reply: agent.reply } : m)),
          )
        }, REVEAL_DELAY_MS)
        timers.current.push(t)
      }
    }, STEP_MS)
    intervals.current.push(interval)
  }

  const isIdle = messages.length === 0

  return (
    <div className={['flex flex-col h-full w-full', className].filter(Boolean).join(' ')}>
      <PageTopbar title={agent.name} onBack={onBack} />

      {isIdle ? (
        /* ── Idle: Oracle-style agent hero + console + suggestions ── */
        <div className="flex-1 min-h-0 overflow-y-auto flyout-scrollbar">
          <div className="flex flex-col items-center pt-[120px] pb-xxl w-full">
            <div className="flex flex-col gap-xxxl items-start page-measure">
              <AgentPageHeader
                title={agent.name}
                description={agent.description}
                iconGradient={agent.iconGradient}
                icon={agent.icon}
              />

              <div className="flex flex-col gap-s items-start w-full">
                {agent.requirement && (
                  <div
                    className="flex items-center gap-xs px-m py-s rounded-m w-full bg-bg-tint-light text-text-secondary"
                    style={{ border: '1px solid var(--border-subtle)' }}
                  >
                    <span className="text-text-brand shrink-0">
                      <InfoFilledIcon size={16} />
                    </span>
                    <p className="font-body text-xs leading-[1.5]">
                      <span className="font-semibold text-text-primary">{agent.requirement}.</span>{' '}
                      Connect the 6labs SDK to capture the events this agent needs — only SDK sources are available here.
                    </p>
                  </div>
                )}
                <InputFieldConsole
                  value={input}
                  onChange={setInput}
                  onSubmit={() => send(input)}
                  placeholder={agent.placeholder}
                  platforms={agent.sources}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-s items-start w-full">
                <p className="font-display text-xs font-semibold text-base-500 text-center w-full leading-[1.5]">
                  Try a suggested prompt
                </p>
                <div className="grid grid-cols-2 grid-rows-[72px_72px] gap-s w-full">
                  {agent.suggestions.map((text) => (
                    <SuggestionCard key={text} text={text} onClick={() => send(text)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Active conversation ── */
        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden flyout-scrollbar"
          >
            <div className="flex flex-col gap-l page-measure pt-l pb-[160px]">
              {messages.map((msg) =>
                msg.role === 'user' ? (
                  <UserPrompt key={msg.id} text={msg.text ?? ''} />
                ) : (
                  <AgentResponse
                    key={msg.id}
                    agent={agent}
                    reply={msg.reply}
                    pipeline={msg.pipeline ?? agent.pipeline}
                    loading={msg.loading}
                    pipelineStep={pipelineStep}
                  />
                ),
              )}
            </div>
          </div>

          {/* Pinned console */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-m px-l specialized-input-overlay">
            <div className="page-measure">
              <InputFieldConsole
                value={input}
                onChange={setInput}
                onSubmit={() => send(input)}
                placeholder="Ask a follow-up…"
                platforms={agent.sources}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Oracle-style response container — pipeline loader while working, then the insight. */
function AgentResponse({
  agent,
  reply,
  pipeline,
  loading,
  pipelineStep,
}: {
  agent: SpecializedAgent
  reply?: SpecializedAgentReply
  pipeline: PipelineStep[]
  loading?: boolean
  pipelineStep: number
}) {
  const showReply = !loading && reply
  const hasBullets = !!(reply?.bullets && reply.bullets.length > 0)

  return (
    <div className="flex flex-col gap-[10px] items-start pb-l w-full">
      <div
        className="flex flex-col items-start overflow-hidden rounded-3xl w-full bg-bg-elements"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        {!showReply ? (
          /* Pipeline loader — progress rail sits flush against the card's top edge */
          <AgentPipelineLoader
            steps={pipeline}
            currentStep={pipelineStep}
            header={
              <div className="flex items-center gap-xs">
                <div
                  className="shrink-0 size-[24px] rounded-s flex items-center justify-center"
                  style={{ background: agent.iconGradient }}
                >
                  <div className="text-white scale-[0.45] origin-center">{agent.icon}</div>
                </div>
                <span className="font-display text-s font-semibold text-text-primary">
                  {agent.name} is working…
                </span>
              </div>
            }
          />
        ) : (
          <>
            {/* Summary + metrics */}
            <div
              className="flex flex-col gap-m items-start p-l w-full"
              style={hasBullets ? { borderBottom: '1px solid var(--border-subtle)' } : undefined}
            >
              <p className="font-body text-s font-normal leading-[1.6] text-text-secondary w-full">
                {reply!.summary}
              </p>
              {reply!.stats && reply!.stats.length > 0 && (
                <div className="grid gap-s [grid-template-columns:repeat(auto-fit,minmax(124px,1fr))] w-full">
                  {reply!.stats.map((s) => (
                    <StatCard key={s.label} label={s.label} value={s.value} variant={s.variant} />
                  ))}
                </div>
              )}
            </div>

            {/* Recommended next steps */}
            {hasBullets && (
              <div className="flex flex-col gap-s items-start p-l w-full">
                <span className="font-display text-m font-semibold leading-[1.5] text-text-primary">
                  Recommended next steps
                </span>
                {reply!.bullets!.map((b) => (
                  <div key={b} className="flex gap-xs items-start">
                    <span className="shrink-0 mt-xxxs text-text-brand">
                      <CheckIcon size={16} />
                    </span>
                    <p className="font-body text-s font-normal text-base-700 leading-[1.5]">{b}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
