import { useRef, useState } from 'react'
import { gsap, useGSAP, finePointer, reducedMotion } from '../lib/motion'

// size of the ring when it's just following the mouse
const RING = 36
// breathing room between the box and the thing it wraps
const PAD = 6

export default function CvCursor() {
  // only on desktop with a real mouse
  const [enabled] = useState(finePointer)
  // reduced motion gets the dot only, no ring or box
  const [dotOnly] = useState(reducedMotion)
  const dot = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLSpanElement>(null)
  const score = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    if (!enabled || !dot.current) return

    // hides the normal arrow while our cursor is running
    document.documentElement.classList.add('cv-cursor')

    const moveDotX = gsap.quickSetter(dot.current, 'x', 'px')
    const moveDotY = gsap.quickSetter(dot.current, 'y', 'px')

    // the ring trails behind the dot
    const lag = { duration: 0.35, ease: 'power3' }
    const boxEl = box.current
    const boxX = boxEl && gsap.quickTo(boxEl, 'x', lag)
    const boxY = boxEl && gsap.quickTo(boxEl, 'y', lag)
    const boxW = boxEl && gsap.quickTo(boxEl, 'width', lag)
    const boxH = boxEl && gsap.quickTo(boxEl, 'height', lag)

    let mouseX = -100
    let mouseY = -100
    let target: HTMLElement | null = null
    let seen = false

    // finds what the mouse is over and switches between ring and box
    function detect() {
      const under = document.elementFromPoint(mouseX, mouseY)
      const next = under?.closest<HTMLElement>('[data-cursor], a, button') ?? null
      if (next === target) return
      target = next
      boxEl?.classList.toggle('is-locked', Boolean(target))
      if (target && tag.current && score.current) {
        // new made-up confidence for every detection, from 0.01 to 0.99
        const confidence = gsap.utils.random(0.01, 0.99, 0.01)
        tag.current.textContent = target.dataset.cursor ?? 'link'
        score.current.textContent = confidence.toFixed(2)
        // low scores are red, high scores are green, yellow in between
        score.current.style.color = `hsl(${Math.round(confidence * 120)} 85% 58%)`
      }
    }

    // sends the ring to the mouse, or snaps the box around the target
    function place() {
      if (!boxX || !boxY || !boxW || !boxH) return
      if (target && !target.isConnected) detect()
      if (target) {
        const r = target.getBoundingClientRect()
        boxX(r.left - PAD)
        boxY(r.top - PAD)
        boxW(r.width + PAD * 2)
        boxH(r.height + PAD * 2)
      } else {
        boxX(mouseX - RING / 2)
        boxY(mouseY - RING / 2)
        boxW(RING)
        boxH(RING)
      }
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return
      mouseX = e.clientX
      mouseY = e.clientY
      moveDotX(mouseX)
      moveDotY(mouseY)
      // first move: show the cursor where the mouse already is
      if (!seen) {
        seen = true
        gsap.set([dot.current, boxEl], { autoAlpha: 1 })
        if (boxEl) gsap.set(boxEl, { x: mouseX - RING / 2, y: mouseY - RING / 2 })
      }
      detect()
      place()
    }

    // things move under a still mouse while scrolling
    function onScroll() {
      if (!seen) return
      detect()
      place()
    }

    // hide when the mouse leaves the window
    function onLeave() {
      gsap.set([dot.current, boxEl], { autoAlpha: 0 })
      seen = false
    }

    // keeps the box glued to things that move on their own, like the ring cards
    function follow() {
      if (target) place()
    }

    window.addEventListener('pointermove', onMove)
    gsap.ticker.add(follow)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.ticker.remove(follow)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.classList.remove('cv-cursor')
    }
  })

  if (!enabled) return null

  return (
    <div aria-hidden="true">
      {/* ring that turns into a detection box */}
      {!dotOnly && (
        <div ref={box} className="cv-box">
          <span className="cv-corner cv-tl" />
          <span className="cv-corner cv-tr" />
          <span className="cv-corner cv-bl" />
          <span className="cv-corner cv-br" />
          <span className="cv-tag">
            <span ref={tag} /> <span ref={score} />
          </span>
        </div>
      )}

      {/* the small dot right under the mouse */}
      <div ref={dot} className="cv-dot" />
    </div>
  )
}
