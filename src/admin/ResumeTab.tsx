import type { Content } from './config'
import { MAX_UPLOAD_MB } from './config'
import type { Files } from './AdminApp'
import { Group, FileButton } from './fields'

type Props = {
  content: Content
  files: Files
}

// swaps the resume pdf, the link on the site stays the same
export default function ResumeTab({ content, files }: Props) {
  const path = content.site.resume
  const waiting = files.pending.uploads[path]

  // queues the picked pdf to replace the current one
  function pick(file: File) {
    if (file.type !== 'application/pdf') return window.alert('The resume needs to be a PDF.')
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return window.alert(`That file is over ${MAX_UPLOAD_MB} MB.`)
    files.add(path, file)
  }

  return (
    <Group title="Resume">
      <p>
        Every resume button and link on the site points to <span className="font-mono text-sm">{path}</span>, so uploading
        a new PDF here replaces it everywhere and old links keep working.
      </p>

      {/* the resume that's live right now */}
      <a href={path} target="_blank" rel="noopener noreferrer" className="link inline-block">
        Open the live resume
      </a>

      {/* file picker for the new one */}
      <div>
        <FileButton label="Upload new resume (PDF)" accept="application/pdf" onPick={pick} />
      </div>

      {/* shows the pdf waiting to go live */}
      {waiting && (
        <div className="rounded-xl bg-accent-soft p-4 flex flex-wrap items-center justify-between gap-3">
          <p>
            <a href={files.preview(path)} target="_blank" rel="noopener noreferrer" className="link font-semibold">
              {waiting.name}
            </a>{' '}
            is ready. Hit publish to make it live.
          </p>
          <button type="button" className="pill bg-paper" onClick={() => files.undo(path)}>
            Undo
          </button>
        </div>
      )}
    </Group>
  )
}
