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
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: 'var(--c-surface)',
        surfaceStrong: 'var(--c-surface-soft)',
        bg: 'var(--c-bg)',
        border: 'var(--c-border)',
        borderDark: 'var(--c-border-strong)',
        ink: 'var(--c-text-primary)',
        muted: 'var(--c-text-secondary)',
        inkDark: 'var(--c-text-primary)',
        mutedDark: 'var(--c-text-secondary)',
        action: {
          DEFAULT: 'var(--c-primary)',
          hover: 'var(--c-secondary)',
        },
        success: {
          DEFAULT: 'var(--c-primary)',
          light: 'var(--c-primary-light)',
        },
        danger: {
          DEFAULT: 'var(--c-danger)',
          light: 'var(--c-danger-light)',
        },
        warning: {
          DEFAULT: 'var(--c-warning)',
          light: 'var(--c-warning-light)',
        },
        chalk: 'var(--c-bg)',
        cloud: 'var(--c-border)',
        primary: 'var(--c-primary)',
        primaryDark: 'var(--c-primary-hover)',
        accent: 'var(--c-secondary)',
        accentSoft: 'var(--c-secondary-light)',
        dangerText: 'var(--color-danger-text)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
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
