import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

/* Order matters: tokens/resets/primitives first, then per-section sheets. */
import './index.css'
import './styles/base.css'
import './styles/hero.css'
import './styles/features-slider.css'
import './styles/dashboard.css'
import './styles/customui.css'
import './styles/radix.css'
import './styles/security.css'
import './styles/complete.css'
import './styles/testimonials.css'
import './styles/cta.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
