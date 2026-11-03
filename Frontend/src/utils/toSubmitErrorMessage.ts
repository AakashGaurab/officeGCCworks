import { ApiError } from '../api/ApiError';
import { HTTP_STATUS, NETWORK_ERROR_STATUS, TIMEOUT_ERROR_STATUS } from '../constants/AppConstants';
import { EnquiryErrorText } from '../constants/Text';

// Maps a failed submit to a friendly sentence. Server field errors are shown as one general message.
export const toSubmitErrorMessage = (error: Error): string => {
  if (!(error instanceof ApiError)) return EnquiryErrorText.SUBMIT_FAILED;
  if (error.status === NETWORK_ERROR_STATUS) return EnquiryErrorText.SUBMIT_NETWORK;
  if (error.status === TIMEOUT_ERROR_STATUS) return EnquiryErrorText.SUBMIT_TIMEOUT;
  if (error.status === HTTP_STATUS.TOO_MANY_REQUESTS) return EnquiryErrorText.SUBMIT_RATE_LIMITED;
  if (error.status === HTTP_STATUS.BAD_REQUEST) return EnquiryErrorText.SUBMIT_INVALID;
  return EnquiryErrorText.SUBMIT_FAILED;
};
