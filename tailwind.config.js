/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    {
      pattern: /(bg|text|border|ring)-(slate|sky|amber|violet|emerald|blue|rose|purple|cyan|orange|indigo|fuchsia)-(50|100|200|300|400|500|600|700|800|900|950)/,
      variants: ['hover', 'group-hover', 'focus'],
    },
    {
      pattern: /border-l-(slate|sky|amber|violet|emerald|blue|rose|purple|cyan|orange|indigo|fuchsia)-(500|600|800)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E293B', // bg-slate-800
          hover: '#0F172A',   // text-slate-900
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        secondary: {
          DEFAULT: '#0284C7', // bg-sky-600
          hover: '#0369A1',   // sky-700
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        accent: {
          DEFAULT: '#0284C7', // sky-600
          hover: '#0369A1',
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
        highlight: {
          time: {
            DEFAULT: '#F59E0B', // amber-500 (Control de tiempos y veeduría)
            hover: '#D97706',
            50: '#FFFBEB',
            100: '#FEF3C7',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
          },
          media: {
            DEFAULT: '#8B5CF6', // violet-500 (Multimedia y Laboratorio)
            hover: '#7C3AED',
            50: '#F5F3FF',
            100: '#EDE9FE',
            500: '#8B5CF6',
            600: '#7C3AED',
            700: '#6D28D9',
          }
        },
        slatebg: '#F8FAFC', // Canvas bg-slate-50
        textmain: '#0F172A', // text-slate-900
        custommuted: '#94A3B8',
        // Mapeo retrocompatible para componentes existentes
        cream: {
          50: '#FFFFFF',
          100: '#F8FAFC', // Canvas bg-slate-50
          200: '#E2E8F0',
          300: '#CBD5E1',
        },
        sage: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          500: '#0EA5E9',
          600: '#0284C7', // sky-600
          700: '#0369A1',
          800: '#1E293B', // slate-800
        },
        coral: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B', // amber-500
          600: '#D97706',
        },
        charcoal: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B', // slate-800
          900: '#0F172A', // slate-900
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'xs': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'sm': '0 2px 6px -1px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
        'md': '0 6px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
        'lg': '0 12px 24px -4px rgba(15, 23, 42, 0.09), 0 4px 10px -3px rgba(15, 23, 42, 0.05)',
        'xl': '0 20px 32px -6px rgba(15, 23, 42, 0.10), 0 8px 16px -4px rgba(15, 23, 42, 0.06)',
        '2xl': '0 28px 50px -10px rgba(15, 23, 42, 0.14)',
        'soft': '0 10px 30px -10px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'card': '0 4px 18px 0 rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        'floating': '0 24px 48px -12px rgba(15, 23, 42, 0.12), 0 8px 20px -4px rgba(15, 23, 42, 0.06)',
      }
    },
  },
  plugins: [],
}
