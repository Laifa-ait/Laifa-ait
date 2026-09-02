import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    actionTimeout: 15000,
    navigationTimeout: 15000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'production',
      CSRF_SECRET: process.env.CSRF_SECRET || 'olmart_e2e_test_csrf_secret_key_2026',
      VITE_FIREBASE_API_KEY: 'AIzaSyFakeKeyForCiTesting1234567890',
      VITE_FIREBASE_AUTH_DOMAIN: 'olmart-ci-demo.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'olmart-ci-demo',
      VITE_FIREBASE_STORAGE_BUCKET: 'olmart-ci-demo.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789012',
      VITE_FIREBASE_APP_ID: '1:123456789012:web:abcdef1234567890',
    },
  },
});
