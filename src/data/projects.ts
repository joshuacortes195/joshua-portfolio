export type Project = {
  title: string
  role: string
  icon: string
  iconBg: string
  tags: string[]
  link: string
}

export const projects: Project[] = [
  {
    title: 'Asteroids Game',
    role: 'Full-Stack Developer',
    icon: '🪐',
    iconBg: 'bg-neutral-800',
    tags: ['Java', 'OOP', 'Game Development'],
    link: 'https://asteroid-game01.netlify.app/',
  },
  {
    title: 'Bible App',
    role: 'Full-Stack Developer',
    icon: '📖',
    iconBg: 'bg-purple-500',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    link: 'https://bibleapp.lovable.app/',
  },
  {
    title: 'Wordle Game Clone',
    role: 'Full-Stack Developer',
    icon: '🟩',
    iconBg: 'bg-neutral-800',
    tags: ['JavaScript', 'HTML', 'CSS'],
    link: 'https://wordle-clone.lovable.app/',
  },
]