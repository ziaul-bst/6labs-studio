import type { Meta, StoryObj } from '@storybook/react-vite'
import { RecordingWell } from './RecordingWell'

const meta = {
  title: 'Atoms/RecordingWell',
  component: RecordingWell,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The box a gameplay recording is shown in. Every 6labs recording is a phone screen capture, so the footage is portrait and every well that holds it is wider than it is tall — the well is built for that case rather than working around it. It also owns the wait: a live session reaches a screen a beat before the picture of it arrives.',
      },
    },
  },
} satisfies Meta<typeof RecordingWell>

export default meta
type Story = StoryObj<typeof meta>

/* Stand-in fills, the same shape the session fixtures use. */
const SCENE = 'radial-gradient(120% 80% at 30% 70%, #3f5f92 0%, #2f4a75 60%, #1f2c55 100%)'

/** The normal case: a phone capture, centred at its own shape, with the room
 *  beside it filled by a blurred blow-up of the same frame. */
export const Portrait: Story = {
  args: { scene: SCENE, orientation: 'portrait' },
  render: (args) => (
    <div style={{ width: 440 }}>
      <RecordingWell {...args} />
    </div>
  ),
}

/** The exception — a tablet build, or an emulator run rotated. The footage is
 *  the well, with no ambience to fill because nothing is left over. */
export const Landscape: Story = {
  args: { scene: SCENE, orientation: 'landscape' },
  render: (args) => (
    <div style={{ width: 640 }}>
      <RecordingWell {...args} />
    </div>
  ),
}

/** No frame yet. Real on a live session: 6labs knows which screen the agent is
 *  on before it has the picture of it. Never an empty box (reads as broken) and
 *  never the previous screen's frame (a wrong answer, which is worse). */
export const WaitingForTheFrame: Story = {
  args: {
    orientation: 'portrait',
    pendingLabel: 'Waiting for the frame',
    pendingNote: '6labs has the AI player on this screen — the picture of it is a beat behind.',
  },
  render: (args) => (
    <div style={{ width: 440 }}>
      <RecordingWell {...args} />
    </div>
  ),
}

/** The same wait on a landscape capture. The silhouette takes the pane's own
 *  shape from the well's orientation, so it is never the wrong device. */
export const WaitingForTheFrameLandscape: Story = {
  args: {
    orientation: 'landscape',
    pendingLabel: 'Waiting for the frame',
    pendingNote: '6labs has the AI player on this screen — the picture of it is a beat behind.',
  },
  render: (args) => (
    <div style={{ width: 440 }}>
      <RecordingWell {...args} />
    </div>
  ),
}

/** Thumbnail scale — the filmstrip under the session transport, and the cards
 *  in a run's Videos grid. Same anatomy, cheaper: a 104px tile cannot carry a
 *  36px blur radius forty times over. */
export const Thumbnails: Story = {
  args: { scene: SCENE, orientation: 'portrait', compact: true },
  render: (args) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: 'relative', width: 104, height: 62, borderRadius: 8, overflow: 'hidden' }}>
          <RecordingWell {...args} scene={i === 2 ? undefined : args.scene} fill />
        </div>
      ))}
    </div>
  ),
}

/** A real still needs no orientation told to it — contained, it keeps its own
 *  shape, and the ambience is the same file covering the box. This is how a
 *  library of mixed footage works, where nothing knows a clip's shape until its
 *  still arrives. */
export const RealStillInAMixedLibrary: Story = {
  args: { orientation: 'landscape' },
  render: (args) => (
    <div style={{ display: 'flex', gap: 16 }}>
      {[
        { label: 'Portrait source', src: makeStill(200, 420) },
        { label: 'Landscape source', src: makeStill(420, 200) },
      ].map((s) => (
        <figure key={s.label} style={{ margin: 0, width: 280 }}>
          <div style={{ position: 'relative', width: 280, aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 8 }}>
            <RecordingWell {...args} src={s.src} compact fill />
          </div>
          <figcaption style={{ font: '400 12px/1.5 Inter, sans-serif', paddingTop: 8, color: '#4F566C' }}>
            {s.label}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
}

/** A stand-in still, drawn rather than shipped — the point of the story is the
 *  geometry, and a fixture image would only be a second thing to keep in sync. */
function makeStill(w: number, h: number): string {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  if (!g) return ''
  const grd = g.createLinearGradient(0, 0, w, h)
  grd.addColorStop(0, '#3f5f92')
  grd.addColorStop(1, '#1f2c55')
  g.fillStyle = grd
  g.fillRect(0, 0, w, h)
  g.fillStyle = 'rgba(255,220,130,0.5)'
  g.fillRect(w * 0.06, h * 0.05, w * 0.34, h * 0.03)
  g.fillStyle = 'rgba(255,255,255,0.28)'
  g.fillRect(w * 0.44, h * 0.05, w * 0.2, h * 0.03)
  return c.toDataURL()
}
