/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f4',
          100: '#dcede5',
          200: '#bbdacc',
          300: '#8fc0a9',
          400: '#60a082',
          500: '#3d8262',
          600: '#2d674d',
          700: '#245340',
          800: '#1e4234',
          900: '#1a3a2d',
          950: '#0d1f18',
        },
        gold: {
          300: '#f5d78e',
          400: '#f0c84a',
          500: '#d4a017',
          600: '#b8860b',
        },
        cream: {
          50: '#fdfaf5',
          100: '#faf4e8',
          200: '#f5e8cc',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'ticker': 'ticker 25s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
