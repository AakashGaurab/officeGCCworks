export const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';
export const PAGE_SIZE = 10;
export const FIRST_PAGE = 1;
export const NO_PAGE_LOADED = 0;
export const CURRENCY = 'USD';
export const LOCALE = 'en-US';
export const MAX_RATING = 5;
export const INTERSECTION_ROOT_MARGIN = '200px';
export const NETWORK_ERROR_STATUS = 0;

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
} as const;

export const ABORT_ERROR_NAME = 'AbortError';
export const SEARCH_INPUT_ID = 'search-input';

export enum QueryKey {
  CATEGORIES = 'categories',
  FEATURED = 'featured',
}
