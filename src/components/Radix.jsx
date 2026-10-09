import { useRef } from 'react'
import { BetweenLines, GlowingButton, INERT_HREF, SectionHeader } from './primitives.jsx'
import { useParticleField, useScrollLinked } from '../hooks/motion.js'
import { applyRadix, radixProgress } from '../hooks/sequences.js'

/* CLONE_SPEC §2.5 — radix.

   The four `.radix-logo-*` layers are driven by a scroll-linked (scrubbed)
   rAF loop, not a binary reveal — CLONE_SPEC §3.4's "no scroll-linked
   animation anywhere" is incorrect for this block. The measured mapping from
   `.radix-logo`'s rect.top to translateY / blender opacity / lines opacity is
   documented on `radixProgress` in src/hooks/sequences.js; the inline values
   seen in a static capture are just the settled end of that scrub.

   The resting markup therefore starts at the pre-reveal state
   (translateY(100px), blender transparent) and the loop takes over. */

const LINE_MASKS = [
  '/img/radix/masks/stroke-1.png',
  '/img/radix/masks/stroke-2.png',
  '/img/radix/masks/stroke-3.png',
]

export default function Radix() {
  const canvasRef = useRef(null)
  const logoRef = useRef(null)
  useParticleField(canvasRef, 'stars')
  useScrollLinked(logoRef, radixProgress, applyRadix)

  return (
    <div className="radix">
      <img alt="Radix background" loading="lazy" className="radix-background" src="/img/radix/bg.png" />
      <canvas ref={canvasRef} className="radix__canvas" data-radix-canvas="" />

      <SectionHeader
        eyebrow="Framework freedom"
        title={['Built on Radix, the most popular', 'open source design system.']}
        titleMobile={['Built on Radix,', 'the most popular', 'open source', 'design system.']}
        description="AuthKit is built with the same UI components used by Vercel, Linear, Supabase, and thousands of others."
      />

      <div className="radix-main">
        <picture>
          <source media="(min-width: 1200px)" srcSet="/img/radix/kit-desktop.png" width="1177" height="399" />
          <source media="(max-width: 1199px)" srcSet="/img/radix/kit-mobile.png" width="883.5" height="299" />
          <img
            alt="Radix kit"
            loading="lazy"
            width="883.5"
            height="299"
            className="radix-kit"
            src="/img/radix/kit-mobile.png"
          />
        </picture>

        <div className="radix-logo" ref={logoRef}>
          <div className="radix-logo-stroke" style={{ opacity: 1, transform: 'translateY(100px)' }}>
            <img alt="Radix logo stroke" src="/img/radix/logo-stroke.png" />
          </div>
          <div className="radix-logo-main" style={{ opacity: 1, transform: 'translateY(100px)' }}>
            <img alt="Radix logo stroke" src="/img/radix/logo-main.png" />
          </div>
          <div className="radix-logo-blender" style={{ opacity: 0, transform: 'translateY(100px)' }}>
            <img alt="Radix logo stroke" src="/img/radix/logo-blender.png" />
          </div>
          <div className="radix-logo-lines" style={{ opacity: 1, transform: 'translateY(100px)' }}>
            {LINE_MASKS.map((mask) => (
              <div className="radix-logo-lines-item" key={mask} style={{ '--mask-image': `url(${mask})` }}>
                <div />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="radix-border-overlay">
        <BetweenLines variant="gradient" style={{ marginTop: 46 }}>
          <GlowingButton href={INERT_HREF}>Learn more about Radix</GlowingButton>
        </BetweenLines>
      </div>
    </div>
  )
}
