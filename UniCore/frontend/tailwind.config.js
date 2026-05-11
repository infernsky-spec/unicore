/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#1d4ed8', 700: '#1e40af',
          800: '#1e3a8a', 900: '#172554',
        },
        unicore: {
          navy: '#0f1f3d', gold: '#f59e0b', blue: '#1d4ed8',
          teal: '#0891b2', green: '#059669', red: '#dc2626',
        },
        dark: {
          bg:      '#0a0a0c',
          surface: '#111113',
          card:    '#18181b',
          border:  'rgba(255,255,255,0.06)',
        }
      },
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in':        'fadeIn 0.3s ease-in-out',
        'slide-up':       'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow':     'pulse 3s infinite',
        'shimmer':        'shimmer 1.5s infinite',
        'mesh':           'meshMove 12s ease-in-out infinite',
        'pulse-glow':     'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:      { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        shimmer:      { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        meshMove:     {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%':      { transform: 'translate(5%, -5%) scale(1.05)' },
          '66%':      { transform: 'translate(-3%, 4%) scale(0.98)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(217,119,6,0.25)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(217,119,6,0)' },
        },
      },
      boxShadow: {
        'card':     '0 2px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)',
        'card-hover':'0 8px 24px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.06)',
        '3d':       '0 20px 40px -10px rgba(0,0,0,0.12), 0 10px 20px -5px rgba(0,0,0,0.06)',
        '3d-dark':  '0 20px 40px -10px rgba(0,0,0,0.6), 0 10px 20px -5px rgba(0,0,0,0.4)',
        'neon-amber': '0 0 20px rgba(217,119,6,0.35)',
        'neon-amber-lg': '0 0 40px rgba(217,119,6,0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};
