import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import { API_PREFIX } from './config/constants.js';
import { CatalogueService } from './application/CatalogueService.js';
import type { ProductRepository } from './domain/ProductRepository.js';
import { errorHandler, notFoundHandler } from './http/errorHandler.js';
import { registerRoutes } from './http/registerRoutes.js';

export type AppDependencies = {
  productRepository: ProductRepository;
  corsOrigin: string;
  logger?: boolean;
};

// Composition root: everything is injected, so tests can pass a fake repository.
export const buildApp = async (dependencies: AppDependencies): Promise<FastifyInstance> => {
  const app = Fastify({ logger: dependencies.logger ?? false });

  await app.register(helmet);
  await app.register(cors, { origin: dependencies.corsOrigin });

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  const service = new CatalogueService(dependencies.productRepository);
  await app.register(async (api) => registerRoutes(api, service), { prefix: API_PREFIX });

  return app;
};
