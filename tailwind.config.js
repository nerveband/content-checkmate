/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: '#FAFAFA',
          secondary: '#FFFFFF',
          elevated: '#FFFFFF'
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706'
        },
        positive: {
          DEFAULT: '#059669',
          light: '#D1FAE5',
          dark: '#047857'
        },
        negative: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#B91C1C'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7'
        }
      },
      fontFamily: {
        display: ['Instrument Serif', 'Georgia', 'serif'],
        body: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0,0,0,0.05)',
        'card': '0 4px 6px -1px rgba(0,0,0,0.07)',
        'elevated': '0 10px 15px -3px rgba(0,0,0,0.08)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      }
    }
  },
  plugins: []
};
