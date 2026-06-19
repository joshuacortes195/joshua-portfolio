import { GraduationCap, Briefcase, Calendar } from 'lucide-react'
import { education, work, type TimelineEntry } from '../data/experience'

function Column({
  title,
  icon,
  entries,
}: {
  title: string
  icon: React.ReactNode
  entries: TimelineEntry[]
}) {
  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-4 text-white">
        {icon}
        <h3 className="text-lg font-bold">{title}</h3>
      </div>

      <div className="mt-6 space-y-6">
        {entries.map((entry) => (
          <div
            key={entry.title}
            className="rounded-lg border-l-4 border-neutral-900 bg-white p-5 shadow-sm"
          >
            <h4 className="font-bold">{entry.title}</h4>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
              <Calendar className="h-4 w-4" />
              {entry.date}
            </div>
            <p className="mt-3 font-semibold text-neutral-700">{entry.org}</p>
            {entry.detail && (
              <p className="mt-1 text-sm text-neutral-500">{entry.detail}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Experience() {
  return (
    <section id="experience" className="py-24">
      <div className="mx-auto max-w-5xl px-8">
        <h2 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
          Experience &amp; Education
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <Column
            title="Education"
            icon={<GraduationCap className="h-5 w-5" />}
            entries={education}
          />
          <Column
            title="Work Experience"
            icon={<Briefcase className="h-5 w-5" />}
            entries={work}
          />
        </div>
      </div>
    </section>
  )
}