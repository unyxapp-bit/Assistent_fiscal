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
        surface: '#FFFFFF',
        bg: '#F4F4F4',
        border: '#E0E0E0',
        borderDark: '#C8C8C8',
        ink: '#2C2C2A',
        muted: '#888780',
        action: {
          DEFAULT: '#444441',
          hover: '#2C2C2A',
        },
        success: {
          DEFAULT: '#639922',
          light: '#EAF3DE',
        },
        danger: {
          DEFAULT: '#E24B4A',
          light: '#FCEBEB',
        },
        warning: {
          DEFAULT: '#BA7517',
          light: '#FAEEDA',
        },
        chalk: '#F4F4F4',
        cloud: '#E0E0E0',
        primary: '#444441',
        primaryDark: '#2C2C2A',
        accent: '#BA7517',
        accentSoft: '#FAEEDA',
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
