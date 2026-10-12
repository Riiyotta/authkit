# Structural anomalies — documented, not normalised away

Everything below is a real, measured property of the source site. None of it is
an unfinished clone, a scope reduction, or a defect waiting to be tidied up. A
generator working against this design-repo must preserve all of it.

## 1. Genuinely a one-page site

One route (`/`), one template. This is not a reduced scope.

Verified: no `sitemap.xml`, no `robots.txt`, every `href` off-domain, and 15
probed candidate routes all return 404 — `/docs` `/pricing` `/blog` `/about`
`/login` `/signup` `/features` `/security` `/changelog` `/legal` `/privacy`
`/terms` `/contact` `/customers` `/enterprise`. Only `/` returns 200.

**Rule:** do not invent a route or a second template.
Enforced by `compatibility/graph.json#SINGLE_ROUTE_SINGLE_TEMPLATE` and closed
enums on `route` and `basedOnTemplate` in the schema.

## 2. No `<nav>` and no `<footer>` element at all

The page has neither element. The header is a `<header>` placed inside the
hero's own CSS grid, is `position: static`, and has **zero** scroll behaviour —
no sticky, no blur, no shrink, no shadow. It scrolls away like any other
content.

The only inter-section chrome on the entire page is a 1px `--blue-6` rule, and
it appears at just **4 of the 8** section boundaries (before radix, security,
complete and testimonials).

**Rule:** do not add navigation, a footer, sticky chrome, or a uniform
separator rhythm. Enforced by `#NO_NAV_NO_FOOTER` and `#SEPARATOR_PLACEMENT`.

## 3. Hard constraint: no outbound links

Every off-domain destination is a deliberately inert `"#"` (`INERT_HREF`), by
explicit user instruction. Link text, styling and hover states are unchanged.

**This is not a defect to repair.** A generator must not substitute a real URL.
Enforced by a `const: "#"` in the schema and `#ALL_OUTBOUND_HREFS_INERT`.

## 4. Hard constraint: no external requests

Every asset resolves to a local file; fonts are self-hosted. The clone runs
fully offline — no Google Fonts, no CDN, no third-party request.

Enforced by the `assetRef` pattern in the schema (which rejects
`https://`/`//` prefixes) and `#NO_EXTERNAL_ASSET_REQUESTS`.

## 5. Fonts are an accepted, licence-driven deviation

The original uses two commercial faces (Untitled Sans by Klim, Aeonik Pro by
CoType) plus a commercial dot-matrix face. The clone self-hosts metric-matched
substitutes together with **the original's own `local(Arial)` metric-override
`@font-face` blocks**.

All numeric type values match exactly; only glyph-level text-run widths differ,
measured at 0.1–13px. Both the intended face and the shipped substitute are
recorded in `tokens/00-foundation/font-face.json`, so a licence purchase is a
**token change**, not a refactor.

## 6. A deliberately reproduced upstream bug

The original's stylesheet declares grid areas `vs-line-1` and `vs-line-2`,
while its DOM writes `v-line-5` and `v-line-6`. Those names match nothing, so
the two hero vertical lines **auto-place** instead of landing in their declared
tracks.

The clone reproduces this verbatim, with a code comment.

**Rule:** do not "fix" it. Enforced by
`#PRESERVE_INTENTIONAL_UPSTREAM_BUG`.

## 7. Shared-once structure is a user directive

- **One** `AuthCard` implementation renders all four sign-in previews (3 mapped
  in the hero, 1 as the customiser's target).
- Shared UI lives only in the primitives module.
- Every icon lives only in the icons module.
- Design tokens live only in `tailwind.config.js`.
- All 29 `@keyframes` and both glow primitives live only in `src/index.css`
  (verified: 29 in that file, 0 in every section stylesheet).
- Light mode is a `.light` class cascade plus custom properties. There are
  deliberately **no** forked `-light` components.

Enforced by `#SHARED_ONCE_STRUCTURE`, `#ONE_AUTH_CARD_IMPLEMENTATION` and
`#NO_LIGHT_MODE_FORK`.

## 8. Only 2 of 18 sections are genuinely interactive

The hero light switch, and the 12-button customiser (4 colour swatches writing
`--brand-color`, default `#663AF3`; 4 radii writing `--brand-radius`; and a
4-up logo picker writing `--i`, which offsets one SVG sprite via
`object-position: calc(32px * var(--i) * -1) 0`).

The other five `PRODUCT_DEMO` sections are observer- or mount-triggered
animation with **no user input at all**.

Enforced by `#INTERACTIVITY_BUDGET`.

## 9. Document height is not a fidelity metric

Six sections use `content-visibility: auto`, so `scrollHeight` varies per
measurement pass on **both** the clone and the original. The spec's 6484 figure
was a mid-expansion capture.

**Rule:** never record a document height as a contract or fidelity value.
Enforced by `#NO_DOCUMENT_HEIGHT_CONTRACT` and rejected at the schema layer.

## 10. One behaviour-preserving divergence from the original

The original literally writes `--play-state: playing` for the feature strip.
That is not a valid `animation-play-state` keyword; it works only because the
invalid value makes the declaration compute to the initial `running`. The clone
writes `running`, so the cascade is valid CSS — identical resulting motion.

Recorded in `tokens/20-component/component-tokens.json#features-slider`.

## 11. One deliberate improvement on the original

The original guards only `.spotlight` under `prefers-reduced-motion`. The clone
adds a global duration clamp **and** every JS loop checks
`prefersReducedMotion()` itself. This is an accessibility improvement, not a
fidelity defect.
