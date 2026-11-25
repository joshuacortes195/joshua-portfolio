import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import { projects } from '../data/projects'
import { gsap, SplitText, useGSAP, reducedMotion } from '../lib/motion'
import { safeLink, sitePath } from '../lib/links'
import { scrollToSection } from '../lib/scroll'

// links shown across the top of the page
const links = [
  { label: 'GitHub', href: safeLink(site.github) ?? '' },
  { label: 'LinkedIn', href: safeLink(site.linkedin) ?? '' },
  { label: 'Email', href: `mailto:${site.email}` },
].filter(l => l.href)

// the resume button only shows when the resume is a real file on this site
const resume = sitePath(site.resume)

// where each project sits on the map, in percent of the hero, kept up and to the right of the headline
const SPOTS: [number, number][] = [[50, 14], [66, 24], [84, 12], [92, 32], [78, 44], [94, 58]]
// the projects that get a spot: the first ones with a picture or a clip
const PEAKS = projects.filter(p => p.media).slice(0, SPOTS.length)
// how long the crosshair stays on each one, and how long it takes to get there
const HOLD = 4200
const TRAVEL = 1500

// the opening screen: my name over the map, with a crosshair that glides from project to project and locks on
export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const intro = useRef<gsap.core.Timeline | null>(null)
  // the project the crosshair is on, and whether it has locked on yet
  const [aim, setAim] = useState(0)
  // the project the crosshair has locked onto, it only counts as locked while that's still the one aimed at
  const [lockedOn, setLockedOn] = useState(-1)
  const locked = lockedOn === aim
  // set when the mouse picks a project, so the crosshair stays put for a bit
  const paused = useRef(0)

  // builds the entrance: headline words rise and un-blur, then the rest fades in
  useGSAP(
    () => {
      if (reducedMotion()) return
      const split = SplitText.create('h1 [data-split]', { type: 'words' })
      intro.current = gsap
        .timeline({ paused: true })
        .from(split.words, { yPercent: 40, opacity: 0, filter: 'blur(8px)', duration: 0.6, ease: 'power3.out', stagger: 0.06 })
        .from('[data-hero-fade]', { opacity: 0, y: 16, filter: 'blur(8px)', duration: 0.5, ease: 'power3.out', stagger: 0.06 }, 0.15)
    },
    { scope: root },
  )

  // plays the entrance once the boot intro is out of the way
  useEffect(() => {
    if (ready) intro.current?.play()
  }, [ready])

  // moves the crosshair on to the next project every few seconds, locking on once it arrives
  useEffect(() => {
    if (PEAKS.length === 0) return
    const lock = window.setTimeout(() => setLockedOn(aim), reducedMotion() ? 0 : TRAVEL)
    const next = window.setTimeout(() => {
      if (Date.now() < paused.current) return
      setAim(a => (a + 1) % PEAKS.length)
    }, HOLD)
    return () => {
      clearTimeout(lock)
      clearTimeout(next)
    }
  }, [aim])

  const target = PEAKS[aim]
  const [x, y] = SPOTS[aim] ?? [0, 0]

  return (
    <section ref={root} id="top" className="relative min-h-svh flex flex-col px-4 md:px-8 pt-4 pb-10 overflow-hidden">
      {/* links across the top */}
      <nav aria-label="Links" data-hero-fade className="relative z-10 min-h-11 pr-28 flex items-center">
        <ul className="flex items-center gap-4 md:gap-7 text-sm md:text-base font-medium">
          {links.map(l => (
            <li key={l.label}>
              <a
                href={l.href}
                className="link inline-block py-3 px-2 -mx-2"
                {...(l.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* the projects as glowing points on the map, the crosshair and its readout, wide screens only */}
      <div className="survey hidden lg:block" aria-hidden="true">
        {PEAKS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            tabIndex={-1}
            className={`survey-peak ${SPOTS[i][0] > 80 ? 'is-flipped' : ''}`}
            style={{ left: `${SPOTS[i][0]}%`, top: `${SPOTS[i][1]}%` }}
            onMouseEnter={() => {
              paused.current = Date.now() + 6000
              setAim(i)
            }}
          >
            <i />
            <span>{p.title.toUpperCase()}</span>
          </button>
        ))}

        {/* the crosshair, it glides to the next point and a box snaps in when it locks */}
        <div className={`survey-reticle ${locked ? 'is-locked' : ''}`} style={{ left: `${x}%`, top: `${y}%` }}>
          <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="60" cy="60" r="56" strokeDasharray="4 8" />
            <path d="M60 0v22M60 98v22M0 60h22M98 60h22" />
          </svg>
          <span className="survey-box" />
        </div>

        {/* the readout card for the locked project, with its clip playing */}
        {target && (
          <div
            key={target.id}
            className={`survey-read glass ${locked ? 'is-on' : ''}`}
            style={{ left: x > 75 ? `calc(${x}% - 22rem)` : `calc(${x}% + 4.5rem)` }}
          >
            {target.media?.kind === 'video' ? (
              <video src={target.media.src} poster={target.media.poster} autoPlay muted loop playsInline preload="none" />
            ) : (
              target.media && <img src={target.media.src} alt="" />
            )}
            <div className="survey-read-top">
              <span>project {String(aim + 1).padStart(2, '0')}</span>
              <span>{site.projects.categories?.find(c => c.id === target.category)?.label ?? ''}</span>
            </div>
            <p className="survey-read-title">{target.title}</p>
            {target.stat && <p className="survey-read-stat gold-text">{target.stat.split(' · ')[0]}</p>}
          </div>
        )}
      </div>

      {/* the headline, pitch and buttons, bottom left over the darkest part of the map */}
      <div className="relative z-10 mt-auto pt-24 pb-6 md:pb-10 max-w-6xl">
        <p data-hero-fade className="eyebrow">
          {site.hero.subtitle.replace(/\.$/, '')}
        </p>
        <h1 className="mt-4">
          <span data-split className="display hero-title block">
            {site.name}
          </span>
          <span data-hero-fade className="display hero-title block gold-text pb-[0.08em]">
            {site.hero.title}
          </span>
        </h1>

        {site.hero.pitch && (
          <p data-hero-fade className="mt-6 max-w-[52ch] text-lg md:text-xl leading-snug text-ink-soft">
            {site.hero.pitch}
          </p>
        )}

        <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
          {/* jumps down to the projects */}
          <a
            href="#projects"
            onClick={e => {
              e.preventDefault()
              scrollToSection('projects')
              history.replaceState(null, '', '#projects')
            }}
            className="pill pill-accent min-h-13 px-7 text-base font-semibold"
          >
            See my projects
          </a>
          {resume && (
            <a href={resume} target="_blank" rel="noopener noreferrer" className="pill glass min-h-13 px-7 text-base font-semibold">
              {site.hero.resumeButton}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
