/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cmd-bg': '#0a0b0d',
        'cmd-surface': '#111316',
        'cmd-border': '#1e2025',
        'cmd-blue': '#00c2ff',
        'cmd-green': '#7fff6e',
        'cmd-orange': '#ff6b2b',
        'cmd-muted': '#6b7280',
        'cmd-dim': '#4a5060',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
