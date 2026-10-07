import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/motion'

// the round windows that make up the trail: the first keeps up with the mouse, the rest drift in behind it
const BLOBS = [
  { size: 320, lag: 0.25 },
  { size: 250, lag: 0.5 },
  { size: 190, lag: 0.8 },
]

// frames slower than this on average, in milliseconds, count as lagging
const SLOW_FRAME = 26
// how many frames of mouse movement get timed before deciding
const SAMPLE = 120

type Props = {
  enabled: boolean
  // fires once if the trail turns out to be too heavy for this computer
  onLag: () => void
}

// soft windows that flow after the mouse like liquid and show a grid behind the page
export default function CursorSpot({ enabled, onLag }: Props) {
  const trail = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!enabled || !trail.current) return

      // each window gets its own speed, and its grid slides the opposite way so the grid looks fixed to the page
      const movers = Array.from(trail.current.children).map((spot, i) => {
        const lag = { duration: BLOBS[i].lag, ease: 'power3' }
        const grid = spot.firstElementChild
        return {
          spot,
          grid,
          half: BLOBS[i].size / 2,
          spotX: gsap.quickTo(spot, 'x', lag),
          spotY: gsap.quickTo(spot, 'y', lag),
          gridX: gsap.quickTo(grid, 'x', lag),
          gridY: gsap.quickTo(grid, 'y', lag),
        }
      })

      let seen = false
      let firstMove = 0
      let lastMove = 0

      function onMove(e: PointerEvent) {
        if (e.pointerType !== 'mouse') return
        lastMove = performance.now()
        movers.forEach(m => {
          const x = e.clientX - m.half
          const y = e.clientY - m.half
          // first move: everything starts right at the mouse instead of flying in from the corner
          if (!seen) {
            gsap.set(m.spot, { x, y })
            gsap.set(m.grid, { x: -x, y: -y })
          }
          m.spotX(x)
          m.spotY(y)
          m.gridX(-x)
          m.gridY(-y)
        })
        if (!seen) {
          seen = true
          firstMove = lastMove
        }

        // fades in while the mouse moves, lingers, then eases away once it rests
        gsap.to(trail.current, { opacity: 1, duration: 0.3, overwrite: true })
        gsap.to(trail.current, { opacity: 0, duration: 0.9, delay: 0.7, ease: 'power1.inOut' })
      }

      // times frames while the mouse is moving, and gives up on the trail if they're slow
      let last = 0
      let frames = 0
      let total = 0
      function measure() {
        const now = performance.now()
        const gap = now - last
        last = now
        // skips still moments, the first second and a half of page load, and tab switches
        if (now - lastMove > 100 || now - firstMove < 1500 || gap > 250) return
        frames++
        total += gap
        if (frames < SAMPLE) return
        gsap.ticker.remove(measure)
        if (total / frames > SLOW_FRAME) onLag()
      }

      window.addEventListener('pointermove', onMove)
      gsap.ticker.add(measure)
      return () => {
        window.removeEventListener('pointermove', onMove)
        gsap.ticker.remove(measure)
      }
    },
    { dependencies: [enabled] },
  )

  if (!enabled) return null

  // sits behind everything on the page
  return (
    <div ref={trail} aria-hidden="true" className="cursor-trail">
      {BLOBS.map(b => (
        <div key={b.size} className="cursor-spot" style={{ width: b.size, height: b.size }}>
          <div className="cursor-spot-grid grid-paper" />
        </div>
      ))}
    </div>
  )
}
