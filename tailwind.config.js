/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#050607",
        deepspace: "#090C10",
        metallic: {
          gold: "#D4A72C",
          bright: "#FFD84D",
          amber: "#FF9F1C",
          dark: "#8C6A15"
        },
        softwhite: "#F5F5F5",
        mutedsilver: "#A9AFB8"
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFD84D 0%, #D4A72C 50%, #8C6A15 100%)',
        'dark-gradient': 'linear-gradient(180deg, rgba(9, 12, 16, 0.95) 0%, rgba(5, 6, 7, 0.98) 100%)',
        'gold-border-glow': 'radial-gradient(circle at center, rgba(212, 167, 44, 0.3) 0%, transparent 70%)'
      },
      boxShadow: {
        'gold-sm': '0 0 10px rgba(212, 167, 44, 0.25)',
        'gold-md': '0 0 25px rgba(212, 167, 44, 0.4)',
        'gold-lg': '0 0 45px rgba(212, 167, 44, 0.6)',
        'amber-glow': '0 0 20px rgba(255, 159, 28, 0.4)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'sweep': 'sweep 4s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        }
      }
    },
  },
  plugins: [],
}
