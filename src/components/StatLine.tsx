// a project's headline numbers, written as "one · two · three" and shown as separate bits
// each bit stays whole when the line wraps, and a wrapped line never starts with a dot
export default function StatLine({ stat, className = '' }: { stat: string; className?: string }) {
  // splits on the dots between the numbers
  const bits = stat
    .split(' \u00b7 ')
    .map(bit => bit.trim())
    .filter(Boolean)

  return (
    <div className={className}>
      <div className="stat-line">
        <p>
          {bits.map((bit, i) => (
            <span key={i} className="stat-bit">
              {/* a comma only screen readers get, the dot on screen is drawn by the styles */}
              {i > 0 && <span className="sr-only">, </span>}
              {bit}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
