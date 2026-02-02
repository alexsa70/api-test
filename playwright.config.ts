import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const headless = process.env.HEADLESS
  ? process.env.HEADLESS.toLowerCase() !== 'false'
  : true;
const timeout = process.env.TIMEOUT ? Number(process.env.TIMEOUT) : 30000;
const actionTimeout = process.env.ACTION_TIMEOUT
  ? Number(process.env.ACTION_TIMEOUT)
  : 10000;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Отключаем параллельность для последовательного выполнения
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout,
  workers: 1, // Один worker для использования общего токена
  reporter: 'html',

  use: {
    headless,
    baseURL: process.env.API_BASE_URL || 'https://api.example.com',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    actionTimeout,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'api-tests',
      dependencies: ['setup'],
      use: {
        storageState: '.auth/user.json',
      },
    },
  ],
});