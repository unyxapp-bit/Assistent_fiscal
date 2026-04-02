import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@heroui/react/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: '#FFFFFF',
        surfaceStrong: '#FDFDF9',
        bg: '#F7F7F2',
        border: '#DCFCE7',
        borderDark: '#BFE6CC',
        ink: '#374151',
        muted: '#6B7280',
        inkDark: '#1F2937',
        mutedDark: '#6B7280',
        action: {
          DEFAULT: '#059669',
          hover: '#0EA5E9',
        },
        success: {
          DEFAULT: '#059669',
          light: '#DCFCE7',
        },
        danger: {
          DEFAULT: '#FCA5A5',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        chalk: '#F7F7F2',
        cloud: '#DCFCE7',
        primary: '#059669',
        primaryDark: '#047857',
        accent: '#0EA5E9',
        accentSoft: '#E0F2FE',
      },
      boxShadow: {
        soft: '0 18px 40px -28px rgba(12, 13, 16, 0.45)',
      },
      backgroundImage: {
        grain:
          'radial-gradient(circle at 1px 1px, rgba(12,13,16,0.08) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};

export default config;
