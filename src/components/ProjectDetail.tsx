import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { Project } from '../data/projects'
import { parseDetails } from '../lib/details'
import { safeLink } from '../lib/links'
import { useModal } from '../lib/modal'
import ProjectMedia from './ProjectMedia'

type Props = {
  project: Project
  onClose: () => void
  // puts keyboard focus back on the read more button that opened this
  onClosed: () => void
}

// the bigger write-up for one project, opened from the read more button on its card
export default function ProjectDetail({ project, onClose, onClosed }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  // where the mouse went down, so dragging out of the panel while selecting text doesn't close it
  const pressedOutside = useRef(false)
  const titleId = useId()
  // the link only shows when it's a real https address
  const demo = safeLink(project.demo)
  const blocks = parseDetails(project.details)

  // the page behind can't be scrolled, clicked or tabbed into, escape closes it, focus starts on the close button
  useModal(true, {
    behind: 'main, footer, header, .skip-link',
    onEscape: onClose,
    focusIn: () => closeButton.current,
    focusOut: onClosed,
  })

  // tab goes round inside the write-up instead of wandering off to the browser's own buttons
  function keepFocusInside(e: React.KeyboardEvent) {
    if (e.key !== 'Tab' || !panel.current) return
    const stops = Array.from(panel.current.querySelectorAll<HTMLElement>('a[href], button, video[controls], [tabindex="0"]'))
    const first = stops[0]
    const last = stops[stops.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // drawn straight onto the page body, outside the parts that get frozen behind it
  return createPortal(
    // faded sheet over the page, clicking it closes the write-up
    <div
      className="detail-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-paper/80 p-3 md:p-8"
      onMouseDown={e => (pressedOutside.current = e.target === e.currentTarget)}
      onClick={e => e.target === e.currentTarget && pressedOutside.current && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={keepFocusInside}
        className="detail-panel flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl md:rounded-3xl border border-ink bg-paper"
      >
        {/* top strip that stays put: which project this is, and the close button */}
        <div className="flex items-center justify-between gap-4 border-b border-ink py-2 pl-4 pr-2 md:pl-6 md:pr-3">
          <p className="meta min-w-0 truncate text-ink-soft" aria-hidden="true">
            &gt; projects/{project.id}
          </p>
          <button ref={closeButton} type="button" onClick={onClose} className="pill gap-2 pl-4 pr-3">
            Close
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {/* everything else scrolls inside the panel, lenis leaves wheel and touch scrolling in here alone */}
        <div data-lenis-prevent tabIndex={0} role="document" aria-labelledby={titleId} className="detail-scroll p-4 md:p-6">
          <ProjectMedia project={project} active onPaper />

          <h2 id={titleId} className="display mt-6 text-4xl md:text-6xl">
            {project.title}
          </h2>
          {/* headline numbers for the project, only when there are some */}
          {project.stat && <p className="detail-stat meta mt-4">{project.stat}</p>}

          {/* the write-up: section labels, paragraphs and bullet lists, always plain text */}
          <div className="mt-6 space-y-4 text-base md:text-lg leading-snug">
            {blocks.map((block, i) =>
              block.kind === 'heading' ? (
                <h3 key={i} className="meta mt-8 border-t border-ink pt-4 text-ink-soft">
                  {block.text}
                </h3>
              ) : block.kind === 'list' ? (
                <ul key={i} className="max-w-[68ch] space-y-3">
                  {block.items.map((item, n) => (
                    // each line gets a small mono arrow in front, same as the experience section
                    <li
                      key={n}
                      className="relative pl-6 before:content-['>'] before:absolute before:left-0 before:font-mono before:text-[0.85em] before:text-ink-soft"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="max-w-[68ch]">
                  {block.text}
                </p>
              ),
            )}
          </div>

          {/* stack tags */}
          {project.tags.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2 border-t border-ink pt-5">
              {project.tags.map((tag, i) => (
                <li key={i} className="tag">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {/* demo button, only when there is something to link */}
          {demo && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill-accent"
                aria-label={`Live demo of ${project.title} (opens in new tab)`}
              >
                Live demo
              </a>
              {project.desktopOnly && <p className="meta text-ink-soft">Desktop only, needs a keyboard</p>}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
