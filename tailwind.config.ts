import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#000000',
          panel: '#080b12',
          panelAlt: '#0d121c',
          accent: '#9cd8ff',
          accentStrong: '#71cfff',
          text: '#eaf6ff',
          subtle: '#9bb4c9',
          success: '#83f5cc',
          danger: '#ff8f9f'
        }
      },
      fontFamily: {
        display: ['"Lexend"', '"Trebuchet MS"', 'sans-serif'],
        body: ['"Atkinson Hyperlegible"', '"Segoe UI"', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(156,216,255,0.14), 0 10px 24px rgba(99,197,255,0.08)'
      },
      keyframes: {
        'float-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'float-in': 'float-in 450ms ease-out both'
      }
    }
  },
  plugins: []
} satisfies Config;
