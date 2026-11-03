import { buildApp } from './app.js';
import { SERVER_HOST } from './config/constants.js';
import { loadEnv } from './config/env.js';
import { FakeStoreProductRepository } from './infrastructure/FakeStoreProductRepository.js';

const env = loadEnv();

const app = await buildApp({
  productRepository: new FakeStoreProductRepository(env.FAKE_STORE_API_BASE_URL),
  corsOrigin: env.CORS_ORIGIN,
  logger: true,
});

await app.listen({ port: env.PORT, host: SERVER_HOST });
