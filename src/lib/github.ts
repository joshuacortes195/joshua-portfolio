import { projects, type Project } from '../data/projects'
import { site } from '../data/site'

// repos with this topic on github get their own card
const TOPIC = 'portfolio'

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
function toTitle(name: string) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b[a-z]/g, c => c.toUpperCase())
}

// gets my public repos tagged with the topic, as project cards
export async function fetchGithubProjects(): Promise<Project[]> {
  const user = site.github.split('/').pop()
  const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`)
  if (!res.ok) return []
  const repos: Repo[] = await res.json()

  // repos that already have a hand-written card are skipped
  const taken = new Set(projects.map(p => p.github?.toLowerCase()))

  return repos
    .filter(r => r.topics?.includes(TOPIC) && !taken.has(r.html_url.toLowerCase()))
    .map(r => ({
      id: r.name.toLowerCase(),
      title: toTitle(r.name),
      description: r.description ?? '',
      // main language first, then the other topics on the repo
      tags: [...(r.language ? [r.language] : []), ...(r.topics ?? []).filter(t => t !== TOPIC)],
      demo: r.homepage || undefined,
      github: r.html_url,
      fromGithub: true,
    }))
}
