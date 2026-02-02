/**
 * Endpoints for the API
 * @description This file contains the endpoints for the API
 * @author Alex
 * @version 1.0.0
 * @since 2026-02-02
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/auth/logout',
  },
  TAGS: {
    CREATE: '/api/tag_description_manager/create_tag',    
    GET: '/api/tag_description_manager/get_tags',
    UPDATE: '/api/tag_description_manager/update_tag',    
    DELETE: '/api/tag_description_manager/delete_tag',
    DELETE_TAGS: '/api/tag_description_manager/delete_tags',
    
  },
  DESCRIPTIONS: {
    CREATE: '/api/tag_description_manager/create_description',
    GET: '/api/tag_description_manager/get_descriptions',
    UPDATE: '/api/tag_description_manager/update_files_description',
    DELETE: '/api/tag_description_manager/delete_description',
  },
  FILES: {
    CREATE: '/api/files/create',
  },
} as const;