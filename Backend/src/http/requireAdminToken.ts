import { createHash, timingSafeEqual } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import { UnauthorizedError } from '../domain/UnauthorizedError.js';

// Exactly "Bearer <token>": one space, no spaces inside the token.
const BEARER_PATTERN = /^Bearer (\S+)$/i;

// Hashing first gives both sides the same length, so timingSafeEqual never throws on a length
// mismatch and the response time does not reveal how long the real token is.
const sha256 = (value: string): Buffer => createHash('sha256').update(value).digest();

// Returns a preHandler hook. Add it to any admin route (or admin plugin) to protect it.
// Every failure is the same UnauthorizedError, so the client never learns which part was wrong.
// The token and the Authorization header are never logged: Fastify's default request log only
// records method, url, host and remote address.
export const createRequireAdminToken = (adminToken: string) => {
  const expectedHash = sha256(adminToken);

  return async (request: FastifyRequest): Promise<void> => {
    const provided = BEARER_PATTERN.exec(request.headers.authorization ?? '')?.[1];
    if (!provided || !timingSafeEqual(sha256(provided), expectedHash)) throw new UnauthorizedError();
  };
};
