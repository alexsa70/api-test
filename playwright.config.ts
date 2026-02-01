import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Отключаем параллельность для последовательного выполнения
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Один worker для использования общего токена
  reporter: 'html',

  use: {
    baseURL: process.env.API_BASE_URL || 'https://api.example.com',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
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