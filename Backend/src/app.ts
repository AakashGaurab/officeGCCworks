import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { API_PREFIX } from './config/constants.js';
import { CatalogueService } from './application/CatalogueService.js';
import { EnquiryAdminService } from './application/EnquiryAdminService.js';
import { EnquiryService } from './application/EnquiryService.js';
import type { Logger } from './domain/Logger.js';
import type { EmailSender } from './domain/EmailSender.js';
import type { EnquiryRepository } from './domain/EnquiryRepository.js';
import type { ProductRepository } from './domain/ProductRepository.js';
import { ErrorMessage } from './http/ErrorCode.js';
import { errorHandler, notFoundHandler } from './http/errorHandler.js';
import { RateLimitError } from './http/RateLimitError.js';
import { registerAdminRoutes } from './http/registerAdminRoutes.js';
import { registerEnquiryRoutes } from './http/registerEnquiryRoutes.js';
import { registerRoutes } from './http/registerRoutes.js';

export type AppDependencies = {
  productRepository: ProductRepository;
  enquiryRepository: EnquiryRepository;
  // A factory, because the default sender logs and the app's logger only exists once it is built.
  createEmailSender: (logger: Logger) => EmailSender;
  salesInboxEmail: string;
  corsOrigin: string;
  // Admin routes exist only when this is set (disabled by default).
  adminToken?: string;
  trustProxy?: boolean;
  // true for the default logger; tests can pass options with their own stream.
  logger?: FastifyServerOptions['logger'];
};

// Composition root: everything is injected, so tests can pass a fake repository.
export const buildApp = async (dependencies: AppDependencies): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: dependencies.logger ?? false,
    trustProxy: dependencies.trustProxy ?? false,
  });

  await app.register(helmet);
  await app.register(cors, { origin: dependencies.corsOrigin });

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  const service = new CatalogueService(dependencies.productRepository);
  const enquiryService = new EnquiryService(
    dependencies.enquiryRepository,
    dependencies.createEmailSender(app.log),
    dependencies.productRepository,
    dependencies.salesInboxEmail,
    app.log,
  );

  await app.register(
    async (api) => {
      // Registered once, before any route, so every route's own rateLimit config works whatever
      // else is enabled. global: false, so only routes that declare a rateLimit are limited.
      await api.register(rateLimit, {
        global: false,
        errorResponseBuilder: () => new RateLimitError(ErrorMessage.RATE_LIMITED),
      });
      registerRoutes(api, service);
      await registerEnquiryRoutes(api, enquiryService);
      if (dependencies.adminToken) {
        await registerAdminRoutes(api, new EnquiryAdminService(dependencies.enquiryRepository), dependencies.adminToken);
      }
    },
    { prefix: API_PREFIX },
  );

  // Release the database file when the app shuts down.
  app.addHook('onClose', () => dependencies.enquiryRepository.close());

  return app;
};
