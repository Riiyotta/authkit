import { BetweenLines, Button, Field, INERT_HREF, Input, cx } from './primitives.jsx'
import { SOCIAL_ICONS } from './icons.jsx'

/* ============================================================================
   AuthCard — the login card. ONE implementation, used four times:
   the three hero cards (CLONE_SPEC §2.1) and the customiser's live preview
   (§2.4). Shape differences are props; brand differences are the
   `--brand-color` / `--brand-radius` custom properties; light mode is the
   `.light` ancestor cascade (see base.css), never a forked component.
   ========================================================================== */

export default function AuthCard({
  /* shell */
  surface = 'hero', // 'hero' | 'dark' — maps to .card-hero / .card-dark
  size = 'large',
  animated, // { startAngle, delay } → the shared .card-animated-loop chase
  className,
  style, // --brand-color / --brand-radius / height
  /* header */
  logo, // ReactNode
  logoBoxed = false, // wrap the logo in `.customui__logo-container`
  title,
  titleStyle,
  subtitle,
  headerStyle,
  /* body */
  fields = [], // [{ label, type, name, placeholder }]
  otp, // { label, length }
  primary = { label: 'Continue', variant: 'outline' },
  divider, // 'OR'
  socials = [], // ['google', 'microsoft']
  footer, // { text?, linkLabel }
}) {
  return (
    <div
      className={cx(
        'card',
        `card-${size}`,
        `card-${surface}`,
        animated && 'card-animated card-animated-loop',
        className,
      )}
      style={style}
    >
      <div
        className="effect"
        aria-hidden="true"
        style={animated ? { '--start-angle': animated.startAngle, '--delay': animated.delay } : undefined}
      />

      <div className="content">
        <div className="hero__card-content">
          <div className="hero__card-header" style={headerStyle}>
            {logoBoxed ? <div className="customui__logo-container">{logo}</div> : logo}
            {title ? (
              <p className="text-h5 text-bold text-center" style={titleStyle}>
                {title}
              </p>
            ) : null}
            {subtitle ? <p className="text-p text-muted text-center">{subtitle}</p> : null}
          </div>

          {fields.map((f) => (
            <Field key={f.name} {...f} />
          ))}

          {otp ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label className="text-p text-bold">{otp.label}</label>
              <div style={{ display: 'flex', gap: 10, height: 48, '--input-height': '48px' }}>
                {Array.from({ length: otp.length }, (_, i) => (
                  <Input key={i} type="text" inputMode="numeric" pattern="\d{1}" maxLength={1} />
                ))}
              </div>
            </div>
          ) : null}

          <Button variant={primary.variant}>{primary.label}</Button>

          {divider ? (
            <div style={{ marginBlock: 10 }}>
              <BetweenLines variant="solid">{divider}</BetweenLines>
            </div>
          ) : null}

          {socials.map((key) => {
            const Icon = SOCIAL_ICONS[key]
            return (
              <Button key={key} variant="outline">
                <Icon /> Continue with {key[0].toUpperCase() + key.slice(1)}
              </Button>
            )
          })}

          {footer ? (
            <p className={cx('text-p text-center', footer.text && 'text-muted')}>
              {footer.text ? `${footer.text} ` : null}
              <a className="link" href={INERT_HREF} style={{ pointerEvents: 'none' }}>
                {footer.linkLabel}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
