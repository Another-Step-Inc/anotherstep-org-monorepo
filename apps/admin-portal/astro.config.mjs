import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

const allowedHostnames = new Set([
  'localhost',
  '127.0.0.1',
  'host.docker.internal',
]);
if (process.env.ADMIN_PORTAL_HOST) allowedHostnames.add(process.env.ADMIN_PORTAL_HOST);

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: {
    allowedDomains: [...allowedHostnames].map((hostname) => ({ hostname })),
  },
  server: {
    allowedHosts: [
      'host.docker.internal',
    ],
    host: true,
    port: 4323,
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['host.docker.internal'],
      hmr: {
        host: 'localhost',
        port: 4323,
        clientPort: 4323,
      },
      watch: {
        usePolling: true,
        interval: 100,
        ignored: ['!**/node_modules/@anothersteporg/ui/**'],
      },
      fs: {
        allow: ['/app'],
      },
    },
  },
});
