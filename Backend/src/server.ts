import { buildApp } from './app.js';
import { SERVER_HOST } from './config/constants.js';
import { loadEnv } from './config/env.js';
import { createEmailSender } from './infrastructure/createEmailSender.js';
import { FakeStoreProductRepository } from './infrastructure/FakeStoreProductRepository.js';
import { SqliteEnquiryRepository } from './infrastructure/SqliteEnquiryRepository.js';

const env = loadEnv();

const app = await buildApp({
  productRepository: new FakeStoreProductRepository(env.FAKE_STORE_API_BASE_URL),
  enquiryRepository: new SqliteEnquiryRepository(env.DATABASE_PATH),
  createEmailSender: (logger) => createEmailSender(env, logger),
  salesInboxEmail: env.SALES_INBOX_EMAIL,
  corsOrigin: env.CORS_ORIGIN,
  trustProxy: env.TRUST_PROXY,
  logger: true,
});

await app.listen({ port: env.PORT, host: SERVER_HOST });
