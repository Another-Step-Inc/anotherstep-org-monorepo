import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'main-site',
      testDir: './apps/main-site/tests',
      use: {
        baseURL: 'http://localhost:4321',
      },
    },
    {
      name: 'store-site',
      testDir: './apps/store-site/tests',
      use: {
        baseURL: 'http://localhost:4322',
      },
    },
  ],

  webServer: [
    {
      command: 'pnpm --filter main-site dev --host 0.0.0.0 --port 4321',
      url: 'http://127.0.0.1:4321',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'pnpm --filter store-site dev --host 0.0.0.0 --port 4322',
      url: 'http://127.0.0.1:4322',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],

  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
});