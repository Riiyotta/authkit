/* ============================================================================
   rbacLerp.js — the damped inline-style writer for the RBAC card.

   MEASURED: the original writes `.security-rbac__card`'s translateX,
   `.security-rbac__card-light`'s and `.security-rbac__dots`' opacity, and the
   four `.security-rbac__button-shape` opacities as inline styles from a rAF
   loop that eases the rendered value toward a target. The *targets* and the
   offsets at which they change are measured (see RBAC in sequences.js); the
   easing rate is APPROXIMATE — fitted so the card's visible travel from the
   reader to off-canvas takes the measured ~710ms.

   Observed inline values on the live site, for reference:
     card   translateX(53px) resting, stepping out through 65 → 145 → 422 →
            (wrap) -80 → 19 → 48 and settling back at ~53px
     light  opacity 1 → 0 at +3043ms, back to 1 at +5879ms
     dots   opacity 1 → 0 at +3548ms
     shapes opacity .4 at rest; one goes to 1 and the rest to .2 while a role
            is displayed
   ========================================================================== */

/* fitted: 710ms to travel 443px with an exponential approach */
const RATE = 0.045

export function makeRbacLerp(root, scheduler) {
  const card = root.querySelector('.security-rbac__card')
  const light = root.querySelector('.security-rbac__card-light')
  const dots = root.querySelector('.security-rbac__dots')

  /* channel -> { value, target, write } */
  const channels = new Map()

  const register = (key, el, initial, write) => {
    if (!el) return
    channels.set(key, { el, value: initial, target: initial, write })
  }

  register('cardX', card, 53, (el, v) => { el.style.transform = `translateX(${v.toFixed(4)}px)` })
  register('light', light, 1, (el, v) => { el.style.opacity = v.toFixed(4) })
  register('dots', dots, 1, (el, v) => { el.style.opacity = v.toFixed(4) })

  let frame = 0
  const tick = () => {
    channels.forEach((ch) => {
      ch.value += (ch.target - ch.value) * RATE
      ch.write(ch.el, ch.value)
    })
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  scheduler.after(0, () => {})
  /* the scheduler owns teardown of timers; cancel the rAF alongside it */
  const originalDispose = scheduler.dispose.bind(scheduler)
  scheduler.dispose = () => {
    cancelAnimationFrame(frame)
    originalDispose()
  }

  /**
   * setTarget(elOrRoot, key, value, snap)
   * When called with the section root, `key` names one of the registered
   * channels. When called with a `.security-rbac__button-shape` element and
   * key 'opacity', the element gets its own ad-hoc channel.
   */
  return function setTarget(el, key, value, snap = false) {
    if (el !== root && key === 'opacity') {
      const id = `shape:${Array.prototype.indexOf.call(el.parentElement.parentElement.children, el.parentElement)}`
      if (!channels.has(id)) {
        register(id, el, 0.4, (node, v) => { node.style.opacity = v.toFixed(4) })
      }
      const ch = channels.get(id)
      ch.target = value
      if (snap) { ch.value = value; ch.write(ch.el, value) }
      return
    }
    const ch = channels.get(key)
    if (!ch) return
    ch.target = value
    if (snap) { ch.value = value; ch.write(ch.el, value) }
  }
}
