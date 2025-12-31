/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F5C76B',    // golden glow
        flame: '#FF9F1C',      // candle flame orange
        beige: '#FFF7E6',      // background / sections
        brown: '#8B5E3C',      // headers / accents
        charcoal: '#2C2C2C',   // text / footer / navbar
        flicker: '#FFD6C0',    // subtle hover / tags
        shadow: '#B0A6A1',     // muted borders / dividers
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

