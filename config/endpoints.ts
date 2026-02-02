export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/auth/logout',
  },
  TAGS: {
    CREATE: '/api/tag_description_manager/create_tag',
    CREATE_DESCRIPTION: '/api/tag_description_manager/create_description',
    GET: '/api/tag_description_manager/get_tags',
    UPDATE: '/api/tag_description_manager/update_tag',
  },
  FILES: {
    CREATE: '/api/files/create',
  },
} as const;