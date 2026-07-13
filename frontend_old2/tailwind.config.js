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
          50: '#EEF0FF',
          100: '#E0E3FF',
          200: '#C3C9FF',
          300: '#9CA5FF',
          400: '#7A7FFA',
          500: '#5B54F0',
          600: '#4338CA',
          700: '#372DA6',
          800: '#2B2380',
          900: '#1E1B4B',
          950: '#131230',
        },
        accent: {
          cyan: '#06B6D4',
          orange: '#FB923C',
        },
        surface: {
          light: '#F8F9FE',
          dark: '#0B0E1A',
          darkcard: '#131730',
        },
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #4338CA 0%, #6D28D9 50%, #5B54F0 100%)',
        'grad-radial-glow': 'radial-gradient(circle at 50% 0%, rgba(91,84,240,0.25), transparent 60%)',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(91,84,240,0.5)',
        'glow-cyan': '0 0 30px -8px rgba(6,182,212,0.55)',
        card: '0 4px 24px -8px rgba(30,27,75,0.12)',
        'card-dark': '0 4px 24px -8px rgba(0,0,0,0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'route-dash': {
          to: { strokeDashoffset: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
