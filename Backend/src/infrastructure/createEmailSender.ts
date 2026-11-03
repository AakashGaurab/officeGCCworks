import nodemailer from 'nodemailer';
import {
  EmailProvider,
  SMTP_CONNECTION_TIMEOUT_MS,
  SMTP_GREETING_TIMEOUT_MS,
  SMTP_SECURE_PORT,
  SMTP_SOCKET_TIMEOUT_MS,
} from '../config/constants.js';
import type { Env } from '../config/env.js';
import type { EmailSender } from '../domain/EmailSender.js';
import type { Logger } from '../domain/Logger.js';
import { LogEmailSender } from './LogEmailSender.js';
import { SmtpEmailSender } from './SmtpEmailSender.js';

// Picks the email implementation from EMAIL_PROVIDER. This is the swap point for a new provider.
export const createEmailSender = (env: Env, logger: Logger): EmailSender => {
  if (env.EMAIL_PROVIDER !== EmailProvider.SMTP) return new LogEmailSender(logger);

  const auth = env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined;
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === SMTP_SECURE_PORT,
    auth,
    // Fail fast so a dead SMTP server cannot hang the request; the enquiry is marked failed instead.
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
    socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
  });
  // env validation guarantees EMAIL_FROM when the provider is smtp.
  return new SmtpEmailSender(transport, env.EMAIL_FROM ?? '');
};
