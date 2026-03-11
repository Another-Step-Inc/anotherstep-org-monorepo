/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    '../../packages/ui/src/**/*.astro', // Path to shared components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}