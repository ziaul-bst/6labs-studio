/**
 * PlanLockedBanner — the top bar of a test the plan does not include.
 *
 * A locked test opens as itself: its header, the New run composer with every
 * control off (SetupLock), and a Run history holding one sample report. This
 * bar is what says why, and offers the two ways on — the Agents Guide for
 * someone still deciding, sales for someone who has.
 *
 * It is the content region's top edge, full bleed and outside the scroll, so it
 * stays put while the page scrolls and follows the reader into the sample
 * report. Its text sits on the page measure, sharing the header's left edge.
 *
 * Grey — see .plan-locked-banner for why.
 *
 * Code-first prototype — no Figma source yet.
 */

import Button from '../ui/Button'
import LinkButton from '../ui/LinkButton'
import { LockIcon } from '../icons/LockIcon'

/** The Agents Guide — how each test works, on the public site. */
export const PRODUCT_GUIDE_URL = 'https://6labs.ai/product/index.html'

export interface PlanLockedBannerProps {
  /** The locked test, as the sidebar names it — "Functional test". */
  testLabel: string
  /** Where "See how it works" goes. Default: the Agents Guide. */
  guideHref?: string
  /** Opens the address to mail — see ContactSalesDialog. */
  onContactSales?: () => void
  className?: string
}

export function PlanLockedBanner({
  testLabel,
  guideHref = PRODUCT_GUIDE_URL,
  onContactSales,
  className,
}: PlanLockedBannerProps) {
  return (
    <div className={['plan-locked-banner', className].filter(Boolean).join(' ')}>
      <div className="page-measure flex items-center gap-s min-h-[56px] py-s">
        <span className="plan-locked-banner-mark" aria-hidden>
          <LockIcon size={16} />
        </span>
        <p className="flex-1 min-w-0 m-0 font-body text-s text-text-secondary leading-[1.5]">
          <strong className="font-semibold text-text-primary">{`Explore ${testLabel} in preview mode.`}</strong>{' '}
          Contact sales to unlock it and run your own tests.
        </p>
        <span className="flex items-center gap-xs shrink-0">
          {/* A link, not a button: it leaves the studio, so it gets a new tab
              and everything else a link gives for free. */}
          <LinkButton href={guideHref} target="_blank" rel="noopener noreferrer" variant="secondary" size="md">
            See how it works
          </LinkButton>
          <Button variant="primary" size="md" onClick={onContactSales}>
            Contact sales
          </Button>
        </span>
      </div>
    </div>
  )
}
