import { useEffect, useRef } from 'react'
import { site } from '../data/site'
import { gsap, SplitText, useGSAP, reducedMotion } from '../lib/motion'
import { safeLink, sitePath } from '../lib/links'
import { scrollToSection } from '../lib/scroll'

// links shown across the top of the page
const links = [
  { label: 'GitHub', href: safeLink(site.github) ?? '' },
  { label: 'LinkedIn', href: safeLink(site.linkedin) ?? '' },
  { label: 'Email', href: `mailto:${site.email}` },
].filter(l => l.href)

// parts of the page the row at the bottom of the hero jumps to
const sections = ['experience', 'projects', 'contact']

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const intro = useRef<gsap.core.Timeline | null>(null)

  // builds the entrance: headline words rise and un-blur, then the rest fades in
  useGSAP(
    () => {
      if (reducedMotion()) return
      // my name just fades in with the rest, only the title and focus line get the word by word rise
      const split = SplitText.create('h1 > span:not([data-name])', { type: 'words' })
      intro.current = gsap
        .timeline({ paused: true })
        .from(split.words, {
          yPercent: 40,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.05,
        })
        .from(
          '[data-hero-fade]',
          { opacity: 0, y: 16, filter: 'blur(8px)', duration: 0.5, ease: 'power3.out', stagger: 0.06 },
          // starts right behind the first words so the button and links are readable quickly
          0.15,
        )
    },
    { scope: root },
  )

  // plays the entrance once the boot intro is out of the way
  useEffect(() => {
    if (ready) intro.current?.play()
  }, [ready])

  return (
    <section ref={root} id="top" className="min-h-svh flex flex-col px-4 md:px-8 pt-4 pb-10">
      {/* links across the top */}
      <nav aria-label="Links" data-hero-fade className="min-h-11 pr-28 flex items-center">
        <ul className="flex items-center gap-4 md:gap-7 text-sm md:text-base font-medium">
          {links.map(l => (
            <li key={l.label}>
              <a
                href={l.href}
                className="link inline-block py-3 px-2 -mx-2"
                {...(l.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="my-auto py-8 md:py-12">
        {/* my name, the big job title, and the focus areas as a smaller line, all one heading */}
        <h1>
          <span
            data-name
            data-hero-fade
            data-cursor="josh"
            className="block w-fit mb-3 md:mb-5 text-2xl md:text-4xl font-semibold tracking-tight"
          >
            {site.name}
          </span>{' '}
          <span className="display hero-title block">{site.hero.title}</span>{' '}
          <span className="hero-sub block">{site.hero.subtitle}</span>
        </h1>

        {/* one or two sentences on what I do right now */}
        {site.hero.pitch && (
          <p data-hero-fade className="mt-6 md:mt-8 max-w-[46ch] text-lg md:text-2xl leading-snug">
            {site.hero.pitch}
          </p>
        )}

        {/* the big resume button */}
        <div data-hero-fade className="mt-8 md:mt-10">
          <a
            href={sitePath(site.resume)}
            target="_blank"
            rel="noopener noreferrer"
            className="pill pill-accent min-h-16 px-10 text-xl font-semibold"
          >
            {site.hero.resumeButton}
          </a>
        </div>
      </div>

      {/* jump links along the bottom, written like the menu's choices */}
      <nav aria-label="Sections" data-hero-fade>
        <ul className="flex flex-wrap gap-x-6 font-mono text-sm">
          {sections.map(name => (
            <li key={name}>
              <a
                href={`#${name}`}
                onClick={e => {
                  // scrolls there smoothly and takes keyboard focus along
                  e.preventDefault()
                  scrollToSection(name)
                }}
                className="min-h-11 inline-flex items-center gap-[1ch]"
              >
                <span aria-hidden="true" className="text-ink-soft">
                  &gt;
                </span>
                {/* only the word is underlined, not the arrow */}
                <span className="link">{name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
