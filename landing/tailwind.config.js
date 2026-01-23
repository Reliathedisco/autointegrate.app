/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9ACD32',
        secondary: '#FF69B4',
        accent: '#006D77',
        dark: '#0A0A0A',
      },
    },
  },
  plugins: [],
};
