import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { THEMES, setTheme, useTheme, type Theme } from '../lib/theme'

// a little round chip of a theme: a crop of its wood, an accent corner, and the card color around the edge
export function Swatch({ theme, className = '' }: { theme: Theme; className?: string }) {
  // the wood sits under the accent corner, plain themes just show their page color
  const wood = theme.texture ? `, url('${theme.texture}') 0 0 / 160px` : ''
  return (
    <span
      aria-hidden="true"
      className={`theme-swatch ${className}`}
      style={{
        background: `linear-gradient(135deg, transparent 0 58%, ${theme.accent} 58% 100%)${wood}, ${theme.paper}`,
        borderColor: theme.card,
      }}
    />
  )
}

// the swatch button in the corner, opens a short list of every theme
export default function ThemePicker({ onOpen }: { onOpen?: () => void }) {
  const [open, setOpen] = useState(false)
  const current = useTheme()
  const theme = THEMES.find(t => t.id === current) ?? THEMES[0]
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  // while the list is open, escape or a click anywhere else closes it
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    function onDown(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    // keyboard focus lands on the theme that's on now
    root.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  // up and down arrows walk the list, wrapping round at the ends
  function onListKey(e: ReactKeyboardEvent<HTMLUListElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'))
    const at = items.indexOf(document.activeElement as HTMLButtonElement)
    let next = at
    if (e.key === 'ArrowDown') next = (at + 1) % items.length
    if (e.key === 'ArrowUp') next = (at - 1 + items.length) % items.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = items.length - 1
    items[next]?.focus()
  }

  return (
    <div ref={root} className="relative">
      {/* the round button showing the theme that's on now */}
      <button
        ref={button}
        type="button"
        onClick={() => {
          if (!open) onOpen?.()
          setOpen(!open)
        }}
        aria-expanded={open}
        aria-controls="theme-list"
        aria-label={`Theme: ${theme.label}. Change theme`}
        className="on-ink theme-button"
      >
        <Swatch theme={theme} />
      </button>

      {/* the list of themes, picking one switches the whole site right away */}
      {open && (
        <div id="theme-list" className="on-ink theme-panel">
          <p className="meta px-3 pt-1 pb-2 text-card-mute">Theme</p>
          <ul onKeyDown={onListKey}>
            {THEMES.map(t => (
              <li key={t.id}>
                <button type="button" aria-pressed={t.id === current} onClick={() => setTheme(t.id)} className="theme-option">
                  <Swatch theme={t} />
                  <span className="flex-1">{t.label}</span>
                  {/* small mark next to the one that's on */}
                  <span aria-hidden="true" className="theme-check">
                    ●
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
