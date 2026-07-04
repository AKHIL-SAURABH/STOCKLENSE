/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:    '#080B18',
        surface: '#0D1117',
        panel:   '#131A2A',
        raised:  '#1A2438',
        border:  '#1E2A3A',

        amber: {
          DEFAULT: '#F5A623',
          dim:     '#C4831A',
        },
        bull:    '#4ADE80',
        bear:    '#FF6B6B',
        neutral: '#64B5F6',

        text: {
          primary:   '#E8EDF5',
          secondary: '#8B99B0',
          muted:     '#4A5568',
        },

        chart: {
          1: '#F5A623',
          2: '#64B5F6',
          3: '#A78BFA',
          4: '#34D399',
          5: '#F97316',
        },
      },

      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        ui:      ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        'price-hero':  ['40px', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '600' }],
        'price-large': ['28px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'label-upper': ['11px', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '700' }],
      },

      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '12px',
        xl:   '16px',
        pill: '999px',
      },

      boxShadow: {
        card:     '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        elevated: '0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
        amber:    '0 0 24px rgba(245,166,35,0.20)',
        bull:     '0 0 24px rgba(74,222,128,0.15)',
        bear:     '0 0 24px rgba(255,107,107,0.15)',
      },

      animation: {
        'glow-pulse':    'glowPulse 1800ms ease-in-out infinite alternate',
        'fade-up':       'fadeUp 300ms ease forwards',
        'slide-in':      'slideIn 250ms ease forwards',
        'skeleton-wave': 'skeletonWave 1500ms ease-in-out infinite',
      },

      keyframes: {
        glowPulse: {
          '0%':   { opacity: '0.6' },
          '100%': { opacity: '1.0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        skeletonWave: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
