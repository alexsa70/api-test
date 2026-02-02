import { test, expect, request } from '@playwright/test';
import { PNG } from 'pngjs';
import { ENDPOINTS } from '../../config/endpoints';
import { getToken } from '../../utils/auth';

/**
 * Make a random PNG buffer
 * @param width - The width of the PNG
 * @param height - The height of the PNG
 * @returns A random PNG buffer
 */
function makeRandomPngBuffer(width = 10, height = 10): Buffer {
  const png = new PNG({ width, height });
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const a = 255;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (width * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return PNG.sync.write(png);
}
/**
 * Test suite for file upload
 * @description This test suite tests the file upload functionality and creating description, tags, collection, multiple updating tags for file, deleting tags for file, updating file description, deleting collection
 * @author Alex
 * @version 1.0.0
 * @since 2026-02-02
 */
test.describe.serial('File upload', () => {
  let apiContext: Awaited<ReturnType<typeof request.newContext>>;
  let orgId = '';
  let projectId = '';
  const product = process.env.API_PRODUCT || 'KalMedia';
  let fileId = '';
  let collectionName = '';
  let collectionId = '';
  let updatedTagIds: string[] = [];

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
    const fileBuffer = makeRandomPngBuffer();
    const response = await apiContext.post(ENDPOINTS.FILES.CREATE, {
      multipart: {
        project_id: projectId,
        org_id: orgId,
        product,
        name: fileName,
        file: {
          name: fileName,
          mimeType: 'image/png',
          buffer: fileBuffer,
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
    const response = await apiContext.post(ENDPOINTS.DESCRIPTIONS.CREATE, {
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
    const body = await response.json();
    collectionId = body.tag_id ?? body.id ?? '';
    expect(collectionId).toBeTruthy();
    console.log('Test pass successfully');
  });

  test('Multiple updating tags for file', async () => {
    console.log('Test: Multiple updating tags for file');
    expect(fileId).toBeTruthy();
    const response = await apiContext.post(ENDPOINTS.TAGS.UPDATE, {
      data: {
        org_id: orgId,
        tag_list: [
          {
            name: 'AutoTest1',
            tag_type: 'regular',
            action_type: 'add',
          },
          {
            name: 'AutoTest2',
            tag_type: 'regular',
            action_type: 'add',
          },   
        ],
        files_project: [
          {
            file_id: fileId,
            project_id: projectId,
          },
        ]
      },
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const body = await response.json();
    const results = body?.results ?? [];
    expect(Array.isArray(results)).toBeTruthy();
    expect(results.length).toBeGreaterThanOrEqual(2);
    results.forEach((item: any) => {
      expect(item.status).toBe('success');
      expect(item.tag_id).toBeTruthy();
    });
    updatedTagIds = results
      .map((item: any) => item.tag_id)
      .filter((id: string) => Boolean(id));
    expect(updatedTagIds.length).toBeGreaterThan(0);
    console.log('Test pass successfully');
  });

  test('Delete tags for file', async () => {
    console.log('Test: Delete tags for file');
    expect(fileId).toBeTruthy();
    expect(updatedTagIds.length).toBeGreaterThan(0);

    const tagList = updatedTagIds.map((id, index) => ({
      id,
      name: `AutoTest${index + 1}`,
      tag_type: 'regular',
      file_id: fileId,
      action_type: 'delete',
    }));

    const response = await apiContext.post(ENDPOINTS.TAGS.UPDATE, {
      data: {
        org_id: orgId,
        tag_list: tagList,
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
    const body = await response.json();
    const results = body?.results ?? [];
    expect(Array.isArray(results)).toBeTruthy();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.message).toBe('All tags and associations deleted successfully');
    console.log('Test pass successfully');
  });

  test('Updated file description', async () => {
    console.log('Test: Updated file description');
    expect(fileId).toBeTruthy();
    const updatedDescription = `Updated file description - Automation test + ${Date.now()}`;
    const response = await apiContext.post(ENDPOINTS.DESCRIPTIONS.UPDATE, {
      data: {
        org_id: orgId,
        description: updatedDescription,
        is_ai: 'regular',
        files_project: [
          {
            file_id: fileId,
            project_id: projectId,
          },
        ]
      },
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body?.org_id).toBe(orgId);
    expect(body?.description).toBe(updatedDescription);
    expect(body?.is_ai).toBe('regular');
    expect(body?.desc_id).toBeTruthy();
    console.log('Test pass successfully');
  });

  test('Delete collection', async () => {
    console.log('Test: Delete collection');
    expect(collectionId).toBeTruthy();
    const response = await apiContext.post(ENDPOINTS.TAGS.DELETE_TAGS, {
      data: {
        org_id: orgId,
        tag_ids: [collectionId],
        project_actions: true,
      },
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body?.message).toBe('All projects deleted successfully');
    const results = body?.results ?? [];
    expect(Array.isArray(results)).toBeTruthy();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.status).toBe('success');
    expect(results[0]?.project_id).toBe(collectionId);
    console.log('Test pass successfully');
  });

});
