// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Astro-specific server settings
  server: {
    host: true,
    port: 4322,
  },
  vite: {
    plugins: [tailwindcss({
      configFile: '../../packages/ui/tailwind.config.mjs',
    })],
    server: {
      hmr: {
        host: 'localhost',
        port: 4322,
      },
      watch: {
        usePolling: true,
        interval: 100,
        ignored: ['!**/node_modules/@anothersteporg/ui/**']
      },
      fs: {
        allow: ['/app'],
      },
    },
  },
});
