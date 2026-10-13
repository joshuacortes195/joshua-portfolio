import { useEffect, useRef, useState } from 'react'
import MenuScreen from './MenuScreen'
import { lockScroll, scrollToSection } from '../lib/scroll'

export default function Header() {
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  // the section picked in the menu, jumped to once the menu has closed
  const jump = useRef<string | null>(null)

  // escape key closes the menu
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // while the menu is open the page behind it can't be scrolled, clicked or tabbed into
  useEffect(() => {
    if (!open) return
    const behind = Array.from(document.querySelectorAll<HTMLElement>('main, footer, .skip-link'))
    const menuButton = button.current
    lockScroll(true)
    behind.forEach(el => (el.inert = true))
    // keyboard focus starts on the first choice, a frame later so the enter press that opened the menu doesn't also pick it
    const focusFirst = requestAnimationFrame(() => document.querySelector<HTMLElement>('#site-menu .menu-choice')?.focus())

    return () => {
      cancelAnimationFrame(focusFirst)
      lockScroll(false)
      behind.forEach(el => (el.inert = false))
      // focus goes to the picked section, or back to the menu button when nothing was picked
      if (jump.current) scrollToSection(jump.current)
      else menuButton?.focus()
      jump.current = null
    }
  }, [open])

  // closes the menu, and remembers the section to jump to if one was picked
  function close(section?: string) {
    jump.current = section ?? null
    setOpen(false)
  }

  return (
    <>
      {/* faded backdrop, clicking it closes the menu */}
      {open && <div className="fixed inset-0 z-40 bg-paper/80" onClick={() => close()} />}

      <header className="fixed top-4 right-4 md:right-8 z-50 flex flex-col items-end gap-3">
        {/* the pill menu button */}
        <button
          ref={button}
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-expanded={open}
          aria-controls="site-menu"
          className="on-ink pill bg-ink text-paper border-paper/40 hover:bg-ink"
        >
          {open ? 'Close' : 'Menu'}
        </button>

        {/* the menu is a little old computer that boots up when opened */}
        {open && (
          <nav id="site-menu" aria-label="Site menu" className="w-[min(22rem,calc(100vw-2rem))]">
            <MenuScreen onNavigate={close} />
          </nav>
        )}
      </header>
    </>
  )
}
