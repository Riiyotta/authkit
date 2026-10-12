/* ============================================================================
   sequences.js — the measured class/style timelines.

   Every number below was read off https://www.authkit.com/ by parking the
   block in view and recording class + inline-style mutations with timestamps.
   CLONE_SPEC §4.2 flagged these tables as "derived, not read" and guessed a
   ~750ms step; the real steps are per-block and are listed per function.

   Shared mechanism (measured): an IntersectionObserver with `{threshold: 0}`
   and no rootMargin arms the block when its top crosses the fold; the
   timelines then run on their own clock and are never reset by scrolling out.
   ========================================================================== */

export const ACTIVE = (base) => `${base}-active`

/* ---------------------------------------------------------------------------
   Dashboard — CLONE_SPEC §2.3.

   MEASURED (1280x900, block parked in view, rAF-polled):
     node `-active` cascade step = 833ms exactly
       0ms    lines items + application
       833    auth
       1666   work
       2499   user
       3332   events
       4165   database
     (recorded as 370/1203/2036/2870/3703/4536 — the 370ms offset is
     `scroll-behavior:smooth` settling, not a timeline delay.)

   The `-animate` dot-typewriter classes then loop independently, each
   starting at its own node's activation:
     period 4000ms, class present for 1802ms.
   Measured absolute events over 20s: application +animate at 465/4465/8465/
   12465/16464 (Δ4000) and −animate at 2267/6266/10265/14266/18266 (+1802);
   auth is the same loop offset by +833ms.

   No `-active` class is ever removed, so the cascade is one-shot.

   Database equaliser: 9 bars, re-rolled every 800ms (measured intervals
   799/800/800/800/800/800/801/799/800/800), integer px heights in [2, 27]
   against a 28px-tall container. CSS carries the `height 1s linear`.
   CLONE_SPEC §4.5 guessed 20 bars on a 1s re-roll — it is 9 bars at 800ms.
   --------------------------------------------------------------------------- */
export const DASHBOARD = {
  cascadeStep: 833,
  animatePeriod: 4000,
  animateOn: 1802,
  barInterval: 800,
  barMin: 2,
  barMax: 27,
  /* cascade order; `lines` fires together with `application` on step 0 */
  order: ['application', 'auth', 'work', 'user', 'events', 'database'],
}

export function runDashboard(root, scheduler) {
  const q = (sel) => Array.from(root.querySelectorAll(sel))
  const add = (sel, cls) => q(sel).forEach((el) => el.classList.add(cls))
  const remove = (sel, cls) => q(sel).forEach((el) => el.classList.remove(cls))

  /* step 0 also lights the four connector lines */
  add('.dashboard-lines-item', 'dashboard-lines-item-active')

  /* the dot typewriters loop; the other nodes just latch on */
  const startAnimateLoop = (node) => {
    const sel = `.dashboard-${node}`
    const cls = `dashboard-${node}-animate`
    const beat = () => {
      add(sel, cls)
      scheduler.after(DASHBOARD.animateOn, () => remove(sel, cls))
    }
    beat()
    scheduler.every(DASHBOARD.animatePeriod, beat)
  }

  const startBars = () => {
    const bars = q('.dashboard-database-bars div')
    const span = DASHBOARD.barMax - DASHBOARD.barMin + 1
    const roll = () => bars.forEach((bar) => {
      bar.style.height = `${DASHBOARD.barMin + Math.floor(Math.random() * span)}px`
    })
    roll()
    scheduler.every(DASHBOARD.barInterval, roll)
  }

  DASHBOARD.order.forEach((node, i) => {
    const activate = () => {
      add(`.dashboard-${node}`, `dashboard-${node}-active`)
      if (node === 'application' || node === 'auth') startAnimateLoop(node)
      if (node === 'database') startBars()
    }
    if (i === 0) activate()
    else scheduler.after(DASHBOARD.cascadeStep * i, activate)
  })
}

/* ---------------------------------------------------------------------------
   Security card 1 — leaked password protection.

   MEASURED cycle = 14081ms (border `-active` seen at 1077 and 15158;
   everything cleared at 4050). Offsets from the clear:
     +8074   radar item 1 `-active`
     +10091  radar item 2 `-active`   (+2017)
     +11108  border + text + check `-active`
     +14081  clear everything, repeat
   The per-check-piece 0/0.1/0.2/0.3s delays and the 3s radar sweep are
   already in CSS.
   REFINED: radar1 -> radar2 is 2017ms, not 2005 — the same step the password
   card runs on.
   --------------------------------------------------------------------------- */
export const LEAKED = { radar1: 8074, radar2: 10091, reveal: 11108, cycle: 14081 }

export function runLeaked(root, scheduler) {
  const radar = Array.from(root.querySelectorAll('.security-leaked-radar-item'))
  const parts = [
    ['.security-leaked-border', 'security-leaked-border-active'],
    ['.security-leaked-text', 'security-leaked-text-active'],
    ['.security-leaked-check', 'security-leaked-check-active'],
  ]
  const setPart = (on) => parts.forEach(([sel, cls]) => {
    const el = root.querySelector(sel)
    if (el) el.classList.toggle(cls, on)
  })

  const cycle = () => {
    radar.forEach((el) => el.classList.remove('security-leaked-radar-item-active'))
    setPart(false)
    scheduler.after(LEAKED.radar1, () => radar[0]?.classList.add('security-leaked-radar-item-active'))
    scheduler.after(LEAKED.radar2, () => radar[1]?.classList.add('security-leaked-radar-item-active'))
    scheduler.after(LEAKED.reveal, () => setPart(true))
  }
  cycle()
  scheduler.every(LEAKED.cycle, cycle)
}

/* ---------------------------------------------------------------------------
   Security card 3 — password strength validation.

   MEASURED step = 2017ms over an EIGHT-state cycle = 16134ms (recorded
   16134 / 16150 / 16132). Bar `-active` additions ran
     8075 -> 10092 -> 12109 -> 14124 -> clear 16142 -> next fill 24209,
   i.e. the four filling steps are followed by the empty state being HELD for
   8067ms = four more steps. The earlier reading of 5 states / 10020ms cycle
   missed the hold.

     sequence = [1, 2, 3, 4, 0, 0, 0, 0]

   Per state: number of `-active` bars == the state value; tier class is the
   default (red) at 0-1, `-orange` at 2, `-green` at 3-4; the
   `security-password-border-active` ring is only on at the top step (4).
   --------------------------------------------------------------------------- */
export const PASSWORD = { step: 2017, sequence: [1, 2, 3, 4, 0, 0, 0, 0] }

const PASSWORD_TIER = [null, null, 'security-password-bars-orange', 'security-password-bars-green', 'security-password-bars-green']

export function runPassword(root, scheduler) {
  const img = root.querySelector('.security-password-text img')
  const bars = root.querySelector('.security-password-bars')
  const items = Array.from(root.querySelectorAll('.security-password-bars-item'))
  const border = root.querySelector('.security-password-border')
  const top = PASSWORD_TIER.length - 1
  let index = 0

  const apply = () => {
    const step = PASSWORD.sequence[index]
    if (img) img.style.setProperty('--step', String(step))
    items.forEach((el, i) => el.classList.toggle('security-password-bars-item-active', i < step))
    if (bars) {
      bars.classList.remove('security-password-bars-orange', 'security-password-bars-green')
      const tier = PASSWORD_TIER[step]
      if (tier) bars.classList.add(tier)
    }
    if (border) border.classList.toggle('security-password-border-active', step === top)
  }

  apply()
  scheduler.every(PASSWORD.step, () => {
    index = (index + 1) % PASSWORD.sequence.length
    apply()
  })
}

/* ---------------------------------------------------------------------------
   Security card 5 — multi-factor authentication.

   MEASURED step = 1016ms over a 16-step cycle of 16264ms. The ring's own
   restarts were recorded at 1031 / 17291 / 33558 / 49824, i.e. deltas
   16260 / 16267 / 16266. The focus ring (`-active`) walks cell 0->5 one step
   at a time and each cell becomes `-filled` exactly one step after it was
   focused, so the ring is always one cell ahead of the last filled digit.
   After cell 5 fills the ring clears and all six stay filled for
   7125 -> 16275 = 9150ms (9 steps) before the cycle restarts.

   IMPORTANT: this clock is INDEPENDENT of the leaked card's 14081ms clock.
   The earlier reading locked the two together (both cleared at 14115 in the
   clone); on the original they visibly drift apart.
   --------------------------------------------------------------------------- */
export const MULTI = { step: 1016, cells: 6, cycle: 16264 }

export function runMulti(root, scheduler) {
  const items = Array.from(root.querySelectorAll('.security-multi-box-inputs-item'))
  const set = (focus, filled) => items.forEach((el, i) => {
    el.classList.toggle('security-multi-box-inputs-item-active', i === focus)
    el.classList.toggle('security-multi-box-inputs-item-filled', i < filled)
  })

  const cycle = () => {
    set(-1, 0)
    for (let i = 0; i <= MULTI.cells; i += 1) {
      scheduler.after(MULTI.step * (i + 1), () => set(i < MULTI.cells ? i : -1, i))
    }
  }
  cycle()
  scheduler.every(MULTI.cycle, cycle)
}

/* ---------------------------------------------------------------------------
   Security card 2 — Role-Based Access Control.

   MEASURED cycle = 6050ms (role landings at 5453 / 11536 / 17586 / 23603 →
   Δ 6083 / 6050 / 6017).

   Role list (CLONE_SPEC §4.4 had this unmeasured): the readout decodes
   between a seven-dot placeholder and, in order, ADMIN → VIEWER → EDITOR,
   then repeats. Captured verbatim from the live readout.

   The decode is a per-character scramble: glyphs are redrawn every ~17-33ms
   from the set below and each index locks to its final character at its own
   random moment inside the ~820ms window (measured lock order for VIEWER was
   index 2,5,0,4,1,3 — i.e. randomised, not left-to-right).

   RE-MEASURED: every sub-event is anchored to the moment the ROLE LANDS
   (= cycle start + the ~820ms decode), not to cycle start. Offsets after the
   role landing, with the cycle-relative value this file schedules:

     +683    `.security-rbac__display` opacity 0.4 -> 1          (1503)
     +~150   button shapes leave rest for their lit levels       ( 970)
     +2500   begin decoding back to the placeholder              (3320)
     +2570   button shapes return to rest 0.4                    (3390)
     +2683   card target -> exit, light -> 0, display -> 0.4     (3503)
     +3700   `.security-rbac__dots` opacity -> 0                 (4520)
     +3950   card snapped to -100, target -> 53px                (4770)
     +5515   `.security-rbac__card-light` opacity -> 1           (6335)
     +6216   `.security-rbac__dots` opacity -> 1                 (7036)

   The last two land *after* the next cycle has begun (6050), which is why
   they are scheduled as overlapping offsets rather than reset at cycle start.
   The old cycle-start-anchored offsets ran 300-900ms early (dots-off was the
   worst at ~0.9s).

   The display's 0.4 -> 1 -> 0.4 hold is exactly 2000ms, and display / light /
   dots are hard switches, not cross-fades (see rbacLerp.js).

   The lit button-shape set is ROLE-SPECIFIC, not one rotating glyph. Measured
   per frame over three full roles, by DOM index, rest level 0.4 for all four:
     ADMIN   -> 1, 1, 1, 1
     VIEWER  -> 1, 0.2, 0.2, 0.2
     EDITOR  -> 1, 0.2, 0.2, 1
   --------------------------------------------------------------------------- */
export const RBAC = {
  cycle: 6050,
  decode: 820,
  /* every offset below is roleLand (= decode) + the measured delta */
  displayOn: 1503, // +683
  shapesLit: 970, // +150 (measured band +85..+230)
  toPlaceholder: 3320, // +2500
  shapesRest: 3390, // +2570
  cardOut: 3503, // +2683
  lightOff: 3503, // +2683
  displayOff: 3503, // +2683
  dotsOff: 4520, // +3700
  cardWrap: 4770, // +3950
  lightOn: 6335, // +5515 — lands inside the next cycle
  dotsOn: 7036, // +6216 — lands inside the next cycle
  placeholder: '•••••••',
  roles: ['ADMIN', 'VIEWER', 'EDITOR'],
  glyphs: ['•', '¤', 'ø', '×', '*', '-', '.'],
  displayRest: 0.4,
  displayLit: 1,
  shapeRest: 0.4,
  shapeDim: 0.2,
  shapeLit: 1,
  /* measured per-role, by DOM index of `.security-rbac__button` */
  shapeLevels: {
    ADMIN: [1, 1, 1, 1],
    VIEWER: [1, 0.2, 0.2, 0.2],
    EDITOR: [1, 0.2, 0.2, 1],
  },
  cardRest: 53,
  cardExit: 496, // measured per-frame max
  cardEnter: -100, // measured per-frame min
  /* The exit leg has only cardWrap - cardOut = 1267ms to cover 53 -> 496. At
     the measured settle rate (0.0485, residual ratio 0.9515) an exponential
     approach only gets to 485.9 in that time, but the original's per-frame
     maximum is 496 — i.e. it does converge before the wrap. So the exit leg
     runs faster than the settle leg. INFERRED: 0.105/frame is the rate that
     lands within 0.1px of 496 in 1267ms. The 0.0485 settle rate is unchanged;
     only this one leg differs. */
  cardOutRate: 0.105,
}

function decodeTo(el, text, scheduler, frameMs = 33) {
  const len = text.length
  /* MEASURED: the lock ORDER is random (recorded 2,5,0,4,1,3 for VIEWER) but
     the readout is fully legible at the end of the ~820ms window, which is
     what every sub-event offset in RBAC is anchored to. Drawing each lock from
     `random() * 0.85` made the last character land at E[max of 7] ~= 610ms, so
     the role read ~200ms early and every land-anchored offset measured long by
     that much. Locking at a random PERMUTATION of i/len keeps the random order
     and puts the final character exactly at the end of the window. */
  const locks = Array.from({ length: len }, (_, i) => (i + 1) / len)
  for (let i = len - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = locks[i]; locks[i] = locks[j]; locks[j] = tmp
  }
  const start = performance.now()
  const tick = () => {
    const p = Math.min(1, (performance.now() - start) / RBAC.decode)
    let out = ''
    for (let i = 0; i < len; i += 1) {
      out += p >= locks[i] || p === 1
        ? text[i]
        : RBAC.glyphs[Math.floor(Math.random() * RBAC.glyphs.length)]
    }
    el.textContent = out
    if (p < 1) scheduler.after(frameMs, tick)
  }
  tick()
}

export function runRbac(root, scheduler, lerpTarget) {
  const display = root.querySelector('.security-rbac__display')
  const shapes = Array.from(root.querySelectorAll('.security-rbac__button-shape'))
  let roleIndex = 0

  const cycle = () => {
    const role = RBAC.roles[roleIndex % RBAC.roles.length]
    const levels = RBAC.shapeLevels[role] || []
    const first = roleIndex === 0
    roleIndex += 1

    if (display) decodeTo(display, role, scheduler)
    lerpTarget(root, 'cardX', RBAC.cardRest)
    /* light and dots are switched back on by the PREVIOUS cycle's +5515 /
       +6216 timers; only the very first cycle has to seed them, since the
       original's clock has been running since page load. */
    if (first) {
      lerpTarget(root, 'light', 1)
      lerpTarget(root, 'dots', 1)
    }

    /* the shapes light up just after the role becomes readable, not at cycle
       start — the old code set them ~820ms early */
    scheduler.after(RBAC.shapesLit, () => {
      shapes.forEach((el, i) => lerpTarget(el, 'opacity', levels[i] ?? RBAC.shapeRest))
    })
    scheduler.after(RBAC.displayOn, () => lerpTarget(root, 'display', RBAC.displayLit))
    scheduler.after(RBAC.toPlaceholder, () => {
      if (display) decodeTo(display, RBAC.placeholder, scheduler)
    })
    scheduler.after(RBAC.shapesRest, () => {
      shapes.forEach((el) => lerpTarget(el, 'opacity', RBAC.shapeRest))
    })
    scheduler.after(RBAC.cardOut, () => {
      /* faster rate for the exit leg only — see RBAC.cardOutRate */
      lerpTarget(root, 'cardX', RBAC.cardExit, false, RBAC.cardOutRate)
      lerpTarget(root, 'light', 0)
      lerpTarget(root, 'display', RBAC.displayRest)
    })
    scheduler.after(RBAC.dotsOff, () => lerpTarget(root, 'dots', 0))
    scheduler.after(RBAC.cardWrap, () => {
      lerpTarget(root, 'cardX', RBAC.cardEnter, true)
      lerpTarget(root, 'cardX', RBAC.cardRest)
    })
    scheduler.after(RBAC.lightOn, () => lerpTarget(root, 'light', 1))
    scheduler.after(RBAC.dotsOn, () => lerpTarget(root, 'dots', 1))
  }

  cycle()
  scheduler.every(RBAC.cycle, cycle)
}

/* ---------------------------------------------------------------------------
   Complete — `.complete-user-progress` heights.

   MEASURED: two 20px-tall rows fill in 6 equal increments of 20/6 =
   3.33333px, one row at a time, on a 500ms step. Both rows are reset to 0px
   first. Re-measured over several full passes: step 500, hold 2001 (4 steps)
   and therefore a 7999ms cycle (16 steps) — the earlier 512/8198/2043 figures
   came from a single pass with rAF jitter.

   This one is NOT intersection-gated: the original writes progress heights
   from t=391ms after load with the block far below the fold. See
   `useMountTimeline`.
   --------------------------------------------------------------------------- */
export const PROGRESS = { step: 500, increments: 6, rowHeight: 20, holdSteps: 4 }

export function runProgress(root, scheduler) {
  const rows = Array.from(root.querySelectorAll('.complete-user-progress'))
  const unit = PROGRESS.rowHeight / PROGRESS.increments
  const total = rows.length * PROGRESS.increments
  const cycle = () => {
    rows.forEach((el) => { el.style.height = '0px' })
    for (let n = 1; n <= total; n += 1) {
      const row = Math.floor((n - 1) / PROGRESS.increments)
      const fill = ((n - 1) % PROGRESS.increments) + 1
      scheduler.after(PROGRESS.step * n, () => {
        if (rows[row]) rows[row].style.height = `${unit * fill}px`
      })
    }
  }
  cycle()
  scheduler.every(PROGRESS.step * (total + PROGRESS.holdSteps), cycle)
}

/* ---------------------------------------------------------------------------
   Radix logo stack — scroll-linked, CLONE_SPEC §4.6.

   MEASURED by settling the page at 100px intervals and reading the inline
   styles the original writes. With `p` the scroll progress of `.radix-logo`:

     p = clamp((1080.5 - rect.top) / D, 0, 1)   // D = 539 wide / 471.5 narrow

     stroke / main / lines  transform: translateY(100 * (1 - p))
     blender                opacity: p            (and the same translateY)
     lines                  opacity: clamp(1.5 - p, 0.5, 1)
     stroke / main          opacity: 1 throughout

   Check against the live readings at vh=900: rect.top 1000 → p 0.1484 →
   translateY 85.16 (site: 85.089), blender 0.1484 (site: 0.149351);
   rect.top 700 → p 0.7050 → translateY 29.50 (site: 29.4365), lines 0.7950
   (site: 0.794063). So the pre-reveal state is translateY(100px) with the
   blender fully transparent, and the "post-reveal" inline values in the
   static capture are simply the settled end of the scrub.
   --------------------------------------------------------------------------- */
/* MEASURED band geometry, re-read at three viewports:

     T0 (rect.top where the reveal starts) is a CONSTANT 1080.5 — 1080.44 at
     vh=900 and 1080.5 at vh=700, so it does NOT track the viewport height.
     The old `(vh + 180)` form was a coincidence at vh=900 and was 200px off
     at vh=700.

     D (the span) is WIDTH-dependent: 539 at 1280 wide, 471.5 at 390 wide.
     Both measured widths sit either side of the 1200px breakpoint at which
     `.radix-logo` itself steps from 560x833 to 420x624.75, so D is keyed off
     that same breakpoint here. Only two widths were measured, so the
     *mechanism* is inferred; the two values are not.
*/
const RADIX_BAND_TOP = 1080.5
const RADIX_SPAN_WIDE = 539
const RADIX_SPAN_NARROW = 471.5
const RADIX_BREAKPOINT = 1200

/* measured: translateY settles over 67 frames (~1.1s) → 0.0745/frame */
export const RADIX_LERP = 0.0745

export function radixProgress(rect, vh) {
  const w = typeof window === 'undefined' ? RADIX_BREAKPOINT : window.innerWidth
  const span = w >= RADIX_BREAKPOINT ? RADIX_SPAN_WIDE : RADIX_SPAN_NARROW
  const p = (RADIX_BAND_TOP - rect.top) / span
  return { p: Math.max(0, Math.min(1, p)) }
}

/**
 * MEASURED: only the transform is damped. On a 480px scroll jump
 * `.radix-logo-blender`'s opacity was already at its final 0.891466 on the
 * FIRST rAF and held for 90 frames with `transition-duration: 0s`, while the
 * translateY on the same element took 67 frames to settle. Deriving both from
 * one damped channel made the blender fade lag scroll by ~650ms.
 *
 * `damped` carries the eased progress (transform only); `instant` carries the
 * raw scroll-derived progress (opacities).
 */
export function applyRadix(el, damped, instant) {
  const p = instant ? instant.p : damped.p
  const lift = `translateY(${(100 * (1 - damped.p)).toFixed(4)}px)`
  const set = (sel, opacity) => {
    const node = el.querySelector(sel)
    if (!node) return
    node.style.transform = lift
    node.style.opacity = String(opacity)
  }
  set('.radix-logo-stroke', 1)
  set('.radix-logo-main', 1)
  set('.radix-logo-blender', p.toFixed(4))
  set('.radix-logo-lines', Math.max(0.5, Math.min(1, 1.5 - p)).toFixed(4))
}

/* ---------------------------------------------------------------------------
   Hero centre card float — scroll-linked.

   MEASURED at 390x844 by settling at eight scroll positions; the rendered
   translateY is linear in the wrapper's rect.top with slope 0.03838 px/px
   and clamps at ±25px:

     translateY = clamp(25 - 50 * (vh - rect.top) / (vh + 459), -25, 25)

   Site readings (rect.top → translateY): 412 → 8.42287, 312 → 4.60156,
   212 → 0.764242, 112 → -3.07298, 12 → -6.91165, -188 → -14.5692,
   -388 → -22.2436, -588 → -24.9886. The same law reproduces the 1280x900
   reading (10.7248px) to within 0.1px.

   The two side cards carry a *static* `translateX(180px)` / `translateX(-180px)`
   — measured identical at 1280 and at 390, so this is not a narrow-width-only
   offset as CLONE_SPEC assumed.
   --------------------------------------------------------------------------- */
export const CARD_TILT_X = 180

/* MEASURED: the denominator is `vh + 459`, not a constant 1303. Pinned at
   three viewport heights on the original:
     vh 844 → slope 0.0383632 (D 1303.3, zero-crossing rect.top 191.9)
     vh 900 → slope 0.036786  (D 1359.2, 219.9)
     vh 700 → slope 0.043127  (D 1159.4, 119.8)
   459 is the scrubbed card's own height at every viewport, so D = vh + 459.
   The hardcoded 1303 happened to be exact at 390x844 but ran 4.3% steep at
   1280x900 (up to 2.1px error, and the -25 clamp arrived 73px of scroll
   early). */
export const HERO_CARD_HEIGHT = 459

export function heroCardProgress(rect, vh) {
  const y = 25 - (50 * (vh - rect.top)) / (vh + HERO_CARD_HEIGHT)
  return { y: Math.max(-25, Math.min(25, y)) }
}

export function applyHeroCard(el, { y }) {
  el.style.transform = `translateY(${y.toFixed(4)}px)`
}
