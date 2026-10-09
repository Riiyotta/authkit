import { useCallback, useRef } from 'react'
import { GlowingButton, INERT_HREF, SectionHeader } from './primitives.jsx'
import { createScheduler, useArmedTimeline } from '../hooks/motion.js'
import { runProgress } from '../hooks/sequences.js'

/* CLONE_SPEC §2.7 — "one platform" section.
   Everything here loops on its own clock except `.complete-user-progress`
   heights, which JS writes (Animation agent). */

const BADGES = ['Email & Password', 'Social Login', 'Multi-Factor Auth', 'Single Sign-On', 'Directory Sync']
const SOCIAL = ['square', 'circle', 'square', 'circle', 'triangle', 'circle']
const SINGLE_MASK = '/img/complete/masks/single.png'

export default function Complete() {
  const ref = useRef(null)
  /* MEASURED: the two `.complete-user-progress` rows fill in 6 increments of
     20/6px on a ~512ms step, one row after the other. See `runProgress`. */
  const run = useCallback((el) => {
    const scheduler = createScheduler()
    runProgress(el, scheduler)
    return () => scheduler.dispose()
  }, [])
  useArmedTimeline(ref, run)

  return (
    <div className="complete" ref={ref}>
      <SectionHeader
        eyebrow="Future-proof your app"
        titleTag="h2"
        titleClass="section-header-title-h2"
        title={['The one platform,', 'for years of growth.']}
        description="AuthKit integrates seamlessly with WorkOS, the only end-to-end platform to make your app Enterprise Ready with SAML, SCIM, RBAC, and more."
      />

      <div className="complete-inner">
        <img alt="Complete background" loading="lazy" src="/img/complete/bg.png" />

        <div
          className="complete-line"
          style={{ '--mask-image': 'url(/img/complete/masks/halo.png)', width: '689.5px', height: '349.5px' }}
        >
          <div />
          <div />
        </div>

        <div>
          {BADGES.map((b) => (
            <div className="complete-badge" key={b}>
              {b}
            </div>
          ))}
        </div>

        <div className="complete-user">
          {[0, 1].map((row) => (
            <div className="complete-user-row" key={row}>
              <div className="complete-user-progress" style={{ height: '0px' }} />
              <div className="complete-user-dots">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="complete-social">
          {SOCIAL.map((shape, i) => (
            <img key={i} alt="Shape" width="28" height="33" src={`/img/complete/${shape}.png`} />
          ))}
        </div>

        <div className="complete-multi">
          <div className="complete-multi-dots">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} />
            ))}
          </div>
          <div
            className="complete-multi-line"
            style={{ '--mask-image': 'url(/img/complete/masks/multi.png)', width: '133.5px', height: '37.5px' }}
          />
        </div>

        <div className="complete-single">
          {[0, 1].map((pair) => (
            <div className="complete-single-lines" key={pair} style={{ width: '63.5px', height: '47.5px' }}>
              <div
                className="complete-single-line"
                style={{ '--mask-image': `url(${SINGLE_MASK})`, width: '63.5px', height: '47.5px' }}
              />
              <div
                className="complete-single-line"
                style={{ '--mask-image': `url(${SINGLE_MASK})`, width: '63.5px', height: '47.5px' }}
              />
            </div>
          ))}
          <img alt="" width="136.5" height="61.5" className="complete-single-overlay" src="/img/complete/single-overlay.png" />
        </div>

        <div className="complete-directory">
          <div />
        </div>
      </div>

      <GlowingButton
        className="complete-button"
        href={INERT_HREF}
      >
        Learn more about WorkOS User Management
      </GlowingButton>
    </div>
  )
}
