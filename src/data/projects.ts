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
  demo?: string
  github?: string
  // true when the demo needs a keyboard and won't work on phones
  desktopOnly?: boolean
  // cards without media are text only
  media?: ProjectMedia
}

// every project card, resume projects first
export const projects: Project[] = [
  {
    id: 'bird-identifier',
    title: 'Bird Identifier',
    description:
      'Fine-tuned ConvNeXt-V2 model that classifies 555 North American bird species at 89% top-1 and 98.8% top-5 accuracy, converted to ONNX for 1.4x faster CPU inference and shipped as a live web app.',
    tags: ['Python', 'PyTorch', 'ONNX', 'FastAPI', 'React', 'TypeScript', 'Docker'],
    demo: 'https://bird-identifier-zeta.vercel.app/',
    github: 'https://github.com/joshuacortes195/Bird-Identifier',
    media: {
      kind: 'image',
      src: '/media/bird-identifier.jpg',
      alt: 'Bird Identifier naming a peregrine falcon from a photo, with the other possible matches listed',
    },
  },
  {
    id: 'stock-predictor',
    title: 'Stock Movement Predictor',
    description:
      'ML pipeline over 1.27M rows of S&P 500 market data with time series cross-validation, served by a Flask REST API on PostgreSQL with live predictions, password hashing, and rate limiting.',
    tags: ['Python', 'scikit-learn', 'Flask', 'PostgreSQL', 'React', 'Docker', 'AWS'],
    demo: 'https://stock-predictor-o9e2.onrender.com/',
    github: 'https://github.com/joshuacortes195/stock-predictor',
    media: {
      kind: 'video',
      src: '/media/stock-predictor.mp4',
      poster: '/media/stock-predictor.jpg',
      alt: 'Screen recording of the Stock Movement Predictor',
    },
  },
  {
    id: 'book-app',
    title: 'Book App',
    description:
      'Full-stack Bible app with login, verse highlighting, notes, and daily streaks, using the ESV API and shipping to desktop, iOS, and Android from one codebase.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'SQL', 'ESV API'],
    demo: 'https://bibleapp.lovable.app/',
    media: {
      kind: 'video',
      src: '/media/book-app.mp4',
      poster: '/media/book-app.jpg',
      alt: 'Screen recording of the Book App',
    },
  },
  {
    id: 'asteroids',
    title: 'Asteroids Game',
    description:
      'Multiplayer space shooter with three game modes and a 9-thread engine handling collisions, physics, player input, and enemy AI.',
    tags: ['Java', 'Swing', 'AWT'],
    demo: 'https://asteroid-game01.netlify.app/',
    desktopOnly: true,
    media: {
      kind: 'video',
      src: '/media/asteroids.mp4',
      poster: '/media/asteroids.jpg',
      alt: 'Gameplay from the Asteroids game',
    },
  },
  {
    id: 'photography-portfolio',
    title: 'Photography Portfolio',
    description:
      'Portfolio site for a three-photographer collective whose server-rendered galleries pull photos straight from Google Drive through a custom image API, so new work goes live without a redeploy.',
    tags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Google Drive API'],
    demo: 'https://afterimagethirds.netlify.app/',
    github: 'https://github.com/joshuacortes195/photography-portfolio',
  },
  {
    id: 'wordle-clone',
    title: 'Wordle Game Clone',
    description:
      'Browser Wordle clone with faithful game logic across 5,700+ words, plus theme switching, custom word-list upload, and an on-screen keyboard.',
    tags: ['JavaScript', 'HTML', 'CSS'],
    demo: 'https://wordle-clone.lovable.app/',
  },
  {
    id: 'pacman-ai',
    title: 'Pacman AI',
    description:
      'Autonomous maze navigation with DFS, BFS, UCS, and A* search, cutting state-space exploration from 620 nodes to 14 while preserving solution optimality.',
    tags: ['Python', 'AI', 'Search Algorithms'],
  },
  {
    id: 'acquisition-robot',
    title: 'Acquisition Robot',
    description:
      'Button-controlled robotic arm with custom AutoCAD/SolidWorks-designed components, redesigned after failure analysis to a 99% retrieval success rate across 100+ test cycles.',
    tags: ['EV3 Mindstorms', 'AutoCAD', 'SolidWorks'],
  },
]
