import { useCallback, useRef } from 'react'
import { SectionHeader } from './primitives.jsx'
import { createScheduler, useArmedTimeline, useParticleField } from '../hooks/motion.js'
import { RBAC, runLeaked, runMulti, runPassword, runRbac } from '../hooks/sequences.js'
import { makeRbacLerp } from '../hooks/rbacLerp.js'

/* CLONE_SPEC §2.6 — security cards.

   Each card is armed independently by a `{threshold: 0}` IntersectionObserver
   on the card itself (measured: the leaked card's items first fire with the
   card's rect.top at 898 against a 900px viewport), after which its own timer
   loop drives the `-active` / `-filled` classes, `--step`, the bar tier
   classes and the RBAC readout. Every measured interval is documented in
   src/hooks/sequences.js — the steps are 2005ms (password), 1030ms (MFA),
   833ms (dashboard) and a 14081ms / 6050ms cycle (leaked / RBAC); CLONE_SPEC
   §4.2's single ~750ms step does not appear anywhere. */

const BUTTON_SHAPES = [
  {
    viewBox: '0 -960 960 960',
    fill: 'currentColor',
    d: 'M480.34-116q-75.11 0-141.48-28.42-66.37-28.42-116.18-78.21-49.81-49.79-78.25-116.09Q116-405.01 116-480.39q0-75.38 28.42-141.25t78.21-115.68q49.79-49.81 116.09-78.25Q405.01-844 480.39-844q75.38 0 141.25 28.42t115.68 78.21q49.81 49.79 78.25 115.85Q844-555.45 844-480.34q0 75.11-28.42 141.48-28.42 66.37-78.21 116.18-49.79 49.81-115.85 78.25Q555.45-116 480.34-116Zm-.34-52q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Z',
  },
  { viewBox: '0 -960 960 960', fill: 'currentColor', d: 'M164-164v-632h632v632H164Zm52-52h528v-528H216v528Zm0 0v-528 528Z' },
  { viewBox: '0 0 24 24', fill: 'none', d: 'M1.865 20.5 12 3l10.134 17.5H1.866ZM4.45 19h15.1L12 6 4.45 19Z' },
  {
    viewBox: '0 -960 960 960',
    fill: 'currentColor',
    d: 'M256-213.85 213.85-256l224-224-224-224L256-746.15l224 224 224-224L746.15-704l-224 224 224 224L704-213.85l-224-224-224 224Z',
  },
]

/* One armed timeline per card, so each card starts when it reaches the fold
   exactly as the original's do. */
function Card({ label, children, timeline }) {
  const ref = useRef(null)
  const run = useCallback((el) => {
    if (!timeline) return undefined
    const scheduler = createScheduler()
    timeline(el, scheduler)
    return () => scheduler.dispose()
  }, [timeline])
  useArmedTimeline(ref, run)

  return (
    <div className="security-card" ref={ref}>
      <div className="security-card-animation">{children}</div>
      <div className="security-card-label">{label}</div>
    </div>
  )
}

export default function Security() {
  const dotsRef = useRef(null)
  /* MEASURED: 84 particles at r=1.5 in a 128x363 box (= round(w*h / 553)),
     drifting left at 0.128-0.170 px/frame — a denser, bigger-dotted variant
     of the three starfields, and the only one that moves horizontally. */
  useParticleField(dotsRef, 'dots')

  const rbacTimeline = useCallback((el, scheduler) => {
    runRbac(el, scheduler, makeRbacLerp(el, scheduler))
  }, [])

  return (
    <div className="security">
      <SectionHeader
        eyebrow="Advanced security"
        title={['Designed for developers.', 'Built for the enterprise.']}
        description="AuthKit supports enterprise-grade security with modern authentication and authorization standards."
      />

      <div className="security-cards">
        {/* 1 — leaked password protection */}
        <Card label="Leaked password protection" timeline={runLeaked}>
          <div className="security-leaked">
            <img alt="Background" className="security-card-bg" src="/img/security/leaked-bg.png" />
            <div className="security-leaked-line">
              <div />
            </div>
            <div className="security-leaked-border" />
            <img
              alt="Text"
              width="175"
              height="21"
              className="security-leaked-text"
              src="/img/security/leaked/text.png"
            />
            <div className="security-leaked-check">
              {[1, 2, 3, 4].map((n) => (
                <img key={n} alt="check piece" src={`/img/security/leaked/check-${n}.png`} />
              ))}
            </div>
            <div className="security-leaked-radar">
              <div className="security-leaked-radar-item" />
              <div className="security-leaked-radar-item" />
            </div>
          </div>
        </Card>

        {/* 2 — role-based access control */}
        <Card label="Role-Based Access Control" timeline={rbacTimeline}>
          <div className="security-rbac">
            <div className="security-rbac__card-container">
              <img
                alt=""
                role="presentation"
                width="124"
                height="78"
                className="security-rbac__card"
                src="/img/security/rbac/card.png"
              />
            </div>
            <div className="security-rbac__card-reader">
              <img alt="" role="presentation" width="100" height="144" src="/img/security/rbac/card-reader.png" />
              {/* resting readout; the decoder cycles it through the measured
                  role list (see RBAC.roles) once the card is in view */}
              <p className="security-rbac__display">{RBAC.placeholder}</p>
              <div className="security-rbac__buttons">
                {BUTTON_SHAPES.map((shape, i) => (
                  <div className="security-rbac__button" key={i}>
                    <img alt="" role="presentation" width="28" height="28" src="/img/security/rbac/button.png" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16px"
                      height="16px"
                      fill={shape.fill}
                      viewBox={shape.viewBox}
                      className="security-rbac__button-shape"
                      data-shape={i}
                    >
                      <path fill={shape.fill === 'none' ? 'currentColor' : undefined} d={shape.d} />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            <img
              alt=""
              role="presentation"
              width="150"
              height="186"
              className="security-rbac__card-light"
              src="/img/security/rbac/card-light.png"
            />
            <div className="security-rbac__dots">
              <canvas ref={dotsRef} data-rbac-canvas="" />
            </div>
          </div>
        </Card>

        {/* 3 — password strength validation */}
        <Card label="Password strength validation" timeline={runPassword}>
          <div className="security-password">
            <img alt="Background" className="security-card-bg" src="/img/security/password-bg.png" />
            <div className="security-password-border" />
            <div className="security-password-text">
              <img
                alt="Text"
                width="208"
                height="132"
                style={{ '--step': 0 }}
                src="/img/security/password/text.png"
              />
            </div>
            <div className="security-password-bars">
              {[0, 1, 2, 3].map((i) => (
                <div className="security-password-bars-item" key={i}>
                  <div />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 4 — automatic spam and bot detection */}
        <Card label="Automatic spam and bot detection">
          <div className="security-automatic">
            <img alt="Background" className="security-card-bg" src="/img/security/automatic-bg.png" />
            <img
              alt="Radar"
              width="292"
              height="292"
              className="security-automatic-radar"
              src="/img/security/automatic/radar.png"
            />
            <div className="security-automatic-dots">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} />
              ))}
            </div>
          </div>
        </Card>

        {/* 5 — multi-factor authentication */}
        <Card label="Multi-Factor Authentication" timeline={runMulti}>
          <div className="security-multi">
            <img alt="Background" className="security-card-bg" src="/img/security/multi-bg.png" />
            <div className="security-multi-box">
              <div className="security-multi-box-inputs">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div className="security-multi-box-inputs-item" key={i}>
                    <div />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
