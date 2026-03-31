/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    '../../apps/main-site/src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    '../../apps/store-site/src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-lexend)', 'sans-serif'],
      },
      colors: {
        'brand-yellow': 'var(--color-yellow)',
        'brand-blue': 'var(--color-blue)',
        'brand-red': 'var(--color-red)',
        'brand-dark': 'var(--color-dark)',
        'brand-bg': 'var(--color-bg-light)',
        'brand-gray': 'var(--color-neutral-gray)',
      },
      borderRadius: {
        'brand': '2.5rem',
      }
    },
  },
  plugins: [],
};