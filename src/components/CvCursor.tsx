import { useRef, useState } from 'react'
import { gsap, useGSAP, finePointer, reducedMotion } from '../lib/motion'

// size of the ring when it's just following the mouse
const RING = 36
// breathing room between the box and the thing it wraps
const PAD = 6
// the things the cursor can detect
const TARGETS = '[data-cursor], a, button'
// how far a finger can drift and still count as a tap, in pixels
const TAP_SLOP = 10
// how long a tap's detection box stays up, in seconds
const TAP_HOLD = 1.1

export default function CvCursor() {
  // real mouse gets the full cursor, touch screens get a detection box on tap
  const [mouse] = useState(finePointer)
  // reduced motion gets the dot only on desktop, and no lock-on animation on phones
  const [calm] = useState(reducedMotion)
  const dot = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLSpanElement>(null)
  const score = useRef<HTMLSpanElement>(null)

  // writes the label for a detection, like "link 0.52"
  function label(target: HTMLElement) {
    if (!tag.current || !score.current) return
    // new made-up confidence for every detection, from 0.01 to 0.99
    const confidence = gsap.utils.random(0.01, 0.99, 0.01)
    tag.current.textContent = target.dataset.cursor ?? 'link'
    score.current.textContent = confidence.toFixed(2)
    // low scores are red, high scores are green, yellow in between
    score.current.style.color = `hsl(${Math.round(confidence * 120)} 85% 58%)`
  }

  // desktop: dot under the mouse, ring that snaps into a box around things
  useGSAP(() => {
    if (!mouse || !dot.current) return

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
      const next = under?.closest<HTMLElement>(TARGETS) ?? null
      if (next === target) return
      target = next
      boxEl?.classList.toggle('is-locked', Boolean(target))
      if (target) label(target)
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

    // keeps the box glued to things that move on their own, like the wheel cards
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

  // phones: tapping something draws the detection box around it for a moment
  useGSAP(() => {
    const boxEl = box.current
    if (mouse || !boxEl) return

    let target: HTMLElement | null = null
    let startX = 0
    let startY = 0
    let hide: gsap.core.Tween | null = null
    // gap around the target, starts wide and tightens so the box locks on
    const gap = { pad: PAD }

    // takes the box away
    function clear() {
      target = null
      hide?.kill()
      boxEl!.classList.remove('is-locked')
      gsap.set(boxEl, { autoAlpha: 0 })
    }

    // remembers where the finger went down
    function onDown(e: PointerEvent) {
      if (e.pointerType === 'mouse') return
      startX = e.clientX
      startY = e.clientY
    }

    // finger lifted: if it was a tap on something, box it
    function onUp(e: PointerEvent) {
      if (e.pointerType === 'mouse') return
      // swipes and scrolls don't count
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > TAP_SLOP) return
      const next = (e.target as Element | null)?.closest?.<HTMLElement>(TARGETS) ?? null
      if (!next) {
        clear()
        return
      }
      target = next
      label(next)
      boxEl!.classList.add('is-locked')
      gsap.set(boxEl, { autoAlpha: 1 })
      if (calm) gap.pad = PAD
      else gsap.fromTo(gap, { pad: PAD * 4 }, { pad: PAD, duration: 0.3, ease: 'power3.out' })
      follow()
      // goes away on its own after a moment
      hide?.kill()
      hide = gsap.delayedCall(TAP_HOLD, clear)
    }

    // keeps the box on the target while the page scrolls or the card moves
    function follow() {
      if (!target) return
      if (!target.isConnected) {
        clear()
        return
      }
      const r = target.getBoundingClientRect()
      gsap.set(boxEl, {
        x: r.left - gap.pad,
        y: r.top - gap.pad,
        width: r.width + gap.pad * 2,
        height: r.height + gap.pad * 2,
      })
    }

    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    gsap.ticker.add(follow)

    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      gsap.ticker.remove(follow)
      hide?.kill()
    }
  })

  return (
    <div aria-hidden="true">
      {/* ring that turns into a detection box */}
      {(!mouse || !calm) && (
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
      {mouse && <div ref={dot} className="cv-dot" />}
    </div>
  )
}
