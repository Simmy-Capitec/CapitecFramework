// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

// Read from env variables or use defaults
const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';
const HEADLESS = process.env.HEADLESS !== 'false';
const CI = !!process.env.CI;
const SLOWMO = process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Set max time for test function */
  timeout: 60000, // Changed from 30000 to 60000
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: CI,
  /* Retry tests on CI */
  retries: CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in navigation */
    baseURL: BASE_URL,
    /* Collect trace when test fails */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Record video on failure */
    video: 'on', // Changed from 'on-first-retry' to 'on'
    /* Slow down test execution by SLOWMO milliseconds */
    launchOptions: {
      slowMo: SLOWMO,
    },
    /* Set viewport size */
    viewport: { width: 1280, height: 720 },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: HEADLESS,
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: HEADLESS,
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        headless: HEADLESS,
      },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        headless: HEADLESS,
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        headless: HEADLESS,
      },
    },
  ],

});
