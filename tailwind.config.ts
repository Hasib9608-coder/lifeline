import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory:    '#FBF8F1',
        pearl:    '#F2EDE2',
        bone:     '#EEE8D9',
        ink:      '#0F1B2D',
        'ink-2':  '#1A2942',
        'ink-3':  '#3A4A66',
        muted:    '#6B7280',
        line:     '#E5DFCF',
        royal:    '#1E3A8A',
        'royal-soft': '#3B5BB8',
        emerald:  '#047857',
        'emerald-soft': '#10B981',
        gold:     '#B8860B',
        'gold-soft': '#D4A436',
        lavender: '#C7C5E0',
        blood:    '#B91C1C',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        bn:      ['var(--font-bangla)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        'tightest': '-0.04em',
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'draw': 'draw 2.5s ease-out forwards',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'draw': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'shimmer': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
