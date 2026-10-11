// which kind of project a library belongs to
export type Eco = 'py' | 'js' | 'dart' | 'jvm'

// one tag the site knows how to spot: the name shown on the card and the package names that mean it's used
type Known = { name: string; eco: Eco; keys: string[] }

// every library and tool worth a tag, in the order they show up on a card
export const KNOWN: Known[] = [
  // python: machine learning
  { name: 'PyTorch', eco: 'py', keys: ['torch', 'pytorch'] },
  { name: 'TensorFlow', eco: 'py', keys: ['tensorflow'] },
  { name: 'Keras', eco: 'py', keys: ['keras'] },
  { name: 'JAX', eco: 'py', keys: ['jax'] },
  { name: 'ONNX', eco: 'py', keys: ['onnx', 'onnxruntime'] },
  { name: 'Hugging Face', eco: 'py', keys: ['transformers', 'huggingface_hub', 'huggingface-hub'] },
  { name: 'scikit-learn', eco: 'py', keys: ['sklearn', 'scikit-learn'] },
  { name: 'XGBoost', eco: 'py', keys: ['xgboost'] },
  { name: 'LightGBM', eco: 'py', keys: ['lightgbm'] },
  { name: 'OpenCV', eco: 'py', keys: ['cv2', 'opencv-python', 'opencv-python-headless'] },
  { name: 'LangChain', eco: 'py', keys: ['langchain'] },
  // python: web and apps
  { name: 'FastAPI', eco: 'py', keys: ['fastapi'] },
  { name: 'Flask', eco: 'py', keys: ['flask'] },
  { name: 'Django', eco: 'py', keys: ['django'] },
  { name: 'Streamlit', eco: 'py', keys: ['streamlit'] },
  { name: 'Gradio', eco: 'py', keys: ['gradio'] },
  { name: 'Pygame', eco: 'py', keys: ['pygame'] },
  // python: data
  { name: 'NumPy', eco: 'py', keys: ['numpy'] },
  { name: 'pandas', eco: 'py', keys: ['pandas'] },
  { name: 'SciPy', eco: 'py', keys: ['scipy'] },
  { name: 'Spark', eco: 'py', keys: ['pyspark'] },
  { name: 'SQLAlchemy', eco: 'py', keys: ['sqlalchemy'] },
  { name: 'PostgreSQL', eco: 'py', keys: ['psycopg', 'psycopg2', 'psycopg2-binary', 'asyncpg'] },
  { name: 'MongoDB', eco: 'py', keys: ['pymongo'] },
  { name: 'Redis', eco: 'py', keys: ['redis'] },
  { name: 'AWS', eco: 'py', keys: ['boto3'] },

  // javascript: frameworks
  { name: 'React', eco: 'js', keys: ['react'] },
  { name: 'Next.js', eco: 'js', keys: ['next'] },
  { name: 'React Native', eco: 'js', keys: ['react-native'] },
  { name: 'Expo', eco: 'js', keys: ['expo'] },
  { name: 'Vue', eco: 'js', keys: ['vue'] },
  { name: 'Svelte', eco: 'js', keys: ['svelte'] },
  { name: 'Angular', eco: 'js', keys: ['@angular/core'] },
  { name: 'Astro', eco: 'js', keys: ['astro'] },
  { name: 'Electron', eco: 'js', keys: ['electron'] },
  { name: 'Express', eco: 'js', keys: ['express'] },
  { name: 'NestJS', eco: 'js', keys: ['@nestjs/core'] },
  // javascript: machine learning in the browser
  { name: 'ONNX', eco: 'js', keys: ['onnxruntime-web', 'onnxruntime-node'] },
  { name: 'Hugging Face', eco: 'js', keys: ['@huggingface/transformers', '@xenova/transformers'] },
  { name: 'TensorFlow.js', eco: 'js', keys: ['@tensorflow/tfjs'] },
  // javascript: styling, graphics and build
  { name: 'Tailwind CSS', eco: 'js', keys: ['tailwindcss'] },
  { name: 'Three.js', eco: 'js', keys: ['three'] },
  { name: 'GSAP', eco: 'js', keys: ['gsap'] },
  { name: 'D3', eco: 'js', keys: ['d3'] },
  { name: 'Vite', eco: 'js', keys: ['vite'] },
  // javascript: data and services
  { name: 'Redux', eco: 'js', keys: ['redux', '@reduxjs/toolkit'] },
  { name: 'TanStack Query', eco: 'js', keys: ['@tanstack/react-query'] },
  { name: 'GraphQL', eco: 'js', keys: ['graphql'] },
  { name: 'Socket.IO', eco: 'js', keys: ['socket.io', 'socket.io-client'] },
  { name: 'Supabase', eco: 'js', keys: ['@supabase/supabase-js'] },
  { name: 'Firebase', eco: 'js', keys: ['firebase'] },
  { name: 'Prisma', eco: 'js', keys: ['prisma', '@prisma/client'] },
  { name: 'MongoDB', eco: 'js', keys: ['mongoose', 'mongodb'] },
  { name: 'PostgreSQL', eco: 'js', keys: ['pg'] },
  { name: 'Stripe', eco: 'js', keys: ['stripe'] },
  { name: 'Google APIs', eco: 'js', keys: ['googleapis'] },

  // flutter apps
  { name: 'Flutter', eco: 'dart', keys: ['flutter'] },
  { name: 'Firebase', eco: 'dart', keys: ['firebase_core'] },

  // java
  { name: 'Spring Boot', eco: 'jvm', keys: ['spring-boot'] },
]

// other names worth writing properly when they come in as github topics
const EXTRA_NAMES = [
  'Python', 'TypeScript', 'JavaScript', 'Java', 'C#', 'C++', 'Docker', 'GitHub Actions', 'Jupyter', 'HTML', 'CSS',
  'SQL', 'AWS', 'API', 'CLI', 'AI', 'ML', 'NLP', 'LLM', 'GPT', 'WebGL', 'WebGPU', 'Node.js', '.NET', 'WPF',
]

// strips a tag down to letters and numbers, so "next.js", "nextjs" and "Next.js" all match
export function plain(tag: string) {
  return tag.toLowerCase().replace(/[^a-z0-9+#]/g, '')
}

// every known way of writing a tag, pointing at the proper one
const PROPER = new Map<string, string>()
for (const name of EXTRA_NAMES) PROPER.set(plain(name), name)
for (const k of KNOWN) {
  for (const key of k.keys) if (!PROPER.has(plain(key))) PROPER.set(plain(key), k.name)
}
for (const k of KNOWN) PROPER.set(plain(k.name), k.name)

// turns a github topic like "pytorch" or "machine-learning" into a tag like "PyTorch" or "Machine Learning"
export function prettyTag(topic: string) {
  return PROPER.get(plain(topic)) ?? topic.replace(/[-_]+/g, ' ').replace(/\b[a-z]/g, c => c.toUpperCase())
}

// drops repeats from a list of tags, however they're written
export function uniqueTags(tags: string[]) {
  const seen = new Set<string>()
  return tags.filter(tag => {
    const key = plain(tag)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}
