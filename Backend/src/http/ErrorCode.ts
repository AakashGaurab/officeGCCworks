export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UPSTREAM_ERROR = 'UPSTREAM_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export enum ErrorMessage {
  VALIDATION = 'Invalid request',
  ROUTE_NOT_FOUND = 'Route not found',
  UPSTREAM = 'The product service is currently unavailable',
  INTERNAL = 'Something went wrong',
}
