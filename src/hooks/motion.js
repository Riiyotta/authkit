import { useEffect, useRef, useState } from 'react'

/* ============================================================================
   motion.js — the JS half of the motion system.

   Everything in here was measured off the live original with Playwright by
   instrumenting CanvasRenderingContext2D and watching class/style mutations;
   the numbers in the comments are those measurements. CSS owns every duration
   and easing (src/index.css + src/styles/*.css) — this file only supplies the
   triggers, the per-frame particle math and the handful of values the original
   writes inline.

   Measured facts that differ from CLONE_SPEC's guesses are called out inline.
   ========================================================================== */

/* The original only guards `.spotlight`; index.css adds a global guard. JS
   loops have to opt out themselves, so every hook below checks this. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/* ---------------------------------------------------------------------------
   IntersectionObserver.

   MEASURED: every observer on the page is a plain `{threshold: 0}` with no
   rootMargin. The features strip flips between rect.top 902 and 892 at a
   900px viewport, and `.dashboard` arms between rect.top 906 and 890 — i.e.
   exactly the fold. CLONE_SPEC §3.4 guessed `rootMargin:'200px 0px 0px 0px'`
   and §2.2 guessed `'0px 0px -100px 0px'`; both are wrong, the real observers
   use the defaults.
   --------------------------------------------------------------------------- */
export function useInView(ref, { once = true } = {}) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.unobserve(entry.target)
        } else if (!once) {
          setInView(false)
        }
      }
    }, { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, once])
  return inView
}

/* Imperative variant for the class-sequence drivers, which need a callback
   rather than a render. */
function observeOnce(el, onEnter) {
  if (typeof IntersectionObserver === 'undefined') {
    onEnter()
    return () => {}
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        io.disconnect()
        onEnter()
      }
    }
  }, { threshold: 0 })
  io.observe(el)
  return () => io.disconnect()
}

/* ---------------------------------------------------------------------------
   Particle fields (4 canvases).

   MEASURED by patching ctx.clearRect / ctx.arc / ctx.fillStyle on the live
   site. CLONE_SPEC §4.1 listed these as un-decompiled; they are now read
   directly off the original's own draw calls:

   * All four canvases are lazily sized to their CSS box on first intersection
     (they sit at the default 300x150 with an empty backing store until then).
   * Draw loop per frame: one clearRect over the whole canvas, then per
     particle `fillStyle = rgba(255,255,255,<a>)`, `beginPath()`,
     `arc(x, y, r, 0, 2π)`, `fill()`. The only colour ever used is pure white.
   * Alpha is a raw sine: `a = Math.sin(phase)`. Negative values are passed
     straight to rgba() (the original really does emit
     `rgba(255, 255, 255, -0.48…)`) and clamp to invisible, which is why only
     ~half the particles are lit at any instant.
   * Count is a pure area density, identical on the three starfields:
       1280x1222 → 938,  1280x1078 → 828,  992x664 → 395
       = round(w * h / 1666.67) for all three, exact.
     The RBAC dot field is 3x denser with a 3x radius: 128x363 → 84 particles
     at r=1.5 = round(w * h / 553).
   * Starfields drift straight up, x never changes: vy ∈ [-0.3055, -0.1023]
     px/frame (= -18.33…-6.14 px/s at 60fps) → `-(0.1 + random * 0.2)`.
     Wrap: y < 0 → y = h.
   * The RBAC dot field drifts straight left instead, vy == 0:
     vx ∈ [-0.170, -0.128] px/frame (-10.21…-7.69 px/s). Wrap: x < 0 → x = w.
   * Twinkle rate is per-particle random. Measured zero-crossing periods over
     a 7s window on all 938 hero particles: min 1.55s, p25 2.33s, median
     2.79s, with a long tail past the window. That matches a phase step of
     `random() * 0.07` rad/frame (period = 2π / (60 * step)); APPROXIMATE —
     the distribution is fitted, not read out of the bundle.
   --------------------------------------------------------------------------- */

const FIELD_PRESETS = {
  /* hero, customui and radix starfields */
  stars: {
    areaPerParticle: 1666.67,
    radius: 0.5,
    velocity: () => ({ vx: 0, vy: -(0.1 + Math.random() * 0.2) }),
  },
  /* .security-rbac__dots */
  dots: {
    areaPerParticle: 553,
    radius: 1.5,
    velocity: () => ({ vx: -(0.128 + Math.random() * 0.042), vy: 0 }),
  },
}

const TWINKLE_STEP_MAX = 0.07 // rad/frame

function createParticles(width, height, preset) {
  const count = Math.round((width * height) / preset.areaPerParticle)
  const particles = new Array(count)
  for (let i = 0; i < count; i += 1) {
    particles[i] = {
      x: Math.random() * width,
      y: Math.random() * height,
      phase: Math.random() * Math.PI * 2,
      step: Math.random() * TWINKLE_STEP_MAX,
      ...preset.velocity(),
    }
  }
  return particles
}

/**
 * Attaches the measured particle loop to a <canvas>. The loop only runs while
 * the canvas is on screen, which also reproduces the original's lazy sizing.
 */
export function useParticleField(ref, kind = 'stars') {
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || prefersReducedMotion()) return

    const preset = FIELD_PRESETS[kind]
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let particles = []
    let width = 0
    let height = 0
    let frame = 0
    let running = false

    /* The original sizes the backing store to the CSS box (no devicePixelRatio
       scaling — the hero canvas is exactly 1280x1222 at a 1280px viewport). */
    const size = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (!w || !h) return false
      if (w === width && h === height) return true
      width = w
      height = h
      canvas.width = w
      canvas.height = h
      particles = createParticles(w, h, preset)
      return true
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]
        p.phase += p.step
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(p.phase)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, preset.radius, 0, Math.PI * 2)
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.y < 0) p.y = height
        else if (p.y > height) p.y = 0
        if (p.x < 0) p.x = width
        else if (p.x > width) p.x = 0
      }
      frame = requestAnimationFrame(draw)
    }

    const start = () => {
      if (running || !size()) return
      running = true
      frame = requestAnimationFrame(draw)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(frame)
    }

    let io
    if (typeof IntersectionObserver === 'undefined') {
      start()
    } else {
      io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start()
          else stop()
        }
      }, { threshold: 0 })
      io.observe(canvas)
    }

    const onResize = () => {
      if (!running) return
      stop()
      width = 0
      height = 0
      start()
    }
    window.addEventListener('resize', onResize)

    return () => {
      stop()
      if (io) io.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [ref, kind])
}

/* ---------------------------------------------------------------------------
   Scroll-linked (scrubbed) motion with per-frame damping.

   CLONE_SPEC §3.4 states "no parallax, and no scroll-linked (scrubbed)
   animation anywhere". That is WRONG — two things are genuinely scrubbed:
   the radix logo stack and the centre hero card. Both are written as inline
   styles by a rAF loop that lerps the rendered value toward a scroll-derived
   target, which is why a static capture only ever shows a settled value.

   The damping factor (~0.075/frame) is APPROXIMATE: it is fitted from the
   geometric tail of the settle (ratio ≈0.625 per ~6 frames). The *targets*
   below are exact — they were read from settled values at 100px scroll
   intervals and reproduce the measurements to <0.1px.
   --------------------------------------------------------------------------- */
const LERP = 0.075

/**
 * `measureParent` reads the scroll position off the element's parent instead
 * of the element itself. Required whenever the scrubbed property is a
 * transform ON the observed element: `getBoundingClientRect()` reflects the
 * transform we just wrote, which feeds back into the next target and
 * stretches the mapping by 1/(1 - slope). (That bug made the hero card's
 * slope read 0.0398 px/px instead of the measured 0.0383.) The radix stack
 * does not need it — there the transforms live on `.radix-logo`'s children.
 */
export function useScrollLinked(ref, compute, apply, { measureParent = false } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const probe = measureParent ? (el.parentElement || el) : el

    let frame = 0
    let running = false
    const state = {}

    const tick = () => {
      const target = compute(probe.getBoundingClientRect(), window.innerHeight)
      for (const key of Object.keys(target)) {
        const want = target[key]
        if (state[key] == null) state[key] = want
        else state[key] += (want - state[key]) * LERP
      }
      apply(el, state)
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running) return
      running = true
      frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(frame)
    }

    if (prefersReducedMotion()) {
      /* settle straight to the in-view resting value, no motion */
      apply(el, compute(probe.getBoundingClientRect(), window.innerHeight))
      return
    }

    let io
    if (typeof IntersectionObserver === 'undefined') {
      start()
    } else {
      /* NOT a trigger — a pure performance gate. The scrub band starts with
         rect.top at vh+180, i.e. *below* the fold, so a bare `threshold: 0`
         observer would leave the loop parked and the layers frozen at their
         last settled value until the element crossed the fold (which read as
         "already fully revealed" on the way down). The real trigger is the
         clamp inside `compute`; this margin only has to be wider than the
         539px scrub range. */
      io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start()
          else stop()
        }
      }, { threshold: 0, rootMargin: '800px 0px 800px 0px' })
      io.observe(el)
    }

    return () => {
      stop()
      if (io) io.disconnect()
    }
  }, [ref, compute, apply, measureParent])
}

/* ---------------------------------------------------------------------------
   A tiny timeline runner for the `-active` / `-animate` class sequences.

   MEASURED mechanism: an IntersectionObserver (threshold 0) arms the block,
   then plain timers drive the classes. Nothing is ever re-armed and no
   `-active` class is ever removed by a scroll-out, so the cascade is one-shot
   and the loops keep their own clock — CLONE_SPEC §3.4's "clear the interval
   on exit" is not what the original does.
   --------------------------------------------------------------------------- */
export function useArmedTimeline(ref, run) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) return
    let dispose = null
    const off = observeOnce(el, () => { dispose = run(el) })
    return () => {
      off()
      if (typeof dispose === 'function') dispose()
    }
  }, [ref, run])
}

/** setTimeout/setInterval bookkeeping so a timeline can be torn down cleanly. */
export function createScheduler() {
  const timeouts = new Set()
  const intervals = new Set()
  return {
    after(ms, fn) {
      const id = setTimeout(() => { timeouts.delete(id); fn() }, ms)
      timeouts.add(id)
      return id
    },
    every(ms, fn) {
      const id = setInterval(fn, ms)
      intervals.add(id)
      return id
    },
    /** run `fn(i)` every `step` ms for `count` steps, starting immediately */
    cascade(step, count, fn) {
      for (let i = 0; i < count; i += 1) {
        if (i === 0) fn(0)
        else this.after(step * i, () => fn(i))
      }
    },
    dispose() {
      timeouts.forEach(clearTimeout)
      intervals.forEach(clearInterval)
      timeouts.clear()
      intervals.clear()
    },
  }
}

export function useElementRef() {
  return useRef(null)
}
