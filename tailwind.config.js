/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: '#0B4A31',
        teal: '#8BC9C0',
        terracotta: '#C85A3A',
        offwhite: '#FAF8F4',
        dark: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Belgrano', 'serif'],
      },
    },
  },
  plugins: [],
};
