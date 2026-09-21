/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#64748B',
        background: '#F8FAFC',
        card: '#FFFFFF',
        text: '#0F172A',
        muted: '#94A3B8',
        danger: '#EF4444',
        success: '#10B981',
        border: '#E2E8F0',
        dark: {
          background: '#0F172A',
          card: '#1E293B',
          text: '#F1F5F9',
          muted: '#64748B',
          border: '#334155',
        },
      },
    },
  },
  plugins: [],
};