import { useRef } from 'react'
import { FeatureTile } from './primitives.jsx'
import { useInView } from '../hooks/motion.js'

/* CLONE_SPEC §2.2 — features strip (6 icon tiles, not a carousel).

   MEASURED trigger: a plain `{threshold: 0}` IntersectionObserver on
   `.features-slider`. At a 900px viewport `--play-state` is still `paused`
   with rect.top at 902 and has flipped by rect.top 892 — i.e. the strip's
   top crossing the fold, with no rootMargin. (CLONE_SPEC §2.2 guessed
   `rootMargin:'0px 0px -100px 0px'` and §3.4 guessed a +200px margin; the
   original uses the defaults.) Fire-once — it is never unset.

   The original literally writes `--play-state: playing`, which is not a valid
   `animation-play-state` keyword; it works only because the invalid value
   makes the declaration compute to the initial `running`. We write `running`
   so the cascade is valid CSS — identical resulting motion. */

const ITEMS = [
  { src: '/img/features/sso.png', alt: 'single-sign-on', label: 'Single Sign-On', mobileLabel: 'Single Sign-On' },
  { src: '/img/features/password.png', alt: 'password', label: 'Password', mobileLabel: 'Password' },
  { src: '/img/features/mfa.png', alt: 'multi-factor-auth', label: 'Multi-Factor Auth', mobileLabel: 'Multi-Factor Auth' },
  { src: '/img/features/social.png', alt: 'social-login', label: 'Social Login', mobileLabel: 'Social Login' },
  { src: '/img/features/rbac.png', alt: 'rbac', label: 'Role-Based Access Control', mobileLabel: 'RBAC' },
  { src: '/img/features/magic.png', alt: 'magic-link', label: 'Magic Auth', mobileLabel: 'Magic Auth' },
]

export default function FeaturesSlider() {
  const ref = useRef(null)
  const inView = useInView(ref)

  return (
    <div className="features-slider" ref={ref}>
      <ul className="features-slider__items" style={{ '--play-state': inView ? 'running' : 'paused' }}>
        {ITEMS.map((item, i) => (
          <FeatureTile
            key={item.alt}
            {...item}
            index={i}
            /* the last tile carries no separator in the original markup */
            withSeparator={i < ITEMS.length - 1}
          />
        ))}
      </ul>
    </div>
  )
}
