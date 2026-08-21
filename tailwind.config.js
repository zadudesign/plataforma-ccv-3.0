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
        primary: {
          DEFAULT: '#2D4C7C',
          hover: '#243D63',
          50: '#F0F4F9',
          100: '#DDE5F0',
          200: '#BDCEE2',
          600: '#2D4C7C',
          700: '#243D63',
          800: '#1B2F4D',
        },
        secondary: {
          DEFAULT: '#8FA0BE',
          hover: '#7A8BA8',
          50: '#F4F6F9',
          100: '#E8ECF2',
          200: '#D1D9E5',
          500: '#8FA0BE',
          600: '#7A8BA8',
        },
        accent: {
          DEFAULT: '#F6A800',
          hover: '#DF9800',
          50: '#FEF9E6',
          100: '#FDF0C3',
          500: '#F6A800',
          600: '#DF9800',
        },
        slatebg: '#F1F5F9',
        textmain: '#0D1827',
        custommuted: '#CCCCCC',
        // Mapeo retrocompatible para clases existentes
        cream: {
          50: '#FFFFFF',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CCCCCC',
        },
        sage: {
          50: '#F0F4F9',
          100: '#E8ECF2',
          200: '#8FA0BE',
          500: '#2D4C7C',
          600: '#2D4C7C',
          700: '#243D63',
          800: '#1B2F4D',
        },
        coral: {
          50: '#FEF9E6',
          100: '#FDF0C3',
          400: '#F6A800',
          500: '#F6A800',
          600: '#DF9800',
        },
        charcoal: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          400: '#8FA0BE',
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#0D1827',
          900: '#0D1827',
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(13, 24, 39, 0.08)',
        'xs': '0 1px 3px 0 rgba(13, 24, 39, 0.12), 0 1px 2px -1px rgba(13, 24, 39, 0.08)',
        'sm': '0 2px 6px -1px rgba(13, 24, 39, 0.12), 0 1px 4px -1px rgba(13, 24, 39, 0.08)',
        'md': '0 6px 16px -2px rgba(13, 24, 39, 0.14), 0 2px 6px -2px rgba(13, 24, 39, 0.10)',
        'lg': '0 12px 24px -4px rgba(13, 24, 39, 0.16), 0 4px 10px -3px rgba(13, 24, 39, 0.10)',
        'xl': '0 20px 32px -6px rgba(13, 24, 39, 0.18), 0 8px 16px -4px rgba(13, 24, 39, 0.12)',
        '2xl': '0 28px 50px -10px rgba(13, 24, 39, 0.24)',
        'soft': '0 10px 30px -10px rgba(13, 24, 39, 0.12), 0 4px 12px -2px rgba(13, 24, 39, 0.08)',
        'card': '0 4px 18px 0 rgba(13, 24, 39, 0.10), 0 1px 3px 0 rgba(13, 24, 39, 0.06)',
        'floating': '0 24px 48px -12px rgba(13, 24, 39, 0.20), 0 8px 20px -4px rgba(13, 24, 39, 0.10)',
      }
    },
  },
  plugins: [],
}
