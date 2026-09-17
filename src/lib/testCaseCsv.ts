/**
 * testCaseCsv — a verification report as a spreadsheet.
 *
 * Export used to be a button with nothing behind it. What it has to produce is
 * not a picture of the table on screen: a QA lead exports a run to paste it
 * back into the tracker the cases came from, so the file carries every column
 * the report holds — including the ones the table has no room for (the
 * precondition, the expected result, the steps) and the ones the case modal
 * deliberately stops showing (the clip and its range). The screen is a reading
 * surface; the file is the record.
 *
 * Column order follows the case file's own shape — what was asked for, then
 * what happened — so a row lines up with the sheet it was written from.
 *
 * Outcomes are written with the names CASE_OUTCOME_STYLE gives them ("Pass",
 * "Failed", "Need review", "Not verified") rather than the internal keys, so
 * the export and the screen cannot disagree about what a case was scored.
 *
 * Code-first prototype — no Figma source yet.
 */

import { CASE_OUTCOME_STYLE } from '../components/atoms/CaseOutcomeTag'
import type { VerifiedCase } from './types/testing'

/* Quotes every field rather than only the ones that need it. A reason can
   contain a comma, a newline or a quote, and a writer that decides per field
   is a writer that is one unusual sentence away from a corrupt file. */
function cell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`
}

const COLUMNS = [
  'ID',
  'Test case',
  'Category',
  'Path',
  'Precondition',
  'Expected result',
  'Steps',
  'Result',
  'Reason',
  'Observed',
  'Clip',
  'Clip range',
] as const

/**
 * The steps as one cell, numbered and timestamped — "1. Tap close on the
 * privacy notice (01:14)". Excel shows a multi-line cell as one line until the
 * row is expanded, which is the right default for a column nobody sorts on.
 */
function stepsCell(c: VerifiedCase): string {
  return c.steps.map((s, i) => `${i + 1}. ${s.action} (${s.at})`).join('\n')
}

/**
 * What the footage showed at each step, where it differs from what was asked
 * for. Kept out of the case modal — there it only repeated the Result field —
 * but it is the per-step evidence, and a file that drops it cannot be used to
 * re-check a verdict away from the app.
 */
function observedCell(c: VerifiedCase): string {
  return c.steps
    .map((s, i) => (s.observed ? `${i + 1}. ${s.observed}` : null))
    .filter(Boolean)
    .join('\n')
}

export function casesToCsv(cases: VerifiedCase[]): string {
  const rows = cases.map((c) =>
    [
      c.id,
      c.title,
      c.category,
      c.path,
      c.precondition,
      c.expected,
      stepsCell(c),
      CASE_OUTCOME_STYLE[c.outcome].label,
      c.reason,
      observedCell(c),
      c.clip,
      c.clipRange,
    ]
      .map(cell)
      .join(','),
  )
  return [COLUMNS.map(cell).join(','), ...rows].join('\r\n')
}

/** "Season 9 — core loop" → "season-9-core-loop-cases.csv". */
export function csvFileName(runName: string): string {
  const slug = runName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'test-run'}-cases.csv`
}

/**
 * Hands the file to the browser. The BOM is not decoration: without it Excel
 * on Windows reads the file as the system codepage and the em dashes and "×"
 * in every run name come back as mojibake.
 */
export function downloadCsv(fileName: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
