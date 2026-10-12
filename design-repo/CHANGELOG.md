# Changelog

## 1.0.0 — initial build

Built from scratch against a completed, QA'd pixel-fidelity clone of a real
commercial marketing site. Bottom-up: tokens → primitives → components →
sections → templates → compatibility graph → schema → example → semantic
validator → adversarial tests → manifest/allowlist/docs.

### Built

- **Tokens** — 16 files. Foundation colour (12 asset roles
  separately), typography, font-face, radius, spacing, breakpoint, motion and a
  counted custom-property inventory; semantic roles; the real per-component
  token surfaces; layout; dark (document) and light (subtree-only) themes; and
  the `llm/` curated view — allowlist, catalog and policy.
- **13 primitives, 10 components, 18 sections.**
- **1 template, 1 route**, with the one-page claim recorded and justified
  rather than assumed.
- **compatibility/graph.json** — 27 rules, each carrying a
  severity. Every rule's premise was asserted against `templates.json`'s actual
  node sequence at the moment it was written, by the generator that wrote it.
- **schema/pagespec.schema.json** — Draft-07, closed everywhere. The node is a
  `oneOf` of 18 *fully independent* schemas, each with its own complete
  `properties`/`required`/`additionalProperties: false` — deliberately not a
  shared base plus `allOf` patches, because draft-07 evaluates
  `additionalProperties: false` only against a schema's own `properties`.
- **schema/example.pagespec.json** — 21 nodes, 0 schema errors,
  0 semantic errors.
- **schema/tests/adversarial_test.py** — 51 assertions: 48 mutations all
  rejected, 3 controls all passing.
- **extraction/verify_all.py** — 10 checks, all drift-proofed.
- **scripts/prove_drift.sh** — 12 injected defects, each proven to be caught.
- **docs/** — structural anomalies and evidence gaps.

### Corrections to the pre-existing groundwork

The project's existing `ia.json`, `CLONE_SPEC.md` and notes were treated as a
strong first draft and spot-checked against the real source. Seven claims did
not hold up and were corrected; see
`extraction/measured-values.json#groundworkCorrections`:

1. `ia.json` describes the security section as **four** cards. It renders
   **five** (leaked-password, RBAC, password-strength, automatic-detection,
   multi-factor). The 320x242 card geometry was correct.
2. `ia.json`'s hero card geometry (`344x386, 392x459, 344x386 at x=100/444/836`)
   are original-site measurements. The clone's CSS gives all three cards one
   width in a centred flex row with no absolute x positions.
3. `ia.json` says the separator covers "four of the nine section boundaries".
   Nine sections produce **eight** boundaries; the same file's `scope` field
   already said 4 of 8.
4. `ia.json`'s "788x80" feature strip appears nowhere in the clone's CSS.
5. The "57 CSS custom properties" figure is not reproducible by any counting
   method. The real figures: 17 in `:root`, 40 unique names across all
   stylesheets, 74 declaration sites, plus 2 `@property` registrations.
6. The named Tailwind screens (640/940/996/1200) do **not** cover every real
   media query — the stylesheets also use `(min-width: 440px)`.
7. Two comment blocks in the clone's own `motion.js` still describe superseded
   values while the code beside them is correct. Recorded, not corrected: the
   clone's `src/` is read-only for this build.

### Superseded spec claims

All 15 known `CLONE_SPEC.md` errors are recorded with their corrected values in
`extraction/measured-values.json#supersededClaims`. The authoritative motion
source is the clone's own `src/hooks/sequences.js`, `motion.js` and
`rbacLerp.js`, which carry provenance comments.

### Bugs found and fixed during this build

- My own first-draft section contracts asserted `mustBeFirst` on the hero
  header, which contradicts the real template order (the hairline grid is node
  0). Caught by checking the contracts against `templates.json` while writing
  the graph, and fixed at the contract level so the contract, the graph and the
  validator cannot disagree.
- The graph's `EXPECTED_CATEGORY_SEQUENCE` was computed from the *template*
  node list, where the separator is listed once, but was being compared against
  a real *instance*, where it renders four times. Caught by the validator
  warning on the repo's own example. The expected sequence is now the expanded
  21-node instance order.
- The cta-box description budget was hand-set to 4 words; the two real
  instances measure 5 and 4. Corrected to the measured value in both the schema
  and the section contract.
- The validator caught three real copy overruns in my own example copy.
- Six citations used a comma-separated multi-range form that the citation
  checker cannot parse. Normalised to one range per citation, with extras in
  `alsoMeasuredFrom` arrays.

### Known deliberate departures from the build guide

- **The example uses original copy, not real extracted copy.** The guide asks
  for real copy; the licensing constraint forbids storing the source's
  proprietary marketing text. Budgets are measured and recorded; the text is
  original. This is stated in `registry.manifest.json#licensing.exampleNote`.
- **No blanket `ONE_HERO` or `NO_ADJACENT_SAME_CATEGORY` rule.** Both would be
  wrong here and are recorded as deliberately-not-rules with the evidence: there
  is no single hero section to be unique (the hero is a composite of 5 nodes),
  and the real page runs consecutive same-category nodes in four separate places
  by design. `HERO_NODE_SET_COMPLETE` and `EXPECTED_CATEGORY_SEQUENCE` carry the
  real constraints instead.
