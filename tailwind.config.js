/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ssu: {
          navy: '#002147',
          'navy-dark': '#001833',
          'navy-light': '#0a3266',
          gold: '#D4AF37',
          'gold-dark': '#b59226',
          'gold-light': '#f4e5a1',
          maroon: '#6B1D2F',
          cream: '#FAF8F5',
        },
      },
      fontFamily: {
        serif: ['Times New Roman', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
