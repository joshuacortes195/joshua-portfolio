import content from '../content/experience.json'

export type Job = {
  role: string
  company: string
  dates: string
  location: string
  // the short version shown by default
  summary: string
  // the full breakdown behind read more
  bullets: string[]
}

export type School = {
  school: string
  dates: string
  detail: string
}

// jobs and schools, newest first, edited from the admin dashboard
export const jobs: Job[] = content.jobs
export const education: School[] = content.education
