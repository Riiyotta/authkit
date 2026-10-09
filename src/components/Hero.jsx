import { useEffect, useRef, useState } from 'react'
import AuthCard from './AuthCard.jsx'
import { Eyebrow, GlowingButton, INERT_HREF, OutlineBox } from './primitives.jsx'
import { GithubIcon, HeroMarkIcon, MoonIcon, PoweredByWordmark, SunIcon } from './icons.jsx'
import { useParticleField, useScrollLinked } from '../hooks/motion.js'
import { CARD_TILT_X, applyHeroCard, heroCardProgress } from '../hooks/sequences.js'

/* CLONE_SPEC §2.1 — hero.
   17x14 hairline grid (9x14 below 640px) lives in src/styles/hero.css.
   The three login cards are the shared <AuthCard>, configured by props; light
   mode is a single `.light` class on each card subtree (base.css cascade). */

const SPOTLIGHTS = [
  { '--rotate': '20deg', '--scale': 1, '--duration': '5s' },
  { '--rotate': '0deg', '--scale': 1.02, '--duration': '8s' },
  { '--rotate': '-20deg', '--scale': 1, '--duration': '4s' },
]

/* measured inline values from the capture — see §2.1 */
const CARDS = [
  {
    key: 'left',
    data: 'data-card-left',
    outer: { transform: 'translateZ(-50px) rotateY(-10deg)' },
    props: {
      style: { height: 392, '--brand-color': '#EF6643', '--brand-radius': '4px' },
      headerStyle: { marginBottom: 24 },
      logo: <img alt="Blamer" loading="lazy" width="32" height="32" src="/img/hero/card-logo-2.png" />,
      title: 'Welcome to the Blamer',
      subtitle: 'Log in to continue.',
      fields: [{ label: 'Email', type: 'email', name: 'email', placeholder: 'Your email address' }],
      footer: { text: "Don't have an account?", linkLabel: 'Sign up' },
    },
  },
  {
    key: 'center',
    data: 'data-card-center',
    outer: { zIndex: 1, transform: 'none' },
    props: {
      style: { '--brand-radius': '999px' },
      animated: { startAngle: '631deg', delay: '7s' },
      logo: <img alt="SuperApp" loading="lazy" width="32" height="32" src="/img/hero/card-logo-1.png" />,
      title: 'Sign in to SuperApp',
      fields: [{ label: 'Email', type: 'email', name: 'email', placeholder: 'Your email address' }],
      divider: 'OR',
      socials: ['google', 'microsoft'],
      footer: { text: "Don't have an account?", linkLabel: 'Sign up' },
    },
  },
  {
    key: 'right',
    data: 'data-card-right',
    outer: { transform: 'translateZ(-50px) rotateY(10deg)' },
    props: {
      style: { height: 392, '--brand-color': '#000', '--brand-radius': '2px' },
      logo: <img alt="Clamer" loading="lazy" width="32" height="32" src="/img/hero/card-logo-3.png" />,
      title: 'Sign in to Clamer',
      subtitle: 'Enter the temporary passcode from your authenticator app.',
      otp: { label: 'One time code', length: 6 },
      footer: { linkLabel: 'Return to sign in' },
    },
  },
]

export default function Hero() {
  const [intro, setIntro] = useState(false)
  const [checked, setChecked] = useState(false)
  const canvasRef = useRef(null)
  const centreTiltRef = useRef(null)

  /* The original ships `.hero--intro` in the server HTML, so its intro is a
     paint-time state, not a transition from a previous one. Adding the class
     on the next frame is what actually makes our measured CSS transition
     timeline (header 1.5s/0.3s, logo 2s/0.1s, headline 1.5s/0.6s,
     light-switch 1.5s/2.1s, lines 3s, all off `--intro-delay:.1s`) run — the
     end states match the original's, the trigger is one frame later by
     necessity. Hero card opacity is written inline by the original's own
     tilt JS on mount, so it is tied to the same flag. */
  useEffect(() => {
    const id = requestAnimationFrame(() => setIntro(true))
    return () => cancelAnimationFrame(id)
  }, [])

  /* MEASURED starfield: 938 particles in the 1280x1222 box
     (= round(w*h / 1666.67)), r=0.5, white, drifting up at 0.1-0.3 px/frame
     with a per-particle sine twinkle. Canvas opacity .5 comes from CSS. */
  useParticleField(canvasRef, 'stars')

  /* MEASURED: only the centre card moves — a scroll-linked, damped
     translateY clamped to +/-25px. The side cards carry a static
     translateX(+/-180px) at every width. See `heroCardProgress`. */
  useScrollLinked(centreTiltRef, heroCardProgress, applyHeroCard, { measureParent: true })

  const state = checked ? 'checked' : 'unchecked'

  return (
    <div className={`hero ${intro ? 'hero--intro' : ''}`}>
      {/* starfield — draw loop is the Animation agent's job (§4.1) */}
      <canvas ref={canvasRef} className="hero__canvas" data-hero-canvas="" />

      <div className="hero__spotlights">
        {SPOTLIGHTS.map((style, i) => (
          <div className="spotlight" key={i} style={style} />
        ))}
      </div>

      <div className="hero__lines">
        <div className="hero__wlines">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="hero__hline" style={{ gridArea: `h-line-${n}`, opacity: n === 1 ? 0.75 : 1 }} />
          ))}
        </div>
        <div className="hero__vlines">
          {/* the original's 5th/6th vlines name grid areas the stylesheet never
              declares (it declares vs-line-1/2), so they auto-place — replicated */}
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="hero__vline" style={{ gridArea: `v-line-${n}`, opacity: n > 4 ? 0.5 : 1 }} />
          ))}
        </div>
      </div>

      <header className="hero__header">
        <div className="hero__powered-by">
          <h2 className="visually-hidden">WorkOS</h2>
          <div className="powered-by__wrapper">
            <a href={INERT_HREF} className="powered-by__link">
              <PoweredByWordmark />
            </a>
          </div>
        </div>

        <HeroMarkIcon className="hero__workos-icon" />

        <div className="hero__right">
          <GlowingButton className="hero__github" href={INERT_HREF} aria-label="View code on GitHub">
            <GithubIcon />
          </GlowingButton>
          <GlowingButton href={INERT_HREF}>Get started</GlowingButton>
        </div>
      </header>

      <Eyebrow className="hero__introducing">Introducing</Eyebrow>

      <OutlineBox dots className="hero__logo">
        <img alt="Authkit logo" width="476" height="106" src="/img/brand/logo.svg" />
        {/* one-shot flare: `loop` is deliberately absent (§2.1) */}
        <video autoPlay muted width="1280" height="600" playsInline preload="auto" className="hero__video">
          <source src="/video/hero-flare.mov" type="video/mp4" />
        </video>
      </OutlineBox>

      <OutlineBox dots className="hero__headline">
        <h2 className="text-h4 text-center">
          <span style={{ lineHeight: '32px' }} className="text-gradient">
            The world’s best login box,
          </span>
          <br />
          <span className="text-gradient">powered by WorkOS + Radix.</span>
        </h2>
      </OutlineBox>

      <div className="hero__cards">
        {CARDS.map((card) => (
          <div key={card.key} {...{ [card.data]: 'true' }} style={{ ...card.outer, opacity: intro ? 1 : 0 }}>
            {/* inner wrapper is the original's JS-driven tilt/offset hook:
                static inward pull on the side cards, scrubbed float on the
                centre one */}
            <div
              data-card-tilt=""
              ref={card.key === 'center' ? centreTiltRef : undefined}
              style={
                card.key === 'center'
                  ? undefined
                  : { transform: `translateX(${card.key === 'left' ? CARD_TILT_X : -CARD_TILT_X}px)` }
              }
            >
              <AuthCard
                {...card.props}
                surface="hero"
                size="large"
                className={`hero__card${checked ? ' light' : ''}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="hero__light-switch">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label="Toggle light and dark mode"
          data-state={state}
          value="on"
          onClick={() => setChecked((v) => !v)}
          className={`light-switch ${checked ? 'light-switch--light' : 'light-switch--dark'}`}
        >
          <span data-state={state} className="light-switch__thumb" />
          <MoonIcon />
          <SunIcon />
        </button>
        <p className="text-p text-muted text-center">Light and dark modes supported.</p>
      </div>

      <span className="hero__cross hero__cross-1" />
      <span className="hero__cross hero__cross-2" />
    </div>
  )
}
