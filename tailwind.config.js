/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: '#1DB954',
        darkbase: '#121212', // Warna khas Spotify/Tema gelap
      }
    },
  },
  plugins: [],
}