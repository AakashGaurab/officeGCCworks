import type { FastifyInstance } from 'fastify';
import type { EnquiryAdminService } from '../application/EnquiryAdminService.js';
import { ADMIN_RATE_LIMIT_MAX, ADMIN_RATE_LIMIT_WINDOW_MS } from '../config/constants.js';
import { createRequireAdminToken } from './requireAdminToken.js';
import { adminEnquiriesQuerySchema } from './requestSchemas.js';

export enum AdminRoutePath {
  ENQUIRIES = '/admin/enquiries',
}

const NO_STORE = 'no-store';

const ROUTE_OPTIONS = {
  config: { rateLimit: { max: ADMIN_RATE_LIMIT_MAX, timeWindow: ADMIN_RATE_LIMIT_WINDOW_MS } },
};

// Needs the rate limit plugin, which buildApp registers on the parent scope.
export const registerAdminRoutes = async (
  app: FastifyInstance,
  service: EnquiryAdminService,
  adminToken: string,
): Promise<void> => {
  // Own scope: the hooks below apply to admin routes only, and future admin routes get them for free.
  await app.register(async (admin) => {
    admin.addHook('preHandler', createRequireAdminToken(adminToken));
    // Personal data must not be kept by browsers or proxies. Also applies to 401 and 429 answers.
    admin.addHook('onSend', async (_request, reply) => {
      reply.header('Cache-Control', NO_STORE);
    });

    admin.get(AdminRoutePath.ENQUIRIES, ROUTE_OPTIONS, (request) =>
      service.list(adminEnquiriesQuerySchema.parse(request.query)),
    );
  });
};
