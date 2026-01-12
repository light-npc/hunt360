/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}" 
  ],
  theme: {
    extend: {
      colors: {
        huntPurple: '#6D28D9',
        huntDark: '#1E1B4B',
        huntLight: '#F3E8FF'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // --- ADD THIS SECTION ---
      keyframes: {
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      },
      animation: {
        slowZoom: 'slowZoom 20s ease-in-out infinite alternate',
        scanline: 'scanline 8s linear infinite',
      }
      // ------------------------
    },
  },
  plugins: [],
}