/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        playfair: ['Playfair Display', 'serif'],
      },
      colors: {
        vercel: {
          bg: '#FAFAFA',
          elevated: '#FFFFFF',
          recessed: '#F2F2F2',
          hover: '#EBEBEB',
          text: '#171717',
          secondary: '#4D4D4D',
          muted: '#8F8F8F',
          blue: '#0072F5',
        },
        darkSurface: {
          canvas: '#000000',
          elevated: '#0f0f11',
          recessed: '#161618',
          hover: '#222226',
          border: 'rgba(255, 255, 255, 0.12)',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0a3651',
        }
      },
      boxShadow: {
        'vercel-border': '0 0 0 1px rgba(0, 0, 0, 0.08)',
        'vercel-border-dark': '0 0 0 1px rgba(255, 255, 255, 0.12)',
        'vercel-card': '0 0 0 1px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'vercel-card-dark': '0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.6)',
        'vercel-focus': '0 0 0 2px #FFFFFF, 0 0 0 4px #0072F5',
        'vercel-focus-dark': '0 0 0 2px #000000, 0 0 0 4px #0072F5',
      }
    },
  },
  plugins: [],
}
