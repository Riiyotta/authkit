# Evidence gaps — recorded honestly, not papered over

Two motion values in this system are **inferences**, not measurements. They are
recorded as such, and `compatibility/graph.json#MOTION_EVIDENCE_HONESTY`
forbids promoting either to `"measured"`.

Everywhere else in this design-repo, `evidence: "measured"` means a number that
was read off the live original.

## Gap 1 — `rbac-exit-rate`: the RBAC card's exit-leg damping rate

**What is measured.** The settle rate is a per-frame residual ratio of 0.9515,
i.e. a rate of 0.0485. The card's travel runs between exactly -100 (wrap-in)
and 496 (the per-frame maximum on exit), resting at 53. The exit leg has
`cardWrap - cardOut = 4770 - 3503 = 1267ms` to cover 53 → 496.

**Why that does not add up.** At the measured 0.0485 settle rate, an
exponential approach only reaches 485.9 in 1267ms — but the original's
per-frame maximum really is 496, so it *does* converge before the wrap. The
exit leg therefore runs faster than the settle leg.

**The inference.** 0.105/frame is the rate that lands within 0.1px of 496 in
1267ms. The 0.0485 settle rate is unchanged; only this one leg differs.

**Status.** The 0.105 figure is a fitted value, not a reading. It is marked
`evidence: "inferred"` in `tokens/00-foundation/motion.json#dampingRates` and
is one of only four values in the closed `motion.dampingRate` enum.

Cited at `../src/hooks/sequences.js:291-298`.

## Gap 2 — `anim2-trigger`: the unused `.anim2` RBAC mask variant

The `.anim2` RBAC mask variant **never fired on the original in any recording
window**. Its trigger is therefore unmeasured, and the variant is intentionally
left unused in the clone.

**Rule:** do not invent a trigger for it. There is no evidence to ground one,
and a plausible-looking guess here would be indistinguishable from a
measurement everywhere else in this repo.

## A third, lesser inference, recorded for completeness

The radix scrub **span** is width-dependent: 539 at ≥1200px wide and 471.5
below. Both of those values are measured. Only **two** widths were measured,
though, and they sit either side of the 1200px breakpoint at which the logo
stack itself changes size — so keying the span off that same breakpoint is a
*mechanism inference*. The two values are not inferred; the rule connecting
them to the breakpoint is.

Recorded in `sections/demo.radix.json#motion.scrub.spanNote`.

## Also worth knowing: the default damping rate

`lerp.default` (0.075/frame) is marked `evidence: "inferred"` too. It is fitted
from the geometric tail of the settle (ratio ≈0.625 per ~6 frames). The
*targets* it damps toward are exact — read from settled values at 100px scroll
intervals, reproducing the measurements to <0.1px.

## Source-comment drift in the clone (not corrected here)

Two comment blocks in the clone's own `src/hooks/motion.js` still describe
superseded values, while the **code beside them is correct and current**:

- The block at `motion.js:99-108` describes the starfield drift without the
  height normalisation and quotes a twinkle step of `random() * 0.07`. The real
  code applies `h / 1200` and uses `TWINKLE_STEP_MAX = 0.062`.
- The comment at `motion.js:329-335` still describes the radix scrub band as
  starting at `vh + 180`, a form superseded by the constant `rect.top ≈ 1080.5`.

Every contract in this design-repo cites the **code**, not these stale
comments. The clone's `src/` is read-only reference material for this build, so
the comments were left untouched and recorded in
`extraction/measured-values.json#groundworkCorrections` instead.
