import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { IN_MEMORY_DATABASE_PATH } from '../src/config/constants.js';
import { SqliteEnquiryRepository } from '../src/infrastructure/SqliteEnquiryRepository.js';
import { buildTestApp } from './helpers/buildTestApp.js';
import { FakeEmailSender } from './helpers/FakeEmailSender.js';

const validBody = {
  productId: 1,
  name: ' Ada Lovelace ',
  email: 'ada@example.com',
  phone: '+44 (20) 7946-0000',
  message: 'Is this in stock?',
};

let app: FastifyInstance;
let repository: SqliteEnquiryRepository;
let emailSender: FakeEmailSender;

const startApp = async (sender = new FakeEmailSender()) => {
  repository = new SqliteEnquiryRepository(IN_MEMORY_DATABASE_PATH);
  emailSender = sender;
  app = await buildTestApp({ enquiryRepository: repository, createEmailSender: () => sender });
  return app;
};

const postEnquiry = async (payload: unknown) =>
  (await startApp()).inject({ method: 'POST', url: '/api/enquiries', payload: payload as object });

afterEach(() => app.close());

describe('POST /api/enquiries', () => {
  it('returns 201 with only id and status, and emails the sales inbox', async () => {
    const response = await postEnquiry(validBody);

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ id: expect.any(String), status: 'received' });
    expect(emailSender.sent).toHaveLength(1);
    expect(emailSender.sent[0]?.text).toContain('Name: Ada Lovelace');
  });

  it('works without a phone number', async () => {
    expect((await postEnquiry({ ...validBody, phone: undefined })).statusCode).toBe(201);
  });

  it('returns 201 and keeps the enquiry when the email fails', async () => {
    await startApp(new FakeEmailSender(new Error('smtp down')));
    const response = await app.inject({ method: 'POST', url: '/api/enquiries', payload: validBody });

    expect(response.statusCode).toBe(201);
    expect(response.body).not.toContain('smtp');
    expect(await repository.findUnsent()).toHaveLength(1);
  });

  it.each([
    ['missing productId', { ...validBody, productId: undefined }],
    ['non-integer productId', { ...validBody, productId: 1.5 }],
    ['zero productId', { ...validBody, productId: 0 }],
    ['empty name', { ...validBody, name: '   ' }],
    ['too long name', { ...validBody, name: 'a'.repeat(101) }],
    ['line break in name', { ...validBody, name: 'Ada\r\nBcc: spy@evil.com' }],
    ['control character in name', { ...validBody, name: 'Ada\u0000Lovelace' }],
    ['too long honeypot', { ...validBody, website: 'a'.repeat(201) }],
    ['email without a top level domain', { ...validBody, email: 'a@b' }],
    ['email with a double dot', { ...validBody, email: 'a@b..com' }],
    ['invalid email', { ...validBody, email: 'not-an-email' }],
    ['line break in email', { ...validBody, email: 'a@b.com\r\nBcc: spy@evil.com' }],
    ['too long email', { ...validBody, email: `${'a'.repeat(250)}@b.com` }],
    ['short phone', { ...validBody, phone: '123' }],
    ['phone with letters', { ...validBody, phone: '0123456789abc' }],
    ['too long phone', { ...validBody, phone: '1'.repeat(21) }],
    ['empty message', { ...validBody, message: '' }],
    ['too long message', { ...validBody, message: 'a'.repeat(1001) }],
  ])('returns 400 for %s', async (_label, body) => {
    const response = await postEnquiry(body);

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
    expect(emailSender.sent).toEqual([]);
  });

  it('returns 400 for a body over the size limit', async () => {
    const response = await postEnquiry({ ...validBody, message: 'a'.repeat(10_000) });
    expect(response.statusCode).toBe(400);
  });

  it('returns 404 for an unknown product', async () => {
    const response = await postEnquiry({ ...validBody, productId: 999 });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('NOT_FOUND');
  });

  it('returns 201 but does nothing when the honeypot is filled', async () => {
    const response = await postEnquiry({ ...validBody, website: 'http://spam.example' });

    expect(response.statusCode).toBe(201);
    expect(emailSender.sent).toEqual([]);
    expect(await repository.findUnsent()).toEqual([]);
  });

  it('returns 429 in the standard error shape after too many requests', async () => {
    await startApp();
    const send = () => app.inject({ method: 'POST', url: '/api/enquiries', payload: validBody });

    const statuses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) statuses.push((await send()).statusCode);

    expect(statuses).toEqual([201, 201, 201, 201, 201, 429]);
    const limited = await send();
    expect(limited.json().error.code).toBe('RATE_LIMITED');
  });

  it('does not rate limit other routes', async () => {
    await startApp();
    for (let attempt = 0; attempt < 8; attempt += 1) {
      expect((await app.inject({ url: '/api/health' })).statusCode).toBe(200);
    }
  });
});
