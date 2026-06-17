/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        gold: {
          50: '#FBF8F0',
          100: '#F5EDDA',
          200: '#EBDAB5',
          300: '#DEC48A',
          400: '#D4B06E',
          500: '#C9A96E',
          600: '#B08D4A',
          700: '#8A6D38',
          800: '#6B5430',
          900: '#4D3C24',
        },
        hotel: {
          bg: '#FAF8F5',
          card: '#FFFFFF',
          dark: '#2C2C2C',
          coral: '#E8734A',
          green: '#4CAF7D',
          border: '#E8E4DE',
          muted: '#9B958C',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
