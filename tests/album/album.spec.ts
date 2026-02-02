import { test, expect, request } from '@playwright/test';
import { ENDPOINTS } from '../../config/endpoints';
import { getToken } from '../../utils/auth';

/**
 * Test suite for album
 * @description This test suite tests the album functionality
 * @author Alex
 * @version 1.0.0
 * @since 2026-02-02
 */
test.describe.serial('Album', () => {
  let apiContext: Awaited<ReturnType<typeof request.newContext>>;
  let albumId = '';
  let albumName = '';
  const orgId = process.env.API_ORG_ID;

  test.beforeAll(async () => {
    if (!orgId) {
      throw new Error('API_ORG_ID is missing in environment');
    }
    const token = getToken();
    apiContext = await request.newContext({
      baseURL: process.env.API_BASE_URL || 'https://api.example.com',
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Create album', async () => {
    console.log('Test: Create album');
    albumName = `album_${Date.now()}`;
    const response = await apiContext.post(ENDPOINTS.TAGS.CREATE, {
      data: {
        org_id: orgId,
        name: albumName,
        tag_type: 'album',
        file_ids: [],
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    albumId = body.tag_id ?? body.id ?? '';
    expect(albumId).toBeTruthy();
    console.log('Test pass successfully');
  });

  test('Get album and verify created', async () => {
    console.log('Test: Get album and verify created');
    expect(albumId).toBeTruthy();

    const response = await apiContext.post(ENDPOINTS.TAGS.GET, {
      data: {
        org_id: orgId,
        tag_id: albumId,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    const items = Array.isArray(body)
      ? body
      : body?.tag_list ??
        body?.tags ??
        body?.items ??
        body?.data ??
        body?.result ??
        [];

    const found =
      items.find((item: any) => (item.tag_id ?? item.id) === albumId) ??
      (body?.tag && (body.tag.tag_id ?? body.tag.id) === albumId ? body.tag : null) ??
      ((body?.tag_id ?? body?.id) === albumId ? body : null);

    if (!found) {
      throw new Error(
        `Album not found in response. albumId=${albumId} body=${JSON.stringify(body)}`
      );
    }
    if (found?.name) {
      expect(found.name).toBe(albumName);
    }
    console.log('Test pass successfully');
  });

  test('Delete album', async () => {
    console.log('Test: Delete album');
    expect(albumId).toBeTruthy();

    const response = await apiContext.post(ENDPOINTS.TAGS.UPDATE, {
      data: {
        org_id: orgId,
        tag_list: [
          {
            id: albumId,
            name: albumName,
            tag_type: 'album',
            action_type: 'delete',
          },
        ],
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    console.log('Test pass successfully');
  });
});
