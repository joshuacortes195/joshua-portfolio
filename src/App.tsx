import { useState, useEffect } from 'react'
import { projects } from './data/projects'
import { education, work, type TimelineEntry } from './data/experience'

type Tab =
  | 'about'
  | 'photography'
  | 'anime'
  | 'video-games'
  | 'projects'
  | 'education'
  | 'experience'
  | 'contact'

const ABOUT_GROUP = new Set<Tab>(['about', 'photography', 'anime', 'video-games'])

const ABOUT_SUBS: { id: Tab; label: string }[] = [
  { id: 'photography', label: 'photography/' },
  { id: 'anime',       label: 'anime/'        },
  { id: 'video-games', label: 'video-games/'  },
]

const NAV: { id: Tab; label: string }[] = [
  { id: 'about',      label: 'about.txt'   },
  { id: 'projects',   label: 'projects/'   },
  { id: 'education',  label: 'education/'  },
  { id: 'experience', label: 'experience/' },
  { id: 'contact',    label: 'contact.sh'  },
]

// ─── Animated side art: scrolling wave + dog ─────────────────────────────────

// Left panel: alternating wave styles
const WAVE_TILE_L = [
  '        ',
  '  ≈≈≈≈  ',
  ' ≈    ≈ ',
  '≈  ~~  ≈',
  ' ≈    ≈ ',
  '  ≈≈≈≈  ',
  '        ',
  '  ~~~~  ',
  ' ~    ~ ',
  '~  ≈≈  ~',
  ' ~    ~ ',
  '  ~~~~  ',
]

// Right panel: waves + a cute little dog
const WAVE_TILE_R = [
  '        ',
  '  ~~~~  ',
  ' ~    ~ ',
  '~  ≈≈  ~',
  ' ~    ~ ',
  '  ~~~~  ',
  '        ',
  '  /V\\   ',  // dog ears
  ' (o.o)  ',  // dog eyes
  ' ( u )  ',  // dog snout
  ' -===-  ',  // dog body
  '        ',
]

function WaveSidePanel({ side }: { side: 'left' | 'right' }) {
  const TILE = side === 'left' ? WAVE_TILE_L : WAVE_TILE_R
  // 10 repetitions → scroll -50% = 5 tile lengths, seamless loop
  const rows = Array.from({ length: 10 }, () => TILE).flat()
  const speed = side === 'left' ? '16s' : '22s'
  const mask = side === 'left'
    ? 'linear-gradient(to right, transparent 0%, black 70%)'
    : 'linear-gradient(to left, transparent 0%, black 70%)'

  return (
    <div
      className="shrink-0 overflow-hidden select-none pointer-events-none"
      style={{ width: '56px', maskImage: mask, WebkitMaskImage: mask }}
    >
      <div style={{ animation: `wave-scroll ${speed} linear infinite` }}>
        {rows.map((row, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              lineHeight: '1.5',
              color: '#3a4a2e',
              display: 'block',
              whiteSpace: 'pre',
            }}
          >
            {row}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Shared: typing command prompt ───────────────────────────────────────────

function TypedPrompt({ command }: { command: string }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    setShown('')
    let i = 0
    const t = setInterval(() => {
      i++
      setShown(command.slice(0, i))
      if (i >= command.length) clearInterval(t)
    }, 35)
    return () => clearInterval(t)
  }, [command])

  return (
    <p className="text-xs mb-6" style={{ color: '#7a8560' }}>
      $ {shown}
      {shown.length < command.length && (
        <span className="animate-pulse" style={{ color: '#e8b84b' }}>█</span>
      )}
    </p>
  )
}

// ─── Panel: About ────────────────────────────────────────────────────────────

function AboutPanel() {
  return (
    <div className="p-8" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <TypedPrompt command="cat about.txt" />

      {/* Name — Joshua Cortes with J and C as prominent capitals */}
      <div className="mb-5 select-none">
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '30px',
            letterSpacing: '0.06em',
            lineHeight: '1.15',
            color: '#c8a040',
          }}
        >
          <span style={{ color: '#f5cc60' }}>J</span>oshua{' '}
          <span style={{ color: '#f5cc60' }}>C</span>ortes
        </p>
      </div>

      <div className="mb-6">
        <p className="text-sm" style={{ color: '#c8a040' }}>
          Full-Stack Developer / Software Engineer
        </p>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <a
            href="/Joshua_Cortes_Resume.pdf"
            download="Joshua_Cortes_Resume.pdf"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-colors"
            style={{
              background: '#161810',
              border: '1px solid #2a2c24',
              color: '#7a8560',
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: 'none',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#e8b84b')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#7a8560')}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            $ resume.pdf
          </a>
          <span className="text-xs" style={{ color: '#4a5038' }}>
            ← click to download my resume!
          </span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #2a2c24' }} />

      <div className="mt-6 space-y-4 text-sm leading-relaxed" style={{ color: '#c8a040' }}>
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

// ─── Panel: Photography & Videography ────────────────────────────────────────

function PhotographyPanel() {
  return (
    <div className="p-8" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <TypedPrompt command="ls photography/" />
      <p className="text-sm" style={{ color: '#7a8560' }}>
        [ photos &amp; videos — coming soon ]
      </p>
      <span className="mt-2 inline-block animate-pulse" style={{ color: '#e8b84b' }}>█</span>
    </div>
  )
}

// ─── Panel: Anime ────────────────────────────────────────────────────────────

const ANIME_LIST = [
  'Attack on Titan',
  'Fullmetal Alchemist: Brotherhood',
  'Demon Slayer',
  'Jujutsu Kaisen',
  'Vinland Saga',
]

function AnimePanel() {
  return (
    <div className="p-8" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <TypedPrompt command="cat anime/watchlist.txt" />
      <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#c8a040' }}>ANIME</p>
      <ul className="space-y-1.5 text-sm" style={{ color: '#c8a040' }}>
        {ANIME_LIST.map(title => (
          <li key={title} className="flex items-center gap-2">
            <span style={{ color: '#4a5038' }}>·</span>
            {title}
          </li>
        ))}
        <li className="text-xs mt-2" style={{ color: '#4a5038' }}>— more coming soon</li>
      </ul>
    </div>
  )
}

// ─── Panel: Video Games ──────────────────────────────────────────────────────

function VideoGamesPanel() {
  return (
    <div className="p-8" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <TypedPrompt command="cat video-games/library.txt" />
      <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#c8a040' }}>VIDEO GAMES</p>
      <p className="text-sm" style={{ color: '#7a8560' }}>[ library — coming soon ]</p>
      <span className="mt-2 inline-block animate-pulse" style={{ color: '#e8b84b' }}>█</span>
    </div>
  )
}

// ─── Panel: Projects ─────────────────────────────────────────────────────────

function ProjectsPanel() {
  return (
    <div className="p-8" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <TypedPrompt command="ls -la projects/" />

      {projects.length === 0 ? (
        <div>
          <p className="text-sm" style={{ color: '#7a8560' }}>[ no entries — coming soon ]</p>
          <span className="mt-2 inline-block animate-pulse" style={{ color: '#e8b84b' }}>█</span>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className="rounded p-5"
              style={{ background: '#161810', border: '1px solid #2a2c24' }}
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-xs shrink-0" style={{ color: '#7a8560' }}>
                  [{String(i + 1).padStart(2, '0')}]
                </span>
                <span className="font-bold" style={{ color: '#f5cc60' }}>{project.title}</span>
                <span className="text-xs ml-auto shrink-0" style={{ color: '#7a8560' }}>{project.role}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: '#1e2118', color: '#c8a040', border: '1px solid #2e3228' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded transition-colors"
                style={{
                  background: '#1a1c16',
                  border: '1px solid #3a3f28',
                  color: '#7a8560',
                  fontFamily: "'JetBrains Mono', monospace",
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = '#f5cc60'
                  el.style.borderColor = '#e8b84b'
                  el.style.background = '#1e2118'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = '#7a8560'
                  el.style.borderColor = '#3a3f28'
                  el.style.background = '#1a1c16'
                }}
              >
                <span>▸</span>
                <span>try it out</span>
                <span>→</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Shared: timeline entry list ─────────────────────────────────────────────

function EntryList({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="space-y-5">
      {entries.map(entry => (
        <div key={entry.title} className="pl-4" style={{ borderLeft: '2px solid #2a2c24' }}>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-bold text-sm" style={{ color: '#f5cc60' }}>{entry.title}</span>
            <span className="text-xs ml-auto shrink-0" style={{ color: '#7a8560' }}>{entry.date}</span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#e8b84b' }}>{entry.org}</p>
          {entry.detail && (
            <p className="text-xs mt-1" style={{ color: '#7a8560' }}>{entry.detail}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Panel: Education ────────────────────────────────────────────────────────

function EducationPanel() {
  return (
    <div className="p-8" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <TypedPrompt command="cat education/index" />
      <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#c8a040' }}>EDUCATION</p>
      <EntryList entries={education} />
    </div>
  )
}

// ─── Panel: Experience ───────────────────────────────────────────────────────

function ExperiencePanel() {
  return (
    <div className="p-8" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <TypedPrompt command="cat experience/index" />
      <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#c8a040' }}>WORK EXPERIENCE</p>
      <EntryList entries={work} />
    </div>
  )
}

// ─── Panel: Contact ──────────────────────────────────────────────────────────

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY
const MY_EMAIL = 'joshuacortes195@gmail.com'

const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/joshuacortes195',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/joshua-cortes157',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V9.99H5.67v8.35h2.67zM7 8.67a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 9.67v-4.58c0-2.45-1.31-3.59-3.06-3.59-1.41 0-2.04.78-2.39 1.32v-1.13h-2.67c.04.75 0 8.35 0 8.35h2.67v-4.66c0-.24.02-.48.09-.65.19-.48.63-.97 1.36-.97.96 0 1.34.73 1.34 1.8v4.48h2.65z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/josh_cort__/',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
]

function ContactPanel() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  const canSubmit = name.trim() !== '' && email.trim() !== '' && message.trim() !== '' && status !== 'sending'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    formData.append('message', message)
    formData.append('access_key', ACCESS_KEY)
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
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
    } catch {}
  }

  const socialBtn = {
    background: '#161810',
    border: '1px solid #2a2c24',
    color: '#a07828' as string,
    fontFamily: "'JetBrains Mono', monospace",
  }

  return (
    <div className="p-8" style={{ maxWidth: '560px', margin: '0 auto' }}>
      <TypedPrompt command="./contact.sh" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-xs" style={{ color: '#7a8560' }}>name &gt;</label>
          <input
            className="terminal-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="your name"
          />
        </div>
        <div>
          <label className="block mb-1 text-xs" style={{ color: '#7a8560' }}>email &gt;</label>
          <input
            className="terminal-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>
        <div>
          <label className="block mb-1 text-xs" style={{ color: '#7a8560' }}>message &gt;</label>
          <textarea
            className="terminal-input resize-none"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            placeholder="your message..."
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded py-2.5 text-sm font-bold transition-colors"
          style={{
            background: canSubmit ? '#1e2118' : '#161810',
            border: `1px solid ${canSubmit ? '#e8b84b' : '#2a2c24'}`,
            color: canSubmit ? '#f5cc60' : '#3a3f2e',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {status === 'sending' ? '[ sending... ]' : '[ send_message ]'}
        </button>

        {status === 'sent' && (
          <p className="text-xs text-center" style={{ color: '#28c840' }}>✓ message sent successfully</p>
        )}
        {status === 'error' && (
          <p className="text-xs text-center" style={{ color: '#ff5f57' }}>
            ✗ something went wrong — try again or email me directly
          </p>
        )}
      </form>

      <div className="mt-8" style={{ borderTop: '1px solid #2a2c24' }} />
      <p className="mt-6 text-xs mb-4" style={{ color: '#7a8560' }}>connect &gt;</p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={copyEmail}
          className="flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors"
          style={socialBtn}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#e8b84b')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#a07828')}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          {copied ? 'copied!' : 'email'}
        </button>

        {socials.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors"
            style={socialBtn}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#e8b84b')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#a07828')}
          >
            {icon}
            {label}
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Tab Dispatcher ──────────────────────────────────────────────────────────

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

// ─── App Shell ───────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState<Tab>('about')
  const inAboutGroup = ABOUT_GROUP.has(active)

  return (
    <div className="h-full flex p-3" style={{ background: '#090a07' }}>
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          background: '#0d0f0c',
          fontFamily: "'JetBrains Mono', monospace",
          color: '#e8b84b',
          border: '1px solid #3d3f2e',
          borderRadius: '4px',
          boxShadow: [
            'inset 0 0 0 1px #1e2018',
            '0 0 0 1px #1a1c12',
            '0 0 0 3px #252820',
            '0 0 50px rgba(0,0,0,0.95)',
            '0 0 20px rgba(232,184,75,0.05)',
          ].join(', '),
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-3 shrink-0 px-4 py-2.5"
          style={{ background: '#161810', borderBottom: '1px solid #2a2c24' }}
        >
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="h-3 w-3 rounded-full" style={{ background: '#febc2e' }} />
            <div className="h-3 w-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <span className="flex-1 text-center text-xs tracking-wide" style={{ color: '#4a4f3a' }}>
            joshua@portfolio: ~/portfolio
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div
            className="w-52 shrink-0 flex flex-col overflow-y-auto"
            style={{ borderRight: '1px solid #2a2c24' }}
          >
            {/* Name at top of file explorer */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-sm font-bold" style={{ color: '#f5cc60' }}>Joshua Cortes</p>
              <div className="mt-1.5" style={{ borderBottom: '1px solid #2a2c24' }} />
            </div>

            <p className="px-4 pt-2 pb-1 text-xs" style={{ color: '#4a4f3a' }}>~/portfolio</p>

            <nav className="flex-1">
              {NAV.map((item, i) => {
                const isLast = i === NAV.length - 1
                const prefix = isLast ? '└── ' : '├── '
                const isAboutItem = item.id === 'about'
                const isActive = active === item.id
                const isGroupActive = isAboutItem && inAboutGroup

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => setActive(item.id)}
                      className="w-full text-left px-4 py-1.5 text-sm transition-colors"
                      style={{
                        color: isActive || isGroupActive ? '#f5cc60' : '#7a8560',
                        background: isActive ? '#1e2118' : 'transparent',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.color = '#e8b84b'
                          ;(e.currentTarget as HTMLButtonElement).style.background = '#191b17'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.color =
                            isGroupActive ? '#f5cc60' : '#7a8560'
                          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                        }
                      }}
                    >
                      <span style={{ color: '#2e3228' }}>{prefix}</span>
                      {item.label}
                    </button>

                    {/* Sub-items under about.txt */}
                    {isAboutItem && inAboutGroup && (
                      <div>
                        {ABOUT_SUBS.map((sub, si) => {
                          const isSubLast = si === ABOUT_SUBS.length - 1
                          const subPrefix = isSubLast ? '    └── ' : '    ├── '
                          const isSubActive = active === sub.id
                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActive(sub.id)}
                              className="w-full text-left px-4 py-1 text-xs transition-colors"
                              style={{
                                color: isSubActive ? '#f5cc60' : '#4a5038',
                                background: isSubActive ? '#1a1c18' : 'transparent',
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                              onMouseEnter={e => {
                                if (!isSubActive) {
                                  (e.currentTarget as HTMLButtonElement).style.color = '#c8a040'
                                  ;(e.currentTarget as HTMLButtonElement).style.background = '#181a16'
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isSubActive) {
                                  (e.currentTarget as HTMLButtonElement).style.color = '#4a5038'
                                  ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                                }
                              }}
                            >
                              <span style={{ color: '#1e2118' }}>{subPrefix}</span>
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

            <div className="px-4 py-3 text-xs" style={{ color: '#3a3f2e' }}>
              <span style={{ color: '#7a8560' }}>$</span>
              <span className="ml-1 animate-pulse">█</span>
            </div>
          </div>

          {/* Content panel with scrolling wave art on sides */}
          <div className="flex-1 overflow-hidden flex">
            <WaveSidePanel side="left" />
            <div className="flex-1 overflow-y-auto">
              <TabContent tab={active} />
            </div>
            <WaveSidePanel side="right" />
          </div>

        </div>
      </div>
    </div>
  )
}
