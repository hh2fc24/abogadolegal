/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        legal: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53', // Deep Blue
          900: '#102a43', // Darker Blue
          navy: '#191e3c', // Exact border match from public/logo_nav.jpeg
          gold: {
            400: '#e3c065',
            500: '#d4af37', // Mustard/Gold
            600: '#b08d26',
          },
        },
        gold: {
          400: '#e3c065',
          500: '#d4af37', // Mustard/Gold
          600: '#b08d26',
        },
      },
      fontFamily: {
        serif: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: { smooth: 'cubic-bezier(.22,1,.36,1)' },
      animation: {
        marquee: 'marquee 120s linear infinite',
        'gradient-xy': 'gradient-xy 3s ease infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
    },
  },
  plugins: [],
};
