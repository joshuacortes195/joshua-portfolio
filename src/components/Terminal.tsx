import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import { finePointer } from '../lib/motion'
import { scrollToSection } from '../lib/scroll'

// one row printed on the screen
type Line = {
  text: string
  // typed by the visitor, shown with a prompt arrow
  typed?: boolean
  // makes the row a link
  href?: string
}

// every command and what it does, printed by commands
const COMMANDS = [
  ['projects', 'go to projects'],
  ['experience', 'go to experience'],
  ['contact', 'go to contact'],
  ['resume', 'open the pdf'],
  ['github', 'see the code'],
  ['linkedin', 'say hi'],
  ['about', 'who i am'],
  ['commands', 'list the commands'],
  ['clear', 'wipe the screen'],
]

// commands that jump to a part of the page
const SECTIONS = ['projects', 'experience', 'contact']

// the choices shown on the screen that you can click
const CHOICES = ['projects', 'experience', 'contact', 'resume', 'github', 'linkedin', 'commands']

// opens a link in a new tab
function openTab(url: string) {
  window.open(url, '_blank', 'noopener')
}

// works out what a command prints, and runs anything it opens
function answer(command: string): Line[] {
  switch (command) {
    case 'commands':
    case 'help':
      return COMMANDS.map(([name, what]) => ({ text: `${name.padEnd(12)}${what}` }))
    case 'about':
      return site.about.map(text => ({ text }))
    case 'resume':
      openTab(site.resume)
      return [{ text: 'opening resume' }]
    case 'github':
      openTab(site.github)
      return [{ text: 'opening github' }]
    case 'linkedin':
      openTab(site.linkedin)
      return [{ text: 'opening linkedin' }]
    case 'sudo hire josh':
      return [
        { text: 'permission granted. great call.' },
        { text: site.email, href: `mailto:${site.email}` },
      ]
    case 'asteroids':
      openTab(site.asteroids)
      return [{ text: 'launching asteroids, needs a keyboard' }]
    default:
      return [{ text: `command not found: ${command}` }, { text: 'type commands to see what works' }]
  }
}

// the site menu, drawn as one computer screen you can click or type on
export default function Terminal({ onNavigate }: { onNavigate: () => void }) {
  const [lines, setLines] = useState<Line[]>([])
  const [value, setValue] = useState('')
  const screen = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  // on desktop the cursor starts in the terminal, phones skip this so the keyboard stays down
  useEffect(() => {
    if (finePointer()) input.current?.focus({ preventScroll: true })
  }, [])

  // keeps the newest line in view
  useEffect(() => {
    if (screen.current && lines.length > 0) screen.current.scrollTop = screen.current.scrollHeight
  }, [lines])

  // runs a command, from typing or from clicking a choice
  function run(raw: string) {
    const command = raw.trim().toLowerCase()
    if (command === '') return
    if (command === 'clear') {
      setLines([])
      return
    }
    // section commands scroll there and close the menu
    if (SECTIONS.includes(command)) {
      scrollToSection(command)
      onNavigate()
      return
    }
    setLines(prev => [...prev, { text: command, typed: true }, ...answer(command)])
  }

  // enter key sends whatever was typed
  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    run(value)
    setValue('')
  }

  return (
    <div
      ref={screen}
      data-cursor="terminal"
      data-lenis-prevent
      onClick={() => finePointer() && input.current?.focus({ preventScroll: true })}
      className="monitor-screen menu-screen on-ink no-scrollbar"
    >
      <p>JC-OS v2.6</p>
      <p className="text-mute">where to?</p>

      {/* the choices, click one to go there */}
      <ul className="my-3">
        {CHOICES.map(name => (
          <li key={name}>
            <button type="button" onClick={() => run(name)} className="menu-choice">
              <span aria-hidden="true">&gt;</span>
              {name}
            </button>
          </li>
        ))}
      </ul>

      {/* whatever commands have printed so far */}
      <div role="log" aria-label="Terminal output">
        {lines.map((line, i) => (
          <p key={i} className={`whitespace-pre-wrap ${line.typed ? '' : 'text-mute'}`}>
            {line.typed && '> '}
            {line.href ? (
              <a href={line.href} className="underline decoration-accent underline-offset-4 text-paper">
                {line.text}
              </a>
            ) : (
              line.text
            )}
          </p>
        ))}
      </div>

      {/* the line you type on */}
      <form onSubmit={onSubmit} className="flex items-center gap-[1ch] pt-1">
        <span aria-hidden="true">&gt;</span>
        <input
          ref={input}
          value={value}
          onChange={e => setValue(e.target.value)}
          aria-label="Type a command"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className="flex-1 min-w-0 bg-transparent text-accent caret-accent outline-none text-[16px] md:text-[length:inherit]"
        />
      </form>
    </div>
  )
}
