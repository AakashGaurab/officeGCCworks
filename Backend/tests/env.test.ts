import { describe, expect, it } from 'vitest';
import { loadEnv } from '../src/config/env.js';

describe('loadEnv enquiry settings', () => {
  const smtpEnv = { EMAIL_PROVIDER: 'smtp', SMTP_HOST: 'smtp.example.com', EMAIL_FROM: 'site@example.com' };

  it('uses safe defaults', () => {
    expect(loadEnv({})).toMatchObject({
      SALES_INBOX_EMAIL: 'sales@example.com',
      DATABASE_PATH: './data/enquiries.sqlite',
      EMAIL_PROVIDER: 'log',
      TRUST_PROXY: false,
    });
  });

  it('rejects an invalid sales inbox email', () => {
    expect(() => loadEnv({ SALES_INBOX_EMAIL: 'nope' })).toThrow();
  });

  it('rejects an unknown email provider', () => {
    expect(() => loadEnv({ EMAIL_PROVIDER: 'carrier-pigeon' })).toThrow();
  });

  it('requires SMTP_HOST and EMAIL_FROM for the smtp provider', () => {
    expect(() => loadEnv({ EMAIL_PROVIDER: 'smtp' })).toThrow();
    expect(
      loadEnv({ ...smtpEnv, SALES_INBOX_EMAIL: 'team@example.com' }),
    ).toMatchObject({ SMTP_PORT: 587 });
  });

  it('requires SALES_INBOX_EMAIL explicitly for the smtp provider (no default)', () => {
    expect(() => loadEnv(smtpEnv)).toThrow();
    expect(loadEnv({ ...smtpEnv, SALES_INBOX_EMAIL: 'team@example.com' }).SALES_INBOX_EMAIL).toBe('team@example.com');
  });

  it('rejects only one of SMTP_USER and SMTP_PASS', () => {
    const base = { ...smtpEnv, SALES_INBOX_EMAIL: 'team@example.com' };
    expect(() => loadEnv({ ...base, SMTP_USER: 'user' })).toThrow();
    expect(() => loadEnv({ ...base, SMTP_PASS: 'secret' })).toThrow();
    expect(loadEnv({ ...base, SMTP_USER: 'user', SMTP_PASS: 'secret' })).toMatchObject({ SMTP_USER: 'user' });
    expect(loadEnv(base).SMTP_USER).toBeUndefined();
  });
});
