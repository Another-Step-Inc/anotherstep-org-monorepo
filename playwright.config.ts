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

  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
});