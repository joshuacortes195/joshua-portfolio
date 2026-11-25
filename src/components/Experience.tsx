import { useId, useRef, useState } from 'react'
import { jobs, education, type Job } from '../data/experience'
import { site } from '../data/site'
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from '../lib/motion'

// a small animated diagram for a job: the stages of the work joined by lines, with gold pulses running through
type Diagram = { nodes: string[]; metrics: { value: string; label: string }[] }

// builds a job's diagram from what's typed in the dashboard, a job with no steps or numbers just shows none
function diagramFor(job: Job): Diagram | undefined {
  const nodes = (job.steps ?? []).map(s => s.trim()).filter(Boolean)
  // each number line is the big number first, then what it means: "200+ trays an hour inspected"
  const metrics = (job.numbers ?? [])
    .map(line => line.trim().match(/^(\S+)\s+(.+)$/))
    .filter(m => m !== null)
    .map(m => ({ value: m[1], label: m[2] }))
  return nodes.length || metrics.length ? { nodes, metrics } : undefined
}

// the diagram drawn as boxes on a line, the pulses are css animations so they cost nothing
function Pipeline({ diagram }: { diagram: Diagram }) {
  const n = diagram.nodes.length
  // spacing for the boxes across the drawing
  const W = 1100
  const gap = W / Math.max(n, 1)
  return (
    <div className="pipe">
      {n > 0 && (
        <svg viewBox={`0 0 ${W} 96`} className="pipe-svg" aria-hidden="true">
          {/* the line through every stage and the pulse riding along it */}
          <line x1={gap / 2} y1="48" x2={W - gap / 2} y2="48" className="pipe-wire" />
          <line x1={gap / 2} y1="48" x2={W - gap / 2} y2="48" pathLength={100} className="pipe-pulse" />
          <line x1={gap / 2} y1="48" x2={W - gap / 2} y2="48" pathLength={100} className="pipe-pulse late" />
          {diagram.nodes.map((node, i) => {
            const cx = gap / 2 + i * gap
            return (
              <g key={node} className="pipe-node" style={{ animationDelay: `${i * 0.35}s` }}>
                <rect x={cx - gap / 2 + 6} y="28" width={gap - 12} height="40" rx="9" />
                <text x={cx} y="53" textAnchor="middle">
                  {node}
                </text>
              </g>
            )
          })}
        </svg>
      )}
      {/* on a phone the stages wrap as chips instead, the drawing would be too small to read */}
      {n > 0 && (
        <ol className="pipe-chips">
          {diagram.nodes.map(node => (
            <li key={node}>{node}</li>
          ))}
        </ol>
      )}
      {/* the headline numbers under the drawing */}
      {diagram.metrics.length > 0 && (
        <ul className="pipe-metrics">
          {diagram.metrics.map(m => (
            <li key={m.label}>
              <strong className="gold-text">{m.value}</strong>
              <span>{m.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// one job: a glass card on the timeline, short summary up front, diagram, full breakdown behind read more
function JobCard({ job, startOpen }: { job: Job; startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen)
  const detailsId = useId()
  const diagram = diagramFor(job)

  return (
    <article data-reveal className="job">
      {/* the glowing point on the timeline */}
      <span className="job-node" aria-hidden="true" />
      <div className="job-card glass">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">{job.role}</h3>
            <p className="mt-1 text-lg text-blue-soft">{job.company}</p>
          </div>
          <p className="meta text-ink-soft md:text-right">
            {job.dates}
            <br />
            {job.location}
          </p>
        </div>

        <p className="mt-5 max-w-[70ch] text-base md:text-lg leading-snug">{job.summary}</p>

        {diagram && <Pipeline diagram={diagram} />}

        {/* the full breakdown, slides open, page animations re-measure once it's done */}
        <div id={detailsId} inert={!open} onTransitionEnd={() => ScrollTrigger.refresh()} className={`more ${open ? 'is-open' : ''}`}>
          <ul className="space-y-4 text-base md:text-lg leading-snug max-w-[72ch]">
            {job.bullets.map((b, i) => (
              <li key={i} className="relative pl-6 first:pt-6 before:content-['>'] before:absolute before:left-0 before:font-mono before:text-[0.85em] before:text-accent first:before:top-6">
                {b}
              </li>
            ))}
          </ul>
        </div>

        <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls={detailsId} className="pill glass mt-6">
          {open ? 'Show less' : 'Read more'}
        </button>
      </div>
    </article>
  )
}

export default function Experience() {
  const root = useRef<HTMLElement>(null)

  // the gold line down the timeline fills in as you scroll past the jobs
  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.fromTo(
        '.timeline-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.timeline',
            start: 'top 70%',
            end: 'bottom 60%',
            scrub: true,
          },
        },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} id="experience" className="px-4 md:px-8 py-20 md:py-28">
      <p data-reveal className="eyebrow">
        {site.experience.eyebrow}
      </p>
      <h2 data-reveal className="display section-title mt-3">
        {site.experience.title}
      </h2>

      {/* the jobs down a timeline, newest first */}
      <div className="timeline mt-10 md:mt-14">
        <span className="timeline-line" aria-hidden="true">
          <span className="timeline-fill" />
        </span>
        {jobs.map((job, i) => (
          <JobCard key={i} job={job} startOpen={false} />
        ))}
      </div>

      {/* schools, as two glass cards */}
      <h3 data-reveal className="mt-16 md:mt-20 text-2xl md:text-3xl font-semibold tracking-tight">
        {site.experience.educationTitle}
      </h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {education.map((s, i) => (
          <article key={i} data-reveal className="school glass">
            <p className="meta text-accent">{s.dates}</p>
            <h4 className="mt-2 text-xl md:text-2xl font-semibold tracking-tight leading-tight">{s.school}</h4>
            <p className="mt-2 text-base md:text-lg leading-snug text-card-mute">{s.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
