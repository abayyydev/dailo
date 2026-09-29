import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Main Primary Indigo
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          DEFAULT: '#4F46E5',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E293B', // Slate 800
        },
        canvas: {
          light: '#F8FAFC', // Slate 50 ultra-light
          dark: '#0F172A',  // Slate 900
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
