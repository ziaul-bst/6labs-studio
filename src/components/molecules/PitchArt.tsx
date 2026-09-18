/**
 * PitchArt — the flat illustrations on a locked test's pitch.
 *
 * A pitch page is the one place in the studio that has to explain itself to
 * someone who has never run the thing, and three paragraphs of body copy in a
 * row is how that page stops being read. Each of these draws one idea — a
 * report, a clip, a build comparison, an AI player on a device — in the
 * flattest possible way: token fills, no gradients, no shadows, no perspective,
 * and exactly one element per drawing in the test's own accent so the set ties
 * to the page it is on.
 *
 * They are decorative (`aria-hidden`): every one of them sits above a sentence
 * that already says the thing. Nothing here is the only carrier of meaning.
 *
 * Code-first prototype — no Figma source yet.
 */

import { TESTING_ACCENT_VARS, type TestingAccent } from '../../lib/studioAreas'

export type PitchArtKey =
  | 'report'
  | 'clips'
  | 'compare'
  | 'ask'
  | 'search'
  | 'personas'
  | 'clock'
  | 'rerun'
  | 'upload'
  | 'aiplayer'
  | 'analysis'

export interface PitchArtProps {
  art: PitchArtKey
  accent: TestingAccent
  className?: string
}

const SURFACE = 'var(--bg-elements)'
const PALE = 'var(--bg-page-pale)'
const NEUTRAL = 'var(--bg-subtle)'
const LINE = 'var(--border-subtle)'
const EDGE = 'var(--border-default)'

export function PitchArt({ art, accent, className }: PitchArtProps) {
  const vars = TESTING_ACCENT_VARS[accent]
  const ink = vars.ink
  const tint = vars.bg

  return (
    <svg
      viewBox="0 0 120 80"
      className={['block w-full h-auto', className].filter(Boolean).join(' ')}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {art === 'report' && (
        <>
          <rect x="10" y="8" width="100" height="64" rx="8" fill={SURFACE} stroke={LINE} />
          <rect x="20" y="18" width="42" height="6" rx="3" fill={tint} />
          <rect x="84" y="18" width="16" height="6" rx="3" fill={NEUTRAL} />
          {[20, 42, 64, 86].map((x) => (
            <rect key={x} x={x} y="30" width="16" height="11" rx="3" fill={PALE} stroke={LINE} />
          ))}
          <circle cx="24" cy="51" r="3" fill="var(--error)" />
          <rect x="32" y="48" width="58" height="6" rx="3" fill={NEUTRAL} />
          <circle cx="24" cy="63" r="3" fill="var(--warning)" />
          <rect x="32" y="60" width="42" height="6" rx="3" fill={NEUTRAL} />
        </>
      )}

      {art === 'clips' && (
        <>
          <rect x="14" y="18" width="26" height="46" rx="5" fill={PALE} stroke={LINE} />
          <rect x="78" y="18" width="26" height="46" rx="5" fill={PALE} stroke={LINE} />
          <rect x="45" y="10" width="28" height="60" rx="6" fill={tint} stroke={ink} />
          <path d="M55 32.5 L66 40 L55 47.5 Z" fill={ink} />
          <rect x="18" y="56" width="18" height="4" rx="2" fill={NEUTRAL} />
          <rect x="82" y="56" width="18" height="4" rx="2" fill={NEUTRAL} />
        </>
      )}

      {art === 'compare' && (
        <>
          <rect x="8" y="12" width="40" height="56" rx="7" fill={PALE} stroke={LINE} />
          <rect x="72" y="12" width="40" height="56" rx="7" fill={SURFACE} stroke={ink} />
          {[24, 36, 48].map((y) => (
            <rect key={y} x="16" y={y} width="24" height="5" rx="2.5" fill={NEUTRAL} />
          ))}
          <rect x="80" y="24" width="24" height="5" rx="2.5" fill="var(--success)" />
          <rect x="80" y="36" width="18" height="5" rx="2.5" fill="var(--error)" />
          <rect x="80" y="48" width="24" height="5" rx="2.5" fill={NEUTRAL} />
          <path d="M54 40 H64 M60 36 L64 40 L60 44" stroke={EDGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {art === 'ask' && (
        <>
          <rect x="10" y="12" width="70" height="32" rx="9" fill={PALE} stroke={LINE} />
          <rect x="20" y="22" width="40" height="5" rx="2.5" fill={NEUTRAL} />
          <rect x="20" y="32" width="28" height="5" rx="2.5" fill={NEUTRAL} />
          <rect x="44" y="48" width="66" height="24" rx="9" fill={tint} stroke={ink} />
          <rect x="54" y="58" width="34" height="5" rx="2.5" fill={ink} opacity="0.5" />
          <circle cx="96" cy="60.5" r="3" fill={ink} />
        </>
      )}

      {art === 'search' && (
        <>
          <rect x="10" y="14" width="48" height="8" rx="4" fill={tint} />
          <rect x="64" y="14" width="26" height="8" rx="4" fill={NEUTRAL} />
          {[34, 48, 62].map((y) => (
            <rect key={y} x="10" y={y} width="62" height="7" rx="3.5" fill={NEUTRAL} />
          ))}
          <circle cx="90" cy="46" r="14" fill={SURFACE} stroke={ink} strokeWidth="2.5" />
          <path d="M100 56 L109 65" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {art === 'personas' && (
        <>
          {[
            { x: 24, fill: 'var(--bg-tint)', stroke: 'var(--brand)' },
            { x: 60, fill: 'var(--purple-tint-light)', stroke: 'var(--purple)' },
            { x: 96, fill: 'var(--success-bg)', stroke: 'var(--success)' },
          ].map((p) => (
            <g key={p.x}>
              <circle cx={p.x} cy="30" r="12" fill={p.fill} stroke={p.stroke} strokeWidth="1.5" />
              <circle cx={p.x} cy="27" r="4" fill={p.stroke} />
              <path d={`M${p.x - 6} 38 a6 6 0 0 1 12 0`} fill={p.stroke} />
              <rect x={p.x - 12} y="52" width="24" height="5" rx="2.5" fill={NEUTRAL} />
              <rect x={p.x - 8} y="62" width="16" height="5" rx="2.5" fill={NEUTRAL} />
            </g>
          ))}
        </>
      )}

      {art === 'clock' && (
        <>
          <circle cx="46" cy="40" r="26" fill={PALE} stroke={LINE} />
          <path d="M46 40 V24" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          <path d="M46 40 L58 46" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          <circle cx="46" cy="40" r="3" fill={ink} />
          <rect x="82" y="26" width="28" height="7" rx="3.5" fill={NEUTRAL} />
          <rect x="82" y="40" width="20" height="7" rx="3.5" fill={tint} />
          <rect x="82" y="54" width="24" height="7" rx="3.5" fill={NEUTRAL} />
        </>
      )}

      {art === 'rerun' && (
        <>
          <rect x="10" y="16" width="100" height="48" rx="8" fill={SURFACE} stroke={LINE} />
          <path
            d="M44 32 a12 12 0 1 0 5 -5"
            stroke={ink}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M38 24 L45 31 L38 33 Z" fill={ink} />
          <rect x="72" y="30" width="26" height="6" rx="3" fill={NEUTRAL} />
          <rect x="72" y="44" width="18" height="6" rx="3" fill={tint} />
        </>
      )}

      {art === 'upload' && (
        <>
          {/* Two recordings behind, and the one being handed over in front. */}
          <rect x="10" y="26" width="30" height="42" rx="6" fill={PALE} stroke={LINE} />
          <rect x="80" y="26" width="30" height="42" rx="6" fill={PALE} stroke={LINE} />
          <rect x="40" y="16" width="40" height="56" rx="7" fill={SURFACE} stroke={ink} />
          <path d="M60 52 V30 M52 38 L60 30 L68 38" stroke={ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="48" y="60" width="24" height="5" rx="2.5" fill={tint} />
          <rect x="16" y="56" width="18" height="5" rx="2.5" fill={NEUTRAL} />
          <rect x="86" y="56" width="18" height="5" rx="2.5" fill={NEUTRAL} />
        </>
      )}

      {art === 'aiplayer' && (
        <>
          {/* The brief, arriving from the left */}
          <rect x="6" y="28" width="24" height="6" rx="3" fill={NEUTRAL} />
          <rect x="6" y="40" width="17" height="6" rx="3" fill={NEUTRAL} />
          <path d="M33 37 H40 M37 34 l3 3 -3 3" stroke={EDGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* The device the player is on */}
          <rect x="46" y="6" width="42" height="68" rx="9" fill={PALE} stroke={LINE} />
          <rect x="52" y="15" width="30" height="46" rx="5" fill={SURFACE} stroke={LINE} />
          <circle cx="67" cy="67" r="3.5" fill={NEUTRAL} />
          {/* The tap it just made, and the mark that says who made it */}
          <circle cx="67" cy="38" r="6" fill={tint} stroke={ink} strokeWidth="1.5" />
          <circle cx="67" cy="38" r="13" stroke={ink} strokeWidth="1.5" opacity="0.35" fill="none" />
          <path d="M100 20 l3.2 7.8 7.8 3.2 -7.8 3.2 -3.2 7.8 -3.2 -7.8 -7.8 -3.2 7.8 -3.2 Z" fill={ink} />
          <rect x="94" y="50" width="20" height="6" rx="3" fill={tint} />
        </>
      )}

      {art === 'analysis' && (
        <>
          <rect x="10" y="12" width="60" height="56" rx="7" fill={PALE} stroke={LINE} />
          <path d="M10 40 H70" stroke={ink} strokeWidth="2.5" strokeDasharray="5 4" />
          <rect x="18" y="20" width="24" height="5" rx="2.5" fill={NEUTRAL} />
          <rect x="18" y="54" width="34" height="5" rx="2.5" fill={NEUTRAL} />
          <circle cx="92" cy="26" r="7" fill={tint} stroke={ink} strokeWidth="1.5" />
          <path d="M89 26 l2 2.5 4 -5" stroke={ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="82" y="44" width="28" height="6" rx="3" fill={NEUTRAL} />
          <rect x="82" y="56" width="20" height="6" rx="3" fill={NEUTRAL} />
        </>
      )}
    </svg>
  )
}
