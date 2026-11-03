import { z } from 'zod';
import {
  DEFAULT_CORS_ORIGIN,
  DEFAULT_FAKE_STORE_API_BASE_URL,
  DEFAULT_PORT,
  MAX_PORT,
} from './constants.js';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().max(MAX_PORT).default(DEFAULT_PORT),
  FAKE_STORE_API_BASE_URL: z.string().url().default(DEFAULT_FAKE_STORE_API_BASE_URL),
  CORS_ORIGIN: z.string().min(1).default(DEFAULT_CORS_ORIGIN),
});

export type Env = z.infer<typeof envSchema>;

// Fail fast at startup if configuration is invalid.
export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => envSchema.parse(source);
