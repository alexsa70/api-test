import { test, expect, request } from '@playwright/test';
import { ENDPOINTS } from '../../config/endpoints';
import { getToken } from '../../utils/auth';

const SAMPLE_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO1Z6G8AAAAASUVORK5CYII=';

test.describe.serial('File upload', () => {
  let apiContext: Awaited<ReturnType<typeof request.newContext>>;
  let orgId = '';
  let projectId = '';
  const product = process.env.API_PRODUCT || 'KalMedia';
  let fileId = '';
  let collectionName = '';

  test.beforeAll(async () => {
    if (!process.env.API_ORG_ID) {
      throw new Error('API_ORG_ID is missing in environment');
    }
    if (!process.env.API_PROJECT_ID) {
      throw new Error('API_PROJECT_ID is missing in environment');
    }
    orgId = process.env.API_ORG_ID;
    projectId = process.env.API_PROJECT_ID;
    const token = getToken();
    apiContext = await request.newContext({
      baseURL: process.env.API_BASE_URL || 'https://api.example.com',
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Create file', async () => {
    console.log('Test: Create file');
    const fileName = `sample_${Date.now()}.png`;
    const response = await apiContext.post(ENDPOINTS.FILES.CREATE, {
      multipart: {
        project_id: projectId,
        org_id: orgId,
        product,
        name: fileName,
        file: {
          name: fileName,
          mimeType: 'image/png',
          buffer: Buffer.from(SAMPLE_PNG_BASE64, 'base64'),
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    fileId = body.file_id ?? body.id ?? '';
    expect(fileId).toBeTruthy();
    console.log('Test pass successfully');
  });

  test('Create description for file', async () => {
    console.log('Test: Create description for file');
    expect(fileId).toBeTruthy();
    const response = await apiContext.post(ENDPOINTS.TAGS.CREATE_DESCRIPTION, {
      data: {
        org_id: orgId,
        description: 'Upload png to album - Automation test',
        is_ai: 'regular',
        files_project: [
          {
            file_id: fileId,
            project_id: projectId,
          },
        ],
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    console.log('Test pass successfully');
  });

  test('Create tag for file', async () => {
    console.log('Test: Create tag for file');
    expect(fileId).toBeTruthy();
    const response = await apiContext.post(ENDPOINTS.TAGS.CREATE, {
      data: {
        org_id: orgId,
        file_ids: [fileId],
        tag_type: 'regular',
        name: 'PNG', 
        project_id: projectId,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    console.log('Test pass successfully');
  });

  test('Add file to the NEW collection', async () => {
    console.log('Test: Add file to collection');
    collectionName = `automation_${Date.now()}`;
    expect(fileId).toBeTruthy();
    const response = await apiContext.post(ENDPOINTS.TAGS.CREATE, {
      data: {
        org_id: orgId,
        name: collectionName,
        tag_type: 'project',
        file_ids: [fileId],
      },
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    console.log('Test pass successfully');
  });
});
