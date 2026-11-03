import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { HTTP_STATUS } from '../config/constants.js';
import { UnauthorizedError } from '../domain/UnauthorizedError.js';
import { NotFoundError } from '../domain/NotFoundError.js';
import { UpstreamError } from '../domain/UpstreamError.js';
import { ErrorCode, ErrorMessage } from './ErrorCode.js';

const sendError = (reply: FastifyReply, status: number, code: ErrorCode, message: string) =>
  reply.status(status).send({ error: { code, message } });

export const notFoundHandler = (_request: FastifyRequest, reply: FastifyReply) =>
  sendError(reply, HTTP_STATUS.NOT_FOUND, ErrorCode.NOT_FOUND, ErrorMessage.ROUTE_NOT_FOUND);

// One place that turns every error into the same JSON shape. Stack traces never reach the client.
export const errorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    return sendError(reply, HTTP_STATUS.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, message);
  }
  if (error instanceof UnauthorizedError) {
    return sendError(reply, HTTP_STATUS.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED);
  }
  if (error instanceof NotFoundError) {
    return sendError(reply, HTTP_STATUS.NOT_FOUND, ErrorCode.NOT_FOUND, error.message);
  }
  if (error instanceof UpstreamError) {
    request.log.error(error);
    return sendError(reply, HTTP_STATUS.BAD_GATEWAY, ErrorCode.UPSTREAM_ERROR, ErrorMessage.UPSTREAM);
  }
  if (error.statusCode === HTTP_STATUS.TOO_MANY_REQUESTS) {
    return sendError(reply, HTTP_STATUS.TOO_MANY_REQUESTS, ErrorCode.RATE_LIMITED, ErrorMessage.RATE_LIMITED);
  }
  // Client mistakes raised by Fastify itself (e.g. malformed JSON).
  if (error.statusCode && error.statusCode < HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    return sendError(reply, HTTP_STATUS.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, ErrorMessage.VALIDATION);
  }
  request.log.error(error);
  return sendError(reply, HTTP_STATUS.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, ErrorMessage.INTERNAL);
};
