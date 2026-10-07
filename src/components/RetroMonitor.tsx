import type { ReactNode } from 'react'

// the beige crt monitor, whatever you pass in shows on the screen
export default function RetroMonitor({ children }: { children: ReactNode }) {
  return (
    <div className="monitor">
      <div className="monitor-case">
        <div className="monitor-screen">{children}</div>

        {/* strip under the screen with the vent and power light */}
        <div className="monitor-chin" aria-hidden="true">
          <span className="monitor-vent" />
          <span className="monitor-light" />
        </div>
      </div>

      {/* the stand */}
      <div className="monitor-neck" aria-hidden="true" />
      <div className="monitor-foot" aria-hidden="true" />
    </div>
  )
}
