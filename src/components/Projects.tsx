import { useEffect, useRef, useState } from 'react'
import { projects, type Project, type ProjectMedia } from '../data/projects'
import { site } from '../data/site'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { gsap, reducedMotion } from '../lib/motion'
import { fetchGithubProjects } from '../lib/github'

// looping clip that only plays while it's on screen
function Clip({ media }: { media: ProjectMedia }) {
  const video = useRef<HTMLVideoElement>(null)
  // with reduced motion the clip waits for a click instead of autoplaying
  const [manual] = useState(reducedMotion)

  useEffect(() => {
    const el = video.current
    if (!el || manual) return
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.4 },
    )
    watcher.observe(el)
    return () => watcher.disconnect()
  }, [manual])

  return (
    <video
      ref={video}
      className="w-full h-full object-cover"
      poster={media.poster}
      aria-label={media.alt}
      controls={manual}
      muted
      loop
      playsInline
      preload="none"
    >
      <source src={media.src} type="video/mp4" />
    </video>
  )
}

// screenshot of the project
function Shot({ media }: { media: ProjectMedia }) {
  return (
    <img className="w-full h-full object-cover" src={media.src} alt={media.alt} loading="lazy" decoding="async" />
  )
}

// stand-in screen for projects that don't have a clip or screenshot yet
function Blank({ project }: { project: Project }) {
  return (
    <div className="blank-screen w-full h-full grid place-items-center font-mono text-sm md:text-base text-accent">
      &gt; {project.id}_
    </div>
  )
}

// the clip or screenshot at the top of a card, shaped like the screen recordings
function Media({ project }: { project: Project }) {
  const media = project.media
  return (
    <div className="aspect-[1280/692] rounded-xl overflow-hidden bg-mute border border-paper/15">
      {!media ? <Blank project={project} /> : media.kind === 'video' ? <Clip media={media} /> : <Shot media={media} />}
    </div>
  )
}

// one floating dark card for a project
function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      data-cursor="project"
      className="float-card on-ink h-full flex flex-col rounded-2xl bg-ink text-paper p-1.5 md:p-3"
    >
      <Media project={project} />

      <div className="flex-1 flex flex-col px-3 md:px-3 pt-5 pb-4">
        <h3 className="display text-3xl md:text-4xl">{project.title}</h3>
        <p className="mt-3 text-base leading-snug text-mute max-w-[52ch]">{project.description}</p>

        {/* stack tags */}
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.tags.map(tag => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>

        {/* demo and code buttons, only when there is something to link, pinned to the bottom of the card */}
        {(project.demo || project.fromGithub) && (
          <div className="mt-auto pt-6 flex flex-wrap items-center gap-3">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill-accent"
                aria-label={`Live demo of ${project.title} (opens in new tab)`}
              >
                Live demo
              </a>
            )}
            {/* cards pulled from github also link to the repo */}
            {project.fromGithub && (
              <a
                href={project.github}
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

export default function Projects() {
  const track = useRef<HTMLDivElement>(null)
  // the card sitting in the middle of the wheel
  const [active, setActive] = useState(0)
  // cards on the wheel: the hand-written ones, plus any repos tagged on github
  const [list, setList] = useState(projects)

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
  useEffect(() => {
    const el = track.current
    if (!el) return
    const slots = Array.from(el.querySelectorAll<HTMLElement>('[data-slot]'))
    const flat = reducedMotion()
    let frame = 0

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
        card.style.opacity = String(1 - Math.min(Math.abs(t), 1) * 0.5)
      })
      setActive(nearest)
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
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onScroll)
    }
    // runs again when github cards get added
  }, [list.length])

  // spins the wheel so the given card ends up in the middle
  function spinTo(index: number) {
    const el = track.current
    const slot = el?.querySelectorAll<HTMLElement>('[data-slot]')[index]
    if (!el || !slot) return
    el.scrollTo({
      left: slot.offsetLeft - (el.clientWidth - slot.offsetWidth) / 2,
      behavior: reducedMotion() ? 'auto' : 'smooth',
    })
  }

  return (
    <section id="projects" className="px-4 md:px-8 py-20 md:py-28 border-t border-ink">
      {/* headline with the one github button next to it */}
      <div data-reveal className="flex flex-wrap items-end gap-x-5 md:gap-x-8 gap-y-4">
        <h2 className="display section-title">Projects</h2>
        <a
          href={site.github}
          target="_blank"
          rel="noopener noreferrer"
          className="pill md:mb-3"
          aria-label="My GitHub (opens in new tab)"
        >
          GitHub
        </a>
      </div>

      {/* the wheel, edge to edge: swipe or scroll sideways, the middle card faces you */}
      <div data-reveal className="-mx-4 md:-mx-8 mt-6 md:mt-10">
        <div ref={track} role="group" aria-label="Projects" tabIndex={0} className="wheel no-scrollbar">
          {list.map((p, i) => (
            <div
              key={p.id}
              id={`project-${p.id}`}
              data-slot
              className="wheel-slot"
              onClick={() => i !== active && spinTo(i)}
            >
              <div className="h-full">
                <ProjectCard project={p} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* arrows and a counter for the wheel */}
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => spinTo(active - 1)}
          disabled={active === 0}
          aria-label="Previous project"
          className="pill disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        <p className="meta tabular-nums" aria-live="polite">
          {String(active + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
        </p>
        <button
          type="button"
          onClick={() => spinTo(active + 1)}
          disabled={active === list.length - 1}
          aria-label="Next project"
          className="pill disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
