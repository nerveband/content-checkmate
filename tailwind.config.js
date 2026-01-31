/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      borderRadius: {
        'none': '0',
        'sm': 'var(--radius-sm)',
        'DEFAULT': 'var(--radius-md)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        'full': 'var(--radius-full)',
      },
      colors: {
        surface: {
          primary: '#f5f6f8',
          secondary: '#FFFFFF',
          elevated: '#FFFFFF'
        },
        accent: {
          DEFAULT: '#e67a31',
          light: '#fef0e6',
          dark: '#c4621e'
        },
        positive: {
          DEFAULT: '#27856a',
          light: '#e6f5f0',
          dark: '#1d6b55'
        },
        negative: {
          DEFAULT: '#c0392b',
          light: '#fce8e6',
          dark: '#a02e23'
        },
        warning: {
          DEFAULT: '#d4880a',
          light: '#fef3cd'
        }
      },
      fontFamily: {
        display: ['"IBM Plex Sans Variable"', '"IBM Plex Sans"', 'sans-serif'],
        body: ['"IBM Plex Sans Variable"', '"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0,0,0,0.05)',
        'card': '0 1px 4px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04)',
        'elevated': '0 4px 20px rgba(0,0,0,0.08)'
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
