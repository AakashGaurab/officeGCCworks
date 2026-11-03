import type { FastifyInstance } from 'fastify';
import { buildApp, type AppDependencies } from '../../src/app.js';
import { IN_MEMORY_DATABASE_PATH } from '../../src/config/constants.js';
import { SqliteEnquiryRepository } from '../../src/infrastructure/SqliteEnquiryRepository.js';
import { buildProduct } from './buildProduct.js';
import { FakeEmailSender } from './FakeEmailSender.js';
import { InMemoryProductRepository } from './InMemoryProductRepository.js';

export const TEST_CORS_ORIGIN = 'http://localhost:5173';
export const TEST_SALES_INBOX = 'sales@example.com';

// Fakes for everything outside the process: no network, in-memory database.
export const buildTestApp = (overrides: Partial<AppDependencies> = {}): Promise<FastifyInstance> =>
  buildApp({
    productRepository: new InMemoryProductRepository([buildProduct({ id: 1, title: 'Blue Shirt' })]),
    enquiryRepository: new SqliteEnquiryRepository(IN_MEMORY_DATABASE_PATH),
    createEmailSender: () => new FakeEmailSender(),
    salesInboxEmail: TEST_SALES_INBOX,
    corsOrigin: TEST_CORS_ORIGIN,
    ...overrides,
  });
