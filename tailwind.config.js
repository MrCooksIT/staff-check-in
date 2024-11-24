/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // We can add your school colors here
      colors: {
        primary: {
          DEFAULT: '#1a73e8', // primary color
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#ea4335', //  secondary color
          foreground: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}