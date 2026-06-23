import { useState } from 'react'
import { projects } from './data/projects'
import { education, work, type TimelineEntry } from './data/experience'

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
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded transition-colors duration-150 cursor-pointer"
        style={{
          background: 'var(--color-paper)',
          border: '1px solid var(--color-rule)',
          color: 'var(--color-accent)',
          fontFamily: 'var(--font-mono)',
          textDecoration: 'none',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.background = 'var(--color-paper-hover)'
          el.style.borderColor = 'var(--color-accent)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.background = 'var(--color-paper)'
          el.style.borderColor = 'var(--color-rule)'
        }}
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

function PhotographyPanel() {
  return (
    <div className="p-8 md:p-10 max-w-2xl mx-auto w-full">
      <SectionLabel text="about / photography" />
      <h2
        className="text-3xl mb-6"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)' }}
      >
        Photography &amp; Videography
      </h2>
      <p className="text-base" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-body)' }}>
        Photos &amp; videos coming soon.{' '}
        <span className="cursor-blink" style={{ color: 'var(--color-accent-mid)' }} aria-hidden="true">|</span>
      </p>
    </div>
  )
}

// ── Anime panel ──────────────────────────────────────────────────────────────

const ANIME_LIST = [
  'Attack on Titan',
  'Fullmetal Alchemist: Brotherhood',
  'Demon Slayer',
  'Jujutsu Kaisen',
  'Vinland Saga',
]

function AnimePanel() {
  return (
    <div className="p-8 md:p-10 max-w-2xl mx-auto w-full">
      <SectionLabel text="about / anime" />
      <h2
        className="text-3xl mb-6"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)' }}
      >
        Anime
      </h2>
      <ul className="space-y-2" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
        {ANIME_LIST.map(title => (
          <li key={title} className="flex items-center gap-3 text-base">
            <span style={{ color: 'var(--color-rule)', fontFamily: 'var(--font-mono)' }}>—</span>
            {title}
          </li>
        ))}
        <li
          className="text-sm mt-3"
          style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}
        >
          more coming soon
        </li>
      </ul>
    </div>
  )
}

// ── Video games panel ────────────────────────────────────────────────────────

function VideoGamesPanel() {
  return (
    <div className="p-8 md:p-10 max-w-2xl mx-auto w-full">
      <SectionLabel text="about / video games" />
      <h2
        className="text-3xl mb-6"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)' }}
      >
        Video Games
      </h2>
      <p className="text-base" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-body)' }}>
        Library coming soon.{' '}
        <span className="cursor-blink" style={{ color: 'var(--color-accent-mid)' }} aria-hidden="true">|</span>
      </p>
    </div>
  )
}

// ── Projects panel ───────────────────────────────────────────────────────────

const ExternalLinkIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

function ProjectsPanel() {
  return (
    <div className="p-8 md:p-10 max-w-2xl mx-auto w-full">
      <SectionLabel text="projects" />
      <h2
        className="text-3xl mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-secondary)' }}
      >
        Projects
      </h2>

      {projects.length === 0 ? (
        <p className="text-base" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-body)' }}>
          Coming soon.{' '}
          <span className="cursor-blink" style={{ color: 'var(--color-accent-mid)' }} aria-hidden="true">|</span>
        </p>
      ) : (
        <div className="space-y-5">
          {projects.map((project, i) => (
            <article
              key={project.title}
              className="rounded-sm p-5 transition-colors duration-150"
              style={{
                background: 'var(--color-paper)',
                border: '1px solid var(--color-rule)',
              }}
            >
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

              <div className="flex flex-wrap gap-2 mb-4">
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

              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-colors duration-150 cursor-pointer"
                style={{
                  color: 'var(--color-accent)',
                  fontFamily: 'var(--font-mono)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent-mid)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'
                }}
                aria-label={`View ${project.title} project`}
              >
                <ExternalLinkIcon />
                View project
              </a>
            </article>
          ))}
        </div>
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
    } catch {}
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
            Something went wrong. Try again or email me directly.
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
          className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-colors duration-150 cursor-pointer"
          style={{
            background: 'var(--color-paper)',
            border:     '1px solid var(--color-rule)',
            color:      'var(--color-ink-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = 'var(--color-accent)'
            el.style.borderColor = 'var(--color-accent)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = 'var(--color-ink-secondary)'
            el.style.borderColor = 'var(--color-rule)'
          }}
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
            className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-colors duration-150 cursor-pointer"
            style={{
              background:     'var(--color-paper)',
              border:         '1px solid var(--color-rule)',
              color:          'var(--color-ink-secondary)',
              fontFamily:     'var(--font-mono)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.color = 'var(--color-accent)'
              el.style.borderColor = 'var(--color-accent)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.color = 'var(--color-ink-secondary)'
              el.style.borderColor = 'var(--color-rule)'
            }}
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
}

function Sidebar({ active, onSelect }: SidebarProps) {
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
                className="w-full text-left px-3 py-3 text-sm rounded-sm transition-colors duration-150 cursor-pointer"
                style={{
                  fontFamily:  'var(--font-body)',
                  color:       isActive || isGroupActive ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
                  background:  isActive ? 'var(--color-paper-hover)' : 'transparent',
                  borderLeft:  isActive || isGroupActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                  fontWeight:  isActive || isGroupActive ? 600 : 400,
                }}
                onMouseEnter={e => {
                  if (!isActive && !isGroupActive) {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background = 'var(--color-paper-hover)'
                    el.style.color = 'var(--color-ink)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive && !isGroupActive) {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background = 'transparent'
                    el.style.color = 'var(--color-ink-secondary)'
                  }
                }}
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
                        className="w-full text-left px-3 py-2 text-sm rounded-sm transition-colors duration-150 cursor-pointer"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize:   '0.8125rem',
                          color:      isSubActive ? 'var(--color-accent)' : 'var(--color-ink-muted)',
                          background: isSubActive ? 'var(--color-paper-hover)' : 'transparent',
                          borderLeft: isSubActive ? '2px solid var(--color-accent-mid)' : '2px solid transparent',
                        }}
                        onMouseEnter={e => {
                          if (!isSubActive) {
                            const el = e.currentTarget as HTMLButtonElement
                            el.style.color = 'var(--color-ink-secondary)'
                            el.style.background = 'var(--color-paper-hover)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSubActive) {
                            const el = e.currentTarget as HTMLButtonElement
                            el.style.color = 'var(--color-ink-muted)'
                            el.style.background = 'transparent'
                          }
                        }}
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
      <div className="px-6 py-4">
        <p
          className="text-xs"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-rule)' }}
        >
          © 2025
        </p>
      </div>
    </aside>
  )
}

// ── Mobile top nav ───────────────────────────────────────────────────────────

interface MobileNavProps {
  active: Tab
  onSelect: (t: Tab) => void
}

function MobileNav({ active, onSelect }: MobileNavProps) {
  const inAboutGroup = ABOUT_GROUP.has(active)

  return (
    <div
      className="md:hidden shrink-0"
      style={{ background: 'var(--color-paper)', borderBottom: '1px solid var(--color-rule)' }}
    >
      {/* Identity row */}
      <div className="px-5 pt-5 pb-3">
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
  const [active, setActive] = useState<Tab>('about')

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
        <Sidebar active={active} onSelect={setActive} />

        {/* Mobile top nav + content */}
        <div className="flex flex-col flex-1 min-h-0 md:h-full">
          <MobileNav active={active} onSelect={setActive} />

          <main
            id="main-content"
            className="flex-1 overflow-y-auto"
            tabIndex={-1}
            style={{ background: 'var(--color-canvas)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <TabContent tab={active} />
          </main>
        </div>
      </div>
    </>
  )
}
