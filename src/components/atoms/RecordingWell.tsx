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
 *   - Left to itself, the well IS the footage's shape — 9:19.5 for a phone
 *     capture, 16:9 for a landscape one — so the surface that owns the
 *     recording (the session viewer's hero) shows it whole, with no bars at
 *     all in either orientation.
 *   - Where a surface has its own reason to be a fixed box — a card in a grid,
 *     a filmstrip tile — it passes `fill`, and the footage is contained and
 *     centred inside it. The room left over is BLACK, which is what a player
 *     puts behind a picture. A hairline and a drop shadow edge the pane there,
 *     so the boundary between footage and bar is a decision rather than a
 *     smear.
 *
 * What it does with the wait:
 *   A live session reaches a screen a beat before 6labs has the picture of it,
 *   and some screens never get one. With no frame the well shows its waiting
 *   treatment — a capture reticle, one slow pulse, a line saying what is
 *   coming. It never shows an empty box (reads as broken) and never holds the
 *   previous screen's frame (reads as a wrong answer, which is worse than no
 *   answer).
 *
 * Code-first prototype — no Figma source yet.
 */

import type { CSSProperties, ReactNode } from 'react'
import type { RecordingOrientation } from '../../lib/types/testing'

export interface RecordingWellProps {
  /**
   * A real still. Preferred over `scene` when there is one: an image has an
   * intrinsic shape, so it is contained and centred and needs no orientation
   * told to it. This is how a library of mixed footage works, where nothing
   * knows a clip's shape until its still arrives.
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
  /**
   * The second line under `pendingLabel`, quieter and smaller.
   *
   * The wait used to be one 34-character-wide paragraph centred in a black
   * frame, which is the shape of a message you read rather than glance at —
   * and a glance is all anyone gives a frame they are waiting on. Split, the
   * first line answers "what is happening" at a glance and the second is there
   * for whoever wants the reason.
   */
  pendingNote?: string
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
  pendingNote,
  compact = false,
  fill = false,
  pane,
  children,
  className,
  style,
}: RecordingWellProps) {
  const pending = !src && !scene
  /* Full size scans; a thumbnail keeps the quiet silhouette — at 60px tall a
     sweeping brand line is noise, and a grid of forty would be a light show.
     Scan was chosen 2026-09-24 over silhouette, rings and a held frame. */
  const treatment = compact ? 'silhouette' : 'scan'

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
        <div className="recording-well-waiting" data-style={treatment}>
          <div className="recording-well-waiting-frame" aria-hidden>
            {compact ? <span className="recording-well-waiting-pulse" /> : <span className="recording-well-scanline" />}
          </div>
          {pendingLabel && !compact && (
            <span className="recording-well-waiting-copy">
              <span className="recording-well-waiting-label">{pendingLabel}</span>
              {pendingNote && <span className="recording-well-waiting-note">{pendingNote}</span>}
            </span>
          )}
        </div>
      )}
      {!pending && src && <img className="recording-well-fit" src={src} alt="" />}
      {!pending && !src && scene && (
        <div className="recording-well-pane" style={{ background: scene }}>
          {pane}
        </div>
      )}
      {children}
    </div>
  )
}
