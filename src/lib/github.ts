import { projects, type Project } from '../data/projects'
import { site } from '../data/site'
import { prettyTag, uniqueTags } from './stack'
import { safeLink } from './links'

// repos with this topic on github get their own card
const TOPIC = site.projects.githubTopic

// the bits of a github repo we use
type Repo = {
  name: string
  html_url: string
  description: string | null
  homepage: string | null
  language: string | null
  topics?: string[]
}

// turns a repo name like "stock-predictor" into "Stock Predictor"
export function toTitle(name: string) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b[a-z]/g, c => c.toUpperCase())
}

// where the cards from github are kept for this tab, so reloads don't ask github again
const SAVED_KEY = `jc-github-cards:${TOPIC}`

// the cards saved earlier in this tab, if there are any
function readSaved(): Project[] | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SAVED_KEY) ?? 'null')
    return Array.isArray(saved) ? saved : null
  } catch {
    return null
  }
}

// asks github for my public repos tagged with the topic and turns them into cards
async function loadCards(): Promise<Project[]> {
  const user = site.github.split('/').pop()
  const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`)
  if (!res.ok) return []
  const repos: Repo[] = await res.json()

  const cards = repos
    .filter(r => r.topics?.includes(TOPIC))
    .map(r => ({
      id: r.name.toLowerCase(),
      title: toTitle(r.name),
      description: r.description ?? '',
      // main language first, then the other topics on the repo
      tags: uniqueTags([...(r.language ? [r.language] : []), ...(r.topics ?? []).filter(t => t !== TOPIC).map(prettyTag)]),
      // the repo's website is typed in by hand on github, so it only counts when it's a real https link
      demo: safeLink(r.homepage),
      github: r.html_url,
      fromGithub: true,
    }))

  try {
    sessionStorage.setItem(SAVED_KEY, JSON.stringify(cards))
  } catch {
    // storage blocked, github just gets asked again next load
  }
  return cards
}

// the one request to github, shared by everything that asks while it's still running
let loading: Promise<Project[]> | null = null

// gets my public repos tagged with the topic, as project cards
export async function fetchGithubProjects(): Promise<Project[]> {
  // no topic set means no automatic cards
  if (!TOPIC) return []
  const cards = readSaved() ?? (await (loading ??= loadCards().finally(() => (loading = null))))

  // repos that already have a hand-written card are skipped, matched by repo link or by a name that is already a card id
  const taken = new Set(projects.map(p => p.github?.toLowerCase()))
  const ids = new Set(projects.map(p => p.id.toLowerCase()))
  return cards.filter(c => !taken.has(c.github?.toLowerCase()) && !ids.has(c.id))
}
