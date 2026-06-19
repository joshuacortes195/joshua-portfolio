import { projects } from '../data/projects'

export default function Projects() {
  return (
    <section id="projects" className="py-24">
      <div className="mx-auto max-w-7xl px-8">
        <h2 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
          Recent Projects
        </h2>
        <p className="mt-3 text-center text-neutral-500">
          Some of my recent work that you can try out!
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.title}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${project.iconBg}`}
                >
                  {project.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{project.title}</h3>
                  <p className="text-sm text-neutral-500">{project.role}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              
                <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block rounded-lg bg-neutral-900 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                Try it out
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}