import type { Site } from '../data/site'
import type { Project } from '../data/projects'
import type { Job, School } from '../data/experience'

// the repo and branch the live site deploys from
export const REPO = 'joshuacortes195/joshua-portfolio'
export const BRANCH = 'main'

// biggest file the dashboard will upload, in megabytes
export const MAX_UPLOAD_MB = 40

// everything on the site that can be edited
export type Content = {
  site: Site
  projects: Project[]
  experience: { jobs: Job[]; education: School[] }
}

// where each piece of content lives in the repo
export const FILES: Record<keyof Content, string> = {
  site: 'src/content/site.json',
  projects: 'src/content/projects.json',
  experience: 'src/content/experience.json',
}

// file changes waiting for the next publish, keyed by site path like /media/clip.mp4
export type Pending = {
  uploads: Record<string, File>
  deletes: string[]
}
