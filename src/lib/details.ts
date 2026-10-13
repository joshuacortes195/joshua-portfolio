// one piece of a project's write-up
export type DetailBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'text'; text: string }
  | { kind: 'list'; items: string[] }

// a line on its own counts as a section heading when it's short and doesn't end like a sentence
export function isHeading(line: string) {
  return line.length <= 60 && !/[.!?,;:]$/.test(line)
}

// splits a write-up into headings, paragraphs and bullet lists
// blank lines separate paragraphs and a line starting with "- " is a bullet, everything stays plain text
export function parseDetails(details?: string | null): DetailBlock[] {
  if (typeof details !== 'string') return []
  const blocks: DetailBlock[] = []
  // lines of the paragraph being read
  let lines: string[] = []
  // bullets of the list being read
  let items: string[] = []

  // finishes the paragraph or list in progress
  function close() {
    if (lines.length === 1 && isHeading(lines[0])) blocks.push({ kind: 'heading', text: lines[0] })
    else if (lines.length) blocks.push({ kind: 'text', text: lines.join(' ') })
    if (items.length) blocks.push({ kind: 'list', items })
    lines = []
    items = []
  }

  for (const raw of details.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) close()
    else if (line === '-' || line.startsWith('- ')) {
      // a bullet right under a paragraph ends that paragraph
      if (lines.length) close()
      const item = line.slice(1).trim()
      if (item) items.push(item)
    } else {
      // text right under a list ends that list
      if (items.length) close()
      lines.push(line)
    }
  }
  close()
  return blocks
}
