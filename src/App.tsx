import { useEffect, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Footer from './components/Footer'
import BootIntro from './components/BootIntro'
import CvCursor from './components/CvCursor'
import CursorSpot from './components/CursorSpot'
import Cutouts from './components/Cutouts'
import Ripples from './components/Ripples'
import { gsap, ScrollTrigger, useGSAP, reducedMotion, finePointer } from './lib/motion'
import { startSmoothScroll, lockScroll } from './lib/scroll'
import { shouldBoot } from './lib/boot'

export default function App() {
  // intro shows on the first visit of a session
  const [showIntro, setShowIntro] = useState(shouldBoot)
  // flips to true when the hero is allowed to animate in
  const [ready, setReady] = useState(() => !showIntro)

  // the mouse trail runs on desktop, and switches itself off if the computer can't keep up
  const [trail, setTrail] = useState(() => finePointer() && !reducedMotion())

  // smooth scrolling for the whole page
  useEffect(() => startSmoothScroll(), [])

  // no scrolling while the intro covers the page
  useEffect(() => {
    lockScroll(!ready)
    return () => lockScroll(false)
  }, [ready])

  // anything marked data-reveal un-blurs into place when scrolled to
  useGSAP(() => {
    if (reducedMotion()) return
    gsap.set('[data-reveal]', { opacity: 0, y: 20, filter: 'blur(8px)' })
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: els =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          clearProps: 'opacity,filter,transform',
        }),
    })
  })

  return (
    <>
      {/* lets keyboard users jump past the menu */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* boot-up screen on top of everything */}
      {showIntro && <BootIntro onReveal={() => setReady(true)} onDone={() => setShowIntro(false)} />}

      <Header />

      {/* every section of the page, top to bottom */}
      <main id="main-content">
        <Hero ready={ready} />
        <Experience />
        <Projects />
      </main>

      <Footer />

      {/* grid that flows behind the page after the mouse */}
      <CursorSpot enabled={trail} onLag={() => setTrail(false)} />

      {/* small windows onto the same grid, on phones and wherever the trail is off */}
      <Cutouts enabled={!trail} />

      {/* rings of grid that spread out from every click or tap */}
      <Ripples />

      {/* custom cursor on desktop, tap detection boxes on phones */}
      <CvCursor />
    </>
  )
}
