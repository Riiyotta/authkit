/** @type {import('tailwindcss').Config} */

/* Design tokens — transcribed verbatim from CLONE_SPEC.md §1.
   Every value here is also emitted as a CSS custom property in src/index.css
   so the hand-written component CSS and the JSX share one source of truth. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '940px',
      lg: '996px',
      xl: '1200px',
    },
    extend: {
      colors: {
        'dark-background': '#05060f',
        'body-normal': '#c8d4eac7',
        'body-loud': '#c7d3ea',
        'body-muted': '#c7d3eaa3',
        'blue-loud': '#232425',
        'blue-6': '#bad6f70f',
        'blue-12': '#bad7f71f',
        'blue-24': '#bad6f73d',
        'blue-90': '#bad6f7e6',

        /* recurring literals */
        'hero-faint': '#bad6f752',
        'glow-light': '#d1e4fa',
        'glow-pale': '#d8ecf8',
        'glow-blue': '#98c0ef',
        'glow-violet': '#c2ccff',
        'glow-indigo': '#adbbff',
        'glow-periwinkle': '#b3bbff',
        'glow-steel': '#bacff7',
        'readout-blue': '#b6d9fc',
        'swatch-1': '#E46D4C',
        'swatch-2': '#663AF3',
        'swatch-3': '#027DEA',
        'swatch-4': '#269684',
        'brand-fallback': '#6a38ff',
        'light-ink': '#111',
        'light-ink-soft': '#333',
        'light-card': '#fffffffc',
        'switch-light-track': '#e8e9ef',
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
        display: ['Instrument Sans', 'aeonikPro Fallback', 'Arial', 'sans-serif'],
        dot: ['Share Tech Mono', 'dotDigital Fallback', 'Arial', 'monospace'],
      },
      fontSize: {
        /* [size, {lineHeight, letterSpacing}] — see §1 type scale */
        h1: ['48px', { lineHeight: 'normal' }],
        'h1-sm': ['56px', { lineHeight: 'normal' }],
        h2: ['40px', { lineHeight: 'normal' }],
        'h2-sm': ['44px', { lineHeight: 'normal' }],
        h3: ['24px', { lineHeight: '28px' }],
        'h3-sm': ['28px', { lineHeight: '32px' }],
        h4: ['20px', { lineHeight: '24px', letterSpacing: '-0.24px' }],
        'h4-sm': ['24px', { lineHeight: '28px', letterSpacing: '-0.24px' }],
        h5: ['16px', { lineHeight: '24px' }],
        p: ['14px', { lineHeight: '20px' }],
        small: ['12px', { lineHeight: '16px' }],
        'title-h1': ['48px', { lineHeight: '68px' }],
        'title-h1-sm': ['56px', { lineHeight: '68px' }],
        'title-h2': ['44px', { lineHeight: '52px' }],
        'title-h2-sm': ['48px', { lineHeight: '56px' }],
        'title-h3': ['40px', { lineHeight: '48px' }],
        'title-h3-sm': ['44px', { lineHeight: '51px' }],
        'title-h4': ['28px', { lineHeight: '32px' }],
        description: ['16px', { lineHeight: '24px' }],
        badge: ['14px', { lineHeight: '20px' }],
        readout: ['15px', { letterSpacing: '1.5px' }],
      },
      backgroundImage: {
        'gradient-background-6': 'linear-gradient(0deg, #d8ecf80f 0%, #98c0ef0f 100%)',
        'gradient-loud-100': 'linear-gradient(0deg, #d8ecf8 0%, #98c0ef 100%)',
        'gradient-subdued-12': 'linear-gradient(0deg, #d8ecf81f 0%, #98c0ef1f 100%)',
        'gradient-label': 'linear-gradient(#98c0ef 0%, #d8ecf8 100%)',
        'status-green': 'linear-gradient(#c9ffd5 0%, #caf1fd 100%)',
        'status-blue': 'linear-gradient(#8ebbff 0%, #bedefc 100%)',
        'status-pink': 'linear-gradient(#ed98ef 0%, #fde9ca 100%)',
        'status-cyan': 'linear-gradient(#98daef 0%, #d7cafd 100%)',
        'status-bar-red': 'linear-gradient(90deg, #fe90be 0%, #ff9595 100%)',
      },
      transitionTimingFunction: {
        house: 'cubic-bezier(.6,.6,0,1)',
        quart: 'cubic-bezier(.165,.84,.44,1)',
      },
    },
  },
  plugins: [],
}
