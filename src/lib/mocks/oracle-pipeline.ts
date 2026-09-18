/**
 * Oracle's pipeline while a query runs — the step copy behind the Figma
 * "Pipeline Stepper / Oracle" set (6827:5).
 *
 * It lives here rather than in a story because two surfaces read it: the
 * Oracle response block renders it in the product, and the loader's stories
 * document it. The numbers match what the seeded Oracle answer then claims
 * (58 sessions consulted, three shown as sources) — a pipeline that says it
 * scanned 90 sessions above an answer drawn from 58 is worse than no pipeline.
 *
 * Code-first prototype — no Figma source for the copy itself.
 */
import type { PipelineStep } from '../../components/molecules/AgentPipelineLoader'

/**
 * How long the prototype takes to "answer". The loader paces itself against
 * this, so the last step lands just before the response replaces it instead of
 * completing early and leaving a finished pipeline sitting there.
 */
export const ORACLE_RESPONSE_MS = 9000

export const ORACLE_PIPELINE_STEPS: PipelineStep[] = [
  {
    title: 'Understanding your question',
    activeSub: 'Parsing intent and scope…',
    doneSub: 'Tutorial friction across first-session recordings',
  },
  {
    title: 'Recalling context',
    activeSub: 'Checking this thread for prior context…',
    doneSub: 'No prior context found in this thread',
  },
  {
    title: 'Building reasoning plan',
    activeSub: 'Mapping reasoning paths…',
    doneSub: '4 reasoning paths identified across friction, drop-off and comprehension',
  },
  {
    title: 'Consulting Radiologist',
    activeSub: 'Scanning first-session recordings…',
    doneSub: '58 sessions scanned',
    /* Informational, not a warning: the step found what it went looking for. */
    callout: {
      type: 'info',
      lead: '58 sessions found',
      rest: ' — first-session recordings across the last three builds',
    },
  },
  {
    title: 'Evaluating relevance',
    activeSub: 'Weighing each session against the question…',
    doneSub: '41 sessions selected — 17 filtered out',
    callout: {
      type: 'info',
      lead: '41 sessions',
      rest: ' selected with a clear tutorial run to compare',
    },
  },
  {
    title: 'Generating insights',
    activeSub: 'Building the friction breakdown…',
    doneSub: 'Friction points ranked by testers affected',
  },
  {
    title: 'Validating response',
    activeSub: 'Confirming accuracy against source data…',
    doneSub: 'Every claim traced to a clip',
  },
]

/**
 * A follow-up in an open thread. Shorter, because the work is shorter: the
 * question has already been understood once, the sessions have already been
 * selected, and the thread IS the context. Running the first-question pipeline
 * again here said "No prior context found in this thread" under an answer the
 * reader had just finished — the loader contradicting the screen it sat on.
 *
 * Three steps, paced so the answer lands as the last one is still running.
 * Number-light on purpose: a fixed "41 sessions" here would be a claim about
 * whatever thread this happens to run in. The first answer above carries the
 * numbers; the follow-up only has to say it is reading them.
 */
export const ORACLE_FOLLOWUP_MS = 4000

export const ORACLE_FOLLOWUP_STEPS: PipelineStep[] = [
  {
    title: 'Reading the thread',
    activeSub: 'Picking up what this thread has already established…',
    doneSub: 'Anchored to the sessions and findings already in this thread',
  },
  {
    title: 'Checking the sessions',
    activeSub: 'Re-reading the sessions this thread already selected…',
    doneSub: 'Selected sessions re-read — nothing new scanned',
  },
  {
    title: 'Writing the answer',
    activeSub: 'Drawing the answer from those sessions…',
    doneSub: 'Every claim traced to a clip',
  },
]
