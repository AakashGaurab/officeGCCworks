import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import { API_PREFIX } from './config/constants.js';
import { CatalogueService } from './application/CatalogueService.js';
import { EnquiryService } from './application/EnquiryService.js';
import type { Logger } from './domain/Logger.js';
import type { EmailSender } from './domain/EmailSender.js';
import type { EnquiryRepository } from './domain/EnquiryRepository.js';
import type { ProductRepository } from './domain/ProductRepository.js';
import { errorHandler, notFoundHandler } from './http/errorHandler.js';
import { registerEnquiryRoutes } from './http/registerEnquiryRoutes.js';
import { registerRoutes } from './http/registerRoutes.js';

export type AppDependencies = {
  productRepository: ProductRepository;
  enquiryRepository: EnquiryRepository;
  // A factory, because the default sender logs and the app's logger only exists once it is built.
  createEmailSender: (logger: Logger) => EmailSender;
  salesInboxEmail: string;
  corsOrigin: string;
  trustProxy?: boolean;
  logger?: boolean;
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
      registerRoutes(api, service);
      await registerEnquiryRoutes(api, enquiryService);
    },
    { prefix: API_PREFIX },
  );

  // Release the database file when the app shuts down.
  app.addHook('onClose', () => dependencies.enquiryRepository.close());

  return app;
};
