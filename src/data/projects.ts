export type Project = {
  title: string
  role: string
  tags: string[]
  description: string
  /** Live demo URL — omit for projects without a public deployment */
  link?: string
  /** Screenshot under public/projects — 960x600 (16:10) */
  image?: string
}

export const projects: Project[] = [
  {
    title: 'Asteroids Game',
    role: 'Full-Stack Developer',
    tags: ['Java', 'OOP', 'Multithreading', 'Game Development'],
    description:
      'Multiplayer space-shooter with three game modes (Single-Player, Competitive, Co-op). Architected a multi-threaded engine with 9 concurrent threads managing collision detection, physics-based movement, player input, and enemy AI.',
    link: 'https://asteroid-game01.netlify.app/',
    image: '/projects/asteroids.jpg',
  },
  {
    title: 'Stock Movement Predictor',
    role: 'Full-Stack Developer',
    tags: ['Python', 'Machine Learning', 'scikit-learn', 'React', 'REST API'],
    description:
      'Machine-learning web app that predicts next-day, next-week, and next-month stock direction for any ticker. A gradient-boosting model trained on 24 engineered features (momentum, volatility, RSI, VIX) is served through a REST API, with user accounts and a personal watchlist.',
    link: 'https://stock-predictor-o9e2.onrender.com/',
    image: '/projects/stock-predictor.jpg',
  },
  {
    title: 'Photography Portfolio — afterimage.thirds',
    role: 'Full-Stack Developer',
    tags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Google Drive API'],
    description:
      'Portfolio site for afterimage.thirds, a three-photographer collective. Server-rendered galleries pull photos straight from Google Drive through a custom image API, so new work goes live without a redeploy.',
    link: 'https://afterimagethirds.netlify.app/',
    image: '/projects/photography.jpg',
  },
  {
    title: 'Bible App',
    role: 'Full-Stack Developer',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'SQL', 'ESV API'],
    description:
      'Full-stack cross-platform Bible app with user authentication, verse highlighting, note-taking, and daily-streak tracking, backed by a SQL database. Integrates the ESV translation API and deploys to desktop, iOS, and Android from a single shared codebase.',
    link: 'https://bibleapp.lovable.app/',
    image: '/projects/bible.jpg',
  },
  {
    title: 'Wordle Game Clone',
    role: 'Full-Stack Developer',
    tags: ['JavaScript', 'HTML', 'CSS'],
    description:
      'Browser Wordle clone with theme switching, custom word-list upload, and an on-screen keyboard — faithful game logic across 5,700+ words.',
    link: 'https://wordle-clone.lovable.app/',
    image: '/projects/wordle.jpg',
  },
  {
    title: 'Pacman AI',
    role: 'AI Developer',
    tags: ['Python', 'AI', 'Search Algorithms'],
    description:
      'Implemented DFS, BFS, UCS, and A* search algorithms to autonomously navigate complex mazes, reducing state-space exploration from 620 to 14 nodes while preserving solution optimality.',
  },
  {
    title: 'Acquisition Robot',
    role: 'Robotics Engineer',
    tags: ['EV3 Mindstorms', 'AutoCAD', 'SolidWorks'],
    description:
      'Button-controlled robotic arm that retrieves and transfers objects, with custom components designed in AutoCAD and SolidWorks from LEGO, 3D-printed, and acrylic materials. Diagnosed retrieval failures as a mechanical grip limitation and redesigned the scoop, raising success rate to 99% across 100+ test cycles.',
  },
]
