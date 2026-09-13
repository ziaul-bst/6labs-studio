/**
 * runDate — the one date format the Testing area uses.
 *
 * A Date column holds a date. "now" and "just now" are statuses wearing a
 * date's clothes: they answer a different question from the one the column
 * asks, they stop being true a minute later, and a reader scanning a column of
 * "Sep 7 / Aug 26 / now" has to change units halfway down. Whether a run is
 * still going is already said by its spinner, its row tint and its status
 * pill, so the date is free to just be a date.
 *
 * Code-first prototype — no Figma source yet.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "Sep 14". Same shape as the seeded fixtures, so new rows sort in visually. */
export function runDateLabel(date: Date = new Date()): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}
