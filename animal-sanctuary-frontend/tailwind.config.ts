import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Animal Sanctuary Theme Colors - Warm, Welcoming, Professional
        sanctuary: {
          // Warm earth tones for primary branding
          primary: {
            50: '#fdf7f0',
            100: '#faebd7',
            200: '#f4d3ae',
            300: '#ecb572',
            400: '#e39849',
            500: '#d97828', // Main brand color - warm golden brown
            600: '#cb5c1e',
            700: '#a8451a',
            800: '#87381b',
            900: '#6d2e19',
            950: '#3b1609',
          },
          // Soft greens for nature/growth/health
          nature: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',  // Healthy green
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            950: '#052e16',
          },
          // Calming blues for trust/care/medical
          care: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',  // Trust blue
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
          // Warm grays for neutrals
          neutral: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c',
            600: '#57534e',
            700: '#44403c',
            800: '#292524',
            900: '#1c1917',
            950: '#0c0a09',
          },
          // Accent colors for status and alerts
          accent: {
            amber: '#f59e0b',     // Warning/pending
            rose: '#f43f5e',      // Error/urgent
            emerald: '#10b981',   // Success/approved
            sky: '#0ea5e9',       // Info/available
            purple: '#8b5cf6',    // Special/featured
          }
        },
        // Shadcn/ui compatibility
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Poppins', 'system-ui', 'sans-serif'], // Playful for animal themes
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': "url('/images/hero-pattern.svg')",
        'paw-pattern': "url('/images/paw-pattern.svg')",
        'sanctuary-gradient': 'linear-gradient(135deg, #fdf7f0 0%, #f0fdf4 50%, #eff6ff 100%)',
        'warm-gradient': 'linear-gradient(135deg, #d97828 0%, #e39849 100%)',
        'nature-gradient': 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
        'care-gradient': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-in-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'heart-beat': 'heart-beat 1.5s ease-in-out infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-gentle': {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-8px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(217, 120, 40, 0.1), 0 10px 20px -2px rgba(217, 120, 40, 0.04)',
        'medium': '0 4px 25px -5px rgba(217, 120, 40, 0.15), 0 10px 10px -5px rgba(217, 120, 40, 0.08)',
        'large': '0 10px 50px -12px rgba(217, 120, 40, 0.25)',
        'nature': '0 4px 25px -5px rgba(34, 197, 94, 0.15), 0 10px 10px -5px rgba(34, 197, 94, 0.08)',
        'care': '0 4px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.08)',
        'warm': '0 8px 30px -8px rgba(217, 120, 40, 0.3)',
        'glow': '0 0 20px rgba(217, 120, 40, 0.3)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config