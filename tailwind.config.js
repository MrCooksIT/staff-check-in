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
          DEFAULT: '#1a73e8', // You can change this to your school's primary color
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#ea4335', // You can change this to your school's secondary color
          foreground: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}