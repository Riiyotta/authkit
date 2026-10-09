/* ============================================================================
   Shared primitives — CLONE_SPEC §1 and §3.1.
   Every recurring piece of the page is defined here exactly once; the nine
   section components compose these rather than re-implementing them.
   All styling lives in src/index.css (tokens, keyframes, glow primitives) and
   src/styles/base.css (resets, type scale, the rest of the primitives).
   ========================================================================== */

/* Every off-domain destination on the original is replaced with this inert
   local href. Link text, styling and hover states are unchanged. */
export const INERT_HREF = '#'

export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

/* --- `.outline-box` — the dotted-corner frame (hero logo/headline, customui
   header, login card, picker cards, testimonial cells, CTA bars) ----------- */
export function OutlineBox({ as: As = 'div', lines = false, dots = false, className, children, ...rest }) {
  return (
    <As className={cx('outline-box', lines && '-lines', dots && '-dots', className)} {...rest}>
      {children}
    </As>
  )
}

/* --- `.between-lines` — centred label with a rule on each side ------------ */
export function BetweenLines({ variant = 'gradient', className, children, ...rest }) {
  return (
    <div className={cx('between-lines', `between-lines-${variant}`, className)} {...rest}>
      {children}
    </div>
  )
}

/* --- `.badge` ------------------------------------------------------------- */
export function Badge({ gradient = true, className, children }) {
  return (
    <div className={cx('badge', className)}>
      {gradient ? <span className="text-gradient">{children}</span> : children}
    </div>
  )
}

/* The eyebrow is always a `.between-lines-gradient` wrapping a gradient badge. */
export function Eyebrow({ className, children }) {
  return (
    <BetweenLines variant="gradient" className={className}>
      <Badge>{children}</Badge>
    </BetweenLines>
  )
}

/* --- `.button` ------------------------------------------------------------
   One component for every button variant. Light mode is NOT a separate
   variant — the `.light` ancestor cascade restyles `-hero` / `-outline`
   / `-solid` in place (see base.css). */
export function Button({ variant = 'outline', as: As = 'button', className, children, ...rest }) {
  const props = As === 'button' ? { type: 'button', ...rest } : rest
  return (
    <As className={cx('button', `button-${variant}`, className)} {...props}>
      {children}
    </As>
  )
}

/* --- `.input` (+ the label wrapper the login cards use) ------------------- */
export function Input({ variant = 'solid', className, wrapperStyle, ...inputProps }) {
  return (
    <div className={cx('input-wrapper', className)} style={wrapperStyle}>
      <input
        className={cx('input', `input-${variant}`)}
        data-1p-ignore="true"
        autoComplete="off"
        {...inputProps}
      />
    </div>
  )
}

export function Field({ label, variant, style, ...inputProps }) {
  return (
    <label className="text-p text-bold">
      {label}
      <Input variant={variant} wrapperStyle={{ marginTop: 5, ...style }} {...inputProps} />
    </label>
  )
}

/* --- `.glowing-button` (§3.1) — the rotating-border glow button.
   "medium" is the only size this page uses. ------------------------------- */
export function GlowingButton({ as: As = 'a', size = 'medium', className, children, ...rest }) {
  return (
    <As className={cx('glowing-button', `glowing-button-${size}`, className)} {...rest}>
      <span className="effect" aria-hidden="true" />
      <span className="text">{children}</span>
    </As>
  )
}

/* --- the section-header pattern (eyebrow + title + description) ----------
   `title` is an array of line strings. Pass `titleMobile` for the two
   art-directed variants the radix header ships (switch at max-width:1200px). */
export function SectionHeader({
  eyebrow,
  title,
  titleMobile,
  titleClass = 'section-header-title-h3',
  titleTag: TitleTag = 'h3',
  description,
  className,
  children,
}) {
  const lines = (arr) => arr.map((line) => <span key={line}>{line}</span>)
  return (
    <div className={cx('section-header', className)}>
      {eyebrow ? <Eyebrow className="section-header-badge">{eyebrow}</Eyebrow> : null}
      {title ? (
        <TitleTag className={cx('section-header-title', titleClass)}>
          {titleMobile ? (
            <>
              <div className="section-header-title-desktop">{lines(title)}</div>
              <div className="section-header-title-mobile">{lines(titleMobile)}</div>
            </>
          ) : (
            lines(title)
          )}
        </TitleTag>
      ) : null}
      {description ? <p className="section-header-description">{description}</p> : null}
      {children}
    </div>
  )
}

/* --- section shell -------------------------------------------------------
   The only chrome this single-page site has between sections is a 1px
   --blue-6 rule. (Recon: no <nav>, no <footer>, header is position:static.)
   Per-section padding/max-width stay in each section's stylesheet because
   CLONE_SPEC gives a different measured value for every one of them. */
export function PageSeparator() {
  return <div className="page-separator" />
}

export function Section({ name, separatorBefore = false, children, ...rest }) {
  return (
    <>
      {separatorBefore ? <PageSeparator /> : null}
      <div className={name} {...rest}>
        {children}
      </div>
    </>
  )
}

/* --- feature tile (icon + label), used 6x by the features strip ---------- */
export function FeatureTile({ src, alt, label, mobileLabel, index, withSeparator }) {
  return (
    <li className="features-slider__item" style={{ '--i': index }}>
      <div className="features-slider__icon-container">
        <div>
          <img type={alt} alt={alt} loading="lazy" width="96" height="96" className="features-slider__icon" src={src} />
        </div>
        <p data-mobile-title={mobileLabel} className="text-small text-muted features-slider__text">
          <span>{label}</span>
        </p>
      </div>
      {withSeparator ? <span className="features-slider__separator" /> : null}
    </li>
  )
}
