/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vert sauge doux, couleur principale de l'app
        brand: {
          50: '#f1f8f4',
          100: '#dcefe3',
          200: '#bbdec9',
          300: '#8ec6a7',
          400: '#5fa882',
          500: '#3e8c66',
          600: '#2e7051',
          700: '#265a43',
          800: '#214837',
          900: '#1c3c2f',
        },
      },
    },
  },
  plugins: [],
};
