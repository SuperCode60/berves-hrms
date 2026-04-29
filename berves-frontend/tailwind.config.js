module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef3fb',
          100: '#c7d7f0',
          200: '#9fbce5',
          300: '#6f9ad8',
          400: '#4a7dcc',
          500: '#2e5fac',
          600: '#1f3a8a',
          700: '#162d6e',
          800: '#0d2053',
          900: '#071438',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
