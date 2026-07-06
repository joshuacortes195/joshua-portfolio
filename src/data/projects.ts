import { Rocket, TrendingUp, Camera, BookOpen, LayoutGrid, Ghost, Bot, type LucideIcon } from 'lucide-react'

export type Project = {
  title: string
  role: string
  tags: string[]
  description: string
  /** Live demo URL — omit for projects without a public deployment */
  link?: string
  /** Call-to-action label for the live-demo button */
  cta?: string
  /** True when the demo needs a keyboard/mouse and won't work on phones */
  desktopOnly?: boolean
  /** Card icon */
  icon: LucideIcon
}

export const projects: Project[] = [
  {
    title: 'Asteroids Game',
    role: 'Full-Stack Developer',
    tags: ['Java', 'OOP', 'Multithreading', 'Game Development'],
    description:
      'Multiplayer space-shooter with three game modes, built on a custom engine that runs collision detection, physics, player input, and enemy AI across 9 concurrent threads.',
    link: 'https://asteroid-game01.netlify.app/',
    cta: 'Play the game',
    desktopOnly: true,
    icon: Rocket,
  },
  {
    title: 'Stock Movement Predictor',
    role: 'Full-Stack Developer',
    tags: ['Python', 'Machine Learning', 'scikit-learn', 'React', 'REST API'],
    description:
      'Machine-learning web app that predicts next-day, next-week, and next-month stock direction for any ticker using a gradient-boosting model trained on 24 engineered features, with user accounts and a personal watchlist.',
    link: 'https://stock-predictor-o9e2.onrender.com/',
    cta: 'Try the app',
    icon: TrendingUp,
  },
  {
    title: 'Photography Portfolio — afterimage.thirds',
    role: 'Full-Stack Developer',
    tags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Google Drive API'],
    description:
      'Portfolio site for a three-photographer collective whose server-rendered galleries pull photos straight from Google Drive through a custom image API, so new work goes live without a redeploy.',
    link: 'https://afterimagethirds.netlify.app/',
    cta: 'View the site',
    icon: Camera,
  },
  {
    title: 'Bible App',
    role: 'Full-Stack Developer',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'SQL', 'ESV API'],
    description:
      'Cross-platform Bible app with authentication, verse highlighting, note-taking, and daily-streak tracking that ships to desktop, iOS, and Android from a single codebase.',
    link: 'https://bibleapp.lovable.app/',
    cta: 'Try the app',
    icon: BookOpen,
  },
  {
    title: 'Wordle Game Clone',
    role: 'Full-Stack Developer',
    tags: ['JavaScript', 'HTML', 'CSS'],
    description:
      'Browser Wordle clone with faithful game logic across 5,700+ words, plus theme switching, custom word-list upload, and an on-screen keyboard.',
    link: 'https://wordle-clone.lovable.app/',
    cta: 'Play the game',
    icon: LayoutGrid,
  },
  {
    title: 'Pacman AI',
    role: 'AI Developer',
    tags: ['Python', 'AI', 'Search Algorithms'],
    description:
      'Autonomous maze navigation with DFS, BFS, UCS, and A* search, cutting state-space exploration from 620 nodes to 14 while preserving solution optimality.',
    icon: Ghost,
  },
  {
    title: 'Acquisition Robot',
    role: 'Robotics Engineer',
    tags: ['EV3 Mindstorms', 'AutoCAD', 'SolidWorks'],
    description:
      'Button-controlled robotic arm with custom AutoCAD/SolidWorks-designed components, redesigned after failure analysis to a 99% retrieval success rate across 100+ test cycles.',
    icon: Bot,
  },
]
