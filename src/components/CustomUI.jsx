import { useRef, useState } from 'react'
import AuthCard from './AuthCard.jsx'
import { OutlineBox } from './primitives.jsx'
import { useParticleField } from '../hooks/motion.js'

/* CLONE_SPEC §2.4 — login-card customiser.
   The live preview is the same <AuthCard> the hero uses; the three pickers
   (12 buttons) write --brand-color / --brand-radius / --i onto it. */

const SWATCHES = ['#E46D4C', '#663AF3', '#027DEA', '#269684']
const RADII = ['0px', '3px', '6px', '9999px']
const LOGO_SPRITE = '/img/logos-sprite.svg'

/* the five decorative, non-interactive screenshots at opacity .75 */
const DECORATIONS = [
  { cls: 'customui_page-bg', alt: 'Page background color', w: 252, h: 126, src: '/img/customui/page-bg-card.png' },
  { cls: 'customui_appearance', alt: 'Prefered Appearance', w: 279, h: 142, src: '/img/customui/appearance-card.png' },
  { cls: 'customui_favicon', alt: 'Favicon', w: 304, h: 155, src: '/img/customui/favicon-card.png' },
  { cls: 'customui_button-color', alt: 'Button text color', w: 208, h: 126, src: '/img/customui/button-color-card.png' },
  { cls: 'customui_link-color', alt: 'Link color', w: 252, h: 126, src: '/img/customui/link-color-card.png' },
]

/* A picker shell: outline-box → small dark card with the shared border chase. */
function PickerCard({ wrapperClass, cardClass, effect, label, children }) {
  return (
    <div className={wrapperClass}>
      <OutlineBox lines dots>
        <div>
          <div className={`card card-small card-dark card-animated card-animated-loop ${cardClass}`}>
            <div className="effect" style={effect} aria-hidden="true" />
            <div className="content">
              <div className={`${cardClass}__content`}>
                <p className="text-small text-muted">{label}</p>
                {children}
              </div>
            </div>
          </div>
        </div>
      </OutlineBox>
    </div>
  )
}

export default function CustomUI() {
  const [color, setColor] = useState(1) // #663AF3 default
  const [radius, setRadius] = useState(1) // 3px default
  const [logo, setLogo] = useState(0)
  const canvasRef = useRef(null)
  /* same measured starfield as the hero, sized to the 992x664 browser pane
     (395 particles = round(w*h / 1666.67)) */
  useParticleField(canvasRef, 'stars')

  return (
    <div className="customui">
      <div className="customui__overlay" />

      <OutlineBox dots className="customui__header">
        <div className="customui__header-content">
          <div className="between-lines between-lines-gradient">
            <div className="badge">
              <span className="text-gradient">Shine bright</span>
            </div>
          </div>
          <h2 className="text-h2 text-gradient text-bold text-center">Your&nbsp;brand. Your&nbsp;style.</h2>
          <p style={{ marginBlock: 5 }} className="text-h5 text-muted text-center">
            AuthKit can be fully customized to fit natively with your app&apos;s unique design.
          </p>
        </div>
      </OutlineBox>

      <div>
        <div className="browser customui__browser">
          <div className="browser__header" />
          <div className="browser__content">
            {/* second particle field — draw loop is the Animation agent's job (§4.1) */}
            <canvas ref={canvasRef} className="browser__canvas" data-customui-canvas="" />

            <OutlineBox dots className="customui__card-container">
              <div>
                <AuthCard
                  surface="dark"
                  size="large"
                  animated={{ startAngle: '541deg', delay: '10s' }}
                  style={{ '--brand-color': SWATCHES[color], '--brand-radius': RADII[radius] }}
                  logoBoxed
                  logo={
                    <img
                      alt="Logo"
                      width="32"
                      height="32"
                      className="customui__logo"
                      style={{ '--i': logo }}
                      src={LOGO_SPRITE}
                    />
                  }
                  title="Sign in to SuperApp"
                  titleStyle={{ color: '#C7D3EA' }}
                  fields={[
                    { label: 'Email', type: 'email', name: 'email', placeholder: 'Your email address' },
                    { label: 'Password', type: 'password', name: 'password', placeholder: 'Enter your password' },
                  ]}
                  primary={{ label: 'Continue', variant: 'solid' }}
                  divider="OR"
                  socials={['google']}
                  footer={{ text: "Don't have an account?", linkLabel: 'Sign up' }}
                />
              </div>
              <div className="customui__card-outline" />
            </OutlineBox>

            <PickerCard
              wrapperClass="customui_colors"
              cardClass="color-picker"
              effect={{ '--start-angle': '189deg', '--delay': '11s' }}
              label="Colour"
            >
              <div className="color-picker__colors">
                {SWATCHES.map((swatch, i) => (
                  <button
                    key={swatch}
                    type="button"
                    aria-label={`Brand colour ${i + 1}`}
                    aria-pressed={color === i}
                    onClick={() => setColor(i)}
                    className={`color-picker__color ${color === i ? 'color-picker__color--active' : ''}`}
                    style={{ '--color-swatch': swatch }}
                  />
                ))}
              </div>
            </PickerCard>

            <PickerCard
              wrapperClass="customui_logos"
              cardClass="logo-picker"
              effect={{ '--start-angle': '517deg', '--delay': '9s' }}
              label="Logo icon"
            >
              <div className="logo-picker__items">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Logo ${i + 1}`}
                    aria-pressed={logo === i}
                    onClick={() => setLogo(i)}
                    className={`logo-picker__item ${logo === i ? 'logo-picker__item--active' : ''}`}
                  >
                    <img alt="Logo" width="32" height="32" className="logo-picker__image" style={{ '--i': i }} src={LOGO_SPRITE} />
                  </button>
                ))}
              </div>
            </PickerCard>

            {DECORATIONS.slice(0, 1).map((d) => (
              <div className={d.cls} key={d.cls}>
                <img alt={d.alt} width={d.w} height={d.h} src={d.src} />
              </div>
            ))}

            <PickerCard
              wrapperClass="customui_radii"
              cardClass="border-radius"
              effect={{ '--start-angle': '186deg', '--delay': '11s' }}
              label="Radius"
            >
              <div className="border-radius__items">
                {RADII.map((r, i) => (
                  <button
                    key={r}
                    type="button"
                    aria-label={`Corner radius ${r}`}
                    aria-pressed={radius === i}
                    onClick={() => setRadius(i)}
                    className={`border-radius__item ${radius === i ? 'border-radius__item--active' : ''}`}
                    style={{ '--border-radius': r }}
                  />
                ))}
              </div>
            </PickerCard>

            {DECORATIONS.slice(1).map((d) => (
              <div className={d.cls} key={d.cls}>
                <img alt={d.alt} width={d.w} height={d.h} src={d.src} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
