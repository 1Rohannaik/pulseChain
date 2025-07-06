/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0fa',
          100: '#cce0f5',
          200: '#99c2eb',
          300: '#66a3e0',
          400: '#3385d6',
          500: '#0275d8', // primary blue
          600: '#0260ad',
          700: '#014682',
          800: '#013057',
          900: '#00182b',
        },
        secondary: {
          50: '#e8f8f3',
          100: '#d1f2e7',
          200: '#a3e4cf',
          300: '#75d7b7',
          400: '#47ca9f',
          500: '#28a745', // success green
          600: '#208637',
          700: '#186429',
          800: '#10431c',
          900: '#08210e',
        },
        danger: {
          50: '#fcebee',
          100: '#f8d7dd',
          200: '#f2afbb',
          300: '#eb8799',
          400: '#e55f77',
          500: '#dc3545', // emergency red
          600: '#b12a37',
          700: '#852029',
          800: '#58151c',
          900: '#2c0b0e',
        },
        warning: {
          50: '#fff9e6',
          100: '#fff3cc',
          200: '#ffe799',
          300: '#ffdb66',
          400: '#ffcf33',
          500: '#ffc107',
          600: '#cc9a06',
          700: '#997304',
          800: '#664d03',
          900: '#332601',
        },
        neutral: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}