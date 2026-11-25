import { useEffect, useMemo, useRef, useState } from 'react'
import { projects, type Project } from '../data/projects'
import { site } from '../data/site'
import { reducedMotion } from '../lib/motion'
import { fetchGithubProjects } from '../lib/github'
import { safeLink } from '../lib/links'
import ProjectDetail from './ProjectDetail'
import StatLine from './StatLine'

// the filter that shows every project
const ALL = 'all'
// how long each project stays on the big screen before the next one comes up, in ms
const DWELL = 9000
// how long the auto play waits after someone picks a project by hand
const HANDS_OFF = 30000

// a made up but steady confidence score for a project, so the label doesn't change every redraw
function confidence(id: string) {
  let n = 0
  for (const ch of id) n = (n * 31 + ch.charCodeAt(0)) % 997
  return (0.9 + (n % 9) / 100).toFixed(2)
}

// a field of ascii noise that's always the same for the same project
function asciiField(id: string) {
  const chars = ' .:-=+*#%@'
  let seed = 0
  for (const ch of id) seed = (seed * 33 + ch.charCodeAt(0)) >>> 0
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  return Array.from({ length: 22 }, () => Array.from({ length: 80 }, () => chars[Math.floor(rand() * rand() * chars.length)]).join('')).join('\n')
}

// the screen for a project with no clip or picture: static in ascii with its name
function NoSignal({ project }: { project: Project }) {
  const field = useMemo(() => asciiField(project.id), [project.id])
  return (
    <div className="bay-nosignal">
      <pre aria-hidden="true">{field}</pre>
      <p>
        &gt; {project.id}_<span>no footage yet</span>
      </p>
    </div>
  )
}

// the big camera screen: the project's clip or picture with a vision overlay on top
function Stage({ project, index, playing }: { project: Project; index: number; playing: boolean }) {
  const video = useRef<HTMLVideoElement>(null)
  // a running clock in the corner, like a camera feed
  const [clock, setClock] = useState(0)
  const media = project.media

  // plays the clip only while the screen is on view and nothing is open over it
  useEffect(() => {
    const el = video.current
    if (!el) return
    if (playing && !reducedMotion()) el.play().catch(() => {})
    else el.pause()
  }, [playing, project.id])

  // ticks the clock while it's on view
  useEffect(() => {
    if (!playing) return
    const start = Date.now()
    const id = window.setInterval(() => setClock(Date.now() - start), 100)
    return () => clearInterval(id)
  }, [playing, project.id])

  const secs = Math.floor(clock / 1000)
  const time = `00:${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}:${String(Math.floor((clock % 1000) / 40)).padStart(2, '0')}`

  return (
    <div className="bay-cam" key={project.id}>
      {/* the footage itself */}
      {!media ? (
        <NoSignal project={project} />
      ) : media.kind === 'video' ? (
        <video ref={video} src={media.src} poster={media.poster} aria-label={media.alt} muted loop playsInline preload="metadata" />
      ) : (
        <img src={media.src} alt={media.alt} decoding="async" />
      )}

      {/* the vision overlay: corners, a scan line on every switch, a box that tracks across the frame, and the readouts */}
      <div className="bay-overlay" aria-hidden="true">
        <span className="bay-corner tl" />
        <span className="bay-corner tr" />
        <span className="bay-corner bl" />
        <span className="bay-corner br" />
        <span className="bay-scan" />
        <span className="bay-track">
          <b>
            {project.title.toLowerCase()} {confidence(project.id)}
          </b>
        </span>
        <span className="bay-hud top">
          <span>
            <i /> CAM {String(index + 1).padStart(2, '0')}
          </span>
          <span>{time}</span>
        </span>
      </div>
    </div>
  )
}

// projects as an inspection bay: a big camera screen on the left, the list of feeds on the right
export default function Projects() {
  const section = useRef<HTMLElement>(null)
  // the hand-written projects, plus any repos tagged on github
  const [list, setList] = useState(projects)
  // the category picked in the filter row, or all of them
  const [filter, setFilter] = useState(ALL)
  // the project on the big screen
  const [current, setCurrent] = useState(0)
  // the project whose write-up is open, if any
  const [reading, setReading] = useState<Project | null>(null)
  // the read more button that opened the write-up, focus goes back to it on close
  const opener = useRef<HTMLElement | null>(null)
  // true while the section is on screen, the clip and the auto play only run then
  const [onScreen, setOnScreen] = useState(false)
  // true for a while after a pick by hand, the auto play holds off until it clears
  const handsOff = useRef(false)
  const handsOffTimer = useRef(0)
  // bumped to check again once the hands off wait is over
  const [tick, setTick] = useState(0)

  // categories that have at least one project, in the order set in the dashboard
  const categories = (site.projects.categories ?? [])
    .filter(c => c.label.trim() !== '')
    .map(c => ({ ...c, count: list.filter(p => p.category === c.id).length }))
    .filter(c => c.count > 0)
  const shown = filter === ALL ? list : list.filter(p => p.category === filter)
  const project = shown[Math.min(current, shown.length - 1)]
  const label = (id?: string) => categories.find(c => c.id === id)?.label ?? 'GitHub'

  // adds the tagged github repos to the end of the list, the page works fine without them
  useEffect(() => {
    let cancelled = false
    fetchGithubProjects()
      .then(extra => {
        if (!cancelled && extra.length) setList([...projects, ...extra])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // keeps track of whether the section is on screen
  useEffect(() => {
    const el = section.current
    if (!el) return
    const watcher = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.25 })
    watcher.observe(el)
    return () => watcher.disconnect()
  }, [])

  // moves on to the next project every few seconds while the section is on view
  useEffect(() => {
    if (!onScreen || reading || reducedMotion() || shown.length < 2) return
    const id = window.setTimeout(() => {
      if (handsOff.current) return setTick(t => t + 1)
      setCurrent(c => (c + 1) % shown.length)
    }, DWELL)
    return () => clearTimeout(id)
  }, [current, onScreen, reading, shown.length, tick])

  // puts a project on the big screen, picked by hand
  function choose(i: number) {
    handsOff.current = true
    clearTimeout(handsOffTimer.current)
    handsOffTimer.current = window.setTimeout(() => (handsOff.current = false), HANDS_OFF)
    setCurrent(i)
  }

  // shows one category, or everything, starting from its first project
  function pick(next: string) {
    if (next === filter) return
    setCurrent(0)
    setFilter(next)
  }

  const github = safeLink(site.github)
  const demo = safeLink(project?.demo)
  const code = project?.fromGithub ? safeLink(project.github) : undefined
  const more = typeof project?.details === 'string' && project.details.trim() !== ''

  return (
    <section ref={section} id="projects" className="px-4 md:px-8 py-20 md:py-28">
      {/* headline with the github button next to it */}
      <div data-reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="eyebrow">Selected work</p>
          <h2 className="display section-title mt-3">{site.projects.title}</h2>
        </div>
        {github && (
          <a href={github} target="_blank" rel="noopener noreferrer" className="pill glass" aria-label="My GitHub (opens in new tab)">
            GitHub
          </a>
        )}
      </div>

      {/* filter buttons: everything, or one category at a time */}
      {categories.length > 0 && (
        <div data-reveal role="group" aria-label="Filter projects by category" className="mt-8 flex flex-wrap gap-2">
          {[{ id: ALL, label: 'All', count: list.length }, ...categories].map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c.id)}
              aria-pressed={filter === c.id}
              aria-label={`${c.label}, ${c.count} ${c.count === 1 ? 'project' : 'projects'}`}
              className="pill filter-pill"
            >
              {c.label}
              <span className="filter-count">{c.count}</span>
            </button>
          ))}
        </div>
      )}

      {project && (
        <div data-reveal className="bay mt-8">
          {/* the big screen and everything about the project on it */}
          <article className="bay-main glass" data-cursor="project">
            <Stage project={project} index={current} playing={onScreen && !reading} />
            <div className="bay-info">
              <div className="min-w-0">
                <p className="eyebrow text-blue-soft">{label(project.category)}</p>
                <h3 className="display mt-2 text-4xl md:text-5xl">{project.title}</h3>
                <p className="mt-3 max-w-[60ch] text-base md:text-lg leading-snug text-card-mute">{project.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <li key={i} className="tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              {/* the headline numbers and the buttons, on the right on wide screens */}
              <div className="bay-side">
                {project.stat && <StatLine stat={project.stat} className="bay-stat" />}
                <div className="mt-5 flex flex-wrap gap-3">
                  {demo && (
                    <a href={demo} target="_blank" rel="noopener noreferrer" className="pill pill-accent" aria-label={`Live demo of ${project.title} (opens in new tab)`}>
                      Live demo
                    </a>
                  )}
                  {more && (
                    <button
                      type="button"
                      className="pill pill-on-ink"
                      aria-haspopup="dialog"
                      aria-label={`Read more about ${project.title}`}
                      onClick={e => {
                        opener.current = e.currentTarget
                        setReading(project)
                      }}
                    >
                      Read more
                    </button>
                  )}
                  {code && (
                    <a href={code} target="_blank" rel="noopener noreferrer" className="pill pill-on-ink" aria-label={`Code for ${project.title} (opens in new tab)`}>
                      View code
                    </a>
                  )}
                </div>
                {project.desktopOnly && <p className="meta mt-3 text-card-mute">Desktop only, needs a keyboard</p>}
              </div>
            </div>
          </article>

          {/* every project as a feed you can switch to, the one on screen is lit gold with a bar counting down to the next */}
          <ol className="bay-list" aria-label="Projects">
            {shown.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  aria-current={i === current ? 'true' : undefined}
                  className="bay-row"
                >
                  <span className="bay-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0">
                    <span className="bay-row-title">{p.title}</span>
                    <span className="bay-row-meta">
                      {label(p.category)}
                      {p.stat ? ` · ${p.stat.split(' · ')[0]}` : ''}
                    </span>
                  </span>
                  {p.media?.kind === 'video' && <span className="bay-live">live</span>}
                  {i === current && onScreen && !reading && <span key={`${p.id}-${current}`} className="bay-timer" />}
                </button>
              </li>
            ))}
          </ol>
          {/* tells screen readers which project is up */}
          <p className="sr-only" aria-live="polite">
            Showing {project.title}, project {current + 1} of {shown.length}
          </p>
        </div>
      )}

      {/* the bigger write-up for one project, on top of the page */}
      {reading && <ProjectDetail project={reading} onClose={() => setReading(null)} onClosed={() => opener.current?.focus({ preventScroll: true })} />}
    </section>
  )
}
