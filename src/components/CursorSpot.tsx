import { useRef, useState } from 'react'
import { gsap, useGSAP, finePointer, reducedMotion } from '../lib/motion'

// width and height of the round window, in pixels
const SIZE = 380

// a soft round window that follows the mouse and shows a grid behind the page
export default function CursorSpot() {
  // desktop mouse only, and skipped for reduced motion
  const [enabled] = useState(() => finePointer() && !reducedMotion())
  const spot = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!enabled || !spot.current || !grid.current) return

    // the window trails a little behind the mouse
    const lag = { duration: 0.3, ease: 'power3' }
    const spotX = gsap.quickTo(spot.current, 'x', lag)
    const spotY = gsap.quickTo(spot.current, 'y', lag)
    // the grid slides the opposite way by the same amount, so it looks fixed to the page
    const gridX = gsap.quickTo(grid.current, 'x', lag)
    const gridY = gsap.quickTo(grid.current, 'y', lag)
    let hide: gsap.core.Tween | null = null

    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return
      const x = e.clientX - SIZE / 2
      const y = e.clientY - SIZE / 2
      spotX(x)
      spotY(y)
      gridX(-x)
      gridY(-y)

      // show it while the mouse is moving, then fade out soon after it stops
      hide?.kill()
      gsap.to(spot.current, { opacity: 1, duration: 0.2, overwrite: 'auto' })
      hide = gsap.to(spot.current, { opacity: 0, duration: 0.35, delay: 0.15 })
    }

    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  })

  if (!enabled) return null

  // sits behind everything on the page
  return (
    <div ref={spot} aria-hidden="true" className="cursor-spot" style={{ width: SIZE, height: SIZE }}>
      <div ref={grid} className="cursor-spot-grid" />
    </div>
  )
}
