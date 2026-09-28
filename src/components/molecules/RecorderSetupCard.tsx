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
import { WindowsIcon } from '../icons/WindowsIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { RecordIcon } from '../icons/RecordIcon'
import { RECORDER_DOWNLOAD_URL } from '../../lib/recorder'
import { TESTING_ACCENT_VARS } from '../../lib/studioAreas'

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
      {/* The Recorder's own mark, in the tile the Recorder page opens with — the
          nudge and the page it leads to wear one identity. */}
      <span
        className="flex items-center justify-center shrink-0 w-12 h-12 rounded-xl text-white"
        style={{
          background: TESTING_ACCENT_VARS.purple.gradient,
          boxShadow: '0 6px 16px color-mix(in srgb, var(--purple) 24%, transparent)',
        }}
        aria-hidden
      >
        <RecordIcon size={24} />
      </span>

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
          leftIcon={<WindowsIcon size={16} />}
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

