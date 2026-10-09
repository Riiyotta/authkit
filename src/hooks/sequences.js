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
     +10079  radar item 2 `-active`   (+2005)
     +11108  border + text + check `-active`
     +14081  clear everything, repeat
   The per-check-piece 0/0.1/0.2/0.3s delays and the 3s radar sweep are
   already in CSS.
   --------------------------------------------------------------------------- */
export const LEAKED = { radar1: 8074, radar2: 10079, reveal: 11108, cycle: 14081 }

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

   MEASURED step = 2005ms, 5 states, cycle 10025ms. `--step` was observed
   going 0→1→2→3→4→0 at 4050/6103/8113/10119/12124.
   Per state: number of `-active` bars == step; tier class is the default
   (red) at steps 0-1, `-orange` at step 2, `-green` at steps 3-4; the
   `security-password-border-active` ring is only on at step 4.
   --------------------------------------------------------------------------- */
export const PASSWORD = { step: 2005, states: 5 }

const PASSWORD_TIER = [null, null, 'security-password-bars-orange', 'security-password-bars-green', 'security-password-bars-green']

export function runPassword(root, scheduler) {
  const img = root.querySelector('.security-password-text img')
  const bars = root.querySelector('.security-password-bars')
  const items = Array.from(root.querySelectorAll('.security-password-bars-item'))
  const border = root.querySelector('.security-password-border')
  let step = 0

  const apply = () => {
    if (img) img.style.setProperty('--step', String(step))
    items.forEach((el, i) => el.classList.toggle('security-password-bars-item-active', i < step))
    if (bars) {
      bars.classList.remove('security-password-bars-orange', 'security-password-bars-green')
      const tier = PASSWORD_TIER[step]
      if (tier) bars.classList.add(tier)
    }
    if (border) border.classList.toggle('security-password-border-active', step === PASSWORD.states - 1)
  }

  apply()
  scheduler.every(PASSWORD.step, () => {
    step = (step + 1) % PASSWORD.states
    apply()
  })
}

/* ---------------------------------------------------------------------------
   Security card 5 — multi-factor authentication.

   MEASURED step = 1030ms (deltas 1024/1030/976/1033/1032/1026/977). The
   focus ring (`-active`) walks cell 0→5 one step at a time and each cell
   becomes `-filled` exactly one step after it was focused, so the ring is
   always one cell ahead of the last filled digit. After cell 5 fills, the
   ring clears and all six stay filled until the cycle restarts.

   The 1030ms step is measured; the overall cycle length is INFERRED to be
   the same 14081ms clock as the leaked card (the recorded window was shorter
   than one full cycle, and the all-filled hold before the observed reset is
   consistent with 14081).
   --------------------------------------------------------------------------- */
export const MULTI = { step: 1030, cells: 6, cycle: 14081 }

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

   Offsets inside the cycle:
     0      begin decoding to the role name   (lands ≈ +820)
     3316   begin decoding to "•••••••"       (lands ≈ +4150)
     3043   card target → 400% (slides out right, lerped)
     4400   card snapped to -100%, target → 53px (slides back in)
     3548   `.security-rbac__dots` opacity → 0 (1 again at cycle start)
     3043   `.security-rbac__card-light` opacity → 0 (1 at +5879)
   The four `.security-rbac__button-shape` glyphs rest at opacity .4; while a
   role is displayed one of them lerps to 1 and the other three to .2.

   APPROXIMATE: the per-element damping factors and the role→button mapping.
   The offsets, the cycle length, the role strings and the .4/.2/1 opacity
   levels are measured.
   --------------------------------------------------------------------------- */
export const RBAC = {
  cycle: 6050,
  decode: 820,
  toPlaceholder: 3316,
  cardOut: 3043,
  cardWrap: 4400,
  dotsOff: 3548,
  lightOff: 3043,
  lightOn: 5879,
  placeholder: '•••••••',
  roles: ['ADMIN', 'VIEWER', 'EDITOR'],
  glyphs: ['•', '¤', 'ø', '×', '*', '-', '.'],
  cardRest: 53,
  cardExit: 496, // 400% of the 124px card
  cardEnter: -124, // -100%
}

function decodeTo(el, text, scheduler, frameMs = 33) {
  const len = text.length
  /* each index locks at its own random fraction of the window */
  const locks = Array.from({ length: len }, () => Math.random() * 0.85)
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
    const lit = roleIndex % Math.max(shapes.length, 1)
    roleIndex += 1

    if (display) decodeTo(display, role, scheduler)
    shapes.forEach((el, i) => lerpTarget(el, 'opacity', i === lit ? 1 : 0.2))
    lerpTarget(root, 'cardX', RBAC.cardRest)
    lerpTarget(root, 'dots', 1)
    lerpTarget(root, 'light', 1)

    scheduler.after(RBAC.cardOut, () => {
      lerpTarget(root, 'cardX', RBAC.cardExit)
      lerpTarget(root, 'light', 0)
    })
    scheduler.after(RBAC.dotsOff, () => lerpTarget(root, 'dots', 0))
    scheduler.after(RBAC.toPlaceholder, () => {
      if (display) decodeTo(display, RBAC.placeholder, scheduler)
      shapes.forEach((el) => lerpTarget(el, 'opacity', 0.4))
    })
    scheduler.after(RBAC.cardWrap, () => {
      lerpTarget(root, 'cardX', RBAC.cardEnter, true)
      lerpTarget(root, 'cardX', RBAC.cardRest)
    })
    scheduler.after(RBAC.lightOn, () => lerpTarget(root, 'light', 1))
  }

  cycle()
  scheduler.every(RBAC.cycle, cycle)
}

/* ---------------------------------------------------------------------------
   Complete — `.complete-user-progress` heights.

   MEASURED: two 20px-tall rows fill in 6 equal increments of 20/6 =
   3.33333px, one row at a time, on a ~512ms step (observed 512/514/462/511/
   515, then row 2 at 464/510/510). Both rows are reset to 0px first.
   The 512ms step is measured; the hold before the reset (and therefore the
   total cycle) is INFERRED — the recording window covered only one pass.
   --------------------------------------------------------------------------- */
export const PROGRESS = { step: 512, increments: 6, rowHeight: 20, holdSteps: 4 }

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

     p = clamp(((vh + 180) - rect.top) / 539, 0, 1)

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
export function radixProgress(rect, vh) {
  const p = ((vh + 180) - rect.top) / 539
  return { p: Math.max(0, Math.min(1, p)) }
}

export function applyRadix(el, { p }) {
  const lift = `translateY(${(100 * (1 - p)).toFixed(4)}px)`
  const set = (sel, transform, opacity) => {
    const node = el.querySelector(sel)
    if (!node) return
    node.style.transform = transform
    node.style.opacity = String(opacity)
  }
  set('.radix-logo-stroke', lift, 1)
  set('.radix-logo-main', lift, 1)
  set('.radix-logo-blender', lift, p.toFixed(4))
  set('.radix-logo-lines', lift, Math.max(0.5, Math.min(1, 1.5 - p)).toFixed(4))
}

/* ---------------------------------------------------------------------------
   Hero centre card float — scroll-linked.

   MEASURED at 390x844 by settling at eight scroll positions; the rendered
   translateY is linear in the wrapper's rect.top with slope 0.03838 px/px
   and clamps at ±25px:

     translateY = clamp(25 - 50 * (vh - rect.top) / 1303, -25, 25)

   Site readings (rect.top → translateY): 412 → 8.42287, 312 → 4.60156,
   212 → 0.764242, 112 → -3.07298, 12 → -6.91165, -188 → -14.5692,
   -388 → -22.2436, -588 → -24.9886. The same law reproduces the 1280x900
   reading (10.7248px) to within 0.1px.

   The two side cards carry a *static* `translateX(180px)` / `translateX(-180px)`
   — measured identical at 1280 and at 390, so this is not a narrow-width-only
   offset as CLONE_SPEC assumed.
   --------------------------------------------------------------------------- */
export const CARD_TILT_X = 180

export function heroCardProgress(rect, vh) {
  const y = 25 - (50 * (vh - rect.top)) / 1303
  return { y: Math.max(-25, Math.min(25, y)) }
}

export function applyHeroCard(el, { y }) {
  el.style.transform = `translateY(${y.toFixed(4)}px)`
}
