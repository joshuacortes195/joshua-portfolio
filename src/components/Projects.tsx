import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { projects, type Project } from '../data/projects'
import { site } from '../data/site'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { gsap, reducedMotion } from '../lib/motion'
import { fetchGithubProjects } from '../lib/github'
import { safeLink } from '../lib/links'
import ProjectMedia from './ProjectMedia'
import ProjectDetail from './ProjectDetail'
import StatLine from './StatLine'

// one floating dark card for a project, active when it's the one in the middle of the wheel
// onMore opens the bigger write-up, and gets the button that was pressed so focus can come back to it
function ProjectCard({ project, active, onMore }: { project: Project; active: boolean; onMore: (opener: HTMLElement) => void }) {
  // links only show when they are real https addresses
  const demo = safeLink(project.demo)
  const code = project.fromGithub ? safeLink(project.github) : undefined
  // the read more button only shows when there is a write-up to open
  const more = typeof project.details === 'string' && project.details.trim() !== ''

  return (
    <article
      data-cursor="project"
      className="float-card on-ink h-full flex flex-col rounded-2xl md:rounded-3xl bg-ink text-paper p-1.5 md:p-3"
    >
      <ProjectMedia project={project} active={active} />

      <div className="flex-1 flex flex-col px-3 md:px-3 pt-5 pb-4">
        <h3 className="display text-3xl md:text-4xl">{project.title}</h3>
        {/* headline numbers for the project, only when there are some */}
        {project.stat && <StatLine stat={project.stat} className="meta mt-3 text-accent" />}
        <p className="mt-3 text-base leading-snug text-mute max-w-[52ch]">{project.description}</p>

        {/* stack tags */}
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag, i) => (
            <li key={i} className="tag">
              {tag}
            </li>
          ))}
        </ul>

        {/* demo, read more and code buttons, only when there is something behind them, pinned to the bottom of the card */}
        {(demo || code || more) && (
          <div className="mt-auto pt-6 flex flex-wrap items-center gap-3">
            {demo && (
              <a
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill-accent"
                aria-label={`Live demo of ${project.title} (opens in new tab)`}
              >
                Live demo
              </a>
            )}
            {/* opens the bigger write-up for this project */}
            {more && (
              <button
                type="button"
                className="pill pill-on-ink"
                aria-haspopup="dialog"
                aria-label={`Read more about ${project.title}`}
                onClick={e => onMore(e.currentTarget)}
              >
                Read more
              </button>
            )}
            {/* cards pulled from github also link to the repo */}
            {code && (
              <a
                href={code}
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill-on-ink"
                aria-label={`Code for ${project.title} (opens in new tab)`}
              >
                View code
              </a>
            )}
            {project.desktopOnly && <p className="meta text-mute">Desktop only, needs a keyboard</p>}
          </div>
        )}
      </div>
    </article>
  )
}

// how far a card one step off center turns away, in degrees
const TURN = 34

// the filter that shows every project
const ALL = 'all'

export default function Projects() {
  const track = useRef<HTMLDivElement>(null)
  // the card sitting in the middle of the wheel
  const [active, setActive] = useState(0)
  // the card the wheel is heading to, so fast clicks count on from there and not from the card going past
  const target = useRef(0)
  // true while the wheel is on its way to a card picked with an arrow or the list
  const spinning = useRef(false)
  // cards on the wheel: the hand-written ones, plus any repos tagged on github
  const [list, setList] = useState(projects)
  // the category picked in the filter row, or all of them
  const [filter, setFilter] = useState(ALL)
  // the project whose write-up is open, if any
  const [reading, setReading] = useState<Project | null>(null)
  // the read more button that opened the write-up, focus goes back to it on close
  const opener = useRef<HTMLElement | null>(null)

  // categories that have at least one project, in the order set in the dashboard
  const categories = (site.projects.categories ?? [])
    .filter(c => c.label.trim() !== '')
    .map(c => ({ ...c, count: list.filter(p => p.category === c.id).length }))
    .filter(c => c.count > 0)
  // the cards on the wheel right now, github cards have no category so they only show under all
  const shown = filter === ALL ? list : list.filter(p => p.category === filter)

  // adds the tagged github repos to the end of the wheel, the page works fine without them
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

  // turns the cards as the wheel scrolls, the middle one faces you and the rest swing away
  // set up before the browser paints, so a changed set of cards never shows with the old turn on them
  useLayoutEffect(() => {
    const el = track.current
    if (!el) return
    const slots = Array.from(el.querySelectorAll<HTMLElement>('[data-slot]'))
    const flat = reducedMotion()
    let frame = 0
    let settle = 0

    function update() {
      frame = 0
      const middle = el!.scrollLeft + el!.clientWidth / 2
      let nearest = 0
      let best = Infinity
      slots.forEach((slot, i) => {
        // how many cards away from the middle this one is
        const off = (slot.offsetLeft + slot.offsetWidth / 2 - middle) / slot.offsetWidth
        if (Math.abs(off) < best) {
          best = Math.abs(off)
          nearest = i
        }
        if (flat) return
        const t = gsap.utils.clamp(-1.5, 1.5, off)
        const card = slot.firstElementChild as HTMLElement
        // side cards turn, shrink and dim like they're going around the wheel
        card.style.transform = `perspective(1100px) rotateY(${t * TURN}deg) scale(${1 - Math.abs(t) * 0.1})`
        card.style.opacity = String(1 - Math.min(Math.abs(t), 1) * 0.35)
      })
      setActive(nearest)
      // once the wheel has stopped, wherever it stopped is where the arrows count from
      clearTimeout(settle)
      settle = window.setTimeout(() => {
        target.current = nearest
        spinning.current = false
      }, 150)
    }

    // at most one update per frame
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    // sideways trackpad swipes spin the wheel instead of being taken by the page scroll
    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation()
    }

    update()
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settle)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onScroll)
    }
    // runs again when github cards get added or the filter changes the cards
  }, [list.length, filter])

  // shows one category, or everything, and counts the wheel from its first card again
  // the wheel itself is built fresh for each filter, so it starts at the first card with no spin left over from the last one
  function pick(next: string) {
    if (next === filter) return
    target.current = 0
    spinning.current = false
    setActive(0)
    setFilter(next)
  }

  // spins the wheel so the given card ends up in the middle
  function spinTo(index: number) {
    const el = track.current
    const slot = el?.querySelectorAll<HTMLElement>('[data-slot]')[index]
    if (!el || !slot) return
    const left = slot.offsetLeft - (el.clientWidth - slot.offsetWidth) / 2
    target.current = index
    // only counts as on its way when there is somewhere to go, a card already in the middle never scrolls
    spinning.current = Math.abs(left - el.scrollLeft) > 1
    el.scrollTo({ left, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }

  // moves the wheel one card back or forward, and does nothing at either end
  function step(by: number) {
    // mid-spin the arrows count from where the wheel is heading, after a swipe by hand from the card in the middle
    const from = spinning.current ? target.current : active
    const next = gsap.utils.clamp(0, Math.max(shown.length - 1, 0), from + by)
    if (next !== from) spinTo(next)
  }

  // after a write-up closes, the wheel turns to the card it belongs to and its read more button gets focus back
  function backToCard() {
    const button = opener.current
    const slot = button?.closest('[data-slot]')
    const slots = Array.from(track.current?.querySelectorAll('[data-slot]') ?? [])
    if (slot && slots.includes(slot)) spinTo(slots.indexOf(slot))
    // the wheel does the moving, so focus doesn't yank the card into view on its own
    button?.focus({ preventScroll: true })
  }

  // a github link that isn't a real https address isn't shown
  const github = safeLink(site.github)

  return (
    <section id="projects" className="px-4 md:px-8 py-20 md:py-28 border-t border-ink">
      {/* headline with the one github button next to it */}
      <div data-reveal className="flex flex-wrap items-end gap-x-5 md:gap-x-8 gap-y-4">
        <h2 className="display section-title">{site.projects.title}</h2>
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="pill md:mb-3"
            aria-label="My GitHub (opens in new tab)"
          >
            GitHub
          </a>
        )}
      </div>

      {/* filter buttons: everything, or one category at a time, only when some projects have a category */}
      {categories.length > 0 && (
        <div data-reveal role="group" aria-label="Filter projects by category" className="mt-6 md:mt-8 flex flex-wrap gap-2">
          {[{ id: ALL, label: 'All', count: list.length }, ...categories].map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c.id)}
              aria-pressed={filter === c.id}
              // read out as one phrase, like "Games, 2 projects"
              aria-label={`${c.label}, ${c.count} ${c.count === 1 ? 'project' : 'projects'}`}
              className="pill filter-pill"
            >
              {c.label}
              {/* how many projects are in it */}
              <span className="filter-count">{c.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* the wheel, edge to edge: swipe or scroll sideways, the middle card faces you */}
      <div data-reveal className={`-mx-4 md:-mx-8 ${categories.length > 0 ? 'mt-2 md:mt-4' : 'mt-6 md:mt-10'}`}>
        <div key={filter} ref={track} role="group" aria-label="Projects" tabIndex={0} className="wheel no-scrollbar">
          {shown.map((p, i) => (
            <div
              key={p.id}
              id={`project-${p.id}`}
              data-slot
              className="wheel-slot"
              onClick={() => i !== active && spinTo(i)}
            >
              <div className="h-full">
                {/* the clip stops while a write-up is open over the page */}
                <ProjectCard
                  project={p}
                  active={i === active && !reading}
                  onMore={button => {
                    opener.current = button
                    setReading(p)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* arrows for the wheel, they dim at the ends but keep keyboard focus */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-disabled={active <= 0}
          aria-label="Previous project"
          className="pill aria-disabled:opacity-30 aria-disabled:pointer-events-none"
        >
          <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        {/* tells screen readers which project is in the middle now */}
        <p className="sr-only" aria-live="polite">
          Project {Math.min(active + 1, shown.length)} of {shown.length}
          {shown[active] ? `: ${shown[active].title}` : ''}
        </p>
        <button
          type="button"
          onClick={() => step(1)}
          aria-disabled={active >= shown.length - 1}
          aria-label="Next project"
          className="pill aria-disabled:opacity-30 aria-disabled:pointer-events-none"
        >
          <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {/* every project by name, so the whole list shows at a glance, click one to spin the wheel to it */}
      <ol className="wheel-index">
        {shown.map((p, i) => (
          <li key={p.id}>
            <button type="button" onClick={() => spinTo(i)} aria-current={i === active ? 'true' : undefined}>
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {p.title}
            </button>
          </li>
        ))}
      </ol>

      {/* the bigger write-up for one project, on top of the page */}
      {reading && (
        <ProjectDetail
          project={reading}
          onClose={() => setReading(null)}
          onClosed={backToCard}
        />
      )}
    </section>
  )
}
