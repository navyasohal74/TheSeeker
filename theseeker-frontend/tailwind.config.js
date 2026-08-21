/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theseeker-cream': '#EFECE3',
        'theseeker-light-blue': '#8FABD4',
        'theseeker-blue': '#4A70A9',
        'theseeker-dark': '#000000',
      },
    },
  },
  plugins: [],
}