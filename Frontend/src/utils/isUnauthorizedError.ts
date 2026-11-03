import { ApiError } from '../api/ApiError';
import { HTTP_STATUS } from '../constants/AppConstants';

export const isUnauthorizedError = (error: unknown): boolean =>
  error instanceof ApiError && error.status === HTTP_STATUS.UNAUTHORIZED;
