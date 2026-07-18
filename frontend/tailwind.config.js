/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        primary: {
          50: '#F4F5FF',
          100: '#E5E7FF',
          200: '#C8CCFF',
          300: '#A3ABFF',
          400: '#7E86FA',
          500: '#5655E5',
          600: '#403CC4',
          700: '#322F9E',
          800: '#26247A',
          900: '#19184D',
          950: '#0E0D2B',
        },
        accent: {
          cyan: '#06B6D4',
          orange: '#F97316',
        },
        surface: {
          light: '#FAFAFC',
          dark: '#070810',
          darkcard: '#0D0F1C',
        },
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #403CC4 0%, #5655E5 100%)',
      },
      boxShadow: {
        card: '0 8px 32px -8px rgba(25, 24, 77, 0.08), 0 2px 8px -2px rgba(25, 24, 77, 0.04)',
        'card-dark': '0 8px 32px -8px rgba(0, 0, 0, 0.4), 0 2px 8px -2px rgba(0, 0, 0, 0.2)',
        glow: '0 0 32px -8px rgba(86, 85, 229, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
