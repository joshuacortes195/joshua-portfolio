import { useEffect, useRef, useState } from 'react'
import { projects, type Project, type ProjectMedia } from '../data/projects'
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from '../lib/motion'

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

// the clip or screenshot at the top of a card, shaped like the screen recordings
function Media({ media }: { media: ProjectMedia }) {
  return (
    <div data-media className="aspect-[1280/692] rounded-xl overflow-hidden bg-mute border border-paper/15">
      {media.kind === 'video' ? <Clip media={media} /> : <Shot media={media} />}
    </div>
  )
}

// one floating dark card for a project
function ProjectCard({ project }: { project: Project }) {
  return (
    <article data-cursor="project" className="float-card on-ink rounded-2xl bg-ink text-paper p-3 md:p-4">
      {project.media && <Media media={project.media} />}

      <div className={`px-2 md:px-3 pb-4 ${project.media ? 'pt-6' : 'pt-4'}`}>
        <h3 className="display text-3xl md:text-4xl">{project.title}</h3>
        <p className="mt-4 text-base leading-snug text-mute max-w-[62ch]">{project.description}</p>

        {/* stack tags */}
        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tags.map(tag => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>

        {/* demo and github buttons, only the ones that exist */}
        {(project.demo || project.github) && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
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
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill-on-ink"
                aria-label={`${project.title} on GitHub (opens in new tab)`}
              >
                GitHub
              </a>
            )}
            {project.desktopOnly && <p className="meta text-mute">Desktop only, needs a keyboard</p>}
          </div>
        )}
      </div>
    </article>
  )
}

// hand-picked width, sideways nudge, gap above and tilt for each card, so nothing lines up
const SCATTER = [
  { w: '100%', x: '0%', gap: '0rem', tilt: '-1.4deg' },
  { w: '80%', x: '20%', gap: '0rem', tilt: '2deg' },
  { w: '76%', x: '8%', gap: '5rem', tilt: '1.3deg' },
  { w: '96%', x: '0%', gap: '9rem', tilt: '-1deg' },
  { w: '88%', x: '12%', gap: '7rem', tilt: '-2.2deg' },
  { w: '70%', x: '6%', gap: '4rem', tilt: '1.8deg' },
  { w: '72%', x: '0%', gap: '10rem', tilt: '2.4deg' },
  { w: '84%', x: '16%', gap: '6rem', tilt: '-1.6deg' },
]

// cards alternate between a left and a right column on desktop
const columns = [0, 1].map(side => projects.map((p, i) => ({ p, i })).filter(({ i }) => i % 2 === side))

export default function Projects() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      const slots = gsap.utils.toArray<HTMLElement>('[data-slot]')
      slots.forEach(slot => {
        // card grows and fades in as it scrolls up
        gsap.from(slot.querySelector('[data-enter]'), {
          scale: 0.9,
          opacity: 0,
          y: 80,
          ease: 'none',
          scrollTrigger: { trigger: slot, start: 'top 100%', end: 'top 65%', scrub: 0.6 },
        })

        // card bobs gently so it looks like it's floating
        const bob = gsap.to(slot.querySelector('article'), {
          y: gsap.utils.random(-16, -9),
          rotation: gsap.utils.random(-0.7, 0.7),
          duration: gsap.utils.random(2.6, 3.8),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          paused: true,
        })

        // only bob while the card is on screen, so hidden cards cost nothing
        ScrollTrigger.create({
          trigger: slot,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: self => (self.isActive ? bob.play() : bob.pause()),
        })

        // media wipes open from the top
        const media = slot.querySelector('[data-media]')
        if (media) {
          gsap.fromTo(
            media,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.1,
              ease: 'power3.inOut',
              scrollTrigger: { trigger: slot, start: 'top 75%', once: true },
            },
          )
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="projects" className="px-4 md:px-8 py-20 md:py-28 border-t border-ink">
      <h2 data-reveal className="display section-title">
        Projects
      </h2>

      {/* two columns of floating cards, one column on phones */}
      <div className="mt-10 md:mt-16 flex flex-col gap-10 md:grid md:grid-cols-2 md:gap-x-12 lg:gap-x-20 md:items-start max-w-6xl mx-auto">
        {columns.map((column, side) => (
          <div key={side} className={`contents md:block ${side === 1 ? 'md:mt-28' : ''}`}>
            {column.map(({ p, i }) => (
              <div
                key={p.id}
                id={`project-${p.id}`}
                data-slot
                className="scatter scroll-mt-20"
                style={
                  {
                    order: i,
                    '--w': SCATTER[i % SCATTER.length].w,
                    '--x': SCATTER[i % SCATTER.length].x,
                    '--gap': SCATTER[i % SCATTER.length].gap,
                    '--tilt': SCATTER[i % SCATTER.length].tilt,
                  } as React.CSSProperties
                }
              >
                <div data-enter>
                  <ProjectCard project={p} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
