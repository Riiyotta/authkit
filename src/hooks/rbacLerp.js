/* ============================================================================
   rbacLerp.js — the inline-style writer for the RBAC card.

   MEASURED: the original writes `.security-rbac__card`'s translateX,
   `.security-rbac__card-light`'s / `.security-rbac__dots`' /
   `.security-rbac__display`'s opacity and the four
   `.security-rbac__button-shape` opacities as inline styles from a rAF loop.
   Only SOME of those channels are eased:

   * cardX is damped. Residual ratio per frame measured 0.9515 → RATE 0.0485.
     Travel runs between exactly -100 (wrap-in) and 496 (exit).
   * light, dots and display are HARD SWITCHES. Over 560 consecutive frames
     `.security-rbac__card-light` and `.security-rbac__dots` only ever read 0
     or 1, and `.security-rbac__display` only 0.4 or 1, all with computed
     `transition-duration: 0s`. Cross-fading them (the old RATE 0.045 ramp,
     ~1.1s) was a clone defect.
   * the button shapes are damped like cardX (rest .4, lit 1, dimmed .2).

   Observed inline values on the live site, for reference:
     card     translateX(53px) resting, stepping out through 65 -> 145 -> 422 ->
              (wrap) -100 -> 19 -> 48 and settling back at ~53px
     light    opacity 1 -> 0 at roleLand+2683, back to 1 at roleLand+5515
     dots     opacity 1 -> 0 at roleLand+3700, back to 1 at roleLand+6216
     display  opacity 0.4 -> 1 at roleLand+683, held exactly 2000ms, back to
              0.4 at roleLand+2683
   ========================================================================== */

/* measured: per-frame residual ratio 0.9515 */
const RATE = 0.0485

export function makeRbacLerp(root, scheduler) {
  const card = root.querySelector('.security-rbac__card')
  const light = root.querySelector('.security-rbac__card-light')
  const dots = root.querySelector('.security-rbac__dots')
  const display = root.querySelector('.security-rbac__display')

  /* channel -> { value, target, write, snap } */
  const channels = new Map()

  const register = (key, el, initial, write, snap = false) => {
    if (!el) return
    channels.set(key, { el, value: initial, target: initial, write, snap, rate: RATE })
  }

  const opacity = (el, v) => { el.style.opacity = v.toFixed(4) }

  register('cardX', card, 53, (el, v) => { el.style.transform = `translateX(${v.toFixed(4)}px)` })
  register('light', light, 1, opacity, true)
  register('dots', dots, 1, opacity, true)
  register('display', display, 0.4, opacity, true)

  let frame = 0
  const tick = () => {
    channels.forEach((ch) => {
      if (ch.snap) ch.value = ch.target
      else ch.value += (ch.target - ch.value) * ch.rate
      ch.write(ch.el, ch.value)
    })
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  /* the scheduler owns teardown of timers; cancel the rAF alongside it */
  const originalDispose = scheduler.dispose.bind(scheduler)
  scheduler.dispose = () => {
    cancelAnimationFrame(frame)
    originalDispose()
  }

  /**
   * setTarget(elOrRoot, key, value, snap, rate)
   * When called with the section root, `key` names one of the registered
   * channels. When called with a `.security-rbac__button-shape` element and
   * key 'opacity', the element gets its own ad-hoc (damped) channel.
   * `rate` overrides the damping for this leg only; omitting it restores the
   * default settle rate.
   */
  return function setTarget(el, key, value, snap = false, rate = null) {
    if (el !== root && key === 'opacity') {
      const id = `shape:${Array.prototype.indexOf.call(el.parentElement.parentElement.children, el.parentElement)}`
      if (!channels.has(id)) register(id, el, 0.4, opacity)
      const ch = channels.get(id)
      ch.target = value
      if (snap) { ch.value = value; ch.write(ch.el, value) }
      return
    }
    const ch = channels.get(key)
    if (!ch) return
    ch.rate = rate == null ? RATE : rate
    ch.target = value
    if (snap || ch.snap) { ch.value = value; ch.write(ch.el, value) }
  }
}
