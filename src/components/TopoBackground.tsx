import { useEffect, useRef } from 'react'
import { reducedMotion } from '../lib/motion'

// blue map lines, gold traces, and ascii bits in both
const LINE_COLORS = ['#1f3d73', '#2d5aa6', '#3b6fc4']
const TRACE_COLORS = ['#e9b949', '#f2c46d', '#ffd98a', '#8fb6ff']
// how far apart the map lines sit, and how fine the grid they're worked out on is
const STEP = 0.2
const CELL = 14
// how many traces and ascii bits can be on screen at once
const TRACES = 8
const BITS = 14

// the height of the land at a point, slowly shifting over time, the map lines are where this crosses a level
function height(x: number, y: number, t: number, w: number, h: number) {
  return (
    Math.sin(x * 0.006 + t) * Math.cos(y * 0.007 - t * 0.7) +
    Math.sin((x + y) * 0.004 + t * 0.5) * 0.7 +
    Math.cos(Math.hypot(x - w * 0.7, y - h * 0.4) * 0.008 - t) * 0.6
  )
}

type Trace = { x: number; y: number; level: number; dir: number; speed: number; life: number; age: number; wait: number; color: string; trail: [number, number][] }
type Bit = { x: number; y: number; text: string; shown: string; age: number; life: number; color: string }

// characters the ascii bits flicker through, and the little shapes they can settle into
const CHARS = '01#*+=/\\<>[]{}$%&@?!~:;^|'
const SHAPES = ['[+]', '<-->', '/\\/\\', '::::', '{ok}', '0x1F', '|||', '-+-', '[#]', '>_']
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]
const noise = (n: number) => Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')

// the moving topographic map behind the whole site: blue contour lines, gold light tracing slowly along them, and ascii that flickers in and out
export default function TopoBackground() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current!
    const g = el.getContext('2d')!
    const still = reducedMotion()
    let w = 0
    let h = 0
    let frame = 0
    let last = 0

    // matches the canvas to the window, sharp on retina screens
    function fit() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      el.width = w * dpr
      el.height = h * dpr
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    window.addEventListener('resize', fit)

    const at = (x: number, y: number, t: number) => height(x, y, t, w, h)

    // starts a trace somewhere random, snapped onto the nearest map line
    function spawn(tr: Partial<Trace>, t: number) {
      tr.x = Math.random() * w
      tr.y = Math.random() * h
      tr.level = -2 + Math.round((at(tr.x, tr.y, t) + 2) / STEP) * STEP
      tr.dir = Math.random() < 0.5 ? -1 : 1
      tr.speed = 1.2 + Math.random() * 1.2
      tr.life = 260 + Math.random() * 260
      tr.age = 0
      tr.wait = Math.random() * 240
      tr.color = pick(TRACE_COLORS)
      tr.trail = []
      return tr as Trace
    }
    const traces: Trace[] = Array.from({ length: TRACES }, () => spawn({}, 0))
    const bits: Bit[] = []

    // drops a bit of ascii at a spot, sometimes a shape, sometimes the spot itself, sometimes just noise
    function drop(x: number, y: number, color: string) {
      const kind = Math.random()
      const text =
        kind < 0.35 ? pick(SHAPES) : kind < 0.55 ? `x:${String(Math.round(x)).padStart(4, '0')} y:${String(Math.round(y)).padStart(4, '0')}` : noise(3 + Math.floor(Math.random() * 6))
      bits.push({ x: x + 6, y: y - 6, text, shown: noise(text.length), age: 0, life: 110 + Math.random() * 80, color })
      if (bits.length > BITS) bits.shift()
    }

    // the contour lines, worked out with marching squares on a coarse grid
    function drawLines(t: number) {
      const cols = Math.ceil(w / CELL) + 1
      const rows = Math.ceil(h / CELL) + 1
      const v = new Float32Array(cols * rows)
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) v[j * cols + i] = at(i * CELL, j * CELL, t)
      const grad = g.createLinearGradient(0, 0, w, h)
      LINE_COLORS.forEach((c, k) => grad.addColorStop(k / (LINE_COLORS.length - 1), c))
      g.strokeStyle = grad
      g.lineWidth = 1
      for (let lv = -2; lv <= 2; lv += STEP) {
        // every fifth line is a little stronger, like the index lines on a real map
        g.globalAlpha = Math.abs((lv * 100) % 100) < 1 ? 0.55 : 0.3
        g.beginPath()
        for (let j = 0; j < rows - 1; j++)
          for (let i = 0; i < cols - 1; i++) {
            const a = v[j * cols + i], b = v[j * cols + i + 1], d = v[(j + 1) * cols + i], e = v[(j + 1) * cols + i + 1]
            const x = i * CELL, y = j * CELL, p: [number, number][] = []
            if (a > lv !== b > lv) p.push([x + (CELL * (lv - a)) / (b - a), y])
            if (b > lv !== e > lv) p.push([x + CELL, y + (CELL * (lv - b)) / (e - b)])
            if (d > lv !== e > lv) p.push([x + (CELL * (lv - d)) / (e - d), y + CELL])
            if (a > lv !== d > lv) p.push([x, y + (CELL * (lv - a)) / (d - a)])
            if (p.length >= 2) { g.moveTo(p[0][0], p[0][1]); g.lineTo(p[1][0], p[1][1]) }
            if (p.length === 4) { g.moveTo(p[2][0], p[2][1]); g.lineTo(p[3][0], p[3][1]) }
          }
        g.stroke()
      }
      g.globalAlpha = 1
    }

    // gold light running slowly along a single map line, lighting it up behind itself then fading
    function drawTraces(t: number) {
      const e = 2
      g.lineCap = 'round'
      for (const tr of traces) {
        if (tr.wait > 0) { tr.wait--; continue }
        const gx = (at(tr.x + e, tr.y, t) - at(tr.x - e, tr.y, t)) / (2 * e)
        const gy = (at(tr.x, tr.y + e, t) - at(tr.x, tr.y - e, t)) / (2 * e)
        const m = Math.hypot(gx, gy)
        if (m < 1e-5) { spawn(tr, t); continue }
        // a step along the line, then two nudges back onto it
        tr.x += (-gy / m) * tr.dir * tr.speed
        tr.y += (gx / m) * tr.dir * tr.speed
        let lost = false
        for (let n = 0; n < 2; n++) {
          const hv = at(tr.x, tr.y, t)
          const gx2 = (at(tr.x + e, tr.y, t) - at(tr.x - e, tr.y, t)) / (2 * e)
          const gy2 = (at(tr.x, tr.y + e, t) - at(tr.x, tr.y - e, t)) / (2 * e)
          const m2 = gx2 * gx2 + gy2 * gy2 || 1
          const dx = ((tr.level - hv) * gx2) / m2
          const dy = ((tr.level - hv) * gy2) / m2
          // a big jump means it fell off the line near a saddle, so it starts over instead of scribbling
          if (Math.hypot(dx, dy) > 6) lost = true
          tr.x += dx
          tr.y += dy
        }
        // the same goes for one that has stopped getting anywhere
        const back = tr.trail[tr.trail.length - 30]
        if (lost || (back && Math.hypot(tr.x - back[0], tr.y - back[1]) < 12)) { spawn(tr, t); continue }
        tr.trail.push([tr.x, tr.y])
        if (tr.trail.length > 140) tr.trail.shift()
        tr.age++
        if (tr.age > tr.life) { drop(tr.x, tr.y, tr.color); spawn(tr, t); continue }
        if (tr.x < -60 || tr.y < -60 || tr.x > w + 60 || tr.y > h + 60) { spawn(tr, t); continue }
        // fades in, holds, then fades out as one piece, so it reads as the line being traced
        const fade = Math.min(1, tr.age / 40, (tr.life - tr.age) / 60)
        g.strokeStyle = tr.color
        g.lineWidth = 1.4
        for (let k = 1; k < tr.trail.length; k++) {
          g.globalAlpha = fade * (0.25 + 0.6 * (k / tr.trail.length))
          g.beginPath()
          g.moveTo(tr.trail[k - 1][0], tr.trail[k - 1][1])
          g.lineTo(tr.trail[k][0], tr.trail[k][1])
          g.stroke()
        }
      }
      g.globalAlpha = 1
    }

    // the ascii bits: flicker through random characters, lock in left to right, then fade
    function drawBits() {
      g.font = '600 13px "JetBrains Mono", monospace'
      g.textBaseline = 'middle'
      for (let k = bits.length - 1; k >= 0; k--) {
        const b = bits[k]
        b.age++
        const settled = Math.floor((b.age / 45) * b.text.length)
        if (b.age % 3 === 0) b.shown = b.text.slice(0, settled) + noise(Math.max(0, b.text.length - settled))
        const a = Math.min(1, b.age / 10, (b.life - b.age) / 30)
        if (a <= 0) { bits.splice(k, 1); continue }
        g.globalAlpha = a * 0.85
        g.fillStyle = b.color
        g.fillText(b.age > 45 ? b.text : b.shown, b.x, b.y)
      }
      g.globalAlpha = 1
    }

    // a bit of ascii shows up on its own every so often, so there's always some about
    const sprinkle = window.setInterval(() => {
      if (!still && !document.hidden && bits.length < BITS) drop(Math.random() * w, Math.random() * h, pick(TRACE_COLORS))
    }, 1100)

    // about 30 frames a second is plenty for something this slow, and it stops while the tab is hidden
    function draw(ms: number) {
      frame = requestAnimationFrame(draw)
      if (document.hidden || ms - last < 32) return
      last = ms
      const t = ms / 9000
      g.clearRect(0, 0, w, h)
      drawLines(t)
      drawTraces(t)
      drawBits()
    }
    // with reduced motion the map is drawn once and holds still
    if (still) {
      drawLines(0)
    } else frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      clearInterval(sprinkle)
      window.removeEventListener('resize', fit)
    }
  }, [])

  return <canvas ref={canvas} aria-hidden="true" className="topo-bg" />
}
