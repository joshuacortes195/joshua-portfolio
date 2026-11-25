import type { Content } from './config'
import { Group, Text, Area, List, RowTools } from './fields'
import { moveItem } from './list'

type Props = {
  content: Content
  // makes a change to the content
  change: (edit: (draft: Content) => void) => void
}

// jobs and schools
export default function ExperienceTab({ content, change }: Props) {
  const { jobs, education } = content.experience

  // new jobs and schools go on top since the lists run newest first
  function addJob() {
    change(d => void d.experience.jobs.unshift({ role: '', company: '', dates: '', location: '', summary: '', bullets: [], steps: [], numbers: [] }))
  }
  function addSchool() {
    change(d => void d.experience.education.unshift({ school: '', dates: '', detail: '' }))
  }

  return (
    <div className="space-y-6">
      <Group title="Jobs">
        <button type="button" className="pill" onClick={addJob}>
          Add job
        </button>

        {/* one block of fields per job */}
        {jobs.map((job, i) => (
          <div key={i} className="border-t border-ink pt-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{job.role || 'New job'}</h3>
              <RowTools
                name={job.role || 'this job'}
                index={i}
                count={jobs.length}
                onMove={to => change(d => moveItem(d.experience.jobs, i, to))}
                onDelete={() => change(d => void d.experience.jobs.splice(i, 1))}
              />
            </div>
            <Text label="Role" value={job.role} onChange={v => change(d => void (d.experience.jobs[i].role = v))} />
            <Text label="Company" value={job.company} onChange={v => change(d => void (d.experience.jobs[i].company = v))} />
            <Text label="Dates" value={job.dates} onChange={v => change(d => void (d.experience.jobs[i].dates = v))} />
            <Text label="Location" value={job.location} onChange={v => change(d => void (d.experience.jobs[i].location = v))} />
            <Area label="Short summary" value={job.summary} onChange={v => change(d => void (d.experience.jobs[i].summary = v))} />
            <List
              label="Bullets behind read more"
              lines
              rows={8}
              value={job.bullets}
              onChange={v => change(d => void (d.experience.jobs[i].bullets = v))}
            />
            {/* the little animated diagram on the job's card */}
            <List
              label="Diagram steps, in order"
              lines
              rows={5}
              value={job.steps ?? []}
              onChange={v => change(d => void (d.experience.jobs[i].steps = v))}
            />
            {/* the big numbers under the diagram */}
            <List
              label='Key numbers, the number first then what it means, like "200+ trays an hour inspected"'
              lines
              rows={3}
              value={job.numbers ?? []}
              onChange={v => change(d => void (d.experience.jobs[i].numbers = v))}
            />
          </div>
        ))}
      </Group>

      <Group title="Education">
        <button type="button" className="pill" onClick={addSchool}>
          Add school
        </button>

        {/* one block of fields per school */}
        {education.map((school, i) => (
          <div key={i} className="border-t border-ink pt-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{school.school || 'New school'}</h3>
              <RowTools
                name={school.school || 'this school'}
                index={i}
                count={education.length}
                onMove={to => change(d => moveItem(d.experience.education, i, to))}
                onDelete={() => change(d => void d.experience.education.splice(i, 1))}
              />
            </div>
            <Text label="School" value={school.school} onChange={v => change(d => void (d.experience.education[i].school = v))} />
            <Text label="Dates" value={school.dates} onChange={v => change(d => void (d.experience.education[i].dates = v))} />
            <Area label="Degree or coursework" value={school.detail} onChange={v => change(d => void (d.experience.education[i].detail = v))} />
          </div>
        ))}
      </Group>
    </div>
  )
}
