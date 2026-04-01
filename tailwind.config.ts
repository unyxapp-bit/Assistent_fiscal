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
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: '#1C2440',
        surfaceStrong: '#232C4A',
        bg: '#0F1324',
        border: '#2F3A5A',
        borderDark: '#3A4771',
        ink: '#F1F4FA',
        muted: '#9AA4B5',
        inkDark: '#2C2C2A',
        mutedDark: '#6F6E69',
        action: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
        },
        success: {
          DEFAULT: '#6AA84F',
          light: '#23351D',
        },
        danger: {
          DEFAULT: '#E45B5B',
          light: '#5B2C35',
        },
        warning: {
          DEFAULT: '#F1A23B',
          light: '#3A2B13',
        },
        chalk: '#0F1324',
        cloud: '#2F3A5A',
        primary: '#3B82F6',
        primaryDark: '#2563EB',
        accent: '#F1A23B',
        accentSoft: '#3A2B13',
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
