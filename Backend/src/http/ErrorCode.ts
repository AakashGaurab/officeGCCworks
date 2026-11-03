export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UPSTREAM_ERROR = 'UPSTREAM_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export enum ErrorMessage {
  VALIDATION = 'Invalid request',
  ROUTE_NOT_FOUND = 'Route not found',
  UPSTREAM = 'The product service is currently unavailable',
  RATE_LIMITED = 'Too many enquiries, please try again in a minute',
  INTERNAL = 'Something went wrong',
}
