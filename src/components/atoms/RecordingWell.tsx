/**
 * RecordingWell — the box a gameplay recording is shown in, at any size.
 *
 * Every 6labs recording is a phone screen capture, so the footage is PORTRAIT
 * and every well that shows it is wider than it is tall. Three surfaces have
 * the same problem and used to solve it three ways: the hero frame in the
 * session viewer, the thumbnails in its filmstrip, and the card in a run's
 * Videos grid. This is the one answer.
 *
 * What it does with the shape:
 *   - The pane holds the footage at its own aspect and is centred, never
 *     stretched. A 9:19.5 capture in a landscape box is the normal case, not a
 *     failure, so it is designed for rather than worked around.
 *   - The room left over beside the pane gets an AMBIENT fill: the same frame,
 *     blown up, blurred and dimmed. Letterboxing then reads as part of the
 *     picture instead of as two empty slabs of whatever colour the frame
 *     happened to start with — which is what a flat fill behind a portrait
 *     clip actually looks like.
 *   - A hairline and a drop shadow edge the pane, so the boundary between
 *     footage and ambience is legible rather than a smear.
 *
 * What it does with the wait:
 *   A live session reaches a screen a beat before 6labs has the picture of it,
 *   and some screens never get one. With no frame the well shows its waiting
 *   treatment — matte, device outline, a slow sweep — and says so. It never
 *   shows an empty box (reads as broken) and never holds the previous screen's
 *   frame (reads as a wrong answer, which is worse than no answer).
 *
 * Code-first prototype — no Figma source yet.
 */

import type { CSSProperties, ReactNode } from 'react'
import type { RecordingOrientation } from '../../lib/types/testing'

export interface RecordingWellProps {
  /**
   * A real still. Preferred over `scene` when there is one: an image has an
   * intrinsic shape, so the well does not have to be told the orientation —
   * the picture is contained and centred, and the ambience is the same file
   * covering the box behind it. This is how a library of mixed footage works,
   * where nothing knows a clip's shape until its still arrives.
   */
  src?: string
  /**
   * The stand-in fill — a gradient, until real stills ship. A CSS background
   * has no intrinsic shape, so this path DOES lean on `orientation`. Absent
   * (with no `src`) means the frame has not been captured yet.
   */
  scene?: string
  /** Defaults to portrait — see RecordingOrientation. */
  orientation?: RecordingOrientation
  /**
   * What the reader is waiting for, on the pending state. Omitted on a
   * thumbnail, where there is no room for a sentence and the sweep is enough.
   */
  pendingLabel?: string
  /** Thumbnail scale: thinner hairline, no copy, cheaper blur. */
  compact?: boolean
  /**
   * Fill a box somebody else already sized, instead of setting its own aspect
   * — for a surface that has its own reason for the shape it is (a fixed
   * filmstrip tile, a card's media slot). A utility class cannot do this from
   * outside: `.recording-well` sets `position: relative` and its own
   * `aspect-ratio`, and both win over a Tailwind utility on source order.
   */
  fill?: boolean
  /**
   * Anything that belongs to the FOOTAGE rather than to the player — the HUD
   * stand-in, a tap ripple. It is clipped to the pane, so on a portrait clip
   * it stays on the phone screen instead of floating out over the ambience.
   */
  pane?: ReactNode
  /** Player chrome over the whole well: badges, the caption, the step arrows. */
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export function RecordingWell({
  src,
  scene,
  orientation = 'portrait',
  pendingLabel,
  compact = false,
  fill = false,
  pane,
  children,
  className,
  style,
}: RecordingWellProps) {
  const pending = !src && !scene

  return (
    <div
      className={[
        'recording-well',
        compact ? 'recording-well-compact' : '',
        fill ? 'recording-well-fill' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-orientation={orientation}
      data-pending={pending ? 'true' : 'false'}
      style={style}
    >
      {pending && (
        <div className="recording-well-waiting">
          <div className="recording-well-waiting-device" aria-hidden />
          {pendingLabel && !compact && <span className="recording-well-waiting-label">{pendingLabel}</span>}
        </div>
      )}
      {/* Ambience first, footage over it — both read the same frame, so they
          can never disagree about what is being shown. */}
      {!pending && src && (
        <>
          <img className="recording-well-ambient" src={src} alt="" aria-hidden />
          <img className="recording-well-fit" src={src} alt="" />
        </>
      )}
      {!pending && !src && scene && (
        <>
          <div className="recording-well-ambient" style={{ background: scene }} aria-hidden />
          <div className="recording-well-pane" style={{ background: scene }}>
            {pane}
          </div>
        </>
      )}
      {children}
    </div>
  )
}
