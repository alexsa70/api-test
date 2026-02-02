import { test, expect, request } from '@playwright/test';
import { authenticate } from '../../utils/auth';
import { ENDPOINTS } from '../../config/endpoints';

// Positive/negative login scenarios
test.describe('Login', () => {
  test('Positive - Login', async () => {
    console.log('Test: Positive - Login');
    // Force auth to verify real login
    const { token, status, fromCache } = await authenticate({ force: true });
    expect(token).toBeTruthy();
    expect(status).toBe(200);
    expect(fromCache).toBe(false);
    console.log('Test pass successfully');
  });

  test('Negative - Incorrect orgName', async () => {
    console.log('Test: Negative - Incorrect orgName');
    // Wrong org name -> expect error
    const response = await loginRequest({
      orgName: 'Wrong_Org_Name',
    });
    expect(response.status).toBe(404);
    console.log('Test pass successfully');
  });

  test('Negative - Incorrect password', async () => {
    console.log('Test: Negative - Incorrect password');
    // Wrong password -> expect error
    const response = await loginRequest({
      password: 'wrong_password',
    });
    expect(response.status).toBe(400);
    console.log('Test pass successfully');
  });
});


test('Negative - Incorrect username', async () => {
  console.log('Test: Negative - Incorrect username');
  // Wrong username -> expect error
  const response = await loginRequest({
    identity: 'wrong_username',
  });
  expect(response.status).toBe(404);
  console.log('Test pass successfully');
});

test('Negative - Incorrect value in payload', async () => {
  console.log('Test: Negative - Incorrect value in payload');
  // Extra "username" field + missing "identity" -> expect validation error
  const response = await loginRequest({
    useDefaults: false,
    orgName: 'Kaleidoo_AI',
    password: process.env.API_PASSWORD || 'test_password',
    username: 'wrong_username',
  });
  expect(response.status).toBe(422);
  console.log('Test pass successfully');
});


// Payload for login request
type LoginPayload = {
  useDefaults?: boolean;
  orgName?: string;
  identity?: string;
  password?: string;
  username?: string;
};



async function loginRequest(payload: LoginPayload) {
  // Base data from env, can be overridden by payload
  const baseURL = process.env.API_BASE_URL || 'https://api.example.com';
  const useDefaults = payload.useDefaults ?? true;
  const orgName = payload.orgName ?? (useDefaults ? process.env.API_ORG_NAME ?? 'Kaleidoo_AI' : undefined);
  const identity = payload.identity ?? (useDefaults ? process.env.API_USERNAME ?? 'test_user' : undefined);
  const password = payload.password ?? (useDefaults ? process.env.API_PASSWORD ?? 'test_password' : undefined);

  // Separate API context per request to avoid shared state
  const context = await request.newContext({ baseURL });
  try {
    const data = {
      ...(orgName !== undefined ? { orgName } : {}),
      ...(identity !== undefined ? { identity } : {}),
      ...(password !== undefined ? { password } : {}),
      ...(payload.username !== undefined ? { username: payload.username } : {}),
    };
    const response = await context.post(ENDPOINTS.AUTH.LOGIN, {
      data,
    });
    let body: any = null;
    try {
      body = await response.json();
    } catch {
      // ignore non-JSON bodies
    }
    return { status: response.status(), body };
  } finally {
    await context.dispose();
  }
}
