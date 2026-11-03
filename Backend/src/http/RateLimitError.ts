import { HTTP_STATUS } from '../config/constants.js';

// Thrown by the rate limit plugin; the error handler turns it into the standard error shape.
export class RateLimitError extends Error {
  readonly statusCode = HTTP_STATUS.TOO_MANY_REQUESTS;
}
