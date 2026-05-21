export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        asphalt: '#111827',
        carbon: '#0b1017',
        signal: '#00d4ff',
        ember: '#ff7a45',
        mint: '#24d18b'
      },
      boxShadow: {
        premium: '0 24px 80px rgba(0,0,0,.28)'
      }
    }
  },
  plugins: []
};
