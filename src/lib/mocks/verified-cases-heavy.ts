/**
 * Text-heavy verification fixtures — the suite that actually breaks layouts.
 *
 * The default fixture is a well-behaved one: one-line reasons, one or two
 * steps, preconditions that fit on a line. Real regression files written by a
 * QA lead do not look like that. A payments or account-migration case carries a
 * paragraph of setup, a multi-clause expected result, and eight to twelve steps
 * where half of them have their own observation.
 *
 * So this exists to be the state the card layout is judged on: the reason
 * clamps on the row, the Expected and Observed columns stay side by side and
 * readable at length, and the steps list stays scannable past step 9.
 *
 * Fourteen cases, so this suite pages too — at twelve it sat on a single page
 * and the pager never showed.
 */
import type { VerifiedCase, VerificationTotals } from '../types/testing'

export const TEXT_HEAVY_CASES: VerifiedCase[] = [
  {
    id: 'TC-9104',
    title: 'Restoring a lapsed subscription after a payment-method change re-grants every entitlement',
    category: 'Payments',
    path: 'Store › Subscriptions › Restore',
    outcome: 'fail',
    reason:
      'The restore completed and the badge returned, but the monthly gem grant, the ad-free flag and the two season-pass tiers were not re-applied — the account showed as subscribed while behaving as free-to-play for the rest of the session.',
    precondition:
      'An account with an expired monthly subscription, last billed 41 days before the run. The original payment method has been removed from the store account and replaced with a second card. The player has 2 of 8 season-pass tiers already claimed from the lapsed period, and the device has been cold-started at least once since the lapse so no entitlement is held in memory.',
    expected:
      'Tapping Restore re-validates the receipt against the new payment method, re-grants the monthly gem allowance for the current cycle, clears the ad flag, and restores both previously claimed season-pass tiers without re-awarding their rewards. The subscription badge appears on the profile, and the store shows the plan as active with the next billing date.',
    clip: 'qa-1107.mp4',
    clipRange: '11:02–14:38',
    steps: [
      { action: 'Cold-start the game on the account with the lapsed subscription', at: '11:02' },
      { action: 'Dismiss the "your subscription has ended" interstitial', at: '11:19' },
      { action: 'Open Store › Subscriptions from the main hub', at: '11:41' },
      {
        action: 'Confirm the plan is shown as expired with a Restore action',
        observed: 'Shown as expired. The Restore action sat below the fold and needed a scroll to reach.',
        at: '11:58',
      },
      { action: 'Tap Restore and complete the store re-authentication prompt', at: '12:24' },
      {
        action: 'Wait for the restore confirmation dialog',
        observed: 'Confirmation took 38 seconds with no progress indicator; the screen looked frozen.',
        at: '12:40',
      },
      {
        action: 'Check the profile for the subscription badge',
        observed: 'Badge returned correctly and the plan showed the next billing date.',
        at: '13:18',
      },
      {
        action: 'Open the currency drawer and check the monthly gem grant',
        observed: 'Gem balance unchanged. The monthly grant for the current cycle was never applied.',
        at: '13:35',
      },
      {
        action: 'Trigger an interstitial by finishing a stage',
        observed: 'A full-screen ad played, so the ad-free entitlement was not restored either.',
        at: '13:52',
      },
      {
        action: 'Open the season pass and check the two claimed tiers',
        observed: 'Both tiers showed as unclaimed and offered their rewards again.',
        at: '14:16',
      },
      { action: 'Return to Store › Subscriptions and re-read the plan state', at: '14:31' },
    ],
  },
  {
    id: 'TC-9117',
    title: 'Migrating a guest account to a linked account preserves inventory, mail and alliance membership',
    category: 'Account',
    path: 'Settings › Account › Link',
    outcome: 'review',
    reason:
      'Inventory and alliance membership survived the migration intact. Unread mail older than seven days did not appear on the linked account, and the recording ends before the mail sync window closes — so this cannot be called either way from this footage.',
    precondition:
      'A guest account at player level 34 with 11 unread mail items, of which 4 are older than seven days and 2 carry unclaimed attachments. The player is an officer in an alliance with an active rally, holds 3 stacks of event currency, and has never been linked to a platform account on this device.',
    expected:
      'After linking, the same player id is kept, the full inventory and event currency transfer, alliance rank and membership are unchanged, and all 11 mail items appear on the linked account with attachments still claimable.',
    clip: 'qa-1112.mp4',
    clipRange: '03:44–09:10',
    steps: [
      { action: 'Open Settings › Account on the guest account', at: '03:44' },
      { action: 'Record the pre-migration inventory, currency and mail counts', at: '04:02' },
      { action: 'Tap Link account and choose the platform provider', at: '04:51' },
      {
        action: 'Complete the provider sign-in on a fresh platform account',
        observed: 'Sign-in succeeded; the consent sheet took two attempts to dismiss.',
        at: '05:09',
      },
      { action: 'Accept the "this will link your progress" confirmation', at: '05:48' },
      {
        action: 'Wait for the migration to finish and the game to re-enter the hub',
        observed: 'Migration took 1m 12s and re-entered the hub without an error.',
        at: '06:03',
      },
      {
        action: 'Compare inventory and event currency against the pre-migration counts',
        observed: 'All three event currency stacks and the full inventory matched exactly.',
        at: '07:15',
      },
      {
        action: 'Open the alliance panel and check rank',
        observed: 'Still an officer; the active rally was still joinable.',
        at: '07:58',
      },
      {
        action: 'Open the mailbox and count unread items',
        observed: '7 of 11 unread items present. The 4 older than seven days were missing, including one with an unclaimed attachment.',
        at: '08:21',
      },
      {
        action: 'Force a mail refresh and re-count',
        observed: 'Still 7. The recording ends before the stated 15-minute sync window elapses.',
        at: '08:55',
      },
    ],
  },
  {
    id: 'TC-9121',
    title: 'A rally that fills while the host is disconnected still marches on schedule',
    category: 'Alliance',
    path: 'Alliance › Rally › Host',
    outcome: 'fail',
    reason:
      'The rally filled to capacity 40 seconds after the host lost connection and did not march at the scheduled time; it sat at full capacity until the host reconnected, at which point the timer restarted from the beginning rather than resuming.',
    precondition:
      'An alliance with at least six members online. The host has started a rally with a five-minute assembly timer against a level-4 target, three members have already joined, and the host device is put into airplane mode 90 seconds into the assembly window.',
    expected:
      'The rally continues on the server timer regardless of the host connection. When the assembly timer expires, the rally marches with whoever has joined, and the host sees the march already in progress on reconnect.',
    clip: 'qa-1118.mp4',
    clipRange: '22:05–29:47',
    steps: [
      { action: 'Host starts a rally against the level-4 target with a five-minute timer', at: '22:05' },
      { action: 'Three alliance members join in the first 60 seconds', at: '22:33' },
      { action: 'Put the host device into airplane mode at the 90-second mark', at: '23:35' },
      {
        action: 'Two further members join from their own devices',
        observed: 'Both joins succeeded and the rally reached capacity at 24:15.',
        at: '24:02',
      },
      {
        action: 'Wait for the assembly timer to expire',
        observed: 'Timer reached zero on the members’ devices; the rally did not march.',
        at: '27:05',
      },
      {
        action: 'Check the rally state from a joined member',
        observed: 'Shown as "waiting for host" with no countdown and no way to leave.',
        at: '27:31',
      },
      { action: 'Restore connectivity on the host device', at: '28:14' },
      {
        action: 'Observe the rally state after the host reconnects',
        observed: 'Timer restarted at five minutes from the beginning; members were not notified.',
        at: '28:40',
      },
      {
        action: 'Let the restarted timer run to zero',
        observed: 'Rally marched on the second timer, roughly six minutes later than scheduled.',
        at: '29:33',
      },
    ],
  },
  {
    id: 'TC-9133',
    title: 'Purchasing the starter bundle while a regional price change is in flight charges the displayed price',
    category: 'Payments',
    path: 'Store › Bundles',
    outcome: 'pass',
    reason:
      'The price shown at the moment of tap was the price charged, and the post-purchase receipt, the store confirmation and the in-game currency grant all agreed on it.',
    precondition:
      'A store catalogue with a scheduled regional price change for the starter bundle taking effect during the session. The device locale and store region are set to the affected region, the catalogue has been cached at the old price, and the player has never purchased this bundle.',
    expected:
      'The client either honours the cached price for this purchase or refreshes the catalogue and shows the new price before the confirmation sheet. Under no circumstance does the charged amount differ from the amount shown on the confirmation sheet.',
    clip: 'qa-1121.mp4',
    clipRange: '04:11–07:02',
    steps: [
      { action: 'Open the store with the catalogue cached at the pre-change price', at: '04:11' },
      { action: 'Let the scheduled price change take effect while the store is open', at: '04:48' },
      {
        action: 'Tap the starter bundle',
        observed: 'The catalogue refreshed and the tile updated to the new price before the sheet opened.',
        at: '05:20',
      },
      { action: 'Read the amount on the platform confirmation sheet', at: '05:44' },
      { action: 'Complete the purchase', at: '06:02' },
      {
        action: 'Compare the receipt, the store confirmation and the granted currency',
        observed: 'All three matched the refreshed price.',
        at: '06:38',
      },
    ],
  },
  {
    id: 'TC-9140',
    title: 'Switching device language mid-session re-localises live text without dropping the session',
    category: 'Localization',
    path: 'Settings › Language',
    outcome: 'review',
    reason:
      'Menus, tooltips and the store re-localised immediately, but three in-combat ability descriptions and the entire tutorial fallback stack stayed in the previous language until a cold start.',
    precondition:
      'An active session on a device set to en-US, with the player mid-way through the chapter 3 tutorial and one ability tooltip already opened and cached. The build ships full ko-KR and ja-JP string tables.',
    expected:
      'Changing the device language re-localises every visible surface at the next screen transition, keeps the session and the tutorial step intact, and does not require a restart to read the game in the new language.',
    clip: 'qa-1126.mp4',
    clipRange: '15:30–21:12',
    steps: [
      { action: 'Reach chapter 3 of the tutorial and open one ability tooltip', at: '15:30' },
      { action: 'Background the game and change the device language to ko-KR', at: '16:44' },
      {
        action: 'Return to the game',
        observed: 'Session survived and the tutorial step was preserved.',
        at: '17:02',
      },
      {
        action: 'Read the main hub, the store and the settings menu',
        observed: 'All fully localised to ko-KR.',
        at: '17:38',
      },
      {
        action: 'Re-open the cached ability tooltip',
        observed: 'Still in English. Two neighbouring ability descriptions were also unchanged.',
        at: '18:25',
      },
      {
        action: 'Advance the tutorial one step',
        observed: 'Tutorial copy stayed English through the remaining three steps of chapter 3.',
        at: '19:10',
      },
      { action: 'Cold-start the game and return to the same screens', at: '20:22' },
      {
        action: 'Re-read the tooltip and the tutorial',
        observed: 'Both correct in ko-KR after the restart.',
        at: '20:58',
      },
    ],
  },
  {
    id: 'TC-9152',
    title: 'A build queue that is full at the moment a speed-up is applied does not consume the item',
    category: 'Progression',
    path: 'Base › Build queue',
    outcome: 'blocked',
    reason:
      'The run could not reach the state: the test account never filled its build queue to the cap within the recorded session, so the speed-up was never applied against a full queue and no verdict can be read from this footage.',
    precondition:
      'A base with the build queue at its five-slot cap, every slot occupied by a structure with more than an hour remaining, and at least one 60-minute speed-up in the inventory. A sixth build must be queued and rejected before the speed-up is used.',
    expected:
      'Applying the speed-up against a full queue either applies it to the selected slot or is rejected with a message — but in the rejected case the item is not consumed and the inventory count is unchanged.',
    clip: 'qa-1130.mp4',
    clipRange: '31:18–33:02',
    steps: [
      { action: 'Open the base and count occupied build slots', at: '31:18' },
      {
        action: 'Attempt to fill the queue to the five-slot cap',
        observed: 'Only three slots could be filled — the account lacked the resources for the last two.',
        at: '31:52',
      },
      {
        action: 'Queue a sixth build to trigger the full-queue rejection',
        observed: 'Never reached. The queue was not full, so no rejection was produced.',
        at: '32:40',
      },
    ],
  },
  {
    id: 'TC-9161',
    title: 'A promo code redeemed while the store catalogue is refreshing grants exactly once',
    category: 'Payments',
    path: 'Store › Promo codes',
    outcome: 'fail',
    reason:
      'The code granted twice. The redemption fired against the cached catalogue and again against the refreshed one, and the second grant was not de-duplicated against the first.',
    precondition:
      'A single-use promo code worth 500 gems, never redeemed on this account. The store catalogue has been open long enough to be mid-refresh, and the device clock is within a second of the server so the refresh lands during the redemption window rather than before it.',
    expected:
      'The code is accepted once, grants 500 gems once, and is marked as used. A second attempt with the same code is refused with an "already redeemed" message and grants nothing.',
    clip: 'qa-1134.mp4',
    clipRange: '02:18–05:40',
    steps: [
      { action: 'Open the store and leave it open until the refresh is due', at: '02:18' },
      { action: 'Enter the promo code as the catalogue begins refreshing', at: '03:02' },
      {
        action: 'Read the confirmation toast',
        observed: 'Two toasts appeared, one behind the other, both reading "500 gems added".',
        at: '03:21',
      },
      {
        action: 'Check the gem balance against the pre-redemption count',
        observed: 'Balance up by 1,000, not 500.',
        at: '03:55',
      },
      {
        action: 'Re-enter the same code',
        observed: 'Correctly refused as already redeemed — the double grant came from the first attempt alone.',
        at: '04:30',
      },
      { action: 'Restart the client and re-check the balance', at: '05:10' },
    ],
  },
  {
    id: 'TC-9172',
    title: 'Reinstalling over an existing account restores the purchase history without re-charging',
    category: 'Account',
    path: 'Settings › Account › Restore',
    outcome: 'pass',
    reason:
      'Every entitlement returned, the purchase history matched line for line, and no charge was raised against the store account during the restore.',
    precondition:
      'An account with 7 completed purchases across three months, including one subscription and two consumable bundles. The app is deleted from the device rather than reset in-app, and the same store account is used for the reinstall.',
    expected:
      'After reinstalling and signing in, all 7 purchases are listed, the subscription is active with its original billing date, and the consumable bundles show as used rather than available.',
    clip: 'qa-1138.mp4',
    clipRange: '00:30–08:15',
    steps: [
      { action: 'Record the purchase history and entitlements before deleting', at: '00:30' },
      { action: 'Delete the app from the device', at: '01:52' },
      { action: 'Reinstall and sign in with the same store account', at: '02:14' },
      {
        action: 'Complete the restore prompt on first launch',
        observed: 'Restore ran automatically without asking; entitlements were present before the hub loaded.',
        at: '04:40',
      },
      {
        action: 'Compare the purchase history line for line',
        observed: 'All 7 matched, including dates and amounts.',
        at: '06:02',
      },
      {
        action: 'Check the store account for any charge raised during the restore',
        observed: 'No charge.',
        at: '07:38',
      },
    ],
  },
  {
    id: 'TC-9183',
    title: 'An alliance disbanding while a member is in its shop returns the member cleanly',
    category: 'Alliance',
    path: 'Alliance › Shop',
    outcome: 'review',
    reason:
      'The member was returned to the hub without a crash and kept their currency, but an alliance-shop item bought in the final second was neither delivered nor refunded, and the footage ends before the reconciliation window closes.',
    precondition:
      'An alliance with one officer and one member, the member browsing the alliance shop with at least 400 alliance coins. The officer disbands the alliance while the member has a purchase confirmation open.',
    expected:
      'The member is returned to the hub with a notice, keeps their personal currency, and any in-flight alliance purchase is either delivered or refunded before the session ends.',
    clip: 'qa-1141.mp4',
    clipRange: '12:04–16:50',
    steps: [
      { action: 'Member opens the alliance shop and selects a 400-coin item', at: '12:04' },
      { action: 'Officer disbands the alliance from the management panel', at: '13:20' },
      {
        action: 'Member confirms the purchase in the same second',
        observed: 'Confirmation accepted; the panel closed without an error.',
        at: '13:22',
      },
      {
        action: 'Observe where the member lands',
        observed: 'Returned to the hub with a "your alliance was disbanded" notice.',
        at: '13:41',
      },
      {
        action: 'Check alliance coins and the inventory for the item',
        observed: '400 coins gone, item not present. No refund notice in mail.',
        at: '15:10',
      },
      {
        action: 'Wait out the stated ten-minute reconciliation window',
        observed: 'Recording ends at 16:50, four minutes short of the window.',
        at: '16:20',
      },
    ],
  },
  {
    id: 'TC-9194',
    title: 'Gifting an item to a blocked player is refused before the currency is spent',
    category: 'Account',
    path: 'Social › Gifts',
    outcome: 'fail',
    reason:
      'The gift was refused, correctly, but the 250-gem cost had already been deducted and was not returned within the session.',
    precondition:
      'Two accounts where account A has blocked account B. Account B holds 250 gems and attempts to send a gift to A from the friends list, which still shows A because the block is one-directional and not surfaced to the blocked party.',
    expected:
      'The gift is refused with a neutral message that does not reveal the block, and no currency is deducted at any point.',
    clip: 'qa-1147.mp4',
    clipRange: '07:55–10:20',
    steps: [
      { action: 'Account A blocks account B from the profile menu', at: '07:55' },
      { action: 'Account B opens the friends list and selects A', at: '08:30' },
      {
        action: 'Send a 250-gem gift',
        observed: 'Gems deducted immediately, before any server response.',
        at: '08:58',
      },
      {
        action: 'Read the refusal message',
        observed: '"This player cannot receive gifts right now" — neutral, as specified.',
        at: '09:14',
      },
      {
        action: 'Check the sending account balance',
        observed: 'Still down 250. No refund arrived before the recording ended.',
        at: '09:52',
      },
    ],
  },
  {
    id: 'TC-9205',
    title: 'Switching to a slower network mid-download resumes rather than restarting the resource fetch',
    category: 'Progression',
    path: 'Launch › Resource download',
    outcome: 'pass',
    reason:
      'The fetch resumed from its last committed chunk on every network change, and the total bytes transferred matched a clean single-network download within the expected margin.',
    precondition:
      'A fresh install at the resource-download step with roughly 1.2GB left to fetch. The device can move between wifi and cellular without dropping the session, and the download has already committed at least 200MB before the first switch.',
    expected:
      'Each network change pauses and resumes the fetch from the last committed chunk, the progress bar never moves backwards, and the download completes without re-fetching what it already has.',
    clip: 'qa-1152.mp4',
    clipRange: '00:10–09:30',
    steps: [
      { action: 'Start the resource download on wifi and let it pass 200MB', at: '00:10' },
      {
        action: 'Switch to cellular mid-chunk',
        observed: 'Progress paused for 3 seconds, then continued from the same percentage.',
        at: '02:44',
      },
      {
        action: 'Switch back to wifi',
        observed: 'Resumed again; the bar did not move backwards.',
        at: '05:16',
      },
      { action: 'Let the download finish and read the total transferred', at: '08:02' },
      {
        action: 'Compare against a clean single-network download',
        observed: 'Within 4MB — no meaningful re-fetch.',
        at: '09:12',
      },
    ],
  },
  {
    id: 'TC-9216',
    title: 'A season ending mid-match settles the match on the old season rules',
    category: 'Progression',
    path: 'Arena › Season rollover',
    outcome: 'blocked',
    reason:
      'The run could not reach the state: no match was in progress at the scheduled rollover in this footage, so the settlement rules were never exercised and no verdict can be read.',
    precondition:
      'An arena match in progress at the exact moment a season ends, with the player holding a rank that would change tier under the brackets the new season introduces.',
    expected:
      'The match settles under the season it started in, the rank change applies to the old ladder, and the new placement is calculated from the settled result.',
    clip: 'qa-1156.mp4',
    clipRange: '21:00–22:18',
    steps: [
      { action: 'Queue for an arena match two minutes before the rollover', at: '21:00' },
      {
        action: 'Wait for a match to be found',
        observed: 'Queue took 3m 20s; the season had already rolled over before a match started.',
        at: '21:34',
      },
      {
        action: 'Retry inside the same window',
        observed: 'Never reached — the recording ends before a second rollover.',
        at: '22:05',
      },
    ],
  },
  {
    id: 'TC-9227',
    title: 'Accessibility text scaling at 200% keeps every primary action reachable',
    category: 'Localization',
    path: 'Settings › Accessibility',
    outcome: 'review',
    reason:
      'Every primary action stayed reachable and no label was clipped, but three confirmation dialogs lost their body text behind their own buttons and had to be scrolled to read.',
    precondition:
      'Device text scaling set to 200% before launch, on a 5.8-inch screen at the narrowest supported width. The account is past the tutorial so the full hub, store and settings surfaces are reachable.',
    expected:
      'Every primary action remains visible and tappable, no label is clipped or truncated to meaninglessness, and dialogs scroll rather than hiding their own content.',
    clip: 'qa-1160.mp4',
    clipRange: '04:20–13:05',
    steps: [
      { action: 'Launch at 200% scaling and walk the hub', at: '04:20' },
      {
        action: 'Open the store and check every tile and price',
        observed: 'All legible; two tiles wrapped to three lines but nothing was clipped.',
        at: '06:02',
      },
      {
        action: 'Open settings and walk every section',
        observed: 'All rows reachable; the section list scrolled correctly.',
        at: '08:15',
      },
      {
        action: 'Trigger the purchase confirmation dialog',
        observed: 'Body text sat behind the buttons and needed a scroll to read.',
        at: '10:30',
      },
      {
        action: 'Trigger the logout and the delete-account confirmations',
        observed: 'Same pattern on both — buttons over the text.',
        at: '11:48',
      },
    ],
  },
  {
    id: 'TC-9238',
    title: 'Clearing the local cache leaves cloud saves untouched and re-downloads only what is missing',
    category: 'Account',
    path: 'Settings › Storage',
    outcome: 'pass',
    reason:
      'Cloud progress was untouched, the re-download fetched only the cleared assets, and the account returned to the same hub state it left.',
    precondition:
      'An account at player level 51 with roughly 800MB of cached assets and a cloud save written within the last five minutes. Clearing is done from the in-game storage panel rather than the OS settings.',
    expected:
      'Clearing removes local assets only. Progress, inventory and settings come back from the cloud save, and the re-download fetches the cleared assets and nothing more.',
    clip: 'qa-1164.mp4',
    clipRange: '01:05–06:44',
    steps: [
      { action: 'Note the cache size, player level and inventory', at: '01:05' },
      { action: 'Clear the cache from Settings › Storage', at: '02:20' },
      {
        action: 'Confirm the warning and wait for the re-download',
        observed: 'Fetched 790MB — close to what was cleared, nothing extra.',
        at: '02:48',
      },
      {
        action: 'Compare level, inventory and settings against the pre-clear notes',
        observed: 'All identical, including graphics and audio preferences.',
        at: '06:10',
      },
    ],
  },
]

/**
 * Totals sized to this fixture's shape rather than the default one: a smaller,
 * slower, deeper suite where a much larger share of the file went unreached.
 */
export const TEXT_HEAVY_TOTALS: VerificationTotals = {
  run: 214,
  total: 486,
  videos: 6,
  pass: 168,
  fail: 23,
  blocked: 9,
  review: 14,
}
