import { useEffect, useMemo, useState } from 'react'

// roughly one cutout for every this many pixels of page
const BAND = 440

// repeatable random numbers, so cutouts stay put when the page changes height
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// one soft lump of the cutout shape, kept inside the box so it never gets a flat edge
function lump(rand: () => number) {
  const rx = 26 + rand() * 16
  const ry = 26 + rand() * 16
  const cx = rx + rand() * (100 - rx * 2)
  const cy = ry + rand() * (100 - ry * 2)
  return `radial-gradient(ellipse ${rx}% ${ry}% at ${cx}% ${cy}%, #000 55%, transparent)`
}

// works out where every cutout goes for a page of this size
function scatter(seed: number, width: number, height: number) {
  const cutouts = []
  for (let i = 0; i * BAND < height; i++) {
    const rand = seeded(seed + i * 7919)
    // some bands stay empty so the spacing doesn't look even
    if (rand() < 0.2) continue
    const w = 80 + rand() * 70
    const h = w * (0.75 + rand() * 0.45)
    // can hang a little off either side of the screen
    const x = Math.round(-w * 0.25 + rand() * (width - w * 0.5))
    const y = Math.round(i * BAND + rand() * (BAND - h))
    if (y + h > height) continue
    // two or three lumps overlap into one uneven blob
    const lumps = rand() < 0.5 ? 2 : 3
    const mask = Array.from({ length: lumps }, () => lump(rand)).join(', ')
    cutouts.push({ key: i, x, y, w, h, mask })
  }
  return cutouts
}

// small uneven windows scattered down the page that show the grid behind it
export default function Cutouts({ enabled }: { enabled: boolean }) {
  // new layout on every visit
  const [seed] = useState(() => Math.floor(Math.random() * 1e9))
  const [page, setPage] = useState({ width: 0, height: 0 })

  // keeps track of how big the page is
  useEffect(() => {
    const root = document.getElementById('root')
    if (!enabled || !root) return
    const watcher = new ResizeObserver(() => setPage({ width: root.offsetWidth, height: root.offsetHeight }))
    watcher.observe(root)
    return () => watcher.disconnect()
  }, [enabled])

  const cutouts = useMemo(() => scatter(seed, page.width, page.height), [seed, page])

  if (!enabled) return null

  // sits behind everything and scrolls with the page
  return (
    <div aria-hidden="true" className="cutouts" style={{ height: page.height }}>
      {cutouts.map(c => (
        <div
          key={c.key}
          className="cutout grid-paper"
          style={
            {
              left: c.x,
              top: c.y,
              width: c.w,
              height: c.h,
              maskImage: c.mask,
              WebkitMaskImage: c.mask,
              // lines the grid up with the page instead of with each cutout
              '--gx': `${c.x}px`,
              '--gy': `${c.y}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
