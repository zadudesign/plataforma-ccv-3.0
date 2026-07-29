/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF9F5',
          100: '#F4F3EE',
          200: '#E8E6DD',
          300: '#D5D2C3',
        },
        sage: {
          50: '#E8F0EC',
          100: '#D2E2D9',
          200: '#A5C5B3',
          500: '#4E725F',
          600: '#3A5A40',
          700: '#2D4A36',
          800: '#1E3324',
        },
        coral: {
          50: '#FDEAEA',
          100: '#F9D5D5',
          500: '#E53E3E',
          600: '#C53030',
        },
        charcoal: {
          50: '#F6F7F7',
          100: '#E2E5E4',
          500: '#7E8480',
          800: '#2D312E',
          900: '#1C1E1D',
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 4px 12px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px 0 rgba(0, 0, 0, 0.03)',
        'floating': '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
      }
    },
  },
  plugins: [],
}
