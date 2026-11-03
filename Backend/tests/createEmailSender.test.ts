import nodemailer from 'nodemailer';
import { describe, expect, it, vi } from 'vitest';
import {
  SMTP_CONNECTION_TIMEOUT_MS,
  SMTP_GREETING_TIMEOUT_MS,
  SMTP_SOCKET_TIMEOUT_MS,
} from '../src/config/constants.js';
import { loadEnv } from '../src/config/env.js';
import { createEmailSender } from '../src/infrastructure/createEmailSender.js';
import { LogEmailSender } from '../src/infrastructure/LogEmailSender.js';
import { SmtpEmailSender } from '../src/infrastructure/SmtpEmailSender.js';
import { buildSpyLogger } from './helpers/silentLogger.js';

vi.mock('nodemailer', () => ({ default: { createTransport: vi.fn(() => ({ sendMail: vi.fn() })) } }));

describe('createEmailSender', () => {
  it('uses the log sender by default', () => {
    expect(createEmailSender(loadEnv({}), buildSpyLogger())).toBeInstanceOf(LogEmailSender);
  });

  it('creates the SMTP transport with timeouts so a dead server cannot hang a request', () => {
    const env = loadEnv({
      EMAIL_PROVIDER: 'smtp',
      SMTP_HOST: 'smtp.example.com',
      EMAIL_FROM: 'site@example.com',
      SALES_INBOX_EMAIL: 'team@example.com',
    });
    const sender = createEmailSender(env, buildSpyLogger());

    expect(sender).toBeInstanceOf(SmtpEmailSender);
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
        greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
        socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
      }),
    );
  });
});
