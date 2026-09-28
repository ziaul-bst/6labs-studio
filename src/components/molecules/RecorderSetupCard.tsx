/**
 * RecorderSetupCard — the Gameplay Library's nudge toward the Recorder: a
 * one-row card under the page header with a direct Windows download.
 *
 * Distinct from the header's "Get recorder" button, which opens the Recorder
 * page (what it is, how it works, the App ID). This card is for the reader who
 * already knows and wants the installer, so its one action is the download
 * itself, not another page.
 *
 * Hideable, for the session only — a nudge somebody has read should get out of
 * the way of the library, and the header button stays as the way back to it.
 * The flag lives in `lib/recorder.ts` so it survives the Library unmounting.
 *
 * Code-first prototype — no Figma source yet. Copy is the PM prototype's.
 */
import Button from '../ui/Button'
import LinkButton from '../ui/LinkButton'
import { DownloadIcon } from '../icons/DownloadIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { RECORDER_DOWNLOAD_URL } from '../../lib/recorder'

export interface RecorderSetupCardProps {
  /** Omit to render the card without a hide control. */
  onHide?: () => void
  className?: string
}

export function RecorderSetupCard({ onHide, className }: RecorderSetupCardProps) {
  return (
    <section
      aria-label="Gameplay Recorder"
      className={['flex items-center gap-m flex-wrap w-full rounded-3xl pl-s pr-m py-s', className].filter(Boolean).join(' ')}
      style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
    >
      <RecThumb />

      <div className="flex flex-col gap-xxxs flex-1 min-w-[240px]">
        <h2 className="font-display text-m font-semibold text-text-primary leading-[1.4]">
          Record playtests &amp; analyze without changing your build
        </h2>
        <p className="font-body text-s text-text-secondary leading-[1.55]">
          Install on a Windows test machine. Sessions upload here automatically.
        </p>
      </div>

      <div className="flex items-center gap-xs shrink-0">
        <LinkButton
          href={RECORDER_DOWNLOAD_URL}
          variant="primary"
          size="md"
          leftIcon={<DownloadIcon size={16} />}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download for Windows
        </LinkButton>
        {onHide && (
          <Button variant="transparent" size="md" iconOnly onClick={onHide} aria-label="Hide" title="Hide">
            <CloseIcon size={16} />
          </Button>
        )}
      </div>
    </section>
  )
}

/**
 * A small dark frame with a REC chip — footage being captured, drawn in the
 * library's own thumbnail vocabulary (dark scene, translucent overlay chip,
 * the pulsing live dot) rather than as an icon.
 */
function RecThumb() {
  return (
    <span
      className="relative block shrink-0 w-[72px] h-[48px] rounded-l overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #243A6B 0%, #15224A 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
      aria-hidden
    >
      <span className="absolute inset-x-0 top-0 h-[12px]" style={{ backgroundColor: 'rgba(255,255,255,0.10)' }} />
      <span
        className="absolute left-xs bottom-xs inline-flex items-center gap-xxs px-xxs rounded-s font-display text-2xs font-bold text-white leading-[1.5]"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      >
        <i className="agent-live-dot" style={{ width: 6, height: 6, color: 'var(--error)' }} />
        REC
      </span>
    </span>
  )
}
