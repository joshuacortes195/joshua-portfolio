import { useRef } from 'react'
import { gsap, useGSAP, reducedMotion } from '../lib/motion'

// the rings in one ripple: when each starts, how long it runs, and how big it gets next to the first
const RINGS = [
  { delay: 0, duration: 1.1, scale: 1 },
  { delay: 0.14, duration: 1.2, scale: 0.7 },
]

// clicking or tapping anywhere sends out rings that show the grid behind the page
export default function Ripples() {
  const layer = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (reducedMotion() || !layer.current) return

    // grows one ring out from a point, then removes it
    function ring(x: number, y: number, reach: number, delay: number, duration: number) {
      const el = document.createElement('div')
      el.className = 'ripple grid-paper'
      layer.current!.appendChild(el)

      const state = { size: 0 }
      // keeps the ring centered on the click, and the grid lined up with the screen while it grows
      function draw() {
        const left = x - state.size / 2
        const top = y - state.size / 2
        el.style.width = el.style.height = `${state.size}px`
        el.style.left = `${left}px`
        el.style.top = `${top}px`
        el.style.setProperty('--gx', `${left}px`)
        el.style.setProperty('--gy', `${top}px`)
      }
      draw()

      gsap.to(state, { size: reach, duration, delay, ease: 'power2.out', onUpdate: draw })
      // fades as it spreads, like the ring is running out of energy
      gsap.fromTo(
        el,
        { opacity: 1 },
        { opacity: 0, duration, delay, ease: 'power1.in', onComplete: () => el.remove() },
      )
    }

    function onClick(e: MouseEvent) {
      // keyboard presses have no spot on the screen to ripple from
      if (e.detail === 0) return
      // smaller ripples on small screens
      const reach = Math.min(620, Math.max(window.innerWidth, window.innerHeight) * 0.55)
      RINGS.forEach(r => ring(e.clientX, e.clientY, reach * r.scale, r.delay, r.duration))
    }

    // capture catches every click, even ones a button keeps to itself
    window.addEventListener('click', onClick, true)
    return () => window.removeEventListener('click', onClick, true)
  })

  // sits behind everything on the page
  return <div ref={layer} aria-hidden="true" className="ripples" />
}
