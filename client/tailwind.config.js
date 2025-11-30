/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-primary': '#0a0a0f',
        'dark-secondary': '#13131a',
        'dark-card': '#1a1a24',
        'dark-border': '#2a2a35',
      },
    },
  },
  plugins: [],
};
