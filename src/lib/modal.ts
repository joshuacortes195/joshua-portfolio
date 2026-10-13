import { useEffect, useEffectEvent } from 'react'
import { lockScroll } from './scroll'

type ModalOptions = {
  // everything on the page that sits behind it, as a css selector
  behind: string
  // called when escape is pressed
  onEscape: () => void
  // what takes keyboard focus once it's open
  focusIn: () => HTMLElement | null | undefined
  // puts keyboard focus back where it belongs after it has closed
  focusOut: () => void
}

// makes the menu or the project write-up a real modal while it's open
// the page behind can't be scrolled, clicked or tabbed into, escape closes it, and focus moves in and back out
export function useModal(open: boolean, { behind, onEscape, focusIn, focusOut }: ModalOptions) {
  // the newest callbacks, so the modal isn't set up again every time the page redraws
  const escape = useEffectEvent(onEscape)
  const moveIn = useEffectEvent(focusIn)
  const moveOut = useEffectEvent(focusOut)

  // escape key closes it
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') escape()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // freezes the page behind while it's open
  useEffect(() => {
    if (!open) return
    const page = Array.from(document.querySelectorAll<HTMLElement>(behind))
    lockScroll(true)
    page.forEach(el => (el.inert = true))
    // focus moves in a frame later, so the enter press that opened it doesn't also press what gets focus
    const focusFirst = requestAnimationFrame(() => moveIn()?.focus())

    return () => {
      cancelAnimationFrame(focusFirst)
      lockScroll(false)
      page.forEach(el => (el.inert = false))
      moveOut()
    }
  }, [open, behind])
}
