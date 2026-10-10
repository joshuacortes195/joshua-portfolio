import type { Content } from './config'
import { Group, Text, Area, List } from './fields'

type Props = {
  content: Content
  // makes a change to the content
  change: (edit: (draft: Content) => void) => void
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
