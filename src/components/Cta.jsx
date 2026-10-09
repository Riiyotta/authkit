import { GlowingButton, INERT_HREF, OutlineBox } from './primitives.jsx'
import { XGlyph } from './icons.jsx'

/* CLONE_SPEC §2.9 — CTA. */

const BOXES = [
  {
    href: INERT_HREF,
    img: '/img/cta/hosted.png',
    alt: 'Use hosted AuthKit',
    title: 'Use hosted AuthKit',
    description: 'The fastest way to launch.',
  },
  {
    href: INERT_HREF,
    img: '/img/cta/github.png',
    alt: 'View code on GitHub',
    title: 'View code on GitHub',
    description: 'Host your own frontend.',
  },
]


export default function Cta() {
  return (
    <div className="cta">
      <div className="cta-header">
        <OutlineBox dots style={{ padding: 32 }}>
          <h3 className="text-h2 text-gradient" style={{ textAlign: 'center' }}>
            Start building today
          </h3>
        </OutlineBox>
      </div>

      <div className="cta-boxes">
        {BOXES.map((box) => (
          <a href={box.href} className="cta-box" key={box.title}>
            <img alt={box.alt} src={box.img} />
            <div className="section-header">
              <h6 className="section-header-title section-header-title-h6">
                <span>{box.title}</span>
              </h6>
              <p className="section-header-description">{box.description}</p>
            </div>
            <span className="cta-box-dots">
              <span />
              <span />
              <span />
              <span />
            </span>
          </a>
        ))}
      </div>

      <OutlineBox dots className="cta-actions">
        {/* same tab — the original carries no `target` here */}
        <GlowingButton href={INERT_HREF}>
          Follow @AuthKit on
          <XGlyph />
        </GlowingButton>
      </OutlineBox>
    </div>
  )
}
