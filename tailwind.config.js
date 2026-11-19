/** @type {import('tailwindcss').Config} */
// Paleta SecDocs (igual que las variables del Figma):
//   Verde bosque #00412E · Salvia #96BF8A · Niebla #E8EAE5 · Blanco #FFFFFF
// Los colores de alerta (danger/warning/info) se conservan porque la paleta no trae rojo ni ámbar.
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bosque: {
          DEFAULT: '#00412E',
          hover: '#00573E',
          neutral: 'rgba(0, 65, 46, 0.85)', // color/neutral/text del Figma
          soft: 'rgba(0, 65, 46, 0.72)', // texto secundario
          muted: 'rgba(0, 65, 46, 0.55)', // texto de ayuda
        },
        salvia: '#96BF8A',
        niebla: '#E8EAE5',
        success: { bg: 'rgba(150, 191, 138, 0.22)', border: '#96BF8A', text: '#00412E' },
        danger: { bg: '#FCEDED', border: '#E3A1A1', text: '#9B1C1C' },
        warning: { bg: '#FFF5DD', border: '#E5C26F', text: '#6B4500' },
        info: { bg: '#E3EEF0', border: '#9CC0C9', text: '#1E4E5C' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
