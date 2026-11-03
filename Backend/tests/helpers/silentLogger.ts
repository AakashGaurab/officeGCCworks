import { vi } from 'vitest';
import type { Logger } from '../../src/domain/Logger.js';

export const buildSpyLogger = () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }) satisfies Logger;
