import { z } from 'zod';
import {
  DEFAULT_CORS_ORIGIN,
  DEFAULT_DATABASE_PATH,
  DEFAULT_SALES_INBOX_EMAIL,
  DEFAULT_SMTP_PORT,
  EmailProvider,
  DEFAULT_FAKE_STORE_API_BASE_URL,
  DEFAULT_PORT,
  MAX_PORT,
} from './constants.js';

const baseEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().max(MAX_PORT).default(DEFAULT_PORT),
  FAKE_STORE_API_BASE_URL: z.string().url().default(DEFAULT_FAKE_STORE_API_BASE_URL),
  CORS_ORIGIN: z.string().min(1).default(DEFAULT_CORS_ORIGIN),
  // Optional here: the default is applied below, and only for the log provider.
  SALES_INBOX_EMAIL: z.email().optional(),
  DATABASE_PATH: z.string().min(1).default(DEFAULT_DATABASE_PATH),
  // Only set to true behind a trusted reverse proxy, so the rate limit sees the real client address.
  TRUST_PROXY: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  EMAIL_PROVIDER: z.enum(EmailProvider).default(EmailProvider.LOG),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().max(MAX_PORT).default(DEFAULT_SMTP_PORT),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  EMAIL_FROM: z.email().optional(),
});

// The SMTP settings are only mandatory when the SMTP provider is selected.
// A real provider must not silently send customer enquiries to the placeholder inbox, so the inbox
// has no default there. A half-set SMTP_USER/SMTP_PASS pair would silently connect without login.
const envSchema = baseEnvSchema
  .superRefine((env, context) => {
    if (env.EMAIL_PROVIDER !== EmailProvider.SMTP) return;
    (['SMTP_HOST', 'EMAIL_FROM', 'SALES_INBOX_EMAIL'] as const).forEach((key) => {
      if (!env[key]) context.addIssue({ code: 'custom', path: [key], message: 'Required when EMAIL_PROVIDER=smtp' });
    });
    if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASS)) {
      context.addIssue({ code: 'custom', path: ['SMTP_PASS'], message: 'SMTP_USER and SMTP_PASS must be set together' });
    }
  })
  .transform((env) => ({ ...env, SALES_INBOX_EMAIL: env.SALES_INBOX_EMAIL ?? DEFAULT_SALES_INBOX_EMAIL }));

export type Env = z.infer<typeof envSchema>;

// Fail fast at startup if configuration is invalid.
export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => envSchema.parse(source);
