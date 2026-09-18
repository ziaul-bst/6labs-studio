/**
 * VideoLibraryView — Gameplay Library, the Testing area's video corpus. Every
 * recording, from every source: tester sessions from the Recorder app, CLI
 * batches from a build machine, ad-hoc browser uploads, SDK captures from a
 * beta, and the sessions the AI tests play themselves.
 *
 * A video is either still arriving or it is here: uploading → ready | failed.
 * There is no analysing step and no Ready badge (removed 2026-09-10) — nothing
 * runs over library footage after the transfer, so the old "only Ready clips
 * are referenceable" gate, its banner and its per-card badge all described a
 * pipeline that does not exist. Failure now means the upload failed, and Retry
 * retries the upload.
 *
 * Revamp 2026-09-09 (artifact s42):
 *   - Filtering is two rows, both lifted from the session picker so the two
 *     surfaces read as one library: a tag rail of count-bearing pills (the
 *     open-ended, multi-select axis), then a search and a single segmented
 *     control for source. Stage, test type and status were selects here until
 *     2026-09-09; batch and source are how footage is actually found, and four
 *     dropdowns beside a pill rail read as two filter systems in one card.
 *   - One flat grid, newest first (2026-09-11). Videos were sectioned by
 *     batch · source · stage until then, which restated the tag rail directly
 *     above it and the badges on every card, and forced a "Select batch"
 *     control per header — a third way to do what the rail and the card
 *     checkboxes already did. Selection is per card plus the bulk bar; there is
 *     no select-all.
 *   - A clip nobody has tagged shows a dashed "Add tags" pill where its user
 *     tags would sit, so an empty tag slot reads as an invitation instead of
 *     as nothing.
 *   - Tags carry their ORIGIN (2026-09-10). System tags — the batch or build a
 *     clip came in on — are applied by the platform and render outlined with
 *     their facet ("Batch · Build V2.2"); user tags are free text somebody
 *     typed and render as filled neutral pills. The rail groups the two, and
 *     the bulk Add-tag dialog only offers user tags, since a batch is not
 *     something you hand-apply. Filtering is still by label, so a selected
 *     pill matches regardless of which side it was tallied on.
 *   - Source is a badge on the thumbnail (2026-09-10), the way the Radiologist
 *     marks a session's origin, rather than only prose in the meta line.
 *   - Selection is quiet until it exists: checkboxes rest hidden on the cards,
 *     and the bulk actions float in a bar at the bottom of the viewport only
 *     while something is selected — the toolbar never changes colour or shape.
 *     The bar keeps the two actions that belong to the corpus itself, tagging
 *     and deletion. Starting a run belongs to the test composer, which picks
 *     its own footage, and retrying a failed clip is a per-card action.
 *
 * Code-first prototype — no Figma source yet.
 */
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { VideoLibraryCard, type VideoStatus } from '../molecules/VideoLibraryCard'
import { AgentPageHeader } from '../molecules/AgentPageHeader'
import { LibraryVideoLightbox } from './LibraryVideoLightbox'
import { AddTagsDialog } from './AddTagsDialog'
import { PopupModal } from '../molecules/PopupModal'
import { UploadVideosModal } from './UploadVideosModal'
import { VideosEmptyState } from '../molecules/VideosEmptyState'
import { showToast } from '../atoms/Toast'
import { FilterPill } from '../atoms/FilterPill'
import { SegmentedControl } from '../atoms/SegmentedControl'
import Checkbox from '../ui/Checkbox'
import { TagOverflowMenu } from '../molecules/TagOverflowMenu'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { VideoLibraryIcon } from '../icons/VideoLibraryIcon'
import { UploadIcon } from '../icons/UploadIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { TrashIcon } from '../icons/TrashIcon'
import { PlusIcon } from '../icons/PlusIcon'
import { SearchIcon } from '../icons/SearchIcon'
import {
  SOURCE_ORDER,
  SOURCE_SHORT,
  type LibraryTestType,
  type VideoStage,
  type VideoUploadSource,
} from '../../lib/librarySource'
import {
  LONG_LABEL_BATCHES,
  LONG_LABEL_TITLES,
  LONG_LABEL_USER_TAGS,
  MANY_TAG_BATCHES,
  MANY_TAG_USER_TAGS,
  useLibraryDemoState,
  type LibraryDemoState,
} from '../../lib/libraryDemoState'
import {
  ORIGIN_GROUP_LABEL,
  batchTag,
  hasTagLabel,
  railLabel,
  stageTag,
  testTypeTag,
  userTag,
  type LibraryTag,
  type LibraryTagFacet,
  type LibraryTagOrigin,
} from '../../lib/libraryTags'

export interface LibraryVideo {
  id: string
  title: string
  sizeBytes: number
  durationLabel?: string
  thumbnailSrc?: string
  status: VideoStatus
  progress: number
  /** Origin-carrying tags — see lib/libraryTags. System tags are not user-editable. */
  tags: LibraryTag[]
  /** How the clip reached the library — drives the thumbnail badge and the source facet */
  source: VideoUploadSource
  /**
   * Who put it there. The library is company-wide, so a clip you did not upload
   * is the normal case and the card has to say whose it is.
   */
  uploadedBy?: string
  /** Release stage the footage is from. Defaults to pre-release. */
  stage?: VideoStage
  /** Which kind of test produced it. Defaults to user test. */
  testType?: LibraryTestType
  /** The batch the clip belongs to — a build or campaign name. Defaults to the first tag. */
  batch?: string
  error?: string
  addedAt: number
  /** seeded demo flag: this video's upload will fail */
  willFail?: boolean
}

/* The signed-in user, matching the sidebar profile. Their own uploads read
   "You" rather than their name — recognising your own rows in a company-wide
   library is worth more than consistency with the other rows. */
export const CURRENT_USER = 'Jonh Wick'

/* Teammates, so the seeded library looks like what a studio actually has:
   footage from several people, not one. */
const TEAMMATES = ['Priya Nair', 'Mohit Sharma', 'Elena Roth', 'Dan Whitfield']

const UPLOAD_FAIL_RATE = 0.18
/** Upload failure, not analysis failure — nothing analyses these clips. */
const UPLOAD_ERROR = 'Upload failed — the transfer was interrupted. Retry to upload again.'
/**
 * Tag pills shown on the rail, per origin, before the tail collapses into
 * "+N more". Budgeted per origin rather than as one top-by-count cut: system
 * counts run higher than user counts (a batch covers every clip in it), so a
 * single overall budget would fill the row with batches and bury every tag
 * anyone typed.
 *
 * Two, not more: the row also carries its label, the "+N more" tail and the
 * recency pill, and the whole point of merging the two origin rows was to get
 * back to one line. The tail is one click away and now says which group each
 * tag belongs to, so a short rail costs little.
 */
const MAX_TAG_PILLS = 2
/** Not a tag — the recency pill rides the same rail and the same select set. */
const RECENT_TAG = '__recent'
const GRADIENTS = [
  'linear-gradient(135deg, #1770EF 0%, #7B4CFF 100%)',
  'linear-gradient(135deg, #7B4CFF 0%, #C20568 100%)',
  'linear-gradient(135deg, #0D5ED4 0%, #16A34A 100%)',
  'linear-gradient(135deg, #C20568 0%, #FFB700 100%)',
]
let seq = 0
const nextId = () => `vid-${Date.now()}-${seq++}`

/** Deterministic gradient per video so the grid has rhythm but stays stable across filters */
function gradientFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return GRADIENTS[h % GRADIENTS.length]
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}


// ── Seed: the artifact's batches, mixed states and every source ──
let seedUploader = 0

function seedVideos(): LibraryVideo[] {
  const now = Date.now()
  const H = 1000 * 60 * 60
  const D = 24 * H
  /* System tags are derived, never hand-written into the seed: the batch always
     gets one, stage and test type only when they differ from the default — a
     "Stage · Pre-release" pill on all fourteen clips is noise, on the two CBT
     ones it is the point. `userTags` is the free text a person would have
     typed at upload. */
  const mk = (
    title: string,
    mb: number,
    dur: string,
    o: Partial<Omit<LibraryVideo, 'tags'>> & {
      source: VideoUploadSource
      batch: string
      ago: number
      userTags?: string[]
    },
  ): LibraryVideo => {
    const stage = o.stage ?? 'pre-release'
    const testType = o.testType ?? 'user-test'
    /* Rotate through the team unless a fixture names someone. AI-player clips
       have no human uploader — the test produced them — so they stay blank. */
    seedUploader += 1
    const uploadedBy =
      o.uploadedBy ??
      (o.source === 'ai-player' ? undefined : TEAMMATES[seedUploader % TEAMMATES.length])
    return {
      id: nextId(),
      title,
      sizeBytes: mb * 1024 * 1024,
      durationLabel: dur,
      status: 'ready',
      progress: 100,
      stage,
      testType,
      uploadedBy,
      ...o,
      tags: [
        batchTag(o.batch),
        ...(stage !== 'pre-release' ? [stageTag(stage)] : []),
        ...(testType !== 'user-test' ? [testTypeTag(testType)] : []),
        ...(o.userTags ?? []).map(userTag),
      ],
      addedAt: now - o.ago,
    }
  }
  return [
    mk('ut-0912 — first session walkthrough.mp4', 284, '12:04', { source: 'recorder', batch: 'Build V2.2', ago: 3 * H, userTags: ['onboarding'], uploadedBy: CURRENT_USER }),
    mk('ut-0911 — first session.mp4', 212, '9:41', { source: 'recorder', batch: 'Build V2.2', ago: 5 * H }),
    mk('ut-0904 — first session.mp4', 260, '11:18', { source: 'recorder', batch: 'Build V2.2', ago: 1 * D + 2 * H }),
    mk('ut-0910 — tutorial complete.mp4', 190, '8:20', { source: 'upload', batch: 'Tutorial', ago: 6 * H, userTags: ['onboarding'], uploadedBy: CURRENT_USER }),
    mk('ut-0899 — tutorial exit.mp4', 168, '7:52', { source: 'upload', batch: 'Tutorial', ago: 1 * D + 5 * H }),
    mk('ut-0908 — returning player.mp4', 341, '15:22', { source: 'cli', batch: 'New event', stage: 'cbt', ago: 8 * H, userTags: ['frost-festival'] }),
    mk('ut-0895 — event shop.mp4', 140, '6:10', { source: 'cli', batch: 'New event', stage: 'cbt', ago: 1 * D + 8 * H }),
    mk('ft-0301 — tutorial regression run 1.mp4', 402, '18:30', { source: 'recorder', batch: 'Build V2.2', testType: 'functional', ago: 2 * D, userTags: ['regression'] }),
    mk('ft-0302 — tutorial regression run 2.mp4', 230, '10:05', { source: 'recorder', batch: 'Build V2.2', testType: 'functional', ago: 2 * D + 1 * H, status: 'failed', error: UPLOAD_ERROR }),
    mk('aib-frost-01 — new player · agent 1.mp4', 120, '30:00', { source: 'ai-player', batch: 'Frost Festival', testType: 'ai', ago: 3 * D }),
    mk('aib-frost-02 — whale · agent 1.mp4', 118, '30:00', { source: 'ai-player', batch: 'Frost Festival', testType: 'ai', ago: 3 * D + 1 * H, userTags: ['whale'] }),
    mk('ut-0870 — day-3 session.mp4', 96, '6:40', { source: 'upload', batch: 'Build V2.1', stage: 'obt', ago: 6 * D, userTags: ['retention'] }),
    mk('ut-0891 — returning player.mp4', 402, '18:30', { source: 'recorder', batch: 'Build V2.1', ago: 9 * D }),
    mk('ut-0887 — first session.mp4', 230, '10:05', { source: 'recorder', batch: 'Build V2.1', ago: 9 * D + 2 * H }),
  ]
}

/**
 * Fixtures for the reviewer state pill. Each one is the default seed bent into
 * a state you cannot reach by clicking — see lib/libraryDemoState.
 */
function seedForDemoState(state: LibraryDemoState): LibraryVideo[] {
  if (state === 'empty') return []

  if (state === 'uploading') {
    return seedVideos().map((v, i) => ({
      ...v,
      status: 'uploading' as VideoStatus,
      /* Staggered so the row reads as a real batch arriving, not a progress
         bar stuck at one value. */
      progress: (i * 17) % 95,
      durationLabel: undefined,
      error: undefined,
      willFail: false,
    }))
  }

  if (state === 'failed') {
    return seedVideos().map((v) => ({
      ...v,
      status: 'failed' as VideoStatus,
      progress: 100,
      error: UPLOAD_ERROR,
    }))
  }

  /* Labels as an import writes them, mixed in with ordinary ones: the point of
     the state is the COMPARISON — a folded 40-character tag has to sit beside
     "Build V2.2" and still read as the same kind of thing. */
  if (state === 'long-labels') {
    const now = Date.now()
    const H = 1000 * 60 * 60
    return LONG_LABEL_BATCHES.map((batch, i) => ({
      id: nextId(),
      title: LONG_LABEL_TITLES[i % LONG_LABEL_TITLES.length],
      sizeBytes: (140 + i * 23) * 1024 * 1024,
      durationLabel: `${6 + i}:${String((i * 13) % 60).padStart(2, '0')}`,
      status: 'ready' as VideoStatus,
      progress: 100,
      source: SOURCE_ORDER[i % SOURCE_ORDER.length],
      batch,
      stage: 'pre-release' as VideoStage,
      testType: 'ai' as LibraryTestType,
      tags: [
        batchTag(batch),
        userTag(LONG_LABEL_USER_TAGS[i % LONG_LABEL_USER_TAGS.length]),
        userTag(LONG_LABEL_USER_TAGS[(i + 1) % LONG_LABEL_USER_TAGS.length]),
      ],
      addedAt: now - i * 5 * H,
    }))
  }

  if (state === 'many-tags') {
    const now = Date.now()
    const H = 1000 * 60 * 60
    /* One clip per batch, each carrying two user tags, so both sides of the
       "+N more" menu are long enough to scroll. */
    return MANY_TAG_BATCHES.map((batch, i) => ({
      id: nextId(),
      title: `ut-${1200 - i * 7} — ${batch.toLowerCase()} session.mp4`,
      sizeBytes: (120 + i * 11) * 1024 * 1024,
      durationLabel: `${4 + (i % 14)}:${String((i * 7) % 60).padStart(2, '0')}`,
      status: 'ready' as VideoStatus,
      progress: 100,
      source: SOURCE_ORDER[i % SOURCE_ORDER.length],
      batch,
      stage: (['pre-release', 'cbt', 'obt', 'live'] as VideoStage[])[i % 4],
      testType: (['user-test', 'functional', 'ai'] as LibraryTestType[])[i % 3],
      tags: [
        batchTag(batch),
        ...(i % 4 !== 0 ? [stageTag((['pre-release', 'cbt', 'obt', 'live'] as VideoStage[])[i % 4])] : []),
        userTag(MANY_TAG_USER_TAGS[i % MANY_TAG_USER_TAGS.length]),
        userTag(MANY_TAG_USER_TAGS[(i + 7) % MANY_TAG_USER_TAGS.length]),
      ],
      addedAt: now - i * 3 * H,
    }))
  }

  return seedVideos()
}

export interface VideoLibraryViewProps {
  className?: string
  /** Seed the library state directly — used by Storybook to show specific page states */
  initialVideos?: LibraryVideo[]
  /**
   * Reviewer state preset. Defaults to the shared store the state pill writes,
   * so the app needs no prop; pass it explicitly to pin a Storybook story.
   * Re-seeds on change, and `initialVideos` still wins.
   */
  demoState?: LibraryDemoState
}

type Facet<T extends string> = T | 'all'

export function VideoLibraryView({ className, initialVideos, demoState }: VideoLibraryViewProps) {
  const storeState = useLibraryDemoState()
  const state = demoState ?? storeState
  const [videos, setVideos] = useState<LibraryVideo[]>(() => initialVideos ?? seedForDemoState(state))
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null)
  /* Two filter axes, both borrowed from the session picker: the tag rail for
     the open-ended, multi-select axis, and one segmented control for source.
     Stage, test type and status were selects here; they narrowed a library
     that is already narrow once a batch is picked, and four dropdowns beside
     a pill rail read as two filter systems stacked. */
  const [sourceFacet, setSourceFacet] = useState<Facet<VideoUploadSource>>('all')
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  /* Which clips the tag dialog will write to. The bulk bar hands it the whole
     selection, a card's "Add tags" pill hands it just that clip — one dialog
     either way, so the two paths cannot drift apart. */
  const [tagTargetIds, setTagTargetIds] = useState<string[] | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [dropFiles, setDropFiles] = useState<File[] | undefined>(undefined)
  /* Player lightbox. Tracked by id, not by object, so a clip that finishes
     uploading while open picks up its new status. The details side panel lived
     here until 2026-09-10 — once it was file facts only it repeated the card
     it opened from, and charged a 420px column for it. */
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedVideo = selectedId ? videos.find((v) => v.id === selectedId) ?? null : null

  /* Re-seed when the reviewer flips the state pill. Everything derived from
     the old fixture goes with it — a tag filter naming a batch that no longer
     exists would leave the grid empty for no visible reason. Skipped on the
     first run and whenever the host passes explicit videos. */
  const seededFor = useRef(state)
  useEffect(() => {
    if (initialVideos || seededFor.current === state) return
    seededFor.current = state
    setVideos(seedForDemoState(state))
    setSelectedIds(new Set())
    setActiveTags(new Set())
    setSourceFacet('all')
    setQuery('')
    setSelectedId(null)
  }, [state, initialVideos])

  // ── Upload simulation: single ticking interval reads latest state ──
  useEffect(() => {
    const tick = window.setInterval(() => {
      setVideos((prev) => {
        let changed = false
        const next = prev.map((v) => {
          if (v.status !== 'uploading') return v
          changed = true
          const pct = Math.min(100, v.progress + 16)
          if (pct < 100) return { ...v, progress: pct }
          /* The transfer is the only thing that can fail now, so the verdict
             lands the moment it completes rather than after an analysis wait. */
          return v.willFail
            ? { ...v, progress: 100, status: 'failed' as VideoStatus, error: UPLOAD_ERROR }
            : { ...v, progress: 100, status: 'ready' as VideoStatus }
        })
        return changed ? next : prev
      })
    }, 450)
    return () => window.clearInterval(tick)
  }, [])

  // ── Upload flow — staging + tags handled in UploadVideosModal ──
  const existingNames = new Set(videos.map((v) => v.title.toLowerCase()))

  const openUpload = (files?: File[]) => {
    setDropFiles(files)
    setUploadOpen(true)
    setDragOver(false)
  }

  /* The first tag typed in the upload modal names the batch — that is what the
     group header and the run picker read — so it becomes the system tag. Every
     tag after it is the uploader's own vocabulary. */
  const commitUpload = (files: File[], tags: string[]) => {
    const stamp = Date.now()
    const [batch, ...rest] = tags
    const entries: LibraryVideo[] = files.map((f, i) => ({
      id: nextId(),
      title: f.name,
      sizeBytes: f.size || Math.floor(40 * 1024 * 1024 + Math.random() * 300 * 1024 * 1024),
      status: 'uploading',
      progress: 0,
      tags: [...(batch ? [batchTag(batch)] : []), ...rest.map(userTag)],
      source: 'upload',
      uploadedBy: CURRENT_USER,
      batch,
      addedAt: stamp - i,
      willFail: Math.random() < UPLOAD_FAIL_RATE,
    }))
    if (entries.length) setVideos((prev) => [...entries, ...prev])
  }

  /** Demo: simulate a CLI batch import of N clips with the given tags */
  const simulateCliImport = (count: number, tags: string[]) => {
    const stamp = Date.now()
    const [batch, ...rest] = tags
    const entries: LibraryVideo[] = Array.from({ length: count }, (_, i) => ({
      id: nextId(),
      title: `clip-${String(i + 1).padStart(4, '0')}.mp4`,
      sizeBytes: Math.floor(40 * 1024 * 1024 + Math.random() * 300 * 1024 * 1024),
      status: 'uploading',
      progress: Math.floor(Math.random() * 30),
      tags: [...(batch ? [batchTag(batch)] : []), ...rest.map(userTag)],
      source: 'cli',
      uploadedBy: CURRENT_USER,
      batch,
      addedAt: stamp - i,
      willFail: Math.random() < UPLOAD_FAIL_RATE,
    }))
    setVideos((prev) => [...entries, ...prev])
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) openUpload(Array.from(e.dataTransfer.files))
  }

  // ── Mutations ──
  /* `next.tags` is the user-tag draft from the card. System tags are carried
     over verbatim — the batch a clip arrived on is not the uploader's to retype. */
  const updateMeta = (id: string, next: { title: string; tags: string[] }) =>
    setVideos((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              title: next.title,
              tags: [...v.tags.filter((t) => t.origin === 'system'), ...next.tags.map(userTag)],
            }
          : v,
      ),
    )
  /** Retry re-runs the upload from zero — there is no analysis pass to re-run. */
  const retry = (id: string) =>
    setVideos((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: 'uploading', progress: 0, error: undefined, willFail: false } : v,
      ),
    )
  const confirmDelete = () => {
    if (!deleteIds) return
    const gone = new Set(deleteIds)
    setVideos((prev) => prev.filter((v) => !gone.has(v.id)))
    setSelectedIds((prev) => {
      const n = new Set(prev)
      gone.forEach((id) => n.delete(id))
      return n
    })
    setDeleteIds(null)
  }
  /* Scoped to `shown`, never to the whole library: "select all" under an active
     filter has to mean the clips you can see, or it silently picks up footage
     the filter was hiding. */
  const setAllShownSelected = (on: boolean) =>
    setSelectedIds((prev) => {
      const n = new Set(prev)
      shown.forEach((v) => (on ? n.add(v.id) : n.delete(v.id)))
      return n
    })

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  /* Bulk tag — additive, never replaces a video's existing tags, and always
     user-origin: a batch is assigned at ingest, not applied by hand later. A
     label a clip already carries as a system tag is skipped, so you never end
     up with "Batch · Build V2.2" and a loose "Build V2.2" on one card. */
  const addTagsToTarget = (tags: string[]) => {
    const target = new Set(tagTargetIds ?? [])
    setVideos((prev) =>
      prev.map((v) => {
        if (!target.has(v.id)) return v
        const added = tags.filter((t) => !hasTagLabel(v.tags, t))
        return added.length ? { ...v, tags: [...v.tags, ...added.map(userTag)] } : v
      }),
    )
    showToast(
      `${tags.length === 1 ? `Tag “${tags[0]}”` : `${tags.length} tags`} added to ${target.size} ${
        target.size === 1 ? 'video' : 'videos'
      }`,
    )
  }

  // ── Derived ──
  /* Tallied by LABEL — the rail groups by origin, but selecting a pill filters
     on its text, so a label that exists on both sides counts once and matches
     both. System wins the origin tie: if anything assigned that label, it is
     structured, and the rail should offer it under the batch group. */
  const countByTag = videos.reduce<Record<string, number>>((acc, v) => {
    v.tags.forEach((t) => (acc[t.label] = (acc[t.label] ?? 0) + 1))
    return acc
  }, {})
  const originByTag = videos.reduce<Record<string, LibraryTagOrigin>>((acc, v) => {
    v.tags.forEach((t) => {
      if (t.origin === 'system' || !acc[t.label]) acc[t.label] = t.origin
    })
    return acc
  }, {})
  /* Which facet a system label belongs to — the rail needs it to decide
     whether a pill can stand on its own text. */
  const facetByTag = videos.reduce<Record<string, LibraryTagFacet | undefined>>((acc, v) => {
    v.tags.forEach((t) => {
      if (t.facet && !acc[t.label]) acc[t.label] = t.facet
    })
    return acc
  }, {})
  /* Biggest batches first — the rail's job is to reach a batch in one click,
     and a selected tag never falls into the overflow menu. */
  const sortByCount = (a: string, b: string) => countByTag[b] - countByTag[a] || a.localeCompare(b)
  const allTags = Object.keys(countByTag).sort(sortByCount)
  /* One rail row, assigned tags first then the team's own — the order carries
     the distinction that two labelled rows used to, and the tail keeps the
     grouping explicit inside a single "+N more" menu. */
  const railGroups = (['system', 'user'] as const)
    .map((origin) => {
      const tags = allTags.filter((t) => originByTag[t] === origin)
      const pinned = tags.filter((t, i) => i < MAX_TAG_PILLS || activeTags.has(t))
      return { origin, tags, pinned, overflow: tags.filter((t) => !pinned.includes(t)) }
    })
    .filter((g) => g.tags.length > 0)
  const railPinned = railGroups.flatMap((g) => g.pinned)
  /* Sections are dropped when empty so the menu never shows a bare heading. */
  const railSections = railGroups
    .filter((g) => g.overflow.length > 0)
    .map((g) => ({ key: g.origin, heading: ORIGIN_GROUP_LABEL[g.origin], tags: g.overflow }))
  const isRecent = (v: LibraryVideo) => Date.now() - v.addedAt < 24 * 60 * 60 * 1000
  const recentCount = videos.filter(isRecent).length
  const toggleTag = (tag: string) =>
    setActiveTags((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  const q = query.trim().toLowerCase()
  const filtered = videos.filter((v) => {
    const matchesQuery =
      !q || v.title.toLowerCase().includes(q) || v.tags.some((t) => t.label.toLowerCase().includes(q))
    const matchesSource = sourceFacet === 'all' || v.source === sourceFacet
    /* Tag pills are additive, not narrowing — two batches selected means both
       batches, which is how a tester picks a run's footage. */
    const matchesTag =
      activeTags.size === 0 ||
      v.tags.some((t) => activeTags.has(t.label)) ||
      (activeTags.has(RECENT_TAG) && isRecent(v))
    return matchesQuery && matchesSource && matchesTag
  })
  const activeFacets = (sourceFacet !== 'all' ? 1 : 0) + activeTags.size
  const clearFacets = () => {
    setSourceFacet('all')
    setActiveTags(new Set())
  }

  /* One flat, newest-first grid. The library used to section by
     batch · source · stage, which duplicated the tag rail directly above it —
     the rail already reaches a batch in one click, and every clip carries its
     batch and source on the card. The sections also forced a "Select batch"
     control per header, a second way to do what the rail plus the card
     checkboxes already did. */
  const shown = useMemo(
    () => [...filtered].sort((a, b) => b.addedAt - a.addedAt),
    [filtered],
  )

  const shownSelectedCount = shown.reduce((n, v) => n + (selectedIds.has(v.id) ? 1 : 0), 0)
  const allShownSelected = shown.length > 0 && shownSelectedCount === shown.length
  const someShownSelected = shownSelectedCount > 0

  const selectedList = videos.filter((v) => selectedIds.has(v.id))
  /* Only an in-flight upload is unusable now, so the bar counts what is still
     arriving rather than what has cleared an analysis gate. */
  const selectedPending = selectedList.filter((v) => v.status !== 'ready')
  const selecting = selectedIds.size > 0

  const isEmpty = videos.length === 0

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Main content column — scrolls; reflows as the details panel pushes in */}
      <div className="relative flex-1 min-w-0 overflow-y-auto flyout-scrollbar page-scroll transition-all duration-300 ease-in-out">
        <div className="flex flex-col items-center pt-[120px] pb-[120px]">
          <div
            className={['flex flex-col gap-xl page-measure relative', className].filter(Boolean).join(' ')}
            onDragOver={(e) => {
              e.preventDefault()
              if (!isEmpty) setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {/* drag overlay (populated state) */}
            {dragOver && !isEmpty && (
              <div className="absolute inset-0 z-30 flex items-center justify-center rounded-3xl context-uploader-dragover pointer-events-none">
                <p className="font-display text-m font-semibold" style={{ color: 'var(--brand)' }}>
                  Drop videos to upload
                </p>
              </div>
            )}

            {/* ── Header ── mb on top of the stack's gap-xl puts 40px under the
                 page header, without loosening the note-to-container rhythm
                 inside the content block below it. */}
            <div className="flex items-center justify-between gap-xl w-full mb-m">
              <AgentPageHeader
                title="Gameplay Library"
                description="Every recording, from every source. Tests pick their batches from here."
                iconGradient="linear-gradient(135deg, #6431E0 0%, #7B4CFF 55%, #8FA8F8 100%)"
                icon={<VideoLibraryIcon size={40} />}
              />
              {!isEmpty && (
                <Button variant="primary" size="lg" leftIcon={<UploadIcon size={20} />} onClick={() => openUpload()}>
                  Upload videos
                </Button>
              )}
            </div>

            {isEmpty ? (
              /* ── Empty library ── */
              <div
                className={[
                  'flex flex-col items-center gap-xl p-xxl rounded-3xl cursor-pointer transition-colors duration-150',
                  dragOver ? 'context-uploader-dragover' : 'context-uploader',
                ].join(' ')}
                role="button"
                tabIndex={0}
                onClick={() => openUpload()}
              >
                <div className="flex flex-col items-center gap-xxs">
                  <p className="font-display text-m font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Drop videos here or click to upload
                  </p>
                  <p className="font-body text-s" style={{ color: 'var(--text-secondary)' }}>
                    Bulk-upload gameplay clips — your agents can reference them as soon as they land
                  </p>
                </div>
                <div className="flex items-center gap-xs flex-wrap justify-center">
                  {['MP4', 'MOV', 'WEBM', 'AVI', 'MKV'].map((ext) => (
                    <span
                      key={ext}
                      className="inline-flex items-center px-s py-xxs rounded-round font-body text-xs"
                      style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                    >
                      {ext}
                    </span>
                  ))}
                </div>
                <span className="font-display text-2xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-tertiary)' }}>
                  MAX 500MB PER VIDEO
                </span>
              </div>
            ) : (
              <>
                {/* The agent-gating note lived here until 2026-09-10. It
                    explained a Ready gate that no longer exists. */}

                {/* ── Library container — toolbar + grouped collection ── */}
                <div
                  className="flex flex-col w-full rounded-3xl overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-elements)', border: '1px solid var(--border-subtle)' }}
                >
                  {/* Tag rail — the fast path to a batch, same control as the
                      session picker so the two surfaces read as one library.
                      One row: the few tags worth a single click, assigned ones
                      first. The origin grouping lives in the "+N more" menu,
                      where it costs no vertical space and still answers "which
                      of these did we invent". Stage and test-type pills keep
                      their facet, so "Test · AI" never reads as a batch.

                      The tail sits last, behind a rule: everything left of it
                      applies a filter on click, "+N more" opens a menu. Same
                      pill shape, different kind of action, so the break earns
                      its pixel. */}
                  <div className="flex flex-wrap items-center gap-xs px-m pt-m pb-m w-full">
                    <span
                      className="font-display text-xs font-semibold uppercase tracking-[0.08em] shrink-0"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Select by tag
                    </span>
                    {railPinned.map((t) => (
                      <FilterPill
                        key={t}
                        label={railLabel(t, facetByTag)}
                        count={countByTag[t]}
                        selected={activeTags.has(t)}
                        onClick={() => toggleTag(t)}
                        multi
                      />
                    ))}

                    {/* Shortened from "Uploaded in last 24h": at 197px it was
                        the one item that pushed the merged rail onto a second
                        line, and among upload-tag pills the recency is not
                        ambiguous. */}
                    <FilterPill
                      label="Last 24h"
                      count={recentCount}
                      selected={activeTags.has(RECENT_TAG)}
                      onClick={() => toggleTag(RECENT_TAG)}
                      multi
                    />

                    {/* Only with a tail to separate — a rule at the end of the
                        row with nothing after it is just a stray mark. */}
                    {railSections.length > 0 && (
                      <span
                        className="w-px h-[20px] shrink-0 mx-xxs"
                        style={{ backgroundColor: 'var(--border-default)' }}
                        aria-hidden
                      />
                    )}

                    <TagOverflowMenu
                      groups={railSections}
                      countByTag={countByTag}
                      active={activeTags}
                      onToggle={toggleTag}
                      totalTags={allTags.length}
                      labelFor={(t) => railLabel(t, facetByTag)}
                    />
                  </div>

                  {/* Toolbar — search · facets. The row gap is wide enough to
                      read as a break between two filters, while the label and
                      its control keep the tighter gap inside their own group
                      (and stay together when the row wraps). */}
                  <div
                    className="flex items-center gap-xl p-m w-full flex-wrap"
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-page-pale)',
                    }}
                  >
                    {/* One select-all for the filtered set, leading the row:
                        it sits above the column of card checkboxes it controls,
                        which is where anyone looks for it. The rule after it
                        separates the one control that ACTS on the collection
                        from the two that only narrow it. */}
                    {shown.length > 0 && (
                      <>
                        <label className="flex items-center gap-xs shrink-0 cursor-pointer">
                          <Checkbox
                            checked={allShownSelected}
                            indeterminate={someShownSelected && !allShownSelected}
                            onChange={() => setAllShownSelected(!allShownSelected)}
                            aria-label={allShownSelected ? 'Deselect all shown videos' : 'Select all shown videos'}
                          />
                          <span className="font-body text-s leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>
                            {allShownSelected ? 'Deselect all' : `Select all ${shown.length}`}
                          </span>
                        </label>
                        <span
                          className="w-px h-[20px] shrink-0 -mx-s"
                          style={{ backgroundColor: 'var(--border-default)' }}
                          aria-hidden
                        />
                      </>
                    )}

                    <div className="flex items-center gap-s flex-wrap">
                      <span
                        className="font-body text-s leading-[1.5] shrink-0"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Source
                      </span>
                      <SegmentedControl<VideoUploadSource | 'all'>
                        ariaLabel="Filter by capture source"
                        size="sm"
                        tone="contrast"
                        value={sourceFacet}
                        onChange={setSourceFacet}
                        options={[
                          { value: 'all', label: 'All' },
                          ...SOURCE_ORDER.map((s) => ({ value: s, label: SOURCE_SHORT[s] })),
                        ]}
                      />
                    </div>
                    <span className="flex-1" />

                    {/* Search sits right, opposite the selection control: the
                        left of the row acts on the collection, the right of it
                        searches. `shrink` so the field gives way before the
                        source segments wrap. */}
                    <div className="library-search w-[320px] max-w-full shrink">
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search sessions"
                        aria-label="Search sessions"
                        size="lg"
                        leftIcon={<SearchIcon size={20} />}
                      />
                    </div>
                  </div>

                  {/* The one-click way out of a filtered view — only while filters are on */}
                  {activeFacets > 0 && (
                    <div className="flex items-center gap-s px-m pt-s w-full">
                      <span className="font-body text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {filtered.length} {filtered.length === 1 ? 'video matches' : 'videos match'}
                      </span>
                      <button type="button" onClick={clearFacets} className="font-body text-xs font-semibold" style={{ color: 'var(--brand)' }}>
                        Clear {activeFacets} {activeFacets === 1 ? 'filter' : 'filters'}
                      </button>
                    </div>
                  )}

                  {/* Collection — one flat grid, newest first */}
                  <div className="flex flex-col gap-xl px-m pt-m pb-l w-full" data-selecting={selecting ? 'true' : 'false'}>
                    {shown.length === 0 ? (
                      /* Same fallback, wording and way out as the session
                         picker — an empty result should not feel like a
                         different product depending on where you hit it. */
                      <VideosEmptyState
                        title="No recordings match these filters"
                        message={
                          activeFacets > 0 || q
                            ? 'Clear a filter or two and your full library comes back.'
                            : 'Upload or record a session — it appears here as soon as it finishes uploading.'
                        }
                        action={
                          activeFacets > 0 || q ? (
                            <Button
                              variant="secondary"
                              size="lg"
                              onClick={() => {
                                clearFacets()
                                setQuery('')
                              }}
                            >
                              {activeFacets > 0 ? 'Clear filters' : 'Clear search'}
                            </Button>
                          ) : undefined
                        }
                      />
                    ) : (
                      <div className="grid gap-l w-full" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {shown.map((v) => (
                          <VideoLibraryCard
                            key={v.id}
                            layout="grid"
                            title={v.title}
                            dateLabel={formatDate(v.addedAt)}
                            source={v.source}
                            uploadedBy={v.uploadedBy}
                            uploadedByYou={v.uploadedBy === CURRENT_USER}
                            durationLabel={v.durationLabel}
                            thumbnailSrc={v.thumbnailSrc}
                            gradient={gradientFor(v.id)}
                            status={v.status}
                            progress={v.progress}
                            tags={v.tags}
                            errorMessage={v.error}
                            selected={selectedIds.has(v.id)}
                            checkboxVisibility="always"
                            onToggleSelect={() => toggleSelect(v.id)}
                            onDelete={() => setDeleteIds([v.id])}
                            onRetry={() => retry(v.id)}
                            onSaveMeta={(next) => updateMeta(v.id, next)}
                            onAddTags={() => setTagTargetIds([v.id])}
                            onOpen={() => setSelectedId(v.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Bulk tag ── */}
            {/* Suggestions are the user vocabulary only — offering "Build V2.2"
                here would invite hand-applying a batch, which ingest owns. */}
            <AddTagsDialog
              isOpen={tagTargetIds !== null}
              onClose={() => setTagTargetIds(null)}
              count={tagTargetIds?.length ?? 0}
              suggestions={allTags.filter((t) => originByTag[t] === 'user')}
              onConfirm={addTagsToTarget}
            />

            {/* ── Delete confirmation ── */}
            <PopupModal
              isOpen={deleteIds !== null}
              onClose={() => setDeleteIds(null)}
              title={deleteIds && deleteIds.length > 1 ? `Delete ${deleteIds.length} videos?` : 'Delete video?'}
              body="This removes the video and its analysis. Agents will no longer reference it. This can’t be undone."
              primaryLabel="Delete"
              primaryVariant="danger"
              secondaryLabel="Cancel"
              onConfirm={confirmDelete}
            />

            {/* ── Upload modal (files + tags · or CLI) ── */}
            <UploadVideosModal
              isOpen={uploadOpen}
              onClose={() => setUploadOpen(false)}
              initialFiles={dropFiles}
              existingNames={existingNames}
              onConfirm={commitUpload}
              onSimulateImport={simulateCliImport}
            />
          </div>
        </div>

        {/* ── Selection bar — floats in only while something is selected, so the
            toolbar above never changes shape or colour to announce it. ── */}
        {selecting && (
          /* z above the review pills (z-40): dev chrome must never draw over
             a product action bar, which is one reason this got missed. */
          <div className="sticky bottom-l z-50 flex justify-center px-l pointer-events-none -mt-[72px]">
            <div
              /* A surface card, not a dark pill. Because it no longer supplies
                 its own contrast, the border, the elevation and the arrival
                 animation are what make it register — see globals.css. */
              className="library-selection-bar pointer-events-auto flex items-center gap-s pl-m pr-xs py-xs rounded-2xl max-w-full"
              style={{
                backgroundColor: 'var(--bg-elements)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
              }}
              role="toolbar"
              aria-label="Selection actions"
            >
              <span
                className="font-display text-s font-semibold whitespace-nowrap"
                style={{ color: 'var(--text-brand)' }}
              >
                {selectedIds.size} selected
              </span>
              {selectedPending.length > 0 && (
                /* A token, not opacity — the bar is a real surface now, and a
                   faded label on it reads as disabled rather than secondary. */
                <span
                  className="font-body text-xs whitespace-nowrap"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {selectedPending.length} still uploading
                </span>
              )}
              <span
                className="w-px h-[20px] shrink-0 mx-xxs"
                style={{ backgroundColor: 'var(--border-default)' }}
                aria-hidden
              />
              {/* Real DS Buttons now that the surface is light: the hand-rolled
                  BarButton existed only to survive a dark background, and it
                  had no focus or disabled states of its own. */}
              <Button
                variant="secondary"
                size="md"
                leftIcon={<PlusIcon size={16} />}
                onClick={() => setTagTargetIds([...selectedIds])}
              >
                Add tag
              </Button>
              <Button
                variant="danger"
                size="md"
                leftIcon={<TrashIcon size={16} />}
                onClick={() => setDeleteIds([...selectedIds])}
              >
                Delete
              </Button>
              <Button
                variant="transparent"
                size="md"
                iconOnly
                onClick={() => setSelectedIds(new Set())}
                aria-label="Clear selection"
              >
                <CloseIcon size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Player ── */}
      <LibraryVideoLightbox video={selectedVideo} onClose={() => setSelectedId(null)} />
    </div>
  )
}

