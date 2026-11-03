import { ApiError } from '../api/ApiError';
import { HTTP_STATUS } from '../constants/AppConstants';
import { AdminLoginErrorText } from '../constants/Text';

// Maps a failed sign-in to a sentence for the owner. 404 means the server has no ADMIN_TOKEN set.
export const toAdminLoginError = (error: Error): string => {
  if (!(error instanceof ApiError)) return AdminLoginErrorText.FAILED;
  if (error.status === HTTP_STATUS.UNAUTHORIZED) return AdminLoginErrorText.INVALID_TOKEN;
  if (error.status === HTTP_STATUS.TOO_MANY_REQUESTS) return AdminLoginErrorText.RATE_LIMITED;
  if (error.status === HTTP_STATUS.NOT_FOUND) return AdminLoginErrorText.DISABLED;
  return AdminLoginErrorText.FAILED;
};
