import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx', 'src/tests/**/*.spec.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    maxWorkers: 1,
    minWorkers: 1,
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**'],
      thresholds: {
        lines: 20,
        functions: 20,
        branches: 15,
        statements: 20,
      },
      exclude: [
        'coverage/**',
        'dist/**',
        'node_modules/**',
        'src/tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        'scripts/**',
        'src/constants.tsx',
        'src/utils/translations.ts',
        'src/swagger/openapi.ts',
        'src/data/**',
        'src/domains/**/data/**',
      ],
    },
    env: {
      VITE_FIREBASE_API_KEY: 'test-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'localhost',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
    },
  },
});
