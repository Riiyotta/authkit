# https://www.authkit.com/ — local pixel-fidelity clone at /Users/riyaghosh/V3/authkit (React 18 + Vite + Tailwind v3). Structure derived from the clone's own source (src/App.jsx SECTIONS array + the nine section components), cross-checked against CLONE_SPEC.md §2.

Source: https://www.authkit.com/ — local pixel-fidelity clone at /Users/riyaghosh/V3/authkit (React 18 + Vite + Tailwind v3). Structure derived from the clone's own source (src/App.jsx SECTIONS array + the nine section components), cross-checked against CLONE_SPEC.md §2.
Status: **measured-from-codebase**
1 routes · 1 templates · 18 unique sections

> Generated from `ia.json` by `build.mjs`. Edit the JSON, not this file.

## Shape of the site

The largest 1 template (AuthKit homepage (single route)) accounts for 1 of 1 routes (100%). The remaining 0 routes span 0 templates.

| template | routes | share |
|---|---:|---:|
| AuthKit homepage (single route) | 1 | 100% |

## Page chrome

**1 routes carry chrome = `minimal-static`** — AuthKit homepage (single route).

## Sections by reuse

How widely a section is shared determines whether it belongs in a shared
component library or stays local to its page.

| section | category | templates | routes | implementation | scope |
|---|---|---:|---:|---|---|
| `chrome.hero-header` | CHROME | 1 | 1 | `Hero.jsx (.hero__header) + icons.jsx > PoweredByWordmark, HeroMarkIcon, GithubIcon` | The single homepage template. There is no <nav> element on this site. |
| `chrome.page-separator` | CHROME | 1 | 1 | `primitives.jsx > PageSeparator (driven by separatorBefore in App.jsx SECTIONS)` | Emitted by the App shell at 4 of 8 inter-section boundaries on the homepage template. |
| `chrome.hairline-grid` | CHROME | 1 | 1 | `Hero.jsx (.hero__vlines, .hero__hline, .hero__wlines, .hero__cross)` | Hero only, on the homepage template. |
| `hero.wordmark` | HERO | 1 | 1 | `Hero.jsx (.hero__logo) + primitives.jsx > OutlineBox` | Hero only. |
| `hero.headline` | HERO | 1 | 1 | `Hero.jsx (.hero__introducing, .hero__headline) + primitives.jsx > Eyebrow, OutlineBox` | Hero only. |
| `hero.auth-card-trio` | HERO | 1 | 1 | `AuthCard.jsx (mapped over CARDS in Hero.jsx)` | Hero only — but the same component also renders the customiser preview, giving 4 instances site-wide. |
| `hero.light-switch` | HERO | 1 | 1 | `Hero.jsx (.hero__light-switch) + icons.jsx > MoonIcon, SunIcon` | Hero only. The one piece of real stateful UI outside the customiser. |
| `hero.ambient-fx` | HERO | 1 | 1 | `Hero.jsx (.hero__spotlights, .hero__video, .hero__canvas)` | Hero only. The sole prefers-reduced-motion carve-out in the original covers the spotlights. |
| `capability.feature-strip` | CAPABILITY | 1 | 1 | `FeaturesSlider.jsx + primitives.jsx > FeatureTile` | Its own section on the homepage template, directly below the hero. |
| `demo.dashboard` | PRODUCT_DEMO | 1 | 1 | `Dashboard.jsx` | One of five product-demo sections on the homepage template. |
| `demo.custom-ui-browser` | PRODUCT_DEMO | 1 | 1 | `CustomUI.jsx` | Homepage template. Hosts the customiser pickers. |
| `demo.customiser-pickers` | PRODUCT_DEMO | 1 | 1 | `CustomUI.jsx (.color-picker__colors, .border-radius__items, .logo-picker__items)` | Inside the custom-UI section only. The second of two genuinely stateful widgets on the site. |
| `demo.radix` | PRODUCT_DEMO | 1 | 1 | `Radix.jsx + primitives.jsx > SectionHeader, BetweenLines, GlowingButton` | Homepage template. |
| `demo.security-cards` | PRODUCT_DEMO | 1 | 1 | `Security.jsx + primitives.jsx > SectionHeader` | Homepage template. |
| `demo.complete-diagram` | PRODUCT_DEMO | 1 | 1 | `Complete.jsx + primitives.jsx > SectionHeader, GlowingButton` | Homepage template. |
| `proof.testimonials` | PROOF | 1 | 1 | `Testimonials.jsx + primitives.jsx > OutlineBox` | Homepage template. The only third-party-content section. |
| `conversion.cta-header` | CONVERSION | 1 | 1 | `Cta.jsx (.cta-header) + primitives.jsx > SectionHeader` | CTA section on the homepage template. |
| `conversion.cta-boxes` | CONVERSION | 1 | 1 | `Cta.jsx (.cta-boxes, .cta-actions) + primitives.jsx > OutlineBox, GlowingButton + icons.jsx > XGlyph` | CTA section on the homepage template. |

**0 shared sections** appear in more than one template and belong in a component library.

**18 single-use sections** appear in exactly one template. Building these
as "reusable" components up front would be speculative — keep them page-local
until a second caller actually appears.

## Templates

### AuthKit homepage (single route) — `template.homepage`

1 route · `/` · chrome: **minimal-static**

| # | category | section | |
|---:|---|---|---|
| 1 | CHROME | `chrome.hairline-grid` | page-local |
| 2 | CHROME | `chrome.hero-header` | page-local |
| 3 | HERO | `hero.wordmark` | page-local |
| 4 | HERO | `hero.headline` | page-local |
| 5 | HERO | `hero.auth-card-trio` | page-local |
| 6 | HERO | `hero.light-switch` | page-local |
| 7 | HERO | `hero.ambient-fx` | page-local |
| 8 | CAPABILITY | `capability.feature-strip` | page-local |
| 9 | PRODUCT_DEMO | `demo.dashboard` | page-local |
| 10 | PRODUCT_DEMO | `demo.custom-ui-browser` | page-local |
| 11 | PRODUCT_DEMO | `demo.customiser-pickers` | page-local |
| 12 | CHROME | `chrome.page-separator` | page-local |
| 13 | PRODUCT_DEMO | `demo.radix` | page-local |
| 14 | PRODUCT_DEMO | `demo.security-cards` | page-local |
| 15 | PRODUCT_DEMO | `demo.complete-diagram` | page-local |
| 16 | PROOF | `proof.testimonials` | page-local |
| 17 | CONVERSION | `conversion.cta-header` | page-local |
| 18 | CONVERSION | `conversion.cta-boxes` | page-local |

## Section reference

### CHROME

_Structural furniture that frames content rather than being content: the static header, the inter-section rule, the hero's hairline grid tracks._

**`chrome.hero-header`** — Static top bar inside the hero grid: WorkOS mark, 'powered by' wordmark and a GitHub link. Deliberately position:static with no scroll behaviour, no blur and no sticky state.

· The single homepage template. There is no <nav> element on this site. · appears on 1 routes · implemented by `Hero.jsx (.hero__header) + icons.jsx > PoweredByWordmark, HeroMarkIcon, GithubIcon`

**`chrome.page-separator`** — 1px --blue-6 horizontal rule placed between sections. Rendered before radix, security, complete and testimonials only — four of the nine section boundaries carry it.

· Emitted by the App shell at 4 of 8 inter-section boundaries on the homepage template. · appears on 1 routes · implemented by `primitives.jsx > PageSeparator (driven by separatorBefore in App.jsx SECTIONS)`

**`chrome.hairline-grid`** — The hero's visible 1px grid tracks: six vertical lines, horizontal lines, wide lines and two cross marks. Reproduces the original's track bug verbatim — the stylesheet declares areas vs-line-1/2 while the DOM uses v-line-5/6, so two lines auto-place.

· Hero only, on the homepage template. · appears on 1 routes · implemented by `Hero.jsx (.hero__vlines, .hero__hline, .hero__wlines, .hero__cross)`

### HERO

_Above-the-fold identity and product-preview blocks living inside the hero's 17x14 hairline grid._

**`hero.wordmark`** — The AuthKit logotype in a 512x135 outlined box, 476x106 SVG inside.

· Hero only. · appears on 1 routes · implemented by `Hero.jsx (.hero__logo) + primitives.jsx > OutlineBox`

**`hero.headline`** — 'Introducing' eyebrow plus the 512x87 headline block in an outlined box.

· Hero only. · appears on 1 routes · implemented by `Hero.jsx (.hero__introducing, .hero__headline) + primitives.jsx > Eyebrow, OutlineBox`

**`hero.auth-card-trio`** — Three staggered sign-in card previews (344x386, 392x459, 344x386) at x=100/444/836, each wrapped in a JS-driven tilt hook. Rendered from one shared card component, not three copies.

· Hero only — but the same component also renders the customiser preview, giving 4 instances site-wide. · appears on 1 routes · implemented by `AuthCard.jsx (mapped over CARDS in Hero.jsx)`

**`hero.light-switch`** — Role=switch light/dark toggle. Flips data-state and adds .light to the card subtree, swapping card/button/input appearances via the class cascade rather than forked components. Thumb travels translateX(116px) over 0.6s cubic-bezier(.165,.84,.44,1); enters on a 2.1s delay.

· Hero only. The one piece of real stateful UI outside the customiser. · appears on 1 routes · implemented by `Hero.jsx (.hero__light-switch) + icons.jsx > MoonIcon, SunIcon`

**`hero.ambient-fx`** — Non-interactive atmosphere: three spotlights with per-instance --rotate/--scale/--duration, a one-shot 2.669s flare video (740x300, no loop), and a 1280x1222 particle canvas at opacity .5.

· Hero only. The sole prefers-reduced-motion carve-out in the original covers the spotlights. · appears on 1 routes · implemented by `Hero.jsx (.hero__spotlights, .hero__video, .hero__canvas)`

### CAPABILITY

_Compact enumeration of product capabilities as icon+label tiles._

**`capability.feature-strip`** — Six 48x48 icon+label tiles (SSO, Password, Multi-Factor Auth, Social Login, RBAC, Magic Auth) in a 788x80 strip. One-shot entrance with a 1.2s stagger step via --delay:calc(var(--i)*1.2s), gated by --play-state until first intersection. Not a carousel.

· Its own section on the homepage template, directly below the hero. · appears on 1 routes · implemented by `FeaturesSlider.jsx + primitives.jsx > FeatureTile`

### PRODUCT_DEMO

_Full-width animated demonstrations of a product behaviour, each driven by an IntersectionObserver sequence._

**`demo.dashboard`** — 1032px-tall node diagram in a 1440 wrapper: application, auth, work, user, events and database nodes joined by five masked connector lines. Nine database bars at 2px resting; per-dot typewriter delays of 0.2s + 0.1s x index.

· One of five product-demo sections on the homepage template. · appears on 1 routes · implemented by `Dashboard.jsx`

**`demo.custom-ui-browser`** — 1040x1248 section with a 992px faux-browser chrome containing a live auth-card preview, plus its own canvas and five decorative opacity:.75 PNG cards.

· Homepage template. Hosts the customiser pickers. · appears on 1 routes · implemented by `CustomUI.jsx`

**`demo.customiser-pickers`** — Twelve interactive buttons in three pickers driving the card preview: 4 colour swatches to --brand-color (#663AF3 default), 4 radii (0/3px/6/9999px) to --brand-radius, and a 4-up logo picker to --i, which offsets a single SVG sprite via object-position:calc(32px * var(--i) * -1).

· Inside the custom-UI section only. The second of two genuinely stateful widgets on the site. · appears on 1 routes · implemented by `CustomUI.jsx (.color-picker__colors, .border-radius__items, .logo-picker__items)`

**`demo.radix`** — 1177x399 component-kit image above a 560x833 layered logo reveal (stroke, main, blender, three masked line items). Carries desktop and mobile heading variants — the only section that does.

· Homepage template. · appears on 1 routes · implemented by `Radix.jsx + primitives.jsx > SectionHeader, BetweenLines, GlowingButton`

**`demo.security-cards`** — 1044x492 grid of four 320x242 animated cards — leaked-password radar, password-strength bars, automatic-detection radar, and the multi/RBAC box with its dot-matrix readout. Each has its own observer-driven -active sequence.

· Homepage template. · appears on 1 routes · implemented by `Security.jsx + primitives.jsx > SectionHeader`

**`demo.complete-diagram`** — Composite diagram with masked halo, multi and single line overlays, a directory block, social row, and a six-dot user progress column.

· Homepage template. · appears on 1 routes · implemented by `Complete.jsx + primitives.jsx > SectionHeader, GlowingButton`

### PROOF

_Third-party credibility blocks — customer quotes and logos._

**`proof.testimonials`** — Two 498x384 quote cells in a 996px bordered row, each with a company mark, quote body and a 40x40 circular avatar with name and role.

· Homepage template. The only third-party-content section. · appears on 1 routes · implemented by `Testimonials.jsx + primitives.jsx > OutlineBox`

### CONVERSION

_Closing call-to-action blocks._

**`conversion.cta-header`** — Closing gradient h2 with description, using the shared section-header type scale.

· CTA section on the homepage template. · appears on 1 routes · implemented by `Cta.jsx (.cta-header) + primitives.jsx > SectionHeader`

**`conversion.cta-boxes`** — Two 442x332 dotted outline boxes (hosted AuthKit and the GitHub/X links) above a 450x100 action row of glowing buttons. All destination hrefs are deliberately inert.

· CTA section on the homepage template. · appears on 1 routes · implemented by `Cta.jsx (.cta-boxes, .cta-actions) + primitives.jsx > OutlineBox, GlowingButton + icons.jsx > XGlyph`
