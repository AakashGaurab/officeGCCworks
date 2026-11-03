export const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';
export const PAGE_SIZE = 10;
export const FIRST_PAGE = 1;
export const NO_PAGE_LOADED = 0;
export const CURRENCY = 'USD';
export const LOCALE = 'en-US';
export const MAX_RATING = 5;
export const INTERSECTION_ROOT_MARGIN = '200px';
export const NETWORK_ERROR_STATUS = 0;
// Used for a client side timeout. 408 is the HTTP status for "request timeout".
export const TIMEOUT_ERROR_STATUS = 408;
// Longer than the backend's own upstream and SMTP timeouts, short enough that the user is not left waiting.
export const POST_TIMEOUT_MS = 15000;
export const FOCUS_HEADING_SELECTOR = 'h2';

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
} as const;

export enum HttpMethod {
  POST = 'POST',
}

export const JSON_CONTENT_TYPE_HEADER = 'Content-Type';
export const JSON_CONTENT_TYPE = 'application/json';

export const ABORT_ERROR_NAME = 'AbortError';
export const SEARCH_INPUT_ID = 'search-input';

export enum QueryKey {
  CATEGORIES = 'categories',
  FEATURED = 'featured',
}

// Enquiry limits mirror the backend validation.
export const ENQUIRY_NAME_MAX_LENGTH = 100;
export const ENQUIRY_EMAIL_MAX_LENGTH = 254;
export const ENQUIRY_PHONE_MIN_LENGTH = 7;
export const ENQUIRY_PHONE_MAX_LENGTH = 20;
export const ENQUIRY_MESSAGE_MAX_LENGTH = 1000;
export const ENQUIRY_MESSAGE_ROWS = 5;
export const ENQUIRY_PHONE_PATTERN = /^[\d\s+\-()]+$/;
// Same pattern as zod's z.email() in the backend (zod v4 default), so the form accepts exactly what the API accepts.
export const ENQUIRY_EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;
export const ENQUIRY_FORM_ID = 'enquiry-form';
export const FIRST_ITEM_INDEX = 0;
export const ENQUIRY_FIELD_ID_PREFIX = 'enquiry-';
export const ERROR_ID_SUFFIX = '-error';
export const HONEYPOT_TAB_INDEX = -1;
// Focusable by script only (not in the tab order).
export const HEADING_TAB_INDEX = -1;

export enum InputType {
  TEXT = 'text',
  PASSWORD = 'password',
  EMAIL = 'email',
  TEL = 'tel',
}

export enum AutoComplete {
  NAME = 'name',
  EMAIL = 'email',
  TEL = 'tel',
  OFF = 'off',
  CURRENT_PASSWORD = 'current-password',
}

// Admin page. The list page size matches the backend default; sign-in only needs proof that the token works.
export const ADMIN_PAGE_SIZE = 20;
export const ADMIN_VERIFY_PAGE_SIZE = 1;
export const ADMIN_TOKEN_STORAGE_KEY = 'admin-token';
export const ADMIN_TOKEN_INPUT_ID = 'admin-token';
export const AUTHORIZATION_HEADER = 'Authorization';
export const BEARER_PREFIX = 'Bearer ';
export const ALL_STATUSES_KEY = 'all';
export const INITIAL_REFRESH_COUNT = 0;
export const MAILTO_PREFIX = 'mailto:';
export const ADMIN_DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

// Same values as the backend EnquiryStatus.
export enum EnquiryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}
