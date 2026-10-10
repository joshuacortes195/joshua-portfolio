import { useId, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'

// a titled box that groups related fields
export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-ink rounded-2xl p-5 md:p-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
}

// single line of text
export function Text({ label, value, onChange, hint }: FieldProps) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="meta block text-ink-soft">
        {label}
      </label>
      <input id={id} className="field" value={value} onChange={e => onChange(e.target.value)} />
      {hint && <p className="meta mt-1 text-ink-soft">{hint}</p>}
    </div>
  )
}

// a few lines of text
export function Area({ label, value, onChange, hint, rows = 3 }: FieldProps & { rows?: number }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="meta block text-ink-soft">
        {label}
      </label>
      <textarea id={id} className="field" rows={rows} value={value} onChange={e => onChange(e.target.value)} />
      {hint && <p className="meta mt-1 text-ink-soft">{hint}</p>}
    </div>
  )
}

type ListProps = {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  // one item per line instead of separated by commas
  lines?: boolean
  rows?: number
}

// splits typed text into list items
function parseList(text: string, lines: boolean) {
  const items = lines ? text.split('\n').map(t => t.trimEnd()) : text.split(',').map(t => t.trim())
  return items.filter(t => t.trim() !== '')
}

// edits a list of short texts, like tags or bullet points
export function List({ label, value, onChange, lines = false, rows = 5 }: ListProps) {
  const id = useId()
  // keeps exactly what was typed, so commas and new lines don't vanish mid-edit
  const [typed, setTyped] = useState(() => value.join(lines ? '\n' : ', '))
  // if the list got changed from outside, like a reorder, show the list instead of the old typing
  const inSync = parseList(typed, lines).join('\n') === value.join('\n')
  const raw = inSync ? typed : value.join(lines ? '\n' : ', ')

  // remembers the typing and passes the list up
  function update(text: string) {
    setTyped(text)
    onChange(parseList(text, lines))
  }

  return (
    <div>
      <label htmlFor={id} className="meta block text-ink-soft">
        {label}
      </label>
      {lines ? (
        <textarea id={id} className="field" rows={rows} value={raw} onChange={e => update(e.target.value)} />
      ) : (
        <input id={id} className="field" value={raw} onChange={e => update(e.target.value)} />
      )}
      <p className="meta mt-1 text-ink-soft">{lines ? 'One per line' : 'Separate with commas'}</p>
    </div>
  )
}

// a tick box with its label
export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 min-h-11 cursor-pointer">
      <input type="checkbox" className="size-5 accent-ink" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

type RowToolsProps = {
  name: string
  index: number
  count: number
  onMove: (to: number) => void
  onDelete: () => void
}

// a pill button that opens the file picker
export function FileButton({ label, accept, onPick }: { label: string; accept: string; onPick: (file: File) => void }) {
  return (
    <label className="pill focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onPick(file)
          // lets the same file be picked again later
          e.target.value = ''
        }}
      />
      {label}
    </label>
  )
}

// move up, move down and delete buttons for one item in a list
export function RowTools({ name, index, count, onMove, onDelete }: RowToolsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="pill px-3 disabled:opacity-30 disabled:pointer-events-none"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        aria-label={`Move ${name} up`}
      >
        <ArrowUp size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="pill px-3 disabled:opacity-30 disabled:pointer-events-none"
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
        aria-label={`Move ${name} down`}
      >
        <ArrowDown size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="pill px-3"
        onClick={() => window.confirm(`Delete ${name}?`) && onDelete()}
        aria-label={`Delete ${name}`}
      >
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
