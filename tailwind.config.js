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
          brand: '#672C1C',
          'brand-dark': '#4D2115',
          'brand-light': '#803723',
          navy: '#672C1C', // Using #672C1C for primary headers, navbars & banners
          'navy-dark': '#4D2115',
          'navy-light': '#803723',
          maroon: '#672C1C',
          blue: '#1D4ED8',
          'blue-light': '#EFF6FF',
          bg: '#F7F9FC',
          border: '#D9E1EC',
          text: '#172033',
          success: '#16803C',
          warning: '#B7791F',
          error: '#C62828',
          gold: '#D4AF37',
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
