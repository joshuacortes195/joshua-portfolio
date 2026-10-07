import { useId, useState } from 'react'
import { jobs, education, type Job } from '../data/experience'
import { ScrollTrigger } from '../lib/motion'

// one job row: short summary up front, full breakdown behind read more
function JobRow({ job }: { job: Job }) {
  const [open, setOpen] = useState(false)
  const detailsId = useId()

  return (
    <article data-reveal className="grid gap-x-8 gap-y-4 md:grid-cols-12 border-t border-ink py-8">
      <div className="md:col-span-4">
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">{job.role}</h3>
        <p className="mt-1 text-lg">{job.company}</p>
        <p className="meta mt-3 text-ink-soft">
          {job.dates}
          <br />
          {job.location}
        </p>
      </div>

      <div className="md:col-span-8 max-w-[72ch]">
        {/* the short version */}
        <p className="text-base md:text-lg leading-snug">{job.summary}</p>

        {/* the full breakdown, slides open, page animations re-measure once it's done */}
        <div
          id={detailsId}
          inert={!open}
          onTransitionEnd={() => ScrollTrigger.refresh()}
          className={`more ${open ? 'is-open' : ''}`}
        >
          <ul className="space-y-4 text-base md:text-lg leading-snug">
            {job.bullets.map(b => (
              <li key={b} className="first:pt-6">
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* opens and closes the breakdown */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={detailsId}
          className="pill mt-5"
        >
          {open ? 'Show less' : 'Read more'}
        </button>
      </div>
    </article>
  )
}

export default function Experience() {
  return (
    <section id="experience" className="px-4 md:px-8 py-20 md:py-28 border-t border-ink">
      <h2 data-reveal className="display section-title">
        Experience
      </h2>

      {/* one row per job, role on the left and the summary on the right */}
      <div className="mt-10 md:mt-14 border-b border-ink">
        {jobs.map(job => (
          <JobRow key={job.company} job={job} />
        ))}
      </div>

      {/* schools, same row layout */}
      <h3 className="mt-16 md:mt-20 text-lg font-semibold tracking-tight mb-4">Education</h3>
      <div className="border-b border-ink">
        {education.map(s => (
          <article
            key={s.school}
            data-reveal
            className="grid gap-x-8 gap-y-2 md:grid-cols-12 border-t border-ink py-6"
          >
            <div className="md:col-span-4">
              <h4 className="text-xl md:text-2xl font-semibold tracking-tight leading-tight">{s.school}</h4>
              <p className="meta mt-2 text-ink-soft">{s.dates}</p>
            </div>
            <p className="md:col-span-8 text-base md:text-lg leading-snug">{s.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
