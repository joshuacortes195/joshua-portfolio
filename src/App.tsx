import { useEffect, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Footer from './components/Footer'
import BootIntro from './components/BootIntro'
import CvCursor from './components/CvCursor'
import TopoBackground from './components/TopoBackground'
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from './lib/motion'
import { startSmoothScroll, lockScroll, scrollToSection } from './lib/scroll'
import { shouldBoot } from './lib/boot'

export default function App() {
  // intro shows on the first visit of a session
  const [showIntro, setShowIntro] = useState(shouldBoot)
  // flips to true when the hero is allowed to animate in
  const [ready, setReady] = useState(() => !showIntro)

  // smooth scrolling for the whole page
  useEffect(() => startSmoothScroll(), [])

  // no scrolling while the intro covers the page
  useEffect(() => {
    lockScroll(!ready)
    return () => lockScroll(false)
  }, [ready])

  // the intro always opens over the top of the page, not over a scroll spot the browser remembered
  useEffect(() => {
    if (!showIntro) return
    const before = history.scrollRestoration
    history.scrollRestoration = 'manual'
    // a link straight to a section keeps its place
    if (!window.location.hash) window.scrollTo(0, 0)
    return () => {
      history.scrollRestoration = before
    }
  }, [showIntro])

  // a shared link like /#projects opens at that section, once the intro is out of the way
  useEffect(() => {
    if (!ready) return
    const id = window.location.hash.slice(1)
    if (id) scrollToSection(id, true)
  }, [ready])

  // anything marked data-reveal un-blurs into place when scrolled to
  useGSAP(() => {
    if (reducedMotion()) return
    gsap.set('[data-reveal]', { opacity: 0, y: 12, filter: 'blur(4px)' })
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: els =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.06,
          clearProps: 'opacity,filter,transform',
        }),
    })
  })

  return (
    <>
      {/* the moving map behind the whole site */}
      <TopoBackground />

      {/* lets keyboard users jump past the menu */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* boot-up screen on top of everything */}
      {showIntro && <BootIntro onReveal={() => setReady(true)} onDone={() => setShowIntro(false)} />}

      <Header />

      {/* every section of the page, top to bottom */}
      <main id="main-content" tabIndex={-1}>
        <Hero ready={ready} />
        <Experience />
        <Projects />
      </main>

      <Footer />

      {/* custom cursor on desktop, tap detection boxes on phones */}
      <CvCursor />
    </>
  )
}
