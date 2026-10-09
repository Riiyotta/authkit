import { useCallback, useRef } from 'react'
import { SectionHeader } from './primitives.jsx'
import { createScheduler, useArmedTimeline } from '../hooks/motion.js'
import { runDashboard } from '../hooks/sequences.js'

/* CLONE_SPEC §2.3 — dashboard.
   All `-active` / `-animate` classes and the database bar heights are driven by
   JS (Animation agent); this renders the complete resting state. */

/* The original's inline `--transition-delay` generator, recovered from the
   captured DOM: 0.2s + 0.1s per dot, across both 6-dot rows. */
const DOT_DELAYS = Array.from({ length: 12 }, (_, i) => `${0.2 + i * 0.1}s`)

const LINES = [
  { mask: '/img/dashboard/masks/line-1.png', w: 699.5, h: 157.5 },
  { mask: '/img/dashboard/masks/line-2.png', w: 715.5, h: 173.5 },
  { mask: '/img/dashboard/masks/line-3.png', w: 747.5, h: 222.5 },
  { mask: '/img/dashboard/masks/line-4.png', w: 775.5, h: 263.5 },
  { mask: '/img/dashboard/masks/line-5.png', w: 811.5, h: 279.5 },
]

function DotRows({ className }) {
  return (
    <div>
      {[0, 1].map((row) => (
        <div className={className} key={row}>
          {DOT_DELAYS.slice(row * 6, row * 6 + 6).map((d) => (
            <div key={d} style={{ '--transition-delay': d }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const ref = useRef(null)
  /* MEASURED: `{threshold: 0}` observer on `.dashboard` arms the block when
     its top crosses the fold (flip seen between rect.top 906 and 890 at a
     900px viewport), then an 833ms-step cascade latches the six nodes on.
     Numbers and provenance live in src/hooks/sequences.js. */
  const run = useCallback((el) => {
    const scheduler = createScheduler()
    runDashboard(el, scheduler)
    return () => scheduler.dispose()
  }, [])
  useArmedTimeline(ref, run)

  return (
    <div className="dashboard" ref={ref}>
      <SectionHeader
        eyebrow="Extensible by design"
        title={['Your\u00a0users. Your\u00a0data.', 'Maximum flexibility.']}
        description="AuthKit is compatible with any app architecture, allowing you to easily sync user updates via realtime APIs."
      />

      <div className="dashboard-animation-wrapper">
        <picture>
          <source media="(min-width: 1200px)" srcSet="/img/dashboard/bg-desktop.png" width="1440" height="1032" />
          <source media="(max-width: 1199px)" srcSet="/img/dashboard/bg-mobile.png" width="697" height="506.5" />
          <img
            alt="Dashboard background"
            loading="lazy"
            width="697"
            height="506.5"
            className="dashboard-background"
            src="/img/dashboard/bg-mobile.png"
          />
        </picture>

        <div className="dashboard-animation">
          <div className="dashboard-lines">
            {LINES.map((l) => (
              <div
                className="dashboard-lines-item"
                key={l.mask}
                style={{ '--mask-image': `url(${l.mask})`, '--animation-duration': '5000ms', width: l.w, height: l.h }}
              >
                <div style={{ width: l.w, height: l.w, '--start-angle': '225deg' }} />
              </div>
            ))}
          </div>

          <div className="dashboard-application">
            <DotRows className="dashboard-application-input" />
            <div className="dashboard-application-button" />
          </div>

          <div className="dashboard-auth">
            <DotRows className="dashboard-auth-input" />
          </div>

          <div className="dashboard-work">
            <img
              alt="Dashboard Work Inner"
              loading="lazy"
              width="218"
              height="218"
              className="dashboard-work-inner"
              src="/img/dashboard/work-inner.png"
            />
            <div className="dashboard-work-lights">
              <div />
              <div />
            </div>
            <div className="dashboard-work-bars">
              <div />
              <div />
            </div>
          </div>

          <div className="dashboard-user">
            <div className="dashboard-user-dot" />
            <div className="dashboard-user-spinner">
              <img alt="Dashboard User Spinner" loading="lazy" width="51.5" height="51.5" src="/img/dashboard/spinner.png" />
            </div>
          </div>

          <div className="dashboard-events">
            <div
              className="dashboard-events-spinner"
              style={{ '--mask-image': 'url(/img/dashboard/masks/events-spinner.png)' }}
            >
              <div />
            </div>
          </div>

          <div className="dashboard-database">
            <div className="dashboard-database-bars">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} style={{ height: '2px' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
