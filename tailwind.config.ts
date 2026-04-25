import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        ink:     { DEFAULT: '#0F1115', 2: '#1A1D26' },
        paper:   '#FAF7F0',
        cream:   '#FBF8F1',
        line:    { DEFAULT: '#E8E4DA', dark: '#262A35' },
        muted:   '#8B8578',
        text:    '#2A2620',
        gold:    { DEFAULT: '#C8941F', soft: '#F5E9CC' },
        rose:    '#C04E2E',
        emerald: '#1F5C4D',
        plum:    '#7A2E4D',
        ink2:    '#1A1D26',
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease forwards',
        'pulse-dot': 'pulseDot 2s ease infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
      },
    },
  },
  plugins: [],
}
export default config
