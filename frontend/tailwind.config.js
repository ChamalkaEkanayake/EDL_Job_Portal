/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ceb: {
          blue: '#0284c7', // Professional CEB primary blue
          darkBlue: '#0369a1',
          navy: '#0f172a',
          accent: '#f59e0b', // CEB electrical amber/gold accent
          lightBg: '#f8fafc',
          sidebarBg: '#ffffff',
          cardBg: '#ffffff',
          border: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}
