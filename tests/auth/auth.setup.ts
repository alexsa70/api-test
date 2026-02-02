import { test as setup, expect } from '@playwright/test';
import { authenticate } from '../../utils/auth';

setup('authenticate', async () => {
  console.log('Test: authenticate');
  const { token } = await authenticate();
  expect(token).toBeTruthy();
  console.log('Test pass successfully');
});