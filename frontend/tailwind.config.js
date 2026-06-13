/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#8b93f8',
          500: '#7c6df4',
          600: '#6c4fe8',
          700: '#5c3ed4',
          800: '#4a34aa',
          900: '#3e2e86',
          950: '#261b52',
        },
        surface: {
          900: '#0a0b14',
          800: '#0f1120',
          700: '#141628',
          600: '#1c1f35',
          500: '#252847',
          400: '#2e3154',
        },
        accent: {
          cyan:   '#00d4ff',
          green:  '#00ff88',
          orange: '#ff6b35',
          red:    '#ff3366',
          yellow: '#ffd700',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-ring':    'pulse-ring 1.5s ease-out infinite',
        'sound-wave':    'sound-wave 0.8s ease-in-out infinite alternate',
        'dot-bounce':    'dot-bounce 1.2s ease-in-out infinite',
        'slide-in-right':'slide-in-right 0.3s ease-out',
        'fade-in':       'fade-in 0.2s ease-out',
        'glow':          'glow 2s ease-in-out infinite alternate',
        'scan-line':     'scan-line 3s linear infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',   opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'sound-wave': {
          '0%':   { height: '4px'  },
          '100%': { height: '20px' },
        },
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%':           { transform: 'translateY(-6px)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'glow': {
          from: { boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)' },
          to:   { boxShadow: '0 0 25px rgba(0, 212, 255, 0.7), 0 0 50px rgba(0, 212, 255, 0.3)' },
        },
        'scan-line': {
          '0%':   { top: '-2px'  },
          '100%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
}
