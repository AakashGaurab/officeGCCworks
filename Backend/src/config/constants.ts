export const FEATURED_PRODUCTS_COUNT = 5;
export const CATEGORY_TOP_RATED_COUNT = 4;

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MIN_PAGE_SIZE = 1;
export const MAX_PAGE_SIZE = 50;

export const UPSTREAM_TIMEOUT_MS = 5000;
export const PRODUCT_CACHE_TTL_MS = 5 * 60 * 1000;

export const DEFAULT_PORT = 3001;
export const MAX_PORT = 65535;
export const DEFAULT_FAKE_STORE_API_BASE_URL = 'https://fakestoreapi.com';
export const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';
export const API_PREFIX = '/api';
export const SERVER_HOST = '0.0.0.0';

export enum UpstreamPath {
  PRODUCTS = '/products',
}

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const;
