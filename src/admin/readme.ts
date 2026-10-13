import { isHeading } from '../lib/details.ts'

// turns a repo's README into the plain text the read more button shows
// a README is whatever its author typed, so nothing from it is kept as markup, only words

// about how long the write-up is allowed to get, in characters
const MAX_LENGTH = 1800
// how much of a README gets read at all, and how much of one line
const MAX_INPUT = 100_000
const MAX_LINE = 2000
// longest paragraph that gets cleaned up, the rest of it wouldn't fit anyway
const MAX_PARA = 4000

// sections that are about using or working on the code, not about the project itself
const SKIP_SECTION = new RegExp(
  '^(?:(?:local|quick|project|dev|developer|manual|how to|how do i)\\s+)?' +
    '(?:install\\w*|set ?up|getting started|get started|quick ?start|usage|how to use|run|running|development|developing|build|building|' +
    'contribut\\w*|licen[sc]e\\w*|acknowledge?ments?|credits|table of contents|contents|toc|prerequisites|requirements)\\b',
)

type Block = { kind: 'heading' | 'text' | 'bullet'; text: string }

// html that means the same as a bit of markdown is swapped for it before the tags are thrown away
const HTML_AS_MARKDOWN: [RegExp, (...match: string[]) => string][] = [
  // a heading tag and its words become one # line, however many lines the html was spread over
  [/<h([1-6])\b[^<>]{0,300}>([\s\S]{0,600}?)<\/h\1\s*>/gi, (_, level, words) => `\n\n${'#'.repeat(Number(level))} ${words.replace(/\s+/g, ' ')}\n\n`],
  [/<li\b[^<>]{0,300}>/gi, () => '\n- '],
  [/<\/?(?:p|div|ul|ol|table|tr|blockquote|details|summary)\b[^<>]{0,300}>/gi, () => '\n\n'],
  [/<br\b[^<>]{0,300}>/gi, () => ' '],
]

// cuts out everything between two markers, like html comments or a script and what's inside it
function cutBetween(text: string, open: string, close: string) {
  const lower = text.toLowerCase()
  let out = ''
  let at = 0
  for (;;) {
    const start = lower.indexOf(open, at)
    if (start < 0) return out + text.slice(at)
    out += text.slice(at, start)
    const end = lower.indexOf(close, start + open.length)
    // one that never closes takes the rest of the file with it
    if (end < 0) return out
    at = end + close.length
  }
}

// strips the markdown and html out of one line and leaves the words
function plain(line: string) {
  return (
    line
      .slice(0, MAX_PARA)
      // images and badges go completely, a badge inside a link leaves an empty link that the next step removes
      .replace(/!\[[^\]]{0,300}\]\((?:[^()]|\([^()]{0,300}\)){0,600}\)/g, '')
      .replace(/!\[[^\]]{0,300}\]\[[^\]]{0,300}\]/g, '')
      // links keep their words and lose their address
      .replace(/\[([^\]]{0,300})\]\((?:[^()]|\([^()]{0,300}\)){0,600}\)/g, '$1')
      .replace(/\[([^\]]{0,300})\]\[[^\]]{0,300}\]/g, '$1')
      // html tags, and addresses written out in the open
      .replace(/<[a-zA-Z/!][^<>]{0,1000}>/g, '')
      .replace(/\b(?:https?:\/\/|www\.)\S+/gi, '')
      .replace(/\b(?:javascript|vbscript):\S*|\bdata:[a-z]+\/\S*/gi, '')
      // html codes for a few common characters
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      // bold, italics, strikethrough and code marks, and emoji written as :names:
      .replace(/(\*\*|__|~~|`)/g, '')
      .replace(/(^|[\s(])[*_]([^*_\s][^*_]*)[*_](?=$|[\s).,;:!?])/g, '$1$2')
      .replace(/(^|\s):[a-z0-9_+-]+:(?=\s|$)/g, '$1')
      .replace(/\s+/g, ' ')
      // a removed image or tag can leave a gap in front of a full stop or comma
      .replace(/ ([.,;:!?])(?= |$)/g, '$1')
      .trim()
  )
}

// true when a line has no real words left in it, like a row of badges that got removed
function empty(text: string) {
  return !/[\p{L}\p{N}]/u.test(text)
}

// turns README markdown into plain paragraphs, short heading lines and "- " bullets
export function readmeToDetails(markdown: unknown): string {
  if (typeof markdown !== 'string') return ''
  let source = markdown.slice(0, MAX_INPUT).replace(/\r\n?/g, '\n')
  // comments, and scripts and styles along with what's inside them, never make it in
  source = cutBetween(source, '<!--', '-->')
  source = cutBetween(source, '<script', '</script>')
  source = cutBetween(source, '<style', '</style>')
  for (const [tag, markdown] of HTML_AS_MARKDOWN) source = source.replace(tag, markdown)
  // every other html tag goes, including ones split over a few lines
  source = source.replace(/<[a-zA-Z/!][^<>]{0,1000}>/g, '')

  const lines = source.split('\n').map(l => l.slice(0, MAX_LINE))
  const blocks: Block[] = []
  // the paragraph being read
  let para: string[] = []
  // the code fence we're inside, if any
  let fence = ''
  let inTable = false
  // heading level of the section being skipped, 0 when nothing is
  let skipping = 0
  let titleDropped = false
  // rough count of what has been kept, reading stops once there is plenty
  let kept = 0
  // the bullet a wrapped line right under it still belongs to
  let lastItem: Block | null = null

  // finishes the paragraph in progress
  function closePara() {
    let text = plain(para.join(' '))
    para = []
    lastItem = null
    if (empty(text)) return
    // a short line gets a full stop, so the site reads it as a sentence and not as a section heading
    if (isHeading(text)) text += '.'
    add({ kind: 'text', text })
  }

  // keeps a piece, unless we're inside a section that's being skipped
  function add(block: Block) {
    if (skipping) return
    blocks.push(block)
    kept += block.text.length
  }

  // a heading either starts a section to skip, or gets kept as a short line of its own
  function heading(level: number, raw: string) {
    closePara()
    const text = plain(raw.replace(/\s#+\s*$/, '')).replace(/[.:!?,;]+$/, '')
    // the name of the project at the top is already the card's title
    if (level === 1 && !titleDropped) {
      titleDropped = true
      skipping = 0
      return
    }
    // a skipped section runs until the next heading of the same size or bigger
    if (skipping && level > skipping) return
    const name = text.toLowerCase().replace(/^[^\p{L}]+/u, '')
    skipping = SKIP_SECTION.test(name) ? level : 0
    if (!skipping && !empty(text)) add({ kind: 'heading', text })
  }

  for (let i = 0; i < lines.length && kept < MAX_LENGTH * 3; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // code blocks are dropped whole
    const fenceMark = /^(`{3,}|~{3,})/.exec(trimmed)?.[1]
    if (fence) {
      if (fenceMark && fenceMark[0] === fence[0] && fenceMark.length >= fence.length) fence = ''
      continue
    }
    if (fenceMark) {
      closePara()
      fence = fenceMark
      continue
    }

    if (!trimmed) {
      closePara()
      inTable = false
      continue
    }

    // tables are dropped whole, the row above the |---|---| line is the table's own header
    const tableRule = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/.test(trimmed) && trimmed.includes('|')
    if (tableRule) {
      para.pop()
      closePara()
      inTable = true
      continue
    }
    if (inTable && trimmed.includes('|')) continue
    inTable = false
    if (trimmed.startsWith('|')) {
      closePara()
      inTable = true
      continue
    }

    // headings written with # in front
    const hash = /^(#{1,6})\s+(.*)$/.exec(trimmed)
    if (hash) {
      heading(hash[1].length, hash[2])
      continue
    }
    // headings written as a line of === or --- under the words
    if (/^=+$/.test(trimmed) || /^-{2,}$/.test(trimmed)) {
      if (para.length) {
        const text = para.join(' ')
        para = []
        heading(trimmed[0] === '=' ? 1 : 2, text)
      }
      continue
    }
    // lines that only draw a divider, and the footnotes that hold a link's address
    if (/^([-*_])(\s*\1){2,}$/.test(trimmed) || /^\[[^\]]+\]:\s/.test(trimmed)) {
      closePara()
      continue
    }

    // indented code, unless it's a list item or carries on the text above
    if (/^( {4,}|\t)/.test(line) && !para.length && !lastItem && !/^\s*([-*+]|\d+[.)])\s/.test(line)) continue

    // list items become bullets, with any tick box taken off the front
    const item = /^([-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?(.*)$/.exec(trimmed)
    if (item) {
      closePara()
      const text = plain(item[2])
      if (!empty(text)) {
        const bullet: Block = { kind: 'bullet', text }
        add(bullet)
        lastItem = bullet
      }
      continue
    }
    // a wrapped line right under a bullet is the rest of that bullet
    if (lastItem && !para.length) {
      lastItem.text = `${lastItem.text} ${plain(trimmed)}`.trim().slice(0, MAX_PARA)
      continue
    }

    // quoted lines are read like normal text, without the > or the [!NOTE] label
    para.push(trimmed.replace(/^(>\s*)+/, '').replace(/^\[![A-Za-z]+\]\s*/, ''))
  }
  closePara()

  // a heading with nothing under it, because its table or code got dropped, goes too
  const filled = blocks.filter((b, i) => b.kind !== 'heading' || (blocks[i + 1] && blocks[i + 1].kind !== 'heading'))

  // puts it back together, stopping at the last whole paragraph or bullet that fits
  let out = ''
  let used = 0
  for (const [i, block] of filled.entries()) {
    const text = block.kind === 'bullet' ? `- ${block.text}` : block.text
    // bullets of one list sit on lines next to each other, everything else gets a blank line between
    const gap = !out ? '' : block.kind === 'bullet' && filled[i - 1].kind === 'bullet' ? '\n' : '\n\n'
    if (out.length + gap.length + text.length > MAX_LENGTH) {
      // an opening paragraph too long to fit on its own is cut at a sentence, or failing that a word
      if (!out) {
        const cut = text.slice(0, MAX_LENGTH)
        const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '))
        out = stop > MAX_LENGTH / 2 ? cut.slice(0, stop + 1) : cut.slice(0, Math.max(cut.lastIndexOf(' '), 1)).trimEnd()
        used = 1
      }
      break
    }
    out += gap + text
    used = i + 1
  }
  // never ends on a heading whose section didn't fit
  if (used > 0 && filled[used - 1].kind === 'heading') out = out.slice(0, out.lastIndexOf('\n\n') > 0 ? out.lastIndexOf('\n\n') : 0)
  return out.trim()
}
