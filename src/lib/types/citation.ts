/**
 * Oracle citation types.
 *
 * A response asserts claims grounded in gameplay video and warehouse tables.
 * A citation makes a claim checkable by pointing at the exact evidence — a
 * moment inside a video, or the rows behind a number.
 *
 * Citations cluster heavily in real responses ("[4][5][17][18][23][27][29][50]"
 * supporting one table cell), which is why hover preview carries the primary
 * load: navigating per chip is unusable at that density.
 */

export type CitationKind = 'video' | 'table'

export interface VideoCitation {
  /** The bracket number rendered in prose — `[28]` */
  n: number
  kind: 'video'
  /** Session id this citation points at */
  videoId: string
  /** Segments backing the claim; the first is the landing target */
  segmentIds: string[]
  /** Exact span within those segments to highlight */
  quote?: string
  /** Human-readable clip name shown in the preview header */
  label?: string
}

export interface TableCitation {
  n: number
  kind: 'table'
  /** Fully-qualified name, e.g. PLATSH.PLATSH.CHURN */
  tableFqn: string
  /** Warehouse this table lives in, shown above the rows */
  warehouse?: string
  /** Column order for the preview table */
  columns: string[]
  /** The rows the claim rests on */
  rows: Array<Record<string, string>>
  /** `column:value` of the cell the claim rests on, highlighted in the preview */
  highlightCell?: { column: string; value: string }
  /** Total row count in the underlying result, for "2 of 171 rows" */
  totalRows?: number
}

export type Citation = VideoCitation | TableCitation
