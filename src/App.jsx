import { Fragment } from 'react'
import Hero from './components/Hero.jsx'
import FeaturesSlider from './components/FeaturesSlider.jsx'
import Dashboard from './components/Dashboard.jsx'
import CustomUI from './components/CustomUI.jsx'
import Radix from './components/Radix.jsx'
import Security from './components/Security.jsx'
import Complete from './components/Complete.jsx'
import Testimonials from './components/Testimonials.jsx'
import Cta from './components/Cta.jsx'
import { PageSeparator } from './components/primitives.jsx'

/* Section order and separator placement from CLONE_SPEC §2:
   hero → features-slider → dashboard → customui → radix → security →
   complete → testimonials → cta.
   The only chrome between sections is the 1px --blue-6 <PageSeparator/>:
   this page has no <nav> and no <footer>, and the hero's header is static. */
const SECTIONS = [
  { key: 'hero', Component: Hero },
  { key: 'features-slider', Component: FeaturesSlider },
  { key: 'dashboard', Component: Dashboard },
  { key: 'customui', Component: CustomUI },
  { key: 'radix', Component: Radix, separatorBefore: true },
  { key: 'security', Component: Security, separatorBefore: true },
  { key: 'complete', Component: Complete, separatorBefore: true },
  { key: 'testimonials', Component: Testimonials, separatorBefore: true },
  { key: 'cta', Component: Cta },
]

export default function App() {
  return (
    <main className="page">
      {SECTIONS.map(({ key, Component, separatorBefore }) => (
        <Fragment key={key}>
          {separatorBefore ? <PageSeparator /> : null}
          <Component />
        </Fragment>
      ))}
    </main>
  )
}
