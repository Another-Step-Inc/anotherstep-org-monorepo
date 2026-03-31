// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Astro-specific server settings
  server: {
    host: true,
    port: 4321,
  },
  vite: {
    plugins: [tailwindcss({
      configFile: '../../packages/ui/tailwind.config.mjs',
    })],
    server: {
      hmr: {
        protocol: 'ws',      // Explicitly use non-secure websocket
        host: 'localhost',
        port: 4321,
        clientPort: 4321,    // Forces browser to use this port
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
