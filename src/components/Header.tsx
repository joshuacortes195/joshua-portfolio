import { useEffect, useState } from 'react'
import Terminal from './Terminal'

export default function Header() {
  const [open, setOpen] = useState(false)

  // escape key closes the menu
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      {/* faded backdrop, clicking it closes the menu */}
      {open && <div className="fixed inset-0 z-40 bg-paper/80" onClick={() => setOpen(false)} />}

      <header className="fixed top-4 right-4 md:right-8 z-50 flex flex-col items-end gap-3">
        {/* the pill menu button */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="on-ink pill bg-ink text-paper border-paper/40 hover:bg-ink"
        >
          {open ? 'Close' : 'Menu'}
        </button>

        {/* the menu is a computer screen, click a choice or type to get around */}
        {open && (
          <nav id="site-menu" aria-label="Site menu" className="w-[min(26rem,calc(100vw-2rem))]">
            <Terminal onNavigate={() => setOpen(false)} />
          </nav>
        )}
      </header>
    </>
  )
}
