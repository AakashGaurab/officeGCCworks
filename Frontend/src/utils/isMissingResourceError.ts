import { ApiError } from '../api/ApiError';
import { HTTP_STATUS } from '../constants/AppConstants';

const MISSING_RESOURCE_STATUSES: number[] = [HTTP_STATUS.NOT_FOUND, HTTP_STATUS.BAD_REQUEST];

// A 400 happens for malformed ids (e.g. /products/abc); to the visitor that is the same as "not found".
export const isMissingResourceError = (error: Error | null): boolean =>
  error instanceof ApiError && MISSING_RESOURCE_STATUSES.includes(error.status);
