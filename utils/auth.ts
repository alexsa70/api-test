import { request } from '@playwright/test';
import { ENDPOINTS } from '../config/endpoints';
import * as fs from 'fs';
import * as path from 'path';

export type AuthResult = {
  token: string;
  status: number;
  fromCache: boolean;
};

export async function authenticate(
  options: { force?: boolean } = {}
): Promise<AuthResult> {
  const authFile = path.join(__dirname, '../.auth/user.json');
  let context: Awaited<ReturnType<typeof request.newContext>> | null = null;
  const { force = false } = options;

  // Проверяем, существует ли валидный токен
  if (!force && fs.existsSync(authFile)) {
    try {
      const raw = fs.readFileSync(authFile, 'utf-8').trim();
      if (raw) {
        const auth = JSON.parse(raw);
        const token = auth.origins?.[0]?.localStorage?.find(
          (item: any) => item.name === 'authToken'
        )?.value;
        if (token) {
          console.log('✓ Existing token is used');
          return { token, status: 200, fromCache: true };
        }
      }
      console.warn('⚠ Токен не найден или файл поврежден, переаутентификация...');
    } catch {
      console.warn('⚠ Ошибка чтения токена, переаутентификация...');
    }
  }

  console.log('→ Выполняется аутентификация...');
  try {
    context = await request.newContext({
      baseURL: process.env.API_BASE_URL || 'https://api.example.com',
    });

    const response = await context.post(ENDPOINTS.AUTH.LOGIN, {
      data: {
        orgName: process.env.API_ORG_NAME || 'Kaleidoo_AI',
        identity: process.env.API_USERNAME || 'test_user',
        password: process.env.API_PASSWORD || 'test_password',
      },
    });

    if (!response.ok()) {
      throw new Error(`Ошибка аутентификации: ${response.status()}`);
    }

    const body = await response.json();
    const token = body.token || body.access_token;
    if (!token) {
      throw new Error('Токен не найден в ответе аутентификации');
    }

    // Сохраняем токен в файл
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    fs.writeFileSync(
      authFile,
      JSON.stringify({
        cookies: [],
        origins: [
          {
            origin: process.env.API_BASE_URL || 'https://api.example.com',
            localStorage: [
              {
                name: 'authToken',
                value: token,
              },
            ],
          },
        ],
      })
    );

    console.log('✓ Токен сохранен');
    return { token, status: response.status(), fromCache: false };
  } finally {
    if (context) {
      await context.dispose();
    }
  }
}

export function getToken(): string {
  const authFile = path.join(__dirname, '../.auth/user.json');
  
  if (!fs.existsSync(authFile)) {
    throw new Error('Токен не найден. Выполните аутентификацию.');
  }

  let auth: any;
  try {
    const raw = fs.readFileSync(authFile, 'utf-8').trim();
    if (!raw) {
      throw new Error('Файл токена пустой');
    }
    auth = JSON.parse(raw);
  } catch (error: any) {
    throw new Error(`Ошибка чтения файла токена: ${error.message}`);
  }
  const token = auth.origins[0]?.localStorage?.find(
    (item: any) => item.name === 'authToken'
  )?.value;

  if (!token) {
    throw new Error('Токен не найден в файле аутентификации');
  }

  return token;
}