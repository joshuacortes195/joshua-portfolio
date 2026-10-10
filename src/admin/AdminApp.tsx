import { useEffect, useMemo, useRef, useState } from 'react'
import { FILES, type Content, type Pending } from './config'
import { GithubError, fetchUser, loadContent, publish } from './github'
import TextTab from './TextTab'
import ExperienceTab from './ExperienceTab'
import ProjectsTab from './ProjectsTab'
import ResumeTab from './ResumeTab'

const TOKEN_KEY = 'admin-token'

// what the tabs use to queue file uploads and removals
export type Files = {
  pending: Pending
  // queues a file to be saved at a site path like /media/clip.mp4
  add: (path: string, file: File) => void
  // takes a queued upload back out
  undo: (path: string) => void
  // queues a file to be deleted from the site
  drop: (path: string) => void
  // address to show a file from, the queued upload if there is one
  preview: (path: string) => string
}

// messages for when the login comes back with a problem
const LOGIN_ERRORS: Record<string, string> = {
  not_allowed: "That GitHub account isn't allowed in here.",
  login_failed: "The login didn't go through. Try again.",
  not_set_up: 'GitHub login is not set up yet. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Netlify.',
}

// picks up the token or error github login left in the url, then wipes it from the address bar
const landed = new URLSearchParams(window.location.hash.slice(1))
if (landed.has('token') || landed.has('error')) {
  history.replaceState(null, '', window.location.pathname)
}

// the token from a fresh login, or the one saved for this tab
function startingToken() {
  try {
    const fresh = landed.get('token')
    if (fresh) sessionStorage.setItem(TOKEN_KEY, fresh)
    return fresh ?? sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return landed.get('token')
  }
}

// the sign in screen
function Login({ onToken }: { onToken: (token: string) => void }) {
  const error = landed.get('error')
  const [pasted, setPasted] = useState('')

  return (
    <main className="min-h-svh grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="display text-5xl">Admin</h1>
        <p className="mt-4 text-ink-soft">Sign in to edit the site.</p>

        {/* why the last login attempt failed */}
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-accent-soft p-4">
            {LOGIN_ERRORS[error] ?? LOGIN_ERRORS.login_failed}
          </p>
        )}

        <a href="/api/auth/login" className="pill pill-accent mt-8 w-full min-h-14 text-lg font-semibold">
          Sign in with GitHub
        </a>

        {/* only when running on my own machine, where the login function isn't there */}
        {import.meta.env.DEV && (
          <form
            className="mt-10 border-t border-ink pt-6"
            onSubmit={e => {
              e.preventDefault()
              if (pasted.trim()) onToken(pasted.trim())
            }}
          >
            <label htmlFor="dev-token" className="meta block text-ink-soft">
              Local dev: paste a GitHub token
            </label>
            <input
              id="dev-token"
              type="password"
              className="field"
              value={pasted}
              onChange={e => setPasted(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="pill mt-4">
              Use token
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

const TABS = ['Text', 'Experience', 'Projects', 'Resume'] as const
type Tab = (typeof TABS)[number]

// the dashboard itself, once signed in
function Dashboard({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [user, setUser] = useState('')
  // what's being edited, and what was last published
  const [content, setContent] = useState<Content | null>(null)
  const [saved, setSaved] = useState<Content | null>(null)
  const [pending, setPending] = useState<Pending>({ uploads: {}, deletes: [] })
  const [tab, setTab] = useState<Tab>('Text')
  const [loadError, setLoadError] = useState('')
  // progress and result of publishing
  const [status, setStatus] = useState<{ kind: 'idle' | 'working' | 'done' | 'error'; text: string }>({ kind: 'idle', text: '' })

  // checks the token and loads the content from the repo
  useEffect(() => {
    let cancelled = false
    Promise.all([fetchUser(token), loadContent(token)])
      .then(([me, loaded]) => {
        if (cancelled) return
        setUser(me.login)
        setContent(loaded)
        setSaved(loaded)
      })
      .catch(err => {
        if (cancelled) return
        // an expired or revoked token goes back to the sign in screen
        if (err instanceof GithubError && err.status === 401) onSignOut()
        else setLoadError(err instanceof Error ? err.message : 'Something went wrong')
      })
    return () => {
      cancelled = true
    }
  }, [token, onSignOut])

  // which content files have edits
  const changed = useMemo(() => {
    if (!content || !saved) return []
    return (Object.keys(FILES) as (keyof Content)[]).filter(key => JSON.stringify(content[key]) !== JSON.stringify(saved[key]))
  }, [content, saved])
  const fileCount = Object.keys(pending.uploads).length + pending.deletes.length
  const dirty = changed.length > 0 || fileCount > 0

  // warns before closing the tab with unpublished edits
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  // applies an edit to a copy of the content
  function change(edit: (draft: Content) => void) {
    setContent(current => {
      if (!current) return current
      const draft = structuredClone(current)
      edit(draft)
      return draft
    })
    setStatus({ kind: 'idle', text: '' })
  }

  // preview addresses for queued uploads, one per file
  const previews = useRef(new Map<File, string>())

  const files: Files = {
    pending,
    add(path, file) {
      setPending(p => ({ uploads: { ...p.uploads, [path]: file }, deletes: p.deletes.filter(d => d !== path) }))
      setStatus({ kind: 'idle', text: '' })
    },
    undo(path) {
      setPending(p => {
        const uploads = { ...p.uploads }
        delete uploads[path]
        return { ...p, uploads }
      })
    },
    drop(path) {
      setPending(p => {
        const uploads = { ...p.uploads }
        delete uploads[path]
        return { uploads, deletes: p.deletes.includes(path) ? p.deletes : [...p.deletes, path] }
      })
    },
    preview(path) {
      const file = pending.uploads[path]
      if (!file) return path
      let url = previews.current.get(file)
      if (!url) {
        url = URL.createObjectURL(file)
        previews.current.set(file, url)
      }
      return url
    },
  }

  // writes the commit message from what changed, like "Update projects and resume"
  function describeChanges() {
    if (!content) return 'Update site content'
    const parts: string[] = []
    if (changed.includes('site')) parts.push('site text')
    if (changed.includes('experience')) parts.push('experience')
    if (changed.includes('projects') || Object.keys(pending.uploads).some(p => p.startsWith('/media/'))) parts.push('projects')
    if (pending.uploads[content.site.resume]) parts.push('resume')
    if (!parts.length) return 'Update site content'
    const last = parts.pop()
    return `Update ${parts.length ? `${parts.join(', ')} and ${last}` : last}`
  }

  // saves everything to the repo, which redeploys the site
  async function handlePublish() {
    if (!content || !dirty) return
    setStatus({ kind: 'working', text: 'Starting' })
    try {
      await publish(token, content, pending, describeChanges(), text => setStatus({ kind: 'working', text }))
      setSaved(content)
      setPending({ uploads: {}, deletes: [] })
      setStatus({ kind: 'done', text: 'Published. The live site updates in about a minute.' })
    } catch (err) {
      if (err instanceof GithubError && err.status === 401) return onSignOut()
      setStatus({ kind: 'error', text: `Didn't publish: ${err instanceof Error ? err.message : 'something went wrong'}` })
    }
  }

  // throws away every edit since the last publish
  function discard() {
    if (!window.confirm('Throw away all unpublished changes?')) return
    setContent(saved)
    setPending({ uploads: {}, deletes: [] })
    setStatus({ kind: 'idle', text: '' })
  }

  if (loadError) {
    return (
      <main className="min-h-svh grid place-items-center px-4">
        <div className="max-w-md">
          <p role="alert" className="text-lg">
            Couldn't load the site content: {loadError}
          </p>
          <div className="mt-6 flex gap-3">
            <button type="button" className="pill pill-accent" onClick={() => window.location.reload()}>
              Try again
            </button>
            <button type="button" className="pill" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!content) {
    return (
      <main className="min-h-svh grid place-items-center">
        <p className="meta" role="status">
          Loading…
        </p>
      </main>
    )
  }

  const working = status.kind === 'working'

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 pt-8 pb-40">
      {/* title, who's signed in, and the way out */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl md:text-6xl">Admin</h1>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" rel="noopener noreferrer" className="link">
            View site
          </a>
          <span className="meta text-ink-soft">{user}</span>
          <button type="button" className="pill" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      {/* switches between the parts of the site */}
      <nav aria-label="Sections" className="mt-8 flex flex-wrap gap-2">
        {TABS.map(name => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            aria-current={tab === name ? 'page' : undefined}
            className={`pill ${tab === name ? 'bg-ink text-paper hover:bg-ink' : ''}`}
          >
            {name}
          </button>
        ))}
      </nav>

      {/* the fields for the chosen tab */}
      <main className="mt-8">
        {tab === 'Text' && <TextTab content={content} change={change} />}
        {tab === 'Experience' && <ExperienceTab content={content} change={change} />}
        {tab === 'Projects' && <ProjectsTab content={content} change={change} files={files} token={token} />}
        {tab === 'Resume' && <ResumeTab content={content} files={files} />}
      </main>

      {/* bar stuck to the bottom with the publish button */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ink bg-paper">
        <div className="mx-auto max-w-3xl px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="meta" role="status">
            {status.text || (dirty ? 'You have unpublished changes.' : 'Everything is published.')}
          </p>
          <div className="flex gap-2">
            {dirty && !working && (
              <button type="button" className="pill" onClick={discard}>
                Discard
              </button>
            )}
            <button
              type="button"
              className="pill pill-accent font-semibold disabled:bg-mute disabled:border-mute disabled:text-ink-soft disabled:cursor-not-allowed"
              disabled={!dirty || working}
              onClick={handlePublish}
            >
              {working ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [token, setToken] = useState(startingToken)

  // remembers the token for this tab only
  function signIn(next: string) {
    try {
      sessionStorage.setItem(TOKEN_KEY, next)
    } catch {
      // storage blocked, the login just won't survive a refresh
    }
    setToken(next)
  }

  // forgets the token and goes back to the sign in screen
  function signOut() {
    try {
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      // nothing saved to clear
    }
    setToken(null)
  }

  return token ? <Dashboard token={token} onSignOut={signOut} /> : <Login onToken={signIn} />
}
