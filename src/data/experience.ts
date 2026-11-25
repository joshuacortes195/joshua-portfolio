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
  // the stages of the work, drawn as a little diagram on the card, leave empty for none
  steps?: string[]
  // the headline numbers under the diagram, one per line like "200+ trays an hour inspected"
  numbers?: string[]
}

export type School = {
  school: string
  dates: string
  detail: string
}

// jobs and schools, newest first, edited from the admin dashboard
export const jobs: Job[] = content.jobs as Job[]
export const education: School[] = content.education
