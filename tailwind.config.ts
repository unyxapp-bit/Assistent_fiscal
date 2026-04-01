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
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
      },
      colors: {
        ink: '#0C0D10',
        chalk: '#F6F4F0',
        cloud: '#E7E4DE',
        primary: '#1B5D42',
        primaryDark: '#11402D',
        accent: '#C8A24E',
        accentSoft: '#F1E1B8',
        danger: '#B42318',
        success: '#0F766E',
        info: '#1F4F99',
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
