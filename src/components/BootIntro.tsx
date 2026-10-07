import { useEffect, useRef } from 'react'
import RetroMonitor from './RetroMonitor'
import { gsap, SplitText, Flip, useGSAP } from '../lib/motion'
import { markBooted } from '../lib/boot'

// what the little computer prints while it boots
const LOG = [
  'JC-OS v2.6',
  '> mounting /projects ............ ok',
  '> loading bird_identifier.onnx .. ok',
  '> connecting modbus://ur-arm .... ok',
  '> starting portfolio ............ ok',
]

type Props = {
  // fires when the page underneath starts to show
  onReveal: () => void
  // fires when the intro is completely gone
  onDone: () => void
}

export default function BootIntro({ onReveal, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const finished = useRef(false)

  // ends the intro right away, used by skip and by the last frame
  function finish() {
    if (finished.current) return
    finished.current = true
    markBooted()
    onReveal()
    onDone()
  }

  // any key press skips
  useEffect(() => {
    window.addEventListener('keydown', finish)
    return () => window.removeEventListener('keydown', finish)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the whole sequence: type the log, grow the screen, wipe away
  useGSAP(
    () => {
      const screen = root.current!.querySelector<HTMLElement>('.monitor-screen')!
      const split = SplitText.create('[data-boot-line]', { type: 'chars', aria: 'none' })

      const tl = gsap.timeline({ onComplete: finish })

      // boot log types out fast
      tl.from(split.chars, { autoAlpha: 0, duration: 0.01, stagger: 0.0042 })

      // screen grows out of the monitor until it fills the window
      tl.add(() => {
        const before = Flip.getState(screen, { props: 'borderRadius' })
        screen.classList.add('monitor-screen-full')
        Flip.from(before, { duration: 0.5, ease: 'power3.inOut' })
      }, '+=0.12')
      tl.to('[data-boot-fade]', { autoAlpha: 0, duration: 0.25 }, '<')

      // dark screen slides up and shows the site
      tl.add(() => {
        markBooted()
        onReveal()
      }, '+=0.3')
      tl.to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.5, ease: 'power3.inOut' })
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      onClick={finish}
      className="fixed inset-0 z-[100] grid place-items-center bg-paper p-6"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      {/* the small computer in the middle */}
      <div className="w-full max-w-[24rem]">
        <RetroMonitor>
          <div data-boot-fade role="status" aria-label="Loading portfolio">
            {LOG.map(line => (
              <p key={line} data-boot-line aria-hidden="true" className="whitespace-pre">
                {line}
              </p>
            ))}
          </div>
        </RetroMonitor>
      </div>

      {/* skip button, clicking anywhere works too */}
      <button type="button" data-boot-fade className="pill absolute bottom-6 right-6 font-mono text-sm">
        skip
      </button>
    </div>
  )
}
