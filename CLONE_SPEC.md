Source: https://www.authkit.com/

# AuthKit homepage — build spec

Measured live on 2026-10-09 with Playwright at 1280x900 (primary), plus 1024, 768, 390.
Declaration values cross-checked against the saved stylesheet in
`_source/AuthKit by WorkOS_files/0kn7kgyjdnxlm.css` (component CSS) and
`_source/AuthKit by WorkOS_files/0l0q6~h79kzc..css` (design tokens + @font-face).
Asset → DOM mapping and missing-file list: see `ASSETS.md`.

---

## 0. READ FIRST — content and font substitution

The numbers in this spec (layout, spacing, type scale, colors, motion timings) are measurements and
are what Build should implement. The **content and brand assets are not ours to copy**. Before
building, substitute the following; everything else in this spec is reusable as-is.

| Thing on the original | What to use instead |
|---|---|
| `Untitled Sans` (Klim Type Foundry, commercial; served from `cdn.workos.com/fonts/`) | A metric-near open sans. **Inter** (var) is the closest free match for the UI text. Do not hotlink the WorkOS CDN. |
| `aeonikPro` (CoType Foundry, commercial; `medium-s.p.0jj36.zl5f6h~.woff2`) | Display face substitute — **Instrument Sans** or **Geist** at weight 500. |
| `dotDigital` (Enhanced Dot Digital-7; used only for the 15px "VIEWER" readout) | Any open 7-segment/dot face, or **Share Tech Mono**. |
| AuthKit + WorkOS wordmarks/logos (`authkit.*.svg`, `authkit.*.png`, hero wordmark PNG) | Your own product mark. |
| `logos.112jfawmv-89b.svg` (4-up customer logo sprite), `LoginCardLogo1-3.png` | Your own placeholder logos. |
| Testimonial headshots (`sean-rose.*.png`, `mokhtar-bacha.*.png`) and the two named quotes | Placeholder avatars + your own copy. Structure only is specified below. |
| Long marketing paragraphs | Placeholder copy at the specified character counts. Short functional UI labels ("Continue", "Email", "OR", "Get started") are generic and fine to reuse. |

Fonts actually loaded by the original (from the network log) — for reference only:
`untitled-sans-regular-v2.woff2` (400), `untitled-sans-medium-v2.woff2` (mapped to **700**),
`medium-s.p.0jj36.zl5f6h~.woff2` (aeonikPro, `font-display:swap`),
`enhanced_dot_digital_7-s.p.0xen6m6eh~h6b.ttf`. IBM Plex Mono has `@font-face` rules but stayed
`unloaded` — no element on the homepage uses it. Skip it.

The original declares `aeonikPro Fallback` / `dotDigital Fallback` as `local(Arial)` with metric
overrides, which is worth copying verbatim for your substitutes to avoid layout shift:
`ascent-override:90.63%; descent-override:20.24%; line-gap-override:0%; size-adjust:103.71%`
(aeonik) and `ascent-override:67.2%; descent-override:22.4%; line-gap-override:0%; size-adjust:111.61%` (dot).

---

## 1. Global tokens

### Colors (verbatim from the token stylesheet)

```
--dark-background:      #05060f      /* body bg; computed rgb(5, 6, 15) */
--body-normal:          #c8d4eac7    /* rgba(200,212,234,0.78) — section descriptions */
--body-loud:            #c7d3ea      /* testimonial body */
--body-muted:           #c7d3eaa3    /* rgba(199,211,234,0.64) — muted text */
--blue-loud:            #232425
--blue-6:               #bad6f70f    /* hairline/separator color */
--blue-12:              #bad7f71f    /* 1px inset borders everywhere */
--blue-24:              #bad6f73d
--blue-90:              #bad6f7e6
--gradient-background-6: linear-gradient(0deg, #d8ecf80f 0%, #98c0ef0f 100%)
--gradient-loud-100:     linear-gradient(0deg, #d8ecf8 0%, #98c0ef 100%)
--gradient-subdued-12:   linear-gradient(0deg, #d8ecf81f 0%, #98c0ef1f 100%)
```

Other recurring literals:
- body text `#fff`; `button-hero` text `#bad6f752`; `glowing-button` label gradient `linear-gradient(#98c0ef 0%, #d8ecf8 100%)` clipped to text, fallback color `#d1e4fa`
- corner-dot color `#d1e4fa`, dot size 4px, `drop-shadow(0 0 8px #d1e4fa)`
- accent/glow blues: `#bacff7`, `#98c0ef`, `#c2ccff`, `#adbbff`, `#b3bbff`
- status gradients: green `linear-gradient(#c9ffd5 0%, #caf1fd 100%)`, blue `linear-gradient(#8ebbff 0%, #bedefc 100%)`, pink `linear-gradient(#ed98ef 0%, #fde9ca 100%)`, cyan/violet `linear-gradient(#98daef 0%, #d7cafd 100%)`, red/orange bar `linear-gradient(90deg, #fe90be 0%, #ff9595 100%)`
- section ambient wash (repeated per section, z-index 10/10000, `pointer-events:none`, `inset:0`): `radial-gradient(50% 50%, #4b71faXX 0%, #05050b00 100%)` where XX is `29` (radix), `1f` (customui overlay), `14` (cta), and the dashboard/security/complete variant `radial-gradient(50% 38.81% at 50% 61.19%, #4b71fa14→1f 0%, #05050b00 100%), radial-gradient(50% 36.46% at 50% 36.46%, #4b71fa14→1f 0%, #05050b00 100%)`

### Base resets worth replicating

`body{color:#fff; background:var(--dark-background); width:100vw; min-height:100vh; overflow-y:hidden}`,
`html,body{position:relative; overflow-x:hidden}`, `::-webkit-scrollbar{width:0}`, `:focus{outline:none}`,
`*{box-sizing:border-box; -webkit-font-smoothing:antialiased; text-rendering:optimizelegibility; scroll-behavior:smooth}`,
`img{object-fit:cover; pointer-events:none; user-select:none; display:block}`, `svg{display:block}`,
`a{color:inherit; text-decoration:none}`, `ul{margin-block:0; padding:0; list-style:none}`,
`h1..h6,p,body{margin:0}`. Sections carry `content-visibility:auto`.

### Breakpoints used by the original

`640px`, `940px`, `996px`, `1200px` (and `max-width:1199px` / `max-width:1200px` / `max-width:940px` for the
mobile branches), plus `440px` for one hero variable. Map to Tailwind as custom screens:
`sm:640px`, `md:940px`, `lg:996px`, `xl:1200px`. Note the original is **not** mobile-first for several
blocks — it uses `max-width` queries. Keep those as explicit `@media (max-width: …)` in `index.css`
rather than fighting Tailwind's min-width defaults.

### Type scale (computed, px)

| Role | Base | ≥640px | Weight | Line-height | Letter-spacing | Family |
|---|---|---|---|---|---|---|
| text-h1 | 48 | 56 | 400 | normal | normal | aeonik |
| text-h2 | 40 | 44 | 400 | normal | normal | aeonik |
| text-h3 | 24 | 28 | 600 | 28 → 32 | normal | sans |
| text-h4 | 20 | 24 | 400 | 24 → 28 | **-0.24px** | sans |
| text-h5 | 16 | — | 400 | 24 | normal | sans |
| text-p | 14 | — | 400 | 20 | normal | sans |
| text-small | 12 | — | 400 | 16 | normal | sans |
| `.text-bold` modifier | — | — | **500** | — | — | — |
| section-title-h1 | 48 | 56 | 500 | 68 | normal | aeonik |
| section-title-h2 | 44 | 48 | 500 | 52 → 56 | normal | aeonik |
| section-title-h3 | 40 | 44 | 500 | 48 → 51 | normal | aeonik |
| section-title-h4/h6 | 28 | — | 500 | 32 | normal | aeonik |
| section-description | 16 | — | 400 | 24 | normal | sans |
| badge (eyebrow) | 14 | — | 400 | 20 | normal | sans |

`text-wrap:balance` on h1/h2/h3/h4/h5 and on `.section-header*`.
`.section-header-description{color:var(--body-normal); margin-top:16px}`, and `12px` under 1200px.

### Repeated primitives

**`.text-gradient` (gradient text)** — used for every eyebrow and several headings:
```css
color:#d8ecf8;
background:linear-gradient(0deg, #d8ecf8 0%, #98c0ef 100%);
text-shadow:0 2px 16px #aecff23d;
-webkit-text-fill-color:transparent;
background-clip:text;
```
`.section-header-title span` uses the same clip with `display:block` and `color:transparent`
(measured computed color is therefore `rgba(0,0,0,0)` — expected, not a bug).
`.section-header-title{text-shadow:0 2px 16px #aecff23d}`.

**`.between-lines`** — centered label with a rule on each side.
Container: `display:flex; flex-direction:row; justify-content:center; align-items:center;`
`color:#bad6f752; font:400 14px/20px`. `::before`/`::after` are `height:1px`, `::after` has
`transform:rotate(180deg)`.
- `-gradient` variant: `gap:24px`; rules are `width:86px; background:linear-gradient(90deg, #d8ecf800 0%, #b8d8fe52 100%)`
- `-solid` variant: `gap:8px; --line-color:#bad7f71f`; rules `flex-grow:1; min-width:20px; max-width:110px`

**`.outline-box`** — the dotted-corner frame used around the hero logo/headline, the customui header,
the login card, the testimonial cells and the CTA action bar.
```css
place-self:stretch; display:grid; align-items:center; padding:6px; position:relative;
/* -lines modifier */ box-shadow:inset 0 0 0 1px #bad7f71f;
/* -dots modifier ::before */
--dot-color:#d1e4fa; --dot-size:4px;
inset:calc(var(--dot-size) * -.5);
filter:drop-shadow(0 0 8px #d1e4fa);   /* original ships a typo'd `drop-shadow(0px 0px 8px c)` — use the dot color */
background-image: 4x radial-gradient(var(--dot-color) 50%, transparent 50%);
background-size: 4px 4px (x4);
background-position: 0 0, 100% 0, 0 100%, 100% 100%;
background-repeat:no-repeat;
```
Measured instances (1280): hero logo 512x135 pad 6; hero headline 512x87 pad 6; customui header
1040x260 pad 6; login card 434x564 pad **32**; colour picker 118x81; logo picker 224x188; radius
picker 144x109 (all pad 6, all with `-lines`); testimonial cell 498x384 pad `48px 40px`; CTA header
455x115 pad 32; cta-actions 450x100 pad 32.

**`.badge`** — `font:400 14px/—; color:#bad6f7cc; white-space:nowrap; flex-shrink:0; position:relative`.

**`.link`** (inline gradient link):
```css
color:#d8ecf8; font-weight:600; font-size:inherit;
background-image:linear-gradient(#98c0ef 0%, #d8ecf8 100%); background-clip:text;
-webkit-text-fill-color:transparent; text-shadow:0 2px 16px #aecff23d;
transition:filter .2s ease-out;
:hover { filter:brightness(110%) }
:focus-visible { outline:1px solid #aecff23d; outline-offset:2px; border-radius:2px }
```

**`.button`** (login-card buttons) — `height:var(--button-height,32px); line-height:same;`
`border-radius:var(--brand-radius,6px); display:inline-flex; justify-content:center; align-items:center;`
`gap:8px; width:100%; padding-inline:16px; font:500 14px; --focus-color:#bbd7f74d; --focus-width:2px`.
Variants (all measured):
- `-hero`: `color:#bad6f752; background:#bad6f708; backdrop-filter:blur(3px);`
  `box-shadow:inset 0 0 0 1px #bad7f71f, inset 0 1px 1px #d8ecf80f, inset 0 4px 12px #d8ecf80a`;
  hover → `inset 0 0 0 1px #bad7f71f, inset 0 1px 1px #d8ecf81c, inset 0 4px 12px #d8ecf817`; inner `svg{color:#444f63}`
- `-solid`: `background:var(--brand-color,#6a38ff); color:#fff;` hover `background:color-mix(in srgb, var(--button-color), #000 10%)` with `transition:all .2s ease-out, background-color .1s ease-out`
- `-outline`: `color:#d1e4fa; border:1px solid #bad7f71f;` hover `border-color:#bad7f738`, `transition:all .2s ease-out`
- `-light`: `color:#111; background:#fff; box-shadow:0 0 0 1px #00003b0d, 0 1px 2px #00003b0f;` hover `0 0 0 1px #00003b1a, 0 1px 2px #00003b29`

**`.input`** — wrapper `border-radius:var(--brand-radius,6px); cursor:text; display:inline-flex; flex-direction:column; width:100%`.
Input `min-height:32px; padding-inline:10px; font:400 14px/32px`; `[inputmode=numeric]{text-align:center}`.
`-hero` variant: `cursor:default; color:#c6ccecf2; background:#bad6f708; backdrop-filter:blur(3px);`
`border-radius:6px; box-shadow:inset 0 0 0 1px #bad7f71f, inset 0 1px 1px #d8ecf80f, inset 0 4px 12px #d8ecf80a;`
placeholder `#bad6f752`; `::selection{background:#d8ecf84d}`; focus → `inset 0 0 0 1px #bad7f71f, inset 0 1px 1px #d8ecf81c, inset 0 4px 12px #d8ecf817`.
`-light`: `color:#333; background:#fff; box-shadow:0 0 0 1px #00003b0d, 0 1px 2px #00003b0f;` hover `0 0 0 1px #00003b1a,…`; focus `0 0 0 1px #00003b1a, 0 1px 2px #00003b26`; placeholder `#00082f47`.
`-solid`: `background:#c7d3ea0f; border:1px solid #bad7f71f;` hover border `#bad7f72b`; focus `background:#c7d3ea1a`.

**`.card`** — the login-card shell. `--line-width:1px; --line-color:#adbbff; --start-angle:0deg; --delay:0s; --easing:linear; perspective:1000px`.
Sizes: small `radius 12px / content pad 12px`; medium `radius 16px / pad 36px 24px`;
large `radius 16px / pad 42px 24px`, ≥640px `42px 36px`. `.content{z-index:1; height:100%}`.
- `-hero`: `background-color:#05060ff7` + `background-image:linear-gradient(#bacff70a 0% 100%)` with `background-clip:content-box`;
  `box-shadow:inset 0 1px 1px #d8ecf833, inset 0 24px 48px #a8d8f50f, 0 16px 32px #0000004d`;
  `::after` 1px `#bacff71f` border at `inset:0`; `::before` 4 corner dots (`--dot-color:#d1e4fa; --dot-size:4px`) at `inset:16px` with `filter:drop-shadow(0 0 8px #d1e4fa)`
- `-light`: `color:#05060f; background:#fffffffc;`
  `box-shadow:0 0 0 1px #00003b0d, 0 1px 1px #00003b0a, 0 3px 3px #00003b08, 0 6px 4px #00003b05, 0 11px 4px #00003b03, 0 32px 24px -12px #00003b0f`
- `-dark`: `backdrop-filter:blur(4px); background:#bad6f708;`
  `box-shadow:inset 0 1px 1px #c7d3ea1f, inset 0 24px 48px #c7d3ea0d, 0 24px 32px #06060eb3`; `::after` 1px `#bad7f71f`
- `-outline`: `::before` 1px `#bad7f71f`, `border-radius:24px`, `inset:-8px`

**Light-mode overrides** present on `.light` ancestor (driven by the hero switch):
`.light .text-muted{color:#00003ba3}`, `.light .between-lines{color:#00082f47}`,
`.light .between-lines-solid{--line-color:#00003b0d}`,
`.light .link{color:#000a13d4; background-image:linear-gradient(#000a13d4 0% 100%); text-shadow:none}`.

**`.page-separator`** (between major sections): a 1px-high div, `border-bottom:1px solid var(--blue-6)`,
full viewport width. Appears after customui, radix, security, complete, and before testimonials.

**`.container-lg`**: `max-width:1200px; margin:0 auto; padding:0 6px`; at `max-width:1200px` →
`max-width:390px; padding:8px`. (Not used by any homepage section — only the shared chrome. Noted for completeness.)

---

## 2. Section-by-section

Document height at 1280 after full load: **6484px** (5025px before lazy sections expand).
Order: hero → features-slider → dashboard → customui → radix → security → complete → testimonials → cta.
There is **no `<footer>` and no `<nav>`** on this page. The only header is inside the hero.

### 2.1 Hero (`.hero.hero--intro`)

Full-bleed, `display:grid`, `place-items:center`, `overflow:hidden`, `padding-bottom:100px`, `z-index:1`,
`--intro-delay:.1s`, `--logo-height:100px` (120px ≥440px; grid row forces 135px ≥640px).
Height 1222px at 1280/1024/768; 1122px at 390.

**Grid, ≥640px** — 17 columns / 14 rows, hairlines as explicit 1px tracks:
```
grid-template-columns: 1fr 1px 70px 1px 70px 1px 70px 1px 370px 1px 70px 1px 70px 1px 70px 1px 1fr;
grid-template-rows:    1px 105px 1px 70px 1px 70px 1px 135px 1px 85px 1px 540px 1px 110px;
justify-content:center;
```
Computed 1fr at 1280 = **241px**; at 1024 = 113px; at 768 = 0px (hairline columns then sit at the edges;
the header measures 798px wide starting at x=-15, i.e. it overflows — replicate by not clamping).
Named areas, row by row: `header` (row 2) / `cross-1 . introducing … . cross-2` (row 6) / `logo` (row 8)
/ `headline` (row 10) / `cards` (row 12) / `light-switch` (row 14).

**Grid, <640px (390 measured)** — 9 columns / 14 rows:
```
grid-template-columns: 20px 1px 40px 1px 1fr 1px 40px 1px 20px;   /* 1fr = 266px at 390 */
grid-template-rows:    1px 90px 1px 40px 1px 50px 1px var(--logo-height) 1px 85px 1px 540px 1px 110px;
```
`.hero__cross` is `display:none` below 640px.

**Header** (`.hero__header`, `grid-area:header`, **`position:static` — it does not stick and there is no
scroll-driven nav behaviour at all**). Height 105px (90px mobile). It re-uses the hero's 17-column
template with areas `". . . powered-by powered-by . . . logo . . . right right . . ."`.
Below 640px it collapses to `grid-template-columns:120px 1fr 120px` / `"powered-by logo right"`.
- `.hero__powered-by` — `justify-self:start`; ≥640px `justify-self:end; margin-right:-5px`; ≥940px `margin-right:0; padding-right:24px`. 96x14 at 1280, top 47. Contains a visually-hidden `<h2>` label and a link to `https://workos.com/` (`target=_blank`): `color:#bad6f7; opacity:.5; transition:opacity .2s; :hover{opacity:.6}`, plus a `::after{inset:-10px}` hit-area expander.
- `.hero__workos-icon` — centered `svg` 36x31 at y=38, `grid-area:logo; justify-self:center`.
- `.hero__right` — `display:flex; gap:8px; justify-self:end` (≥640 `margin-right:5px`; ≥940 `justify-self:start; gap:16px; margin-left:-16px`). 158x36 at 1280, top 36. Two items: a 36x36 GitHub icon button linking `https://github.com/workos/authkit` (`target=_blank`) — **`display:none !important` below 941px** — and a `.glowing-button` 106x36 labelled **"Get started"** linking `https://signin.workos.com/sign-up?utm_source=authkit.com&utm_medium=website&utm_campaign=authkit` (`target=_blank`).

**Eyebrow** — `.hero__introducing` `grid-area:introducing`, a `.between-lines-gradient` wrapper
296x20 at y=203 holding a `.badge` 76x20 whose text is a `.text-gradient` span, 14px/20px: **"Introducing"**.
Flanked by two `.hero__cross` 40x40 marks at y=193 (x≈200 at 1024):
```css
--line-color:#bad8f71f;
background-image:
  linear-gradient(45deg, transparent 50%, var(--line-color) 50%, transparent calc(50% + 1px)),
  linear-gradient(-45deg, transparent 50%, var(--line-color) 50%, transparent calc(50% + 1px));
```

**Logo** — `.hero__logo` is an `.outline-box.-dots` 512x135, `z-index:-1`, `justify-content:center`.
Inside, an `<img alt="Authkit logo">` 476x106 (intrinsic 476x106 SVG), `object-fit:contain; width:100%; height:auto`.
At 390 it measures 336x74.82.

**Headline** — `.hero__headline` is an `.outline-box.-dots` 512x87, `margin-block:-1px`, containing an
`<h2>` built from two `.text-gradient` spans at `text-h4` size (24px/28px, `letter-spacing:-0.24px`,
`text-align:center`), measured 500px wide, 60px tall, y=398. Two lines. (At 390 it drops to 20px/24px.)

**Hero video** — `<video class="hero__video" autoplay muted playsinline>` (`loop` is **false**), sources
`video/authkit.mov` then a webm fallback (`<source type="video/webm">`, no src captured — see ASSETS.md).
Intrinsic 1280x600, `duration 2.669333s`, and it is `paused/ended` after one play — a **one-shot flare
that plays once on load and stops**, not a loop.
```css
position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) scale(.5);
width:230vw;  /* ≥640px: width:1480px; display:block */
z-index:100; mix-blend-mode:color-dodge; filter:saturate(.7); pointer-events:none;
mask-image:radial-gradient(closest-side, red 65%, transparent 95%);
```
Rendered 740x300 at 1280/1024/768; 449x300 at 390 (`width:897px` there).

**Hero canvas** — one `<canvas>` as the hero's first child, sized to the hero box (1280x1222),
`style="position:absolute;inset:0;width:100%;height:100%;opacity:0.5"`, 2D context. It renders the
animated starfield/noise field behind everything. **The draw loop is inside a minified bundle and I did
not decompile it** — I cannot give you its per-frame math. Implement as: 2D canvas, devicePixelRatio-scaled,
sparse slow-drifting 1px points in `#bad6f7`-ish tones at `globalAlpha` well under 1, container opacity 0.5,
`requestAnimationFrame` loop. Flagged as approximate.

**Spotlights** — `.hero__spotlights` is `position:absolute; inset:0; z-index:1; pointer-events:none`,
`mask-image:radial-gradient(farthest-side at 50% 0, red 50%, transparent 90%)`, and fades in
`opacity 0 → 1` with `transition:opacity 1.5s .5s`. Three `.spotlight` children, each:
```css
position:absolute; top:100px; left:50%; width:200px; height:700px;
transform-origin:50% 0; border-radius:9999px; opacity:.5; filter:blur(15px); z-index:-10;
background-image:conic-gradient(at 50% -5%, #0000 45%, #7c91b64d 49%, #7c91b680 50%, #7c91b64d 51%, #0000 55%);
animation:
  spotlight-opacity calc(var(--duration) * 1.2) linear infinite var(--delay,0s) alternate,
  spotlight-scale   calc(var(--duration) * 1.7) infinite var(--delay,0s) both;
```
Per-instance inline vars (measured, in DOM order):
| # | --rotate | --scale | --duration | → opacity anim | → scale anim | rendered |
|---|---|---|---|---|---|---|
| 1 | 20deg | 1 | 5s | 6s | 8.5s | 451x745 @ y63 |
| 2 | 0deg | 1.02 | 8s | 9.6s | 13.6s | 222x778 @ y100 |
| 3 | -20deg | 1 | 4s | 4.8s | 6.8s | 480x768 @ y59 |
```css
@keyframes spotlight-opacity { 0%{opacity:.6} 50%{opacity:.5} 95%{opacity:.6} }
@keyframes spotlight-scale {
  0%  { transform:translateX(-50%) rotate(var(--rotate)) scale(var(--scale)) }
  50% { transform:translateX(-50%) rotate(calc(var(--rotate) * 1.2)) scale(calc(var(--scale) * 1.1)) }
  to  { transform:translateX(-50%) rotate(var(--rotate)) scale(var(--scale)) }
}
@media (prefers-reduced-motion:reduce){ .spotlight{ animation:none; transform:translateX(-50%) rotate(calc(var(--rotate)*1.2)) } }
```

**Grid lines** — `.hero__lines` inherits the hero's grid tracks, `position:absolute; inset:0;`
`pointer-events:none`, and fades in with `transition:opacity 3s` from 0.
Two children, both inheriting the tracks:
- `.hero__wlines` — rows only; areas `h-line-1 … h-line-6` (`h-line-1 … h-line-9` ≥640px, `justify-content:start`). Each `.hero__hline`: `height:1px; min-width:100vw; background:#bad7f71f`; ≥640px `background:linear-gradient(90deg, transparent, #bad7f71f, transparent)`.
- `.hero__vlines` — `mask-image:linear-gradient(#000 80%, transparent)`; areas place `v-line-1..4` (plus `vs-line-1/2` ≥640px). Each `.hero__vline`: `width:1px; min-height:100vh; align-self:flex-start; background:linear-gradient(#bad7f71f 80%, transparent)`.

**Cards** — `.hero__cards` `grid-area:cards; display:flex; justify-content:center; align-items:center;`
`perspective:1000px; z-index:2`. No gap. Measured 1176x459 at 1280 (overflows: x=-76 at 1024, x=-204 at 768,
960px wide at x=-285 at 390). Three `.hero__card`, `width:392px` ≥640px else `320px`.
Side cards carry inline transforms (**measured, not guessed**):
- left: `transform:translateZ(-50px) rotateY(-10deg)` → renders 344x386 at x=100
- centre: `transform:none; z-index:1` → 392x459 at x=444
- right: `transform:translateZ(-50px) rotateY(10deg)` → 344x386 at x=836

At 390: 302 / 320 / 302px. Each card is a `.card.-hero` (or `.card-light` in light mode) wrapping
`.hero__card-content{display:flex; flex-direction:column; gap:16px}` and
`.hero__card-header{display:flex; flex-direction:column; align-items:center; gap:10px}`.
Card contents (generic auth-UI labels, measured type):
1. **left** — 30x32 logo; title 16px/24px w500 `#fff` "Welcome to the Blamer"; sub 14px/20px w400 `rgba(199,211,234,.64)` "Log in to continue."; label 14px/20px w500 "Email"; hero input; `.button-hero` 14px/32px w500 `#d1e4fa` "Continue"; footer row 14px/20px muted "Don't have an account?" + `.link` w600 "Sign up" (`href="#"`).
2. **centre** — 32x32 logo; title "Sign in to SuperApp"; "Email" + input; "Continue"; `.between-lines-solid` "OR" (14px/20px, `rgba(186,214,247,.32)`); "Continue with Google"; "Continue with Microsoft"; muted footer + "Sign up".
3. **right** — 30x32 logo; title "Sign in to Clamer"; sub "Enter the temporary passcode from your authenticator app."; label "One time code"; numeric input (`text-align:center`); "Continue"; `.link` "Return to sign in".

**Light switch** — `.hero__light-switch` `grid-area:light-switch; display:flex; flex-direction:column; gap:16px`.
A Radix-style `<button role="switch" aria-checked data-state="unchecked|checked">`, 240x36:
```css
.light-switch{ width:240px; height:36px; border-radius:999px; padding:4px; position:relative;
  -webkit-tap-highlight-color:transparent }
.light-switch:focus-visible{ outline:2px solid #bad6f726; outline-offset:2px }
.light-switch--dark{ color:#c7d3ea; background:#bad6f70f; backdrop-filter:blur(8px);
  box-shadow:inset 0 0 0 1px #bad6f70f }
.light-switch--dark .light-switch__thumb{ background:#bacff70a;
  box-shadow:inset 0 1px 1px #d8ecf833, inset 0 24px 48px #a8d8f50f, inset 0 0 0 1px #bacff71f }
.light-switch--light{ color:#00003b; background:#e8e9ef }
.light-switch--light .light-switch__thumb{ background:#fff;
  box-shadow:0 0 0 1px #00003b0d, 0 1px 2px #00003b0f, 0 3px 6px #00003b0a }
.light-switch__thumb{ width:50%; height:100%; border-radius:999px; transform-origin:0 0; display:block;
  transition:transform .6s cubic-bezier(.165,.84,.44,1) }
.light-switch__thumb[data-state=checked]{ transform:translate(100%) }
.light-switch__icon-light,.light-switch__icon-dark{ position:absolute; top:50%; transform:translate(-50%,-50%);
  transition:opacity .2s cubic-bezier(.165,.84,.44,1) }
.light-switch__icon-light{ left:75% }  .light-switch__icon-dark{ left:25% }
/* inactive icon dims: dark theme → opacity .5; light theme → opacity .3 */
```
Two inline 20x20 SVGs (moon, sun), `stroke:currentColor; stroke-width:1.5; stroke-linecap/linejoin:round`.
Below it, a caption `p` 240x20, `text-p` muted, centered: **"Light and dark modes supported."**
Toggling adds/removes `.light` on the hero card subtree (see the light-mode overrides in §1) and swaps
`.card-hero` → `.card-light`, `.button-hero` → `.button-light`, `.input-hero` → `.input-light`.
**This is a real widget Build must reimplement** (controlled React state + `data-state` attributes).

**Hero ambient wash** — `.hero::after`, `inset:0; z-index:2; pointer-events:none`:
```css
background-image:
  radial-gradient(50% 64.48% at 50% 35.52%, #153dcc14 14.36%, #05050b00 100%),
  radial-gradient(50% 67.94% at 50% 32.06%, #d8ecf80a 0%, #98c0ef03 50%, #05050b00 100%);
background-size:cover;
```

**Hero entrance timeline** — pure CSS transitions, fired by adding `.hero--intro` to the hero root
(the original already has it on first paint; in React add it in a `useEffect` on mount / next frame).
`--intro-delay:.1s`. Start state → end state:

| Element | from | to | transition (verbatim) |
|---|---|---|---|
| `.hero__header` | `opacity:0; translateY(-10px)` | `1; 0` | `opacity 1.5s calc(var(--intro-delay) + .2s), transform 1.5s calc(…+.2s)` → computed **1.5s, delay 0.3s** |
| `.hero__introducing` | `opacity:0; translateY(-5px)` | `1; 0` | same, 1.5s / 0.3s |
| `.hero__logo img` | `opacity:0; scale(1)` | `1` | `opacity 2s var(--intro-delay)` → **2s, delay 0.1s** |
| `.hero__headline` and `.hero__headline *` | `opacity:0`, children `translateY(10px)` | `1; 0` | `opacity 1.5s calc(…+.5s), transform 1.5s calc(…+.5s)` → **1.5s, delay 0.6s** |
| `.hero__cross` (≥640px only) | `opacity:0; scale(.5)` | `1; 1` | `opacity 1.5s .4s, transform 1.5s .4s` |
| `.hero__spotlights` | `opacity:0` | `1` | `opacity 1.5s .5s` |
| `.hero__lines` | `opacity:0` | `1` | `opacity 3s` (no delay) |
| `.hero__light-switch` | `opacity:0; translateY(10px)` | `1; 0` | `opacity 1.5s calc(…+2s), transform 1.5s calc(…+2s)` → **1.5s, delay 2.1s** |
| `.hero--intro > *` catch-all | — | `opacity:1; transform:translateY(0) translate(0) scale(1)` | — |

No easing is named on any of these, so they all use the CSS default **`ease`**. Cards fade via their
inline `opacity:1` (set by JS on mount); the measured start state is `opacity:0` with the same
`.hero--intro > *` reset.

### 2.2 Features slider (`.features-slider`)

A 6-item icon strip, **not** a carousel — nothing translates or auto-rotates; the "slider" name is legacy.
```css
display:flex; flex-direction:column; align-items:center; gap:40px; padding-inline:20px;
animation:1.5s 3s backwards feature-intro;
@keyframes feature-intro { 0%{opacity:0; transform:translateY(20px)} to{opacity:1; transform:translateY(0)} }
```
Note: **no easing named → `ease`; no `forwards`, only `backwards`**, and `animation-delay:3s` — so the
whole strip is held at its 0% state for 3s after load, then eases in over 1.5s.

`.features-slider__items` is a `<ul>` `display:grid`:
- ≥940px: `--columns:6; --gap:14px` → computed `134px 134px 134px 134px 134px 48px`, `row-gap:54px`, `column-gap:14px`, `padding-bottom:32px`. Measured 788x80 at x=246 (1280) / x=118 (1024).
- <940px: `--columns:3; --gap:4px` → `108px 108px 48px`, same 54px row gap. Measured 272x182 (two rows).

`.features-slider__item` — `display:flex; align-items:center; gap:var(--gap); position:relative;`
`--duration:1.5s; --delay:calc(var(--i,0) * 1.2s)`, with `style="--i:0..5"` set per item (measured 0,1,2,3,4,5).
**Stagger step = 1.2s.** The 3rd item's separator is `display:none` below 940px (so the 3-col grid doesn't
show a trailing connector), `display:block` at ≥940px.

Each item = a 48x48 `.features-slider__icon-container` + a `.features-slider__separator`.
Icon container: `display:flex; flex-direction:column; align-items:center; gap:12px;`
`animation:feature-icon-shine var(--duration) linear calc(var(--delay) + 0s); animation-play-state:var(--play-state,paused)`.
Separator: `--separator-width:56px` (**72px ≥940px**), `height:24px`, `--line-color:#bacff714`, `--circle-color:#bacff71a`.
Both `::before` and `::after` paint:
```css
background-image:
  linear-gradient(to right, var(--line-color), var(--line-color)),
  radial-gradient(24px circle at 50% 50%, transparent calc(50% - 2px), var(--circle-color) calc(50% - 1px), transparent 50%),
  radial-gradient(2px circle at 50% 50%, #b7ccf4 calc(50% - 1px), transparent 50%);
background-position:0, 50%, 50%;
background-size:100% 1px, auto, auto;
background-repeat:no-repeat;
position:absolute; inset:0;
```
`::before` is the travelling highlight: `--line-color:#bacff73d; --circle-color:#bacff73d`,
`mask-image:linear-gradient(90deg, red 80%, transparent)`, `mask-size:200% 100%`, `mask-repeat:no-repeat`,
starting `mask-position:200% 0`, and
`animation:feature-separator-mask var(--duration) ease-in-out calc(var(--delay) + .2s) forwards`
with `animation-play-state:var(--play-state,paused)`.
```css
@keyframes feature-separator-mask { to { mask-position:0 0 } }
@keyframes feature-icon-shine { 10%,20%{filter:brightness(160%)} 80%{filter:brightness()} }
```
**Trigger mechanism:** both animations sit at `animation-play-state:paused` until JS sets
`--play-state:running`. Measured: `--play-state` is `paused` at scrollY 0 and `running` by scrollY 700
(viewport 900, strip top y=1222 → it flips once the strip is roughly at/near the viewport bottom edge).
Implement with a single `IntersectionObserver` on `.features-slider` that sets `--play-state:running`
on first intersection and never unsets it. I could not read an exact threshold out of the minified
bundle; the observed flip is consistent with `threshold: 0` plus a positive `rootMargin`. Use
`{threshold:0, rootMargin:'0px 0px -100px 0px'}` and treat the exact value as approximate.

Item labels — `.features-slider__text{text-align:center; white-space:nowrap}`, 12px/16px w400
`rgba(199,211,234,.64)`. Below 940px the inner `span` is `display:none` and the label is swapped for a
short form via `content:attr(data-mobile-title)` on `::after`. Desktop labels in order:
**Single Sign-On, Password, Multi-Factor Auth, Social Login, Role-Based Access Control, Magic Auth**
(icons: `SingleSignOn`, `Password`, `MultiFactorAuth`, `SocialLogin`, `Rbac`, `MagicLink` — 48x48 displayed,
96x96 intrinsic, `alt` = kebab-case name).

### 2.3 Dashboard (`.dashboard`)

```css
max-width:1440px; height:1032px; margin:0 auto; position:relative; content-visibility:auto;
/* ::before ambient */ z-index:10; pointer-events:none; inset:0;
background: radial-gradient(50% 38.81% at 50% 61.19%, #4b71fa1f 0%, #05050b00 100%),
            radial-gradient(50% 36.46% at 50% 36.46%, #4b71fa14 0%, #05050b00 100%);
@media (max-width:1199px){ height:982px }
```
`.dashboard .section-header{ position:absolute; top:120px; left:0; right:0; padding-inline:16px }`,
`.section-header-description{max-width:440px}`.

**Section header** (pattern reused by radix / security / complete):
`.section-header{display:flex; flex-direction:column; align-items:center; text-align:center; margin:0 auto;`
`position:relative; z-index:1; width:100%; max-width:max-content; text-wrap:balance}`.
`.section-header-badge{margin-bottom:16px}`. Measured here: 472x202 at y=1422 — eyebrow
`.between-lines-gradient` 355x20 "**Extensible by design**" (14px/20px gradient), then an `h3`
`.section-header-title-h3` 434x102 at y=1458 (44px/51px w500 aeonik, two `span` lines, each
`display:block` + gradient-clipped), then the description `p` 440x48 at y=1576 (16px/24px, `--body-normal`),
~106 chars across 2 lines.

There are two title variants in the DOM: `.section-header-title-desktop` and
`.section-header-title-mobile`. **Important measured fact:** the switch is
`@media (max-width:1200px)` → desktop hidden, mobile shown. At **1280 the desktop variant is the live
one; at 1024/768/390 the mobile one is** (I measured `titleDesktopDisp:none` at all three of 1024/768/390).
The mobile variant breaks the same sentence into 4 shorter `span` lines instead of 2.

**`.dashboard-animation-wrapper`** — `position:absolute; bottom:0; left:50%; transform:translateX(-50%);`
`width:1440px; height:1032px`. At `max-width:1199px` → `width:697px; height:506.5px; bottom:103px; margin-left:-20px`
(measured 697x507 at x=144 / 16 / -173 for 1024 / 768 / 390 — it deliberately overflows on mobile).
Contains a `<picture>` background (`.dashboard-background`, `position:absolute; inset:0; z-index:1; pointer-events:none`)
and `.dashboard-animation` holding six absolutely-positioned node widgets plus the connector lines.
Desktop image 1440x1032 displayed (1920x1376 intrinsic). Art-directed:
`(min-width:1200px)` → `background.16z-rk72~t82h.png` @1x/2x width 1920/3840 q100;
`(max-width:1199px)` → `background-mobile.12si4.a3e5cgb.png` @ width 750/1920 q100.

Node geometry (desktop / mobile, all `position:absolute` inside the 1440x1032 wrapper):

| Node | size | desktop top/left | ≤1199px |
|---|---|---|---|
| `.dashboard-application` | 208x104, radius 8 | 746 / 448 | 208x121.5 @ 308.5/148, `scale(.625)`, `z-index:1` |
| `.dashboard-auth` | 80x80, radius 10 | 559 / 464 | @175.75/200.75, `scale(.731)` |
| `.dashboard-work` | 200x200 | 451 / 620 | @75/256, `scale(.5)` |
| `.dashboard-user` | 80x80, radius 10 | 559 / 896 | @175.75/431, `scale(.731)` |
| `.dashboard-events` | 80x80, radius 10 | 758 / 900 | @329/447, `scale(.731)` |
| `.dashboard-database` | 80x80, radius 10 | 758 / 732 | @329/343, `scale(.731)` |
| `.dashboard-lines` | — | `bottom:471px; left:315px`, `z-index:-1` | `top:178px; left:-50px` |

Each 80x80 node: `::before` is a 1px masked gradient ring
(`mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite:exclude; padding:1px`),
`opacity:0`, `transition:opacity .45s cubic-bezier(.6,.6,0,1)`, turned on by `.<node>-active`.
`::after` is a `backdrop-filter:blur(8px)` plate at `inset:-12px`, `z-index:-1` (`content:unset` ≤1199px).
Ring gradients + glows per node:
- `-auth`: `linear-gradient(#c9ffd5 0%, #caf1fd 100%)`, `box-shadow:0 0 16px #c8fdd73d, inset 0 1px .5px #bad6f70f`
- `-user`: `linear-gradient(#ed98ef 0%, #fde9ca 100%)`, `0 0 16px #eebaf73d, inset 0 1px .5px #bad6f70f`
- `-events`: `linear-gradient(#8ebbff 0%, #bedefc 100%)`, `0 0 16px #babcf73d, …`
- `-database`: `linear-gradient(#98daef 0%, #d7cafd 100%)`, `0 0 16px #babcf73d, …`
- `-application`: `linear-gradient(#b3b3ff 0%, #b3bbff 100%)`, `0 0 16px #bad6f73d, …`

Node internals and their motion:
- **application** — two `.dashboard-application-input` rows (`display:flex; gap:8px; left:80px`, tops 27.5/49.5px; mobile 31/57px) of 3x3px `#05060f99` dots with `border-radius:2px` and `transition:background-color .2s cubic-bezier(.6,.6,0,1)`; `::before` `box-shadow:inset 0 1px 2px #05060f80, 0 .5px .6px #bad7f71f`, `::after` `opacity:0; box-shadow:0 0 6px #b3bbff52`. Adding `.dashboard-application-animate` sets each dot `background-color:#b3bbff`, `::before{opacity:0}`, `::after{opacity:1}` with **`transition-duration:0s !important` and `transition-delay:var(--transition-delay)`** — i.e. a per-dot typewriter stagger driven by an inline `--transition-delay` set in JS (the delay values are generated at runtime; I could not read the generator out of the bundle — use ~40–60ms per dot). A 92x16 `.dashboard-application-button` (`background:var(--blue-6); radius 2px; top:67; left:58;` `box-shadow:inset 0 1px 1px #c7d3ea1f, inset 0 24px 48px #c7d3ea0d`; 1px `--blue-6` inner border via `::before`) then runs `animation:.3s cubic-bezier(.6,.6,0,1) 1.5s dashboard-application-button-press` → `@keyframes{0%,to{scale(1)} 50%{scale(.97)}}`. Button is `display:none` ≤1199px.
- **auth** — same two-row dot pattern (`gap:4px; left:21px`, tops 30/49), dots turn on via `::after{background:linear-gradient(#c9ffd5,#caf1fd); box-shadow:0 0 6px #c8fdd752}`, same `--transition-delay` / `0s` duration trick under `.dashboard-auth-animate`.
- **work** — 218x218 `.dashboard-work-inner` img at `inset:-9px`, `z-index:10`. `.dashboard-work-lights{position:absolute; inset:24px; filter:blur(24px); opacity:.5}` with two 76x76 `#b3b3ff` blocks (second `margin-left:auto`). `.dashboard-work-active .dashboard-work-lights{animation:4s linear infinite dashboard-work-lights-rotate}` → `0%{rotate(0)} 50%{rotate(180deg) scale(.8)} to{rotate(360deg) scale(1)}`. Two 29x4 bars at `left:86px`, `top:31` / `bottom:30`, `background:#05060f4d`, whose `::after` (`#b2b2ffcc`, `box-shadow:0 0 8px #b2b2ff7a`) fades in `opacity .45s cubic-bezier(.6,.6,0,1)` when active. `::after` plate `backdrop-filter:blur(8px)` at `inset:0`.
- **user** — centred `.dashboard-user-dot` 2x2 → **16x16** when active, `background:linear-gradient(#ed98ef,#fde9ca)`, `border-radius:10px`, `box-shadow:0 0 12px #eebaf73d` → `0 0 8px #eebaf752`, `transition:width .45s cubic-bezier(.6,.6,0,1) .3s, height .45s … .3s, box-shadow .45s … .3s` (**note the 0.3s delay**). A 52x52 spinner img at `top/left:14.25px` fades in (`.45s`) and spins `animation:4s linear infinite spin` → `to{rotate(360deg)}`.
- **events** — 52x22 `.dashboard-events-spinner` at `top:29; left:14`, `mask-image:var(--mask-image)` (`mask.16p54l0zj9j4q.png`), `mask-size:cover`, fades in `.45s`. Inner 100x100 div, `filter:blur(1px)`, `background:conic-gradient(at 50.12%, #bedefc00 0deg, #161b2d00 249.24deg, #bedefc 340.34deg, #8ebbff 360deg)`, `animation:4s linear infinite dashboard-events-spinner` → `to{translate(-50%,-50%) rotate(1turn)}`.
- **database** — `.dashboard-database-bars{display:flex; align-items:flex-end; gap:4px; height:28px; top:26; left:19.5}` of 1px-wide bars, `background:linear-gradient(#98daef,#d7cafd)`, `border-radius:10px`, `box-shadow:0 0 12px #eebaf73d`, `transition:height 1s linear` — heights are set from JS (equaliser). Bar count/height sequence lives in the bundle; **not measured** — use 20 bars with a random walk re-rolled each second.
- **lines** (the connectors) — 4 `.dashboard-lines-item`, `background-color:var(--blue-6)`, `mask-image:var(--mask-image); mask-size:cover`, offsets `top/left` = 57/56, 49/48, 16/32, 8/18. Each has an inline `--mask-image` + `--animation-duration:5000ms` + explicit size: `1.png` 699.5x157.5, `2.png` 715.5x173.5, `3.png` 747.5x222.5, `4.png` 775.5x263.5, `5.png` 811.5x279.5 (5 masks shipped, 4 items rendered at 1280). Inner div: `background:conic-gradient(from 5deg, transparent 330deg, #98c0ef 360deg, transparent 361deg)`, `opacity:0`, `transform:translate(-25%,-50%) rotate(var(--start-angle))`, `transition:opacity .45s cubic-bezier(.6,.6,0,1)`. When `.dashboard-lines-item-active`: `opacity:.5` and
```css
animation: dashboard-lines-spin var(--animation-duration) linear infinite;
@keyframes dashboard-lines-spin {
  0%       { transform:translate(-25%,-50%) rotate(var(--start-angle)) }
  16.6667% { transform:translate(-25%,-50%) rotate(calc(var(--start-angle) + (360deg - var(--start-angle))/2)) }
  50%      { transform:translate(25%,-50%)  rotate(360deg) }
  66.6667% { transform:translate(25%,-50%)  rotate(calc(360deg + var(--start-angle)/2)) scale(1,1.3) }
  to       { transform:translate(-25%,-50%) rotate(calc(360deg + var(--start-angle))) }
}
```

**Measured trigger sequence** (viewport 900, stepped scroll, 120ms settle per 100px step — these are the
scrollY values at which each `-active` class first appeared):
```
 700  dashboard-lines-item-active  +  dashboard-application-active + -animate
1300  dashboard-auth-active + -animate
2000  dashboard-work-active
2100  dashboard-application-active   (re-fires)
2700  dashboard-user-active
2800  dashboard-auth-active          (re-fires)
3400  dashboard-events-active
4100  dashboard-database-active
```
The classes re-appear at later scroll positions, which means this is **not** a one-shot scroll reveal:
an `IntersectionObserver` arms the block when it enters view (first fire at scrollY≈700, with the
dashboard top at y=1302 and viewport bottom at 1600 — so roughly "top of block within ~300px of the
viewport bottom"), and from then on a **JS timer loop** cycles the nodes on and off. The measured
spacing between distinct first-fires is ≈600–700px of scroll at 120ms/step ≈ **0.7–0.9s per step**,
so model it as a repeating sequence with a ~750ms step that advances on an interval while the block is
in view, pausing when it leaves. The exact ordering table is in the bundle and I did not decompile it;
the order above is the measured firing order and is what Build should use.

### 2.4 Custom UI / login-card customiser (`.customui`)

```css
max-width:1040px; margin-inline:8px; padding-block:60px 80px; position:relative;
@media (min-width:940px){ margin-inline:auto; padding-block:120px }
```
Measured: 1040x1248 at 1280; 1024-wide box at 1024 (pad 120/120); 752x1148 at 768 (pad 60/80, x=8);
374x1503 at 390.

- `::before` — `background:url(/img/power-grace-light.png) top/1440px 580px no-repeat; z-index:2; pointer-events:none; inset:0`. **This image is referenced by CSS but never requested in the network log and is absent from the capture** — see ASSETS.md.
- `::after` — the two vertical frame rails, `z-index:-1`:
```css
--gradient-spread:20%;
background:
  linear-gradient(to bottom, transparent 0%, #bad7f71f var(--gradient-spread), #bad7f71f calc(100% - var(--gradient-spread)), transparent),
  linear-gradient(to bottom, transparent 0%, #bad7f71f var(--gradient-spread), #bad7f71f calc(100% - var(--gradient-spread)), transparent);
background-position:0 0, 100% 0; background-repeat:no-repeat; background-size:1px 100%, 1px 100%;
```
- `.customui__overlay` — `z-index:3; pointer-events:none; inset:0; background:radial-gradient(50% 50%, #4b71fa1f 0%, #05050b00 100%)`. Measured 1040x1248.

**Header** — `.customui__header` is an `.outline-box.-dots` 1040x260 (`height:260px`), with `::after`
drawing top+bottom rails (`--gradient-spread:200px`, bled `left/right:-100px`, `background-size:100% 1px`).
Inside, `.customui__header-content{display:flex; flex-direction:column; align-items:center; gap:16px}`
measured 1028x137 at y=2516: eyebrow gradient span 14px/20px "**Shine bright**"; `h2` `.text-gradient`
aeonik 44px w500 "Your brand. Your style." at y=2552; muted `p` 16px/24px `rgba(199,211,234,.64)` at
y=2623, ~78 chars.

**Browser frame** — `.browser.customui__browser`, `margin:8px` (**24px ≥640px**):
```css
display:grid; grid-template-rows:36px 1fr; min-height:700px; border-radius:12px; position:relative;
background: radial-gradient(107.55% 100% at 50% 0, #bacff70a 0%, #06060e00 100%), #06060e66;
box-shadow: inset 0 1px 1px #d8ecf833, inset 0 24px 48px #a8d8f50f, inset 0 0 0 1px #c7d3ea14;
```
Measured 992x700 at x=144 (1280); 976x700 (1024); 704x700 (768); 358x1087 (390). Rows computed `36px 664px`.
`.browser__header` — the three traffic-light dots are pure background:
```css
--dot-color:#bacff71f; --dot-size:8px;
background-image:
  radial-gradient(var(--dot-size) circle at 16px 50%, var(--dot-color) 50%, transparent 51%),
  radial-gradient(var(--dot-size) circle at 32px 50%, var(--dot-color) 50%, transparent 51%),
  radial-gradient(var(--dot-size) circle at 48px 50%, var(--dot-color) 50%, transparent 51%);
background-color:#bacff705; background-repeat:no-repeat; border-bottom:1px solid #bacff714;
```
`.browser__content{display:flex; flex-wrap:wrap; justify-content:flex-start; gap:16px; position:relative}`,
`≥640px{flex-wrap:nowrap; justify-content:center}`. Measured 992x664 / 358x1051 (390, wrapped).
`.customui__card-outline` — `border:1px solid #bad7f71f; border-radius:24px; inset:8px` (**24px ≥640px**), `z-index:-1`.
There is also a `<canvas>` (300x150 default size) inside `.browser__content` — a second particle/noise
field. Same caveat as the hero canvas: **draw loop not decompiled**.

**The live preview card** — `.customui__card-container` is an `.outline-box.-lines.-dots`:
`padding:16px !important; width:100%; height:fit-content; justify-self:center`; `::before` hidden below 640px;
**≥640px → `width:434px; padding:32px !important; place-self:center`**. Measured 434x564 at 1280/1024/768
(x=295 / 167) and 358x532 at 390. It holds a full login card: 32x32 logo from the `logos.*.svg` sprite,
title 16px/24px w500 `#c7d3ea` ("Sign in to SuperApp"), labels "Email" and "Password" (14px/20px w500 `#fff`),
two inputs, a **solid** `.button-solid` "Continue" (14px/32px w500, `#fff` text on `var(--brand-color)`),
`.between-lines-solid` "OR", `.button-outline` "Continue with Google", then muted footer + `.link` "Sign up".

**Four control widgets** — each an `.outline-box.-lines.-dots` with a 12px/16px muted label.
Desktop (≥640px) they are `position:absolute !important; display:grid` around the card; below 640px they
become `position:relative` with negative margins so they bleed. Measured absolute placements:

| Widget | label | ≥640px position | <640px |
|---|---|---|---|
| `.customui_colors` | "Colour" | `top:90px; left:70px` | `margin-left:16px` |
| `.customui_logos` | "Logo icon" | `top:185px; right:25px; width:fit-content` | `left:28px` |
| `.customui_radii` | "Radius" | `top:360px; left:90px` | `width:144px; top:-24px; left:-16px` |
| `.customui_appearance` (static img) | — | `top:220px; left:-80px` | `opacity:.75; margin-top:-30px; margin-left:-300px; left:260px` |
| `.customui_link-color` (static img) | — | `top:530px; left:30px` | `opacity:.75; margin-top:-180px; margin-left:-300px; left:210px` |
| `.customui_button-color` (static img) | — | `top:80px; right:-80px` | `opacity:.75; margin-top:-100px; margin-bottom:-60px; margin-left:140px` |
| `.customui_page-bg` (static img) | — | `top:400px; right:20px` | `opacity:.75; margin-left:-140px` |
| `.customui_favicon` (static img) | — | `top:510px; right:-65px` | `opacity:.75; margin-top:-44px; margin-left:-120px` |

The last five are **non-interactive decorative PNG screenshots** at `opacity:.75` (displayed sizes:
appearance 279x142, link-color 252x126, button-color 208x126, page-bg 252x126, favicon 304x155).

**Interactive pickers Build must reimplement** (12 buttons total, measured):

*Colour picker* — `.color-picker__content{display:flex; flex-direction:column; gap:8px}`,
`.color-picker__colors{display:flex; flex-direction:column; justify-content:space-around; align-items:center; gap:28px; margin-block:5px}`,
`≥640px{flex-direction:row; align-items:flex-start; gap:6px; margin-top:0}`.
Swatches: `width:24px` (**16px ≥640px**) `height:16px; border-radius:2px; background:var(--color-swatch);`
`box-shadow:inset 0 0 0 1px #ffffff1a; transition:box-shadow .2s ease-out`; `::before{inset:-10px}` hit area;
`:hover{box-shadow:inset 0 0 0 1px #fff3}`; `--active{outline:1px solid #fff3; outline-offset:3px}`;
`:focus-visible{box-shadow:inset 0 0 0 1px #ffffff1a, 0 0 0 2px color-mix(in srgb, var(--color-swatch), transparent 50%)}`.
Measured swatch values in order: **`#E46D4C`, `#663AF3` (active by default), `#027DEA`, `#269684`**.
Selecting sets `--brand-color` on the card (the default `.button-solid` fallback is `#6a38ff`).

*Radius picker* — `.border-radius__items{display:grid; grid-template-rows:repeat(2,12px); grid-template-columns:1fr 1fr; gap:20px; margin-bottom:5px; padding-inline:4px}`.
Item: `border-radius:calc(var(--border-radius)/2); background:#bbd7f73d; width/height:100%; transition:background .2s ease-out;`
`:hover{#bbd7f74d}`; `--active{background:#bbd7f7; outline:1px solid #fff3; outline-offset:3px}` (hover keeps `#bbd7f7`);
`:focus-visible{background:#bbd7f780; box-shadow:0 0 0 2px #bbd7f724}`; `::before{inset:-10px}`.
Measured `--border-radius` values: **`0px`, `3px` (active by default), `6px`, `9999px`**.
Selecting sets `--brand-radius` on the card (default `6px`).

*Logo picker* — `.logo-picker__items{display:grid; grid-template-rows:repeat(2,60px); grid-template-columns:repeat(2,90px); gap:8px}`.
Item: `background:#bad6f708; border-radius:6px; display:inline-flex; justify-content:center; align-items:center;`
`box-shadow:inset 0 0 0 1px #bad6f70f; transition:background .2s ease-out, box-shadow .2s ease-out`;
`:hover{box-shadow:inset 0 0 0 1px #bad6f73d}`; `--active{background:#bad7f71f; box-shadow:inset 0 0 0 1px #bad6f73d}`;
`:focus-visible{background:#bad6f712; outline:2px solid #bad6f726; outline-offset:1px}`; `::before{inset:-10px}`.
Images are a **horizontal sprite**: `.logo-picker__image{--size:32px; width:32px; height:32px; object-position:calc(var(--size) * var(--i) * -1) 0}`
with `--i` = 0 (active), 1, 2, 3. Same technique on `.customui__logo` inside the card.
`.customui__logo-container{background:#bad6f708; border-radius:12px; padding:8px; box-shadow:inset 0 1px 1px #c7d3ea1f, inset 0 24px 48px #c7d3ea0d, inset 0 0 0 1px #bad7f71f}`.

**Desktop-only connector rails** (`≥640px`, `.customui__browser::after`, `--gradient-spread:100px`, `z-index:-1`) —
four 1px rails positioned `0 calc(50% - 264px)`, `0 calc(50% + 300px)`, `calc(50% - 217px) 0`, `calc(50% + 217px) 0`
with sizes `100% 1px, 100% 1px, 1px 100%, 1px 100%` and the same transparent→`#bad7f71f`→transparent ramp.

### 2.5 Radix (`.radix`)

```css
max-width:1440px; margin:0 auto; padding:120px 0 257px; position:relative; content-visibility:auto;
/* ::before */ z-index:10000; pointer-events:none; inset:0;
background:radial-gradient(50% 50%, #4b71fa29 0%, #05050b00 100%);
@media (max-width:1199px){ padding:100px 0 200px }
```
`.radix .section-header{margin-bottom:100px; padding-inline:16px}` (**32px ≤1199px**),
`.radix .section-header-description{max-width:420px}`.
Measured header 665x202 at y=3703: eyebrow 352x20 "**Framework freedom**"; `h3` 633x102 (44px/51px, 2 spans
desktop / 4 spans mobile) at y=3739; description 420x48 at y=3857 (~101 chars).

`.radix-background` — 1280x377 img, `display:none` at `max-width:1199px` (confirmed none at 1024/768/390).
A 300x150 `<canvas>` also sits directly in `.radix` (third particle field; loop not decompiled).

`.radix-main{display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative}`.
Holds an art-directed `<picture>` (`.radix-kit`, measured 1177x399):
`(min-width:1200px)` → `boxes.141~zkq1b1q3-.png` @ width 1200/3840 q90; `(max-width:1199px)` → `boxes-mobile.0_l0.d19dssg8.png` @ 1080/1920 q90.

`.radix-logo` — `position:absolute; width:560px; height:833px; top:-150px; left:calc(50% - 280px); pointer-events:none`;
`≤1199px → width:420px; height:624.75px; top:-70px; left:calc(50% - 210px)` (measured x=302/174/-15 at 1024/768/390).
Three stacked layers, each `position:absolute; inset:0`: `.radix-logo-stroke` (`stroke.*.png`),
`.radix-logo-main` (`z-index:11`, `main.*.png`), `.radix-logo-blender` (`z-index:13`, `blender.*.png`) —
all three displayed 560x833, `alt="Radix logo stroke"`.
`.radix-logo-lines` (`z-index:15; position:absolute; inset:0`) — three `.radix-logo-lines-item`,
`mask-image:var(--mask-image); mask-size:cover; position:absolute; inset:0`
(masks `stroke-mask-1/2/3.png`). Each contains a 1000x1000 div, `animation:10s linear infinite radix-logo-lines`
→ `to{transform:rotate(-1turn)}` (**counter-clockwise**), with:
```css
:nth-child(1) div { background-image:conic-gradient(from 180deg, #0000 0deg,  #bad7f7 1deg,  #0000 90deg);  top:-275px; left:-300px }
:nth-child(2) div { background-image:conic-gradient(from 180deg, #0000 60deg, #bad7f7 61deg, #0000 150deg); top:-275px; left:-125px }
:nth-child(3) div { background-image:conic-gradient(from 180deg, #0000 80deg, #bad7f7 81deg, #0000 170deg); top:0;      left:-275px }
```
The wrapper carries an inline `style="opacity:1; transform:translateY(100px)"` — set by JS, so this layer
has a scroll/mount reveal from `translateY` offset. **The pre-reveal value is not in the CSS and I could
not read the JS**; treat as fade+rise into `translateY(100px)`.

`.radix-border-overlay` — bottom slab, `position:absolute; bottom:0; left:0; width:100%; height:236px`
(**179px ≤1199px**), `z-index:100`, `backdrop-filter:blur(6px)`,
`background:radial-gradient(50% 100% at 50% 0, #4b71fa0a 0%, #05050b00 100%), #05060f33`,
`box-shadow:0 -12px 32px #0203113d`. Its `::before` is a 1200x1px top rule,
`background:linear-gradient(90deg, #bacff700 0%, #bacff729 25% 75%, #bacff700 100%)`,
`top:0; left:50%; transform:translateX(-50%); z-index:1`.
Inside it sits a `.between-lines-solid` wrapper 1280x36 at y=3770 holding a `.glowing-button` (medium)
labelled **"Learn more about Radix"**, linking `https://radix-ui.com` (`target=_blank`).

### 2.6 Security (`.security`)

```css
max-width:1076px; margin:0 auto; padding:80px 16px; position:relative; content-visibility:auto;
@media (min-width:940px){ padding:120px 16px }
/* ::before */ z-index:10; pointer-events:none; inset:0;
background: radial-gradient(50% 38.81% at 50% 61.19%, #4b71fa14 0%, #05050b00 100%),
            radial-gradient(50% 36.46% at 50% 36.46%, #4b71fa14 0%, #05050b00 100%);
```
`.security .section-header{margin-bottom:56px}`, description `max-width:630px`, `span{display:block}`,
`.section-header-title-h3 :last-child{padding-top:8px}`.
Measured header 630x210 at y=4081: eyebrow 342x20 "**Advanced security**"; `h3` 500x110 at y=4117;
description 630x48 at y=4243 (~98 chars).

`.security-cards{display:flex; flex-wrap:wrap; justify-content:center; gap:8px}` — measured 1044x492 at
1280 and 992x492 at 1024, i.e. **3 + 2 rows of 320px cards** (`(320*3)+(8*2)=976`). At 768/390 it
stacks to one column of 320px. 5 cards.

```css
.security-card{
  width:100%; max-width:320px; height:242px; border-radius:16px;
  background:#bad6f703; display:flex; flex-direction:column; justify-content:flex-end;
  position:relative; isolation:isolate; overflow:hidden }
.security-card::before{ border:1px solid var(--blue-6); border-radius:inherit;
  width:calc(100% - 2px); height:calc(100% - 2px); top:0; left:0; pointer-events:none }
.security-card::after{ border-radius:inherit; inset:0; pointer-events:none;
  box-shadow:inset 0 1px 1px #c7d3ea1f, inset 0 24px 48px #c7d3ea0d }
.security-card-label{ width:100%; text-align:center; padding-bottom:24px;
  color:var(--body-normal); font:400 16px/24px }
.security-card-animation > *{ position:absolute; inset:0; z-index:-1 }
```
Each card has a 320x242 background PNG. Labels (measured, 16px/24px `rgba(200,212,234,.78)`):
**Leaked password protection · Role-Based Access Control · Password strength validation ·
Automatic spam and bot detection · Multi-Factor Authentication**.

Card animations — all driven by `-active` classes (same IntersectionObserver-arms-then-timer pattern as
the dashboard; same caveat about exact sequencing):

**1. Leaked password protection**
- `.security-leaked-border` 232x88, `radius 18px`, `top:49; left:44`, `box-shadow:0 0 16px #babcf752, inset 0 1px .5px #bad6f70f`, `opacity:0 → 1` on `-active`, `transition:opacity .8s cubic-bezier(.6,.6,0,1)`. `::before` is a 1px masked ring, `background:linear-gradient(#bad6f700 0% 100%), linear-gradient(#8ebbff 0%, #bedefc 100%)`.
- `.security-leaked-line` 208x64 at `top:61; left:56`, `radius 6px`, 1px masked ring; inner 300x300 div `background:conic-gradient(at 50% 51.35%, #b9d7f300 0deg 289.4deg, #b9d7f3 318.05deg 360deg), conic-gradient(from 180deg at 50% 51.35%, #b9d7f300 0deg 287.46deg, #b9d7f3 325.02deg 360deg)`, `animation:10s linear infinite security-leaked-line` → `to{translate(-50%,-50%) rotate(360deg)}`.
- `.security-leaked-text` img 175x21 at `top:83; left:50%; translateX(-50%)`, `opacity .3 → 1`, `transition:opacity .45s cubic-bezier(.6,.6,0,1)`.
- `.security-leaked-check` 48x48 at `top:69; left:136`, four 43x43 `alt="check piece"` imgs, each `opacity:0; transform:scale(.9)` → `opacity:1; scale(1)` with `transition:transform .6s cubic-bezier(.6,.6,0,1), opacity .6s cubic-bezier(.6,.6,0,1)` and **explicit per-piece delays: child1 .3s, child2 .1s, child3 0s, child4 .2s**.
- `.security-leaked-radar` 208x64 at `top:61; left:56`, `overflow:hidden; isolation:isolate`; two 150x64 `.security-leaked-radar-item` at `opacity:.3`, first `left:-150px` with `background:linear-gradient(90deg, #bad6f700 0, #bad6f77a 25%, #bad6f700 25.1%)`, second `right:-150px` with the `270deg` mirror. On `-active`: `transition:transform 3s cubic-bezier(.6,.6,0,1)`, first `translate(358px)`, second `translate(-358px)`.

**2. Role-Based Access Control** — `.security-rbac{display:flex; justify-content:center; align-items:center; padding-bottom:32px}`.
- `.security-rbac__card-reader` 100x144 (`card-reader@3x.png`).
- `.security-rbac__display` — the dot-matrix readout, 15px, `font-family:var(--font-dot-digital)`, `letter-spacing:1.5px`, `font-variant-numeric:tabular-nums` / `font-feature-settings:"tnum"`, `color:#b6d9fc`, `text-shadow:0 0 4px #bbd0f7`, `opacity:.4`, `text-align:center`, `white-space:nowrap`, `width:100%; padding-left:4px; position:absolute; top:25px`. Measured content: **"VIEWER"** (cycles through role names in JS; the full role list is in the bundle — **not measured**).
- `.security-rbac__buttons{display:grid; grid-template-columns:repeat(2,1fr); gap:6px; place-items:center; position:absolute; bottom:16px; left:20px}` with four 28x28 `button@3x.png` images; `.security-rbac__button-shape{color:#bbd0f7; filter:drop-shadow(0 0 4px #bbd0f7); opacity:.4; top:50%; left:50%; translate(-50%,-50%)}`.
- `.security-rbac__card-container{position:absolute; inset:0; mask-image:linear-gradient(90deg, #000, #000 50%, transparent)}`; a `.anim2` state swaps the mask to `linear-gradient(90deg, transparent, #000 20% 50%, transparent)` — so there are **two card-swipe variants**.
- `.security-rbac__card` 124x78 (`card@3x.png`) at `top:65px; transform:translateX(-100%)` (slides in from the left).
- `.security-rbac__card-light` 150x186 (`card-light@3x.png`), `z-index:1; opacity:0; top:8px; left:-37px`.
- `.security-rbac__dots` — a `<canvas>`-backed dot field, `width:40%; height:150%; top:7%; left:15%; transform-origin:0 0; transform:scale(.5); opacity:0; mask-image:radial-gradient(farthest-side at 100%, #000, transparent)`.

**3. Password strength validation**
- `.security-password-border` 232x108, `radius 18px`, `top:38; left:44`, `opacity:0 → 1`, `transition:opacity .45s cubic-bezier(.6,.6,0,1)`, `box-shadow:0 0 16px #c8fdd752, inset 0 1px .5px #bad6f70f`; 1px masked ring `linear-gradient(#c9ffd5 0%, #caf1fd 100%)`.
- `.security-password-text` 208x64 at `top:50; left:56`, `mask-image:linear-gradient(transparent, #fff, transparent)`; its img scrolls by **step**: `transform:translateY(calc(22px + var(--step) * -28px))`, `transition:transform .45s cubic-bezier(.6,.6,0,1)` — so a 28px row height, `--step` incremented from JS.
- `.security-password-bars{display:flex; gap:16px; top:126px; left:60px; z-index:1}` — 38x4 items; inner div `width:0% → 100%`, `opacity:0 → 1`, `background:linear-gradient(90deg, #fe90be 0%, #ff9595 100%)`, `border-radius:99px`, `box-shadow:0 0 6px #ff9a8c52`, `transition:width 1s cubic-bezier(.6,.6,0,1), opacity 1s cubic-bezier(.6,.6,0,1)`. Strength tiers swap colour via overlay pseudo-elements (`transition:opacity 1s cubic-bezier(.6,.6,0,1)`): `::before` orange `linear-gradient(90deg, #fdd6ca 0%, #fff0c9 100%)` shown under `.security-password-bars-orange` (glow `0 0 6px #ffd18c52`); `::after` green `linear-gradient(90deg, #caf1fd 0%, #c9ffd5 100%)` under `.security-password-bars-green` (glow `0 0 6px #c8fdd752`).

**4. Automatic spam and bot detection**
- `.security-automatic-radar` img 367x367 at `top:-146px; left:14px`, `animation:40s linear infinite security-automatic-radar` → `to{rotate(1turn)}`.
- `.security-automatic-dots` — five 14x14 dots, `border-radius:50%`, `background:linear-gradient(#ed98ef33, #fde9ca33)`, `box-shadow:0 0 12px #ed98ef52`, with `::before{inset:4px; background:linear-gradient(#ed98ef, #fde9ca)}`. Positions: (1) `top:16; right:34`, (2) `top:61; right:96`, (3) `top:93; left:127`, (4) `top:44; left:105`, (5) `top:27; left:39`. Each runs its own `40s linear infinite` keyframe so a dot lights only while the radar sweep passes it — **verbatim**:
```css
@keyframes dot-animation-1 { 0%,8.05556%,28.0556%,to{opacity:0}  8.25556%,27.8556%{opacity:1} }
@keyframes dot-animation-2 { 0%,19.1667%,39.1667%,to{opacity:0} 19.4167%,38.9167%{opacity:1} }
@keyframes dot-animation-3 { 0%,33.8889%,53.8889%,to{opacity:0} 34.1389%,53.6389%{opacity:1} }
@keyframes dot-animation-4 { 0%,42.2222%,62.2222%,to{opacity:0} 42.4722%,61.9722%{opacity:1} }
@keyframes dot-animation-5 { 0%,50.2778%,70.2778%,to{opacity:0} 50.5278%,70.0278%{opacity:1} }
```

**5. Multi-Factor Authentication**
- `.security-multi-box` 220x70 at `top:52; left:50`.
- `.security-multi-box-inputs{display:flex; gap:6px; top:11px; left:11px; z-index:1}` — six 28x48 pill cells, `border-radius:999px`, `display:flex; justify-content:center; align-items:center`, `transition:box-shadow .45s cubic-bezier(.6,.6,0,1)`, active `box-shadow:inset 0 -6px 12px #c7d3ea0d, inset 0 1px 1px #c7d3ea1f` (inactive: both shadows at `…00`). `::before` is a 1px masked ring `linear-gradient(#8ebbff 0%, #bedefc 100%), linear-gradient(#bad7f71f, #bad7f71f)`, `transition:opacity .45s cubic-bezier(.6,.6,0,1)`, hidden unless `-active`. Inner 6x6 dot `background:linear-gradient(#8ebbff 0%, #bedefc 100%); border-radius:50%; box-shadow:0 0 12px #bacff7b8, inset 0 1px .5px #bad6f70f`, hidden unless `-filled`. So two independent per-cell states: **`-active`** (focus ring) and **`-filled`** (digit entered), advanced one cell at a time.

### 2.7 Complete / "one platform" (`.complete`)

```css
display:flex; flex-direction:column; align-items:center; margin:0 auto;
padding-top:148px; padding-bottom:154px; padding-inline:16px; position:relative; content-visibility:auto;
@media (max-width:1199px){ padding-top:88px; padding-bottom:78px }
```
`.complete .section-header-description{max-width:560px}`. Measured header 560x212 at y=4350:
eyebrow 364x20 "**Future-proof your app**"; `h2` `.section-header-title-h2` 426x112 at y=4386
(**48px/56px** w500 aeonik, 2 spans); description 560x48 at y=4514 (~155 chars, 2 lines).

`.complete-inner` — `position:absolute; top:0; width/min-width:1440px; height/min-height:1072px; margin:0 auto 500px`.
Measured 1440x1072 at y=4202. `::before` is the ambient wash (`z-index:10000`):
`radial-gradient(50% 38.81% at 50% 61.19%, #4b71fa0f 0%, #05050b00 100%), radial-gradient(50% 36.46% at 50% 36.46%, #4b71fa1f 0%, #05050b00 100%)`;
at `max-width:1199px` → the `100.31%/94.23%` variant, `width:100vw; height:1008px; left:50%; transform:translateX(-50%)`.
Background img 1440x1072 (`background.0pk~i5z-okdcd.png`, `alt="Complete background"`, srcset to 3840w q100).

**`.complete-line`** — the big rotating halo, `position:absolute; top:426.5px; left:376px`,
`mask-image:var(--mask-image); mask-size:cover` (`line-mask.0-nvhf.svz5yv.png`, inline `width:689.5px; height:349.5px`).
Measured 690x350. Inner 800x800 div:
```css
background:
  conic-gradient(at 50.12%, #9ac2ef00 0deg,   #9ac2ef80 60deg,  #9ac2ef00 60.1deg),
  conic-gradient(at 50.12%, #9ac2ef00 190deg, #9ac2ef80 250deg, #9ac2ef00 250.1deg),
  #bbd7f70f;
animation:30s linear infinite complete-line;   /* to{ translate(-50%,-50%) rotate(1turn) } */
position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
```

**Five `.complete-badge` chips** — `font:400 12px/16px; color:#d1e4fa; background:#05060f; border-radius:6px;`
`padding:4px 8px; position:absolute; text-shadow:0 -4px 6px #d1e4fa40;`
`box-shadow:inset -.5px .5px 1px #c7d3ea1f, inset 0 0 96px #bad7f714`; `::before` 1px `--blue-6` inner border
(`width/height:calc(100% - 2px)`). Positions (desktop → `max-width:1199px`):
1 `top:416; left:525` → `left:561`; 2 `top:416; right:541` → `right:595`; 3 `top:765; left:480` → `left:548`;
4 `top:765; left:669` → `left:675`; 5 `top:765; right:488` → `right:554`.
Labels: **Email & Password · Social Login · Multi-Factor Auth · Single Sign-On · Directory Sync**.

**Five node animations inside the halo:**
- `.complete-user` at `top:517; left:512` (measured 34x50). `.complete-user-row{display:flex; align-items:flex-end; gap:26px; height:20px}`, non-last `margin-bottom:10px`. `.complete-user-progress{width:4px; background:#bacff7; border-radius:2px; box-shadow:0 0 6px #bacff752; transition:height .45s cubic-bezier(.6,.6,0,1)}` (heights from JS). `.complete-user-dots{display:flex; gap:12px; margin-bottom:8px}` of 4x4 dots, same fill/shadow.
- `.complete-social` at `top:513; left:812`, `display:flex; flex-wrap:wrap; gap:0 2px; width:100px` (measured 100x63). Six 28x33 shape imgs (`square`, `circle`, `square`, `circle`, `triangle`, `circle`), `nth-child(n+4){margin-top:-3px}`. Each: `opacity:0; animation:5s cubic-bezier(.6,.6,0,1) infinite complete-social-breath` → `@keyframes{0%,40%{opacity:0} 20%{opacity:1}}`, with **measured per-child delays: 0, 3s, 3.75s, 1.5s, .75s, 2.25s** (i.e. a 0.75s step applied in a scrambled order — copy the list verbatim).
- `.complete-multi` at `top:657; left:483`, `z-index:1` (measured 109x4). `.complete-multi-dots{display:flex; gap:17px}` of six 4x4 dots. `.complete-multi-line` at `top:-16.5; left:-11.5`, `mask-image` = `line-mask.0o3jjq0y4am.u.png` (inline 133.5x37.5). `::before` 120x120, `background:conic-gradient(from 5deg, #0000 280deg, #98c0ef 360deg, #0000 361deg)`, `animation:5s linear infinite complete-multi-border`:
```css
@keyframes complete-multi-border {
  0%       { transform:translate(-25%,-50%) rotate(225deg) }
  16.6667% { transform:translate(-25%,-50%) rotate(312.5deg) }
  50%      { transform:translate(25%,-50%)  rotate(360deg) }
  66.6667% { transform:translate(25%,-50%)  rotate(472.5deg) scaleY(1.5) }
  to       { transform:translate(-25%,-50%) rotate(585deg) }
}
```
- `.complete-single` at `top:643; left:653`, `z-index:1`. `.complete-single-lines{position:absolute}`, `:nth-child(2){transform:scaleX(-1) translate(-111%)}` (mirrored pair), inline `width:63.5px; height:47.5px`. `.complete-single-line{mask-image:var(--mask-image)` = `mask.040yws9fceoot.png`, `mask-size:cover; top:6px; left:9px}`, `:nth-child(2){filter:blur(10px)}` (a glow copy). `::before` 50x50, `background-image:linear-gradient(#98c0ef 0%, transparent 100%)`, `animation:10s cubic-bezier(.6,.6,0,1) infinite complete-single-line`:
```css
@keyframes complete-single-line {
  0%      { transform:translate(50px,50px)     rotate(-45deg) }
  60%,to  { transform:translate(-200px,-200px) rotate(-45deg) }
}
```
`.complete-single-overlay` img 137x62 at `top:-2; left:-2`.
- `.complete-directory` at `top:637; left:858`, 89x49, `border-radius:44px`, `padding:1px`, 1px masked ring, `z-index:1` (measured 89x49). `::before` 100x100 `background:conic-gradient(from 5deg, #0000 280deg, #98c0ef 360deg, #0000 361deg)`, `animation:5s linear infinite complete-directory` → `to{translate(-50%,-50%) rotate(1turn)}`.

`.complete-button{margin:530px auto 0 !important; display:block !important}` — a `.glowing-button` (medium),
measured 329x36 at y=5092, label **"Learn more about WorkOS User Management"**, href `https://workos.com/user-management` (`target=_blank`).

### 2.8 Testimonials (`.testimonials`)

```css
max-width:1200px; margin:0 auto; padding-block:80px; padding-inline:16px; position:relative; content-visibility:auto;
@media (min-width:640px){ padding-block:160px 80px }
```
Measured 1200-wide at 1280; 160/80 padding at 1024 and 768; **80/80 at 390** (the 640px query means 390 gets
the 80px top — confirmed measured).

`.testimonials-list{display:flex; max-width:996px; margin:0 auto; color:var(--body-loud); position:relative}`.
Measured 996x384 at 1280 (two 498px cells), 992x384 at 1024 (496px cells).
**At `max-width:996px` → `flex-direction:column; max-width:668px`** — measured 668x672 at 768 (two 668x336 cells)
and 358x792 at 390 (two 358x408 cells).

`.testimonials-list-item` — an `.outline-box.-dots` with
`width:50%; height:384px; padding:48px 40px !important; display:flex !important; flex-direction:column; align-items:unset !important`.
`≤996px → width:100%; height:auto; padding:32px 24px` (**note: the measured computed padding at 768/390 was
still `48px 40px` because the `!important` on the base rule wins over the media-query override — replicate the
measured 48/40, not the overridden value**).
Contents: a logo `svg` with `filter:drop-shadow(0 2px 16px #aecff23d); margin-bottom:56px`;
`.testimonials-list-item-content{flex:1; margin-bottom:32px; font:400 18px/24px; color:#c7d3ea}`;
`.testimonials-list-item-author{display:flex; align-items:center; gap:20px; font:400 14px/20px}` with a
40x40 `border-radius:50%` avatar, `-author-name` `#c7d3ea`, `-author-title` `var(--body-muted)`.
Quote bodies measured at ~168 and ~172 characters (3–4 rendered lines each). **Replace the quotes, names,
titles, company logos and headshots with your own — only the geometry above is reusable.**

`.testimonials-list-borders` — 5 absolutely-positioned 1px rules, `≥996px`:
children 1 & 2 `width:100%; height:1px; left:0`, `background:linear-gradient(90deg, #bacff700 0%, #bacff714 25% 75%, #bacff700 100%)`,
at `top:0` and `bottom:0`; children 3,4,5 `width:1px; height:100%; top:0`,
`background:linear-gradient(#bacff700 0%, #bacff714 25% 75%, #bacff700 100%)`, at `left:0`, `left:50%`, `right:0`.
At `max-width:996px`: children 1,2,3 become **486px-wide** horizontals at `top:0`, `top:50%`, `bottom:0`
(`left:50%; transform:translateX(-50%)`), and children 4,5 stay vertical at `left:0` / `right:0`.

### 2.9 CTA (`.cta`)

```css
max-width:1440px; margin:0 auto; padding-top:80px; padding-bottom:100px; padding-inline:16px;
position:relative; content-visibility:auto;
@media (min-width:640px){ padding-top:180px }
/* ::before ambient */ z-index:10000; pointer-events:none; inset:0;
background:radial-gradient(50% 50%, #4b71fa14 0%, #05050b00 100%);
/* ::after frame rails */ --gradient-spread:100px; opacity:.5; z-index:-1;
width:840px; height:800px; inset:100px 0 0 50%; transform:translateX(-50%);
background:<two vertical transparent→#bad7f71f→transparent ramps>; background-size:1px 100%, 1px 100%;
background-position:0 0, 100% 0;
```

**`.cta-header`** — `width:fit-content; margin-inline:auto; margin-bottom:32px` (**60px ≥640px**), `position:relative`.
Both pseudo-elements are rails at `inset:0`: `::after` horizontals (`--gradient-spread:700px`, bled
`left/right:-350px`, `background-size:100% 1px` at `0 0` and `0 100%`); `::before` verticals
(`--gradient-spread:200px`, `height:1200px` (**900px ≥640px**), `top:-100px`, `background-size:1px 100%`).
Inside: an `.outline-box.-dots` 455x115 (pad 32) holding `h3` `.text-gradient` aeonik 44px w400,
measured at y=4957: **"Start building today"**.

**`.cta-boxes`** — `display:flex; flex-direction:column; justify-content:center; align-items:center; gap:24px;`
`max-width:380px; margin-inline:auto; padding-inline:16px`; **`≥640px{flex-direction:row; max-width:940px}`**.
Measured 940x332 at 1280 (two 442x332), 736x255 at 768 (two 340x255), **358x611 column at 390** (326x293 each).

```css
.cta-box{
  --start-angle:0deg; aspect-ratio:2/1.8;            /* ≥640px → 2/1.5 */
  width:100%; border-radius:28px; backdrop-filter:blur(4px); background-color:#bacff705;
  display:flex; justify-content:center; align-items:flex-end; position:relative;
  box-shadow:inset 0 1px 1px #d8ecf833, inset 0 24px 48px #a8d8f50f;
  transition:background-color .45s cubic-bezier(.6,.6,0,1), box-shadow .45s cubic-bezier(.6,.6,0,1) }
.cta-box:last-child{ --start-angle:180deg }
.cta-box::before{ 1px masked ring; background:linear-gradient(#98c0ef3d 0%, #d8ecf800 100%), #bacff71f;
  transition:opacity .45s cubic-bezier(.6,.6,0,1) }
.cta-box::after{ 1px masked ring; --line-width:1px; --cta-angle:0deg; --line-color:#c2ccffb3;
  background:conic-gradient(from calc(var(--cta-angle) + var(--start-angle)), transparent 0%, var(--line-color) 40%, transparent 45%);
  opacity:.5; animation:cta-line-anim var(--duration,6s) linear infinite;
  transition:opacity .2s ease-in-out }
@property --cta-angle{ syntax:"<angle>"; inherits:false; initial-value:0deg }
@keyframes cta-line-anim{ to{ --cta-angle:360deg } }

.cta-box:hover{ background-color:#bacff70a;
  box-shadow:inset 0 1px 1px #d8ecf829, inset 0 32px 48px #a8d8f529 }
.cta-box:hover::before, .cta-box:hover::after{ opacity:1 }
.cta-box:hover .section-header-title{ text-shadow:0 2px 16px #aecff27a }   /* base .45s cubic-bezier(.6,.6,0,1) */
.cta-box:active{ background-color:#bacff703; transition:all .2s ease-out;
  box-shadow:inset 0 1px 1px #d8ecf833, inset 0 5px 60px #000c, inset 0 32px 48px #a8d8f514 }
.cta-box:active > img, .cta-box:active > .section-header{ transform:translateY(2px); transition:all .2s ease-out }
.cta-box:active::before{ opacity:.5 }
.cta-box:focus-visible{ outline:2px solid #c2ccff33; outline-offset:2px }
.cta-box .section-header{ margin-bottom:32px }
.cta-box-dots{ position:absolute; inset:26px; display:block }
.cta-box-dots span{ width:3px; height:3px; border-radius:50%; background-color:#d1e4fa;
  filter:drop-shadow(0 0 8px #bacff712); position:absolute }
/* corners: 1 top/left:0; 2 top:0,right:0; 3 bottom:0,left:0; 4 bottom:0,right:0 */
```
Each box is an `<a>` with a 442x332 illustration img and a `.section-header` whose title is
`.section-header-title-h4/h6` (aeonik **28px/32px** w500) plus a 16px/24px description:
1. "Use hosted AuthKit" / "The fastest way to launch." → `https://workos.com/docs/user-management`
2. "View code on GitHub" / "Host your own frontend." → `https://github.com/workos/authkit`

**`.cta-actions`** — an `.outline-box.-dots`, `display:flex; justify-content:center; gap:12px;`
`width:100%; max-width:450px; margin-inline:auto; margin-top:32px; padding:32px !important; position:relative`;
`≥640px{width:455px; margin-top:64px}`. `::after` draws horizontals (`--gradient-spread:400px`, bled
`left/right:-200px`, `background-size:100% 1px` at `0 0` and `0 100%`). Measured 450x100 at 1280/1024/768,
358x100 at 390.
Contains a `.glowing-button` (medium) 178x36 at y=5527, label **"Follow @AuthKit on 𝕏"** (text + inline X
glyph/svg), href `https://x.com/authkit` (**same tab — no `target`**).
`.cta-action` (a secondary chip style present in CSS):
```css
background:var(--gradient-background-6); backdrop-filter:blur(4px); color:#d1e4fa;
border-radius:999px; display:flex; align-items:center; gap:6px; padding:6px 8px; position:relative;
box-shadow:inset 0 4px 12px #d8ecf81a, inset 0 1px 1px #d8ecf833;
transition:box-shadow .45s cubic-bezier(.6,.6,0,1);
:hover{ box-shadow:inset 0 4px 12px #d8ecf833, inset 0 1px 1px #d8ecf84d }
::before{ 1px masked ring; background:var(--gradient-background-6) }
span{ font-size:14px; line-height:20px }
```

---

## 3. Motion reference — complete table

Every value below is read from the stylesheet or measured computed style. Defaults are called out where
the original omits a timing function (CSS default `ease`) or a fill mode.

### 3.1 The two shared "glow" primitives

**`.glowing-button`** (used 5x: hero Get-started, radix, complete, cta, github icon)
```css
--line-width:1px; --line-color:#c2ccff; --line-opacity:1; --duration:6s; --easing:linear;
height:32px; border-radius:999px; display:inline-flex; justify-content:center; align-items:center;
font:400 14px; white-space:nowrap; backdrop-filter:blur(4px); position:relative;
background:radial-gradient(31.2% 40.91% at 50% 151.14%, #bad6f714 0%, #bad6f700 100%), #bad6f70f;
box-shadow:inset 0 0 0 1px #bad7f71f;
transition:all .2s ease-out, outline, outline-offset;
/* size-medium (the only size used on this page): */
--line-opacity:.2; --duration:16s; height:36px; padding-inline:16px; font-size:14px; line-height:36px;
/* size-large (unused here): height:44px; padding-inline:32px; font-size:18px; line-height:44px */
```
Measured computed background at 1280: `radial-gradient(31.2% 40.91% at 50% 151.14%, rgba(186,214,247,0.08) 0%, rgba(186,214,247,0) 100%)` over `rgba(186,214,247,0.06)`; `box-shadow: rgba(186,215,247,0.12) 0 0 0 1px inset`; `backdrop-filter: blur(4px)`.

```css
/* travelling sparkle layer */
::before{ inset:2px; z-index:10; opacity:.5; transition:opacity 1s ease-out; pointer-events:none;
  background:conic-gradient(from var(--angle), transparent 0%, var(--line-color) 40%, transparent 40%);
  mask-image:radial-gradient(#fff 3%, transparent 3%), radial-gradient(#ffffff80 3%, transparent 3%);
  mask-position:0 0, 15px 15px; mask-size:30px 30px; mask-repeat:repeat;
  animation: line-anim var(--duration,6s) infinite,          /* measured: 16s infinite, NO easing → ease */
             sky-anim  2s var(--easing) infinite; }          /* measured: 2s linear infinite */
@keyframes line-anim { to { --angle:360deg } }
@keyframes sky-anim  { to { mask-position:0 -15px, 15px -45px } }
@property --angle{ syntax:"<angle>"; inherits:false; initial-value:0deg }

/* bottom bloom, hover only */
::after{ inset:0; z-index:10; opacity:0; mix-blend-mode:hard-light; transition:opacity 1s ease-out;
  background:radial-gradient(farthest-side at 50% 100%, var(--line-color), transparent) }
:hover::after{ opacity:min(calc(var(--line-opacity) * .75), .5) }   /* medium → min(.15,.5)=.15 */
:hover::before{ opacity:var(--line-opacity) }                       /* medium → .2 */
:focus-visible{ outline:2px solid #c2ccff4d }

/* the rotating border ring */
.effect{ inset:0; border-radius:inherit; filter:drop-shadow(0 0 5px var(--line-color)) }
.effect::before, .effect::after{
  padding:var(--line-width);
  background:conic-gradient(from var(--angle), transparent 0%, var(--line-color) 40%, transparent 45%);
  mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite:exclude;
  animation:line-anim var(--duration,6s) var(--easing) infinite;    /* medium → 16s linear infinite */
  opacity:var(--line-opacity,1) }
.effect::before{ filter:blur(8px); mask:none; opacity:max(calc(var(--line-opacity)*.1), .05) }  /* medium → .05 */

/* label */
.text{ display:inline-flex; align-items:center; gap:6px; color:#d1e4fa;
  background:linear-gradient(#98c0ef 0%, #d8ecf8 100%); background-clip:text; -webkit-text-fill-color:transparent }
```
**Hover summary for every glowing button:** sparkle `::before` opacity `.5 → .2` and bloom `::after`
`0 → .15`, both over **1s ease-out**; plus the container's own `all .2s ease-out`. (Note the sparkle
actually *dims* on hover at medium size, because `--line-opacity` is `.2` — that is correct, not a bug.)

**`.card-animated`** (the login-card border chase; `--line-color:#adbbff`, `--easing:linear`)
```css
.effect{ inset:0; border-radius:inherit; filter:drop-shadow(0 0 10px var(--line-color)) }
.effect::before{ padding:var(--line-width,1px);
  background:conic-gradient(from calc(var(--angle) + var(--start-angle)), transparent 0%, var(--line-color) 20%, transparent 25%);
  mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite:exclude }

/* loop variant */
.card-animated-loop .effect, .card-animated-loop .effect::before{
  opacity:.5;
  animation: line-anim 12s linear infinite, line-opacity-loop 3s linear infinite }
/* intermittent variant */
.card-animated-intermittent .effect, .card-animated-intermittent .effect::before{
  opacity:0;
  animation: line-anim 8s linear infinite, line-opacity 4s linear var(--delay) }  /* no fill-mode */

@keyframes line-anim          { to { --angle:360deg } }
@keyframes line-opacity       { 0%{opacity:0} 20%,70%{opacity:1} to{opacity:0} }
@keyframes line-opacity-loop  { 0%{opacity:.75} 50%{opacity:1} to{opacity:.75} }
```
`--start-angle` and `--delay` are set per card instance inline.

### 3.2 Continuous loops (always running, no trigger)

| What | duration | easing | iteration | keyframe |
|---|---|---|---|---|
| spotlight opacity x3 | 6s / 9.6s / 13.6s | linear | infinite **alternate** | `.6 → .5 → .6` |
| spotlight scale x3 | 8.5s / 13.6s / 6.8s | **none → `ease`** | infinite, `both` | rotate*1.2 + scale*1.1 at 50% |
| glowing-button `line-anim` | 16s (medium) | none → `ease` on `::before`; `linear` on `.effect` | infinite | `--angle → 360deg` |
| glowing-button `sky-anim` | 2s | linear | infinite | mask pans `0 -15px / 15px -45px` |
| card `line-anim` | 12s (loop) / 8s (intermittent) | linear | infinite | `--angle → 360deg` |
| card `line-opacity-loop` | 3s | linear | infinite | `.75 → 1 → .75` |
| card `line-opacity` | 4s | linear | **once**, `var(--delay)` | `0 → 1 (20–70%) → 0` |
| cta-box `cta-line-anim` | 6s (`--duration` default) | linear | infinite | `--cta-angle → 360deg` |
| radix logo lines x3 | 10s | linear | infinite | `rotate(-1turn)` |
| security leaked line | 10s | linear | infinite | `rotate(360deg)` |
| security automatic radar | 40s | linear | infinite | `rotate(1turn)` |
| security automatic dots x5 | 40s | linear | infinite | see §2.6 percentages |
| complete-line halo | 30s | linear | infinite | `rotate(1turn)` |
| complete-social breath x6 | 5s | `cubic-bezier(.6,.6,0,1)` | infinite, delays 0/3/3.75/1.5/.75/2.25s | `0%,40%{0} 20%{1}` |
| complete-multi-border | 5s | linear | infinite | 5-stop path, `scaleY(1.5)` at 66.67% |
| complete-single-line | 10s | `cubic-bezier(.6,.6,0,1)` | infinite | `(50,50) → (-200,-200)` by 60% |
| complete-directory | 5s | linear | infinite | `rotate(1turn)` |
| dashboard work lights | 4s | linear | infinite (only when `-active`) | `0/180°+scale(.8)/360°` |
| dashboard events spinner | 4s | linear | infinite | `rotate(1turn)` |
| dashboard user spinner | 4s | linear | infinite | `rotate(360deg)` |
| dashboard lines spin | `var(--animation-duration)` = **5000ms** | linear | infinite (only when `-active`) | 5-stop, `scale(1,1.3)` at 66.67% |

### 3.3 Hover / interaction transitions (every interactive element)

| Element | property | duration | easing |
|---|---|---|---|
| `.powered-by__link` | opacity `.5 → .6` | .2s | default `ease` |
| `.link` | `filter: brightness(110%)` | .2s | ease-out |
| `.glowing-button` container | `all` | .2s | ease-out |
| `.glowing-button::before/::after` | opacity | 1s | ease-out |
| `.button-solid` | background-color | .1s (within `all .2s ease-out`) | ease-out |
| `.button-outline` | border-color → `#bad7f738` | .2s | ease-out |
| `.button-light` | box-shadow | .1s (within `all .2s ease-out`) | ease-out |
| `.button-hero` | box-shadow (no transition declared → instant) | — | — |
| `.input-*` | box-shadow / background / border (no transition declared → instant) | — | — |
| `.color-picker__color` | box-shadow | .2s | ease-out |
| `.border-radius__item` | background | .2s | ease-out |
| `.logo-picker__item` | background, box-shadow | .2s | ease-out |
| `.cta-box` | background-color, box-shadow | .45s | `cubic-bezier(.6,.6,0,1)` |
| `.cta-box::before/::after` | opacity | .45s / .2s ease-in-out | see §2.9 |
| `.cta-box .section-header-title` | text-shadow | .45s | `cubic-bezier(.6,.6,0,1)` |
| `.cta-box:active` | `all` + `translateY(2px)` on img/header | .2s | ease-out |
| `.cta-action` | box-shadow | .45s | `cubic-bezier(.6,.6,0,1)` |
| `.light-switch__thumb` | transform `translateX(100%)` | **.6s** | `cubic-bezier(.165,.84,.44,1)` |
| `.light-switch__icon-*` | opacity | .2s | `cubic-bezier(.165,.84,.44,1)` |

**`cubic-bezier(.6,.6,0,1)` is the house easing** for all state-reveal transitions (every `-active`
class in the dashboard/security/complete blocks uses `.45s` or `.6s`/`.8s`/`1s`/`3s` with this curve).
`cubic-bezier(.165,.84,.44,1)` (easeOutQuart) is used only by the light switch.

### 3.4 Scroll-triggered reveals — mechanism

There is **no sticky/shrinking nav, no parallax, and no scroll-linked (scrubbed) animation anywhere**.
Everything scroll-related is a binary "armed" flip driven by `IntersectionObserver`, after which the
animation runs on its own clock. Three distinct patterns:

1. **features-slider** — observer flips a CSS variable `--play-state: paused → running` on the container;
   the per-item animations then self-stagger via `--delay:calc(var(--i) * 1.2s)`. Measured flip between
   scrollY 600 and 700 (viewport 900, strip top y=1222).
2. **dashboard / security / complete node widgets** — observer arms the block, then a JS interval adds and
   removes `-active` / `-animate` classes in a repeating sequence (measured firing order in §2.3). Each
   class change is animated by the CSS transitions already listed.
3. **radix-logo-lines** — a mount/scroll reveal that writes inline `opacity:1; transform:translateY(100px)`.

The minified bundle contains `IntersectionObserver` with a `rootMargin:"200px"` literal (in
`0n-iet64u4bm3.js`) and `threshold` values pulled from a lookup table. **I could not attribute that
`rootMargin` to a specific observer with confidence**, so treat the exact threshold/rootMargin as
unmeasured. Recommended implementation that matches the observed behaviour:
```js
new IntersectionObserver(cb, { threshold: 0, rootMargin: '200px 0px 0px 0px' })
```
fire-once (`unobserve` on first intersection) for pattern 1 and 3; for pattern 2, start the interval on
enter and clear it on exit.

### 3.5 Reduced motion

The only `prefers-reduced-motion` rule in the entire stylesheet is on `.spotlight` (kills the animation,
freezes the transform). Everything else keeps animating. **Recommend adding a global
`@media (prefers-reduced-motion:reduce){ *,*::before,*::after{ animation-duration:.01ms !important;
animation-iteration-count:1 !important; transition-duration:.01ms !important } }`** — a deliberate
improvement on the original, not a measurement.

---

## 4. Things I could not measure

Stated explicitly so nothing here gets guessed downstream:

1. **Canvas draw loops (4 canvases)** — hero 1280x1222 @ `opacity:.5`; `.browser__content`; `.radix`;
   `.security-rbac__dots`. All 2D. The particle logic lives in minified chunks I did not decompile.
   Sizes, opacity and placement above are measured; the per-frame math is not.
2. **Dashboard/security sequence tables** — the measured firing *order* is in §2.3, and the ~750ms step is
   derived from the scroll-step timing, not read from source. Exact per-node durations/offsets unknown.
3. **`--transition-delay` values** for the application/auth dot typewriter — generated in JS.
4. **`.security-rbac__display` role list** and the `.anim2` swipe variant's trigger condition.
5. **`.dashboard-database-bars`** bar count and height sequence (set from JS).
6. **`.radix-logo-lines` pre-reveal state** — only the post-reveal inline value (`translateY(100px)`) is observable.
7. **Exact IntersectionObserver threshold/rootMargin** — see §3.4.
8. **The hero video's webm source URL** — the `<source type="video/webm">` element has no resolvable
   `src` in the DOM; only the `.mov` was requested.
9. **`/img/power-grace-light.png`** (`.customui::before`) — referenced by CSS, never requested, not in the capture.
10. **Mobile `data-mobile-title` strings** for the features strip — set as attributes rendered via
    `content:attr()`; I captured the desktop labels but not the short mobile forms.
