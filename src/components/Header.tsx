import { useRef, useState } from 'react'
import MenuScreen from './MenuScreen'
import ThemePicker from './ThemePicker'
import { scrollToSection } from '../lib/scroll'
import { useModal } from '../lib/modal'

export default function Header() {
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  // the section picked in the menu, jumped to once the menu has closed
  const jump = useRef<string | null>(null)

  // while the menu is open the page behind it can't be scrolled, clicked or tabbed into, and escape closes it
  useModal(open, {
    behind: 'main, footer, .skip-link',
    onEscape: () => setOpen(false),
    // keyboard focus starts on the first choice
    focusIn: () => document.querySelector<HTMLElement>('#site-menu .menu-choice'),
    // focus goes to the picked section, or back to the menu button when nothing was picked
    focusOut: () => {
      if (jump.current) scrollToSection(jump.current)
      else button.current?.focus()
      jump.current = null
    },
  })

  // closes the menu, and remembers the section to jump to if one was picked
  function close(section?: string) {
    jump.current = section ?? null
    setOpen(false)
  }

  return (
    <>
      {/* faded backdrop, clicking it closes the menu */}
      {open && <div className="menu-backdrop fixed inset-0 z-40 bg-paper/80" onClick={() => close()} />}

      <header className="fixed top-4 right-4 md:right-8 z-50 flex flex-col items-end gap-3">
        {/* the theme swatch and the menu button side by side */}
        <div className="flex items-start gap-2">
          {/* opening the theme list closes the menu so they never stack */}
          <ThemePicker onOpen={() => open && close()} />

          {/* the pill menu button */}
          <button
            ref={button}
            type="button"
            onClick={() => (open ? close() : setOpen(true))}
            aria-expanded={open}
            aria-controls="site-menu"
            className="on-ink pill bg-card text-card-ink border-card-ink/40 hover:bg-accent hover:text-on-accent hover:border-accent"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>

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
