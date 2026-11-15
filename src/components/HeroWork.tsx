import { useEffect, useState } from 'react'
import { projects } from '../data/projects'
import { reducedMotion } from '../lib/motion'
import { scrollToSection } from '../lib/scroll'

// the first few projects that have a picture, shown in the hero so the work is on screen before any scrolling
const shown = projects
  .filter(p => p.media)
  .slice(0, 4)
  .map(p => ({
    id: p.id,
    title: p.title,
    stat: p.stat,
    // a clip is shown by its still frame here, the clip itself plays down in the projects section
    src: p.media!.kind === 'video' ? p.media!.poster : p.media!.src,
    alt: p.media!.alt,
  }))
  .filter(p => p.src)

// how long each project stays up before the next one fades in
const HOLD_MS = 3800

export default function HeroWork() {
  const [at, setAt] = useState(0)
  // stops changing while the pointer or keyboard focus is on it, so nothing moves under a click
  const [held, setHeld] = useState(false)

  // moves on to the next project, unless motion is turned down or it is being held
  useEffect(() => {
    if (held || shown.length < 2 || reducedMotion()) return
    const timer = setTimeout(() => setAt(i => (i + 1) % shown.length), HOLD_MS)
    return () => clearTimeout(timer)
  }, [at, held])

  if (!shown.length) return null
  const current = shown[at]

  return (
    <a
      href="#projects"
      data-hero-fade
      aria-label={`See my projects, starting with ${current.title}`}
      onClick={e => {
        e.preventDefault()
        scrollToSection('projects')
        history.replaceState(null, '', '#projects')
      }}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="hero-work group block"
    >
      {/* the pictures sit on top of each other and only the current one is solid */}
      <div className="hero-work-frame">
        {shown.map((p, i) => (
          <img
            key={p.id}
            src={p.src}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="hero-work-shot"
            data-on={i === at}
          />
        ))}
      </div>

      {/* which project it is, its one line of numbers, and a tick for each project in the set */}
      <div className="mt-3 flex items-baseline gap-4 font-mono text-sm" aria-hidden="true">
        <span className="shrink-0">
          <span className="text-ink-soft">{String(at + 1).padStart(2, '0')}</span> {current.title}
        </span>
        {current.stat && <span className="min-w-0 truncate text-ink-soft">{current.stat}</span>}
        <span className="ml-auto flex shrink-0 gap-1.5">
          {shown.map((p, i) => (
            <span key={p.id} className="hero-work-tick" data-on={i === at} />
          ))}
        </span>
      </div>
    </a>
  )
}
