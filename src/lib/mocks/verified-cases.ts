/**
 * Verification fixtures — the cases a functional report lists, and the totals
 * above them. Matches the reference flow (`user-test-agent-flow-v128.html`).
 *
 * Outcomes are deliberately mixed inside a category: a suite that passes or
 * fails as a block would do the reader's filtering for them, and real suites
 * never behave that way.
 */

import type { VerifiedCase, VerificationTotals } from '../types/testing'

export const VERIFIED_CASES: VerifiedCase[] = [
  {
    id: 'TC-8889',
    title: 'Privacy notice close button exits with a toast',
    category: 'Startup notices',
    path: 'Launch › First run',
    outcome: 'fail',
    reason: 'Game closed with no toast shown.',
    precondition: 'Resource download complete',
    expected: 'Toast is shown, then the game closes.',
    clip: 'qa-0902.mp4',
    clipRange: '01:14–01:31',
    steps: [
      {
        action: 'Tap close on the privacy notice',
        observed: 'Game closed with no toast shown.',
        at: '01:14',
      },
    ],
  },
  {
    id: 'TC-8810',
    title: 'Age-14 popup is not shown in non-KR locales',
    category: 'Startup notices',
    path: 'Launch › First run',
    outcome: 'fail',
    reason: 'Popup shown where the case requires it be suppressed.',
    precondition: 'Device locale set to en-US',
    expected: 'No age popup appears on first launch.',
    clip: 'qa-0904.mp4',
    clipRange: '00:22–00:48',
    steps: [
      { action: 'Launch the game on a fresh install', at: '00:22' },
      {
        action: 'Read the first-run dialog stack',
        observed: 'Age-14 popup appeared in an en-US locale.',
        at: '00:36',
      },
    ],
  },
  {
    id: 'TC-8821',
    title: 'Game Center login restores the existing account',
    category: 'Title screen',
    path: 'Launch › Title screen',
    outcome: 'review',
    reason: 'Account restored, but a duplicate profile was created.',
    precondition: 'An account already linked to this Game Center id',
    expected: 'The linked account is restored, with no new profile.',
    clip: 'qa-0911.mp4',
    clipRange: '02:05–03:12',
    steps: [
      { action: 'Tap Sign in with Game Center', at: '02:05' },
      {
        action: 'Confirm the restore prompt',
        observed: 'Progress restored; a second profile appeared in the account list.',
        at: '02:44',
      },
    ],
  },
  {
    id: 'TC-8898',
    title: 'Skill cooldown prevents an immediate second use',
    category: 'Skills',
    path: 'Combat › Skills',
    outcome: 'pass',
    reason: 'Cooldown enforced correctly.',
    precondition: 'Hero with a 12s cooldown skill, in combat',
    expected: 'The second activation is rejected until the cooldown ends.',
    clip: 'qa-0915.mp4',
    clipRange: '05:31–05:49',
    steps: [
      { action: 'Use the skill, then tap it again immediately', at: '05:31' },
      { action: 'Wait out the cooldown and use it again', at: '05:43' },
    ],
  },
  {
    id: 'TC-8822',
    title: 'Revive item cannot be used twice in one encounter',
    category: 'Encounter',
    path: 'Combat › Encounter',
    outcome: 'fail',
    reason: 'Second revive was accepted.',
    precondition: 'Two revive items in inventory, one encounter in progress',
    expected: 'The second revive is refused for the rest of the encounter.',
    clip: 'qa-0915.mp4',
    clipRange: '09:02–09:40',
    steps: [
      { action: 'Revive after the first defeat', at: '09:02' },
      {
        action: 'Revive again in the same encounter',
        observed: 'Second revive consumed and applied.',
        at: '09:28',
      },
    ],
  },
  {
    id: 'TC-8839',
    title: 'Combat rewards match the listed drop table',
    category: 'Encounter',
    path: 'Combat › Encounter',
    outcome: 'review',
    reason: 'Only two clears present — cannot establish a drop table.',
    precondition: 'Chapter 2 encounter with a published drop table',
    expected: 'Rewards fall inside the published table across clears.',
    clip: 'qa-0917.mp4',
    clipRange: '11:48–13:02',
    steps: [
      {
        action: 'Clear the encounter and read the reward sheet',
        observed: 'Both clears sit inside the table, but two clears is not a sample.',
        at: '11:48',
      },
    ],
  },
  {
    id: 'TC-1102',
    title: 'Alliance join request is sent',
    category: 'Alliance',
    path: 'Post-tutorial › Alliance',
    outcome: 'pass',
    reason: 'Request sent and acknowledged.',
    precondition: 'Player not in an alliance, alliance list loaded',
    expected: 'The request is sent and the row shows as pending.',
    clip: 'qa-0921.mp4',
    clipRange: '03:10–03:27',
    steps: [{ action: 'Tap Join on an open alliance', at: '03:10' }],
  },
  {
    id: 'TC-86',
    title: 'Battle Pass premium purchase',
    category: 'Store',
    path: 'Store › Purchase',
    outcome: 'fail',
    reason: 'Purchase confirmed but entitlement not granted.',
    precondition: 'Sandbox payment account with sufficient balance',
    expected: 'The premium track unlocks immediately after confirmation.',
    clip: 'qa-0923.mp4',
    clipRange: '02:14–02:41',
    steps: [
      { action: 'Buy the premium pass and confirm', at: '02:14' },
      {
        action: 'Return to the Battle Pass screen',
        observed: 'Sheet closed with no confirmation toast; the track is still locked.',
        at: '02:33',
      },
    ],
  },
  {
    id: 'TC-14',
    title: 'Furnace upgrade from tutorial hint',
    category: 'Progression',
    path: 'Tutorial › Furnace',
    outcome: 'fail',
    reason: 'Button unresponsive until the hint overlay times out.',
    precondition: 'Tutorial reached the Furnace upgrade step',
    expected: 'The upgrade button responds as soon as the hint points at it.',
    clip: 'qa-0902.mp4',
    clipRange: '06:41–07:12',
    steps: [
      {
        action: 'Tap Upgrade while the hint pointer is showing',
        observed: 'Taps swallowed for ~2s by the hint overlay.',
        at: '06:41',
      },
      { action: 'Tap again after the overlay clears', at: '06:58' },
    ],
  },
  {
    id: 'TC-15',
    title: 'Daily quest reset at 00:00 UTC',
    category: 'Progression',
    path: 'Systems › Daily',
    outcome: 'blocked',
    reason: 'Reset time could not be reached in the session.',
    precondition: 'Session running across the UTC day boundary',
    expected: 'Quests reset and the list repopulates at 00:00 UTC.',
    clip: 'qa-0925.mp4',
    clipRange: '—',
    steps: [
      {
        action: 'Hold the session across 00:00 UTC',
        observed: 'No recording covers the boundary.',
        at: '—',
      },
    ],
  },
  {
    id: 'TC-81',
    title: 'Complete the tutorial on a fresh install',
    category: 'Onboarding',
    path: 'Launch › First run',
    outcome: 'pass',
    reason: 'Completed cleanly.',
    precondition: 'Fresh install, no saved account',
    expected: 'The tutorial runs end to end with no blocking state.',
    clip: 'qa-0904.mp4',
    clipRange: '00:48–14:20',
    steps: [{ action: 'Play the tutorial to completion', at: '00:48' }],
  },
  {
    id: 'TC-19',
    title: 'Leave alliance during rally',
    category: 'Alliance',
    path: 'Alliance › Rally',
    outcome: 'review',
    reason: 'Left mid-rally; state after leaving unclear.',
    precondition: 'Player joined a rally that is still marching',
    expected: 'Leaving returns the troops and removes the player from the rally.',
    clip: 'qa-0921.mp4',
    clipRange: '08:12–08:55',
    steps: [
      {
        action: 'Leave the alliance while the rally is marching',
        observed: 'Player removed; the recording ends before the troops return.',
        at: '08:12',
      },
    ],
  },
]

/**
 * Totals for the verification header. `run` is lower than `total` on purpose —
 * a report that only counted what it managed to check would hide the cases the
 * footage never reached, which is the first thing a QA lead asks about.
 */
export const VERIFICATION_TOTALS: VerificationTotals = {
  run: 1247,
  total: 1956,
  videos: 18,
  pass: 1186,
  fail: 31,
  blocked: 18,
  review: 12,
}
