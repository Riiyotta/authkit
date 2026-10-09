Source: https://www.authkit.com/

# Asset manifest

Every hashed file in `_source/AuthKit by WorkOS_files/` mapped to the DOM element that uses it,
plus everything the live site loads that is **absent** from that folder.

Mapping method: each filename was grepped out of `_source/AuthKit by WorkOS.html` and attributed via the
nearest enclosing `class=` / `alt=`. Displayed sizes are measured from the live site at 1280px.

Base URL for anything missing: `https://www.authkit.com/_next/static/media/<file>`
(images are additionally served through `https://www.authkit.com/cdn-cgi/image/width=<W>,quality=<Q>,format=auto/_next/static/media/<file>`).

**Licensing:** the logo/wordmark/headshot/customer-logo entries below are WorkOS and third-party brand
assets, and the three font families are commercial licences. Do not ship them in the clone — see §0 of
`CLONE_SPEC.md` for the substitution table. They are catalogued here only so the mapping is unambiguous.

---

## 1. Present in the capture

### Hero

| File | Used by | Displayed | Intrinsic |
|---|---|---|---|
| `authkit.04008e0_xh~od.svg` | `.hero__logo img`, `alt="Authkit logo"` | 476x106 | 476x106 | 
| `LoginCardLogo1.0fe2rrito8p6s.png` | centre hero card header, `alt="SuperApp"` | 32x32 | 32x32 |
| `LoginCardLogo2.0wj.fkk6ezrk6.png` | left hero card header, `alt="Blamer"` | 30x32 | 32x34 |
| `LoginCardLogo3.0ehqf0bvvrtgd.png` | right hero card header, `alt="Clamer"` | 30x32 | 32x32 |

### Features strip — `.features-slider__icon` (all 48x48 displayed, 96x96 intrinsic, served at `width=96,q=75`)

| File | `alt` / label |
|---|---|
| `SingleSignOn.0o~kestmycrk7.png` | `single-sign-on` → "Single Sign-On" |
| `Password.11haiiirx8~bn.png` | `password` → "Password" |
| `MultiFactorAuth.0qqat8z.6inu4.png` | `multi-factor-auth` → "Multi-Factor Auth" |
| `SocialLogin.0welp5~~le0sc.png` | `social-login` → "Social Login" |
| `Rbac.0___ogsv~xrt..png` | `rbac` → "Role-Based Access Control" |
| `MagicLink.0b0f57v8q9-tc.png` | `magic-link` → "Magic Auth" |

### Dashboard

| File | Used by | Displayed |
|---|---|---|
| `background-mobile.12si4.a3e5cgb.png` | `.dashboard-background` `<picture>`, `(max-width:1199px)` branch, `alt="Dashboard background"` | 697x507 wrapper |
| `inner.0oi1-o17qhm4e.png` | `.dashboard-work-inner`, `alt="Dashboard Work Inner"` | 218x218 (256x256 intrinsic) |
| `spinner.0gu8v3_c7i6h3.png` | `.dashboard-user-spinner`, `alt="Dashboard User Spinner"` | 52x52 (64x64 intrinsic) |

### Custom UI section

| File | Used by | Displayed |
|---|---|---|
| `logos.112jfawmv-89b.svg` | **4-up horizontal sprite**, 5 uses: `.customui__logo` (in-card, `--i` from state) + 4x `.logo-picker__image` (`--i` 0–3). 32px cell, `object-position:calc(32px * var(--i) * -1) 0` | 32x32 per cell |
| `appearance-card.0eljo~85k2nk5.png` | `.customui_appearance` decorative screenshot, `alt="Prefered Appearance"` | 279x142 |
| `link-color-card.0fxvy_-djkrpe.png` | `.customui_link-color`, `alt="Link color"` | 252x126 |
| `button-color-card.1708-meoric_a.png` | `.customui_button-color`, `alt="Button text color"` | 208x126 |
| `page-bg-card.12ov8y.1zr10l.png` | `.customui_page-bg`, `alt="Page background color"` | 252x126 |
| `favicon-card.0xde-c~~4ig55.png` | `.customui_favicon`, `alt="Favicon"` | 304x155 |

### Radix section

| File | Used by | Displayed |
|---|---|---|
| `background.0z~8924d12gpu.png` | `.radix-background`, `alt="Radix background"` — **`display:none` ≤1199px** | 1280x377 |
| `boxes-mobile.0_l0.d19dssg8.png` | `.radix-kit` `<picture>`, `(max-width:1199px)` branch, `alt="Radix kit"` | 1177x399 |
| `stroke.127t-6.m90x6o.png` | `.radix-logo-stroke` (layer 1), `alt="Radix logo stroke"` | 560x833 |
| `main.0f~g6oi.571ay.png` | `.radix-logo-main` (layer 2, `z-index:11`) | 560x833 |
| `blender.0eldj8884ysf2.png` | `.radix-logo-blender` (layer 3, `z-index:13`) | 560x833 |

### Security cards

| File | Used by | Displayed |
|---|---|---|
| `background.0g8.4xxh2w8yo.png` | `.security-leaked` card background | 320x242 |
| `background.0wpg11s_gbv5p.png` | `.security-password` card background | 320x242 |
| `background.0asnv2n-u1jme.png` | `.security-automatic` card background | 320x242 |
| `background.0ewij62aea6bd.png` | `.security-multi` card background | 320x242 |
| `text.14qqyqu-~9q8u.png` | `.security-leaked-text`, `alt="Text"` | 175x21 |
| `1.12mxh~c-er41d.png` | `.security-leaked-check` piece 1 (`transition-delay:.3s`) | 43x43 |
| `2.0imq0krnair3z.png` | `.security-leaked-check` piece 2 (`.1s`) | 43x43 |
| `3.17o~-b_r9hg3i.png` | `.security-leaked-check` piece 3 (`0s`) | 43x43 |
| `4.0wsp1qil-f1af.png` | `.security-leaked-check` piece 4 (`.2s`) | 43x43 |
| `text.0mcxflsdpa6g4.png` | `.security-password-text` scrolling strip, `alt="Text"` (28px row pitch) | 208x132 |
| `radar.0z-29__nrvfye.png` | `.security-automatic-radar` (40s rotation) | 367x367 |
| `card-reader@3x.0ub0q29in-rpj.png` | `.security-rbac__card-reader` | 100x144 |
| `card@3x.067qg-bcyvlm8.png` | `.security-rbac__card` (slides in) | 124x78 |
| `card-light@3x.0-v_214yoe1--.png` | `.security-rbac__card-light` | 150x186 |
| `button@3x.04b3gqfr0-o7m.png` | `.security-rbac__button` x4 (2x2 grid) | 28x28 each |

Note: the RBAC card has **no** `background.*.png` of its own in the capture — its backdrop is the
`card-reader`/`card` art plus the shared `.security-card` styling.

### Complete section

| File | Used by | Displayed |
|---|---|---|
| `background.0pk~i5z-okdcd.png` | `.complete-inner` backdrop, `alt="Complete background"` (714 KB, srcset to 3840w q100) | 1440x1072 |
| `square.185ga-mibnm8b.png` | `.complete-social` children 1 and 3, `alt="Circle"` | 28x33 |
| `circle.0o2~h_mus2--u.png` | `.complete-social` children 2, 4, 6 | 28x33 |
| `triangle.0q7deroyjsf85.png` | `.complete-social` child 5 | 28x33 |
| `overlay.0_0g5b~9je3sz.png` | `.complete-single-overlay` | 137x62 |

### Testimonials

| File | Used by | Displayed |
|---|---|---|
| `sean-rose.16106~y~k5ovf.png` | testimonial 1 `.testimonials-list-item-author-avatar` | 40x40, `border-radius:50%` |
| `mokhtar-bacha.0nik2he0wr.n..png` | testimonial 2 avatar | 40x40 |

### CTA

| File | Used by | Displayed |
|---|---|---|
| `authkit.0e3cq6p23b7wu.png` | `.cta-box` 1 illustration, `alt="Use hosted AuthKit"` | 442x332 |
| `github.01r5slzjxdz00.png` | `.cta-box` 2 illustration, `alt="View code on GitHub"` | 442x332 |

### Stylesheets (reference, not to be shipped)

| File | Contents |
|---|---|
| `0l0q6~h79kzc..css` | 3.3 KB — `:root` design tokens, all `@font-face` rules, base resets, `.container-lg`. Fully transcribed into `CLONE_SPEC.md` §1. |
| `0kn7kgyjdnxlm.css` | 83.6 KB — every component and section rule plus all 29 `@keyframes`. Source for §2 and §3. |

### JS chunks (do not execute — read as data only)

`turbopack-1663uebl5fpxp.js`, `0t~1ydc1cx.~s.js`, `03~yq9q893hmn.js`, `0d3tkj33oycf2.js`,
`0iyrz_q93-6ey.js`, `0n-iet64u4bm3.js` (contains `IntersectionObserver` + the `rootMargin:"200px"` literal),
`0pjq-hlddzx4h.js` (also uses `IntersectionObserver`), `0ponbazsdwe5y.js`, `14ks~1k~3mfh9.js`,
`js`, `js(1)`, `js(2)`, `20433186.js`, `20433186(1).js`, `banner.js`, `pixels.js`, `f.txt`,
`v4bc70e2c01a94c73b74392e4234840661791215815920`.
Next.js/Turbopack app bundles plus third-party analytics (HubSpot `20433186*.js`, `pixels.js`, `banner.js`).
**None of this is needed for the clone** — the analytics/consent scripts should not be ported at all.

---

## 2. MISSING from the capture — must be downloaded or recreated

All of these are requested by the live site. Absolute URLs given.

### Fonts (commercial licences — substitute instead of downloading; see CLONE_SPEC §0)

| Asset | URL |
|---|---|
| Untitled Sans 400 | `https://cdn.workos.com/fonts/untitled-sans-regular-v2.woff2` |
| Untitled Sans "medium" (declared `font-weight:700`) | `https://cdn.workos.com/fonts/untitled-sans-medium-v2.woff2` |
| aeonikPro (display face) | `https://www.authkit.com/_next/static/media/medium-s.p.0jj36.zl5f6h~.woff2` |
| Enhanced Dot Digital-7 (the 15px RBAC readout) | `https://www.authkit.com/_next/static/media/enhanced_dot_digital_7-s.p.0xen6m6eh~h6b.ttf` |
| IBM Plex Mono x3 | `https://cdn.workos.com/fonts/ibm-plex-mono-{text,text-italic,semibold}.woff2` — **declared but never loaded; skip** |

### Video

| Asset | URL | Notes |
|---|---|---|
| Hero flare | `https://www.authkit.com/video/authkit.mov` | 1280x600, **2.669333s**, plays once (`autoplay muted playsinline`, no `loop`) |
| webm fallback | **unresolvable** | the `<source type="video/webm">` element carries no usable `src` in the DOM |

### Desktop-only images (the capture was taken below 1200px, so these never loaded)

| Asset | URL | Used by |
|---|---|---|
| Dashboard desktop backdrop | `https://www.authkit.com/_next/static/media/background.16z-rk72~t82h.png` | `.dashboard-background` `(min-width:1200px)` branch; 1920x1376 intrinsic, 1440x1032 displayed, served at `width=1920/3840,q=100` |
| Radix kit desktop | `https://www.authkit.com/_next/static/media/boxes.141~zkq1b1q3-.png` | `.radix-kit` `(min-width:1200px)` branch, `width=1200/3840,q=90` |

### Mask PNGs (all `mask-size:cover`, applied via inline `--mask-image`)

| Asset | URL | Used by | Inline size |
|---|---|---|---|
| dashboard line 1 | `…/media/1.0wb6juc~7do-j.png` | `.dashboard-lines-item` 1, `--animation-duration:5000ms` | 699.5x157.5 |
| dashboard line 2 | `…/media/2.0--lc_smk-3tm.png` | item 2 | 715.5x173.5 |
| dashboard line 3 | `…/media/3.0_0qo2tryf.cw.png` | item 3 | 747.5x222.5 |
| dashboard line 4 | `…/media/4.0w7ben78ml-nf.png` | item 4 | 775.5x263.5 |
| dashboard line 5 | `…/media/5.0ai~0ly~0cdid.png` | item 5 (shipped, not rendered at 1280) | 811.5x279.5 |
| events spinner mask | `…/media/mask.16p54l0zj9j4q.png` | `.dashboard-events-spinner` | 52x22 element |
| radix line mask 1 | `…/media/stroke-mask-1.0-z08mgrt.p1~.png` | `.radix-logo-lines-item` 1 | inset 0 |
| radix line mask 2 | `…/media/stroke-mask-2.08bhig9.16ep7.png` | item 2 | inset 0 |
| radix line mask 3 | `…/media/stroke-mask-3.15s41urtsrk1y.png` | item 3 | inset 0 |
| complete halo mask | `…/media/line-mask.0-nvhf.svz5yv.png` | `.complete-line` | 689.5x349.5 |
| complete multi mask | `…/media/line-mask.0o3jjq0y4am.u.png` | `.complete-multi-line` | 133.5x37.5 |
| complete single mask | `…/media/mask.040yws9fceoot.png` | `.complete-single-line` (4 uses: 2 lines x mirrored pair) | 63.5x47.5 |

### Referenced by CSS but never requested

| Asset | Reference |
|---|---|
| `power-grace-light.png` | `.customui::before { background:url(/img/power-grace-light.png) top/1440px 580px no-repeat }` → `https://www.authkit.com/img/power-grace-light.png`. Returned no request in the network log and is not in the capture. Verify it still exists before relying on it. |

---

## 3. Suggested local layout for the clone

```
public/
  video/hero-flare.mp4            # re-encode; .mov is a poor web container
  img/
    features/{sso,password,mfa,social,rbac,magic}.png      # 96x96
    dashboard/{bg-desktop,bg-mobile,work-inner,spinner}.png
    dashboard/masks/line-{1..5}.png
    dashboard/masks/events-spinner.png
    radix/{bg,kit-desktop,kit-mobile,logo-stroke,logo-main,logo-blender}.png
    radix/masks/stroke-{1..3}.png
    security/{leaked,password,automatic,multi}-bg.png
    security/leaked/{text,check-1..4}.png
    security/password/text.png
    security/automatic/radar.png
    security/rbac/{card-reader,card,card-light,button}.png
    complete/{bg,square,circle,triangle,single-overlay}.png
    complete/masks/{halo,multi,single}.png
    customui/{appearance,link-color,button-color,page-bg,favicon}-card.png
    cta/{hosted,github}.png
    logos-sprite.svg               # 4-up, 32px cells
    brand/logo.svg                 # your own mark
    avatars/{1,2}.png              # placeholders
```
Keep the `--i` sprite technique for the logo picker (`object-position:calc(32px * var(--i) * -1) 0`) —
it is why there is one SVG rather than four.
