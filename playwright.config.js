// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Every check here exists because the bug it catches actually happened during
 * this build. Notes on each are in tests/site.spec.js.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Serve dist/ — the thing that actually ships, not the working folder. */
  webServer: process.env.BASE_URL ? undefined : {
    command: 'bash build.sh && npx --yes serve dist -l 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    /* A real device profile. The mobile section-order bug survived for hours
       because this viewport was never rendered — only measured. */
    { name: 'mobile',  use: { ...devices['iPhone 13'] } },
  ],
});
