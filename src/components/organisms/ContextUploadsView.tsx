/**
 * ContextUploadsView — Full uploads page with state machine:
 * empty -> uploading (progress) -> uploaded (describe) -> indexed (saved files list).
 * Delete triggers a confirmation popup.
 *
 * @figmaComponent  Context / Uploads (all states)
 * @figmaPath       Context / Game Intelligence / Body / Container / Main Content / Section
 * @figmaNode       6419:74744
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=6419-74744
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { AgentPageHeader } from '../molecules/AgentPageHeader'
import { ContextUploader } from '../molecules/ContextUploader'
import { ContextUploaderMini } from '../molecules/ContextUploaderMini'
import { ContextFileCard, type UploadStatus } from '../molecules/ContextFileCard'
import { PopupModal } from '../molecules/PopupModal'
import { UploadIcon } from '../icons/UploadIcon'
import { uploadsFilesFor, useUploadsDemoState } from '../../lib/uploadsDemoState'

interface UploadedFile {
  id: string
  name: string
  size: string
  date: string
  type: 'image' | 'document'
  progress: number
  status: UploadStatus
  saved?: boolean
  savedDescription?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function detectFileType(name: string): 'image' | 'document' {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext) ? 'image' : 'document'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ContextUploadsView({ className }: { className?: string }) {
  /* Every screen past "empty" needs a file, so the reviewer state pill seeds
     the list — see lib/uploadsDemoState. Re-seeds on change, and anything the
     reviewer uploads by hand afterwards survives until the next switch. */
  const demoState = useUploadsDemoState()
  const [files, setFiles] = useState<UploadedFile[]>(() => uploadsFilesFor(demoState))
  const [deleteTarget, setDeleteTarget] = useState<UploadedFile | null>(null)

  const seededFor = useRef(demoState)
  useEffect(() => {
    if (seededFor.current === demoState) return
    seededFor.current = demoState
    setFiles(uploadsFilesFor(demoState))
    setDeleteTarget(null)
  }, [demoState])

  const isEmpty = files.length === 0

  // Simulate upload progress
  useEffect(() => {
    const uploading = files.filter((f) => f.status === 'uploading')
    if (uploading.length === 0) return

    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.status !== 'uploading') return f
          const next = Math.min(100, f.progress + Math.random() * 15 + 5)
          if (next >= 100) {
            return { ...f, progress: 100, status: 'uploaded' as const }
          }
          return { ...f, progress: next }
        })
      )
    }, 400)

    return () => clearInterval(interval)
  }, [files])

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const mapped: UploadedFile[] = newFiles.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      size: formatFileSize(f.size),
      date: formatDate(),
      type: detectFileType(f.name),
      progress: 0,
      status: 'uploading' as const,
    }))
    setFiles((prev) => [...prev, ...mapped])
  }, [])

  const handleDeleteRequest = useCallback((file: UploadedFile) => {
    setDeleteTarget(file)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id))
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  const handleSkip = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, saved: true } : f))
    )
  }, [])

  const handleSave = useCallback((id: string, desc: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, saved: true, savedDescription: desc || undefined }
          : f
      )
    )
  }, [])

  return (
    <div
      className={['flex flex-col items-center page-measure', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <AgentPageHeader
        title="Uploads"
        description="Upload game documents to give AI agents richer context and sharper insights"
        className="w-full"
        iconGradient="linear-gradient(134.4deg, #9976FF 1%, #00BAA5 99%)"
        icon={<UploadIcon size={40} />}
      />

      {/* Content */}
      <div className="w-full mt-xxl">
        {isEmpty ? (
          <div className="flex flex-col gap-xxl">
            <div className="flex flex-col gap-xs">
              <h2
                className="font-display text-l font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Help your agents think like your team
              </h2>
              <p className="font-body text-s leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>
                Share GDDs, live-ops plans, player research, balance logs, strategy docs,
                or anything that gives them deeper context about your game.
              </p>
            </div>
            <ContextUploader onFilesSelected={handleFilesSelected} />
          </div>
        ) : (
          <div className="flex flex-col gap-l">
            <ContextUploaderMini onFilesSelected={handleFilesSelected} />

            {/* Uploaded Files heading + count badge */}
            <div className="flex items-center gap-xs">
              <h3
                className="font-display text-l font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Uploaded Files
              </h3>
              <span
                className="inline-flex items-center justify-center size-[16px] rounded-[52px] font-display text-xs font-semibold pt-px"
                style={{ backgroundColor: 'var(--bg-tint)', color: 'var(--brand)' }}
              >
                {files.length}
              </span>
            </div>

            {/* File cards */}
            <div className="flex flex-col gap-s">
              {files.map((f) => (
                <ContextFileCard
                  key={f.id}
                  fileName={f.name}
                  fileSize={f.size}
                  fileDate={f.date}
                  fileType={f.type}
                  progress={f.progress}
                  status={f.status}
                  saved={f.saved}
                  savedDescription={f.savedDescription}
                  onDelete={() => handleDeleteRequest(f)}
                  onSkip={() => handleSkip(f.id)}
                  onSave={(desc) => handleSave(f.id, desc)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation popup */}
      <PopupModal
        isOpen={deleteTarget !== null}
        onClose={handleDeleteCancel}
        title="Delete file"
        body={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : ''}
        primaryLabel="Delete"
        secondaryLabel="Cancel"
        primaryVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}
