import { useEffect, useRef, useState } from 'react'
import type { Project, ProjectMedia as MediaFile } from '../data/projects'
import { reducedMotion } from '../lib/motion'

// looping clip that only plays on the middle card while it's on screen
function Clip({ media, active }: { media: MediaFile; active: boolean }) {
  const video = useRef<HTMLVideoElement>(null)
  // with reduced motion the clip waits for a click instead of autoplaying
  const [manual] = useState(reducedMotion)
  const [onScreen, setOnScreen] = useState(false)
  // true when the phone refused to autoplay, like in low power mode
  const [blocked, setBlocked] = useState(false)

  // keeps track of whether the clip is on screen
  useEffect(() => {
    const el = video.current
    if (!el || manual) return
    const watcher = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.4 })
    watcher.observe(el)
    return () => watcher.disconnect()
  }, [manual])

  // plays on the middle card, pauses everywhere else
  useEffect(() => {
    const el = video.current
    if (!el) return
    // a clip started by hand still stops when its card leaves the middle or the write-up opens over it
    if (manual) return active ? undefined : el.pause()
    if (!active || !onScreen) return el.pause()
    if (blocked) return
    // when autoplay isn't allowed the play button shows up instead
    el.play().catch(err => {
      if (err?.name === 'NotAllowedError') setBlocked(true)
    })
  }, [manual, active, onScreen, blocked])

  return (
    <video
      ref={video}
      className="w-full h-full object-cover"
      poster={media.poster}
      aria-label={media.alt}
      controls={manual || blocked}
      muted
      loop
      playsInline
      preload="none"
    >
      <source src={media.src} type="video/mp4" />
    </video>
  )
}

// screenshot of the project
function Shot({ media }: { media: MediaFile }) {
  return (
    <img className="w-full h-full object-cover" src={media.src} alt={media.alt} loading="lazy" decoding="async" />
  )
}

// stand-in screen for projects that don't have a clip or screenshot yet
function Blank({ project }: { project: Project }) {
  return (
    <div className="blank-screen w-full h-full grid place-items-center font-mono text-sm md:text-base text-accent">
      &gt; {project.id}_
    </div>
  )
}

// the clip or screenshot at the top of a card or of the write-up, shaped like the screen recordings
// onPaper swaps the faint light edge for a dark one, for when it sits on the white page instead of a dark card
export default function ProjectMedia({ project, active, onPaper = false }: { project: Project; active: boolean; onPaper?: boolean }) {
  const media = project.media
  return (
    <div
      className={`aspect-[1280/692] rounded-[10px] md:rounded-xl overflow-hidden bg-mute border ${onPaper ? 'border-ink' : 'border-paper/15'}`}
    >
      {!media ? <Blank project={project} /> : media.kind === 'video' ? <Clip media={media} active={active} /> : <Shot media={media} />}
    </div>
  )
}
