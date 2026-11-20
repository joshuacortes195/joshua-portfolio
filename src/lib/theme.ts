import { useSyncExternalStore } from 'react'

// one look for the site: its name in the url and in storage, what the picker calls it, and the colors on its swatch
export type Theme = {
  id: string
  label: string
  // page color, used for the swatch and the phone's address bar
  paper: string
  // card color and accent, the other two bits of the swatch
  card: string
  accent: string
  // the wood or grain picture behind the page, shown in the swatch too
  texture?: string
}

// every theme, the first one is what new visitors get
// keep the ids in step with public/theme-init.js and the blocks in src/index.css
export const THEMES: Theme[] = [
  { id: 'paper', label: 'Original', paper: '#FFFFFF', card: '#0D0D0D', accent: '#FFB547' },
  { id: 'walnut', label: 'Walnut', paper: '#2A1D15', card: '#1A120C', accent: '#E9A440', texture: '/textures/walnut.svg' },
  { id: 'cabin', label: 'Cabin', paper: '#1F1712', card: '#130D0A', accent: '#F27D3A', texture: '/textures/cabin.svg' },
  { id: 'mahogany', label: 'Mahogany', paper: '#2D1513', card: '#1B0C0A', accent: '#D9AE55', texture: '/textures/mahogany.svg' },
  { id: 'oak', label: 'Leather & Oak', paper: '#3A2A1C', card: '#4A2618', accent: '#EDB75F', texture: '/textures/oak.svg' },
  { id: 'hearth', label: 'Hearth', paper: '#18110E', card: '#241A15', accent: '#FF9E57', texture: '/textures/hearth.svg' },
]

const KEY = 'theme'
const EVENT = 'themechange'

// looks up a theme by id, falls back to the default for anything unknown
function find(id: string | null | undefined) {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}

// the theme on the page right now, theme-init.js already set it before the first paint
export function currentTheme() {
  return find(document.documentElement.dataset.theme)
}

// switches the whole site to a theme and remembers it for next time
export function setTheme(id: string) {
  const theme = find(id)
  document.documentElement.dataset.theme = theme.id
  // the phone's address bar matches the page
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.paper)
  try {
    localStorage.setItem(KEY, theme.id)
  } catch {
    // storage blocked, the theme just lasts until the page closes
  }
  // a shared ?theme= link keeps pointing at whatever is picked now
  const url = new URL(window.location.href)
  if (url.searchParams.has('theme')) {
    url.searchParams.set('theme', theme.id)
    history.replaceState(history.state, '', url)
  }
  // tells every picker on the page to redraw
  window.dispatchEvent(new Event(EVENT))
}

// listens for theme switches so a picker can redraw
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  return () => window.removeEventListener(EVENT, onChange)
}

// the current theme id, kept up to date for react
export function useTheme() {
  return useSyncExternalStore(subscribe, () => currentTheme().id)
}
