import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth';
import { ENDPOINTS } from '../../config/endpoints';

test.describe('Users API', () => {
  let apiContext: any;
  let token: string;

  test.beforeAll(async ({ playwright }) => {
    token = getToken();
    
    apiContext = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL || 'https://api.example.com',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET /users - получить список пользователей', async () => {
    const response = await apiContext.get(ENDPOINTS.USERS.LIST);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
  });

  test('POST /users - создать пользователя', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const response = await apiContext.post(ENDPOINTS.USERS.CREATE, {
      data: newUser,
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    
    const user = await response.json();
    expect(user).toHaveProperty('id');
    expect(user.name).toBe(newUser.name);
  });

  test('GET /users/:id - получить пользователя по ID', async () => {
    const userId = '123';
    const response = await apiContext.get(ENDPOINTS.USERS.GET(userId));
    
    expect(response.ok()).toBeTruthy();
    
    const user = await response.json();
    expect(user.id).toBe(userId);
  });
});