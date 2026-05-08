export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'game-bg': '#0a0a0f',
        'game-card': '#13131a',
        'game-border': '#2a2a3a',
        'game-accent': '#c4b5fd',
        'game-success': '#4ade80',
        'game-danger': '#f87171',
        'game-warning': '#fbbf24',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        body: ['Sora', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'countdown': 'countdown 1s linear forwards',
        'timer-bar': 'timerBar linear forwards',
        'confetti-fall': 'confettiFall linear forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        timerBar: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
