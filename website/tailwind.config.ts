import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'bg-1': 'url("/bg-1.jpg")',
      },
      colors: {
        'text-1': 'var(--text-color-1)',
        'text-2': 'var(--text-color-2)',
        'text-3': 'var(--text-color-3)',
        'bg-1': 'var(--bg-color-1)',
        'bg-2': 'var(--bg-color-2)',
        'chat-1': 'var(--chat-color-1)',
        'chat-2': 'var(--chat-color-2)',

        'home-bg': 'rgba(0, 0, 0, 0.7)',
      },
      height: {
        'navbar-height': 'var(--navbar-height)'
      },
      padding: {
        'navbar-height': 'var(--navbar-height)'
      }
    },
  },
  plugins: [],
}
export default config
