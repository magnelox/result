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
          maroon: '#8B1A1A',
          'maroon-dark': '#6B1313',
          'maroon-light': '#A62424',
          navy: '#0B1F3A',
          'navy-dark': '#061324',
          'navy-light': '#142F55',
          blue: '#1D4ED8',
          'blue-light': '#EFF6FF',
          bg: '#F7F9FC',
          border: '#D9E1EC',
          text: '#172033',
          success: '#16803C',
          warning: '#B7791F',
          error: '#C62828',
          gold: '#8B1A1A', // Using #8B1A1A for primary brand accent/trims
          'gold-light': '#F8ECEC',
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
