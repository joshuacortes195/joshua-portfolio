import { useState } from 'react'
import type { Project } from '../data/projects'
import { toTitle } from '../lib/github'
import { MAX_UPLOAD_MB, type Content } from './config'
import type { Files } from './AdminApp'
import { fetchRepos, type Repo } from './github'
import { Group, Text, Area, List, Check, FileButton, RowTools } from './fields'
import { moveItem } from './list'

type Props = {
  content: Content
  // makes a change to the content
  change: (edit: (draft: Content) => void) => void
  files: Files
  token: string
}

// turns a title into a url friendly id, like "Book App" into "book-app"
function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project'
}

// makes sure no two projects share an id
function uniqueId(base: string, projects: Project[]) {
  let id = base
  for (let n = 2; projects.some(p => p.id === id); n++) id = `${base}-${n}`
  return id
}

// grabs a frame near the start of a video to use as its still image
function grabPoster(file: File, name: string) {
  return new Promise<File | null>(resolve => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    // gives up quietly if the browser can't read the video
    const timer = setTimeout(() => done(null), 8000)

    function done(poster: File | null) {
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      resolve(poster)
    }

    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.onerror = () => done(null)
    // jumps a moment in so the frame isn't a black first frame
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, video.duration / 2)
    }
    // draws the frame onto a canvas, at most 1280 wide, and saves it as a jpg
    video.onseeked = () => {
      const scale = Math.min(1, 1280 / video.videoWidth)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(video.videoWidth * scale)
      canvas.height = Math.round(video.videoHeight * scale)
      canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => done(blob && new File([blob], name, { type: 'image/jpeg' })), 'image/jpeg', 0.82)
    }
    video.src = url
  })
}

type EditorProps = {
  project: Project
  // makes a change to this project
  edit: (fn: (p: Project) => void) => void
  files: Files
}

// the image or video for one project
function MediaEditor({ project, edit, files }: EditorProps) {
  const media = project.media
  const [busy, setBusy] = useState(false)

  // queues the old files for removal unless the new media reuses the same name
  function dropOld(keep: string[]) {
    for (const old of [media?.src, media?.poster]) {
      if (old?.startsWith('/media/') && !keep.includes(old)) files.drop(old)
    }
  }

  // takes a picked image or video and makes it this project's media
  async function pick(file: File) {
    const isVideo = file.type.startsWith('video/')
    if (!isVideo && !file.type.startsWith('image/')) return window.alert('Pick an image or an MP4 video.')
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return window.alert(`That file is over ${MAX_UPLOAD_MB} MB, trim or compress it first.`)

    // files are named after the project so a new upload replaces the old one
    const ext = file.name.split('.').pop()!.toLowerCase()
    const src = `/media/${project.id}.${ext}`
    const poster = `/media/${project.id}-poster.jpg`

    // videos get a still frame to show before they play
    setBusy(true)
    const still = isVideo ? await grabPoster(file, `${project.id}-poster.jpg`) : null
    setBusy(false)

    dropOld(still ? [src, poster] : [src])
    files.add(src, file)
    if (still) files.add(poster, still)
    edit(p => {
      p.media = {
        kind: isVideo ? 'video' : 'image',
        src,
        poster: still ? poster : undefined,
        alt: p.media?.alt || (isVideo ? `Screen recording of ${p.title}` : `Screenshot of ${p.title}`),
      }
    })
  }

  // swaps just the still image of a video
  function pickPoster(file: File) {
    if (!file.type.startsWith('image/')) return window.alert('The still needs to be an image.')
    const ext = file.name.split('.').pop()!.toLowerCase()
    const poster = `/media/${project.id}-poster.${ext}`
    if (media?.poster?.startsWith('/media/') && media.poster !== poster) files.drop(media.poster)
    files.add(poster, file)
    edit(p => void (p.media!.poster = poster))
  }

  // goes back to the text only card
  function remove() {
    dropOld([])
    edit(p => void delete p.media)
  }

  return (
    <div className="space-y-4">
      <p className="meta text-ink-soft">Image or video</p>

      {/* what the card will show */}
      {media && (
        <div className="aspect-[1280/692] max-w-md rounded-xl overflow-hidden bg-mute">
          {media.kind === 'video' ? (
            <video
              key={files.preview(media.src)}
              className="w-full h-full object-cover"
              src={files.preview(media.src)}
              poster={media.poster && files.preview(media.poster)}
              controls
              muted
              playsInline
              preload="none"
            />
          ) : (
            <img className="w-full h-full object-cover" src={files.preview(media.src)} alt="" />
          )}
        </div>
      )}

      {/* upload, swap and remove buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <FileButton
          label={busy ? 'Reading video…' : media ? 'Replace' : 'Upload image or video'}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4"
          onPick={pick}
        />
        {media?.kind === 'video' && <FileButton label="Change still image" accept="image/jpeg,image/png,image/webp" onPick={pickPoster} />}
        {media && (
          <button type="button" className="pill" onClick={remove}>
            Remove
          </button>
        )}
      </div>
      <p className="meta text-ink-soft">JPG, PNG, WebP or MP4, up to {MAX_UPLOAD_MB} MB. Cards are shaped 1280 x 692.</p>

      {/* description of the media for screen readers */}
      {media && (
        <Text
          label="Describe what it shows"
          value={media.alt}
          onChange={v => edit(p => void (p.media!.alt = v))}
        />
      )}
    </div>
  )
}

// all the fields for one project
function ProjectEditor({ project, edit, files }: EditorProps) {
  return (
    <div className="mt-5 space-y-5">
      <Text label="Title" value={project.title} onChange={v => edit(p => void (p.title = v))} />
      <Area label="Description" value={project.description} onChange={v => edit(p => void (p.description = v))} />
      <List label="Tags" value={project.tags} onChange={v => edit(p => void (p.tags = v))} />
      <Text
        label="Live demo link"
        value={project.demo ?? ''}
        onChange={v => edit(p => void (p.demo = v.trim() || undefined))}
        hint="Leave empty to hide the live demo button"
      />
      <Text
        label="GitHub repo link"
        value={project.github ?? ''}
        onChange={v => edit(p => void (p.github = v.trim() || undefined))}
      />
      <Check
        label="Show a view code button"
        checked={!!project.fromGithub}
        onChange={on => edit(p => void (p.fromGithub = on || undefined))}
      />
      <Check
        label="Demo only works on desktop"
        checked={!!project.desktopOnly}
        onChange={on => edit(p => void (p.desktopOnly = on || undefined))}
      />
      <MediaEditor project={project} edit={edit} files={files} />
    </div>
  )
}

export default function ProjectsTab({ content, change, files, token }: Props) {
  const { projects, site } = content
  // the project whose fields are showing
  const [openId, setOpenId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  // my github repos, loaded the first time the import list opens
  const [repos, setRepos] = useState<Repo[] | 'loading' | 'error' | null>(null)

  // adds an empty project to the top and opens it
  function addProject() {
    const title = newTitle.trim()
    if (!title) return
    const id = uniqueId(slug(title), projects)
    change(d => void d.projects.unshift({ id, title, description: '', tags: [] }))
    setOpenId(id)
    setNewTitle('')
  }

  // opens or closes the list of repos
  function toggleRepos() {
    if (repos) return setRepos(null)
    setRepos('loading')
    fetchRepos(token)
      .then(list => setRepos(list.filter(r => !r.fork)))
      .catch(() => setRepos('error'))
  }

  // fills in a new project from a repo: name, description, language, topics and links
  function importRepo(repo: Repo) {
    const id = uniqueId(slug(repo.name), projects)
    const topics = (repo.topics ?? []).filter(t => t !== site.projects.githubTopic)
    change(d => {
      d.projects.unshift({
        id,
        title: toTitle(repo.name),
        description: repo.description ?? '',
        tags: [...(repo.language ? [repo.language] : []), ...topics],
        demo: repo.homepage || undefined,
        github: repo.html_url,
        fromGithub: true,
      })
    })
    setOpenId(id)
  }

  // deletes a project and its media files
  function removeProject(index: number) {
    const media = projects[index].media
    for (const path of [media?.src, media?.poster]) {
      if (path?.startsWith('/media/')) files.drop(path)
    }
    change(d => void d.projects.splice(index, 1))
  }

  // repos that already have a card
  const taken = new Set(projects.map(p => p.github?.toLowerCase()))

  return (
    <div className="space-y-6">
      <Group title="Add a project">
        {/* start one from scratch */}
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={e => {
            e.preventDefault()
            addProject()
          }}
        >
          <div className="flex-1 min-w-56">
            <Text label="Project title" value={newTitle} onChange={setNewTitle} />
          </div>
          <button type="submit" className="pill pill-accent" disabled={!newTitle.trim()}>
            Add project
          </button>
        </form>

        {/* or pull one in from github */}
        <div>
          <button type="button" className="pill" onClick={toggleRepos} aria-expanded={!!repos}>
            {repos ? 'Hide my repos' : 'Import from GitHub'}
          </button>
        </div>
        {repos === 'loading' && <p className="meta">Loading your repos…</p>}
        {repos === 'error' && (
          <p role="alert" className="meta">
            Couldn't load your repos. Try again.
          </p>
        )}
        {Array.isArray(repos) && (
          <ul className="border-b border-ink">
            {repos.map(repo => (
              <li key={repo.html_url} className="border-t border-ink py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{repo.name}</p>
                  <p className="text-sm text-ink-soft">{repo.description || 'No description'}</p>
                </div>
                {taken.has(repo.html_url.toLowerCase()) ? (
                  <span className="meta text-ink-soft">Already added</span>
                ) : (
                  <button type="button" className="pill" onClick={() => importRepo(repo)}>
                    Add
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Group>

      <Group title="Projects">
        <p className="text-ink-soft">The order here is the order on the wheel.</p>

        {/* one row per project, click edit to open its fields */}
        {projects.map((project, i) => (
          <div key={project.id} className="border-t border-ink pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="pill"
                  onClick={() => setOpenId(openId === project.id ? null : project.id)}
                  aria-expanded={openId === project.id}
                >
                  {openId === project.id ? 'Close' : 'Edit'}
                </button>
                <RowTools
                  name={project.title}
                  index={i}
                  count={projects.length}
                  onMove={to => change(d => moveItem(d.projects, i, to))}
                  onDelete={() => removeProject(i)}
                />
              </div>
            </div>
            {openId === project.id && (
              <ProjectEditor project={project} edit={fn => change(d => fn(d.projects[i]))} files={files} />
            )}
          </div>
        ))}
      </Group>

      {/* repos that show up on their own, without being added here */}
      <Group title="Automatic GitHub cards">
        <p>
          Any public repo of yours tagged with this topic on GitHub gets its own card at the end of the wheel, filled in
          from the repo's description, language and website. Leave it empty to turn this off.
        </p>
        <Text
          label="Topic"
          value={site.projects.githubTopic}
          onChange={v => change(d => void (d.site.projects.githubTopic = v.trim().toLowerCase()))}
        />
      </Group>
    </div>
  )
}
