import { useEffect, useRef } from 'react'
import { site } from '../data/site'
import { gsap, SplitText, useGSAP, reducedMotion } from '../lib/motion'

// links shown across the top of the page
const links = [
  { label: 'GitHub', href: site.github },
  { label: 'LinkedIn', href: site.linkedin },
  { label: 'Email', href: `mailto:${site.email}` },
  { label: 'Resume', href: site.resume },
]

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const intro = useRef<gsap.core.Timeline | null>(null)

  // builds the entrance: headline words rise and un-blur, then the rest fades in
  useGSAP(
    () => {
      if (reducedMotion()) return
      const split = SplitText.create('h1 > span', { type: 'words' })
      intro.current = gsap
        .timeline({ paused: true })
        .from(split.words, {
          yPercent: 70,
          opacity: 0,
          filter: 'blur(14px)',
          duration: 1,
          ease: 'power3.out',
          stagger: 0.09,
        })
        .from(
          '[data-hero-fade]',
          { opacity: 0, y: 16, filter: 'blur(8px)', duration: 0.8, ease: 'power3.out', stagger: 0.1 },
          '-=0.7',
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
                className="link inline-block py-2"
                {...(l.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="my-auto py-12">
        {/* my name, above the title */}
        <p data-hero-fade data-cursor="josh" className="w-fit mb-3 md:mb-5 text-2xl md:text-4xl font-semibold tracking-tight">
          Joshua Cortes
        </p>

        {/* big job title, with the focus areas as a smaller line under it */}
        <h1>
          <span className="display hero-title block">Software Engineer</span>{' '}
          <span className="hero-sub block">CV, ML &amp; Robotics.</span>
        </h1>

        {/* the big resume button */}
        <div data-hero-fade className="mt-10 md:mt-14">
          <a
            href={site.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="pill pill-accent min-h-16 px-10 text-xl font-semibold"
          >
            View resume
          </a>
        </div>
      </div>
    </section>
  )
}
