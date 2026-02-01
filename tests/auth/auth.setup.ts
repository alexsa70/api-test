import { test as setup } from '@playwright/test';
import { authenticate } from '../../utils/auth';

setup('authenticate', async () => {
  await authenticate();
});