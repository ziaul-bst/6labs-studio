/**
 * GameplayRecorderView — the Gameplay Recorder page, a child of the Gameplay
 * Library (`#/testing/library/recorder`). Reached from the Library's "Get
 * recorder" button and from User Test's empty state.
 *
 * It answers, in order, what a studio needs to get footage in without touching
 * its build:
 *
 *   1. I have it installed — what do I type in?     → Connect card (App ID)
 *   2. What is it?                                   → Hero + example window
 *   3. Where does the footage go after that?        → How it works
 *   4. Can I get it for my platform?                → Platform support
 *
 * The connect card leads, above the explanation, because the reader who comes
 * back to this page is the one standing at a test machine with the Recorder
 * open and a field asking for an App ID.
 *
 * Every link goes where the PM prototype's did — the installer on 6labs' CDN,
 * docs.6labs.ai/recorder, back to the Library — except the last stage's, which
 * the PM moved from Oracle to the Testing module (2026-09-28 review). The
 * hero's "Download for Windows" scrolls to the platform list rather than
 * downloading; the list is where the version and architecture are stated.
 *
 * It is a landing page, so it is dressed like one: the Soft ground, the
 * product's pill eyebrows, and colour that carries meaning — warm for the one
 * stage on the studio's own machine, brand for the two on 6labs, green for what
 * is already done or guaranteed.
 *
 * The App ID and game are the workspace's own (`ACTIVE_GAME`) — the same pair
 * the Upload modal's CLI command prints — so the two ways in never disagree.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { PageTopbar } from '../molecules/PageTopbar'
import { RecorderWorkflowDemo } from '../molecules/RecorderWorkflowDemo'
import { FieldLabel } from '../molecules/TestingSetupPieces'
import { showToast } from '../atoms/Toast'
import Button from '../ui/Button'
import LinkButton from '../ui/LinkButton'
import { CheckIcon } from '../icons/CheckIcon'
import { CopyIcon } from '../icons/CopyIcon'
import { DownloadIcon } from '../icons/DownloadIcon'
import { InfoFilledIcon } from '../icons/InfoFilledIcon'
import { LogoMark } from '../icons/LogoMark'
import { VideoLibraryIcon } from '../icons/VideoLibraryIcon'
import { WindowsIcon } from '../icons/WindowsIcon'
import { AndroidIcon } from '../icons/AndroidIcon'
import { AppleIcon } from '../icons/AppleIcon'
import { ACTIVE_GAME, type ActiveGame } from '../../lib/activeGame'
import { copyToClipboard } from '../../lib/clipboard'
import { RECORDER_ARCH, RECORDER_DOCS_URL, RECORDER_DOWNLOAD_URL, RECORDER_VERSION } from '../../lib/recorder'
import { TESTING_ACCENT_VARS } from '../../lib/studioAreas'

export interface GameplayRecorderViewProps {
  /** The chevron and the "Gameplay Library" crumb. */
  onBack: () => void
  /** "Open Gameplay Library" in How it works. */
  onOpenLibrary: () => void
  /** "Open Testing module" in How it works — the Testing area's front door. */
  onOpenTesting: () => void
  /** The workspace's game. Defaults to the active one. */
  game?: ActiveGame
  className?: string
}

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const

const CARD: CSSProperties = {
  backgroundColor: 'var(--bg-elements)',
  border: '1px solid var(--border-subtle)',
  boxShadow: 'var(--shadow-sm)',
}

export function GameplayRecorderView({
  onBack,
  onOpenLibrary,
  onOpenTesting,
  game = ACTIVE_GAME,
  className,
}: GameplayRecorderViewProps) {
  const downloadsRef = useRef<HTMLElement>(null)
  const windowsDownloadRef = useRef<HTMLAnchorElement>(null)

  /* Not an `<a href="#…">` — the studio is hash-routed, so a fragment would be
     read as a route and navigate away. Focus follows the scroll so a keyboard
     reader lands on the download rather than back at the top of the page. */
  const jumpToDownloads = () => {
    const el = downloadsRef.current
    if (!el) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    windowsDownloadRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className={['recorder-page flex flex-col w-full min-h-full', className].filter(Boolean).join(' ')}>
      <PageTopbar title="Gameplay Recorder" trail={[{ label: 'Gameplay Library', onClick: onBack }]} onBack={onBack} />

      <div className="flex-1 w-full">
        {/* Spacing grows with distance in meaning: 8 label→heading, 16 inside a
            text group, 24 tile→text and between the two top cards, 32 before
            actions and from an intro to its content, 64 between sections. */}
        <div className="flex flex-col gap-xxl3 page-measure pt-xxl pb-xxl4">
          <h1 className="sr-only">Gameplay Recorder</h1>

          <div className="flex flex-col gap-xl">
            <ConnectCard game={game} />
            <Hero onDownload={jumpToDownloads} />
          </div>

          <HowItWorks onOpenLibrary={onOpenLibrary} onOpenTesting={onOpenTesting} />

          <Downloads sectionRef={downloadsRef} windowsDownloadRef={windowsDownloadRef} />
        </div>
      </div>
    </div>
  )
}

// ── 1. Connect a test machine ────────────────────────────────────────────────

function ConnectCard({ game }: { game: ActiveGame }) {
  const titleId = useId()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(t)
  }, [copied])

  /* Confirmed the way every copy in the studio is — the toast (a status
     region, so it is also what a screen reader hears) — while the icon flips
     to a check for the same 1.6s. The label used to say "Copied" itself. */
  const copy = async () => {
    if (!(await copyToClipboard(game.appId))) return
    setCopied(true)
    showToast('App ID copied')
  }

  /* One plain white surface, the product's card. The App ID field is the only
     colour on it: this is a utility for the reader who is back with the
     Recorder open, so it stays quieter than the hero, and the one tinted thing
     is the thing to take. (It was a tint band stopping hard at a white column —
     two cards glued together — and then a brand wash behind a tile that is now
     grey, tinting nothing in particular.)
     The App ID is a read-only field with its copy action inside, the way a value
     you are meant to take away is drawn elsewhere (CodeBlock). Label, field and
     confirmation share one left edge, so the alignment never depends on a
     digit's side bearing or a pill's padding. */
  return (
    <section aria-labelledby={titleId} className="recorder-host w-full rounded-3xl overflow-hidden" style={CARD}>
      <div className="recorder-connect">
        <div className="flex items-start gap-s min-w-0">
          {/* A quiet grey tile — the card's colour belongs to the App ID. */}
          <span
            className="flex items-center justify-center shrink-0 w-8 h-8 rounded-m text-text-secondary"
            style={{ backgroundColor: 'var(--bg-page-pale)', border: '1px solid var(--border-subtle)' }}
            aria-hidden
          >
            <InfoFilledIcon size={16} />
          </span>
          <div className="flex flex-col items-start gap-s min-w-0">
            <div className="flex flex-col gap-xxs">
              <h2 id={titleId} className="font-display text-m font-semibold text-text-primary leading-[1.4]">
                Connect a test machine
              </h2>
              <p className="font-body text-s text-text-secondary leading-[1.55] max-w-[60ch]">
                Paste this App ID into the Recorder. Every session from that machine lands in the {game.name} library.
              </p>
            </div>
            <a
              href={RECORDER_DOCS_URL}
              {...EXTERNAL}
              className="font-body text-s font-semibold text-text-brand leading-[1.5] hover:underline"
            >
              Setup guide ↗
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-s min-w-0">
          <div className="flex flex-col gap-xs">
            <FieldLabel>App ID</FieldLabel>
            {/* Icon-only copy: a copy glyph inside the value's own field is the
                convention (keys, clone URLs, code blocks), so the context names
                it and the ID stays the loudest thing here. Right inset = the
                vertical one — (58 − 2px border − 32) / 2 = 12 — so the button
                sits square in the field. */}
            <div
              className="flex items-center gap-m h-[58px] pl-m pr-s rounded-xl"
              style={{ backgroundColor: 'var(--bg-tint-light)', border: '1px solid var(--border-tint)' }}
            >
              <code className="flex-1 min-w-0 font-code text-2xl font-semibold text-text-primary tracking-[0.04em] tabular-nums leading-none">
                {game.appId}
              </code>
              <Button
                variant="transparent"
                size="md"
                iconOnly
                onClick={copy}
                aria-label="Copy App ID"
                title="Copy App ID"
                style={{ color: copied ? 'var(--success)' : 'var(--text-brand)' }}
              >
                {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              </Button>
            </div>
          </div>
          {/* The line starts on text, so it lines up with the label; the
              confirmed game carries the colour, inline. */}
          <span className="flex items-center gap-xxs flex-wrap font-body text-xs text-text-tertiary leading-[1.5]">
            Recorder confirms
            <span
              className="inline-flex items-center gap-xxs rounded-round px-xs font-display font-semibold uppercase tracking-[0.1em]"
              style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
            >
              <CheckIcon size={12} />
              {game.name}
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}

// ── 2. Hero ──────────────────────────────────────────────────────────────────

const HERO_TICKS = [
  "Configure each device with your game's App ID and recording settings.",
  'Review uploaded sessions in the Gameplay Library.',
  'Windows x64 available. Android and iOS planned.',
]

function Hero({ onDownload }: { onDownload: () => void }) {
  /* The Library's own colour for the identity tile — this page is one of its
     children — and a brand wash opposite it, the way the studio ground pairs
     its hues. */
  const purple = TESTING_ACCENT_VARS.purple
  return (
    <section className="recorder-host relative overflow-hidden rounded-4xl p-xxl2" style={CARD}>
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(70% 90% at 0% 0%, color-mix(in srgb, var(--purple) 12%, transparent) 0%, transparent 70%), ' +
            'radial-gradient(60% 80% at 100% 100%, color-mix(in srgb, var(--brand) 10%, transparent) 0%, transparent 70%)',
        }}
        aria-hidden
      />
      <div className="recorder-hero relative">
        <div className="flex flex-col gap-xxl min-w-0">
          <div className="flex flex-col items-start gap-xl">
            <span
              className="flex items-center justify-center shrink-0 w-14 h-14 rounded-2xl text-white"
              style={{ background: purple.gradient, boxShadow: '0 10px 24px color-mix(in srgb, var(--purple) 28%, transparent)' }}
              aria-hidden
            >
              <RecordGlyph size={24} />
            </span>

            <div className="flex flex-col items-start gap-m">
              <div className="flex flex-col items-start gap-xs">
                <Eyebrow>Gameplay Recorder</Eyebrow>
                <h2 className="font-display text-3xl font-extrabold text-text-primary leading-[1.12] tracking-[-0.02em] text-balance">
                  Record playtest sessions <em className="not-italic text-text-brand">without changing your build</em>
                </h2>
              </div>
              <p className="font-body text-m text-text-secondary leading-[1.65]">
                6labs Gameplay Recorder runs in the background on test machines. Recording starts when the configured
                game launches and stops when it exits. The Recorder then uploads the session to 6labs.
              </p>
              {/* The guarantee, said as a claim rather than a line of body copy. */}
              <span
                className="inline-flex items-center gap-xs rounded-xl pl-xxs pr-s py-xxs font-body text-s font-semibold text-text-primary leading-[1.5]"
                style={{
                  backgroundColor: 'var(--success-bg)',
                  border: '1px solid color-mix(in srgb, var(--success) 22%, transparent)',
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0 w-5 h-5 rounded-round text-white"
                  style={{ backgroundColor: 'var(--success)' }}
                  aria-hidden
                >
                  <CheckIcon size={12} />
                </span>
                No SDK, engine plugin, or build changes required.
              </span>
            </div>
          </div>

          {/* One button, one link: the download is the ask, the docs are the
              quieter way to read more — two filled buttons side by side read as
              two asks, and they no longer fit one row once the hero goes two-up. */}
          <div className="flex items-center gap-s flex-wrap">
            <Button variant="primary" size="lg" leftIcon={<DownloadIcon size={20} />} onClick={onDownload}>
              Download for Windows
            </Button>
            <LinkButton variant="link" size="lg" href={RECORDER_DOCS_URL} {...EXTERNAL}>
              Recorder documentation
            </LinkButton>
          </div>

          <ul className="flex flex-col gap-s">
            {HERO_TICKS.map((tick) => (
              <li key={tick} className="flex items-start gap-s font-body text-s text-text-secondary leading-[1.55]">
                <span
                  className="flex items-center justify-center shrink-0 w-5 h-5 mt-[1px] rounded-round"
                  style={{ backgroundColor: 'var(--bg-tint)', color: 'var(--brand)' }}
                  aria-hidden
                >
                  <CheckIcon size={12} />
                </span>
                {tick}
              </li>
            ))}
          </ul>
        </div>

        <RecorderWorkflowDemo />
      </div>
    </section>
  )
}

// ── 3. How it works ──────────────────────────────────────────────────────────

type FlowTone = 'machine' | 'sixlabs'

/* Where each stage runs is the point of the band — the legend under it says it
   in words. The stage on the studio's own machine is warm (the PM prototype's
   choice); the two on 6labs wear the product's brand. Warm is built from
   --warning plus the token-gap mixes in globals.css (`.recorder-page`). */
const FLOW_TONE: Record<
  FlowTone,
  { line: string; headBg: string; numBg: string; numInk: string; kicker: string; tileBg: string; tileInk: string; dot: string }
> = {
  machine: {
    line: 'var(--recorder-warm-line)',
    headBg: 'var(--recorder-warm-tint)',
    numBg: 'var(--warning)',
    numInk: 'var(--text-primary)',
    kicker: 'var(--recorder-warm-ink)',
    tileBg: 'var(--recorder-warm-tint)',
    tileInk: 'var(--recorder-warm-ink)',
    dot: 'var(--warning)',
  },
  sixlabs: {
    line: 'var(--border-tint)',
    headBg: 'var(--bg-tint-light)',
    numBg: 'var(--brand)',
    numInk: 'var(--text-on-brand)',
    kicker: 'var(--text-brand)',
    tileBg: 'var(--bg-tint-light)',
    tileInk: 'var(--brand)',
    dot: 'var(--brand)',
  },
}

interface FlowStage {
  tone: FlowTone
  kicker: string
  product: string
  place: string
  icon: ReactNode
  steps: { title: string; detail: string }[]
  link: ReactNode
}

function HowItWorks({ onOpenLibrary, onOpenTesting }: { onOpenLibrary: () => void; onOpenTesting: () => void }) {
  const titleId = useId()
  const stages: FlowStage[] = [
    {
      tone: 'machine',
      kicker: 'Recording & upload',
      product: 'Gameplay Recorder',
      place: 'On your test machine',
      icon: <RecordGlyph />,
      steps: [
        { title: 'Install & setup', detail: "Configure the Recorder with your game's App ID." },
        { title: 'Gameplay recording', detail: 'Records gameplay video and user actions. Starts when the configured game launches.' },
        { title: 'Upload', detail: 'Uploads in the background when the game exits.' },
      ],
      link: (
        <LinkButton variant="outline" size="md" pill href={RECORDER_DOCS_URL} {...EXTERNAL}>
          Recorder documentation ↗
        </LinkButton>
      ),
    },
    {
      tone: 'sixlabs',
      kicker: 'Video collection',
      product: 'Gameplay Library',
      place: 'On 6labs',
      icon: <VideoLibraryIcon size={20} />,
      steps: [
        { title: 'Videos land live', detail: 'Sessions appear within a few minutes.' },
        { title: 'Collection check', detail: 'Check which sessions have been uploaded.' },
      ],
      link: (
        <Button variant="outline" size="md" pill onClick={onOpenLibrary}>
          Open Gameplay Library
        </Button>
      ),
    },
    {
      tone: 'sixlabs',
      kicker: 'Processing & analysis',
      product: '6labs Studio',
      place: 'On 6labs',
      /* The product's own mark — this stage is 6labs itself, not one feature of it. */
      icon: <LogoMark size={24} />,
      steps: [
        { title: 'Session processing', detail: 'Sessions are then processed and prepared at regular intervals.' },
        { title: 'Query in Studio', detail: 'Use 6labs to ask questions about the sessions and receive answers with video references.' },
      ],
      link: (
        <Button variant="outline" size="md" pill onClick={onOpenTesting}>
          Open Testing module
        </Button>
      ),
    },
  ]

  return (
    <section aria-labelledby={titleId} className="recorder-host flex flex-col gap-xxl">
      <SectionIntro
        titleId={titleId}
        eyebrow="How it works"
        title="From recording to session review"
        lede="The Recorder captures gameplay on your test machine. Uploaded sessions appear in the Gameplay Library and become available to query in Studio after processing."
      />

      <div className="flex flex-col gap-l">
        <ol className="recorder-flow w-full list-none m-0 p-0">
          {stages.map((stage, i) => {
            const t = FLOW_TONE[stage.tone]
            return [
              i > 0 && (
                <li key={`arrow-${i}`} className="recorder-flow-arrow text-text-tertiary" aria-hidden>
                  <span
                    className="flex items-center justify-center w-8 h-8 rounded-round"
                    style={{
                      backgroundColor: 'var(--bg-elements)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </li>
              ),
              <li
                key={stage.kicker}
                className="flex flex-col min-w-0 rounded-3xl overflow-hidden"
                style={{ backgroundColor: 'var(--bg-elements)', border: `1px solid ${t.line}`, boxShadow: 'var(--shadow-sm)' }}
              >
                <div
                  className="flex items-center gap-xs px-l py-s"
                  style={{ backgroundColor: t.headBg, borderBottom: `1px solid ${t.line}` }}
                >
                  <span
                    className="flex items-center justify-center shrink-0 w-7 h-7 rounded-round font-display text-xs font-bold tabular-nums"
                    style={{ backgroundColor: t.numBg, color: t.numInk }}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <h3 className="font-display text-xs font-semibold uppercase tracking-[0.1em] leading-[1.5]" style={{ color: t.kicker }}>
                    {stage.kicker}
                  </h3>
                </div>

                <div className="flex flex-col flex-1 p-l">
                  <div className="flex items-center gap-s min-w-0 pb-l" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <span
                      className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl"
                      style={{ backgroundColor: t.tileBg, border: `1px solid ${t.line}`, color: t.tileInk }}
                      aria-hidden
                    >
                      {stage.icon}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="font-display text-m font-semibold text-text-primary leading-[1.4] truncate">{stage.product}</span>
                      <span className="font-body text-xs text-text-tertiary leading-[1.5]">{stage.place}</span>
                    </span>
                  </div>

                  <ul className="flex flex-col gap-m pt-l">
                    {stage.steps.map((step) => (
                      <li key={step.title} className="flex gap-xs min-w-0">
                        <span className="shrink-0 mt-[7px] w-[6px] h-[6px] rounded-round" style={{ backgroundColor: t.dot }} aria-hidden />
                        <span className="flex flex-col gap-xxxs min-w-0">
                          <span className="font-display text-s font-semibold text-text-primary leading-[1.45]">{step.title}</span>
                          <span className="font-body text-xs text-text-secondary leading-[1.55]">{step.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex mt-auto pt-xl">{stage.link}</div>
                </div>
              </li>,
            ]
          })}
        </ol>

        {/* The legend: the footer's two sentences, each wearing its stages' colour. */}
        <p className="flex flex-wrap items-center gap-x-l gap-y-xs font-body text-xs text-text-tertiary leading-[1.5]">
          <span className="inline-flex items-center gap-xs">
            <i className="inline-block shrink-0 w-2 h-2 rounded-round" style={{ backgroundColor: FLOW_TONE.machine.dot }} aria-hidden />
            Recording runs on your test machines.
          </span>
          <span className="inline-flex items-center gap-xs">
            <i className="inline-block shrink-0 w-2 h-2 rounded-round" style={{ backgroundColor: FLOW_TONE.sixlabs.dot }} aria-hidden />
            The Gameplay Library and Studio run on 6labs.
          </span>
        </p>
      </div>
    </section>
  )
}

/**
 * Record mark — a ring and a dot, drawn as two boxes rather than a path.
 * STAND-IN: Apparatus has no record glyph yet; replace with its export once added.
 */
function RecordGlyph({ size = 18 }: { size?: number }) {
  /* Dot and gap in whole pixels on both sides, or the dot snaps a pixel off
     centre: the ring's content is size − 2×2px border, the dot half of that
     rounded to an even number. 18 → 8px dot in 14; 24 → 10px in 20. */
  const dot = Math.round((size - 4) / 4) * 2
  return (
    <span className="flex items-center justify-center rounded-round" style={{ width: size, height: size, border: '2px solid currentColor' }}>
      <span className="block rounded-round bg-current" style={{ width: dot, height: dot }} />
    </span>
  )
}

// ── 4. Platform support ──────────────────────────────────────────────────────

function Downloads({
  sectionRef,
  windowsDownloadRef,
}: {
  sectionRef: RefObject<HTMLElement>
  windowsDownloadRef: RefObject<HTMLAnchorElement>
}) {
  const titleId = useId()
  return (
    <section
      ref={sectionRef}
      aria-labelledby={titleId}
      className="flex flex-col gap-xxl"
      /* Clears the 56px sticky topbar with room to spare. */
      style={{ scrollMarginTop: 80 } as CSSProperties}
    >
      <SectionIntro
        titleId={titleId}
        eyebrow="Downloads"
        title="Platform support"
        lede="The Windows build is available now. Android and iOS are planned."
      />

      <ul className="grid gap-m w-full list-none m-0 p-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <PlatformTile
          featured
          icon={<WindowsIcon size={20} />}
          name="Windows"
          detail={`${RECORDER_ARCH} · ${RECORDER_VERSION}`}
          action={
            <LinkButton
              ref={windowsDownloadRef}
              href={RECORDER_DOWNLOAD_URL}
              variant="primary"
              size="md"
              leftIcon={<DownloadIcon size={16} />}
              {...EXTERNAL}
            >
              Download
            </LinkButton>
          }
        />
        <PlatformTile icon={<AndroidIcon size={20} />} name="Android" action={<SoonChip />} />
        <PlatformTile icon={<AppleIcon size={20} />} name="iOS" action={<SoonChip />} />
      </ul>
    </section>
  )
}

/**
 * The one platform you can have today is lit — brand ground, gradient tile —
 * and the planned ones are drawn in dashed outline, the studio's mark for
 * "not here yet" (the purchasable area tab uses the same).
 */
function PlatformTile({
  icon,
  name,
  detail,
  action,
  featured,
}: {
  icon: ReactNode
  name: string
  detail?: string
  action: ReactNode
  featured?: boolean
}) {
  return (
    <li
      className="flex items-center gap-s min-h-[80px] rounded-3xl px-l py-m"
      style={
        featured
          ? {
              /* The border is opaque, mixed from brand and white. The
                 translucent --border-tint all but vanished against the tint
                 where the gradient is strongest, so the top-left edge read as
                 clipped. White base under the tint; an even shadow, because an
                 offset glow left the top edge bare. */
              background: 'linear-gradient(135deg, var(--bg-tint-light) 0%, transparent 70%), var(--bg-elements)',
              border: '1px solid color-mix(in srgb, var(--brand) 28%, var(--bg-elements))',
              boxShadow: 'var(--shadow-sm)',
            }
          : { backgroundColor: 'var(--bg-elements)', border: '1px dashed var(--border-default)' }
      }
    >
      <span
        className={['flex items-center justify-center shrink-0 w-10 h-10 rounded-xl', featured ? 'text-white' : 'text-text-secondary'].join(' ')}
        style={
          featured
            ? { background: TESTING_ACCENT_VARS.brand.gradient, boxShadow: 'var(--shadow-sm)' }
            : { backgroundColor: 'var(--bg-page-pale)' }
        }
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex flex-col items-start gap-xxxs flex-1 min-w-0">
        <span className="font-display text-s font-semibold text-text-primary leading-[1.4] truncate">{name}</span>
        {detail && (
          <span
            className="px-xs py-xxxs rounded-xs font-code text-2xs text-text-secondary leading-[1.5]"
            style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-tint)' }}
          >
            {detail}
          </span>
        )}
      </span>
      <span className="shrink-0">{action}</span>
    </li>
  )
}

/** The Overview's SOON chip, spelled out — "planned" is the claim, not a date. */
function SoonChip() {
  return (
    <span
      className="inline-flex items-center px-xs py-xxxs rounded-xs font-display text-2xs font-semibold uppercase tracking-[0.12em] leading-[1.5]"
      style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
    >
      Coming soon
    </span>
  )
}

// ── Shared ───────────────────────────────────────────────────────────────────

/**
 * The studio's small-caps eyebrow, plain. It began as the Testing Overview's
 * hero pill (white fill, tint border, glow), then a dot-led label; both drew
 * more attention than a label should and were cut on review (2026-09-28).
 * The eyebrow names the section — the heading under it is the thing to read.
 */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary leading-[1.5]">
      {children}
    </span>
  )
}

/** Left-aligned like every heading in the studio; capped for line length only. */
function SectionIntro({ titleId, eyebrow, title, lede }: { titleId: string; eyebrow: string; title: string; lede: string }) {
  return (
    <div className="flex flex-col items-start gap-s max-w-[720px]">
      <div className="flex flex-col items-start gap-xs">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={titleId} className="font-display text-xl font-extrabold text-text-primary leading-[1.2] tracking-[-0.015em] text-balance">
          {title}
        </h2>
      </div>
      <p className="font-body text-m text-text-secondary leading-[1.6] text-pretty">{lede}</p>
    </div>
  )
}
