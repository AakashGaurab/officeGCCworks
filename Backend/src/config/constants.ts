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
export const DEFAULT_DATABASE_PATH = './data/enquiries.sqlite';
export const IN_MEMORY_DATABASE_PATH = ':memory:';
export const DEFAULT_SALES_INBOX_EMAIL = 'sales@example.com';
export const DEFAULT_SMTP_PORT = 587;
// Without timeouts an unreachable SMTP server would keep the customer's request waiting for minutes.
export const SMTP_CONNECTION_TIMEOUT_MS = 5000;
export const SMTP_GREETING_TIMEOUT_MS = 5000;
export const SMTP_SOCKET_TIMEOUT_MS = 10000;
export const SMTP_SECURE_PORT = 465;
export const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';
export const API_PREFIX = '/api';
export const SERVER_HOST = '0.0.0.0';

export enum EmailProvider {
  LOG = 'log',
  SMTP = 'smtp',
}

// Enquiry input limits. They are mirrored in the Frontend validation.
export const ENQUIRY_NAME_MAX_LENGTH = 100;
export const ENQUIRY_EMAIL_MAX_LENGTH = 254;
export const ENQUIRY_PHONE_MIN_LENGTH = 7;
export const ENQUIRY_PHONE_MAX_LENGTH = 20;
export const ENQUIRY_MESSAGE_MAX_LENGTH = 1000;
export const ENQUIRY_PHONE_PATTERN = /^[\d\s+\-()]+$/;
// Control characters (including CR/LF) in a value that ends up in an email header would let an attacker add headers.
export const CONTROL_CHARACTER_PATTERN = /\p{Cc}/u;
// The honeypot only needs to be non-empty to trip, so a long value is just junk from a bot.
export const ENQUIRY_HONEYPOT_MAX_LENGTH = 200;
export const LINE_BREAK_PATTERN_GLOBAL = /[\r\n]+/g;

// Spam protection: small bodies and a few enquiries per minute per client address.
// 8 KB: a 1000 character message can be 4 KB as UTF-8, plus the other fields and JSON overhead.
export const ENQUIRY_BODY_LIMIT_BYTES = 8 * 1024;
export const ENQUIRY_RATE_LIMIT_MAX = 5;
export const ENQUIRY_RATE_LIMIT_WINDOW_MS = 60 * 1000;

export const MAX_STORED_ERROR_LENGTH = 200;

// Admin area. The shared token must be long enough that guessing it is not realistic.
export const ADMIN_TOKEN_MIN_LENGTH = 16;
export const ADMIN_DEFAULT_PAGE_SIZE = 20;
export const ADMIN_MAX_PAGE_SIZE = 100;
// Every admin request counts, not only failed ones: simple, and it still stops token guessing.
// 30 leaves room for an owner clicking through tabs; guessing a 16+ character token at 30 a minute is hopeless.
export const ADMIN_RATE_LIMIT_MAX = 30;
export const ADMIN_RATE_LIMIT_WINDOW_MS = 60 * 1000;

export enum UpstreamPath {
  PRODUCTS = '/products',
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const;
