/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(171, 100%, 41%)',
        danger: '#ff3860',
        'danger-hover': '#ff2849',
        'text-primary': '#363636',
      },
      fontFamily: {
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      minWidth: {
        '300': '300px',
      },
      maxWidth: {
        '400': '400px',
        '800': '800px',
      },
      height: {
        '550': '550px',
      },
      fontSize: {
        'clamp-clock': 'clamp(50px, 20cqw, 300px)',
        'mobile-clock': '120px',
      },
      spacing: {
        '6em': '6em',
        '2.5': '0.625rem',
      },
      margin: {
        '2.5': '0.625rem',
      },
      padding: {
        '2.5': '0.625rem',
      },
      gap: {
        '2.5': '0.625rem',
      }
    },
  },
  plugins: [],
  // Ensure CSS compatibility
  corePlugins: {
    preflight: true, // Ensure base style reset takes effect
  },
  // Disable certain modern features if older browser support is needed
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
