import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, ScrollTrigger, reducedMotion } from './motion'

let lenis: Lenis | null = null

// starts smooth scrolling and keeps scroll animations in sync with it
export function startSmoothScroll() {
  if (reducedMotion()) return () => {}

  lenis = new Lenis({ anchors: true })
  lenis.on('scroll', ScrollTrigger.update)

  // gsap drives lenis so both run on the same frame
  const tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

// freezes the page while the boot intro is showing
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  if (locked) lenis?.stop()
  else lenis?.start()
}

// scrolls to a section by id, smoothly when smooth scrolling is on
export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el)
  else el.scrollIntoView()
}
