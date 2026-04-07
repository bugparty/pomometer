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
  // 确保CSS兼容性
  corePlugins: {
    preflight: true, // 确保基础样式重置生效
  },
  // 如果需要支持较旧浏览器，可以禁用某些现代特性
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
