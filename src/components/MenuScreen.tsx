import { useRef } from 'react'
import { site } from '../data/site'
import { gsap, SplitText, useGSAP, reducedMotion } from '../lib/motion'
import { scrollToSection } from '../lib/scroll'

// what the little computer prints while it starts up
const BOOT = ['JC-OS v2.6', 'memory check ...... ok']

// choices that jump to a part of the page
const SECTIONS = ['experience', 'projects', 'contact']

// choices that open something in a new tab
const LINKS = [
  { name: 'resume', href: site.resume },
  { name: 'github', href: site.github },
  { name: 'linkedin', href: site.linkedin },
]

// the site menu, drawn as an old computer that boots up when it opens
export default function MenuScreen({ onNavigate }: { onNavigate: () => void }) {
  const root = useRef<HTMLDivElement>(null)

  // the boot-up: case drops in, the tube flashes on, then the text prints
  useGSAP(
    () => {
      if (reducedMotion()) return
      const split = SplitText.create('[data-menu-line]', { type: 'chars', aria: 'none' })
      const tl = gsap.timeline()

      // the computer drops into place
      tl.from(root.current, { opacity: 0, y: -10, scale: 0.96, duration: 0.2, ease: 'power2.out' })

      // crt turning on: a bright line draws across, then opens up and fades
      tl.fromTo(
        '[data-menu-flash]',
        { opacity: 1, scaleX: 0, scaleY: 0.008 },
        { scaleX: 1, duration: 0.14, ease: 'power2.in' },
      )
      tl.to('[data-menu-flash]', { scaleY: 1, opacity: 0, duration: 0.32, ease: 'power2.out' })

      // power light flickers on
      tl.from('[data-menu-light]', { opacity: 0.15, duration: 0.07, repeat: 4, yoyo: true }, 0.2)

      // boot text types out, then the choices print one by one
      tl.from(split.chars, { autoAlpha: 0, duration: 0.01, stagger: 0.009 }, '-=0.2')
      tl.from('[data-menu-choice]', { autoAlpha: 0, duration: 0.01, stagger: 0.05 }, '+=0.05')
    },
    { scope: root },
  )

  // scrolls to a section and closes the menu
  function goTo(section: string) {
    scrollToSection(section)
    onNavigate()
  }

  return (
    <div ref={root} className="monitor-case menu-case">
      <div data-cursor="terminal" data-lenis-prevent className="monitor-screen menu-screen on-ink no-scrollbar">
        {/* the bright flash when the screen turns on */}
        <div data-menu-flash aria-hidden="true" className="crt-flash" />

        {/* boot text at the top of the screen */}
        {BOOT.map(line => (
          <p key={line} data-menu-line aria-hidden="true" className="whitespace-pre">
            {line}
          </p>
        ))}
        <p data-menu-line className="text-mute">
          where to?
        </p>

        {/* the choices, click one to go there */}
        <ul className="mt-3">
          {SECTIONS.map(name => (
            <li key={name} data-menu-choice>
              <button type="button" onClick={() => goTo(name)} className="menu-choice">
                <span aria-hidden="true">&gt;</span>
                {name}
              </button>
            </li>
          ))}
          {LINKS.map(link => (
            <li key={link.name} data-menu-choice>
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="menu-choice">
                <span aria-hidden="true">&gt;</span>
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* strip under the screen with the vent and power light */}
      <div className="monitor-chin" aria-hidden="true">
        <span className="monitor-vent" />
        <span data-menu-light className="monitor-light" />
      </div>
    </div>
  )
}
