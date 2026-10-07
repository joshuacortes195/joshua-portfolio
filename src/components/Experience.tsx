import { jobs, education } from '../data/experience'

export default function Experience() {
  return (
    <section id="experience" className="px-4 md:px-8 py-20 md:py-28 border-t border-ink">
      <h2 data-reveal className="display section-title">
        Experience
      </h2>

      {/* one row per job, role on the left and bullets on the right */}
      <div className="mt-10 md:mt-14 border-b border-ink">
        {jobs.map(job => (
          <article
            key={job.company}
            data-reveal
            className="grid gap-x-8 gap-y-4 md:grid-cols-12 border-t border-ink py-8"
          >
            <div className="md:col-span-4">
              <h3 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">{job.role}</h3>
              <p className="mt-1 text-lg">{job.company}</p>
              <p className="meta mt-3 text-ink-soft">
                {job.dates}
                <br />
                {job.location}
              </p>
            </div>

            <ul className="md:col-span-8 space-y-4 text-base md:text-lg leading-snug max-w-[72ch]">
              {job.bullets.map(b => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>
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
