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
// the number goes up whenever the saved shape changes, so an old tab never reads cards it can't draw
const SAVED_KEY = `jc-github-cards:v2:${TOPIC}`
// when github last failed to answer in this tab
const FAILED_KEY = `jc-github-failed:v2:${TOPIC}`
// how long to leave github alone after it fails, like when the hourly limit is used up, in milliseconds
const RETRY_AFTER = 10 * 60 * 1000

// true when something has everything a card needs to be drawn
function isCard(card: unknown): card is Project {
  const c = card as Project | null
  return (
    typeof c === 'object' &&
    c !== null &&
    typeof c.id === 'string' &&
    typeof c.title === 'string' &&
    Array.isArray(c.tags) &&
    c.tags.every(t => typeof t === 'string')
  )
}

// the cards saved earlier in this tab, if there are any, or no cards for a while after github failed
function readSaved(): Project[] | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SAVED_KEY) ?? 'null')
    // anything that isn't a clean list of cards is thrown out and asked for again
    if (Array.isArray(saved) && saved.every(isCard)) return saved
    const failedAt = Number(sessionStorage.getItem(FAILED_KEY))
    return failedAt && Date.now() - failedAt < RETRY_AFTER ? [] : null
  } catch {
    return null
  }
}

// remembers that github just failed, so the next loads in this tab don't keep asking
function markFailed() {
  try {
    sessionStorage.setItem(FAILED_KEY, String(Date.now()))
  } catch {
    // storage blocked, github just gets asked again next load
  }
}

// asks github for my public repos tagged with the topic and turns them into cards
async function loadCards(): Promise<Project[]> {
  const user = site.github.split('/').pop()
  const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`).catch(() => null)
  const repos: Repo[] | null = res?.ok ? await res.json().catch(() => null) : null
  if (!Array.isArray(repos)) {
    markFailed()
    return []
  }

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
