import { Writable } from 'node:stream';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { ADMIN_RATE_LIMIT_MAX, IN_MEMORY_DATABASE_PATH } from '../src/config/constants.js';
import { EnquiryStatus } from '../src/domain/Enquiry.js';
import { SqliteEnquiryRepository } from '../src/infrastructure/SqliteEnquiryRepository.js';
import { buildTestApp, TEST_CORS_ORIGIN } from './helpers/buildTestApp.js';
import { seedEnquiries } from './helpers/seedEnquiries.js';

const TOKEN = 'a-long-secret-admin-token';
const URL = '/api/admin/enquiries';
const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

let app: FastifyInstance;
let repository: SqliteEnquiryRepository;

const startApp = async (adminToken?: string, logger?: object) => {
  repository = new SqliteEnquiryRepository(IN_MEMORY_DATABASE_PATH);
  app = await buildTestApp({ enquiryRepository: repository, adminToken, logger });
  return app;
};

const get = (url = URL, headers: Record<string, string> = bearer(TOKEN)) =>
  app.inject({ method: 'GET', url, headers });

afterEach(() => app.close());

describe('admin authentication', () => {
  it.each([
    ['no header', {}],
    ['wrong scheme', { authorization: `Basic ${TOKEN}` }],
    ['token without scheme', { authorization: TOKEN }],
    ['wrong token', bearer('a-different-wrong-token')],
    ['shorter token', bearer('short')],
    ['longer token', bearer(`${TOKEN}-and-more`)],
    ['extra whitespace before the token', { authorization: `Bearer  ${TOKEN}` }],
    ['trailing whitespace', { authorization: `Bearer ${TOKEN} ` }],
    ['empty token', { authorization: 'Bearer ' }],
  ])('returns 401 with a generic message for %s', async (_label, headers) => {
    await startApp(TOKEN);
    const response = await get(URL, headers);

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  });

  it('returns 200 for the right token', async () => {
    await startApp(TOKEN);
    expect((await get()).statusCode).toBe(200);
  });

  it('is disabled (404) when no token is configured', async () => {
    await startApp();
    expect((await get()).statusCode).toBe(404);
  });

  it('treats an empty token as not configured', async () => {
    await startApp('');
    expect((await get(URL, bearer(''))).statusCode).toBe(404);
  });

  it('sends Cache-Control no-store on success, 401 and 429', async () => {
    await startApp(TOKEN);
    expect((await get()).headers['cache-control']).toBe('no-store');
    expect((await get(URL, {})).headers['cache-control']).toBe('no-store');

    for (let attempt = 0; attempt < ADMIN_RATE_LIMIT_MAX; attempt += 1) await get(URL, {});
    const limited = await get(URL, {});
    expect(limited.statusCode).toBe(429);
    expect(limited.headers['cache-control']).toBe('no-store');
  });

  it('returns 429 in the standard error shape after too many attempts', async () => {
    await startApp(TOKEN);
    const statuses = [];
    for (let attempt = 0; attempt <= ADMIN_RATE_LIMIT_MAX; attempt += 1) statuses.push((await get(URL, {})).statusCode);

    expect(statuses).toEqual([...Array(ADMIN_RATE_LIMIT_MAX).fill(401), 429]);
    const limited = (await get()).json().error;
    expect(limited.code).toBe('RATE_LIMITED');
    expect(limited.message).toBe('Too many requests, please try again in a minute');
  });

  it('keeps the limit global:false, so the catalogue routes are never limited', async () => {
    await startApp(TOKEN);
    for (let attempt = 0; attempt <= ADMIN_RATE_LIMIT_MAX; attempt += 1) await get(URL, {});

    expect((await get('/api/health')).statusCode).toBe(200);
    expect((await get('/api/products/featured')).statusCode).toBe(200);
  });

  it('allows the Authorization header in a CORS preflight', async () => {
    await startApp(TOKEN);
    const response = await app.inject({
      method: 'OPTIONS',
      url: URL,
      headers: {
        origin: TEST_CORS_ORIGIN,
        'access-control-request-method': 'GET',
        'access-control-request-headers': 'authorization',
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-headers']).toContain('authorization');
  });

  it('never writes the token or the Authorization header to the log', async () => {
    const lines: string[] = [];
    const stream = new Writable({
      write: (chunk, _encoding, done) => {
        lines.push(String(chunk));
        done();
      },
    });
    await startApp(TOKEN, { level: 'trace', stream });

    await get();
    await get(URL, bearer('wrong-token-that-must-not-be-logged'));

    const output = lines.join('');
    expect(output).toContain('/api/admin/enquiries');
    expect(output).not.toContain(TOKEN);
    expect(output).not.toContain('wrong-token-that-must-not-be-logged');
    expect(output.toLowerCase()).not.toContain('authorization');
  });
});

describe('GET /api/admin/enquiries', () => {
  const SEED: [string, EnquiryStatus][] = [
    ['a', EnquiryStatus.SENT],
    ['b', EnquiryStatus.FAILED],
    ['c', EnquiryStatus.SENT],
    ['d', EnquiryStatus.PENDING],
    ['e', EnquiryStatus.SENT],
  ];

  it('returns an empty listing when there are no enquiries', async () => {
    await startApp(TOKEN);
    expect((await get()).json()).toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      hasNextPage: false,
      statusCounts: { pending: 0, sent: 0, failed: 0 },
    });
  });

  it('returns newest first with every enquiry field', async () => {
    await startApp(TOKEN);
    await seedEnquiries(repository, SEED);
    const body = (await get()).json();

    expect(body.items.map((item: { id: string }) => item.id)).toEqual(['e', 'd', 'c', 'b', 'a']);
    expect(body.items[1]).toEqual({
      id: 'd',
      productId: 1,
      productTitle: 'Blue Shirt',
      name: 'Name d',
      email: 'd@example.com',
      phone: null,
      message: 'Message d',
      status: 'pending',
      createdAt: '2026-01-01T00:03:00.000Z',
      sentAt: null,
      errorMessage: null,
    });
    expect(body.items[3]).toMatchObject({ status: 'failed', errorMessage: 'smtp down' });
  });

  it('paginates and reports hasNextPage', async () => {
    await startApp(TOKEN);
    await seedEnquiries(repository, SEED);

    const first = (await get(`${URL}?pageSize=2`)).json();
    expect(first).toMatchObject({ page: 1, pageSize: 2, total: 5, hasNextPage: true });
    expect(first.items.map((item: { id: string }) => item.id)).toEqual(['e', 'd']);

    const last = (await get(`${URL}?pageSize=2&page=3`)).json();
    expect(last.items.map((item: { id: string }) => item.id)).toEqual(['a']);
    expect(last.hasNextPage).toBe(false);

    expect((await get(`${URL}?pageSize=2&page=9`)).json().items).toEqual([]);
  });

  it('filters by status while statusCounts cover all enquiries', async () => {
    await startApp(TOKEN);
    await seedEnquiries(repository, SEED);
    const body = (await get(`${URL}?status=sent&pageSize=2`)).json();

    expect(body.items.map((item: { id: string }) => item.id)).toEqual(['e', 'c']);
    expect(body).toMatchObject({ total: 3, hasNextPage: true, statusCounts: { pending: 1, sent: 3, failed: 1 } });
  });

  it.each([
    ['unknown status', 'status=done'],
    ['page 0', 'page=0'],
    ['non numeric page', 'page=abc'],
    ['decimal page', 'page=1.5'],
    ['pageSize 0', 'pageSize=0'],
    ['pageSize above the maximum', 'pageSize=101'],
    ['negative pageSize', 'pageSize=-5'],
  ])('returns 400 for %s', async (_label, query) => {
    await startApp(TOKEN);
    const response = await get(`${URL}?${query}`);

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts the maximum page size', async () => {
    await startApp(TOKEN);
    expect((await get(`${URL}?pageSize=100`)).statusCode).toBe(200);
  });
});
