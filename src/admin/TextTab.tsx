import { useState } from 'react'
import type { Content } from './config'
import { Group, Text, Area, List, RowTools } from './fields'
import { moveItem } from './list'

type Props = {
  content: Content
  // makes a change to the content
  change: (edit: (draft: Content) => void) => void
}

// the list of project categories: add, rename, reorder and remove
function CategoryEditor({ content, change }: Props) {
  // an older site file may not have the list yet
  const categories = content.site.projects.categories ?? []
  const [newLabel, setNewLabel] = useState('')

  // adds a category to the end, with an id made from its name that no other category has
  function add() {
    const label = newLabel.trim()
    if (!label) return
    const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category'
    let id = base
    for (let n = 2; categories.some(c => c.id === id); n++) id = `${base}-${n}`
    change(d => void (d.site.projects.categories = [...(d.site.projects.categories ?? []), { id, label }]))
    setNewLabel('')
  }

  // takes a category off the list, and off every project that was filed under it
  function remove(id: string) {
    change(d => {
      d.site.projects.categories = (d.site.projects.categories ?? []).filter(c => c.id !== id)
      for (const p of d.projects) if (p.category === id) delete p.category
    })
  }

  return (
    <Group title="Project categories">
      <p className="text-ink-soft">
        The filter buttons above the project wheel, in this order. A category only shows once a project is filed under it,
        which is set on each project in the Projects tab.
      </p>

      {/* one row per category: its name, how many projects use it, and the move and delete buttons */}
      {categories.map((category, i) => {
        const used = content.projects.filter(p => p.category === category.id).length
        return (
          <div key={category.id} className="border-t border-ink pt-4 flex flex-wrap items-end justify-between gap-3">
            <div className="flex-1 min-w-48">
              {/* renaming keeps the id, so projects stay filed under it */}
              <Text
                label={`Category ${i + 1}`}
                value={category.label}
                onChange={v =>
                  change(d => {
                    const target = d.site.projects.categories.find(c => c.id === category.id)
                    if (target) target.label = v
                  })
                }
                hint={used === 1 ? '1 project' : `${used} projects`}
              />
            </div>
            <RowTools
              name={category.label || 'this category'}
              index={i}
              count={categories.length}
              onMove={to => change(d => moveItem(d.site.projects.categories, i, to))}
              onDelete={() => remove(category.id)}
            />
          </div>
        )
      })}

      {/* add a new one */}
      <form
        className="border-t border-ink pt-4 flex flex-wrap items-end gap-3"
        onSubmit={e => {
          e.preventDefault()
          add()
        }}
      >
        <div className="flex-1 min-w-48">
          <Text label="New category" value={newLabel} onChange={setNewLabel} />
        </div>
        <button type="submit" className="pill" disabled={!newLabel.trim()}>
          Add category
        </button>
      </form>
    </Group>
  )
}

// every bit of text on the site that isn't a job or a project
export default function TextTab({ content, change }: Props) {
  const { site } = content

  return (
    <div className="space-y-6">
      {/* top of the page */}
      <Group title="Hero">
        <Text label="Name" value={site.name} onChange={v => change(d => void (d.site.name = v))} />
        <Text label="Big title" value={site.hero.title} onChange={v => change(d => void (d.site.hero.title = v))} />
        <Text label="Line under the title" value={site.hero.subtitle} onChange={v => change(d => void (d.site.hero.subtitle = v))} />
        <Area label="Short pitch under the title" value={site.hero.pitch ?? ''} onChange={v => change(d => void (d.site.hero.pitch = v))} />
        <Text label="Resume button" value={site.hero.resumeButton} onChange={v => change(d => void (d.site.hero.resumeButton = v))} />
      </Group>

      {/* email and profile links used all over the site */}
      <Group title="Links">
        <Text label="Email" value={site.email} onChange={v => change(d => void (d.site.email = v))} />
        <Text label="GitHub" value={site.github} onChange={v => change(d => void (d.site.github = v))} />
        <Text label="LinkedIn" value={site.linkedin} onChange={v => change(d => void (d.site.linkedin = v))} />
      </Group>

      {/* the big headline of each section */}
      <Group title="Section titles">
        <Text label="Experience" value={site.experience.title} onChange={v => change(d => void (d.site.experience.title = v))} />
        <Text label="Education" value={site.experience.educationTitle} onChange={v => change(d => void (d.site.experience.educationTitle = v))} />
        <Text label="Projects" value={site.projects.title} onChange={v => change(d => void (d.site.projects.title = v))} />
        <Text label="Contact" value={site.contact.title} onChange={v => change(d => void (d.site.contact.title = v))} />
      </Group>

      {/* the filter buttons above the project wheel */}
      <CategoryEditor content={content} change={change} />

      {/* contact form wording */}
      <Group title="Contact form">
        <Text label="Send button" value={site.contact.sendButton} onChange={v => change(d => void (d.site.contact.sendButton = v))} />
        <Text label="Message after sending" value={site.contact.sentMessage} onChange={v => change(d => void (d.site.contact.sentMessage = v))} />
      </Group>

      {/* what the little computers print */}
      <Group title="Boot screens">
        <List label="Intro boot log" lines value={site.boot.intro} onChange={v => change(d => void (d.site.boot.intro = v))} />
        <List label="Menu boot log" lines rows={3} value={site.boot.menu} onChange={v => change(d => void (d.site.boot.menu = v))} />
        <Text label="Menu question" value={site.boot.menuPrompt} onChange={v => change(d => void (d.site.boot.menuPrompt = v))} />
      </Group>

      {/* browser tab title and the preview shown when the link is shared */}
      <Group title="Search and sharing">
        <Text label="Browser tab title" value={site.seo.title} onChange={v => change(d => void (d.site.seo.title = v))} />
        <Area label="Search description" value={site.seo.description} onChange={v => change(d => void (d.site.seo.description = v))} />
        <Text label="Share title" value={site.seo.shareTitle} onChange={v => change(d => void (d.site.seo.shareTitle = v))} />
        <Area label="Share description" value={site.seo.shareDescription} onChange={v => change(d => void (d.site.seo.shareDescription = v))} />
      </Group>
    </div>
  )
}
