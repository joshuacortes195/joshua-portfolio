import { REPO, BRANCH, FILES, type Content, type Pending } from './config'

const API = 'https://api.github.com'

// thrown when github says no, keeps the status so a 401 can log me out
export class GithubError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// one call to the github api with my token
async function request(token: string, path: string, init: RequestInit = {}, accept = 'application/vnd.github+json') {
  const res = await fetch(API + path, {
    ...init,
    // always ask github for fresh data, never a cached copy
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, Accept: accept, ...init.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new GithubError(res.status, body?.message ?? `GitHub error ${res.status}`)
  }
  return res
}

// same call, for when the answer is json
async function api<T>(token: string, path: string, body?: unknown, method = body ? 'POST' : 'GET'): Promise<T> {
  const res = await request(token, path, body ? { method, body: JSON.stringify(body) } : { method })
  return res.json()
}

// the account the token belongs to
export function fetchUser(token: string) {
  return api<{ login: string }>(token, '/user')
}

// reads the three content files from the repo, so the dashboard always starts from what was last published
export async function loadContent(token: string): Promise<Content> {
  const read = async (path: string) => {
    const res = await request(token, `/repos/${REPO}/contents/${path}?ref=${BRANCH}`, {}, 'application/vnd.github.raw+json')
    return JSON.parse(await res.text())
  }
  const [site, projects, experience] = await Promise.all([read(FILES.site), read(FILES.projects), read(FILES.experience)])
  return { site, projects, experience }
}

// the bits of a repo used to fill in a project
export type Repo = {
  name: string
  html_url: string
  description: string | null
  homepage: string | null
  language: string | null
  topics?: string[]
  fork: boolean
}

// my own repos, most recently pushed first
export function fetchRepos(token: string) {
  return api<Repo[]>(token, '/user/repos?affiliation=owner&visibility=public&per_page=100&sort=pushed')
}

// turns a file into base64 text, which is how github takes uploads
function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

type TreeEntry = { path: string; mode: '100644'; type: 'blob'; sha?: string | null; content?: string }

// saves everything as one commit on the live branch, which kicks off a new deploy
export async function publish(
  token: string,
  content: Content,
  pending: Pending,
  message: string,
  onStep: (text: string) => void,
) {
  const repo = `/repos/${REPO}`

  // finds the newest commit so ours goes on top of it
  onStep('Checking the repo')
  const ref = await api<{ object: { sha: string } }>(token, `${repo}/git/ref/heads/${BRANCH}`)
  const head = ref.object.sha
  const commit = await api<{ tree: { sha: string } }>(token, `${repo}/git/commits/${head}`)

  // the three content files, written out fresh
  const entries: TreeEntry[] = (Object.keys(FILES) as (keyof Content)[]).map(key => ({
    path: FILES[key],
    mode: '100644',
    type: 'blob',
    content: JSON.stringify(content[key], null, 2) + '\n',
  }))

  // uploads each new file, site paths like /media/x.mp4 live under public/ in the repo
  const uploads = Object.entries(pending.uploads)
  for (const [i, [sitePath, file]] of uploads.entries()) {
    onStep(`Uploading ${file.name} (${i + 1} of ${uploads.length})`)
    const blob = await api<{ sha: string }>(token, `${repo}/git/blobs`, {
      content: await toBase64(file),
      encoding: 'base64',
    })
    entries.push({ path: `public${sitePath}`, mode: '100644', type: 'blob', sha: blob.sha })
  }

  // removes old files, but only ones that are really in the repo
  if (pending.deletes.length) {
    const tree = await api<{ tree: { path: string }[] }>(token, `${repo}/git/trees/${commit.tree.sha}?recursive=1`)
    const existing = new Set(tree.tree.map(t => t.path))
    for (const sitePath of pending.deletes) {
      const path = `public${sitePath}`
      if (existing.has(path)) entries.push({ path, mode: '100644', type: 'blob', sha: null })
    }
  }

  // builds the commit and moves the branch to it
  onStep('Saving')
  const tree = await api<{ sha: string }>(token, `${repo}/git/trees`, { base_tree: commit.tree.sha, tree: entries })
  const next = await api<{ sha: string }>(token, `${repo}/git/commits`, { message, tree: tree.sha, parents: [head] })
  await api(token, `${repo}/git/refs/heads/${BRANCH}`, { sha: next.sha }, 'PATCH')
}
