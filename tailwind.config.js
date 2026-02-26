/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // پشتڕاستکرنا سیستەمێ تاری و ڕوون
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // زێدەکرنا ئەنیمەیشنێن تایبەت بۆ دیزاینێ Luxury
      animation: {
        'slow-zoom': 'slow-zoom 20s infinite alternate linear',
        'blob': 'blob 7s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.15)' },
        },
        'blob': {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
      // دشێی ڕەنگێن تایبەت ل ڤێرە زێدە بکەی ئەگەر تە دڤێت
      colors: {
        indigo: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#adc0fb',
          400: '#8ca7f9',
          500: '#6b8ef7',
          600: '#4a75f5', // ڕەنگێ سەرەکی یێ براندی
          700: '#3858b8',
          800: '#253a7a',
          900: '#131d3d',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
    },
  },
  plugins: [
    // ئەگەر تە دڤێت Scrollbar دیار نەبیت (وەک مە د کۆدێ Home دا نڤێسی)
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
      })
    },
  ],
}