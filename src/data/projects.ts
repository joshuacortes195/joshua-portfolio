import content from '../content/projects.json'

export type ProjectMedia = {
  kind: 'video' | 'image'
  // file in public/media
  src: string
  // still frame shown before a video plays
  poster?: string
  alt: string
}

export type Project = {
  id: string
  title: string
  description: string
  tags: string[]
  // one short line of numbers shown under the title, the card leaves it out when empty
  stat?: string
  demo?: string
  // repo link, kept for reference, the cards don't show it
  github?: string
  // true when the demo needs a keyboard and won't work on phones
  desktopOnly?: boolean
  // cards without media are text only
  media?: ProjectMedia
  // true for cards pulled from github instead of written here
  fromGithub?: boolean
}

// every project card, edited from the admin dashboard
export const projects = content as Project[]
