import type { Config } from 'tailwindcss';

/**
 * Design tokens are the ONLY source of style values (see docs/BUILD_SPEC.md §3).
 * Components must reference these token names, never raw hex/px that bypass the theme.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#4E2FD2',
          selected: 'rgba(78,47,210,0.7)',
        },
        ink: {
          DEFAULT: '#0B0D10',
          title: '#1F1F1F',
        },
        muted: {
          DEFAULT: '#575757',
          2: 'rgba(31,31,31,0.75)',
          3: '#484848', // "Save my system for later" italic link
        },
        danger: '#D8392B',
        success: {
          DEFAULT: '#0AA288',
          tint: 'rgba(29,240,187,0.04)',
        },
        gray: {
          100: '#F1F1F2', // disabled stepper fill
          200: '#F0F4F7',
          300: '#E6EBF0',
          400: '#CED6DE',
          500: '#A8B2BD',
          600: '#6F7882',
          700: '#525963',
        },
        'lavender-surface': '#EDF4FF',
      },
      fontFamily: {
        sans: ['Gilroy', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // token / [size, { lineHeight, letterSpacing }]
        badge: ['12px', { lineHeight: 'normal' }],
        'variant-label': ['10px', { lineHeight: '1', letterSpacing: '0.6px' }],
        desc: ['12px', { lineHeight: '1.3' }],
        price: ['16px', { lineHeight: '1', letterSpacing: '0.6px' }],
        'card-title': ['16px', { lineHeight: '1', letterSpacing: '0.6px' }],
        'stepper-num': ['16px', { lineHeight: '20px' }],
        'step-title': ['22px', { lineHeight: '1.2' }],
        button: ['16px', { lineHeight: '1' }],
        'next-btn': ['18px', { lineHeight: '24px' }],
        checkout: ['17px', { lineHeight: 'normal' }],
        'total-label': ['16px', { lineHeight: '1' }],
        'total-strike': ['18px', { lineHeight: '20px' }],
        'total-current': ['24px', { lineHeight: '32px', letterSpacing: '-0.03px' }],
        'line-name': ['14px', { lineHeight: '1.2' }],
        link: ['13px', { lineHeight: '17px' }],
        'fine-print': ['11px', { lineHeight: '1.3' }],
        eyebrow: ['12px', { lineHeight: '1', letterSpacing: '0.6px' }],
      },
      borderRadius: {
        card: '10px',
        'product-img': '5px',
        chip: '2px',
        stepper: '4px',
        badge: '10px',
        checkout: '4px',
        'next-btn': '7px',
      },
      spacing: {
        'card-pad': '11px',
        'card-gap': '19px',
      },
      boxShadow: {
        card: '0px 1px 3px rgba(0,0,0,0.04)',
      },
      screens: {
        // md = tablet bridge (no Figma artboard — engineered), lg = desktop
        md: '640px',
        lg: '1024px',
      },
    },
  },
  plugins: [],
};

export default config;
