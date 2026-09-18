/**
 * PitchScene — the hero illustration on a locked test's pitch: what the test
 * IS, drawn as its setup rather than as its output.
 *
 * One drawing of "footage with verdicts on it" served all four tests, which
 * made four products look like one — and it illustrated the report, which the
 * page already shows twice further down. What actually differs between these
 * tests is what you bring and who plays:
 *
 *   User test            your own testers' sessions, three different people
 *   Functional test      your case sheet, checked against your own footage
 *   AI behavioural test  a persona brief, and 6labs players running on it
 *   AI functional test   your case list, executed by a player on a device
 *
 * Four scenes, built from three shared parts (a recording, a case sheet, a
 * brief) so they read as one family. The parts drift on the same slow float
 * the rest of the page uses, out of phase, and stand still under
 * prefers-reduced-motion.
 *
 * Decorative — the whole scene is `aria-hidden`; every claim it makes is
 * written out in the bands below it.
 *
 * Code-first prototype — no Figma source yet.
 */

import type { CSSProperties, ReactNode } from 'react'
import { RecordingWell } from '../atoms/RecordingWell'
import { PlayIcon } from '../icons/PlayIcon'
import { sceneGradient } from '../../lib/mocks/testing'
import type { TestingTestId } from '../../lib/studioAreas'

const CARD: CSSProperties = {
  backgroundColor: 'var(--bg-elements)',
  border: '1px solid var(--border-subtle)',
  boxShadow: 'var(--shadow-big)',
}

/** The three colours a persona or a tester is told apart by, across the studio. */
const PEOPLE = ['var(--brand)', 'var(--purple)', 'var(--success)']

function Floating({
  left,
  top,
  width,
  height,
  rotate,
  delay,
  z = 1,
  style,
  className,
  children,
}: {
  left: number
  top: number
  width: number
  height?: number
  rotate: number
  delay: string
  z?: number
  style?: CSSProperties
  className?: string
  children?: ReactNode
}) {
  return (
    <span
      className={['pitch-clip absolute block', className].filter(Boolean).join(' ')}
      style={
        {
          left,
          top,
          width,
          height,
          zIndex: z,
          '--clip-rot': `${rotate}deg`,
          animationDelay: delay,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </span>
  )
}

/** One recording, with a badge saying who produced it. */
function Recording({
  scene,
  badge,
  play,
  tap,
}: {
  scene: number
  badge?: ReactNode
  play?: boolean
  tap?: boolean
}) {
  return (
    <RecordingWell fill compact scene={sceneGradient(scene)}>
      {badge && (
        <span
          className="absolute left-[8px] top-[8px] flex items-center justify-center w-7 h-7 rounded-round"
          style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
        >
          {badge}
        </span>
      )}
      {play && (
        <span
          className="absolute left-1/2 top-1/2 flex items-center justify-center w-8 h-8 rounded-round"
          style={{
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: 'var(--brand)',
          }}
        >
          <PlayIcon size={16} />
        </span>
      )}
      {tap && (
        <>
          <span
            className="absolute left-1/2 top-1/2 w-[18px] h-[18px] rounded-round"
            style={{ transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255,255,255,0.85)' }}
          />
          <span
            className="absolute left-1/2 top-1/2 w-[40px] h-[40px] rounded-round"
            style={{ transform: 'translate(-50%, -50%)', border: '2px solid rgba(255,255,255,0.55)' }}
          />
        </>
      )}
    </RecordingWell>
  )
}

function PersonMark({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="5.4" r="2.8" fill={color} />
      <path d="M2.6 14 a5.4 5.4 0 0 1 10.8 0 Z" fill={color} />
    </svg>
  )
}

function AIMark({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 1.5 l1.5 3.9 3.9 1.5 -3.9 1.5 -1.5 3.9 -1.5 -3.9 -3.9 -1.5 3.9 -1.5 Z" fill={color} />
      <circle cx="13" cy="12.5" r="1.6" fill={color} />
    </svg>
  )
}

/** The case sheet a functional test is run against — some rows ticked, one live. */
function CaseSheet({ accent, rows = 5, done = 3 }: { accent: string; rows?: number; done?: number }) {
  return (
    <span className="flex flex-col gap-xs w-full h-full rounded-xl px-s py-s" style={CARD}>
      <span className="h-[6px] w-[52%] rounded-round shrink-0" style={{ backgroundColor: 'var(--bg-subtle)' }} />
      {Array.from({ length: rows }, (_, i) => {
        const ticked = i < done
        const live = i === done
        return (
          <span key={i} className="flex items-center gap-xs">
            <span
              className="flex items-center justify-center w-[14px] h-[14px] rounded-xs shrink-0"
              style={{
                backgroundColor: ticked ? accent : 'transparent',
                border: `1.5px solid ${ticked || live ? accent : 'var(--border-default)'}`,
              }}
            >
              {ticked && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
                  <path d="M1 3 L3 5 L7 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span
              className="h-[5px] rounded-round"
              style={{
                width: `${72 - i * 8}%`,
                backgroundColor: live ? accent : 'var(--bg-subtle)',
                opacity: live ? 0.5 : 1,
              }}
            />
          </span>
        )
      })}
    </span>
  )
}

/** The brief a behavioural run is given — the personas, and how long they play. */
function PersonaBrief({ accent }: { accent: string }) {
  return (
    <span className="flex flex-col gap-xs w-full h-full rounded-xl px-s py-s" style={CARD}>
      <span className="h-[6px] w-[46%] rounded-round shrink-0" style={{ backgroundColor: 'var(--bg-subtle)' }} />
      {PEOPLE.slice(0, 3).map((c, i) => (
        <span key={c} className="flex items-center gap-xs">
          <span className="w-[14px] h-[14px] rounded-round shrink-0" style={{ backgroundColor: c, opacity: 0.85 }} />
          <span className="h-[5px] rounded-round" style={{ width: `${68 - i * 10}%`, backgroundColor: 'var(--bg-subtle)' }} />
        </span>
      ))}
      <span className="flex items-center gap-xs pt-xxxs">
        <span className="h-[5px] w-[34%] rounded-round" style={{ backgroundColor: accent, opacity: 0.45 }} />
        <span className="h-[5px] w-[22%] rounded-round" style={{ backgroundColor: 'var(--bg-subtle)' }} />
      </span>
    </span>
  )
}

/** A dashed hop from what you bring to what runs on it. */
function Link({ left, top, delay }: { left: number; top: number; delay: string }) {
  return (
    <Floating left={left} top={top} width={34} rotate={0} delay={delay} z={6}>
      <svg width="34" height="12" viewBox="0 0 34 12" fill="none" aria-hidden>
        <path
          d="M1 6 H24"
          stroke="var(--border-default)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
        <path d="M24 2 L29 6 L24 10" stroke="var(--border-default)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Floating>
  )
}

export interface PitchSceneProps {
  test: TestingTestId
  /** The test's accent ink — the one colour in the scene. */
  accent: string
  className?: string
}

export function PitchScene({ test, accent, className }: PitchSceneProps) {
  return (
    <span
      className={['relative block shrink-0', className].filter(Boolean).join(' ')}
      style={{ width: 360, height: 244 }}
      aria-hidden
    >
      {/* ── User test — three different people, three sessions ───────────── */}
      {test === 'user-test' && (
        <>
          {[
            { left: 0, top: 34, rot: -9, delay: '0s', scene: 2 },
            { left: 124, top: 8, rot: -1, delay: '1.6s', scene: 7 },
            { left: 248, top: 38, rot: 8, delay: '3.2s', scene: 4 },
          ].map((c, i) => (
            <Floating
              key={c.left}
              left={c.left}
              top={c.top}
              width={112}
              height={162}
              rotate={c.rot}
              delay={c.delay}
              z={i + 1}
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-big)' }}
            >
              <Recording scene={c.scene} badge={<PersonMark color={PEOPLE[i]} />} play={i === 1} />
            </Floating>
          ))}
        </>
      )}

      {/* ── Functional test — your sheet, checked against your footage ────── */}
      {test === 'functional-test' && (
        <>
          <Floating left={0} top={26} width={148} height={188} rotate={-5} delay="0s" z={2}>
            <CaseSheet accent={accent} rows={5} done={3} />
          </Floating>
          <Link left={158} top={104} delay="0.9s" />
          <Floating
            left={204}
            top={40}
            width={118}
            height={168}
            rotate={7}
            delay="1.8s"
            z={1}
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-big)' }}
          >
            <Recording scene={2} badge={<PersonMark color={PEOPLE[0]} />} play />
          </Floating>
        </>
      )}

      {/* ── AI behavioural — a persona brief, and players running on it ───── */}
      {test === 'ai-behavioural-test' && (
        <>
          <Floating left={0} top={56} width={142} height={132} rotate={-5} delay="0s" z={3}>
            <PersonaBrief accent={accent} />
          </Floating>
          <Link left={150} top={116} delay="0.9s" />
          <Floating
            left={196}
            top={14}
            width={110}
            height={160}
            rotate={-2}
            delay="1.6s"
            z={2}
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-big)' }}
          >
            <Recording scene={7} badge={<AIMark color={accent} />} tap />
          </Floating>
          <Floating
            left={262}
            top={68}
            width={96}
            height={140}
            rotate={9}
            delay="3s"
            z={1}
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-big)' }}
          >
            <Recording scene={4} badge={<AIMark color={accent} />} />
          </Floating>
        </>
      )}

      {/* ── AI functional — your case list, executed on a device ──────────── */}
      {test === 'ai-functional-test' && (
        <>
          <Floating left={0} top={30} width={148} height={184} rotate={-5} delay="0s" z={2}>
            <CaseSheet accent={accent} rows={5} done={4} />
          </Floating>
          <Link left={158} top={108} delay="0.9s" />
          <Floating
            left={204}
            top={22}
            width={118}
            height={168}
            rotate={7}
            delay="1.8s"
            z={1}
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-big)' }}
          >
            <Recording scene={4} badge={<AIMark color={accent} />} tap />
          </Floating>
          {/* How far through the sheet it is — the fact this test sells. */}
          <Floating left={200} top={200} width={132} rotate={4} delay="2.6s" z={3}>
            <span className="flex flex-col gap-xxs w-full rounded-l px-s py-xs" style={CARD}>
              <span className="h-[5px] w-[58%] rounded-round" style={{ backgroundColor: 'var(--bg-subtle)' }} />
              <span className="flex h-[6px] w-full rounded-round overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <span style={{ width: '82%', backgroundColor: accent }} />
              </span>
            </span>
          </Floating>
        </>
      )}
    </span>
  )
}
