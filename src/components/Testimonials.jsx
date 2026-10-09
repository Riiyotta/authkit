import { OutlineBox } from './primitives.jsx'

/* CLONE_SPEC §2.8 — testimonials.
   Copy, names, roles, company marks and headshots are the originals, read out
   of the captured DOM; all four assets are served from local public/ paths. */

const ITEMS = [
  {
    logo: { src: '/img/testimonials/meter.svg', width: 129, height: 40, alt: 'Meter' },
    quote:
      'Integration was quick and AuthKit gave us full control over the UI. I have been involved with auth implementations for over a decade and this was a dead simple choice.',
    avatar: '/img/avatars/1.png',
    name: 'Sean Rose',
    title: 'Product at Meter',
  },
  {
    logo: { src: '/img/testimonials/formal.svg', width: 41, height: 40, alt: 'Formal' },
    quote:
      'The migration to WorkOS was straightforward and has freed up so much of our engineering resources. AuthKit is a game changer for handling user logins.',
    avatar: '/img/avatars/2.png',
    name: 'Mokhtar Bacha',
    title: 'Founder at Formal',
  },
]

export default function Testimonials() {
  return (
    <div className="testimonials">
      <div className="testimonials-list">
        <div className="testimonials-list-borders">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} />
          ))}
        </div>
        {ITEMS.map((item) => (
          <OutlineBox dots className="testimonials-list-item" key={item.name}>
            <img
              className="testimonials-list-item-logo"
              src={item.logo.src}
              width={item.logo.width}
              height={item.logo.height}
              alt={item.logo.alt}
            />
            <div className="testimonials-list-item-content">{item.quote}</div>
            <div className="testimonials-list-item-author">
              <img alt="" width="40" height="40" className="testimonials-list-item-author-avatar" src={item.avatar} />
              <div>
                <div className="testimonials-list-item-author-name">{item.name}</div>
                <div className="testimonials-list-item-author-title">{item.title}</div>
              </div>
            </div>
          </OutlineBox>
        ))}
      </div>
    </div>
  )
}
