import { useEffect, useRef, useState } from 'react'
import { projects } from './data/projects'
import { education, work, type TimelineEntry } from './data/experience'
import { generalPhotos, animalPhotos, type Photo } from './data/photos'
import AnimePanel from './components/AnimePanel'
import VideoGamesPanel from './components/VideoGamesPanel'

// ── Types & constants ────────────────────────────────────────────────────────

type Tab =
  | 'about'
  | 'photography'
  | 'anime'
  | 'video-games'
  | 'projects'
  | 'education'
  | 'experience'
  | 'contact'

type Theme = 'dark' | 'light' | 'one-piece'

const ABOUT_GROUP = new Set<Tab>(['about', 'photography', 'anime', 'video-games'])

const ABOUT_SUBS: { id: Tab; label: string }[] = [
  { id: 'photography', label: 'Photography' },
  { id: 'anime',       label: 'Anime'       },
  { id: 'video-games', label: 'Video Games' },
]

const NAV: { id: Tab; label: string }[] = [
  { id: 'about',      label: 'About'      },
  { id: 'projects',   label: 'Projects'   },
  { id: 'education',  label: 'Education'  },
  { id: 'experience', label: 'Experience' },
  { id: 'contact',    label: 'Contact'    },
]

const ALL_TABS: Tab[] = [
  'about', 'photography', 'anime', 'video-games',
  'projects', 'education', 'experience', 'contact',
]

const TAB_TITLES: Record<Tab, string> = {
  'about':       'About',
  'photography': 'Photography',
  'anime':       'Anime',
  'video-games': 'Video Games',
  'projects':    'Projects',
  'education':   'Education',
  'experience':  'Experience',
  'contact':     'Contact',
}

// ── Theme ────────────────────────────────────────────────────────────────────
// Dark is the site default; a stored choice wins, otherwise follow the OS.

const THEMES: Theme[] = ['dark', 'light', 'one-piece']

const THEME_META: Record<Theme, { label: string; metaColor: string }> = {
  'dark':      { label: 'Dark',      metaColor: '#0D1117' },
  'light':     { label: 'Light',     metaColor: '#F6F8FA' },
  'one-piece': { label: 'One Piece', metaColor: '#081A2B' },
}

function initialTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if ((THEMES as string[]).includes(stored ?? '')) return stored as Theme
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function SunIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

// Straw hat — the One Piece theme icon
function StrawHatIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 14v-2a6 6 0 0 1 12 0v2" />
      <path d="M2 14h20" />
      <path d="M6 11.5h12" strokeWidth="1.2" />
    </svg>
  )
}

const THEME_ICONS: Record<Theme, () => React.ReactElement> = {
  'dark': MoonIcon,
  'light': SunIcon,
  'one-piece': StrawHatIcon,
}

function ThemePicker({
  theme,
  onSelect,
  direction,
}: {
  theme: Theme
  onSelect: (t: Theme) => void
  direction: 'up' | 'down'
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const CurrentIcon = THEME_ICONS[theme]

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="chip flex items-center justify-center rounded cursor-pointer"
        style={{ width: '44px', height: '44px' }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${THEME_META[theme].label}. Change theme`}
        title="Theme"
      >
        <CurrentIcon />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Themes"
          className={`absolute z-30 rounded p-1 min-w-36 ${direction === 'up' ? 'bottom-full mb-2 left-0' : 'top-full mt-2 right-0'}`}
          style={{
            background: 'var(--color-paper)',
            border: '1px solid var(--color-rule)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          {THEMES.map(t => {
            const Icon = THEME_ICONS[t]
            const isActive = t === theme
            return (
              <button
                key={t}
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => { onSelect(t); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-sm text-left cursor-pointer"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-ink)',
                  background: isActive ? 'var(--color-paper-hover)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <Icon />
                {THEME_META[t].label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── One Piece tab transitions ────────────────────────────────────────────────
// When the One Piece theme is active, switching tabs fires a rotating
// character effect: Luffy (Gear 5), Zoro (Santoryu), Law (Room).

type OnePieceFx = 'luffy' | 'zoro' | 'law'
const OP_FX_ORDER: OnePieceFx[] = ['luffy', 'zoro', 'law']
const OP_FX_LABELS: Record<OnePieceFx, string> = {
  luffy: 'GEAR 5',
  zoro:  'SANTORYU',
  law:   'ROOM',
}

function OnePieceTransition({ fx }: { fx: OnePieceFx }) {
  return (
    <div className={`op-fx op-fx-${fx}`} aria-hidden="true">
      {fx === 'zoro' && (
        <>
          <span className="op-slash" style={{ '--r': '-18deg', '--d': '0ms' } as React.CSSProperties} />
          <span className="op-slash" style={{ '--r': '11deg',  '--d': '90ms' } as React.CSSProperties} />
          <span className="op-slash" style={{ '--r': '-52deg', '--d': '180ms' } as React.CSSProperties} />
        </>
      )}
      <span className="op-fx-label">{OP_FX_LABELS[fx]}</span>
    </div>
  )
}

// ── Hash routing ─────────────────────────────────────────────────────────────
// The active tab lives in location.hash so tabs are deep-linkable, survive
// refresh, and the browser back/forward buttons navigate between them.

function tabFromHash(): Tab {
  const hash = window.location.hash.slice(1)
  return (ALL_TABS as string[]).includes(hash) ? (hash as Tab) : 'about'
}

// ── Shared primitives ────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <p
      className="text-xs tracking-widest uppercase mb-5"
      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
      aria-hidden="true"
    >
      — {text} —
    </p>
  )
}

function Rule({ className = '' }: { className?: string }) {
  return (
    <hr
      className={className}
      style={{ borderColor: 'var(--color-rule-subtle)', borderTopWidth: '1px', borderStyle: 'solid' }}
    />
  )
}

// Shared download icon
const DownloadIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

// ── About panel ──────────────────────────────────────────────────────────────

function AboutPanel() {
  return (
    <div className="p-8 md:p-10 max-w-2xl mx-auto w-full">
      <SectionLabel text="about" />

      <h1
        className="text-4xl md:text-5xl leading-tight mb-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)', fontWeight: 700 }}
      >
        Joshua Cortes
      </h1>

      <p
        className="text-sm mb-7"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-mid)' }}
      >
        Full-Stack Developer / Software Engineer
      </p>

      <a
        href="/Joshua_Cortes_Resume.pdf"
        download="Joshua_Cortes_Resume.pdf"
        className="chip-accent inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded cursor-pointer"
        style={{ fontFamily: 'var(--font-mono)', textDecoration: 'none', minHeight: '44px' }}
      >
        <DownloadIcon />
        resume.pdf
      </a>

      <Rule className="mt-7 mb-7" />

      <div
        className="space-y-5 text-base leading-relaxed"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)', lineHeight: '1.75' }}
      >
        <p>
          I'm a 20-year-old CS student pursuing a Bachelor's in Computer Science with a
          concentration in Machine Learning and AI at California Baptist University. I'm
          passionate about developing myself as a programmer and software engineer,
          particularly at the intersection of machine learning, AI, and robotics. My focus
          lies in how technology gives us the ability to create and solve problems — and my
          goal is that through the synergy of AI, ML, and robotics, we can support those in
          need and help people live better lives.
        </p>
        <p>
          I enjoy replicating apps and websites I use daily. My approach combines clean code
          with thoughtful design, ensuring every project I work on is maintainable, scalable,
          and user-friendly. I believe in writing code that speaks for itself and creating
          interfaces that feel natural to use.
        </p>
        <p>
          Outside of coding, I enjoy basketball, volleyball, tennis, golf, video games,
          building LEGOs, lifting, and hanging out with friends — recently my friends have
          been getting me into pickleball too.
        </p>
      </div>
    </div>
  )
}

// ── Photography panel ────────────────────────────────────────────────────────

type PhotoTab = 'photos' | 'animals'

function MasonryGallery({
  photos,
  label,
  onOpen,
}: {
  photos: Photo[]
  label: string
  onOpen: (i: number) => void
}) {
  return (
    <div
      style={{
        columnCount: 2,
        columnGap: '8px',
      }}
      className="sm:[column-count:3] md:[column-count:4]"
    >
      {photos.map((photo, i) => (
        <div key={photo.src} style={{ breakInside: 'avoid', marginBottom: '10px' }}>
          <button
            onClick={() => onOpen(i)}
            className="block w-full cursor-pointer transition-transform duration-200 hover:scale-[1.015]"
            style={{
              background:  '#FFFFFF',
              padding:     '5px',
              border:      '2px solid #111111',
              boxShadow:   '3px 4px 14px rgba(0,0,0,0.18)',
            }}
            aria-label={`Open ${label.toLowerCase()} photo ${i + 1} of ${photos.length}`}
          >
            <img
              src={photo.src}
              alt={`${label} — photo ${i + 1}`}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              className="w-full block"
              style={{ display: 'block', aspectRatio: `${photo.width} / ${photo.height}`, height: 'auto' }}
            />
          </button>
        </div>
      ))}
    </div>
  )
}

function PhotoLightbox({
  photos,
  index,
  label,
  onClose,
  onStep,
}: {
  photos: Photo[]
  index: number
  label: string
  onClose: () => void
  onStep: (dir: 1 | -1) => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef  = useRef<HTMLButtonElement>(null)

  // Keyboard support: Escape closes, arrows navigate, Tab stays inside.
  // Focus moves to the dialog on open and back to the trigger on close;
  // the main scroll region is locked while the lightbox is up.
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const main = document.getElementById('main-content')
    const prevOverflow = main?.style.overflow ?? ''
    if (main) main.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); onStep(-1); return }
      if (e.key === 'ArrowRight') { e.preventDefault(); onStep(1);  return }
      if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button')
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last  = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (main) main.style.overflow = prevOverflow
      trigger?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${label} photo viewer`}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.94)' }}
      onClick={onClose}
    >
      <button
        ref={closeRef}
        onClick={onClose}
        className="absolute top-4 right-4 flex items-center justify-center w-11 h-11 rounded-full cursor-pointer"
        style={{ background: 'var(--color-paper)', color: 'var(--color-ink-secondary)' }}
        aria-label="Close"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <button
        onClick={e => { e.stopPropagation(); onStep(-1) }}
        className="absolute left-3 flex items-center justify-center w-11 h-11 rounded-full cursor-pointer"
        style={{ background: 'var(--color-paper)', color: 'var(--color-ink-secondary)' }}
        aria-label="Previous"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <img
        src={photos[index].src}
        alt={`${label} — photo ${index + 1}`}
        width={photos[index].width}
        height={photos[index].height}
        className="max-h-[90dvh] max-w-[90vw] rounded-sm"
        style={{ objectFit: 'contain', boxShadow: '0 0 80px rgba(0,0,0,0.9)', height: 'auto' }}
        onClick={e => e.stopPropagation()}
      />

      <button
        onClick={e => { e.stopPropagation(); onStep(1) }}
        className="absolute right-3 flex items-center justify-center w-11 h-11 rounded-full cursor-pointer"
        style={{ background: 'var(--color-paper)', color: 'var(--color-ink-secondary)' }}
        aria-label="Next"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div
        aria-live="polite"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center"
      >
        {photos[index].exif && (
          <p className="text-xs mb-1" style={{ fontFamily: 'var(--font-mono)', color: '#ADB6BF' }}>
            {photos[index].exif}
          </p>
        )}
        <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#768390' }}>
          {index + 1} / {photos.length}
        </p>
      </div>
    </div>
  )
}

function PhotographyPanel() {
  const [photoTab,  setPhotoTab]  = useState<PhotoTab>('photos')
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const activePhotos = photoTab === 'photos' ? generalPhotos : animalPhotos
  const activeLabel  = photoTab === 'photos' ? 'Photos' : 'Animals'

  function openLightbox(i: number) { setLightboxIdx(i) }
  function closeLightbox()         { setLightboxIdx(null) }
  function stepLightbox(dir: 1 | -1) {
    if (lightboxIdx === null) return
    setLightboxIdx((lightboxIdx + dir + activePhotos.length) % activePhotos.length)
  }

  const PHOTO_TABS: { id: PhotoTab; label: string; count: number }[] = [
    { id: 'photos',  label: 'Photos',  count: generalPhotos.length },
    { id: 'animals', label: 'Animals', count: animalPhotos.length  },
  ]

  return (
    <div className="p-8 md:p-10 max-w-5xl mx-auto w-full">
      {/* Vintage-scoped section label */}
      <p
        className="text-xs tracking-widest uppercase mb-5"
        style={{ fontFamily: 'var(--font-mono)', color: '#6B5B45' }}
        aria-hidden="true"
      >
        — about / photography —
      </p>

      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <h2
          className="text-3xl"
          style={{ fontFamily: 'var(--font-display)', color: '#1C1812' }}
        >
          Photography
        </h2>

        {/* Vintage tab bar */}
        <div className="flex gap-1" role="tablist" aria-label="Photo categories">
          {PHOTO_TABS.map(t => {
            const isActive = photoTab === t.id
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => { setPhotoTab(t.id); setLightboxIdx(null) }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm transition-colors duration-150 cursor-pointer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  minHeight:  '44px',
                  background: isActive ? '#1C1812' : 'transparent',
                  border:     `1px solid ${isActive ? '#1C1812' : '#8B7A65'}`,
                  color:      isActive ? '#F2EBD9' : '#5C4C38',
                }}
              >
                {t.label}
                <span className="text-xs opacity-60">{t.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <MasonryGallery
        key={photoTab}
        photos={activePhotos}
        label={activeLabel}
        onOpen={openLightbox}
      />

      {lightboxIdx !== null && (
        <PhotoLightbox
          photos={activePhotos}
          index={lightboxIdx}
          label={activeLabel}
          onClose={closeLightbox}
          onStep={stepLightbox}
        />
      )}
    </div>
  )
}

// ── Anime panel ──────────────────────────────────────────────────────────────

// AnimePanel is imported from ./components/AnimePanel

// ── Video games panel ────────────────────────────────────────────────────────

// VideoGamesPanel is imported from ./components/VideoGamesPanel

// ── Projects panel ───────────────────────────────────────────────────────────

const ExternalLinkIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

// GitHub repos — fetched client-side, cached per session, hidden on failure
interface Repo {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  fork: boolean
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  Python:     '#3572A5',
  Java:       '#B07219',
  'C#':       '#178600',
  HTML:       '#E34C26',
  CSS:        '#563D7C',
}

function useGitHubRepos(username: string, count: number) {
  const [repos, setRepos] = useState<Repo[]>(() => {
    const cached = sessionStorage.getItem('gh-repos')
    return cached ? (JSON.parse(cached) as Repo[]) : []
  })

  useEffect(() => {
    if (sessionStorage.getItem('gh-repos')) return
    let cancelled = false
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`)
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: Repo[]) => {
        if (cancelled) return
        const top = data.filter(r => !r.fork).slice(0, count)
        sessionStorage.setItem('gh-repos', JSON.stringify(top))
        setRepos(top)
      })
      .catch(() => {
        // Rate limit or offline — section simply doesn't render
      })
    return () => { cancelled = true }
  }, [username, count])

  return repos
}

function ProjectsPanel() {
  const repos = useGitHubRepos('joshuacortes195', 4)

  return (
    <div className="p-8 md:p-10 max-w-2xl mx-auto w-full">
      <SectionLabel text="projects" />
      <h2
        className="text-3xl mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)' }}
      >
        Projects
      </h2>

      <div className="space-y-5">
        {projects.map((project, i) => (
          <article
            key={project.title}
            className="rounded-sm overflow-hidden transition-colors duration-150"
            style={{
              background: 'var(--color-paper)',
              border: '1px solid var(--color-rule)',
            }}
          >
            {project.image && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title} live demo (opens in new tab)`}
                className="block cursor-pointer"
                style={{ borderBottom: '1px solid var(--color-rule)' }}
              >
                <img
                  src={project.image}
                  alt={`Screenshot of ${project.title}`}
                  width={960}
                  height={600}
                  loading={i < 1 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full block transition-opacity duration-200 hover:opacity-90"
                  style={{ aspectRatio: '960 / 600', height: 'auto', objectFit: 'cover' }}
                />
              </a>
            )}

            <div className="p-5">
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-xs shrink-0"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className="text-lg font-semibold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)' }}
                  >
                    {project.title}
                  </h3>
                </div>
                <span
                  className="text-xs shrink-0"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
                >
                  {project.role}
                </span>
              </div>

              <p
                className="text-sm mb-4 leading-relaxed"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}
              >
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{
                      background: 'var(--color-accent-light)',
                      color: 'var(--color-accent)',
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid var(--color-rule)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent inline-flex items-center gap-2 text-sm mt-4 py-1 cursor-pointer"
                  style={{ fontFamily: 'var(--font-mono)', textDecoration: 'none' }}
                  aria-label={`View ${project.title} project (opens in new tab)`}
                >
                  <ExternalLinkIcon />
                  View project
                </a>
              )}
            </div>
          </article>
        ))}
      </div>

      {repos.length > 0 && (
        <>
          <Rule className="mt-10 mb-6" />
          <p
            className="text-xs mb-4 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
          >
            Recently updated on GitHub
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {repos.map(repo => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="chip block rounded-sm p-4 cursor-pointer"
                style={{ textDecoration: 'none' }}
                aria-label={`${repo.name} repository on GitHub (opens in new tab)`}
              >
                <p
                  className="text-sm font-semibold mb-1 truncate"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
                >
                  {repo.name}
                </p>
                {repo.description && (
                  <p
                    className="text-xs mb-2 leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}
                  >
                    {repo.description}
                  </p>
                )}
                {repo.language && (
                  <p className="text-xs flex items-center gap-1.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
                    <span
                      aria-hidden="true"
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: LANG_COLORS[repo.language] ?? 'var(--color-accent)' }}
                    />
                    {repo.language}
                    {repo.stargazers_count > 0 && <span>· ★ {repo.stargazers_count}</span>}
                  </p>
                )}
              </a>
            ))}
          </div>
          <a
            href="https://github.com/joshuacortes195"
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent inline-flex items-center gap-2 text-sm mt-4 py-1 cursor-pointer"
            style={{ fontFamily: 'var(--font-mono)', textDecoration: 'none' }}
          >
            <ExternalLinkIcon />
            All repositories
          </a>
        </>
      )}
    </div>
  )
}

// ── Timeline entry list ──────────────────────────────────────────────────────

function EntryList({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="space-y-6">
      {entries.map(entry => (
        <div
          key={entry.title}
          className="pl-5"
          style={{ borderLeft: '2px solid var(--color-rule)' }}
        >
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)' }}
            >
              {entry.title}
            </h3>
            <span
              className="text-xs shrink-0"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
            >
              {entry.date}
            </span>
          </div>
          <p
            className="text-base mb-1"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-accent-mid)', fontStyle: 'italic' }}
          >
            {entry.org}
          </p>
          {entry.detail && (
            <p
              className="text-sm"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}
            >
              {entry.detail}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Education panel ──────────────────────────────────────────────────────────

function EducationPanel() {
  return (
    <div className="p-8 md:p-10 max-w-2xl mx-auto w-full">
      <SectionLabel text="education" />
      <h2
        className="text-3xl mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)' }}
      >
        Education
      </h2>
      <EntryList entries={education} />
    </div>
  )
}

// ── Experience panel ─────────────────────────────────────────────────────────

function ExperiencePanel() {
  return (
    <div className="p-8 md:p-10 max-w-2xl mx-auto w-full">
      <SectionLabel text="experience" />
      <h2
        className="text-3xl mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)' }}
      >
        Work Experience
      </h2>
      <EntryList entries={work} />
    </div>
  )
}

// ── Contact panel ────────────────────────────────────────────────────────────

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY
const MY_EMAIL   = 'joshuacortes195@gmail.com'

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/joshuacortes195',
    icon: (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/joshua-cortes157',
    icon: (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V9.99H5.67v8.35h2.67zM7 8.67a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 9.67v-4.58c0-2.45-1.31-3.59-3.06-3.59-1.41 0-2.04.78-2.39 1.32v-1.13h-2.67c.04.75 0 8.35 0 8.35h2.67v-4.66c0-.24.02-.48.09-.65.19-.48.63-.97 1.36-.97.96 0 1.34.73 1.34 1.8v4.48h2.65z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/josh_cort__/',
    icon: (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
]

const MailIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

function ContactPanel() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [status,  setStatus]  = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [copied,  setCopied]  = useState(false)

  const canSubmit = name.trim() !== '' && email.trim() !== '' && message.trim() !== '' && status !== 'sending'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ACCESS_KEY) { setStatus('error'); return }
    // Honeypot: bots that fill the hidden field get silently dropped
    const botcheck = (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>('input[name="botcheck"]')
    if (botcheck?.checked) return
    setStatus('sending')
    const fd = new FormData()
    fd.append('name', name)
    fd.append('email', email)
    fd.append('message', message)
    fd.append('access_key', ACCESS_KEY)
    try {
      const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        setStatus('sent')
        setName(''); setEmail(''); setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(MY_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (older browser / permissions) — open mail app
      window.location.href = `mailto:${MY_EMAIL}`
    }
  }

  return (
    <div className="p-8 md:p-10 max-w-xl mx-auto w-full">
      <SectionLabel text="contact" />
      <h2
        className="text-3xl mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)' }}
      >
        Get in Touch
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Honeypot field for spam bots — hidden from real users and AT */}
        <input
          type="checkbox"
          name="botcheck"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
        />
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm mb-1.5"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
          >
            Name
          </label>
          <input
            id="contact-name"
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm mb-1.5"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
          >
            Email
          </label>
          <input
            id="contact-email"
            className="form-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="block text-sm mb-1.5"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
          >
            Message
          </label>
          <textarea
            id="contact-message"
            className="form-input resize-none"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            placeholder="Your message…"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded py-3 text-sm font-medium transition-colors duration-150"
          style={{
            background:   canSubmit ? 'var(--color-paper-hover)' : 'var(--color-paper)',
            border:       `1px solid ${canSubmit ? 'var(--color-accent)' : 'var(--color-rule)'}`,
            color:        canSubmit ? 'var(--color-accent)' : 'var(--color-ink-muted)',
            cursor:       canSubmit ? 'pointer' : 'not-allowed',
            fontFamily:   'var(--font-mono)',
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>

        {status === 'sent' && (
          <p
            role="status"
            className="text-sm text-center"
            style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}
          >
            Message sent — I'll get back to you soon.
          </p>
        )}
        {status === 'error' && (
          <p
            role="alert"
            className="text-sm text-center"
            style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}
          >
            Something went wrong. Try again or email me at{' '}
            <a href={`mailto:${MY_EMAIL}`} className="underline" style={{ color: 'inherit' }}>
              {MY_EMAIL}
            </a>
            .
          </p>
        )}
      </form>

      <Rule className="mt-8 mb-6" />

      <p
        className="text-xs mb-4 uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
      >
        Connect
      </p>

      <div className="flex flex-wrap gap-3" role="list">
        <button
          onClick={copyEmail}
          className="chip flex items-center gap-2 px-3 py-2.5 rounded text-sm cursor-pointer"
          style={{ fontFamily: 'var(--font-mono)', minHeight: '44px' }}
          aria-label={copied ? 'Email address copied' : 'Copy email address'}
          role="listitem"
        >
          <MailIcon />
          {copied ? 'Copied!' : 'Email'}
        </button>

        {SOCIALS.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="chip flex items-center gap-2 px-3 py-2.5 rounded text-sm cursor-pointer"
            style={{ fontFamily: 'var(--font-mono)', textDecoration: 'none', minHeight: '44px' }}
            aria-label={`${label} (opens in new tab)`}
            role="listitem"
          >
            {icon}
            {label}
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Tab dispatcher ───────────────────────────────────────────────────────────

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case 'about':        return <AboutPanel />
    case 'photography':  return <PhotographyPanel />
    case 'anime':        return <AnimePanel />
    case 'video-games':  return <VideoGamesPanel />
    case 'projects':     return <ProjectsPanel />
    case 'education':    return <EducationPanel />
    case 'experience':   return <ExperiencePanel />
    case 'contact':      return <ContactPanel />
  }
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  active: Tab
  onSelect: (t: Tab) => void
  theme: Theme
  onSelectTheme: (t: Theme) => void
}

function Sidebar({ active, onSelect, theme, onSelectTheme }: SidebarProps) {
  const inAboutGroup = ABOUT_GROUP.has(active)

  return (
    <aside
      className="hidden md:flex flex-col shrink-0 h-full overflow-y-auto"
      style={{
        width: '220px',
        background: 'var(--color-paper)',
        borderRight: '1px solid var(--color-rule)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Site navigation"
    >
      {/* Identity */}
      <div className="px-6 pt-8 pb-5">
        <p
          className="text-2xl leading-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)', fontWeight: 700 }}
        >
          Joshua<br />Cortes
        </p>
        <p
          className="mt-2 text-xs leading-snug"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
        >
          Software Engineer<br />CS Student
        </p>
      </div>

      <Rule className="mx-6" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-5" aria-label="Sections">
        {NAV.map(item => {
          const isAbout     = item.id === 'about'
          const isActive    = active === item.id
          const isGroupActive = isAbout && inAboutGroup

          return (
            <div key={item.id}>
              <button
                onClick={() => onSelect(item.id)}
                aria-current={isActive || isGroupActive ? 'page' : undefined}
                data-state={isActive ? 'active' : isGroupActive ? 'group' : undefined}
                className="nav-btn w-full text-left px-3 py-3 text-sm rounded-sm cursor-pointer"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {item.label}
              </button>

              {/* About sub-items */}
              {isAbout && inAboutGroup && (
                <div className="ml-4 mt-1 mb-1 space-y-0.5">
                  {ABOUT_SUBS.map(sub => {
                    const isSubActive = active === sub.id
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onSelect(sub.id)}
                        aria-current={isSubActive ? 'page' : undefined}
                        data-state={isSubActive ? 'active' : undefined}
                        className="nav-sub-btn w-full text-left px-3 py-2 rounded-sm cursor-pointer"
                        style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem' }}
                      >
                        {sub.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 flex items-center justify-between">
        <p
          className="text-xs"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
        >
          © 2025
        </p>
        <ThemePicker theme={theme} onSelect={onSelectTheme} direction="up" />
      </div>
    </aside>
  )
}

// ── Mobile top nav ───────────────────────────────────────────────────────────

interface MobileNavProps {
  active: Tab
  onSelect: (t: Tab) => void
  theme: Theme
  onSelectTheme: (t: Theme) => void
}

function MobileNav({ active, onSelect, theme, onSelectTheme }: MobileNavProps) {
  const inAboutGroup = ABOUT_GROUP.has(active)

  return (
    <div
      className="md:hidden shrink-0"
      style={{
        background: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-rule)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Identity row */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <p
            className="text-xl leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)', fontWeight: 700 }}
          >
            Joshua Cortes
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
          >
            Full-Stack Developer / Software Engineer
          </p>
        </div>
        <ThemePicker theme={theme} onSelect={onSelectTheme} direction="down" />
      </div>

      {/* Main nav */}
      <nav aria-label="Sections" className="overflow-x-auto px-5 pb-0">
        <div className="flex gap-1 min-w-max pb-0">
          {NAV.map(item => {
            const isActive    = active === item.id
            const isGroupActive = item.id === 'about' && inAboutGroup
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                aria-current={isActive || isGroupActive ? 'page' : undefined}
                className="px-4 py-3 text-sm whitespace-nowrap transition-colors duration-150 cursor-pointer"
                style={{
                  fontFamily:  'var(--font-body)',
                  color:       isActive || isGroupActive ? 'var(--color-accent)' : 'var(--color-ink-muted)',
                  borderBottom: isActive || isGroupActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                  background:  'transparent',
                  fontWeight:  isActive || isGroupActive ? 600 : 400,
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* About sub-nav */}
      {inAboutGroup && (
        <nav aria-label="About sections" className="overflow-x-auto px-5 pb-2 pt-1" style={{ background: 'var(--color-canvas)', borderTop: '1px solid var(--color-rule-subtle)' }}>
          <div className="flex gap-1 min-w-max">
            {ABOUT_SUBS.map(sub => {
              const isSubActive = active === sub.id
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelect(sub.id)}
                  aria-current={isSubActive ? 'page' : undefined}
                  className="px-3 py-2 text-xs whitespace-nowrap transition-colors duration-150 cursor-pointer rounded-sm"
                  style={{
                    fontFamily:  'var(--font-mono)',
                    color:       isSubActive ? 'var(--color-accent)' : 'var(--color-ink-muted)',
                    background:  isSubActive ? 'var(--color-accent-light)' : 'transparent',
                  }}
                >
                  {sub.label}
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

// ── App shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState<Tab>(tabFromHash)
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [fx, setFx] = useState<OnePieceFx | null>(null)
  const mainRef = useRef<HTMLElement>(null)
  const prevTab = useRef<Tab>(active)
  const fxIndex = useRef(0)

  // Apply theme to <html>, persist it, and keep the browser UI color in sync
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_META[theme].metaColor)
  }, [theme])

  // Unmount the transition overlay once its animation has played out
  useEffect(() => {
    if (fx === null) return
    const timer = setTimeout(() => setFx(null), 750)
    return () => clearTimeout(timer)
  }, [fx])

  // Back/forward buttons and hand-typed hashes drive the active tab
  useEffect(() => {
    const onHashChange = () => setActive(tabFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // On tab change: update title, reset scroll, move focus to the content
  // region so screen readers land in the new panel (skip initial mount)
  useEffect(() => {
    document.title = active === 'about' ? 'Joshua Cortes' : `Joshua Cortes — ${TAB_TITLES[active]}`
    if (prevTab.current !== active) {
      prevTab.current = active
      mainRef.current?.scrollTo(0, 0)
      mainRef.current?.focus({ preventScroll: true })
    }
  }, [active])

  function selectTab(tab: Tab) {
    if (tab === active) return
    if (theme === 'one-piece' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFx(OP_FX_ORDER[fxIndex.current % OP_FX_ORDER.length])
      fxIndex.current += 1
    }
    window.location.hash = tab
  }

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div
        className="flex flex-col md:flex-row h-full"
        style={{ background: 'var(--color-canvas)' }}
      >
        {/* Desktop sidebar */}
        <Sidebar active={active} onSelect={selectTab} theme={theme} onSelectTheme={setTheme} />

        {/* Mobile top nav + content */}
        <div className="flex flex-col flex-1 min-h-0 md:h-full">
          <MobileNav active={active} onSelect={selectTab} theme={theme} onSelectTheme={setTheme} />

          <main
            ref={mainRef}
            id="main-content"
            className={`flex-1 ${(active === 'anime' || active === 'video-games') ? 'overflow-hidden' : 'overflow-y-auto'}`}
            tabIndex={-1}
            style={{
              background: active === 'photography' ? '#F2EBD9' : 'var(--color-canvas)',
              paddingBottom: (active === 'anime' || active === 'video-games') ? 0 : 'env(safe-area-inset-bottom)',
            }}
          >
            <TabContent tab={active} />
          </main>

          {/* One Piece theme: character-power tab transition */}
          {fx !== null && <OnePieceTransition fx={fx} />}
        </div>
      </div>
    </>
  )
}
