/**
 * Expedia EGDS-derived Tailwind theme.
 * Tokens extracted from live expedia.com — see /Hackathon1/expedia_design_reference.md.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#191E3B', ink: '#0C0E1C', 800: '#0F2138' },
        action: {
          DEFAULT: '#1668E3',
          hover: '#0D4EAF',
          active: '#0E3672',
          subtle: '#ECF4FD',
          selected: '#C8DFF9',
        },
        brand: { yellow: '#FDDB32', gold: '#FFB800' },
        surface: { base: '#FFFFFF', contrast: '#EFF3F7', highlight: '#FFF9D9' },
        ink: { DEFAULT: '#191E3B', muted: '#676A7D', inverse: '#FFFFFF' },
        divider: '#DFE0E4',
        positive: '#227950',
        negative: '#A7183C',
        info: '#7C6F9B',
        featured: '#6AE0EB',
      },
      fontFamily: {
        sans: ['"Centra No2"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Reckless XPD"', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem',
        full: '9999px',
      },
      boxShadow: {
        float: '0px 2px 0.75rem rgba(12, 14, 28, 0.08)',
      },
    },
  },
  plugins: [],
};
