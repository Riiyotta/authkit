# AuthKit design-repo

An AI-ready design system extracted from a completed, QA'd pixel-fidelity clone
of a real commercial marketing site. It is a machine-validated PageSpec system:
a generator can compose an on-brand page from it without inventing a colour, a
copy length, a section or an asset.

Every value in this package cites real evidence. Nothing here was guessed
because it "seemed likely".

## Status

| field | value |
|---|---|
| status | `design-review-pending` |
| productionApproved | `false` |
| repositoryVersion | 1.0.0 (documentation-only) |
| pageSpecVersion | 1.0.0 (documentation-only) |
| allowlistVersion | 1.0.0 (**machine-checked**) |
| assetRolesVersion | 1.0.0 (**machine-checked**) |
| compatibilityGraphVersion | 1.0.0 (**machine-checked**) |

`registry.manifest.json#versionFieldNote` states exactly which version fields
are enforced and which are hand-maintained markers. No version field here
implies an enforcement guarantee it does not have.

## Real counts, recomputed from disk

| thing | count |
|---|---|
| primitives | 13 |
| components | 10 |
| sections | 18 |
| templates | 1 |
| routes | 1 |
| template nodes | 18 |
| rendered React section components | 9 |
| compatibility rules | 27 |
| asset roles | 12 |
| closed motion patterns | 23 |
| `@keyframes` in the clone | 29 |
| token files | 16 |
| nodes in the bundled example | 21 |

`extraction/verify_all.py` **recomputes every one of these from the actual
files** on each run and fails if the manifest disagrees. They are not
hand-written, and `scripts/prove_drift.sh` proves that check catches a wrong
number.

The 18 contract nodes map onto 9 rendered React components: the 7
hero-internal nodes all live inside one `Hero` component, the customiser
pickers live inside the custom-UI component, and the separator is emitted by
the app shell. That is an inventory-granularity difference, not a structural
disagreement.

## Source

A single-route site: React 18 + Vite 5 + Tailwind v3, no component library.
Static fidelity was measured to **0 computed diffs** on colour, border-radius,
gap, padding, position, text-align, z-index, display, max-width and all numeric
type values at 1280/1024/768/390. Motion was verified by an adversarial
re-measurement pass against the live original.

This design-repo is a **snapshot, not a living mirror**. The clone can be
upgraded after this build with nothing re-checking these claims against that
drift. Re-diff the stack string, counts and factual claims against the current
source before trusting them in a later session.

## Licensing — load-bearing

The source is a **real company's real, live site**, and the repository holding
the clone is **PRIVATE and must stay private**.

- **Do not publish this design-repo**, and do not make any repository
  containing it public. Treat the source as commercially sensitive.
- This package captures **structure, tokens, geometry, motion and copy
  BUDGETS only**. It contains no marketing copy, no testimonial quotes, no real
  people's names, and no brand image files. Where a copy constraint is needed,
  the measured character and word counts are recorded instead of the text.
- `assets/asset-roles.json` uses a **closed role enum** with explicit
  AI-generation guidance. Four roles are pinned to
  `must-not-reproduce-real-entity`, which forbids a generator from reproducing
  *or fabricating* a real company's logo, a real identifiable person's
  photograph or likeness, or a real person's name attached to a quote.
  Generated instances get original placeholder assets and original copy.
- `schema/example.pagespec.json` therefore uses **original copy written for a
  fictional product**, respecting every measured budget. This is a deliberate
  departure from the build guide's "use real extracted copy" instruction,
  required by the constraint above.

## Layout

```
design-repo/
  README.md  CHANGELOG.md  registry.manifest.json
  tokens/
    00-foundation/   colour, typography, font-face, radius, spacing,
                     breakpoint, motion, custom-properties
    10-semantic/     semantic roles resolving to foundation ids
    20-component/    the real per-component token surfaces
    30-layout/       page shell, hero grid, content-visibility, max-widths
    themes/          dark (document) + light (SUBTREE-ONLY)
    llm/             component-allowlist, token-catalog, token-policy
  primitives/        13 atomic contracts
  components/        10 composed, content-agnostic contracts
  sections/          18 section contracts, one per observed type
  templates/         templates.json
  compatibility/     graph.json -- 27 rules, each with a severity
  assets/            asset-roles.json -- closed enum + licensing guidance
  schema/            pagespec.schema.json, example.pagespec.json,
                     semantic_validate.py, tests/adversarial_test.py
  extraction/        measured-values.json, verify_all.py
  scripts/           prove_drift.sh
  docs/              structural-anomalies.md, evidence-gaps.md
```

## Verify

```bash
python3 extraction/verify_all.py          # all 10 checks
python3 schema/semantic_validate.py       # the example, semantically
python3 schema/tests/adversarial_test.py  # every mutation + every control
bash   scripts/prove_drift.sh             # proves the checks catch drift
```

The scripts need `jsonschema` importable by `python3`. They derive their own
root from `__file__`, so they run correctly from any extraction location —
there is no absolute path anywhere in this tree, and `verify_all.py` fails if
one appears.

## Read these before generating anything

- **`docs/structural-anomalies.md`** — eleven real properties of this site that
  must be preserved, not tidied up: the genuine one-page scope, the total
  absence of `<nav>` and `<footer>`, the inert-href and offline-asset
  constraints, the licence-driven font substitution, a deliberately reproduced
  upstream grid bug, the shared-once structure, and why document height is not
  a fidelity metric here.
- **`docs/evidence-gaps.md`** — the two motion values that are inferences
  rather than measurements, and the one whose *mechanism* is inferred. Neither
  may be promoted to `"measured"`, and no trigger may be invented for the
  unused mask variant.
- **`extraction/measured-values.json`** — the evidence trail: 15 superseded
  spec claims with their corrected values, 7 corrections to the pre-existing
  groundwork, and 10 groundwork items that were spot-checked and held up.

## What the validator actually enforces

`schema/semantic_validate.py` resolves a PageSpec's **declared template** to
that template's **real node list** and checks the spec's nodes against it —
required-section presence, forbidden extras, repeatability, occurrence counts,
node order and route admission. It never validates `nodes[]` in isolation.

On top of that it enforces position rules read from the section contracts
themselves, the separator's four real boundaries, the hero node set, the
scroll-scrub budget and non-adjacency, per-section allowed motion patterns and
required reduced-motion fallbacks, the interactivity budget, subtree-only light
theming, closed asset roles with pinned compliance policies, inert hrefs, local
assets only, the document-height ban, and per-instance `maxWords` budgets.

The motion object in the schema is **closed** (`additionalProperties: false`)
to the real, evidence-grounded field set, so an invented motion field cannot be
smuggled through.
