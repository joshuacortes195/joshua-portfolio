import { KNOWN, prettyTag, uniqueTags, type Eco } from '../lib/stack.ts'

// how the detector reads from github, so it doesn't care where the token comes from
export type Reader = {
  json: <T>(path: string) => Promise<T>
  text: (path: string) => Promise<string>
}

// the bits of a repo the detector needs
export type StackRepo = {
  full_name: string
  default_branch: string
  topics?: string[]
}

// most tags a card gets, so the cards stay a sensible height
const MAX_TAGS = 12
// languages under this share of the code don't get a tag
const MIN_SHARE = 0.05
// supporting tools that get dropped first when a repo has more tags than fit
const MINOR = new Set(['NumPy', 'pandas', 'SciPy', 'Vite', 'Jupyter', 'GitHub Actions'])
// how many python files get read for their imports
const MAX_PY_FILES = 15

// which libraries go with which language
const ECO_OF: Record<string, Eco> = { Python: 'py', TypeScript: 'js', JavaScript: 'js', Dart: 'dart', Java: 'jvm', Kotlin: 'jvm' }

// things github counts as languages that aren't worth a tag
const SKIP_LANGUAGES = new Set(['Dockerfile', 'Makefile', 'Shell', 'PowerShell', 'Batchfile', 'Procfile', 'Jupyter Notebook'])

type TreeFile = { path: string; type: string; size?: number }

// the file name at the end of a path
function baseName(path: string) {
  return path.split('/').pop()!
}

// package names in a python requirements or pyproject file, comments ignored
function pythonPackages(text: string) {
  const noComments = text.replace(/#.*$/gm, '')
  return (noComments.match(/[A-Za-z0-9_.-]+/g) ?? []).map(t => t.toLowerCase())
}

// the top level module of every import in a python file, so "from torch.nn import x" gives "torch"
function pythonImports(text: string) {
  return [...text.matchAll(/^\s*(?:import|from)\s+([A-Za-z0-9_]+)/gm)].map(m => m[1].toLowerCase())
}

// every package a package.json depends on
function nodePackages(text: string) {
  try {
    const pkg = JSON.parse(text)
    return Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
  } catch {
    return []
  }
}

// works out the tags for a repo from its languages, dependency files, imports and topics
export async function detectStack(repo: StackRepo, read: Reader, skipTopic = '') {
  const base = `/repos/${repo.full_name}`
  const [languages, tree] = await Promise.all([
    read.json<Record<string, number>>(`${base}/languages`),
    read.json<{ tree: TreeFile[] }>(`${base}/git/trees/${repo.default_branch}?recursive=1`),
  ])

  // files in the repo, minus installed packages and build output
  const files = tree.tree.filter(f => f.type === 'blob' && !/(^|\/)(node_modules|vendor|dist|build|\.venv|venv)\//.test(f.path))

  // the files that list what a project depends on
  const named = (test: RegExp) => files.filter(f => test.test(baseName(f.path))).slice(0, 4)
  const nodeFiles = named(/^package\.json$/)
  const pyFiles = named(/^(requirements.*\.txt|pyproject\.toml|environment\.ya?ml|Pipfile)$/)
  const dartFiles = named(/^pubspec\.yaml$/)
  const jvmFiles = named(/^(pom\.xml|build\.gradle(\.kts)?)$/)

  // python projects often leave big libraries out of the dependency list, so the code's imports get read too
  const pySources = files
    .filter(f => f.path.endsWith('.py') && !/(^|\/)tests?\//.test(f.path) && (f.size ?? 0) < 200_000)
    .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
    .slice(0, MAX_PY_FILES)

  // reads a group of files, a file that fails to load just counts as empty
  const readAll = (group: TreeFile[]) =>
    Promise.all(group.map(f => read.text(`${base}/contents/${f.path.split('/').map(encodeURIComponent).join('/')}`).catch(() => '')))
  const [nodeText, pyText, dartText, jvmText, sourceText] = await Promise.all(
    [nodeFiles, pyFiles, dartFiles, jvmFiles, pySources].map(readAll),
  )

  // every package name found, grouped by kind of project
  const found: Record<Eco, Set<string>> = {
    js: new Set(nodeText.flatMap(nodePackages)),
    py: new Set([...pyText.flatMap(pythonPackages), ...sourceText.flatMap(pythonImports)]),
    dart: new Set(dartText.flatMap(pythonPackages)),
    jvm: new Set(),
  }
  // java build files name things like "spring-boot-starter-web", so they're searched instead of split up
  for (const k of KNOWN.filter(k => k.eco === 'jvm')) {
    if (k.keys.some(key => jvmText.some(t => t.includes(key)))) found.jvm.add(k.keys[0])
  }

  // the libraries from the known list that this repo uses, for one kind of project
  const libraries = (eco: Eco) => KNOWN.filter(k => k.eco === eco && k.keys.some(key => found[eco].has(key))).map(k => k.name)

  // languages with a real share of the code, biggest first
  const total = Object.values(languages).reduce((sum, n) => sum + n, 0) || 1
  const share = (name: string) => (languages[name] ?? 0) / total
  const usesLibraries = (['py', 'js', 'dart', 'jvm'] as const).some(eco => libraries(eco).length > 0)
  const main = Object.keys(languages)
    .sort((a, b) => languages[b] - languages[a])
    .filter(name => share(name) >= MIN_SHARE && !SKIP_LANGUAGES.has(name))
    // html and css only count for plain sites, next to real libraries they're a given
    .filter(name => !(usesLibraries && (name === 'HTML' || name === 'CSS')))

  // each language followed by the libraries that go with it
  const tags: string[] = []
  for (const name of main) {
    tags.push(name)
    if (ECO_OF[name]) tags.push(...libraries(ECO_OF[name]))
  }
  // libraries whose language was too small to list still count
  for (const eco of ['py', 'js', 'dart', 'jvm'] as const) tags.push(...libraries(eco))

  // tools that show up as files instead of packages
  if (share('Jupyter Notebook') >= MIN_SHARE) tags.push('Jupyter')
  if (files.some(f => /^(Dockerfile|docker-compose)/i.test(baseName(f.path)))) tags.push('Docker')
  if (files.some(f => f.path.startsWith('.github/workflows/'))) tags.push('GitHub Actions')

  // anything extra I tagged the repo with on github goes last
  tags.push(...(repo.topics ?? []).filter(t => t !== skipTopic).map(prettyTag))

  // too many tags: the supporting tools go first, from the end
  const list = uniqueTags(tags)
  for (let i = list.length - 1; i >= 0 && list.length > MAX_TAGS; i--) {
    if (MINOR.has(list[i])) list.splice(i, 1)
  }
  return list.slice(0, MAX_TAGS)
}
