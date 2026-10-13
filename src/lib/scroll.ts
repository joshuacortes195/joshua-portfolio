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
    // puts gsap's catch-up after a slow frame back to how it comes
    gsap.ticker.lagSmoothing(500, 33)
    lenis?.destroy()
    lenis = null
  }
}

// freezes the page while the boot intro is showing or the menu is open
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
  // keyboard focus goes along, so the next tab carries on from that section and not from the top
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
