/**
 * Tag origin for Gameplay Library clips.
 *
 * A library tag comes from one of two places, and conflating them is what
 * makes a mixed library illegible:
 *
 *   - `system` — applied by the platform at ingest. The batch or build the
 *     clip belongs to, the release stage, the kind of test that produced it.
 *     Nobody typed these; they are structured, they always carry a facet, and
 *     they are the axis a test picks its footage along. Not user-editable.
 *   - `user`   — free text somebody added, at upload or later via Add tag.
 *     "onboarding", "regression", "frost-festival". Open-ended vocabulary.
 *
 * The distinction is carried in three places: the pill treatment on the card
 * (outlined + facet prefix vs. filled bare label), the grouped tag rail, and
 * the sectioned Tags block in the details panel. It also decides what the bulk
 * Add-tag dialog is allowed to offer — you cannot hand-apply a batch.
 *
 * Filtering itself is by LABEL, not by origin: the rail groups by origin but a
 * selected label matches a clip regardless of which side it was tallied on.
 *
 * Code-first prototype — no Figma source yet.
 */
import { STAGE_LABEL, TEST_TYPE_LABEL, type LibraryTestType, type VideoStage } from './librarySource'

export type LibraryTagOrigin = 'system' | 'user'

/** Which structured axis a system tag names. User tags have no facet. */
export type LibraryTagFacet = 'batch' | 'stage' | 'test-type'

export interface LibraryTag {
  label: string
  origin: LibraryTagOrigin
  /** Present on system tags only — rendered as the muted prefix on the pill. */
  facet?: LibraryTagFacet
}

/** Pill prefix — "Batch · Build V2.2" reads as assigned, not typed. */
export const TAG_FACET_LABEL: Record<LibraryTagFacet, string> = {
  batch: 'Batch',
  stage: 'Stage',
  'test-type': 'Test',
}

/** Rail group headings — short, they share a fixed-width column */
export const ORIGIN_GROUP_LABEL: Record<LibraryTagOrigin, string> = {
  system: 'Assigned',
  user: 'Your tags',
}

/** Details-panel section headings — longer, since the panel has the room */
export const ORIGIN_SECTION_LABEL: Record<LibraryTagOrigin, string> = {
  system: 'Applied automatically',
  user: 'Added by you',
}

// ── Constructors ──────────────────────────────────────────────────────────────

export const batchTag = (label: string): LibraryTag => ({ label, origin: 'system', facet: 'batch' })
export const stageTag = (stage: VideoStage): LibraryTag => ({
  label: STAGE_LABEL[stage],
  origin: 'system',
  facet: 'stage',
})
export const testTypeTag = (t: LibraryTestType): LibraryTag => ({
  label: TEST_TYPE_LABEL[t],
  origin: 'system',
  facet: 'test-type',
})
export const userTag = (label: string): LibraryTag => ({ label, origin: 'user' })

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Accepts the legacy `string[]` shape — bare strings are user tags. */
export function toLibraryTags(tags: readonly (string | LibraryTag)[] = []): LibraryTag[] {
  return tags.map((t) => (typeof t === 'string' ? userTag(t) : t))
}

export const tagLabels = (tags: readonly LibraryTag[]): string[] => tags.map((t) => t.label)

/** System tags lead — the batch is the anchor, the user's words qualify it. */
export function partitionTags(tags: readonly LibraryTag[]): Record<LibraryTagOrigin, LibraryTag[]> {
  return {
    system: tags.filter((t) => t.origin === 'system'),
    user: tags.filter((t) => t.origin === 'user'),
  }
}

/** What a pill reads: "Batch · Build V2.2" for system, "onboarding" for user. */
export const tagDisplay = (t: LibraryTag): string =>
  t.facet ? `${TAG_FACET_LABEL[t.facet]} · ${t.label}` : t.label

/**
 * Rail label for a tag known only by its text. Batch names are distinctive
 * enough to stand alone ("Build V2.2"), but the stage and test-type
 * vocabularies are short generic words — a bare "AI" or "CBT" pill sitting
 * among build names reads as a batch nobody recognises, so those keep their
 * facet even when the group heading already says the tags are assigned.
 */
export function railLabel(label: string, facetByLabel: Record<string, LibraryTagFacet | undefined>): string {
  const facet = facetByLabel[label]
  return facet && facet !== 'batch' ? `${TAG_FACET_LABEL[facet]} · ${label}` : label
}

export const hasTagLabel = (tags: readonly LibraryTag[], label: string): boolean =>
  tags.some((t) => t.label.toLowerCase() === label.toLowerCase())
